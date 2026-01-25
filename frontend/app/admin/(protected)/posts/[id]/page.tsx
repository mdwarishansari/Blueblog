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

  const [me, setMe] = useState<any>(null)
const role = me?.role as UserRole | undefined

const isWriter = role === 'WRITER'
const canSchedule = role === 'ADMIN' || role === 'EDITOR' || role === 'WRITER'
const canPublish = role === 'ADMIN' || role === 'EDITOR'


  const { id } = use(params)
  const router = useRouter()

const [scheduledAt, setScheduledAt] = useState<string>('')

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
/* ---------------- LOAD ME ---------------- */
  useEffect(() => {
  apiGet('/auth/me')
    .then(res => {
      const user = res.data?.user || res.data || res
      setMe(user)
    })
    .catch(() => setMe(null))
}, [])

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    async function load() {
      try {
        const [catsData, postData] = await Promise.all([
          apiGet('/categories'),
          apiGet(`/admin/posts/${id}`),
        ])

        const cats =
  Array.isArray(catsData) ? catsData :
  Array.isArray(catsData.data) ? catsData.data :
  Array.isArray(catsData.data?.categories) ? catsData.data.categories :
  Array.isArray(catsData.data?.data) ? catsData.data.data :
  []
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

        if (post.status === 'SCHEDULED' && post.scheduledAt) {
  const localDate = new Date(post.scheduledAt)
  setScheduledAt(localDate.toISOString().slice(0, 16))
} else {
  setScheduledAt('')
}


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
const MAX_INPUT_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

async function compressImage(file: File): Promise<File> {
  const imageCompression = (await import('browser-image-compression')).default

  return imageCompression(file, {
    maxSizeMB: 0.5, // ~500KB
    maxWidthOrHeight: 2000,
    useWebWorker: true,
  })
}

async function uploadImage(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error('Only JPG and PNG images allowed')
    return
  }

  if (file.size > MAX_INPUT_IMAGE_SIZE) {
    toast.error('Image must be between 1–5MB')
    return
  }

  setUploading(true)
  setUploadError(null)

  try {
    const compressed = await compressImage(file)

    const formData = new FormData()
    formData.append('file', compressed)
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    )

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || 'Upload failed')
    }

    const data = await res.json()

    setImage({
      url: data.secure_url,
      width: data.width,
      height: data.height,
      altText: '',
      title: '',
      caption: '',
    })

    toast.success('Image uploaded')
  } catch (err: any) {
    toast.error(err.message || 'Upload failed')
    setUploadError(err.message)
  } finally {
    setUploading(false)
  }
}


  /* ---------------- SAVE ---------------- */
  async function save(publish: boolean) {
    setSaving(true)

    try {
    const payload: any = {
  title: post.title,
  excerpt: post.excerpt || undefined,
  content: post.content,
  categoryIds: post.categoryIds,
  bannerImageId: image?.id || undefined,
  seoTitle: post.seoTitle || undefined,
  seoDescription: post.seoDescription || undefined,
  canonicalUrl: post.canonicalUrl || undefined,
}

// ===== STATUS LOGIC (SAME AS NEW PAGE) =====
if (isWriter) {
  payload.status = publish ? 'VERIFICATION_PENDING' : 'DRAFT'
  if (scheduledAt) {
    payload.scheduledAt = new Date(scheduledAt).toISOString()
  }
} else {
  if (scheduledAt) {
    payload.status = 'SCHEDULED'
    payload.scheduledAt = new Date(scheduledAt).toISOString()
  } else {
    payload.status = publish ? 'PUBLISHED' : 'DRAFT'
  }
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

  if (!me) {
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

        {canSchedule && (

  <div className="rounded-xl bg-card p-4 elev-sm space-y-2">
    <label className="text-sm font-medium">
      Schedule publication (optional)
    </label>
    <input
      type="datetime-local"
      value={scheduledAt}
      onChange={e => setScheduledAt(e.target.value)}
      className="w-full rounded-lg border p-2"
    />
  </div>
)}

        {/* ACTIONS */}
        <div className="flex gap-2">
  <Button loading={saving} onClick={() => save(false)} className="flex-1">
    Save Draft
  </Button>

  {isWriter ? (
    <Button loading={saving} onClick={() => save(true)} className="flex-1">
      Send for Verification
    </Button>
  ) : (
    <Button loading={saving} onClick={() => save(true)} className="flex-1">
      {scheduledAt ? 'Schedule Post' : 'Publish'}
    </Button>
  )}
</div>

      </div>
    </div>
  )
}
