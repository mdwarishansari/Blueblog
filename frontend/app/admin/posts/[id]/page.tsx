'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import SEOForm from '@/components/admin/SEOForm'
import ImageUploader from '@/components/admin/ImageUploader'
import { FiSave, FiEye, FiCalendar, FiX, FiSend } from 'react-icons/fi'

export default function EditPostPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    title: 'Getting Started with Next.js 14',
    slug: 'getting-started-with-nextjs-14',
    excerpt: 'Learn how to build modern web applications with Next.js 14 and the App Router.',
    content: '# Introduction\n\nNext.js 14 introduces many exciting features...',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    seo_title: '',
    seo_description: '',
    canonical_url: '',
    banner_image_id: '',
    category_ids: [] as string[],
    published_at: '',
  })

  const handleSave = async (publish = false) => {
    setSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      alert(publish ? 'Post published successfully!' : 'Post saved as draft!')
      router.push('/admin/posts')
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
            <p className="text-gray-600">Start writing your next great article</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/posts')}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <FiX size={18} />
              Cancel
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <FiSave size={18} />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <FiSend size={18} />
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Post Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  title: e.target.value,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/--+/g, '-')
                    .trim()
                }))}
                placeholder="Enter post title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-xl"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief summary of your post (shown in listings)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your post content here..."
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
              />
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="bg-white border rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Featured Image</h3>
              <ImageUploader
                onUploadComplete={(image) => {
                  setFormData(prev => ({ ...prev, banner_image_id: image.id }))
                }}
              />
            </div>

            {/* SEO Settings */}
            <div className="bg-white border rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">SEO Settings</h3>
              <SEOForm
                title={formData.seo_title || formData.title}
                description={formData.seo_description || formData.excerpt}
                slug={formData.slug}
                canonicalUrl={formData.canonical_url}
                onTitleChange={(title) => setFormData(prev => ({ ...prev, seo_title: title }))}
                onDescriptionChange={(description) => setFormData(prev => ({ ...prev, seo_description: description }))}
                onSlugChange={(slug) => setFormData(prev => ({ ...prev, slug }))}
                onCanonicalChange={(url) => setFormData(prev => ({ ...prev, canonical_url: url }))}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}