import rss from '@astrojs/rss';

export async function GET(context) {
  const allBlogPosts = import.meta.glob('./blog/*.{md,mdx}', { eager: true });

  const items = Object.values(allBlogPosts).map((post) => {
    return {
      title: post.frontmatter.title,
      pubDate: post.frontmatter.date,
      description: post.frontmatter.description,
      link: post.url,
      customData: `<thumb>${post.frontmatter.thumb}</thumb>`,
    };
  });

  return rss({
    title: 'Tsusuのブログ',
    description: 'tsusu0409.comの最新投稿',
    site: context.site,
    items: items,
  });
}