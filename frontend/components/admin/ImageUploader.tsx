'use client'

import { useState, useRef, useEffect } from 'react'
import { FiUpload, FiX, FiCheck, FiImage } from 'react-icons/fi'
import { imageApi } from '@/lib/api/images'

interface ImageUploaderProps {
  onUploadComplete: (image: { id: string; url: string }) => void
  existingImageUrl?: string | null
  altText?: string
  title?: string
  caption?: string
}

export default function ImageUploader({
  onUploadComplete,
  existingImageUrl,
  altText: initialAltText = '',
  title: initialTitle = '',
  caption: initialCaption = '',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(existingImageUrl || null)
  useEffect(() => {
  if (existingImageUrl) {
    setPreview(existingImageUrl)
  }
}, [existingImageUrl])

  const [altText, setAltText] = useState(initialAltText)
  const [title, setTitle] = useState(initialTitle)
  const [caption, setCaption] = useState(initialCaption)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
  // Validate file
  if (!file.type.startsWith('image/')) {
    setError('Please select an image file')
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    setError('Image size should be less than 5MB')
    return
  }

  setUploading(true)
  setError('')
  setProgress(0)

  // Preview
  const reader = new FileReader()
  reader.onload = (e) => setPreview(e.target?.result as string)
  reader.readAsDataURL(file)

  const interval = setInterval(() => {
    setProgress(p => (p >= 90 ? 90 : p + 10))
  }, 100)

  try {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('altText', altText)
  formData.append('title', title)
  formData.append('caption', caption)

  const res = await imageApi.upload(formData)

  // 👇 TEMP SAFE CAST (NO TYPE BREAK)
  const image = (res as any).data.image

  clearInterval(interval)
  setProgress(100)

  onUploadComplete({
    id: image.id,
    url: image.url,
  })
} catch {
  setError('Upload failed. Please try again.')
} finally {
  setUploading(false)
}

}


  const handleRemoveImage = () => {
    setPreview(null)
    setAltText('')
    setTitle('')
    setCaption('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) uploadFile(file)
}

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()

  const file = e.dataTransfer.files[0]
  if (file) uploadFile(file)
}


  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Featured Image
        </label>
        {existingImageUrl && !uploading && (
  <div className="p-3 text-sm text-yellow-800 border border-yellow-200 rounded-lg bg-yellow-50">
    A featured image already exists. Uploading a new image will replace it.
  </div>
)}

        {!preview ? (
          <div
            className="p-8 text-center transition-colors border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-primary-500"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full">
              <FiUpload size={24} className="text-gray-400" />
            </div>
            
            <div className="space-y-2">
              <p className="font-medium text-gray-700">
                Drop your image here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports: JPG, PNG, WebP (Max 5MB)
              </p>
              <p className="text-xs text-gray-400">
                Recommended: 1200x630px for optimal display
              </p>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden border rounded-xl">
            <img
              src={preview}
              alt="Preview"
              className="object-cover w-full h-64"
            />
            
            <div className="absolute flex gap-2 top-3 right-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                <FiImage size={18} />
              </button>
              <button
                onClick={handleRemoveImage}
                className="p-2 rounded-lg bg-white/90 backdrop-blur-sm hover:bg-white"
              >
                <FiX size={18} />
              </button>
            </div>
            
            {uploading && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gray-900/50">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 bg-primary-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-center text-white">
                  {progress}% Uploading...
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-600 rounded-lg bg-red-50">
            {error}
          </div>
        )}
      </div>

      {preview && (
        <div className="p-4 space-y-4 rounded-lg bg-gray-50">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Alt Text (Required for SEO)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe what's in the image"
              className="input-field"
            />
            <p className="mt-1 text-xs text-gray-500">
              Helps screen readers and improves SEO
            </p>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Image Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title of the image"
              className="input-field"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Caption (Optional)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Image caption shown below the image"
              rows={2}
              className="input-field"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <FiCheck size={16} />
              <span>Image uploaded successfully</span>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-primary-600 hover:text-primary-700"
            >
              Replace Image
            </button>
          </div>
        </div>
      )}

      {/* SEO Tips */}
      <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
        <h4 className="mb-2 font-medium text-blue-900">SEO Tips for Images</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <FiCheck size={14} className="mt-0.5 flex-shrink-0" />
            <span>Use descriptive alt text that includes your target keyword</span>
          </li>
          <li className="flex items-start gap-2">
            <FiCheck size={14} className="mt-0.5 flex-shrink-0" />
            <span>Keep file names descriptive (e.g., "seo-friendly-blog-images.jpg")</span>
          </li>
          <li className="flex items-start gap-2">
            <FiCheck size={14} className="mt-0.5 flex-shrink-0" />
            <span>Optimize image size for faster loading</span>
          </li>
          <li className="flex items-start gap-2">
            <FiCheck size={14} className="mt-0.5 flex-shrink-0" />
            <span>Use WebP format for better compression</span>
          </li>
        </ul>
      </div>
    </div>
  )
}