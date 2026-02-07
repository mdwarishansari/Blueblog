'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo
} from 'lucide-react'

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

  const ToolButton = ({
    onClick,
    isActive,
    icon: Icon,
    label,
    disabled = false
  }: {
    onClick: () => void
    isActive: boolean
    icon: React.ComponentType<{ className?: string }>
    label: string
    disabled?: boolean
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        'flex items-center justify-center h-9 w-9 rounded-lg ui-transition',
        'hover:bg-indigo-50 hover:text-indigo-600',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
        isActive
          ? 'bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 shadow-sm'
          : 'text-gray-600',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )

  const Divider = () => (
    <div className="h-6 w-px bg-gray-200 mx-1" />
  )

  return (
    <div
      className={cn(
        'rounded-xl bg-white overflow-hidden flex flex-col border-2 border-gray-100 shadow-sm hover:border-indigo-200 ui-transition',
        className
      )}
    >
      {/* ================= TOOLBAR ================= */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50/30 px-3 py-2">
        {/* Text Formatting */}
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          label="Bold (Ctrl+B)"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          label="Italic (Ctrl+I)"
        />

        <Divider />

        {/* Headings */}
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={Heading1}
          label="Heading 1"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={Heading2}
          label="Heading 2"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon={Heading3}
          label="Heading 3"
        />

        <Divider />

        {/* Lists */}
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          label="Bullet List"
        />
        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          label="Numbered List"
        />

        <Divider />

        {/* Block Elements */}
        <ToolButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          icon={Quote}
          label="Blockquote"
        />
        <ToolButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          isActive={false}
          icon={Minus}
          label="Horizontal Rule"
        />

        <Divider />

        {/* Undo/Redo */}
        <ToolButton
          onClick={() => editor.chain().focus().undo().run()}
          isActive={false}
          disabled={!editor.can().undo()}
          icon={Undo}
          label="Undo (Ctrl+Z)"
        />
        <ToolButton
          onClick={() => editor.chain().focus().redo().run()}
          isActive={false}
          disabled={!editor.can().redo()}
          icon={Redo}
          label="Redo (Ctrl+Y)"
        />
      </div>

      {/* ================= EDITOR ================= */}
      <EditorContent
        editor={editor}
        className="
          min-h-[360px]
          w-full
          px-5 py-4
          focus:outline-none
          text-gray-800
          bg-white
        "
      />

      {/* ================= TYPOGRAPHY SCOPE ================= */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 300px;
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror > * + * {
          margin-top: 0.75em;
        }

        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 800;
          margin: 1.5rem 0 1rem 0;
          line-height: 1.2;
          color: #1e293b;
          background: linear-gradient(135deg, #1e293b 0%, #4f46e5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1.25rem 0 0.75rem 0;
          line-height: 1.3;
          color: #334155;
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.4;
          color: #475569;
        }

        .ProseMirror p {
          margin: 0.75rem 0;
          line-height: 1.8;
          color: #475569;
        }

        .ProseMirror ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }

        .ProseMirror ol {
          list-style: decimal;
          padding-left: 1.5rem;
          margin: 0.75rem 0;
        }

        .ProseMirror li {
          margin: 0.25rem 0;
          line-height: 1.7;
          color: #475569;
        }

        .ProseMirror li p {
          margin: 0;
        }

        .ProseMirror strong {
          font-weight: 700;
          color: #1e293b;
        }

        .ProseMirror em {
          font-style: italic;
          color: #64748b;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 1.5rem;
          margin: 1rem 0;
          font-style: italic;
          color: #64748b;
          background: linear-gradient(90deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%);
          padding: 1rem 1rem 1rem 1.5rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }

        .ProseMirror hr {
          border: none;
          height: 2px;
          background: linear-gradient(90deg, #e2e8f0 0%, #c7d2fe 50%, #e2e8f0 100%);
          margin: 2rem 0;
          border-radius: 1px;
        }

        .ProseMirror code {
          background: #f1f5f9;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: ui-monospace, monospace;
          font-size: 0.9em;
          color: #e11d48;
        }

        .ProseMirror pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .ProseMirror pre code {
          background: none;
          color: inherit;
          padding: 0;
        }

        /* Placeholder styling */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  )
}

