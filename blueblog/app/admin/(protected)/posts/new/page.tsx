'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Category, UserRole } from '@prisma/client'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

export default function NewPostPage() {
  const userRole: UserRole = 'WRITER'

  const canPublish = userRole !== 'WRITER'
const [postId, setPostId] = useState<string | null>(null)

  const [slugTouched, setSlugTouched] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [image, setImage] = useState<any>(null)
  const [saving, setSaving] = useState(false)

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

  /** Slug auto-gen (single source of truth) */
  useEffect(() => {
    if (!slugTouched && post.title) {
      setPost((p: any) => ({ ...p, slug: slugify(p.title) }))
    }
  }, [post.title, slugTouched])

  /** Load categories */
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  /** SEO score (realistic) */
  const seoScore = useMemo(() => {
    let s = 0
    if (post.seoTitle.length >= 40 && post.seoTitle.length <= 60) s += 40
    if (post.seoDescription.length >= 120 && post.seoDescription.length <= 160) s += 40
    if (post.slug) s += 20
    return s
  }, [post])

  async function uploadImage(file: File) {
    const fd = new FormData()
    fd.append('file', file)

    const res = await fetch('/api/upload/cloudinary', { method: 'POST', body: fd })
    const data = await res.json()

    if (!res.ok) throw new Error(data.message)
    setImage(data.image)
  }

  async function save(publish: boolean) {
  setSaving(true)

  const url = postId
    ? `/api/admin/posts/${postId}`
    : '/api/admin/posts'

  const method = postId ? 'PUT' : 'POST'

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...post,
      bannerImageId: image?.id || null,
      status: publish ? 'PUBLISHED' : 'DRAFT',
      publishedAt: publish ? new Date().toISOString() : undefined,

    }),
  })

  const data = await res.json()

  if (!res.ok) {
    toast.error(data.message || 'Failed to save post')
  } else {
    toast.success(publish ? 'Post published' : 'Draft saved')

    // 🔥 IMPORTANT: store postId after first save
    if (!res.ok) {
  toast.error(data.message || 'Failed to save post')
} else {
  toast.success(publish ? 'Post published' : 'Draft saved')

  // store postId after first save
  if (!postId) {
    setPostId(data.post.id)
  }

  // 🔥 SAVE IMAGE METADATA
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
}

  }

  setSaving(false)
}


  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* MAIN */}
      <div className="lg:col-span-2 space-y-4">
        <Input
          placeholder="Post title"
          value={post.title}
          onChange={e => setPost({ ...post, title: e.target.value })}
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
          placeholder="Short excerpt"
          value={post.excerpt}
          onChange={e => setPost({ ...post, excerpt: e.target.value })}
          className="w-full rounded border p-2 bg-background"
        />

        <Editor value={post.content} onChange={v => setPost({ ...post, content: v })} />
      </div>

      {/* SIDEBAR */}
      <div className="space-y-6">
        {/* Image */}
        <div className="rounded border p-4">
          <input
            type="file"
            accept="image/*"
            onChange={e => e.target.files && uploadImage(e.target.files[0])}
          />

          {image && (
  <>
    <img src={image.url} className="rounded mt-2" />

    <Input
      placeholder="Alt text (SEO – very important)"
      value={image.altText || ''}
      onChange={e => setImage({ ...image, altText: e.target.value })}
    />

    <Input
      placeholder="Image title"
      value={image.title || ''}
      onChange={e => setImage({ ...image, title: e.target.value })}
    />

    <textarea
      placeholder="Image caption (optional)"
      value={image.caption || ''}
      onChange={e => setImage({ ...image, caption: e.target.value })}
      className="w-full rounded border p-2 bg-background"
      rows={2}
    />
  </>
)}

        </div>

        {/* Categories */}
        <div className="rounded border p-4">
          {categories.map(c => (
            <label key={c.id} className="flex gap-2">
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
              />
              {c.name}
            </label>
          ))}
        </div>

        {/* SEO */}
        <div className="rounded border p-4 space-y-2">
          <div className="h-2 bg-muted rounded">
            <div className="h-full bg-green-500" style={{ width: `${seoScore}%` }} />
          </div>

          <Input
            placeholder="SEO title"
            value={post.seoTitle}
            onChange={e => setPost({ ...post, seoTitle: e.target.value })}
          />

          <textarea
            placeholder="SEO description"
            value={post.seoDescription}
            onChange={e => setPost({ ...post, seoDescription: e.target.value })}
            className="w-full rounded border p-2 bg-background"
          />
        </div>

        <Button onClick={() => save(false)} loading={saving}>Save Draft</Button>
        {canPublish && <Button onClick={() => save(true)}>Publish</Button>}
      </div>
    </div>
  )
}