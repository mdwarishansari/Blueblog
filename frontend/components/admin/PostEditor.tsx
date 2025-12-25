'use client'

import { useState } from 'react'
import { FiBold, FiItalic, FiList, FiLink, FiImage, FiCode, FiType } from 'react-icons/fi'

interface PostEditorProps {
  content: string
  onChange: (content: string) => void
}

export default function PostEditor({ content, onChange }: PostEditorProps) {
  const [isPreview, setIsPreview] = useState(false)

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('post-content') as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end)
    onChange(newText)
    
    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length)
    }, 0)
  }

  const toolbarButtons = [
    {
      icon: FiBold,
      action: () => insertMarkdown('**', '**'),
      title: 'Bold',
    },
    {
      icon: FiItalic,
      action: () => insertMarkdown('*', '*'),
      title: 'Italic',
    },
    {
      icon: FiType,
      action: () => insertMarkdown('# ', ''),
      title: 'Heading',
    },
    {
      icon: FiList,
      action: () => insertMarkdown('- '),
      title: 'List',
    },
    {
      icon: FiLink,
      action: () => insertMarkdown('[', '](https://)'),
      title: 'Link',
    },
    {
      icon: FiImage,
      action: () => insertMarkdown('![', '](https://)'),
      title: 'Image',
    },
    {
      icon: FiCode,
      action: () => insertMarkdown('```\n', '\n```'),
      title: 'Code Block',
    },
  ]

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2 border-b">
        <div className="flex items-center gap-1">
          {toolbarButtons.map((button, index) => {
            const Icon = button.icon
            return (
              <button
                key={index}
                type="button"
                onClick={button.action}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                title={button.title}
              >
                <Icon size={18} />
              </button>
            )
          })}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-3 py-1 text-sm rounded ${!isPreview ? 'bg-gray-200' : ''}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-3 py-1 text-sm rounded ${isPreview ? 'bg-gray-200' : ''}`}
          >
            Preview
          </button>
        </div>
      </div>
      
      {/* Editor/Preview */}
      {isPreview ? (
        <div className="p-4 prose max-w-none min-h-[400px]">
          {/* Preview would go here */}
          <pre className="whitespace-pre-wrap">{content}</pre>
        </div>
      ) : (
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-[400px] p-4 focus:outline-none resize-none"
          placeholder="Write your post content here..."
        />
      )}
    </div>
  )
}