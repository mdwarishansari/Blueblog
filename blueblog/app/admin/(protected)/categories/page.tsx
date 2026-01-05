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
  /* ---------------- State ---------------- */

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
    } catch {
      /* optional */
    }
  }

  /* ------------------------------------------------------------------ */
  /* Slug auto-sync (CREATE + EDIT)                                     */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!slugTouched && formData.name) {
      setFormData(f => ({ ...f, slug: slugify(f.name) }))
    }
  }, [formData.name, slugTouched])

  /* ------------------------------------------------------------------ */
  /* Helpers                                                           */
  /* ------------------------------------------------------------------ */

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
    setSlugTouched(false) // 🔥 FIX
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

  if (loading) return <div className="p-6">Loading…</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> New Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <Input
          className="pl-10"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Slug</th>
              <th className="px-6 py-3 text-left">Posts</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredCategories.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4 flex items-center gap-3">
                  {c.image ? (
                    <img src={c.image.url} className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                      <ImageIcon size={16} className="text-gray-400" />
                    </div>
                  )}
                  {c.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.slug}</td>
                <td className="px-6 py-4">{c._count.posts}</td>
                <td className="px-6 py-4 flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(c)}>
                    <Edit size={16} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)}>
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingCategory ? 'Edit Category' : 'Create Category'}
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

          {/* Upload */}
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <Upload size={16} />
            Upload image
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={uploading}
              onChange={e => e.target.files && uploadImage(e.target.files[0])}
            />
          </label>

          {/* Image picker */}
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {images.map(img => (
              <button
                key={img.id}
                type="button"
                onClick={() => setFormData(f => ({ ...f, imageId: img.id }))}
                className={`border rounded ${
                  formData.imageId === img.id ? 'ring-2 ring-blue-500' : ''
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
              className="text-sm text-red-600 flex items-center gap-1"
            >
              <X size={14} /> Remove image
            </button>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => {
              setIsModalOpen(false)
              resetForm()
            }}>
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
