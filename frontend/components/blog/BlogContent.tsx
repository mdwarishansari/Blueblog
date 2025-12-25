'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FiExternalLink, FiYoutube } from 'react-icons/fi'

interface BlogContentProps {
  content: any
}

export default function BlogContent({ content }: BlogContentProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!content || !Array.isArray(content.blocks)) {
    return <div>No content available</div>
  }

  const renderBlock = (block: any, index: number) => {
    switch (block.type) {
      case 'header':
        const Tag = `h${block.data.level}` as keyof JSX.IntrinsicElements
        return (
          <Tag
            key={index}
            className={`font-bold mt-8 mb-4 text-gray-900 ${
              block.data.level === 1 ? 'text-4xl' :
              block.data.level === 2 ? 'text-3xl' :
              block.data.level === 3 ? 'text-2xl' :
              block.data.level === 4 ? 'text-xl' :
              'text-lg'
            }`}
          >
            {block.data.text}
          </Tag>
        )

      case 'paragraph':
        return (
          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
            {block.data.text}
          </p>
        )

      case 'list':
        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul'
        return (
          <ListTag
            key={index}
            className={`mb-4 ${
              block.data.style === 'ordered'
                ? 'list-decimal pl-6'
                : 'list-disc pl-6'
            }`}
          >
            {block.data.items.map((item: string, itemIndex: number) => (
              <li key={itemIndex} className="mb-2 text-gray-700">
                {item}
              </li>
            ))}
          </ListTag>
        )

      case 'image':
        return (
          <figure key={index} className="my-6">
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              <img
                src={block.data.file.url}
                alt={block.data.caption || 'Blog image'}
                width={block.data.file.width || 800}
                height={block.data.file.height || 600}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            {block.data.caption && (
              <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
                {block.data.caption}
              </figcaption>
            )}
          </figure>
        )

      case 'quote':
        return (
          <blockquote
            key={index}
            className="border-l-4 border-primary-500 pl-4 py-2 my-6 italic text-gray-700"
          >
            {block.data.text}
            {block.data.caption && (
              <footer className="text-sm text-gray-600 mt-2">
                — {block.data.caption}
              </footer>
            )}
          </blockquote>
        )

      case 'table':
        return (
          <div key={index} className="overflow-x-auto my-6">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  {block.data.content[0].map(
                    (cell: string, cellIndex: number) => (
                      <th
                        key={cellIndex}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {cell}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {block.data.content.slice(1).map(
                  (row: string[], rowIndex: number) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      {row.map((cell: string, cellIndex: number) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 text-sm text-gray-700"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )

      case 'code':
        return (
          <pre key={index} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6">
            <code className="text-sm font-mono">{block.data.code}</code>
          </pre>
        )

      case 'embed':
        if (block.data.service === 'youtube') {
          const videoId = block.data.embed.match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
          )?.[1]
          
          if (videoId) {
            return (
              <div key={index} className="my-6">
                <div className="relative pt-[56.25%] rounded-lg overflow-hidden bg-gray-900">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {block.data.caption && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {block.data.caption}
                  </p>
                )}
              </div>
            )
          }
        }
        
        return (
          <div key={index} className="my-6">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <FiExternalLink size={18} />
                <span className="font-medium">Embedded Content</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: block.data.embed }} />
            </div>
          </div>
        )

      case 'delimiter':
        return <hr key={index} className="my-8 border-gray-200" />

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {content.blocks.map(renderBlock)}
    </div>
  )
}