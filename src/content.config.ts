import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// slugは元のファイル名で固定（公開URL /blog/[ファイル名]/ を維持）
const fileId = ({ entry }: { entry: string }) => entry.replace(/\.mdx?$/, '');

// 日付はカレンダー日付の文字列のまま扱い、タイムゾーン変換でずらさない
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog', generateId: fileId }),
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    date: calendarDate,
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
    thumb: z.string().nullish(),
    draft: z.boolean().default(false),
    updatedDate: calendarDate.optional(),
  }),
});

export const RECIPE_CATEGORIES = {
  rice: 'ごはんもの',
  main: '主菜',
  noodle: '麺類',
} as const;

const recipes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/recipes', generateId: fileId }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(Object.keys(RECIPE_CATEGORIES) as [keyof typeof RECIPE_CATEGORIES]),
    image: z.string(),
    imageAlt: z.string(),
    cookMinutes: z.number().int().positive(),
    servings: z.string(),
    mainIngredients: z.array(z.string()).default([]),
    publishedDate: calendarDate,
    draft: z.boolean().default(true),
    ingredientGroups: z.array(z.object({
      title: z.string(),
      items: z.array(z.object({ name: z.string(), amount: z.string() })),
    })),
    steps: z.array(z.object({ title: z.string(), body: z.string() })),
  }),
});

const activity = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/activity', generateId: fileId }),
  schema: z.object({
    title: z.string(),
    startDate: z.string(), // "YYYY.MM"
    endDate: z.string().nullable(),
    description: z.string(),
  }),
});

// 表示検証用（開発時のみ /dev/[id]/ で表示。本番では生成しない）
const fixtures = defineCollection({
  loader: glob({ pattern: '*.md', base: './tests/fixtures/markdown', generateId: fileId }),
  schema: z.object({ title: z.string() }),
});

export const collections = { blog, recipes, activity, fixtures };
