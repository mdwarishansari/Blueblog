'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Category, UserRole } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { apiGet, apiPost, apiPut } from '@/lib/api'
import { ImagePlus } from 'lucide-react'
import imageCompression from 'browser-image-compression'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

export default function NewPostPage({ userRole }: { userRole: UserRole }) {
   const [me, setMe] = useState<any>(null)
  const role = me?.role as UserRole | undefined

const isWriter = role === 'WRITER'
const canSchedule = role === 'ADMIN' || role === 'EDITOR' || role === 'WRITER'
const canPublish = role === 'ADMIN' || role === 'EDITOR'



 

  const router = useRouter()

  const [scheduledAt, setScheduledAt] = useState<string>('')

  const [postId, setPostId] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)

  /* ---------------- IMAGE STATE ---------------- */
  const [image, setImage] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  /* ---------------- POST STATE ---------------- */
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
    apiGet('/categories')
      .then((res: any) => {
        const list =
          Array.isArray(res) ? res :
          Array.isArray(res.data) ? res.data :
          Array.isArray(res.data?.categories) ? res.data.categories :
          Array.isArray(res.data?.data) ? res.data.data :
          []
        setCategories(list)
      })
      .catch(() => setCategories([]))
  }, [])

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

  /* ---------- IMAGE CONSTANTS ---------- */
  const MAX_INPUT_IMAGE_SIZE = 5 * 1024 * 1024
  const ALLOWED_TYPES = ['image/jpeg', 'image/png']

  /* ---------- IMAGE COMPRESSION ---------- */
  async function compressImage(file: File): Promise<File> {
    return imageCompression(file, {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 2000,
      useWebWorker: true,
    })
  }

  /* ---------- IMAGE UPLOAD ---------- */
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

      const data = await res.json()
      if (!res.ok) throw new Error(data.error?.message || 'Upload failed')

      setImage({
        url: data.secure_url,
        publicId: data.public_id,
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
  /* ---------- FETCH ME ---------- */
  useEffect(() => {
  apiGet('/auth/me')
    .then(res => {
      const user = res.data?.user || res.data || res
      setMe(user)
    })
    .catch(() => setMe(null))
}, [])


  /* ---------- SAVE ---------- */
  async function save(publish: boolean) {
    setSaving(true)

    try {
      let imageId: string | undefined

      if (image) {
        const imgRes = await apiPost('/admin/images', image)
        imageId = imgRes.data.id
      }

      const payload: any = {
        title: post.title,
        excerpt: post.excerpt || undefined,
        content: post.content,
        categoryIds: post.categoryIds,
        bannerImageId: imageId,
        seoTitle: post.seoTitle || undefined,
        seoDescription: post.seoDescription || undefined,
        canonicalUrl: post.canonicalUrl || undefined,
      }

      // ===== STATUS LOGIC =====
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

      const res = postId
        ? await apiPut(`/admin/posts/${postId}`, payload)
        : await apiPost('/admin/posts', payload)

      toast.success(
        isWriter
          ? publish
            ? 'Sent for verification'
            : 'Draft saved'
          : scheduledAt
            ? 'Post scheduled'
            : publish
              ? 'Post published'
              : 'Draft saved'
      )

      if (!postId) setPostId(res.data.id)
      if (!isWriter && publish && !scheduledAt) {
        router.push('/admin/posts')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  /* ---------- UI ---------- */
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Input
          value={post.title}
          onChange={e => setPost({ ...post, title: e.target.value })}
          placeholder="Post title"
        />

        <textarea
          value={post.excerpt}
          onChange={e => setPost({ ...post, excerpt: e.target.value })}
          className="w-full rounded-lg p-3"
          placeholder="Excerpt"
        />

        <Editor
          value={post.content}
          onChange={v => setPost({ ...post, content: v })}
        />
      </div>

      <div className="space-y-6">
        {/* IMAGE */}
        <div className="rounded-xl bg-card p-4 space-y-3">
          <label className="text-sm font-medium">Featured Image</label>

          {!uploading && (
            <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed p-4">
              <ImagePlus className="h-5 w-5" />
              <span>{image ? 'Replace Image' : 'Choose Image (1–5MB)'}</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                hidden
                onChange={e =>
                  e.target.files && uploadImage(e.target.files[0])
                }
              />
            </label>
          )}

          {uploading && <p className="text-xs">Uploading…</p>}
          {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

          {image && !uploading && (
            <>
              <img src={image.url} className="rounded-lg" />
              <Input
                placeholder="Alt text"
                value={image.altText}
                onChange={e =>
                  setImage({ ...image, altText: e.target.value })
                }
              />
              <Input
                placeholder="Image title"
                value={image.title}
                onChange={e =>
                  setImage({ ...image, title: e.target.value })
                }
              />
              <textarea
                placeholder="Image caption"
                className="w-full rounded-lg p-2"
                value={image.caption}
                onChange={e =>
                  setImage({ ...image, caption: e.target.value })
                }
              />
            </>
          )}
        </div>

        {/* CATEGORIES */}
        <div className="rounded-xl bg-card p-4 space-y-2">
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
        <div className="rounded-xl bg-card p-4 space-y-3">
          <label className="block text-sm font-medium">SEO</label>
          <div className="h-2 rounded bg-muted overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${seoScore}%` }}
            />
          </div>
          <Input
            placeholder="SEO title"
            value={post.seoTitle}
            onChange={e =>
              setPost({ ...post, seoTitle: e.target.value })
            }
          />
          <textarea
            placeholder="SEO description"
            value={post.seoDescription}
            onChange={e =>
              setPost({ ...post, seoDescription: e.target.value })
            }
            className="w-full rounded-lg p-2"
          />
        </div>

        {/* SCHEDULING (ADMIN / EDITOR ONLY) */}
        {canSchedule && (
          <div className="rounded-xl bg-card p-4 space-y-2">
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
            <Button
              loading={saving}
              disabled={uploading}
              onClick={() => save(true)}
              className="flex-1"
            >
              Send for Verification
            </Button>
          ) : (
            <Button
              loading={saving}
              disabled={uploading}
              onClick={() => save(true)}
              className="flex-1"
            >
              {scheduledAt ? 'Schedule Post' : 'Publish'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
