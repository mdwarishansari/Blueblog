'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import SEOForm from '@/components/admin/SEOForm'
import ImageUploader from '@/components/admin/ImageUploader'
import { FiSave, FiSend, FiX } from 'react-icons/fi'
import { postApi } from '@/lib/api/posts'
import { categoryApi } from '@/lib/api/categories'

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

interface Category {
  id: string
  name: string
}

/* ------------------------------------------------------------------ */
/* PAGE */
/* ------------------------------------------------------------------ */

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()

  const postId = params?.id as string
  const isEdit = postId !== 'new'

  const [saving, setSaving] = useState(false)
  const [loadingPost, setLoadingPost] = useState(isEdit)

  const [categories, setCategories] = useState<Category[]>([])
  const [originalSlug, setOriginalSlug] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    seo_title: '',
    seo_description: '',
    canonical_url: '',
    banner_image_id: '',
    banner_image_url: '',
    category_ids: [] as string[],
  })

  /* ------------------------------------------------------------------ */
  /* LOAD CATEGORIES (ONCE) */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    categoryApi
      .getAll()
      .then(res => {
        setCategories(res.data.categories || [])
      })
      .catch(err => {
        console.error('Failed to load categories', err)
      })
  }, [])

  /* ------------------------------------------------------------------ */
  /* LOAD POST (EDIT MODE ONLY) */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!isEdit) {
      setLoadingPost(false)
      return
    }

    postApi
      .getById(postId)
      .then(res => {
        const post = res.data.post

        setFormData({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          content: post.content?.blocks?.[0]?.data?.text || '',
          seo_title: post.seoTitle || '',
          seo_description: post.seoDescription || '',
          canonical_url: post.canonicalUrl || '',
          banner_image_id: post.bannerImage?.id || '',
          banner_image_url: post.bannerImage?.url || '',
          category_ids: post.categories?.map((c: any) => c.id) || [],
        })

        setOriginalSlug(post.slug)
      })
      .catch(err => {
        console.error('Failed to load post', err)
      })
      .finally(() => {
        setLoadingPost(false)
      })
  }, [isEdit, postId])

  /* ------------------------------------------------------------------ */
  /* SAVE */
  /* ------------------------------------------------------------------ */

  const handleSave = async (publish = false) => {
    setSaving(true)

    try {
      const payload: any = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: {
          blocks: [{ type: 'paragraph', data: { text: formData.content } }],
        },
        bannerImageId: formData.banner_image_id || undefined,
        categoryIds: formData.category_ids,
        seoTitle: formData.seo_title || undefined,
        seoDescription: formData.seo_description || undefined,
        canonicalUrl: formData.canonical_url || undefined,
      }

      // 🔒 Prevent slug conflict
      if (!isEdit || formData.slug !== originalSlug) {
        payload.slug = formData.slug
      }

      let savedPostId = postId

      if (isEdit) {
        await postApi.update(postId, payload)
      } else {
        const res = await postApi.create(payload)
        savedPostId = res.data.post.id
      }

      if (publish) {
        await postApi.publish(savedPostId)
      }

      router.push('/admin/posts')
    } catch (err) {
      console.error(err)
      alert('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  /* ------------------------------------------------------------------ */
  /* LOADING STATE */
  /* ------------------------------------------------------------------ */

  if (loadingPost) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-gray-600">
          Loading post…
        </div>
      </AdminLayout>
    )
  }

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? 'Edit Post' : 'Create New Post'}
            </h1>
            <p className="text-gray-600">
              {isEdit
                ? 'Update your existing article'
                : 'Start writing your next great article'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/posts')}
              className="px-4 py-2 border rounded-lg"
            >
              <FiX className="inline mr-1" />
              Cancel
            </button>

            <button
              disabled={saving}
              onClick={() => handleSave(false)}
              className="px-4 py-2 text-white rounded-lg bg-primary-600"
            >
              <FiSave className="inline mr-1" />
              Save Draft
            </button>

            <button
              disabled={saving}
              onClick={() => handleSave(true)}
              className="px-4 py-2 text-white bg-green-600 rounded-lg"
            >
              <FiSend className="inline mr-1" />
              Publish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-4 lg:col-span-2">
            <input
              className="w-full px-3 py-2 text-xl border rounded"
              placeholder="Post title"
              value={formData.title}
              onChange={e =>
                setFormData(p => ({
                  ...p,
                  title: e.target.value,
                  slug: e.target.value
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/--+/g, '-'),
                }))
              }
            />

            <textarea
              className="w-full px-3 py-2 border rounded"
              rows={3}
              placeholder="Excerpt"
              value={formData.excerpt}
              onChange={e =>
                setFormData(p => ({ ...p, excerpt: e.target.value }))
              }
            />

            <textarea
              className="w-full border px-3 py-2 rounded min-h-[320px]"
              placeholder="Write your content here…"
              value={formData.content}
              onChange={e =>
                setFormData(p => ({ ...p, content: e.target.value }))
              }
            />
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* IMAGE */}
            <div className="p-4 border rounded-xl">
              <h3 className="mb-2 font-semibold">Featured Image</h3>
              <ImageUploader
                existingImageUrl={formData.banner_image_url || null}
                onUploadComplete={img =>
                  setFormData(p => ({
                    ...p,
                    banner_image_id: img.id,
                    banner_image_url: img.url,
                  }))
                }
              />
            </div>

            {/* CATEGORIES */}
            <div className="p-4 border rounded-xl">
              <h3 className="mb-2 font-semibold">Categories</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat.id} className="flex gap-2">
                    <input
                      type="checkbox"
                      checked={formData.category_ids.includes(cat.id)}
                      onChange={e =>
                        setFormData(p => ({
                          ...p,
                          category_ids: e.target.checked
                            ? [...p.category_ids, cat.id]
                            : p.category_ids.filter(id => id !== cat.id),
                        }))
                      }
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {/* SEO */}
            <div className="p-4 border rounded-xl">
              <h3 className="mb-2 font-semibold">SEO Settings</h3>
              <SEOForm
                title={formData.seo_title || formData.title}
                description={formData.seo_description || formData.excerpt}
                slug={formData.slug}
                canonicalUrl={formData.canonical_url}
                onTitleChange={v =>
                  setFormData(p => ({ ...p, seo_title: v }))
                }
                onDescriptionChange={v =>
                  setFormData(p => ({ ...p, seo_description: v }))
                }
                onSlugChange={v =>
                  setFormData(p => ({ ...p, slug: v }))
                }
                onCanonicalChange={v =>
                  setFormData(p => ({ ...p, canonical_url: v }))
                }
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
