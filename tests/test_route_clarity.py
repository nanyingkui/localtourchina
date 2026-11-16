"""Regression checks for route summaries, complete day lists and fee conditions."""
import json
from pathlib import Path
import sys
import unittest
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'catalog-site'))
from catalog_registry import records
from journey_design import contents
from route_clarity import highlights, package_fees


class DayLists(HTMLParser):
    def __init__(self):
        super().__init__()
        self.counts = []
        self.in_timeline = False

    def handle_starttag(self, tag, attrs):
        if tag == 'ol' and dict(attrs).get('class') == 'jd-timeline':
            self.in_timeline = True
            self.counts.append(0)
        if tag == 'li' and self.in_timeline:
            self.counts[-1] += 1

    def handle_endtag(self, tag):
        if tag == 'ol':
            self.in_timeline = False


class RouteClarityTests(unittest.TestCase):
    def test_every_package_and_language_has_distinct_highlights(self):
        catalog = records()
        packages = {key for key, r in catalog.items() if r['discovery']['group'] == 'packages'}
        self.assertEqual(set(highlights()), packages)
        for lang in ('ko', 'zh', 'en'):
            self.assertEqual(len({highlights()[key][lang][0] for key in packages}), len(packages))

    def test_notes_do_not_create_extra_days_or_break_plan_tabs(self):
        for record in records().values():
            if record['discovery']['group'] != 'packages':
                continue
            for lang in ('ko', 'zh', 'en'):
                html = contents(record, lang)
                parser = DayLists()
                parser.feed(html)
                self.assertEqual(parser.counts, [len(p['days']) for p in record['plans']])
                for plan in record['plans']:
                    self.assertIn('id="plan-' + plan['key'] + '"', html)
                self.assertIn('class="day-route-row"', html)
                self.assertIn('class="day-note"', html)

    def test_room_and_overtime_conditions_remain_explicit(self):
        for key in highlights():
            html = package_fees(records()[key], 'zh')
            included, excluded = html.split('<h2>不包含与另付费用</h2>')
            self.assertIn('余下1人的单独客房已计入', included)
            self.assertNotIn('单房差', excluded)
            self.assertIn('₩20,000／小时', excluded)
            self.assertIn('每日约10小时', excluded)
            self.assertIn('不足1小时', excluded)
            self.assertIn('80分钟按摩一次', included)

    def test_route_specific_scope_is_preserved(self):
        catalog = records()
        for key in ('trek34', 'trek45', 'trek56'):
            self.assertIn('晚到方案不含黄龙洞与大峡谷', package_fees(catalog[key], 'zh'))
        phoenix = package_fees(catalog['56fh'], 'zh')
        self.assertIn('最后一晚住凤凰', phoenix)
        self.assertIn('沱江夜游船', phoenix)
        self.assertIn('高铁及凤凰九景联票', phoenix.split('<h2>不包含与另付费用</h2>')[1])

    def test_embedded_catalogue_and_published_prices_are_unchanged(self):
        self.assertEqual(records(), json.loads((ROOT / 'customer-catalog.json').read_text()))


if __name__ == '__main__':
    unittest.main()
