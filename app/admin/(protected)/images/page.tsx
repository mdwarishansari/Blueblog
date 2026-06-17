'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Upload, Trash2, ExternalLink, Copy, ImageIcon as ImageIconIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState } from '@/components/ui/EmptyState'
import { ImageUploadField } from '@/components/ui/ImageUploadField'
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
  usageType?: 'avatar' | 'logo' | 'category' | 'post' | 'other'
  usageName?: string | null
  derivedTitle?: string
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-charcoal">Media Library</h1>
          <p className="text-sm text-slate-gray">
            Upload, search and manage images
          </p>
        </div>

        <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2 self-start">
          <Upload className="h-4 w-4" />
          Upload Image
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <SearchInput
          placeholder="Search images..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[16px] bg-pure-white border border-hairline overflow-hidden shadow-subtle p-0"
            >
              <div className="aspect-square skeleton" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 skeleton" />
                <div className="h-3 w-1/2 skeleton" />

                <div className="flex items-center justify-between pt-3">
                  <div className="h-3 w-16 skeleton" />
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full skeleton" />
                    <div className="h-8 w-8 rounded-full skeleton" />
                    <div className="h-8 w-8 rounded-full skeleton" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : filteredImages.length > 0 ? (
          filteredImages.map(image => (
            <Card
              key={image.id}
              variant="white"
              hoverLift
              className="overflow-hidden p-0 group flex flex-col h-full"
            >
              <div className="relative aspect-square bg-canvas-cream overflow-hidden border-b border-hairline">
                <Image
                  src={image.url}
                  alt={image.altText || ''}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3
                    className="text-sm font-semibold text-ink-charcoal truncate"
                    title={image.derivedTitle || image.title || 'Untitled Image'}
                  >
                    {image.derivedTitle || image.title || 'Untitled Image'}
                  </h3>

                  {image.usageType && image.usageType !== 'other' && (
                    <div className="mt-0.5">
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-lavender-mist text-vivid-violet border border-vivid-violet/10 rounded-full">
                        {image.usageType.toUpperCase()}: {image.usageName}
                      </span>
                    </div>
                  )}

                  {image.altText && (
                    <p className="text-xs text-slate-gray truncate pt-0.5">
                      Alt: {image.altText}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-hairline mt-auto">
                  <span className="text-xs text-slate-gray font-mono">
                    {image.width}×{image.height}
                  </span>

                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyToClipboard(image.url)}
                      title="Copy URL"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    <a
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-canvas-cream text-ink-charcoal border border-transparent hover:border-hairline ui-transition"
                      title="Open Image"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(image.id)}
                      title="Delete Image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              title="No images found"
              description={search ? "Try searching for another keyword" : "Upload your first image to get started"}
              icon={<ImageIconIcon className="h-10 w-10 text-slate-gray" />}
              actionLabel={!search ? "Upload Image" : undefined}
              onAction={!search ? () => setIsUploadModalOpen(true) : undefined}
            />
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false)
          setSelectedFile(null)
          setUploadForm({ altText: '', title: '', caption: '' })
        }}
        title="Upload Image"
        description="Add a new image to your media library"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          {/* File selector */}
          <div className="space-y-3">
            <ImageUploadField
              key={isUploadModalOpen ? 'open' : 'closed'}
              typeLabel="Post Image"
              onFileSelect={(file) => setSelectedFile(file)}
              onClear={() => setSelectedFile(null)}
              maxSizeMB={10}
              allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-gray">Alt Text (SEO)</label>
            <Input
              placeholder="e.g. A developer writing code on a laptop"
              value={uploadForm.altText}
              onChange={e => setUploadForm({ ...uploadForm, altText: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-gray">Title</label>
            <Input
              placeholder="e.g. Workspace setup"
              value={uploadForm.title}
              onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-gray">Caption</label>
            <Input
              placeholder="e.g. Photo by Jane Doe"
              value={uploadForm.caption}
              onChange={e => setUploadForm({ ...uploadForm, caption: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsUploadModalOpen(false)
                setSelectedFile(null)
                setUploadForm({ altText: '', title: '', caption: '' })
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={uploading} disabled={!selectedFile}>
              Upload
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
