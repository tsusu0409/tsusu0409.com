// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { codeTheme, codeTransformers } from './src/lib/markdown/code.mjs';
import remarkAlerts from './src/lib/markdown/remark-alerts.mjs';
import rehypeDedupeScripts from './src/lib/markdown/rehype-dedupe-scripts.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://tsusu0409.com',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      // 互換用ページと古い順の一覧（新しい順と重複）はサイトマップに載せない
      filter: (page) => !/\/(activity|about)\/?$|\/oldest\//.test(page),
    }),
  ],
  redirects: {
    '/about': '/#about',
  },
  markdown: {
    gfm: true,
    remarkPlugins: [remarkMath, remarkAlerts],
    rehypePlugins: [rehypeKatex, rehypeDedupeScripts],
    syntaxHighlight: { type: 'shiki', excludeLangs: ['mermaid'] },
    shikiConfig: {
      theme: codeTheme,
      transformers: codeTransformers,
    },
  },
});
