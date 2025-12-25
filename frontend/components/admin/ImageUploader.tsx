'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiX, FiCheck, FiImage } from 'react-icons/fi'

interface ImageUploaderProps {
  onUploadComplete: (imageData: any) => void
  existingImage?: string
  altText?: string
  title?: string
  caption?: string
}

export default function ImageUploader({
  onUploadComplete,
  existingImage,
  altText: initialAltText = '',
  title: initialTitle = '',
  caption: initialCaption = '',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(existingImage || null)
  const [altText, setAltText] = useState(initialAltText)
  const [title, setTitle] = useState(initialTitle)
  const [caption, setCaption] = useState(initialCaption)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('Image size should be less than 5MB')
      return
    }

    setUploading(true)
    setError('')
    setProgress(0)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    try {
      // In a real implementation, you would upload to your backend API
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      clearInterval(interval)
      setProgress(100)

      // Simulate API response
      const mockImageData = {
        id: `img_${Date.now()}`,
        url: URL.createObjectURL(file), // In real app, this would be Cloudinary URL
        alt_text: altText || file.name,
        title: title || file.name,
        caption,
        width: 1200,
        height: 630,
        format: file.type.split('/')[1],
        size: file.size,
      }

      onUploadComplete(mockImageData)
      
      // Reset progress after success
      setTimeout(() => setProgress(0), 1000)
      
    } catch (err) {
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      // Create a synthetic event to reuse handleFileSelect
      const syntheticEvent = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(syntheticEvent)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Featured Image
        </label>
        
        {!preview ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
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
            
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FiUpload size={24} className="text-gray-400" />
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-700 font-medium">
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
          <div className="relative rounded-xl overflow-hidden border">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white"
              >
                <FiImage size={18} />
              </button>
              <button
                onClick={handleRemoveImage}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white"
              >
                <FiX size={18} />
              </button>
            </div>
            
            {uploading && (
              <div className="absolute bottom-0 left-0 right-0 bg-gray-900/50 p-2">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-white text-center mt-1">
                  {progress}% Uploading...
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {preview && (
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text (Required for SEO)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe what's in the image"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">
              Helps screen readers and improves SEO
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
      <div className="border border-blue-100 bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">SEO Tips for Images</h4>
        <ul className="text-sm text-blue-800 space-y-1">
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