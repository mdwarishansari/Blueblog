import { z } from 'zod';

export const uploadImageSchema = z.object({
  body: z.object({
    altText: z.string().optional(),
    title: z.string().optional(),
    caption: z.string().optional()
  })
});

export const updateImageSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid image ID')
  }),
  body: z.object({
    altText: z.string().optional(),
    title: z.string().optional(),
    caption: z.string().optional()
  })
});

export const getImagesSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => parseInt(val || '1')),
    limit: z.string().optional().transform(val => parseInt(val || '12')),
    search: z.string().optional()
  })
});