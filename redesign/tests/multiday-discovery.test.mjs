import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const origin = 'https://localtourchina.com';
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog-site/catalog.json'), 'utf8'));
const productIds = ['34', '45', 'experience45', '45furong', '56', '56fh', 'trek34', 'trek45', 'trek56'];
const notebookRoutes = {34: 'zhangjiajie-4days.html', 56: 'zhangjiajie-6days.html', experience45: 'zhangjiajie.html'};
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// These published sections may contain nested sections. Match their complete
// element rather than truncating at the first child closing tag.
function section(html, id) {
  const opening = new RegExp('<section\\b[^>]*\\bid="' + id + '"[^>]*>').exec(html);
  assert.ok(opening, 'missing section #' + id);
  const tail = html.slice(opening.index);
  let depth = 0;
  for (const token of tail.matchAll(/<\/?section\b[^>]*>/g)) {
    depth += token[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return tail.slice(0, token.index + token[0].length);
  }
  assert.fail('unclosed section #' + id);
}

function hrefs(html, base) {
  return [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)]
    .map(match => new URL(match[1].replaceAll('&amp;', '&'), origin + '/' + base));
}

function assertVisibleOpening(markup, message) {
  const opening = markup.match(/^<[^>]+>/)?.[0];
  assert.ok(opening, message + ' has an element');
  assert.doesNotMatch(opening, /\shidden(?:\s|=|>)/, message + ' has no hidden attribute');
  assert.doesNotMatch(opening, /\saria-hidden=["']true["']/, message + ' remains accessible');
  assert.doesNotMatch(opening, /\sstyle=["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden)/i, message + ' has no hiding style');
}

for (const lang of ['ko', 'zh', 'en']) {
  const prefix = lang === 'ko' ? '' : lang + '/';
  const expectedPaths = productIds.map(id => notebookRoutes[id]
    ? '/' + prefix + notebookRoutes[id]
    : catalog[id].paths[lang]);

  for (const page of ['index.html', 'trips.html']) {
    test(prefix + page + ' exposes all nine multiday itineraries as localized direct links', () => {
      const html = read(prefix + page);
      const directory = section(html, 'all-trips');
      assertVisibleOpening(directory, 'itinerary directory');
      assert.doesNotMatch(directory, /<details\b/, 'itineraries do not require expanding a disclosure');
      const lists = [...directory.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)];
      assert.equal(lists.length, productIds.length, 'all nine products appear without a search or filter');
      for (const item of lists) assertVisibleOpening(item[0], 'directory item');
      const links = lists.flatMap(match => hrefs(match[1], prefix + page));
      assert.equal(links.length, productIds.length);
      assert.deepEqual(links.map(url => url.pathname).sort(), [...expectedPaths].sort());
      for (const link of links) {
        assert.equal(link.origin, origin, 'detail links stay on the operated site');
        const detail = read(link.pathname.slice(1));
        assert.ok(detail.length > 500, link.pathname + ' is a complete local detail page');
        assert.doesNotMatch(detail, /http-equiv=["']refresh/i, link.pathname + ' avoids an extra redirect');
      }
      const allCatalog = hrefs(directory, prefix + page).find(url => url.pathname === '/' + prefix + 'products.html');
      assert.equal(allCatalog?.hash, '#packages', 'catalog action opens the complete multiday category');
      if (lang !== 'ko') assert.doesNotMatch(directory.replace(/<[^>]*>/g, ''), /[가-힣]/, 'customer-facing directory is translated');
    });
  }

  test(prefix + 'homepage offers all multiday trips through both desktop and mobile navigation', () => {
    const html = read(prefix + 'index.html');
    for (const name of ['desktop-nav', 'mobile-menu']) {
      const nav = html.match(new RegExp('<(?:nav|details)\\b[^>]*class="' + name + '"[^>]*>([\\s\\S]*?)<\\/(?:nav|details)>'))?.[1];
      assert.ok(nav, name);
      const links = hrefs(nav, prefix + 'index.html');
      assert.ok(links.some(url => url.pathname === '/' + prefix + 'trips.html' && url.hash === '#all-trips'), name + ' all multiday entry');
      assert.ok(links.some(url => url.pathname === '/' + prefix + 'products.html'), name + ' complete product catalog');
    }
  });

  test(prefix + 'trip selection presents the full directory before featured comparisons', () => {
    const html = read(prefix + 'trips.html');
    assert.ok(html.indexOf('id="all-trips"') < html.indexOf('id="choose"'));
    assert.ok(html.indexOf('id="all-trips"') < html.indexOf('id="routes"'));
    assert.ok(hrefs(html, prefix + 'trips.html').some(url => url.pathname === '/' + prefix + 'products.html'));
  });

  test(prefix + 'catalog keeps six regular and three trekking trips visibly grouped', () => {
    const html = read(prefix + 'products.html');
    const packages = section(html, 'packages');
    assertVisibleOpening(packages, 'multiday category');
    const groups = [
      ['package-regular', ['34', '45', '56', '56fh', '45furong', 'experience45']],
      ['package-trekking', ['trek34', 'trek45', 'trek56']],
    ];
    for (const [id, expected] of groups) {
      const markup = section(packages, id);
      assertVisibleOpening(markup, id + ' starts expanded');
      const cards = [...markup.matchAll(/<article\b[^>]*data-product-card="([^"]+)"[^>]*>[\s\S]*?<\/article>/g)];
      const actual = cards.map(match => match[1]);
      assert.deepEqual(actual.sort(), [...expected].sort());
      for (const card of cards) {
        assertVisibleOpening(card[0], card[1] + ' product card');
        const visibleBody = card[0].replace(/<details\b[^>]*>[\s\S]*?<\/details>/g, '');
        const detailLink = visibleBody.match(/<a\b[^>]*class="store-text-link"[^>]*>/)?.[0];
        assert.ok(detailLink, card[1] + ' has a direct detail link outside disclosures');
        assertVisibleOpening(detailLink, card[1] + ' detail link');
      }
    }
    const experience = packages.match(/<article\b[^>]*data-product-card="experience45"[^>]*>([\s\S]*?)<\/article>/)?.[1];
    assert.ok(experience);
    assert.ok(hrefs(experience, prefix + 'products.html').every(url => url.pathname === '/' + prefix + 'zhangjiajie.html'), 'forest experience uses its canonical detail page');
  });
}
