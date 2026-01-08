import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'

export function renderTipTapContent(content: any): string {
  if (!content || typeof content !== 'object') return ''

  return generateHTML(content, [
    StarterKit,
  ])
}
