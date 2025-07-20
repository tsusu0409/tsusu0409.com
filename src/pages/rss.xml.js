import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt();

export async function GET(context) {
  const blog = (await getCollection('blog'))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .slice(0, 10);
  return rss({
    title: 'Tsusuのブログ',
    description: 'tsusu0409.comの最新投稿',
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
      content: sanitizeHtml(parser.render(post.body)),
    })),
  });
}