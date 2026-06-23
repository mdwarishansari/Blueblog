jest.mock('@tiptap/html/server', () => ({
  generateHTML: jest.fn(
    () => '<h1>Hello World</h1><p>This is a <strong>bold</strong> paragraph.</p>'
  ),
}))

import { renderTipTapContent } from '@/lib/renderContent'
import { generateHTML } from '@tiptap/html/server'

const mockedGenerateHTML = generateHTML as jest.Mock

describe('lib/renderContent', () => {
  beforeEach(() => {
    mockedGenerateHTML.mockClear()
  })

  it('returns empty string for invalid content', () => {
    expect(renderTipTapContent(null)).toBe('')
    expect(renderTipTapContent('plain text')).toBe('')
    expect(mockedGenerateHTML).not.toHaveBeenCalled()
  })

  it('delegates valid TipTap JSON to generateHTML', () => {
    const content = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
    }

    const html = renderTipTapContent(content)

    expect(mockedGenerateHTML).toHaveBeenCalledWith(content, expect.any(Array))
    expect(html).toContain('Hello World')
    expect(html).toContain('<strong>bold</strong>')
  })
})
