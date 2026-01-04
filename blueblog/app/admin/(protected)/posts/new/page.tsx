'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Save, Eye, Image as ImageIcon } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Category, Image as ImageType, UserRole } from '@prisma/client'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

/* ----------------------------- TYPES ----------------------------- */

interface PostData {
  title: string
  slug: string
  excerpt: string
  content: string
  bannerImageId: string | null
  seoTitle: string
  seoDescription: string
  canonicalUrl: string
  categoryIds: string[]
}

/* ----------------------------- HELPERS ---------------------------- */

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')

/* ------------------------------ PAGE ------------------------------ */

export default function NewPostPage() {
  const router = useRouter()

  // ⚠️ TEMP: replace with real user from auth context
  const userRole: UserRole = 'ADMIN' // WRITER | EDITOR | ADMIN
const [slugTouched, setSlugTouched] = useState(false)

  const canPublish = userRole === 'ADMIN' || userRole === 'EDITOR'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ImageType[]>([])

  const [post, setPost] = useState<PostData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    bannerImageId: null,
    seoTitle: '',
    seoDescription: '',
    canonicalUrl: '',
    categoryIds: [],
  })
useEffect(() => {
  if (!slugTouched && post.title) {
    setPost(p => ({ ...p, slug: slugify(p.title) }))
  }
}, [post.title, slugTouched])

  /* --------------------------- LOAD META --------------------------- */

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, iRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/upload/cloudinary'),
        ])

        if (cRes.ok) setCategories(await cRes.json())
        if (iRes.ok) setImages((await iRes.json()).images ?? [])
      } catch {
        toast.error('Failed to load editor data')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  /* --------------------------- AUTO SLUG --------------------------- */

  useEffect(() => {
    if (!post.slug && post.title) {
      setPost(p => ({ ...p, slug: slugify(p.title) }))
    }
  }, [post.title])

  /* --------------------------- SEO SCORE --------------------------- */

  const seoScore = useMemo(() => {
    let score = 0
    if (post.seoTitle.length >= 40) score += 40
    if (post.seoDescription.length >= 120) score += 40
    if (post.slug.length > 0) score += 20
    return score
  }, [post])

  /* --------------------------- SAVE --------------------------- */

  const savePost = async (publish: boolean) => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...post,
          slug: post.slug || slugify(post.title),
          status: publish ? 'PUBLISHED' : 'DRAFT',
          publishedAt: publish ? new Date().toISOString() : null,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success(publish ? 'Post published 🎉' : 'Draft saved')
      router.push(`/admin/posts/${data.post.id}`)
    } catch (e: any) {
      toast.error(e.message || 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  /* --------------------------- UI --------------------------- */

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading editor…</div>
  }

  const selectedImage = images.find(i => i.id === post.bannerImageId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create New Post</h1>
          <p className="text-gray-600">Draft or publish based on your role</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            loading={saving}
            onClick={() => savePost(false)}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>

          {canPublish && (
            <Button loading={saving} onClick={() => savePost(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* MAIN */}
        <div className="lg:col-span-2 space-y-6">
          <Input
            placeholder="Post title"
            value={post.title}
            onChange={e => setPost({ ...post, title: e.target.value })}
            className="text-2xl font-bold"
          />

          <Input
  placeholder="post-slug"
  value={post.slug}
  onChange={e => {
    setSlugTouched(true)
    setPost({ ...post, slug: slugify(e.target.value) })
  }}
/>


          <textarea
            rows={3}
            placeholder="Short excerpt (used in SEO & previews)"
            value={post.excerpt}
            onChange={e => setPost({ ...post, excerpt: e.target.value })}
            className="w-full rounded-lg border px-3 py-2"
          />

          <Editor
            value={post.content}
            onChange={content => setPost({ ...post, content })}
          />
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* IMAGE */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Featured Image
            </h3>

            {selectedImage && (
              <img
                src={selectedImage.url}
                className="mb-3 rounded-lg"
                alt={selectedImage.altText || ''}
              />
            )}
{selectedImage && (
  <>
    <Input
      placeholder="Image title"
      value={selectedImage.title || ''}
      onChange={e =>
        setImages(imgs =>
          imgs.map(i =>
            i.id === selectedImage.id
              ? { ...i, title: e.target.value }
              : i
          )
        )
      }
    />

    <Input
      placeholder="Alt text (SEO)"
      value={selectedImage.altText || ''}
      onChange={e =>
        setImages(imgs =>
          imgs.map(i =>
            i.id === selectedImage.id
              ? { ...i, altText: e.target.value }
              : i
          )
        )
      }
    />
  </>
)}

            <select
              className="w-full rounded border px-2 py-2"
              value={post.bannerImageId || ''}
              onChange={e =>
                setPost({ ...post, bannerImageId: e.target.value || null })
              }
            >
              <option value="">Select image</option>
              {images.map(img => (
                <option key={img.id} value={img.id}>
                  {img.title || img.url.split('/').pop()}
                </option>
              ))}
            </select>
            <input
  type="file"
  accept="image/*"
  onChange={async e => {
    const file = e.target.files?.[0]
    if (!file) return

    const form = new FormData()
    form.append('file', file)

    const res = await fetch('/api/upload/cloudinary', {
      method: 'POST',
      body: form,
    })

    const data = await res.json()
    if (!res.ok) {
      toast.error(data.message || 'Upload failed')
      return
    }

    setImages(prev => [data.image, ...prev])
    setPost(p => ({ ...p, bannerImageId: data.image.id }))
    toast.success('Image uploaded')
  }}
/>

          </div>

          {/* CATEGORIES */}
          <div className="rounded-xl border bg-white p-6">
            <h3 className="font-semibold mb-3">Categories</h3>
            {categories.map(cat => (
              <label key={cat.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={post.categoryIds.includes(cat.id)}
                  onChange={e =>
                    setPost(p => ({
                      ...p,
                      categoryIds: e.target.checked
                        ? [...p.categoryIds, cat.id]
                        : p.categoryIds.filter(id => id !== cat.id),
                    }))
                  }
                />
                {cat.name}
              </label>
            ))}
          </div>

          {/* SEO */}
          <div className="rounded-xl border bg-white p-6 space-y-3">
            <h3 className="font-semibold">SEO</h3>

            <div className="h-2 rounded bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${seoScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">SEO score: {seoScore}/100</p>

            <Input
              placeholder="SEO title (40–60 chars)"
              value={post.seoTitle}
              onChange={e => setPost({ ...post, seoTitle: e.target.value })}
            />

            <textarea
              rows={3}
              placeholder="SEO description (120–160 chars)"
              value={post.seoDescription}
              onChange={e =>
                setPost({ ...post, seoDescription: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-2"
            />

            <Input
              placeholder="Canonical URL (optional)"
              value={post.canonicalUrl}
              onChange={e =>
                setPost({ ...post, canonicalUrl: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
