'use client'

import { useEffect, useMemo, useState, use } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Category, UserRole, Image as ImageType } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { apiGet, apiPut, apiUpload } from '@/lib/api'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

interface PageProps {
  params: Promise<{ id: string }>
  userRole: UserRole
}

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

export default function EditPostPage({ params, userRole }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  /** ✅ role-based publish (FIXED) */
  const canPublish = userRole !== 'WRITER'
const [uploading, setUploading] = useState(false)
const [uploadProgress, setUploadProgress] = useState(0)
const [uploadError, setUploadError] = useState<string | null>(null)

  const [slugTouched, setSlugTouched] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [image, setImage] = useState<ImageType | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

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

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    async function load() {
      try {
        const [catsData, postData] = await Promise.all([
          apiGet('/categories'),
          apiGet(`/admin/posts/${id}`),
        ])

        const cats = catsData.data?.categories || catsData.categories || catsData || []
        const post = postData.data?.post || postData.data || postData

        setCategories(cats)
        setPost({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          content: post.content,
          categoryIds: post.categories?.map((c: Category) => c.id) || [],
          seoTitle: post.seoTitle || '',
          seoDescription: post.seoDescription || '',
          canonicalUrl: post.canonicalUrl || '',
        })

        setImage(post.bannerImage || null)
      } catch {
        toast.error('Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  /* ---------------- SLUG AUTO ---------------- */
  useEffect(() => {
    if (!slugTouched && post.title) {
      setPost((p: any) => ({ ...p, slug: slugify(p.title) }))
    }
  }, [post.title, slugTouched])

  /* ---------------- SEO SCORE ---------------- */
  const seoScore = useMemo(() => {
    let score = 0
    if (post.seoTitle.length >= 40) score += 25
    if (post.seoDescription.length >= 120) score += 25
    if (post.slug) score += 20
    if (post.excerpt.length >= 50) score += 15
    if (post.categoryIds.length > 0) score += 15
    return Math.min(score, 100)
  }, [post])

  /* ---------------- IMAGE VALIDATION ---------------- */
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

/* ---------------- IMAGE UPLOAD ---------------- */
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
    const data = await apiUpload('/upload/image', formData)
    const image = data.data?.image || data.image || data.data
    if (image) {
      setImage(image)
    } else {
      throw new Error('Invalid response from server')
    }
  } catch (err: any) {
    toast.error(err.message || 'Upload failed')
    setUploadError(err.message || 'Upload failed')
  } finally {
    setUploading(false)
  }
}

  /* ---------------- SAVE ---------------- */
  async function save(publish: boolean) {
    setSaving(true)

    try {
      const payload = {
        ...post,
        bannerImageId: image?.id || null,
        status: publish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: publish ? new Date().toISOString() : undefined,
      }

      await apiPut(`/admin/posts/${id}`, payload)

      // Note: Image metadata update may need to be handled separately if backend supports it
      // if (image?.id) {
      //   await apiPut(`/admin/media/${image.id}`, {
      //     altText: image.altText,
      //     title: image.title,
      //     caption: image.caption,
      //   })
      // }

      toast.success(publish ? 'Post published' : 'Draft updated')

      if (publish) {
        router.replace('/admin/posts')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading…</div>
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ================= MAIN ================= */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <label className="text-sm font-medium">Post Title</label>
          <Input
            value={post.title}
            onChange={e => setPost({ ...post, title: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Slug</label>
          <Input
            value={post.slug}
            onChange={e => {
              setSlugTouched(true)
              setPost({ ...post, slug: slugify(e.target.value) })
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Excerpt</label>
          <textarea
            value={post.excerpt}
            onChange={e => setPost({ ...post, excerpt: e.target.value })}
            className="w-full rounded-lg bg-background p-3"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Content</label>
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

  {/* Instruction (always visible) */}
  <p className="text-xs text-muted-foreground">
    JPG or PNG only • Max size 1MB
  </p>

  {/* File input */}
  <input
    id="post-image"
    type="file"
    accept="image/png,image/jpeg"
    className="hidden"
    onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])}
  />

  <label
    htmlFor="post-image"
    className="inline-flex cursor-pointer rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/70 ui-transition"
  >
    Choose image
  </label>

  {/* Upload progress */}
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

  {/* Error */}
  {uploadError && (
    <p className="text-xs text-red-500">{uploadError}</p>
  )}

  {/* Preview + meta */}
  {image && (
    <>
      <img src={image.url} className="rounded-lg" />

      <Input
        placeholder="Alt text (SEO)"
        value={image.altText || ''}
        onChange={e =>
          setImage({ ...image, altText: e.target.value })
        }
      />

      <Input
        placeholder="Image title"
        value={image.title || ''}
        onChange={e =>
          setImage({ ...image, title: e.target.value })
        }
      />

      <textarea
        placeholder="Image caption"
        value={image.caption || ''}
        onChange={e =>
          setImage({ ...image, caption: e.target.value })
        }
        className="w-full rounded-lg bg-background p-2"
      />
    </>
  )}
</div>


        {/* CATEGORIES */}
        <div className="rounded-xl bg-card p-4 elev-sm space-y-2">
          <label className="text-sm font-medium">Categories</label>
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
          <label className="text-sm font-medium">SEO</label>

          <div className="h-2 rounded bg-muted overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${seoScore}%` }}
            />
          </div>

          <Input
            placeholder="SEO title"
            value={post.seoTitle}
            onChange={e => setPost({ ...post, seoTitle: e.target.value })}
          />

          <textarea
            placeholder="SEO description"
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
            <Button loading={saving} onClick={() => save(true)} className="flex-1">
              Publish
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
