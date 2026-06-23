import { generateSEO, generateJSONLD } from '@/lib/seo'

describe('lib/seo', () => {
  describe('generateSEO', () => {
    it('builds default site metadata', () => {
      const metadata = generateSEO()

      expect(metadata.title).toBe('BlueBlog')
      expect(metadata.description).toBe('SEO optimized blogging platform')
      expect(metadata.metadataBase?.toString()).toBe('http://localhost:3000/')
      expect(metadata.robots).toMatchObject({ index: true, follow: true })
    })

    it('includes Open Graph and Twitter card fields', () => {
      const metadata = generateSEO({
        title: 'My Post',
        description: 'Post description',
        url: 'http://localhost:3000/blog/my-post',
        type: 'article',
        author: 'Jane Doe',
        tags: ['nextjs'],
      })

      expect(metadata.title).toBe('My Post | BlueBlog')
      expect(metadata.openGraph).toMatchObject({
        title: 'My Post | BlueBlog',
        type: 'article',
        tags: ['nextjs'],
      })
      expect(metadata.twitter).toMatchObject({
        card: 'summary_large_image',
        creator: '@blueblog',
      })
      expect(metadata.alternates?.canonical).toBe(
        'http://localhost:3000/blog/my-post'
      )
    })
  })

  describe('generateJSONLD', () => {
    it('returns valid Article structured data JSON', () => {
      const json = generateJSONLD({
        title: 'Test Article',
        description: 'A test article',
        url: 'http://localhost:3000/blog/test-article',
        publishedTime: '2024-01-01T00:00:00.000Z',
        author: { name: 'Jane Doe' },
      })

      const parsed = JSON.parse(json)
      expect(parsed['@context']).toBe('https://schema.org')
      expect(parsed['@type']).toBe('Article')
      expect(parsed.headline).toBe('Test Article')
      expect(parsed.author.name).toBe('Jane Doe')
      expect(parsed.publisher.name).toBe('BlueBlog')
    })
  })
})
