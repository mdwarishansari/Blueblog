'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ImageUploadField } from '@/components/ui/ImageUploadField'
import { Category, UserRole } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { Send, Save, CheckCircle, ImageIcon, FileText, Tag, Search } from 'lucide-react'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

interface Props {
  userRole: UserRole
  postId: string
}

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

export default function EditPostClient({ postId, userRole }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isWriter = userRole === 'WRITER'
  const isAdminOrEditor = userRole === 'ADMIN' || userRole === 'EDITOR'

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [slugTouched, setSlugTouched] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [image, setImage] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState<string>('DRAFT')
  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'write' | 'preview' | 'split'>('write')

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
    async function load() {
      try {
        const [catRes, postRes] = await Promise.all([
          fetch('/api/categories'),
          fetch(`/api/admin/posts/${postId}`),
        ])

        if (!catRes.ok || !postRes.ok) throw new Error()

        const cats = await catRes.json()
        const postData = await postRes.json()

        setCategories(cats)

        let initialPost = {
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt || '',
          content: postData.content,
          categoryIds: postData.categories.map((c: Category) => c.id),
          seoTitle: postData.seoTitle || '',
          seoDescription: postData.seoDescription || '',
          canonicalUrl: postData.canonicalUrl || '',
        }
        let initialImage = postData.bannerImage || null

        // Check if there is an auto-saved draft
        const saved = localStorage.getItem(`blueblog_draft_${postId}`)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            initialPost = parsed.post
            if (parsed.image) initialImage = parsed.image
            setAutoSavedTime(parsed.time)
            toast.success('Restored auto-saved draft')
          } catch {}
        }

        setPost(initialPost)
        setImage(initialImage)
        setCurrentStatus(postData.status || 'DRAFT')
      } catch {
        toast.error('Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [postId])

  // Auto-save changes to localStorage
  useEffect(() => {
    if (loading) return
    if (!post.title && !post.excerpt && (!post.content || !post.content.content || post.content.content.length === 0)) return

    const t = setTimeout(() => {
      const timeStr = new Date().toLocaleTimeString()
      localStorage.setItem(
        `blueblog_draft_${postId}`,
        JSON.stringify({ post, image, time: timeStr })
      )
      setAutoSavedTime(timeStr)
    }, 1500)

    return () => clearTimeout(t)
  }, [post, image, loading, postId])

  useEffect(() => {
    if (!slugTouched && post.title) {
      setPost((p: any) => ({ ...p, slug: slugify(p.title) }))
    }
  }, [post.title, slugTouched])

  const seoScore = useMemo(() => {
    let score = 0
    if (post.seoTitle.length >= 40) score += 25
    if (post.seoDescription.length >= 120) score += 25
    if (post.slug) score += 20
    if (post.excerpt.length >= 50) score += 15
    if (post.categoryIds.length > 0) score += 15
    return Math.min(score, 100)
  }, [post])

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

  function validateImage(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPG, PNG and WEBP images are allowed'
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return 'Image size must be less than 10MB'
    }
    return null
  }

  async function uploadImage(file: File) {
    const error = validateImage(file)
    if (error) {
      toast.error(error)
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      let fileToUpload: Blob = file
      if (file.size > 500 * 1024) {
        fileToUpload = await compressImage(file, 500)
        setUploadProgress(30)
      }

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
             resolve()
          }
        }

        xhr.onerror = () => reject('Upload failed')
        xhr.send(formData)
      })

      toast.success('Image uploaded')
    } catch (err: any) {
      toast.error(err)
    } finally {
      setUploading(false)
    }
  }

  function removeImage() {
    setImage(null)
    setUploadProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function save(status: 'DRAFT' | 'PUBLISHED' | 'VERIFICATION_PENDING') {
    setSaving(true)

    const res = await fetch(`/api/admin/posts/${postId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...post,
        bannerImageId: image?.id || null,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : undefined,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.message || 'Failed to save')
      setSaving(false)
      return
    }

    if (image?.id) {
      await fetch(`/api/images/${image.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          altText: image.altText,
          title: image.title,
          caption: image.caption,
        }),
      })
    }

    const messages = {
      DRAFT: 'Draft saved',
      PUBLISHED: 'Post published',
      VERIFICATION_PENDING: 'Sent for verification',
    }

    toast.success(messages[status])
    setSaving(false)

    // Clear auto-saved draft on successful save
    localStorage.removeItem(`blueblog_draft_${postId}`)

    // Always redirect after any action
    router.replace('/admin/posts')
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-canvas-cream border-t-electric-cobalt"></div>
          <span className="text-slate-gray">Loading post...</span>
        </div>
      </div>
    )
  }

  const getStatusBadgeVariant = () => {
    switch (currentStatus) {
      case 'PUBLISHED': return 'green'
      case 'VERIFICATION_PENDING': return 'blue'
      default: return 'secondary'
    }
  }

  const getStatusLabel = () => {
    switch (currentStatus) {
      case 'PUBLISHED': return 'Published'
      case 'VERIFICATION_PENDING': return 'Pending Review'
      default: return 'Draft'
    }
  }

  return (
    <div className="relative pb-24 min-h-full flex flex-col justify-between">
      <div className="grid gap-8 lg:grid-cols-3 animate-fade-in">
        {/* ================= MAIN CONTENT ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-canvas-cream border border-hairline">
              <FileText className="h-5 w-5 text-electric-cobalt" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-ink-charcoal">Edit Post</h1>
              <p className="text-sm text-slate-gray">
                {isWriter ? 'Edit and submit for review' : 'Edit and publish content'}
              </p>
            </div>
            <Badge variant={getStatusBadgeVariant()} className="px-3.5 py-1.5 text-sm rounded-full">
              {getStatusLabel()}
            </Badge>
          </div>

          {/* Title Card */}
          <Card variant="white" className="space-y-4">
            <label className="block text-sm font-semibold text-ink-charcoal">
              Post Title
            </label>
            <Input
              value={post.title}
              onChange={e => setPost({ ...post, title: e.target.value })}
              placeholder="Enter an engaging title..."
              className="text-lg font-medium"
            />
          </Card>

          {/* Slug Card */}
          <Card variant="white" className="space-y-4">
            <label className="block text-sm font-semibold text-ink-charcoal">
              URL Slug
            </label>
            <div className="flex items-center gap-2 rounded-[16px] bg-canvas-cream border border-hairline px-3 py-2">
              <span className="text-sm text-slate-gray">/blog/</span>
              <input
                value={post.slug}
                onChange={e => {
                  setSlugTouched(true)
                  setPost({ ...post, slug: slugify(e.target.value) })
                }}
                className="flex-1 bg-transparent outline-none text-sm font-mono text-ink-charcoal"
                placeholder="your-post-slug"
              />
            </div>
          </Card>

          {/* Excerpt Card */}
          <Card variant="white" className="space-y-4">
            <label className="block text-sm font-semibold text-ink-charcoal">
              Excerpt
            </label>
            <Textarea
              value={post.excerpt}
              onChange={e => setPost({ ...post, excerpt: e.target.value })}
              placeholder="Write a brief summary that appears in post previews..."
              className="bg-pure-white"
            />
          </Card>

          {/* Content Card */}
          <Card variant="white" className="space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <label className="block text-sm font-semibold text-ink-charcoal">
                Content
              </label>
              <div className="flex items-center gap-1 bg-canvas-cream border border-hairline p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewMode('write')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    previewMode === 'write'
                      ? 'bg-pure-white text-ink-charcoal shadow-sm border border-hairline'
                      : 'text-slate-gray hover:text-ink-charcoal'
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('preview')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    previewMode === 'preview'
                      ? 'bg-pure-white text-ink-charcoal shadow-sm border border-hairline'
                      : 'text-slate-gray hover:text-ink-charcoal'
                  }`}
                >
                  Preview
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('split')}
                  className={`hidden md:block px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    previewMode === 'split'
                      ? 'bg-pure-white text-ink-charcoal shadow-sm border border-hairline'
                      : 'text-slate-gray hover:text-ink-charcoal'
                  }`}
                >
                  Split
                </button>
              </div>
            </div>

            <div className={previewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}>
              {(previewMode === 'write' || previewMode === 'split') && (
                <div className="space-y-2">
                  {previewMode === 'split' && <span className="text-xs font-medium text-slate-gray">Editor</span>}
                  <Editor
                    value={post.content}
                    onChange={v => setPost({ ...post, content: v })}
                  />
                </div>
              )}
              {(previewMode === 'preview' || previewMode === 'split') && (
                <div className="space-y-2">
                  {previewMode === 'split' && <span className="text-xs font-medium text-slate-gray">Real-time Preview</span>}
                  <div className="border border-hairline rounded-[16px] bg-canvas-cream/35 p-5 min-h-[360px] max-h-[600px] overflow-y-auto">
                    <Editor
                      value={post.content}
                      readOnly
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* ================= SIDEBAR ================= */}
        <div className="space-y-6">
          {/* Image Upload Card */}
          <Card variant="white" className="space-y-4">
            <label className="text-sm font-semibold flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas-cream border border-hairline">
                <ImageIcon className="h-4 w-4 text-electric-cobalt" />
              </div>
              Featured Image
            </label>
            <ImageUploadField
              typeLabel="Post Image"
              currentImageUrl={image?.url}
              onFileSelect={uploadImage}
              onClear={removeImage}
              maxSizeMB={10}
              allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
              uploading={uploading}
              progress={uploadProgress}
            />
            {image && (
              <div className="space-y-3 mt-4 pt-4 border-t border-hairline">
                <div>
                  <label className="block text-xs font-medium text-slate-gray mb-1.5">
                    Alt Text (SEO)
                  </label>
                  <Input
                    placeholder="Describe the image..."
                    value={image.altText || ''}
                    onChange={e => setImage({ ...image, altText: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-gray mb-1.5">
                    Title
                  </label>
                  <Input
                    placeholder="Image title..."
                    value={image.title || ''}
                    onChange={e => setImage({ ...image, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-gray mb-1.5">
                    Caption
                  </label>
                  <Textarea
                    placeholder="Optional caption..."
                    value={image.caption || ''}
                    onChange={e => setImage({ ...image, caption: e.target.value })}
                    className="bg-pure-white min-h-[60px]"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </Card>

          {/* Categories Card */}
          <Card variant="white" className="space-y-4">
            <label className="text-sm font-semibold flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas-cream border border-hairline">
                <Tag className="h-4 w-4 text-electric-cobalt" />
              </div>
              Categories
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map(c => (
                <label key={c.id} className="flex items-center gap-3 p-2 rounded-[12px] hover:bg-surface-ivory cursor-pointer ui-transition">
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
                    className="h-4 w-4 rounded-[4px] border-hairline text-electric-cobalt focus:ring-electric-cobalt"
                  />
                  <span className="text-sm text-ink-charcoal">{c.name}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* SEO Card */}
          <Card variant="white" className="space-y-4">
            <label className="text-sm font-semibold flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-canvas-cream border border-hairline">
                <Search className="h-4 w-4 text-electric-cobalt" />
              </div>
              SEO Settings
            </label>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-gray">SEO Score</span>
                <span className={`text-xs font-semibold ${seoScore >= 70 ? 'text-forest' : seoScore >= 40 ? 'text-electric-cobalt' : 'text-slate-gray'}`}>
                  {seoScore}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-canvas-cream border border-hairline overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${seoScore >= 70 ? 'bg-forest' : seoScore >= 40 ? 'bg-electric-cobalt' : 'bg-slate-gray'}`}
                  style={{ width: `${seoScore}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-gray mb-1.5">
                  SEO Title (40–60 chars)
                </label>
                <Input
                  placeholder="Optimized page title..."
                  value={post.seoTitle}
                  onChange={e => setPost({ ...post, seoTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-gray mb-1.5">
                  Meta Description (120–160 chars)
                </label>
                <Textarea
                  placeholder="Compelling description for search results..."
                  value={post.seoDescription}
                  onChange={e => setPost({ ...post, seoDescription: e.target.value })}
                  className="bg-pure-white"
                  rows={3}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-8 border-t border-hairline bg-pure-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] rounded-b-[24px]">
        <Button
          variant="ghost"
          onClick={() => {
            if (confirm('Discard changes and leave?')) {
              localStorage.removeItem(`blueblog_draft_${postId}`)
              router.push('/admin/posts')
            }
          }}
          className="gap-2 hover:bg-canvas-cream border border-hairline rounded-full"
        >
          Cancel
        </Button>

        <div className="flex items-center gap-4">
          {autoSavedTime && (
            <span className="text-xs text-slate-gray flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-forest animate-pulse" />
              Auto-saved at {autoSavedTime}
            </span>
          )}

          <div className="flex items-center gap-2">
            <Button
              loading={saving}
              disabled={uploading}
              onClick={() => save('DRAFT')}
              variant="outline"
              className="gap-2 border-hairline bg-pure-white hover:bg-canvas-cream text-ink-charcoal rounded-full"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>

            {isAdminOrEditor ? (
              <Button
                loading={saving}
                disabled={uploading}
                onClick={() => save('PUBLISHED')}
                className="gap-2 rounded-full"
              >
                <CheckCircle className="h-4 w-4" />
                Publish
              </Button>
            ) : (
              isWriter && currentStatus !== 'PUBLISHED' && (
                <Button
                  loading={saving}
                  disabled={uploading}
                  onClick={() => save('VERIFICATION_PENDING')}
                  className="gap-2 rounded-full"
                >
                  <Send className="h-4 w-4" />
                  {currentStatus === 'VERIFICATION_PENDING' ? 'Resubmit Review' : 'Submit for Review'}
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
