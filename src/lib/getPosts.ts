import { getCollection } from 'astro:content';
import externalPosts from '../data/external-posts.json';
import { mergePosts, type ExternalPost, type Post } from './posts';

export const isPublished = ({ data }: { data: { draft: boolean } }) => import.meta.env.DEV || !data.draft;

export async function getLocalPosts() {
  return (await getCollection('blog', isPublished)).sort((a, b) => b.data.date.localeCompare(a.data.date));
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
