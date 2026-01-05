'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface EditorProps {
  value: any
  onChange: (value: any) => void
  className?: string
}

export default function Editor({ value, onChange, className }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // 🔥 REQUIRED for Next.js App Router
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: value || { type: 'doc', content: [] },
    onUpdate({ editor }) {
      onChange(editor.getJSON())
    },
  })

  // Sync external value → editor (for edit page)
  useEffect(() => {
    if (!editor || !value) return

    const current = editor.getJSON()
    if (JSON.stringify(current) !== JSON.stringify(value)) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className={cn('rounded-lg border bg-background overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="rounded px-2 py-1 text-sm hover:bg-muted"
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="rounded px-2 py-1 text-sm hover:bg-muted"
        >
          Italic
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="rounded px-2 py-1 text-sm hover:bg-muted"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="rounded px-2 py-1 text-sm hover:bg-muted"
        >
          UL
        </button>
      </div>

      {/* Editor */}
      <EditorContent
  editor={editor}
  className="
    min-h-[360px]
    w-full
    px-4 py-4
    focus:outline-none

    prose prose-lg
    dark:prose-invert

    prose-h1:text-3xl
    prose-h2:text-2xl
    prose-h2:font-bold
    prose-h3:text-xl

    prose-ul:list-disc
    prose-ul:pl-6
    prose-ol:list-decimal
    prose-ol:pl-6

    prose-p:my-2
  "
/>

    </div>
  )
}
