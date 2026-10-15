// v3 → v4 移行の整合性検証。docs/migration-baseline.json と現在のファイルを照合する。
// usage: node scripts/verify-migration.mjs
import fs from "node:fs";
import crypto from "node:crypto";
import matter from "gray-matter";

const baseline = JSON.parse(fs.readFileSync("docs/migration-baseline.json", "utf8"));
const map = JSON.parse(fs.readFileSync("docs/migration-map.json", "utf8"));
const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const errors = [];
const fail = (msg) => errors.push(msg);

// 記事: 本文バイト列・フロントマター（layout以外）・URL
const FRONTMATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;
for (const article of baseline.articles) {
  const entry = map.find((m) => m.from === article.file);
  if (!entry) { fail(`map missing: ${article.file}`); continue; }
  if (entry.url !== article.url) fail(`url changed: ${article.file} ${entry.url}`);
  if (!fs.existsSync(entry.to)) { fail(`missing: ${entry.to}`); continue; }

  const text = fs.readFileSync(entry.to, "utf8");
  const head = text.match(FRONTMATTER)?.[0];
  if (!head) { fail(`no frontmatter: ${entry.to}`); continue; }
  if (sha256(text.slice(head.length)) !== article.bodySha256) fail(`body changed: ${entry.to}`);

  const { layout, ...expected } = article.frontmatter;
  const actual = matter(text).data;
  for (const [key, value] of Object.entries(expected)) {
    if (JSON.stringify(actual[key]) !== JSON.stringify(value)) fail(`frontmatter ${key} changed: ${entry.to}`);
  }
}
if (map.length !== baseline.articles.length) fail(`map has ${map.length} entries, expected ${baseline.articles.length}`);

// public: パス・サイズ・ハッシュが一致（追加は許容）
for (const file of baseline.public) {
  if (!fs.existsSync(file.file)) { fail(`public missing: ${file.file}`); continue; }
  const buf = fs.readFileSync(file.file);
  if (buf.length !== file.bytes || sha256(buf) !== file.sha256) fail(`public changed: ${file.file}`);
}

// Activity: 元データ保持
for (const file of baseline.activity) {
  if (!fs.existsSync(file.file) || sha256(fs.readFileSync(file.file)) !== file.sha256) fail(`activity changed: ${file.file}`);
}

// Spotify: 基準の月がすべて残り、曲数が減っていない
const playlists = JSON.parse(fs.readFileSync("src/data/spotify-playlists.json", "utf8"));
const trackCount = playlists.reduce((n, p) => n + p.tracks.items.length, 0);
for (const month of baseline.summary.playlists.months) {
  if (!playlists.some((p) => p.name === month)) fail(`playlist month missing: ${month}`);
}
if (trackCount < baseline.summary.playlists.totalTracks) fail(`tracks ${trackCount} < ${baseline.summary.playlists.totalTracks}`);

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n✗ ${errors.length} problem(s)`);
  process.exit(1);
}
console.log(`✓ ${baseline.articles.length} articles, ${baseline.public.length} public files, ${baseline.activity.length} activities, ${trackCount} tracks verified`);
