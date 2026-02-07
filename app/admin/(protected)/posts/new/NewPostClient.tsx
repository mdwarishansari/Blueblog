'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Category, UserRole } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { Save, Send, CheckCircle, Upload, RefreshCw, X, ImageIcon, FileText, Tag, Search, Sparkles } from 'lucide-react'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

// Compress image to target size
async function compressImage(file: File, targetSizeKB: number = 500): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        const maxDimension = 1920
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)

        let quality = 0.8
        const targetBytes = targetSizeKB * 1024

        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file)
                return
              }
              if (blob.size > targetBytes && quality > 0.3) {
                quality -= 0.1
                tryCompress()
              } else {
                resolve(blob)
              }
            },
            'image/jpeg',
            quality
          )
        }

        tryCompress()
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export default function NewPostClient({ userRole }: { userRole: UserRole }) {
  const isWriter = userRole === 'WRITER'
  const isAdminOrEditor = userRole === 'ADMIN' || userRole === 'EDITOR'
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [postId, setPostId] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [image, setImage] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [uploadPhase, setUploadPhase] = useState<'idle' | 'compressing' | 'uploading' | 'done'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const [post, setPost] = useState<any>({
    title: '',
    slug: '',
    excerpt: '',
    content: { type: 'doc', content: [] },
    categoryIds: [],
    seoTitle: '',
    seoDescription: '',
    canonicalUrl: '',
  })

  useEffect(() => {
    if (!slugTouched && post.title) {
      setPost((p: any) => ({ ...p, slug: slugify(p.title) }))
    }
  }, [post.title, slugTouched])

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCategories)
  }, [])

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024
  const ALLOWED_TYPES = ['image/jpeg', 'image/png']

  function validateImage(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPG and PNG images are allowed'
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return 'Image size must be less than 5MB'
    }
    return null
  }

  const seoScore = useMemo(() => {
    let score = 0
    if (post.seoTitle.length >= 40) score += 25
    if (post.seoDescription.length >= 120) score += 25
    if (post.slug.length > 0) score += 20
    if (post.excerpt.length >= 50) score += 15
    if (post.categoryIds.length > 0) score += 15
    return Math.min(score, 100)
  }, [post])

  async function uploadImage(file: File) {
    const error = validateImage(file)
    if (error) {
      setUploadError(error)
      toast.error(error)
      return
    }

    setUploadError(null)
    setUploading(true)
    setUploadPhase('compressing')
    setUploadProgress(0)

    try {
      let fileToUpload: Blob = file
      if (file.size > 500 * 1024) {
        fileToUpload = await compressImage(file, 500)
        setUploadProgress(30)
      }

      setUploadPhase('uploading')
      const formData = new FormData()
      formData.append('file', fileToUpload, file.name)

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/upload/cloudinary')

        xhr.upload.onprogress = e => {
          if (e.lengthComputable) {
            setUploadProgress(30 + Math.round((e.loaded / e.total) * 60))
          }
        }

        xhr.onload = () => {
          const res = JSON.parse(xhr.responseText)
          if (xhr.status >= 400) reject(res.message)
          else {
            setImage(res.image)
            setUploadProgress(100)
            setUploadPhase('done')
            resolve()
          }
        }

        xhr.onerror = () => reject('Upload failed')
        xhr.send(formData)
      })

      toast.success('Image uploaded')
    } catch (err: any) {
      toast.error(err)
      setUploadPhase('idle')
    } finally {
      setUploading(false)
    }
  }

  function removeImage() {
    setImage(null)
    setUploadPhase('idle')
    setUploadProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function save(status: 'DRAFT' | 'PUBLISHED' | 'VERIFICATION_PENDING') {
    setSaving(true)

    const res = await fetch(
      postId ? `/api/admin/posts/${postId}` : '/api/admin/posts',
      {
        method: postId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...post,
          bannerImageId: image?.id || null,
          status,
          publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : undefined,
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.message || 'Failed to save post')
      setSaving(false)
      return
    }

    const messages = {
      DRAFT: 'Draft saved',
      PUBLISHED: 'Post published',
      VERIFICATION_PENDING: 'Sent for verification',
    }
    toast.success(messages[status])

    if (!postId) setPostId(data.post.id)

    if (image?.id) {
      await fetch(`/api/images/${image.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(image),
      })
    }

    setSaving(false)

    // Always redirect after any action
    router.replace('/admin/posts')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3 animate-fade-in">
      {/* ================= MAIN CONTENT ================= */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Create New Post</h1>
            <p className="text-sm text-muted-foreground">
              {isWriter ? 'Write and submit for review' : 'Create and publish content'}
            </p>
          </div>
        </div>

        {/* Title Card */}
        <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg border border-gray-100">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Post Title
          </label>
          <Input
            value={post.title}
            onChange={e => setPost({ ...post, title: e.target.value })}
            placeholder="Enter an engaging title..."
            className="text-lg font-medium"
          />
        </div>

        {/* Slug Card */}
        <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            URL Slug
          </label>
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <span className="text-sm text-muted-foreground">/blog/</span>
            <input
              value={post.slug}
              onChange={e => {
                setSlugTouched(true)
                setPost({ ...post, slug: slugify(e.target.value) })
              }}
              className="flex-1 bg-transparent outline-none text-sm font-mono"
              placeholder="your-post-slug"
            />
          </div>
        </div>

        {/* Excerpt Card */}
        <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Excerpt
          </label>
          <textarea
            value={post.excerpt}
            onChange={e => setPost({ ...post, excerpt: e.target.value })}
            placeholder="Write a brief summary that appears in post previews..."
            className="w-full rounded-lg bg-gray-50 p-3 min-h-[80px] resize-none"
          />
        </div>

        {/* Content Card */}
        <div className="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <label className="mb-3 block text-sm font-semibold text-gray-700">
            Content
          </label>
          <Editor
            value={post.content}
            onChange={v => setPost({ ...post, content: v })}
          />
        </div>

        <Button variant="ghost" onClick={() => router.push('/admin/posts')} className="gap-2">
          ← Back to Posts
        </Button>
      </div>

      {/* ================= SIDEBAR ================= */}
      <div className="space-y-6">
        {/* Image Upload Card */}
        <div className="rounded-2xl bg-gradient-to-br from-white to-indigo-50/30 p-5 shadow-lg border border-indigo-100/50">
          <label className="text-sm font-semibold flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
              <ImageIcon className="h-4 w-4 text-indigo-600" />
            </div>
            Featured Image
          </label>

          <input
            ref={fileInputRef}
            id="post-image"
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) uploadImage(file)
            }}
          />

          {!image ? (
            <>
              <label
                htmlFor="post-image"
                className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 cursor-pointer hover:border-indigo-400 hover:shadow-md ui-transition group"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:scale-110 ui-transition">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">Click to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG or PNG • Up to 5MB
                  </p>
                </div>
              </label>

              {uploading && (
                <div className="mt-4 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-indigo-600">
                      {uploadPhase === 'compressing' && '✨ Compressing...'}
                      {uploadPhase === 'uploading' && '🚀 Uploading...'}
                    </span>
                    <span className="text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadError && (
                <p className="mt-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{uploadError}</p>
              )}
            </>
          ) : (
            <>
              <div className="relative group rounded-xl overflow-hidden shadow-md">
                <img
                  src={image.url}
                  alt={image.altText || 'Preview'}
                  className="w-full rounded-xl"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 ui-transition flex items-end justify-center gap-2 p-4">
                  <label
                    htmlFor="post-image"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 backdrop-blur text-gray-900 text-sm font-medium cursor-pointer hover:bg-white ui-transition shadow-lg"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Replace
                  </label>
                  <button
                    onClick={removeImage}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 ui-transition shadow-lg"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Alt Text (SEO)
                  </label>
                  <Input
                    placeholder="Describe the image..."
                    value={image.altText || ''}
                    onChange={e => setImage({ ...image, altText: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Title
                  </label>
                  <Input
                    placeholder="Image title..."
                    value={image.title || ''}
                    onChange={e => setImage({ ...image, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Caption
                  </label>
                  <textarea
                    placeholder="Optional caption..."
                    value={image.caption || ''}
                    onChange={e => setImage({ ...image, caption: e.target.value })}
                    className="w-full rounded-lg bg-gray-50 p-2 text-sm border resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Categories Card */}
        <div className="rounded-2xl bg-white p-5 shadow-lg border border-gray-100">
          <label className="text-sm font-semibold flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
              <Tag className="h-4 w-4 text-purple-600" />
            </div>
            Categories
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map(c => (
              <label key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ui-transition">
                <input
                  type="checkbox"
                  checked={post.categoryIds.includes(c.id)}
                  onChange={e =>
                    setPost((p: any) => ({
                      ...p,
                      categoryIds: e.target.checked
                        ? [...p.categoryIds, c.id]
                        : p.categoryIds.filter((x: string) => x !== c.id),
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* SEO Card */}
        <div className="rounded-2xl bg-white p-5 shadow-lg border border-gray-100">
          <label className="text-sm font-semibold flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
              <Search className="h-4 w-4 text-green-600" />
            </div>
            SEO Settings
          </label>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">SEO Score</span>
              <span className={`text-xs font-semibold ${seoScore >= 70 ? 'text-green-600' : seoScore >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                {seoScore}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${seoScore >= 70 ? 'bg-green-500' : seoScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${seoScore}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                SEO Title (40–60 chars)
              </label>
              <Input
                placeholder="Optimized page title..."
                value={post.seoTitle}
                onChange={e => setPost({ ...post, seoTitle: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Meta Description (120–160 chars)
              </label>
              <textarea
                placeholder="Compelling description for search results..."
                value={post.seoDescription}
                onChange={e => setPost({ ...post, seoDescription: e.target.value })}
                className="w-full rounded-lg bg-gray-50 p-2 text-sm border resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white">Actions</span>
          </div>

          <div className="space-y-3">
            {/* Save Draft - Available for all roles */}
            <Button
              loading={saving}
              disabled={uploading}
              onClick={() => save('DRAFT')}
              variant="outline"
              className="w-full gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>

            {/* Publish - Only for Admin/Editor */}
            {isAdminOrEditor && (
              <Button
                loading={saving}
                disabled={uploading}
                onClick={() => save('PUBLISHED')}
                className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg"
              >
                <CheckCircle className="h-4 w-4" />
                Publish Now
              </Button>
            )}

            {/* Send for Verification - Only for Writer */}
            {isWriter && (
              <Button
                loading={saving}
                disabled={uploading}
                onClick={() => save('VERIFICATION_PENDING')}
                className="w-full gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg"
              >
                <Send className="h-4 w-4" />
                Send for Verification
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
