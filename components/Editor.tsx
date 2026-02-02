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
    immediatelyRender: false, // REQUIRED for App Router
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

  // 🔁 Sync external value → editor (edit page)
  useEffect(() => {
    if (!editor || !value) return
    const current = editor.getJSON()
    if (JSON.stringify(current) !== JSON.stringify(value)) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  const toolBtn = (active: boolean) =>
    cn(
      'rounded-lg px-3 py-1.5 text-sm font-medium ui-transition',
      active
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-muted'
    )

  return (
    <div
      className={cn(
        'rounded-xl bg-card elev-sm overflow-hidden flex flex-col border border-border',
        className
      )}
    >
      {/* ================= TOOLBAR ================= */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-2 py-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolBtn(editor.isActive('bold'))}
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolBtn(editor.isActive('italic'))}
        >
          Italic
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={toolBtn(editor.isActive('heading', { level: 2 }))}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolBtn(editor.isActive('bulletList'))}
        >
          UL
        </button>
      </div>

      {/* ================= EDITOR ================= */}
      <EditorContent
        editor={editor}
        className="
          min-h-[360px]
          w-full
          px-5 py-4
          focus:outline-none
          text-fg
        "
      />

      {/* ================= TYPOGRAPHY SCOPE ================= */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }

        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 1rem 0;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0.75rem 0;
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }

        .ProseMirror p {
          margin: 0.5rem 0;
          line-height: 1.75;
        }

        .ProseMirror ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .ProseMirror ol {
          list-style: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .ProseMirror strong {
          font-weight: 700;
        }

        .ProseMirror em {
          font-style: italic;
        }
      `}</style>
    </div>
  )
}
