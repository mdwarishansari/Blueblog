'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Upload, Search, Trash2, ExternalLink, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

interface ImageData {
  id: string
  url: string
  altText: string | null
  title: string | null
  caption: string | null
  width: number | null
  height: number | null
  createdAt: string
}

export default function AdminImagesPage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  // const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)
  const [uploadForm, setUploadForm] = useState({
    altText: '',
    title: '',
    caption: '',
  })

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/upload/cloudinary')
      const data = await response.json()
      if (response.ok) {
        setImages(data.images)
      }
    } catch (error) {
      toast.error('Failed to fetch images')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const fileInput = document.getElementById('file-input') as HTMLInputElement
    const file = fileInput.files?.[0]
    
    if (!file) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('altText', uploadForm.altText)
    formData.append('title', uploadForm.title)
    formData.append('caption', uploadForm.caption)

    try {
      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }

      toast.success('Image uploaded successfully')
      setIsUploadModalOpen(false)
      setUploadForm({ altText: '', title: '', caption: '' })
      fileInput.value = ''
      fetchImages()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`/api/images/${id}`, {
  method: 'DELETE',
})



      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete image')
      }

      toast.success(data.message)
      fetchImages()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const filteredImages = images.filter(image =>
    (image.altText?.toLowerCase().includes(search.toLowerCase()) ||
     image.title?.toLowerCase().includes(search.toLowerCase()) ||
     image.caption?.toLowerCase().includes(search.toLowerCase())) ||
    search === ''
  )

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600">Manage your images and media files</p>
        </div>
        <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Image
        </Button>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search images..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredImages.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg border">
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image
                  src={image.url}
                  alt={image.altText || ''}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              </div>
              <div className="p-4">
                {image.title && (
                  <h3 className="mb-1 text-sm font-medium text-gray-900 truncate">
                    {image.title}
                  </h3>
                )}
                {image.altText && (
                  <p className="mb-2 text-xs text-gray-600 truncate">
                    {image.altText}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {image.width}×{image.height}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(image.url)}
                      title="Copy URL"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <a
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-6 w-6 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(image.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false)
          setUploadForm({ altText: '', title: '', caption: '' })
        }}
        title="Upload Image"
        size="md"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alt Text
            </label>
            <Input
              value={uploadForm.altText}
              onChange={(e) => setUploadForm({ ...uploadForm, altText: e.target.value })}
              placeholder="Description for screen readers"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <Input
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              placeholder="Optional title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Caption
            </label>
            <Input
              value={uploadForm.caption}
              onChange={(e) => setUploadForm({ ...uploadForm, caption: e.target.value })}
              placeholder="Optional caption"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={uploading}>
              Upload
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}