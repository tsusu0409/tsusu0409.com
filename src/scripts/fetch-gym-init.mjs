// src/scripts/fetch-gym-init.mjs
// 初回一括取得用：1月〜5月を月ごとにAPI問い合わせ
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.FSQ_OAUTH_TOKEN;
const OUTPUT = path.resolve(__dirname, "../data/gym-checkins.json");
const API_VERSION = "20240101";

if (!TOKEN) {
  console.error("❌ FSQ_OAUTH_TOKEN が設定されていません");
  process.exit(1);
}

// 取得対象の月リスト（afterTimestamp〜beforeTimestamp）
const MONTHS = [
  { label: "1月", after: new Date("2026-01-01"), before: new Date("2026-02-01") },
  { label: "2月", after: new Date("2026-02-01"), before: new Date("2026-03-01") },
  { label: "3月", after: new Date("2026-03-01"), before: new Date("2026-04-01") },
  { label: "4月", after: new Date("2026-04-01"), before: new Date("2026-05-01") },
  { label: "5月", after: new Date("2026-05-01"), before: new Date("2026-06-01") },
];

function parseKm(shout) {
  if (!shout) return 3.0;
  const m = shout.match(/トレッドミル\s*([\d.]+)\s*km/);
  return m ? parseFloat(m[1]) : 3.0;
}

async function fetchMonth(afterDate, beforeDate) {
  const afterTimestamp = Math.floor(afterDate.getTime() / 1000);
  const beforeTimestamp = Math.floor(beforeDate.getTime() / 1000);
  let items = [];
  let offset = 0;
  const limit = 250;

  while (true) {
    const url = new URL("https://api.foursquare.com/v2/users/self/checkins");
    url.searchParams.set("v", API_VERSION);
    url.searchParams.set("oauth_token", TOKEN);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("afterTimestamp", String(afterTimestamp));
    url.searchParams.set("beforeTimestamp", String(beforeTimestamp));

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error(`❌ APIエラー [${res.status}]:`, await res.text());
      process.exit(1);
    }
    const data = await res.json();
    if (data.meta?.code !== 200) {
      console.error("❌ Foursquare APIエラー:", data.meta);
      process.exit(1);
    }

    const batch = data.response.checkins.items;
    items = items.concat(batch);
    console.log(`    offset ${offset}: ${batch.length}件`);
    if (batch.length < limit) break;
    offset += limit;
  }

  return items;
}

async function main() {
  let allGymCheckins = [];

  for (const { label, after, before } of MONTHS) {
    console.log(`📅 ${label} を取得中...`);
    const items = await fetchMonth(after, before);
    console.log(`  → 全チェックイン: ${items.length}件`);

    const gym = items.filter((c) => c.venue?.name?.includes("LifeFit"));
    console.log(`  → LifeFit: ${gym.length}件`);

    const parsed = gym.map((c) => ({
      date: new Date(c.createdAt * 1000).toISOString(),
      treadmill_km: parseKm(c.shout),
    }));

    allGymCheckins = allGymCheckins.concat(parsed);
  }

  // 日時で重複排除してソート
  const seen = new Set();
  const deduped = allGymCheckins.filter((c) => {
    if (seen.has(c.date)) return false;
    seen.add(c.date);
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(deduped, null, 2), "utf-8");
  console.log(`\n✅ 合計: ${deduped.length}件`);
  console.log(`💾 出力先: ${OUTPUT}`);
}

main().catch((err) => {
  console.error("❌ 予期しないエラー:", err);
  process.exit(1);
});