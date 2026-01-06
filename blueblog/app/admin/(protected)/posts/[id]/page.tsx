'use client'

import { useEffect, useMemo, useState, use } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Category, UserRole, Image as ImageType } from '@prisma/client'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

interface PageProps {
  params: Promise<{ id: string }>
}

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

export default function EditPostPage({ params }: PageProps) {
  const { id } = use(params)

  const userRole: UserRole = 'WRITER'

  const canPublish = userRole !== 'WRITER'

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

  /* ---------------- Load data ---------------- */

  useEffect(() => {
    async function load() {
      try {
        const [catRes, postRes] = await Promise.all([
          fetch('/api/categories'),
          fetch(`/api/admin/posts/${id}`),
        ])

        if (!catRes.ok || !postRes.ok) {
          throw new Error('Failed to load post')
        }

        const cats = await catRes.json()
        const postData = await postRes.json()

        setCategories(cats)

        setPost({
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt || '',
          content: postData.content,
          categoryIds: postData.categories.map((c: Category) => c.id),
          seoTitle: postData.seoTitle || '',
          seoDescription: postData.seoDescription || '',
          canonicalUrl: postData.canonicalUrl || '',
        })

        setImage(postData.bannerImage || null)
      } catch (e) {
        toast.error('Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  /* ---------------- Slug auto ---------------- */

  useEffect(() => {
    if (!slugTouched && post.title) {
      setPost((p: any) => ({ ...p, slug: slugify(p.title) }))
    }
  }, [post.title, slugTouched])

  /* ---------------- SEO score ---------------- */

  const seoScore = useMemo(() => {
    let s = 0
    if (post.seoTitle.length >= 40 && post.seoTitle.length <= 60) s += 40
    if (post.seoDescription.length >= 120 && post.seoDescription.length <= 160) s += 40
    if (post.slug) s += 20
    return s
  }, [post])

  /* ---------------- Save ---------------- */

  async function save(publish: boolean) {
  setSaving(true)

  const res = await fetch(`/api/admin/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...post,
      bannerImageId: image?.id || null,
      status: publish ? 'PUBLISHED' : 'DRAFT',
      publishedAt: publish ? new Date().toISOString() : undefined,
    }),
  })

  let data = null
  if (res.headers.get('content-type')?.includes('application/json')) {
    data = await res.json()
  }

  if (!res.ok) {
    toast.error(data?.message || 'Failed to save')
    setSaving(false)
    return
  }

  /* 🔥 SAVE IMAGE METADATA */
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

  toast.success(publish ? 'Post published' : 'Draft updated')
  setSaving(false)
}


  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading…</div>
  }

  /* ---------------- UI (SAME AS NEW PAGE) ---------------- */

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

        <Editor
          value={post.content}
          onChange={v => setPost({ ...post, content: v })}
        />
      </div>

      {/* SIDEBAR */}
      <div className="space-y-6">
        {/* Image */}
        <div className="rounded border p-4">
          {image && <img src={image.url} className="rounded mb-2" />}

          <Input
            placeholder="Alt text (SEO)"
            value={image?.altText || ''}
            onChange={e =>
              image && setImage({ ...image, altText: e.target.value })
            }
          />

          <Input
            placeholder="Image title"
            value={image?.title || ''}
            onChange={e =>
              image && setImage({ ...image, title: e.target.value })
            }
          />

          <textarea
            placeholder="Image caption"
            value={image?.caption || ''}
            onChange={e =>
              image && setImage({ ...image, caption: e.target.value })
            }
            className="w-full rounded border p-2 bg-background"
            rows={2}
          />
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
            onChange={e =>
              setPost({ ...post, seoDescription: e.target.value })
            }
            className="w-full rounded border p-2 bg-background"
          />
        </div>

        <Button onClick={() => save(false)} loading={saving}>
          Save Draft
        </Button>
        {canPublish && (
          <Button onClick={() => save(true)} loading={saving}>
            Publish
          </Button>
        )}
      </div>
    </div>
  )
}