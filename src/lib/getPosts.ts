import { getCollection } from 'astro:content';
import externalPosts from '../data/external-posts.json';
import { mergePosts, type ExternalPost, type Post } from './posts';

export const isPublished = ({ data }: { data: { draft: boolean } }) => import.meta.env.DEV || !data.draft;

export async function getLocalPosts() {
  return (await getCollection('blog', isPublished)).sort((a, b) => b.data.date.localeCompare(a.data.date));
}

/** 公開中のレシピ。新しい順、同日はタイトル順 */
export async function getRecipes() {
  return (await getCollection('recipes', isPublished)).sort((a, b) =>
    b.data.publishedDate.localeCompare(a.data.publishedDate) || a.data.title.localeCompare(b.data.title, 'ja'),
  );
}

let cache: Promise<Post[]> | undefined;

/** TOP・一覧・ページ送りで同じ記事集合を使う（ビルド中に再取得しない） */
export function getAllPosts(): Promise<Post[]> {
  cache ??= getLocalPosts().then((entries) => {
    const local: Post[] = entries.map(({ id, data }) => ({
      id,
      title: data.title,
      description: data.description,
      publishedAt: data.date,
      href: `/blog/${id}/`,
      thumbnail: data.thumb || null,
      sourceName: 'tsusu0409.com',
      sourceKind: 'local',
    }));
    const external: Post[] = (externalPosts as ExternalPost[]).map((post) => ({ ...post, sourceKind: 'external' }));
    return mergePosts(local, external);
  });
  return cache;
}
