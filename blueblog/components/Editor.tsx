'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
}

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link', 'image',
]

export default function Editor({ 
  value, 
  onChange, 
  placeholder = 'Write something amazing...',
  className 
}: EditorProps) {
  const [editorHtml, setEditorHtml] = useState(value)

  const handleChange = useCallback((html: string) => {
    setEditorHtml(html)
    onChange(html)
  }, [onChange])

  return (
    <div className={className}>
      <ReactQuill
        theme="snow"
        value={editorHtml}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-96"
      />
    </div>
  )
}