import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

// 自サイトの記事のみを公開日の降順で配信する。
// link は旧フィードと同じ /blog/[ファイル名]/（@astrojs/rss が末尾スラッシュを付与）。
export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort((a, b) => b.data.date.localeCompare(a.data.date));
  return rss({
    title: 'Tsusuのブログ',
    description: 'tsusu0409.comの最新投稿',
    site: context.site!,
    items: posts.map(({ id, data }) => ({
      title: data.title,
      pubDate: new Date(data.date), // 旧フィードと同じ値（UTC 0時）
      description: data.description,
      link: `/blog/${id}`,
      customData: data.thumb ? `<thumb>${data.thumb}</thumb>` : undefined,
    })),
  });
}
