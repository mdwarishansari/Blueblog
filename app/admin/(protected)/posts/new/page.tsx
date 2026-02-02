'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Category, UserRole } from '@prisma/client'
import { useRouter } from 'next/navigation'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

export default function NewPostPage({ userRole }: { userRole: UserRole }) {
  const canPublish = userRole !== 'WRITER'
  const router = useRouter()

  const [postId, setPostId] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [image, setImage] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const [uploading, setUploading] = useState(false)
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

  /* ---------- SLUG ---------- */
  useEffect(() => {
    if (!slugTouched && post.title) {
      setPost((p: any) => ({ ...p, slug: slugify(p.title) }))
    }
  }, [post.title, slugTouched])

  /* ---------- CATEGORIES ---------- */
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCategories)
  }, [])

  /* ---------- IMAGE VALIDATION---------- */
  const MAX_IMAGE_SIZE = 1 * 1024 * 1024 // 1MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

function validateImage(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPG and PNG images are allowed'
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'Image size must be less than 1MB'
  }
  return null
}

  /* ---------- SEO SCORE ---------- */
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
  setUploadProgress(0)

  const formData = new FormData()
  formData.append('file', file)

  try {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/upload/cloudinary')

      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => {
        const res = JSON.parse(xhr.responseText)
        if (xhr.status >= 400) reject(res.message)
        else {
          setImage(res.image)
          resolve()
        }
      }

      xhr.onerror = () => reject('Upload failed')

      xhr.send(formData)
    })
  } catch (err: any) {
    toast.error(err)
  } finally {
    setUploading(false)
  }
}


  async function save(publish: boolean) {
    setSaving(true)

    const res = await fetch(
      postId ? `/api/admin/posts/${postId}` : '/api/admin/posts',
      {
        method: postId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...post,
          bannerImageId: image?.id || null,
          status: publish ? 'PUBLISHED' : 'DRAFT',
          publishedAt: publish ? new Date().toISOString() : undefined,
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.message || 'Failed to save post')
    } else {
      toast.success(publish ? 'Post published' : 'Draft saved')

      if (publish) {
        router.replace('/admin/posts')
      }

      if (!postId) setPostId(data.post.id)

      if (image?.id) {
        await fetch(`/api/images/${image.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(image),
        })
      }
    }

    setSaving(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ================= MAIN ================= */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Post title</label>
          <Input
            value={post.title}
            onChange={e => setPost({ ...post, title: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <Input
            value={post.slug}
            onChange={e => {
              setSlugTouched(true)
              setPost({ ...post, slug: slugify(e.target.value) })
            }}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Excerpt</label>
          <textarea
            value={post.excerpt}
            onChange={e => setPost({ ...post, excerpt: e.target.value })}
            className="w-full rounded-lg bg-background p-3 shadow-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Content</label>
          <Editor
            value={post.content}
            onChange={v => setPost({ ...post, content: v })}
          />
        </div>

        <Button variant="ghost" onClick={() => router.push('/admin/posts')}>
          ← Back to Posts
        </Button>
      </div>

      {/* ================= SIDEBAR ================= */}
      <div className="space-y-6">
        {/* IMAGE */}
        <div className="rounded-xl bg-card p-4 elev-sm space-y-3">
  <label className="text-sm font-medium">Featured Image</label>

  <p className="text-xs text-muted-foreground">
    JPG or PNG only • Max size 1MB
  </p>

  <input
    id="post-image"
    type="file"
    accept="image/png,image/jpeg"
    className="hidden"
    onChange={e => {
      const file = e.target.files?.[0]
      if (file) uploadImage(file)
      e.target.value = ''
    }}
  />

  <label
    htmlFor="post-image"
    className="inline-flex cursor-pointer rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/70"
  >
    Choose image
  </label>

  {uploading && (
    <div className="space-y-1">
      <div className="h-2 rounded bg-muted overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all"
          style={{ width: `${uploadProgress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Uploading… {uploadProgress}%
      </p>
    </div>
  )}

  {uploadError && (
    <p className="text-xs text-red-500">{uploadError}</p>
  )}

  {image && (
    <>
      <img src={image.url} className="rounded-lg" />

      <Input
        placeholder="Alt text (SEO)"
        value={image.altText || ''}
        onChange={e => setImage({ ...image, altText: e.target.value })}
      />

      <Input
        placeholder="Image title"
        value={image.title || ''}
        onChange={e => setImage({ ...image, title: e.target.value })}
      />

      <textarea
        placeholder="Image caption"
        value={image.caption || ''}
        onChange={e => setImage({ ...image, caption: e.target.value })}
        className="w-full rounded-lg bg-background p-2"
      />
    </>
  )}
</div>


        {/* CATEGORIES */}
        <div className="rounded-xl bg-card p-4 elev-sm space-y-2">
          <label className="block text-sm font-medium">Categories</label>
          {categories.map(c => (
            <label key={c.id} className="flex gap-2 text-sm">
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
        <div className="rounded-xl bg-card p-4 elev-sm space-y-3">
          <label className="block text-sm font-medium">SEO</label>

          <div className="h-2 rounded bg-muted overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${seoScore}%` }}
            />
          </div>

          <Input
            placeholder="SEO title (40–60 chars)"
            value={post.seoTitle}
            onChange={e => setPost({ ...post, seoTitle: e.target.value })}
          />

          <textarea
            placeholder="SEO description (120–160 chars)"
            value={post.seoDescription}
            onChange={e =>
              setPost({ ...post, seoDescription: e.target.value })
            }
            className="w-full rounded-lg bg-background p-2"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <Button loading={saving} onClick={() => save(false)} className="flex-1">
            Save Draft
          </Button>

          {canPublish && (
            <Button 
            disabled={uploading}
            onClick={() => save(true)} 
            className="flex-1">
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
