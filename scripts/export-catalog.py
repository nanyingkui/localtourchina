"""Export the same public product catalogue used by the production storefront."""
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import tempfile
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_URL = 'https://znfcmancrhymrdnlowuh.supabase.co/functions/v1/ltc-runtime/customer-catalog.json'
PUBLIC_FIELDS = {'id', 'paths', 'locales', 'pricing', 'discovery', 'revision', 'plans', 'late_departure_plans', 'archived'}


def validate_catalog(rows):
    if not isinstance(rows, dict) or not rows:
        raise ValueError('The public catalogue must contain product records')
    paths = set()
    for key, record in rows.items():
        if not isinstance(record, dict) or record.get('id') != key:
            raise ValueError(f'Invalid product identity: {key}')
        if set(record) - PUBLIC_FIELDS:
            raise ValueError(f'Unexpected fields in public product: {key}')
        if set(record.get('locales', {})) != {'ko', 'zh', 'en'}:
            raise ValueError(f'Missing product languages: {key}')
        if set(record.get('paths', {})) != {'ko', 'zh', 'en'}:
            raise ValueError(f'Missing product paths: {key}')
        for path in record['paths'].values():
            if not isinstance(path, str) or not path.startswith('/') or path.startswith('//') or '\\' in path or '..' in PurePosixPath(path).parts or not path.endswith('.html'):
                raise ValueError(f'Invalid public product path: {key}')
            if path in paths:
                raise ValueError(f'Duplicate product path: {path}')
            paths.add(path)
        if not isinstance(record.get('pricing'), dict) or not record.get('discovery', {}).get('group'):
            raise ValueError(f'Missing product pricing or discovery fields: {key}')
    serialized = json.dumps(rows, ensure_ascii=False)
    if any(field in serialized for field in ('采购成本', '整团利润', 'planning_cost', 'direct_cost', 'service_role')):
        raise ValueError('Private data is not allowed in the public catalogue')
    if '34' not in rows:
        raise ValueError('Missing dated-package product 34')
    pricing = rows['34']['pricing']
    if not pricing.get('pricingRevision') or not pricing.get('hotelOptions'):
        raise ValueError('Missing dated-package pricing revision or hotel options')
    return rows


def export_catalog(url=DEFAULT_URL, destination=ROOT / 'catalog-site'):
    parsed = urlsplit(url)
    if parsed.scheme != 'https' or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError('The catalogue source must be a public HTTPS endpoint')
    request = Request(url, headers={'Accept': 'application/json', 'User-Agent': 'LocalTourChina-build'})
    # A failed fetch stops the build before any previous export is replaced.
    with urlopen(request, timeout=30) as response:
        rows = validate_catalog(json.load(response))
    snapshot = json.dumps(rows, ensure_ascii=False, indent=2) + '\n'
    manifest = {
        'sha256': hashlib.sha256(snapshot.encode()).hexdigest(),
        'productCount': len(rows),
        'pricingRevision34': rows['34']['pricing']['pricingRevision'],
        'hotelCount34': len(rows['34']['pricing']['hotelOptions']),
        'source': url,
    }
    destination.mkdir(parents=True, exist_ok=True)
    # Separate atomic replacements ensure an interrupted pair fails the manifest hash check.
    for name, content in [('catalog.json', snapshot), ('export-manifest.json', json.dumps(manifest, indent=2) + '\n')]:
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=destination, delete=False) as staged:
            staged.write(content)
            temporary_path = Path(staged.name)
        temporary_path.replace(destination / name)
    print(f'Exported {len(rows)} products from the production public catalogue')


if __name__ == '__main__':
    if os.environ.get('LTC_CATALOG_DB'):
        raise SystemExit('The production catalogue is cloud-hosted. Remove LTC_CATALOG_DB and use LTC_CATALOG_URL for an alternate public HTTPS catalogue.')
    export_catalog(os.environ.get('LTC_CATALOG_URL', DEFAULT_URL))
