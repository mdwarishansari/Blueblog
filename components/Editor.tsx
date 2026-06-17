'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
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
  onChange?: (value: any) => void
  className?: string
  readOnly?: boolean
}

export default function Editor({ value, onChange, className, readOnly = false }: EditorProps) {
  const editor = useEditor({
    immediatelyRender: false, // REQUIRED for App Router
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your story here... formatting options are available in the toolbar above.',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value || { type: 'doc', content: [] },
    onUpdate({ editor }) {
      if (onChange) {
        onChange(editor.getJSON())
      }
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

  // Update editor editable state dynamically if readOnly changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly)
    }
  }, [readOnly, editor])

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
        'flex items-center justify-center h-10 w-10 rounded-[10px] transition-all duration-150',
        'hover:bg-pure-white hover:text-electric-cobalt border border-transparent',
        isActive
          ? 'bg-pure-white border-hairline text-electric-cobalt shadow-sm font-semibold'
          : 'text-slate-gray',
        disabled && 'opacity-30 cursor-not-allowed'
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  )

  const Divider = () => (
    <div className="h-5 w-px bg-hairline mx-1.5" />
  )

  return (
    <div
      className={cn(
        'rounded-[16px] bg-pure-white overflow-hidden flex flex-col border border-hairline shadow-subtle hover:border-slate-300 transition-colors duration-200',
        className
      )}
    >
      {/* ================= TOOLBAR ================= */}
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between border-b border-hairline bg-canvas-cream px-3 py-2.5 gap-2">
          <div className="flex flex-wrap items-center gap-1">
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
        </div>
      )}

      {/* ================= EDITOR ================= */}
      <EditorContent
        editor={editor}
        className="min-h-[360px] w-full px-5 py-4 focus:outline-none text-ink-charcoal bg-pure-white"
      />

      {/* ================= TYPOGRAPHY SCOPE ================= */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 300px;
          color: #121722;
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror > * + * {
          margin-top: 0.75em;
        }

        .ProseMirror h1 {
          font-size: 20px;
          font-weight: 600;
          margin: 1.5rem 0 1rem 0;
          line-height: 1.38;
          color: #121722;
        }

        .ProseMirror h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
          line-height: 1.5;
          color: #121722;
        }

        .ProseMirror h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.56;
          color: #121722;
        }

        .ProseMirror p {
          margin: 0.75rem 0;
          line-height: 1.56;
          color: #121722;
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
          line-height: 1.56;
          color: #121722;
        }

        .ProseMirror li p {
          margin: 0;
        }

        .ProseMirror strong {
          font-weight: 700;
          color: #121722;
        }

        .ProseMirror em {
          font-style: italic;
          color: #777c86;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #0068f9;
          padding-left: 1.5rem;
          margin: 1rem 0;
          font-style: italic;
          color: #121722;
          background-color: #fbfaf7;
          padding: 1rem 1rem 1rem 1.5rem;
          border-radius: 0 8px 8px 0;
          border-top: 1px solid #efefef;
          border-right: 1px solid #efefef;
          border-bottom: 1px solid #efefef;
        }

        .ProseMirror hr {
          border: none;
          height: 1px;
          background: #efefef;
          margin: 2rem 0;
        }

        .ProseMirror code {
          background: #fbfaf7;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: ui-monospace, monospace;
          font-size: 0.9em;
          color: #6736eb;
          border: 1px solid #efefef;
        }

        .ProseMirror pre {
          background: #1d1d1d;
          color: #faf9f7;
          padding: 1rem;
          border-radius: 12px;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .ProseMirror pre code {
          background: none;
          color: inherit;
          padding: 0;
          border: none;
        }

        /* Placeholder styling */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #a5a5a5;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  )
}
