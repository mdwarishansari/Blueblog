'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import AdminLayout from '@/components/layout/AdminLayout'
import Loading from '@/components/ui/Loading'
import { FiUpload, FiSearch, FiTrash2, FiEye, FiDownload, FiImage, FiCheck } from 'react-icons/fi'
import Button from '@/components/ui/Button'

interface MediaItem {
  id: string
  url: string
  alt_text: string
  title: string
  caption: string
  width: number
  height: number
  size: number
  format: string
  created_at: string
}

export default function MediaLibraryPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      // Simulate fetching media
      setTimeout(() => {
        setMedia([
          {
            id: '1',
            url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
            alt_text: 'Blog post banner image',
            title: 'Featured Image',
            caption: 'Image for blog post',
            width: 1200,
            height: 630,
            size: 1024000,
            format: 'jpg',
            created_at: '2024-01-15T10:30:00Z',
          },
          {
            id: '2',
            url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
            alt_text: 'Code editor screenshot',
            title: 'Code Example',
            caption: 'Programming screenshot',
            width: 800,
            height: 600,
            size: 512000,
            format: 'png',
            created_at: '2024-01-14T14:20:00Z',
          },
        ])
        setLoading(false)
      }, 1000)
    }
  }, [isAuthenticated])

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 100)

    // Simulate API call
    setTimeout(() => {
      const newMedia: MediaItem = {
        id: Date.now().toString(),
        url: URL.createObjectURL(file),
        alt_text: file.name,
        title: file.name.split('.')[0],
        caption: '',
        width: 1200,
        height: 630,
        size: file.size,
        format: file.type.split('/')[1],
        created_at: new Date().toISOString(),
      }

      setMedia(prev => [newMedia, ...prev])
      clearInterval(interval)
      setUploading(false)
      setUploadProgress(0)
      setShowUploadModal(false)
    }, 2000)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    setMedia(prev => prev.filter(item => item.id !== id))
    setSelectedMedia(prev => prev.filter(itemId => itemId !== id))
  }

  const handleBulkDelete = () => {
    if (!selectedMedia.length || !confirm(`Delete ${selectedMedia.length} items?`)) return
    setMedia(prev => prev.filter(item => !selectedMedia.includes(item.id)))
    setSelectedMedia([])
  }

  const toggleSelectMedia = (id: string) => {
    setSelectedMedia(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const filteredMedia = media.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.alt_text.toLowerCase().includes(search.toLowerCase())
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
            <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
            <p className="text-gray-600">Manage your images and media files</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
              <Button
                variant="primary"
                icon={<FiUpload size={18} />}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Media'}
              </Button>
            </label>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="bg-white border rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search media by title or alt text..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full input-field"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredMedia.length} items • {formatFileSize(media.reduce((sum, item) => sum + item.size, 0))}
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedMedia.length > 0 && (
          <div className="flex items-center justify-between bg-primary-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <FiCheck size={20} className="text-primary-600" />
              <span className="font-medium text-primary-800">
                {selectedMedia.length} items selected
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Media Grid */}
        {filteredMedia.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-square relative bg-gray-100">
                  <img
                    src={item.url}
                    alt={item.alt_text}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Selection Overlay */}
                  <div
                    className={`absolute top-2 left-2 w-6 h-6 rounded border flex items-center justify-center cursor-pointer ${
                      selectedMedia.includes(item.id)
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white/90 border-gray-300'
                    }`}
                    onClick={() => toggleSelectMedia(item.id)}
                  >
                    {selectedMedia.includes(item.id) && <FiCheck size={14} />}
                  </div>
                  
                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-2">
                      <a
                        href={item.url}
                        target="_blank"
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                        title="View"
                      >
                        <FiEye size={16} />
                      </a>
                      <a
                        href={item.url}
                        download
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                        title="Download"
                      >
                        <FiDownload size={16} />
                      </a>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {item.alt_text}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center justify-between">
                    <span>{item.width}×{item.height}</span>
                    <span>{formatFileSize(item.size)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border rounded-xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FiImage size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {search ? 'No media found' : 'No media uploaded yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {search ? 'Try a different search term' : 'Upload your first image to get started'}
            </p>
            <label className="cursor-pointer inline-block">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <Button variant="primary" icon={<FiUpload size={18} />}>
                Upload Media
              </Button>
            </label>
          </div>
        )}

        {/* Upload Progress Modal */}
        {uploading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                  <FiUpload size={24} className="text-primary-600 animate-bounce" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Uploading Image</h3>
                <p className="text-gray-600 mb-4">Please wait while we upload your image...</p>
                
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-primary-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-sm text-gray-500">{uploadProgress}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Tips */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Media Library Tips</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start gap-2">
              <FiCheck size={14} className="mt-0.5 flex-shrink-0" />
              <span>Upload images in WebP format for better compression</span>
            </li>
            <li className="flex items-start gap-2">
              <FiCheck size={14} className="mt-0.5 flex-shrink-0" />
              <span>Always add descriptive alt text for SEO and accessibility</span>
            </li>
            <li className="flex items-start gap-2">
              <FiCheck size={14} className="mt-0.5 flex-shrink-0" />
              <span>Recommended banner image size: 1200×630 pixels</span>
            </li>
            <li className="flex items-start gap-2">
              <FiCheck size={14} className="mt-0.5 flex-shrink-0" />
              <span>Keep file sizes under 1MB for faster loading</span>
            </li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  )
}