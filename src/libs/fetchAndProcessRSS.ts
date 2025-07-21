import { XMLParser } from "fast-xml-parser";

// 記事のインターフェースを定義
interface Article {
  title: string;
  link: string;
  thumb: string | null;
  description: string;
  pubDate: string;
  source: string;
}

// RSSフィードを取得してJSONデータに変換する関数
export async function fetchRSS(url: string): Promise<any> {
  try {
    const response = await fetch(url); // URLからRSSフィードをフェッチ
    const xmlData = await response.text(); // フェッチしたデータをテキストとして取得
    const parser = new XMLParser({
      ignoreAttributes: false, // 属性を無視しない設定
    });
    const jsonData = parser.parse(xmlData); // XMLデータをJSONに変換
    return jsonData;
  } catch (error) {
    console.error("Error fetching or parsing RSS feed:", error); // エラーが発生した場合にコンソールに表示
    throw error; // エラーをスロー
  }
}

// 日付をYYYY.MM.DD形式にフォーマットする関数
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}.${month}.${day}`;
}

// アイテムからサムネイルURLを抽出する関数
function extractThumb(item: any): string | null {
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  } else if (item["media:thumbnail"]) {
    return item["media:thumbnail"];
  } else if (Array.isArray(item.link)) {
    const link = item.link.find(
      (l: any) => l.rel === "enclosure" || l.type?.startsWith("image")
    );
    return link ? link.href : null;
  }
  return null;
}

// RSSアイテムをArticleインターフェースにパースする関数
function parseRSSItem(item: any, isAtom: boolean = false, source: string): Article {
  return {
    title: item.title,
    link: isAtom ? item.link?.href || item.link : item.link,
    thumb: extractThumb(item),
    description: item.description || item.summary || item.content,
    pubDate: formatDate(
      new Date(item.pubDate || item.updated || item.published)
    ),
    source,
  };
}

// RSS 2.0形式のJSONデータをArticle配列にパースする関数
function parseRSS2(jsonData: any, source: string): Article[] {
  const items = Array.isArray(jsonData.rss.channel.item)
    ? jsonData.rss.channel.item
    : [jsonData.rss.channel.item];
  return items.map((item: any) => parseRSSItem(item, false, source));
}

// Atom形式のJSONデータをArticle配列にパースする関数
function parseAtom(jsonData: any, source: string): Article[] {
  const entries = Array.isArray(jsonData.feed.entry)
    ? jsonData.feed.entry
    : [jsonData.feed.entry];
  return entries.map((entry: any) => parseRSSItem(entry, true, source));
}

// URLからサイト名を判定する関数
function getSourceName(url: string): string {
  if(url.includes("zenn.dev")) return "Zenn";
  if(url.includes("qiita.com")) return "Qiita";
  if(url.includes("note.com")) return "note";
  if(url.includes("tsusu0409.com")) return "tsusu0409.com";
  if(url.includes("omoshirokaiwai.com")) return "おもしろ界隈";
  return "Other";
}

// 複数のRSSフィードURLを処理し、最新の10記事を返す関数
export async function fetchAndProcessRSS(
  rssURLs: string[]
): Promise<Article[]> {
  let articles: Article[] = [];

  await Promise.all(
    rssURLs.map(async (rssURL) => {
      try {
        const rssData = await fetchRSS(rssURL);
        const sourceName = getSourceName(rssURL);

        let fetchedArticles: Article[] = [];

        if (rssData.rss) {
          fetchedArticles = parseRSS2(rssData, sourceName); // RSS 2.0形式を解析
        } else if (rssData.feed) {
          fetchedArticles = parseAtom(rssData, sourceName); // Atom形式を解析
        } else {
          console.error(`Unknown feed format for ${rssURL}`, rssData); // 不明なフォーマットのフィード
        }

        articles.push(...fetchedArticles); // 取得した記事を追加
      } catch (error) {
        console.error(`Error processing RSS feed ${rssURL}:`, error); // エラー処理
      }
    })
  );

  // 記事を日付でソートし、最新の10記事を取得
  articles.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
  articles = articles.slice(0, 10);

  return articles; // 最終的な記事リストを返す
}