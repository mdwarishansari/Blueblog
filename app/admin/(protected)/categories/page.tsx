'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

interface Image {
  id: string
  url: string
  altText: string | null
}

interface Category {
  id: string
  name: string
  slug: string
  image: Image | null
  _count: {
    posts: number
  }
}

/* ------------------------------------------------------------------ */
/* Utils                                                              */
/* ------------------------------------------------------------------ */

const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [slugTouched, setSlugTouched] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    imageId: '',
  })

  /* ------------------------------------------------------------------ */
  /* Fetch                                                             */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    fetchCategories()
    fetchImages()
  }, [])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (res.ok) setCategories(data)
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  async function fetchImages() {
    try {
      const res = await fetch('/api/images')
      const data = await res.json()
      if (res.ok) setImages(data.images || [])
    } catch {}
  }

  /* ------------------------------------------------------------------ */
  /* Slug auto-sync                                                     */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!slugTouched && formData.name) {
      setFormData(f => ({ ...f, slug: slugify(f.name) }))
    }
  }, [formData.name, slugTouched])

  function resetForm() {
    setFormData({ name: '', slug: '', imageId: '' })
    setSlugTouched(false)
    setEditingCategory(null)
  }

  /* ------------------------------------------------------------------ */
  /* Image Upload                                                       */
  /* ------------------------------------------------------------------ */

  async function uploadImage(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: fd,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success('Image uploaded')
      setImages(prev => [data.image, ...prev])
      setFormData(f => ({ ...f, imageId: data.image.id }))
    } catch (e: any) {
      toast.error(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  /* ------------------------------------------------------------------ */
  /* Submit                                                             */
  /* ------------------------------------------------------------------ */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const url = editingCategory
      ? `/api/admin/categories/${editingCategory.id}`
      : '/api/admin/categories'

    const method = editingCategory ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success(editingCategory ? 'Category updated' : 'Category created')
      setIsModalOpen(false)
      resetForm()
      fetchCategories()
    } catch (e: any) {
      toast.error(e.message || 'Save failed')
    }
  }

  /* ------------------------------------------------------------------ */
  /* Edit / Delete                                                      */
  /* ------------------------------------------------------------------ */

  function handleEdit(category: Category) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      imageId: category.image?.id || '',
    })
    setSlugTouched(false)
    setIsModalOpen(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success('Category deleted')
      fetchCategories()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  /* ------------------------------------------------------------------ */
  /* Derived                                                           */
  /* ------------------------------------------------------------------ */

  const filteredCategories = useMemo(() => {
    return categories.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
    )
  }, [categories, search])

  /* ------------------------------------------------------------------ */
  /* Render                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Organize posts with categories
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={16} /> New Category
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={16}
        />
        <Input
          className="pl-10"
          placeholder="Search categories…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* LIST */}
      <div className="space-y-3">
  {loading ? (
    Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card px-5 py-4 animate-pulse"
      >
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-lg bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-40 rounded bg-muted" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-4 w-16 rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded bg-muted" />
            <div className="h-8 w-8 rounded bg-muted" />
          </div>
        </div>
      </div>
    ))
  ) : (
    filteredCategories.map(c => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card px-5 py-4 elev-sm"
          >
            <div className="flex items-center gap-4 min-w-0">
              {c.image ? (
                <img
                  src={c.image.url}
                  className="h-11 w-11 rounded-lg object-cover"
                />
              ) : (
                <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center">
                  <ImageIcon size={16} className="text-muted-foreground" />
                </div>
              )}

              <div className="min-w-0">
                <p className="font-medium truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {c.slug}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {c._count.posts} posts
              </span>

              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleEdit(c)}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(c.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        )))}

        {filteredCategories.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">
            No categories found
          </div>
        )}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        description="Category name, slug, and optional image"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Category name"
            value={formData.name}
            onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
            required
          />

          <Input
            placeholder="category-slug"
            value={formData.slug}
            onChange={e => {
              setSlugTouched(true)
              setFormData(f => ({ ...f, slug: slugify(e.target.value) }))
            }}
            required
          />

          {/* UPLOAD */}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Upload size={16} />
            Upload image
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={uploading}
              onChange={e => {
                const file = e.currentTarget.files?.[0]
                if (file) uploadImage(file)
              }}
            />
          </label>

          {/* IMAGE PICKER */}
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {images.map(img => (
              <button
                key={img.id}
                type="button"
                onClick={() => setFormData(f => ({ ...f, imageId: img.id }))}
                className={`rounded-lg overflow-hidden ${
                  formData.imageId === img.id
                    ? 'ring-2 ring-primary'
                    : 'opacity-80 hover:opacity-100'
                }`}
              >
                <img src={img.url} className="h-16 w-full object-cover" />
              </button>
            ))}
          </div>

          {formData.imageId && (
            <button
              type="button"
              onClick={() => setFormData(f => ({ ...f, imageId: '' }))}
              className="flex items-center gap-1 text-sm text-red-600"
            >
              <X size={14} /> Remove image
            </button>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
