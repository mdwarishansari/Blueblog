import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env['NEXT_PUBLIC_SITE_URL'] ?? 'http://localhost:3000'

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/blog',
    '/about',
    '/contact',
    '/category',
    '/login',
    '/register',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/blog' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }))

  try {
    const [posts, categories] = await Promise.all([
      prisma.post.findMany({
        where: { status: 'PUBLISHED', publishedAt: { lte: new Date() } },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ])

    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt ?? post.publishedAt ?? new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${siteUrl}/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))

    return [...staticRoutes, ...postRoutes, ...categoryRoutes]
  } catch {
    return staticRoutes
  }
}
