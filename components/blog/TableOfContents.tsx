'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  headings: Heading[]
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)
        if (visibleEntries.length > 0) {
          // Set active to the first visible heading
          setActiveId(visibleEntries[0]!.target.id)
        }
      },
      { rootMargin: '-80px 0px -80% 0px' }
    )

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    })

    return () => {
      headings.forEach((heading) => {
        const el = document.getElementById(heading.id)
        if (el) observer.unobserve(el)
      })
    }
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-ink-charcoal border-b border-hairline pb-2">
        Table of Contents
      </h3>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={cn(
              'text-sm transition-colors duration-150',
              heading.level === 3 ? 'pl-4' : ''
            )}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
                setActiveId(heading.id)
              }}
              className={cn(
                'block py-0.5 leading-normal hover:text-ink-charcoal',
                activeId === heading.id
                  ? 'text-electric-cobalt font-semibold'
                  : 'text-slate-gray font-normal'
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
