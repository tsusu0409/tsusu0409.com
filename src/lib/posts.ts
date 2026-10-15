// 自サイト記事と外部記事の共通モデル。astro:content に依存しない純粋関数だけを置く（tests/ から直接読む）。

export type SourceKind = 'local' | 'external';

export interface Post {
  id: string;
  title: string;
  description: string;
  /** 自サイトは "YYYY-MM-DD"、外部はISO 8601 */
  publishedAt: string;
  href: string;
  thumbnail: string | null;
  sourceName: string;
  sourceKind: SourceKind;
}

export type ExternalPost = Omit<Post, 'sourceKind'>;

export const PAGE_SIZE = 12;

/** 日付だけの値は日本時間0時として扱う */
export function toTime(publishedAt: string): number {
  return Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(publishedAt) ? `${publishedAt}T00:00:00+09:00` : publishedAt);
}

/** 表示用 YYYY.MM.DD（日本時間） */
export function formatDate(publishedAt: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) return publishedAt.replaceAll('-', '.');
  const jst = new Date(toTime(publishedAt) + 9 * 3600_000);
  return jst.toISOString().slice(0, 10).replaceAll('-', '.');
}

export function normalizeUrl(href: string): string {
  try {
    const url = new URL(href, 'https://tsusu0409.com');
    url.hash = '';
    url.search = '';
    return `${url.host}${url.pathname.replace(/\/+$/, '')}`.toLowerCase();
  } catch {
    return href;
  }
}

/** URLで重複除去し、公開日時の降順（同時刻はhref順）で並べる */
export function mergePosts(...lists: Post[][]): Post[] {
  const byUrl = new Map<string, Post>();
  for (const post of lists.flat()) {
    const key = normalizeUrl(post.href);
    if (!byUrl.has(key)) byUrl.set(key, post);
  }
  return [...byUrl.values()].sort(
    (a, b) => toTime(b.publishedAt) - toTime(a.publishedAt) || a.href.localeCompare(b.href),
  );
}

export function pageCount(total: number, size = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / size));
}

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const pages = pageCount(items.length, size);
  const start = (page - 1) * size;
  return {
    items: items.slice(start, start + size),
    page,
    pages,
    total: items.length,
    from: items.length ? start + 1 : 0,
    to: Math.min(start + size, items.length),
  };
}

export const pageHref = (page: number) => (page === 1 ? '/blog/' : `/blog/page/${page}/`);

/** RSS等のHTMLを一覧用のプレーンテキストにする */
export function toPlainText(html: unknown, max = 120): string {
  if (typeof html !== 'string') return '';
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
