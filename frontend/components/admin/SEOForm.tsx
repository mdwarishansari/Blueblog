'use client'

import { useState, useEffect } from 'react'
import { FiSearch, FiTrendingUp, FiEye, FiCopy } from 'react-icons/fi'

interface SEOFormProps {
  title: string
  description: string
  slug: string
  canonicalUrl?: string
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onSlugChange: (slug: string) => void
  onCanonicalChange?: (url: string) => void
}

export default function SEOForm({
  title,
  description,
  slug,
  canonicalUrl = '',
  onTitleChange,
  onDescriptionChange,
  onSlugChange,
  onCanonicalChange,
}: SEOFormProps) {
  const [focusKeyword, setFocusKeyword] = useState('')
  const [seoScore, setSeoScore] = useState(0)
  const [titleLength, setTitleLength] = useState(0)
  const [descLength, setDescLength] = useState(0)
  const [slugLength, setSlugLength] = useState(0)

  useEffect(() => {
    setTitleLength(title.length)
    setDescLength(description.length)
    setSlugLength(slug.length)
    calculateSeoScore()
  }, [title, description, slug, focusKeyword])

  const calculateSeoScore = () => {
    let score = 0
    
    // Title score
    if (titleLength >= 50 && titleLength <= 60) score += 30
    else if (titleLength > 0) score += 20
    
    // Description score
    if (descLength >= 120 && descLength <= 160) score += 30
    else if (descLength > 0) score += 20
    
    // Slug score
    if (slugLength > 0) score += 10
    
    // Focus keyword score
    if (focusKeyword) {
      if (title.toLowerCase().includes(focusKeyword.toLowerCase())) score += 10
      if (description.toLowerCase().includes(focusKeyword.toLowerCase())) score += 10
      if (slug.toLowerCase().includes(focusKeyword.toLowerCase())) score += 10
    } else {
      score += 10 // Bonus for not having keyword stuffing
    }
    
    setSeoScore(Math.min(100, score))
  }

  const getSeoColor = () => {
    if (seoScore >= 80) return 'text-green-600'
    if (seoScore >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSeoMessage = () => {
    if (seoScore >= 80) return 'Excellent! Your SEO looks great.'
    if (seoScore >= 60) return 'Good. Some improvements needed.'
    return 'Needs work. Follow the suggestions below.'
  }

  const generateSlug = () => {
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()
    
    onSlugChange(generatedSlug)
  }

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">SEO Score</h3>
            <p className="text-sm text-gray-600">{getSeoMessage()}</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getSeoColor()}`}>
              {seoScore}/100
            </div>
            <div className="text-xs text-gray-500">Score</div>
          </div>
        </div>
        
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              seoScore >= 80 ? 'bg-green-500' :
              seoScore >= 60 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${seoScore}%` }}
          />
        </div>
      </div>

      {/* SEO Preview */}
      <div className="border rounded-xl overflow-hidden">
        <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium">
          Google Search Preview
        </div>
        <div className="p-4 space-y-2">
          <div className="text-blue-600 text-lg hover:underline cursor-pointer">
            {title || 'Your page title will appear here'}
          </div>
          <div className="text-green-700 text-sm">
            {typeof window !== 'undefined' ? window.location.origin : ''}/blog/{slug || 'your-slug'}
          </div>
          <div className="text-gray-600 text-sm">
            {description || 'Your meta description will appear here...'}
          </div>
        </div>
      </div>

      {/* SEO Form Fields */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              SEO Title
            </label>
            <span className={`text-xs ${titleLength > 60 ? 'text-red-600' : titleLength < 50 ? 'text-yellow-600' : 'text-green-600'}`}>
              {titleLength}/60 characters
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Write an SEO-friendly title (50-60 characters)"
            className="input-field"
          />
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <FiEye size={14} />
            <span>Include your main keyword at the beginning</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Meta Description
            </label>
            <span className={`text-xs ${descLength > 160 ? 'text-red-600' : descLength < 120 ? 'text-yellow-600' : 'text-green-600'}`}>
              {descLength}/160 characters
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Write a compelling description that includes keywords (120-160 characters)"
            rows={3}
            className="input-field"
          />
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <FiEye size={14} />
            <span>Include a call-to-action and your focus keyword</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              URL Slug
            </label>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${slugLength > 60 ? 'text-red-600' : 'text-green-600'}`}>
                {slugLength}/60 characters
              </span>
              <button
                onClick={generateSlug}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <FiCopy size={12} />
                Generate from title
              </button>
            </div>
          </div>
          <div className="flex">
            <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-lg text-gray-600">
              /blog/
            </div>
            <input
              type="text"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="seo-friendly-url-slug"
              className="flex-1 rounded-l-none input-field"
            />
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Use lowercase letters, hyphens, and keep it short
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Focus Keyword
          </label>
          <div className="relative">
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => setFocusKeyword(e.target.value)}
              placeholder="Enter your primary keyword"
              className="pl-10 input-field"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={18} />
          </div>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <FiTrendingUp size={14} />
            <span>This helps optimize your content for specific searches</span>
          </div>
        </div>

        {onCanonicalChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Canonical URL (Optional)
            </label>
            <input
              type="url"
              value={canonicalUrl}
              onChange={(e) => onCanonicalChange(e.target.value)}
              placeholder="https://example.com/original-post"
              className="input-field"
            />
            <p className="text-sm text-gray-600 mt-1">
              Use if this content was originally published elsewhere
            </p>
          </div>
        )}
      </div>

      {/* SEO Checklist */}
      <div className="border rounded-xl p-4 bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-3">SEO Checklist</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              titleLength >= 50 && titleLength <= 60
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {titleLength >= 50 && titleLength <= 60 ? '✓' : '○'}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                Title length (50-60 characters)
              </div>
              <div className="text-xs text-gray-600">
                Optimal for search engine results
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              descLength >= 120 && descLength <= 160
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {descLength >= 120 && descLength <= 160 ? '✓' : '○'}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                Description length (120-160 characters)
              </div>
              <div className="text-xs text-gray-600">
                Shows fully in search results
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              slugLength > 0 && slugLength <= 60
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {slugLength > 0 && slugLength <= 60 ? '✓' : '○'}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                URL slug is clean and short
              </div>
              <div className="text-xs text-gray-600">
                Easy to read and share
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
              focusKeyword && 
              title.toLowerCase().includes(focusKeyword.toLowerCase())
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-200 text-gray-400'
            }`}>
              {focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase()) ? '✓' : '○'}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                Focus keyword in title
              </div>
              <div className="text-xs text-gray-600">
                Important for ranking
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}