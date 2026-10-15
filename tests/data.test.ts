import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, mergePosts, paginate, pageCount, toPlainText, type Post } from '../src/lib/posts';
import { archiveRows, toMonths } from '../src/lib/playlist';
import { parseMeta } from '../src/lib/markdown/code.mjs';

const post = (href: string, publishedAt: string, sourceKind: Post['sourceKind'] = 'external'): Post => ({
  id: href, title: href, description: '', publishedAt, href, thumbnail: null, sourceName: 'x', sourceKind,
});

test('mergePosts: URLで重複除去し、日時降順・同時刻はhref順', () => {
  const merged = mergePosts(
    [post('/blog/2025-07-25/', '2025-07-26', 'local')],
    [post('https://a.example/b', '2025-07-26T00:00:00+09:00'), post('https://a.example/b/?utm=1', '2026-01-01T00:00:00Z'), post('https://z.example/', '2025-08-01T00:00:00Z')],
  );
  assert.deepEqual(merged.map((p) => p.href), ['https://z.example/', '/blog/2025-07-25/', 'https://a.example/b']);
});

test('formatDate: 日付だけの値をタイムゾーンでずらさない', () => {
  assert.equal(formatDate('2025-07-26'), '2025.07.26');
  assert.equal(formatDate('2025-07-25T16:00:00Z'), '2025.07.26'); // JST翌日
});

test('paginate: 12件単位、境界と範囲表示', () => {
  const items = Array.from({ length: 25 }, (_, i) => i);
  assert.equal(pageCount(25), 3);
  assert.equal(pageCount(0), 1);
  const last = paginate(items, 3);
  assert.deepEqual([last.items, last.from, last.to, last.total], [[24], 25, 25, 25]);
  const first = paginate(items, 1);
  assert.deepEqual([first.items.length, first.from, first.to], [12, 1, 12]);
});

test('toPlainText: RSSのHTMLをテキスト化', () => {
  assert.equal(toPlainText('<p>A&amp;B <b>c</b></p>\n<img src=x>'), 'A&B c');
  assert.equal(toPlainText(undefined), '');
});

test('archiveRows: データのない連続年を1つの⋮に畳み、未登録月は無効', () => {
  const rows = archiveRows(['2026.07', '2025.09', '2021.02']);
  assert.deepEqual(rows.map((r) => (r.type === 'gap' ? '⋮' : r.year)), [2026, 2025, '⋮', 2021]);
  const y2026 = rows[0] as Extract<(typeof rows)[number], { type: 'year' }>;
  assert.equal(y2026.months.length, 12);
  assert.equal(y2026.months[0].label, '12');
  assert.deepEqual(y2026.months.filter((m) => m.enabled).map((m) => m.key), ['2026.07']);
});

test('toMonths: null曲・名前なし曲を飛ばし、新しい月順', () => {
  const months = toMonths([
    { name: '2025.01', tracks: { total: 1, items: [{ track: { name: 'a', duration_ms: 60_000 } }] } },
    { name: '2026.07', tracks: { total: 3, items: [{ track: null }, { track: { name: 'b', duration_ms: 3_660_000 } }, { track: {} }] } },
    { name: 'not a month', tracks: { total: 0, items: [] } },
  ]);
  assert.deepEqual(months.map((m) => [m.key, m.tracks.length, m.duration]), [['2026.07', 1, '1h 1m'], ['2025.01', 1, '1m']]);
});

test('parseMeta: title と行番号フラグ', () => {
  assert.deepEqual(parseMeta('title="src/a b.ts" {4-5} showLineNumbers'), { title: 'src/a b.ts', show: true, hide: false });
  assert.deepEqual(parseMeta(undefined), { title: undefined, show: false, hide: false });
});
