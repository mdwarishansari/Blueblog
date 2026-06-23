import {
  cn,
  formatDate,
  formatDateTime,
  truncate,
  slugify,
  generateExcerpt,
} from '@/lib/utils'

describe('lib/utils', () => {
  describe('cn', () => {
    it('merges Tailwind classes and resolves conflicts', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })

    it('handles conditional classes', () => {
      expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
    })
  })

  describe('formatDate', () => {
    it('formats ISO date strings in en-US locale', () => {
      expect(formatDate('2024-06-15')).toMatch(/June 15, 2024/)
    })
  })

  describe('formatDateTime', () => {
    it('includes time components', () => {
      const result = formatDateTime(new Date('2024-06-15T14:30:00'))
      expect(result).toMatch(/June 15, 2024/)
    })
  })

  describe('truncate', () => {
    it('returns original string when under limit', () => {
      expect(truncate('hello', 10)).toBe('hello')
    })

    it('appends ellipsis when over limit', () => {
      expect(truncate('hello world', 5)).toBe('hello...')
    })
  })

  describe('slugify', () => {
    it('converts title to URL-safe slug', () => {
      expect(slugify('Hello World!')).toBe('hello-world')
    })

    it('collapses multiple spaces and dashes', () => {
      expect(slugify('  Foo   Bar  ')).toBe('foo-bar')
    })

    it('strips special characters', () => {
      expect(slugify('TypeScript & React')).toBe('typescript-react')
    })
  })

  describe('generateExcerpt', () => {
    it('truncates plain string content', () => {
      const long = 'a'.repeat(200)
      expect(generateExcerpt(long, 50)).toHaveLength(53)
    })

    it('extracts text from TipTap block array', () => {
      const content = [
        {
          type: 'paragraph',
          content: [{ text: 'First paragraph.' }],
        },
        {
          type: 'heading',
          content: [{ text: 'Section title' }],
        },
      ]
      expect(generateExcerpt(content, 160)).toContain('First paragraph')
    })

    it('returns empty string for unsupported content', () => {
      expect(generateExcerpt(null)).toBe('')
    })
  })
})
