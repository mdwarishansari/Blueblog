'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, Calendar, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { Post, Category, Image as ImageType } from '@prisma/client'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

interface PostEditorProps {
  params: { id: string }
}

interface PostData {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  bannerImageId: string | null
  status: 'DRAFT' | 'PUBLISHED'
  seoTitle: string
  seoDescription: string
  canonicalUrl: string
  publishedAt: string | null
  categoryIds: string[]
}

export default function PostEditorPage({ params }: PostEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ImageType[]>([])
  const [post, setPost] = useState<PostData>({
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    bannerImageId: null,
    status: 'DRAFT',
    seoTitle: '',
    seoDescription: '',
    canonicalUrl: '',
    publishedAt: null,
    categoryIds: [],
  })

  const isNewPost = params.id === 'new'
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  useEffect(() => {
    fetchData()
  if (!slugEdited) {
    setPost(p => ({
      ...p,
      slug: p.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-'),
    }))
  }
}, [post.title])

  const fetchData = async () => {
    try {
      const [categoriesRes, imagesRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/upload/cloudinary'),
      ])

      if (categoriesRes.ok) {
        setCategories(await categoriesRes.json())
      }

      if (imagesRes.ok) {
        const data = await imagesRes.json()
        setImages(data.images || [])
      }

      if (!isNewPost) {
        const postRes = await fetch(`/api/admin/posts/${params.id}`)
        if (postRes.ok) {
          const postData = await postRes.json()
          setPost({
            ...postData,
            categoryIds: postData.categories?.map((c: Category) => c.id) || [],
          })
        }
      }
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (publish = false) => {
    setSaving(true)
    try {
      const url = isNewPost ? '/api/admin/posts' : `/api/admin/posts/${post.id}`
      const method = isNewPost ? 'POST' : 'PUT'

      const dataToSend = {
        ...post,
        status: publish ? 'PUBLISHED' : post.status,
        publishedAt: publish ? new Date().toISOString() : post.publishedAt,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save post')
      }

      toast.success(publish ? 'Post published successfully!' : 'Post saved successfully!')
      
      if (isNewPost) {
        router.push(`/admin/posts/${data.post.id}`)
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }

      setPost({ ...post, bannerImageId: data.image.id })
      setImages([data.image, ...images])
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const generateSlug = () => {
    const slug = post.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()
    
    setPost({ ...post, slug })
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">Loading editor...</div>
      </div>
    )
  }

  const selectedImage = images.find(img => img.id === post.bannerImageId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNewPost ? 'Create New Post' : 'Edit Post'}
          </h1>
          <p className="text-gray-600">
            {isNewPost ? 'Start writing your new blog post' : 'Edit and update your post'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            loading={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            loading={saving}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <Input
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              placeholder="Enter post title"
              className="text-2xl font-bold"
            />
          </div>

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateSlug}
              >
                Generate from title
              </Button>
            </div>
            <Input
              value={post.slug}
              onChange={(e) => setPost({ ...post, slug: e.target.value })}
              placeholder="post-url-slug"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt
            </label>
            <textarea
              value={post.excerpt}
              onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Brief description of your post"
            />
          </div>

          {/* Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <Editor
              value={post.content}
              onChange={(content) => setPost({ ...post, content })}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={post.status}
                  onChange={(e) => setPost({ ...post, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>

              {post.status === 'PUBLISHED' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline mr-2 h-4 w-4" />
                    Published Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={post.publishedAt ? post.publishedAt.slice(0, 16) : ''}
                    onChange={(e) => setPost({ ...post, publishedAt: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Featured Image</h3>
            <div className="space-y-4">
              {selectedImage && (
                <div className="overflow-hidden rounded-lg border">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.altText || 'Featured image'}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image
                </label>
                <select
                  value={post.bannerImageId || ''}
                  onChange={(e) => setPost({ ...post, bannerImageId: e.target.value || null })}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">No image</option>
                  {images.map((image) => (
                    <option key={image.id} value={image.id}>
                      {image.title || image.url.split('/').pop()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={post.categoryIds.includes(category.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setPost({
                          ...post,
                          categoryIds: [...post.categoryIds, category.id],
                        })
                      } else {
                        setPost({
                          ...post,
                          categoryIds: post.categoryIds.filter(id => id !== category.id),
                        })
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <Input
                  value={post.seoTitle}
                  onChange={(e) => setPost({ ...post, seoTitle: e.target.value })}
                  placeholder="Optimized title for search engines"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  value={post.seoDescription}
                  onChange={(e) => setPost({ ...post, seoDescription: e.target.value })}
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Meta description for search results"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL
                </label>
                <Input
                  value={post.canonicalUrl}
                  onChange={(e) => setPost({ ...post, canonicalUrl: e.target.value })}
                  placeholder="https://example.com/original-post"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}