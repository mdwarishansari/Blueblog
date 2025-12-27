'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { categoryApi } from '@/lib/api/categories'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFolder } from 'react-icons/fi'
import AdminLayout from '@/components/layout/AdminLayout'
import Loading from '@/components/ui/Loading'

interface Category {
  id: string
  name: string
  slug: string
  post_count?: number
  created_at: string
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories()
    }
  }, [isAuthenticated])

  const fetchCategories = async () => {
  try {
    setLoading(true)

    const response = await categoryApi.getAll()

    const categoriesArray = Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.data?.items)
        ? response.data.items
        : []

    setCategories(categoriesArray)
  } catch (error) {
    console.error('Error fetching categories:', error)
    setCategories([])
  } finally {
    setLoading(false)
  }
}


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      if (editingCategory) {
        // Update existing category
        await categoryApi.update(editingCategory.id, formData)
      } else {
        // Create new category
        await categoryApi.create(formData)
      }
      
      // Reset form and refresh
      resetForm()
      fetchCategories()
    } catch (error: any) {
      console.error('Error saving category:', error)
      alert(error.message || 'Failed to save category')
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      await categoryApi.delete(categoryId)
      setCategories(categories.filter(cat => cat.id !== categoryId))
    } catch (error: any) {
      console.error('Error deleting category:', error)
      alert(error.message || 'Failed to delete category')
    }
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
    })
    setIsModalOpen(true)
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
    })
    setErrors({})
    setIsModalOpen(true)
  }

  const resetForm = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
    })
    setErrors({})
    setIsModalOpen(false)
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }))
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    category.slug.toLowerCase().includes(search.toLowerCase())
  )

  if (authLoading || loading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Organize your content with categories</p>
          </div>
          
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 btn-primary"
          >
            <FiPlus size={18} />
            Add Category
          </button>
        </div>

        {/* Search */}
        <div className="bg-white border rounded-xl p-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full input-field"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                      <FiFolder size={24} className="text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">/{category.slug}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2 text-gray-600 hover:text-primary-600"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-gray-600 hover:text-red-600"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Posts</span>
                    <span className="font-medium text-gray-900">
                      {category.post_count || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-500">
                      {new Date(category.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <a
                    href={`/category/${category.slug}`}
                    target="_blank"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View Category Page →
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border rounded-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FiFolder size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search ? 'No categories found' : 'No categories yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {search ? 'Try a different search term' : 'Create your first category to organize posts'}
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 btn-primary"
            >
              <FiPlus size={18} />
              Add Category
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600">Total Categories</div>
          </div>
          
          <div className="card">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {categories.reduce((sum, cat) => sum + (cat.post_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Posts in Categories</div>
          </div>
          
          <div className="card">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {categories.length
  ? Math.max(...categories.map(c => c.post_count || 0)): 0}

            </div>
            <div className="text-sm text-gray-600">Most Posts in a Category</div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Web Development"
                  className="input-field"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g., web-development"
                  className="input-field"
                />
                {errors.slug && (
                  <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Used in URLs: /category/{formData.slug || 'your-slug'}
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}