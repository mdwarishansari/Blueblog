'use client'

interface Props {
  content: any
}

export default function BlogContent({ content }: Props) {
  if (!content) {
    return <p className="text-gray-500">No content available.</p>
  }

  // EditorJS format
  if (content.blocks && Array.isArray(content.blocks)) {
    return (
      <>
        {content.blocks.map((block: any, index: number) => {
          switch (block.type) {
            case 'header': {
              const Tag = `h${block.data.level || 2}` as any
              return (
                <Tag key={index} className="mt-8 mb-4">
                  {block.data.text}
                </Tag>
              )
            }

            case 'paragraph':
              return (
                <p key={index} className="mb-4">
                  {block.data.text}
                </p>
              )

            case 'list':
              return block.data.style === 'ordered' ? (
                <ol key={index} className="pl-6 mb-4 list-decimal">
                  {block.data.items.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              ) : (
                <ul key={index} className="pl-6 mb-4 list-disc">
                  {block.data.items.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )

            case 'image':
              return (
                <figure key={index} className="my-8">
                  <img
                    src={block.data.file?.url}
                    alt={block.data.caption || ''}
                    className="rounded-xl"
                  />
                  {block.data.caption && (
                    <figcaption className="mt-2 text-sm text-center text-gray-500">
                      {block.data.caption}
                    </figcaption>
                  )}
                </figure>
              )

            default:
              return null
          }
        })}
      </>
    )
  }

  // Plain text fallback
  if (typeof content === 'string') {
    return <p>{content}</p>
  }

  // Debug fallback (should never be seen in prod)
  return (
    <pre className="p-4 overflow-x-auto text-sm bg-gray-100 rounded">
      {JSON.stringify(content, null, 2)}
    </pre>
  )
}
