'use client'

import { useState } from 'react'
import { Link2, Check, Twitter, Linkedin } from 'lucide-react'
import toast from 'react-hot-toast'

interface ShareButtonsProps {
  title: string
  slug: string
}

export default function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const getUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/blog/${slug}`
    }
    return ''
  }

  const handleCopy = async () => {
    const url = getUrl()
    if (!url) return

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const shareTwitter = () => {
    const url = getUrl()
    const text = encodeURIComponent(`Check out this article: ${title}\n`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const shareLinkedIn = () => {
    const url = getUrl()
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
  }

  return (
    <div className="flex flex-wrap items-center gap-3 py-6 border-t border-hairline mt-10">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-gray mr-2">Share Article</span>
      
      {/* Copy Link */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-pure-white border border-hairline hover:bg-canvas-cream text-ink-charcoal rounded-full shadow-sm transition-all duration-200"
        title="Copy link"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-forest animate-scale-up" />
            <span className="text-forest">Copied!</span>
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5 text-slate-gray" />
            <span>Copy Link</span>
          </>
        )}
      </button>

      {/* Twitter / X */}
      <button
        onClick={shareTwitter}
        className="flex items-center justify-center p-2 bg-pure-white border border-hairline hover:bg-canvas-cream text-ink-charcoal rounded-full shadow-sm transition-all duration-200"
        title="Share on Twitter"
      >
        <Twitter className="h-3.5 w-3.5 text-slate-gray" />
      </button>

      {/* LinkedIn */}
      <button
        onClick={shareLinkedIn}
        className="flex items-center justify-center p-2 bg-pure-white border border-hairline hover:bg-canvas-cream text-ink-charcoal rounded-full shadow-sm transition-all duration-200"
        title="Share on LinkedIn"
      >
        <Linkedin className="h-3.5 w-3.5 text-slate-gray" />
      </button>
    </div>
  )
}
