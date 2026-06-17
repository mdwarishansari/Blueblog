'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export interface ImageUploadPreviewProps {
  currentImageUrl?: string | null | undefined
  onFileSelect: (file: File) => void
  onClear?: () => void
  maxSizeMB: number
  allowedTypes?: string[]
  typeLabel: 'Logo' | 'Profile Image' | 'Category Image' | 'Post Image'
  className?: string
  uploading?: boolean
  progress?: number
  isAvatar?: boolean
}

export function ImageUploadPreview({
  currentImageUrl,
  onFileSelect,
  onClear,
  maxSizeMB,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  typeLabel,
  className,
  uploading = false,
  progress = 0,
  isAvatar = false,
}: ImageUploadPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowedExtensions = allowedTypes.map(type => {
    if (type === 'image/jpeg') return 'JPG, JPEG'
    if (type === 'image/png') return 'PNG'
    if (type === 'image/webp') return 'WEBP'
    if (type === 'image/svg+xml') return 'SVG'
    if (type === 'image/gif') return 'GIF'
    return type.split('/')[1]?.toUpperCase() || type
  }).filter((v, i, a) => a.indexOf(v) === i).join(', ')

  const validateFile = (file: File): boolean => {
    setError(null)

    // Check type
    if (!allowedTypes.includes(file.type)) {
      const msg = `Invalid format. Allowed: ${allowedExtensions}`
      setError(msg)
      toast.error(msg)
      return false
    }

    // Check size
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      const msg = `File is too large (${sizeMB.toFixed(1)}MB). Max size for ${typeLabel} is ${maxSizeMB}MB.`
      setError(msg)
      toast.error(msg)
      return false
    }

    return true
  }

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      onFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (onClear) onClear()
  }

  const activeImage = previewUrl || currentImageUrl

  return (
    <div className={cn('space-y-3 w-full', className)}>
      {/* Upload/Preview Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed border-hairline rounded-[16px] p-6 text-center cursor-pointer ui-transition flex flex-col items-center justify-center min-h-[180px] bg-canvas-cream hover:bg-pure-white hover:border-electric-cobalt/40',
          dragActive && 'border-electric-cobalt bg-pure-white ring-2 ring-electric-cobalt/10',
          error && 'border-rose-300 hover:border-rose-400 bg-rose-50/10',
          isAvatar && 'rounded-full aspect-square w-32 h-32 min-h-0 p-0 overflow-hidden mx-auto'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          className="hidden"
          onChange={handleFileInput}
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-6">
            <RefreshCw className="h-8 w-8 text-electric-cobalt animate-spin" />
            {!isAvatar && (
              <div className="w-32 space-y-1">
                <p className="text-xs font-semibold text-ink-charcoal">Uploading...</p>
                {progress > 0 && (
                  <div className="h-1.5 w-full bg-hairline rounded-full overflow-hidden">
                    <div className="h-full bg-electric-cobalt" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activeImage ? (
          <div className={cn('relative group w-full flex flex-col items-center justify-center', isAvatar && 'h-full w-full')}>
            {/* Image Preview Container */}
            <div className={cn('relative max-h-[220px] rounded-[12px] overflow-hidden border border-hairline bg-pure-white flex items-center justify-center p-2', isAvatar && 'h-full w-full max-h-none rounded-none border-none p-0')}>
              <img
                src={activeImage}
                alt={`${typeLabel} preview`}
                className={cn('max-h-[200px] w-auto object-contain rounded-[8px]', isAvatar && 'h-full w-full max-h-none rounded-none object-cover')}
              />
              
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-ink-charcoal/45 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 ui-transition">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  className="p-2 bg-pure-white rounded-full text-ink-charcoal hover:bg-canvas-cream shadow-sm ui-transition hover:scale-105"
                  title="Replace image"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 bg-rose-500 rounded-full text-pure-white hover:bg-rose-600 shadow-sm ui-transition hover:scale-105"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-6">
            <div className="p-3 bg-pure-white border border-hairline rounded-[12px] shadow-subtle group-hover:scale-105 ui-transition">
              <Upload className="h-6 w-6 text-slate-gray" />
            </div>
            {!isAvatar && (
              <div>
                <p className="text-sm font-semibold text-ink-charcoal">
                  Drag & drop, or{' '}
                  <span className="text-electric-cobalt hover:underline">browse</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper text / error message */}
      {!isAvatar && (
        <div className="flex items-start justify-between gap-4 px-1">
          {error ? (
            <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <p className="text-xs text-slate-gray">
              Allowed: <span className="font-semibold">{allowedExtensions}</span>. Maximum Size:{' '}
              <span className="font-semibold">{maxSizeMB}MB</span>.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
