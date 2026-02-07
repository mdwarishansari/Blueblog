import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'

export function renderTipTapContent(content: any): string {
  if (!content || typeof content !== 'object') return ''

  // Configure StarterKit to match the Editor component configuration
  return generateHTML(content, [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      // Ensure all text formatting is properly rendered
      bold: {},
      italic: {},
      bulletList: {},
      orderedList: {},
      listItem: {},
      paragraph: {},
      hardBreak: {},
      blockquote: {},
      code: {},
      codeBlock: {},
      horizontalRule: {},
    }),
  ])
}
