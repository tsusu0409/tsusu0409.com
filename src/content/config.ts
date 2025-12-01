import { defineCollection, z } from 'astro:content';

const activityCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    startDate: z.string(), // "YYYY.MM" 形式
    endDate: z.string().nullable(),   // "YYYY.MM" 形式
    description: z.string(),
  }),
});

export const collections = {
  activity: activityCollection,
};
