"""The release consumes only a complete, validated public catalogue snapshot."""
import copy
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('catalog_export', ROOT / 'scripts/export-catalog.py')
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


class CatalogExportTests(unittest.TestCase):
    def setUp(self):
        self.catalog = json.loads((ROOT / 'catalog-site/catalog.json').read_text())

    def test_public_snapshot_has_verifiable_hash_and_counts(self):
        response = io.BytesIO(json.dumps(self.catalog).encode())
        with tempfile.TemporaryDirectory() as directory, patch.object(exporter, 'urlopen', return_value=response) as fetch:
            output = Path(directory)
            exporter.export_catalog(destination=output)
            manifest = json.loads((output / 'export-manifest.json').read_text())
            self.assertEqual(manifest['sha256'], hashlib.sha256((output / 'catalog.json').read_bytes()).hexdigest())
            self.assertEqual(manifest['productCount'], len(self.catalog))
            self.assertEqual(json.loads((output / 'catalog.json').read_text()), self.catalog)
            self.assertEqual(fetch.call_args.args[0].full_url, exporter.DEFAULT_URL)

    def test_failed_or_private_response_preserves_both_existing_files(self):
        private = copy.deepcopy(self.catalog)
        private['34']['pricing']['direct_cost'] = 100
        for failure in (OSError('offline'), io.BytesIO(json.dumps(private).encode()), io.BytesIO(b'not JSON')):
            with tempfile.TemporaryDirectory() as directory:
                output = Path(directory)
                for name in ('catalog.json', 'export-manifest.json'):
                    (output / name).write_text('previous')
                mock = {'side_effect': failure} if isinstance(failure, Exception) else {'return_value': failure}
                with patch.object(exporter, 'urlopen', **mock), self.assertRaises((OSError, ValueError)):
                    exporter.export_catalog(destination=output)
                self.assertEqual([p.read_text() for p in output.iterdir()], ['previous', 'previous'])

    def test_rejects_incomplete_or_unsafe_catalogue(self):
        for change in (
            lambda c: c.clear(),
            lambda c: c.pop('34'),
            lambda c: c['34']['locales'].pop('en'),
            lambda c: c['34']['paths'].update(en='/../private.html'),
            lambda c: c['34']['paths'].update(en=c['34']['paths']['ko']),
            lambda c: c['34'].update(internal_notes='private'),
        ):
            catalog = copy.deepcopy(self.catalog)
            change(catalog)
            with self.assertRaises(ValueError):
                exporter.validate_catalog(catalog)

    def test_rejects_insecure_or_credentialed_sources_before_fetch(self):
        for url in ('http://example.test/catalog.json', 'https://user:secret@example.test/catalog.json', 'file:///tmp/catalog.json'):
            with patch.object(exporter, 'urlopen') as fetch, self.assertRaises(ValueError):
                exporter.export_catalog(url)
            fetch.assert_not_called()


if __name__ == '__main__':
    unittest.main()
