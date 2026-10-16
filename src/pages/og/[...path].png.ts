// 各ページのOGP画像。/og/index.png（TOP）、/og/blog/[slug].png など。ビルド時に静的なPNGとして書き出す
import type { APIRoute, GetStaticPaths } from 'astro';
import { RECIPE_CATEGORIES } from '../../content.config';
import playlistsData from '../../data/spotify-playlists.json';
import { getAllPosts, getLocalPosts, getRecipes } from '../../lib/getPosts';
import { pageCard, postCard } from '../../lib/og';
import { toMonths, type RawPlaylist } from '../../lib/playlist';
import { formatDate } from '../../lib/posts';

export const getStaticPaths = (async () => {
  const [posts, allPosts, recipes] = await Promise.all([getLocalPosts(), getAllPosts(), getRecipes()]);
  const latest = toMonths(playlistsData as unknown as RawPlaylist[])[0];
  const page = (path: string, card: Parameters<typeof pageCard>[0]) => ({ params: { path }, props: { render: () => pageCard(card) } });
  const post = (path: string, card: Parameters<typeof postCard>[0]) => ({ params: { path }, props: { render: () => postCard(card) } });

  return [
    page('index', { category: 'TOP / PERSONAL SITE', title: 'Tsusu', description: '@tsusu0409', images: ['/images/v4/portrait.jpg'], portrait: true }),
    page('blog', {
      category: 'POSTS / BLOG',
      title: 'Posts',
      description: '自サイトと外部サイトに投稿した記事の一覧です。',
      images: allPosts.flatMap((p) => p.thumbnail ?? []).slice(0, 4),
    }),
    page('playlist', {
      category: 'MUSIC',
      title: 'Playlist',
      description: '1ヶ月に1度、その月にお気に入りだった楽曲をまとめたプレイリストを公開しています。',
      images: latest?.image ? [latest.image] : (latest?.covers ?? []),
    }),
    page('recipes', {
      category: 'COOKING',
      title: 'Recipes',
      description: '普段の自炊で作っている料理のレシピをまとめています。',
      images: recipes.slice(0, 4).map((r) => r.data.image),
    }),
    ...posts.map(({ id, data }) =>
      post(`blog/${id}`, {
        category: 'POSTS / BLOG',
        title: data.title,
        date: formatDate(data.date),
        meta: data.tags.map((tag) => `#${tag}`).join('   '),
        image: data.thumb,
      }),
    ),
    ...recipes.map(({ id, data }) =>
      post(`recipes/${id}`, {
        category: `RECIPES / ${RECIPE_CATEGORIES[data.category]}`,
        title: data.title,
        date: formatDate(data.publishedDate),
        meta: `${data.cookMinutes}分 / ${data.servings}`,
        image: data.image,
      }),
    ),
  ];
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => new Response(await props.render(), { headers: { 'Content-Type': 'image/png' } });
