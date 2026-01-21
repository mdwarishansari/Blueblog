'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Category, UserRole } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { apiGet, apiPost, apiPut, apiUpload } from '@/lib/api'
import { ImagePlus } from 'lucide-react'
import imageCompression from 'browser-image-compression'


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


  /* ---------- IMAGE VALIDATION---------- */
  const MAX_INPUT_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const TARGET_IMAGE_SIZE = 500 * 1024 // 500KB

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

  /* ---------- IMAGE COMPRESSION ---------- */
async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5, // 500 KB
    maxWidthOrHeight: 2000,
    useWebWorker: true,
  }

  return await imageCompression(file, options)
}

  /* ---------- IMAGE UPLOAD ---------- */
  async function uploadImage(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error('Only JPG and PNG images allowed')
    return
  }

  if (file.size > MAX_INPUT_IMAGE_SIZE) {
    toast.error('Image must be less than 5MB')
    return
  }

  setUploading(true)
  setUploadProgress(0)
  setUploadError(null)

  try {
    // 1️⃣ compress in browser
    const compressedFile = await compressImage(file)

    // sanity check
    if (compressedFile.size > TARGET_IMAGE_SIZE) {
      toast.error('Image could not be compressed enough')
      return
    }

    // 2️⃣ upload compressed file
    const formData = new FormData()
    formData.append('file', compressedFile)

    const data = await apiUpload('/upload/image', formData)

    const img = data.data || data.image
    setImage(img)

    toast.success('Image uploaded')
  } catch (err: any) {
    toast.error(err.message || 'Upload failed')
    setUploadError(err.message || 'Upload failed')
  } finally {
    setUploading(false)
  }
}


  async function save(publish: boolean) {
    setSaving(true)

    try {
      const payload = {
        ...post,
        bannerImageId: image?.id || null,
        status: publish ? 'PUBLISHED' : 'DRAFT',
        publishedAt: publish ? new Date().toISOString() : undefined,
      }

      const data = postId
        ? await apiPut(`/admin/posts/${postId}`, payload)
        : await apiPost('/admin/posts', payload)

      toast.success(publish ? 'Post published' : 'Draft saved')

      if (publish) {
        router.replace('/admin/posts')
      }

      const postData = data.data?.post || data.post || data.data
      if (!postId && postData?.id) {
        setPostId(postData.id)
      }

      // Note: Image metadata update may need to be handled separately if backend supports it
    } catch (err: any) {
      toast.error(err.message || 'Failed to save post')
    } finally {
      setSaving(false)
    }
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
        <div className="rounded-xl bg-card p-4 space-y-3">
  <label className="text-sm font-medium">Featured Image</label>

  {/* PICK ICON */}
  {!uploading && (
    <label
      htmlFor="post-image"
      className="flex items-center justify-center gap-2 cursor-pointer rounded-lg border border-dashed p-4 hover:bg-muted"
    >
      <ImagePlus className="h-5 w-5" />
      <span className="text-sm">Choose image (1–5MB)</span>
    </label>
  )}

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

  {/* PROGRESS */}
  {uploading && (
    <div className="space-y-2">
      <div className="h-2 rounded bg-muted overflow-hidden">
        <div className="h-full bg-indigo-500 animate-pulse w-full" />
      </div>
      <p className="text-xs text-muted-foreground">Uploading…</p>
    </div>
  )}

  {/* PREVIEW */}
  {image && !uploading && (
    <>
      <img src={image.url} className="rounded-lg" />
      <p className="text-xs text-muted-foreground">
        Image uploaded • Click icon above to replace
      </p>
    </>
  )}

  {uploadError && (
    <p className="text-xs text-red-500">{uploadError}</p>
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
