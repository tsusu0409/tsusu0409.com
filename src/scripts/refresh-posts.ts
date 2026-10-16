// 外部媒体のRSS/Atomを取得し、src/data/external-posts.json へURL単位で累積マージする。
// RSSから消えた古い記事は削除しない。取得失敗した媒体は前回データをそのまま残す。
// usage: npm run data:posts
import fs from 'node:fs';
import { XMLParser } from 'fast-xml-parser';
import { normalizeUrl, toPlainText, toTime, type ExternalPost } from '../lib/posts';

const OUTPUT = 'src/data/external-posts.json';

const FEEDS = [
  { url: 'https://note.com/tsusu0409/rss', sourceName: 'note' },
  { url: 'https://omoshirokaiwai.com/rss.xml', sourceName: 'おもしろ界隈', author: 'Tsusu' },
  { url: 'https://qiita.com/tsusu0409/feed', sourceName: 'Qiita' },
  { url: 'https://zenn.dev/tsusu0409/feed', sourceName: 'Zenn' },
];

const asArray = <T>(value: T | T[] | undefined): T[] => (value === undefined ? [] : Array.isArray(value) ? value : [value]);
const textValue = (value: any): string => (typeof value === 'object' && value !== null ? value['#text'] ?? '' : String(value ?? ''));

function linkOf(item: any): string {
  if (typeof item.link === 'string') return item.link;
  const links = asArray(item.link);
  const alternate = links.find((l: any) => !l['@_rel'] || l['@_rel'] === 'alternate') ?? links[0];
  return alternate?.['@_href'] ?? textValue(alternate);
}

function thumbnailOf(item: any): string | null {
  const enclosure = item.enclosure?.['@_url'];
  if (enclosure) return enclosure;
  const media = item['media:thumbnail'];
  if (typeof media === 'string') return media;
  if (media?.['@_url']) return media['@_url'];
  if (typeof item.thumb === 'string') return item.thumb; // おもしろ界隈の独自タグ
  const imageLink = asArray(item.link).find((l: any) => l?.['@_rel'] === 'enclosure' || l?.['@_type']?.startsWith('image'));
  return imageLink?.['@_href'] ?? null;
}

function authorOf(item: any): string {
  // RSS 2.0: dc:creator / author、Atom: author.name
  return textValue(item['dc:creator'] ?? item.author?.name ?? item.author);
}

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<ExternalPost[]> {
  const response = await fetch(feed.url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const xml = new XMLParser({ ignoreAttributes: false }).parse(await response.text());
  const items = asArray(xml.rss?.channel?.item ?? xml.feed?.entry);
  if (!xml.rss && !xml.feed) throw new Error('unknown feed format');

  return items
    .filter((item: any) => !feed.author || authorOf(item) === feed.author)
    .map((item: any) => {
      const href = linkOf(item);
      const date = item.pubDate ?? item.published ?? item.updated ?? item['dc:date'];
      return {
        id: normalizeUrl(href),
        title: textValue(item.title),
        description: toPlainText(textValue(item.description ?? item.summary ?? item.content)),
        publishedAt: new Date(textValue(date)).toISOString(),
        href,
        thumbnail: thumbnailOf(item),
        sourceName: feed.sourceName,
      };
    });
}

const previous: ExternalPost[] = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) : [];
const merged = new Map(previous.map((post) => [post.id, post]));
let failures = 0;

for (const feed of FEEDS) {
  try {
    const posts = await fetchFeed(feed);
    for (const post of posts) merged.set(post.id, { ...merged.get(post.id), ...post });
    console.log(`✓ ${feed.sourceName}: ${posts.length}`);
  } catch (error) {
    failures++;
    console.error(`✗ ${feed.sourceName}: ${(error as Error).message} (前回データを保持)`);
  }
}

const result = [...merged.values()].sort((a, b) => toTime(b.publishedAt) - toTime(a.publishedAt));
if (result.length < previous.length) throw new Error('記事数が減少したため保存を中止しました');

fs.writeFileSync(`${OUTPUT}.tmp`, `${JSON.stringify(result, null, 2)}\n`);
fs.renameSync(`${OUTPUT}.tmp`, OUTPUT);
console.log(`saved ${result.length} external posts (${result.length - previous.length} new)`);
if (failures === FEEDS.length) process.exit(1);
