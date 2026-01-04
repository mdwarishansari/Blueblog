'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function Editor({ value, onChange, className }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className={cn('rounded-lg border bg-white', className)}>
      <div className="flex flex-wrap gap-1 border-b bg-gray-50 p-2">
        {[
          ['Bold', () => editor.chain().focus().toggleBold().run()],
          ['Italic', () => editor.chain().focus().toggleItalic().run()],
          ['H2', () => editor.chain().focus().toggleHeading({ level: 2 }).run()],
          ['H3', () => editor.chain().focus().toggleHeading({ level: 3 }).run()],
          ['UL', () => editor.chain().focus().toggleBulletList().run()],
          ['OL', () => editor.chain().focus().toggleOrderedList().run()],
        ].map(([label, action]) => (
          <button
            key={label}
            onClick={action as any}
            className="rounded px-2 py-1 text-sm hover:bg-gray-200"
          >
            {label}
          </button>
        ))}
      </div>

      <EditorContent
        editor={editor}
        className="prose max-w-none min-h-[320px] px-4 py-3"
      />
    </div>
  )
}