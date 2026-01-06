'use client'

import { useState, useRef } from 'react'
import { Upload as UploadIcon, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'


interface UploadProps {
  onUploadComplete: (image: any) => void
  existingImage?: {
    url: string
    altText?: string
    id: string
  }
  folder?: string
  className?: string
}

export default function Upload({ 
  onUploadComplete, 
  existingImage,
  folder = 'blueblog',
  className 
}: UploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(existingImage?.url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }

      onUploadComplete(data.image)
    } catch (error) {
      console.error('Upload error:', error)
      setPreview(null)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Preview */}
        {preview && (
          <div className="relative overflow-hidden rounded-lg border">
            <img
  src={preview}
  alt="Preview"
  className="h-48 w-full object-cover"
/>

            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Upload Area */}
        {!preview && (
          <div
            className={`relative rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-primary-400 ${
              uploading ? 'bg-gray-50' : ''
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                {uploading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
                ) : (
                  <UploadIcon className="h-6 w-6 text-gray-400" />
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {uploading ? 'Uploading...' : 'Upload an image'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Select File
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}