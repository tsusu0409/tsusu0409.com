// src/scripts/fetch-gym.mjs
// 定期実行用：直近3日のLifeFitチェックインを取得してjsonに追記
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.FSQ_OAUTH_TOKEN;
const OUTPUT = path.resolve(__dirname, "../data/gym-checkins.json");
const API_VERSION = "20240101";
const DAYS = 3;

if (!TOKEN) {
  console.error("❌ FSQ_OAUTH_TOKEN が設定されていません");
  process.exit(1);
}

function parseKm(shout) {
  if (!shout) return 3.0;
  const m = shout.match(/トレッドミル\s*([\d.]+)\s*km/);
  return m ? parseFloat(m[1]) : 3.0;
}

async function main() {
  const afterTimestamp = Math.floor(Date.now() / 1000) - DAYS * 86400;
  let items = [];
  let offset = 0;
  const limit = 250;

  console.log(`📡 直近${DAYS}日のチェックインを取得中...`);

  while (true) {
    const url = new URL("https://api.foursquare.com/v2/users/self/checkins");
    url.searchParams.set("v", API_VERSION);
    url.searchParams.set("oauth_token", TOKEN);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("afterTimestamp", String(afterTimestamp));

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
    console.log(`  → offset ${offset}: ${batch.length}件`);
    if (batch.length < limit) break;
    offset += limit;
  }

  console.log(`📋 全チェックイン: ${items.length}件`);

  const gym = items.filter((c) => c.venue?.name?.includes("LifeFit"));
  console.log(`🏋️ LifeFit: ${gym.length}件`);

  const newEntries = gym.map((c) => ({
    date: new Date(c.createdAt * 1000).toISOString(),
    treadmill_km: parseKm(c.shout),
  }));

  // 既存JSONを読み込み
  let existing = [];
  if (fs.existsSync(OUTPUT)) {
    const raw = fs.readFileSync(OUTPUT, "utf-8").trim();
    existing = raw ? JSON.parse(raw) : [];
    console.log(`📂 既存データ: ${existing.length}件`);
  }

  // 日時ベースで重複排除してマージ
  const existingDates = new Set(existing.map((c) => c.date));
  const added = newEntries.filter((c) => !existingDates.has(c.date));

  const merged = [...added, ...existing]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(merged, null, 2), "utf-8");
  console.log(`✅ 新規追加: ${added.length}件 / 合計: ${merged.length}件`);
  console.log(`💾 出力先: ${OUTPUT}`);
}

main().catch((err) => {
  console.error("❌ 予期しないエラー:", err);
  process.exit(1);
});