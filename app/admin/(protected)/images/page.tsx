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

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
      if (response.ok) setImages(data.images)
    } catch {
      toast.error('Failed to fetch images')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error('Please select a file')
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('altText', uploadForm.altText)
    formData.append('title', uploadForm.title)
    formData.append('caption', uploadForm.caption)

    try {
      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      toast.success('Image uploaded')
      setIsUploadModalOpen(false)
      setSelectedFile(null)
      setUploadForm({ altText: '', title: '', caption: '' })
      fetchImages()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return

    try {
      const response = await fetch(`/api/images/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      toast.success(data.message)
      fetchImages()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied URL')
  }

  const filteredImages = images.filter(img =>
    [img.altText, img.title, img.caption]
      .some(v => v?.toLowerCase().includes(search.toLowerCase())) ||
    search === ''
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-sm text-slate-500">
            Upload, search and manage images
          </p>
        </div>

        <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Image
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card elev-sm rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search images..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Grid */}
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {loading ? (
    // ===== SKELETONS (ONLY CARDS) =====
    Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="rounded-xl bg-card overflow-hidden animate-pulse"
      >
        {/* image */}
        <div className="aspect-square bg-muted" />

        {/* meta */}
        <div className="p-4 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />

          <div className="flex items-center justify-between pt-3">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded bg-muted" />
              <div className="h-8 w-8 rounded bg-muted" />
              <div className="h-8 w-8 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    ))
  ) : filteredImages.length > 0 ? (
    // ===== REAL DATA =====
    filteredImages.map(image => (
      <div
        key={image.id}
        className="group bg-card elev-sm rounded-xl overflow-hidden ui-transition ui-lift"
      >
        <div className="relative aspect-square bg-muted overflow-hidden">
          <Image
            src={image.url}
            alt={image.altText || ''}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="p-4 space-y-2">
          {image.title && (
            <h3 className="text-sm font-semibold truncate">
              {image.title}
            </h3>
          )}

          {image.altText && (
            <p className="text-xs text-slate-500 truncate">
              {image.altText}
            </p>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              {image.width}×{image.height}
            </span>

            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => copyToClipboard(image.url)}
              >
                <Copy className="h-4 w-4" />
              </Button>

              <a
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted ui-transition"
              >
                <ExternalLink className="h-4 w-4" />
              </a>

              <Button
                size="icon"
                variant="ghost"
                className="text-red-500 hover:bg-red-50"
                onClick={() => handleDelete(image.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    ))
  ) : (
    // ===== EMPTY STATE =====
    <div className="col-span-full py-20 text-center text-muted-foreground">
      No images found
    </div>
  )}
</div>


      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false)
          setSelectedFile(null)
        }}
        title="Upload Image"
        size="md"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          {/* File selector */}
          <div className="space-y-3">
            {!selectedFile ? (
              <label
                htmlFor="file-input"
                className="
                  flex cursor-pointer items-center justify-center gap-2
                  rounded-xl px-4 py-3
                  bg-card
                  elev-sm
                  btn-glow
                  ui-transition
                  hover:scale-[1.02]
                  hover:elev-lg
                  text-sm font-medium
                "
              >
                <Upload className="h-4 w-4 text-indigo-500" />
                Choose image
              </label>
            ) : (
              <div className="rounded-xl bg-muted p-3 elev-sm ui-transition">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <label htmlFor="file-input">
                      <Button size="sm" variant="ghost">
                        Replace
                      </Button>
                    </label>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </div>

          <Input
            placeholder="Alt text"
            value={uploadForm.altText}
            onChange={e => setUploadForm({ ...uploadForm, altText: e.target.value })}
          />

          <Input
            placeholder="Title"
            value={uploadForm.title}
            onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
          />

          <Input
            placeholder="Caption"
            value={uploadForm.caption}
            onChange={e => setUploadForm({ ...uploadForm, caption: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsUploadModalOpen(false)
                setSelectedFile(null)
              }}
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
