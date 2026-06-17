'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Upload, X, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export interface ImageUploadFieldProps {
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

export function ImageUploadField({
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
}: ImageUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSelectedFile, setLastSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Format allowed types for display helper text
  const displayExtensions = allowedTypes
    .map((type) => {
      if (type === 'image/jpeg') return 'JPG, JPEG'
      if (type === 'image/png') return 'PNG'
      if (type === 'image/webp') return 'WEBP'
      if (type === 'image/svg+xml') return 'SVG'
      if (type === 'image/gif') return 'GIF'
      return type.split('/')[1]?.toUpperCase() || type
    })
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(', ')

  // Cleanup object URL preview to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  // Reset local preview when currentImageUrl is cleared or changed
  useEffect(() => {
    if (!currentImageUrl) {
      setPreviewUrl(null)
    }
  }, [currentImageUrl])

  const validateFile = (file: File): boolean => {
    setError(null)

    // Check type
    if (!allowedTypes.includes(file.type)) {
      const msg = `Invalid format. Allowed: ${displayExtensions}`
      setError(msg)
      toast.error(msg)
      return false
    }

    // Check size
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      const msg = `File is too large (${sizeMB.toFixed(1)}MB). Max size is ${maxSizeMB}MB.`
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
      setLastSelectedFile(file)
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
    setLastSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (onClear) onClear()
  }

  const handleRetry = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (lastSelectedFile) {
      setError(null)
      onFileSelect(lastSelectedFile)
    } else {
      fileInputRef.current?.click()
    }
  }

  const activeImage = previewUrl || currentImageUrl

  return (
    <div className={cn('space-y-3 w-full', className)}>
      {/* Upload zone wrapper */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed border-hairline rounded-[16px] p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[180px] bg-canvas-cream/50 hover:bg-pure-white hover:border-electric-cobalt/40',
          dragActive && 'border-electric-cobalt bg-pure-white ring-4 ring-electric-cobalt/5',
          error && 'border-rose-300 hover:border-rose-400 bg-rose-50/10',
          isAvatar && 'rounded-full aspect-square w-32 h-32 min-h-0 p-0 overflow-hidden mx-auto',
          uploading && 'cursor-not-allowed pointer-events-none'
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
          /* Loading / Uploading state */
          <div className="flex flex-col items-center justify-center gap-3 py-4 w-full h-full">
            <div className="relative flex items-center justify-center">
              <RefreshCw className="h-10 w-10 text-electric-cobalt animate-spin" />
            </div>
            {!isAvatar && (
              <div className="w-48 space-y-2 text-center">
                <p className="text-xs font-semibold text-ink-charcoal">Uploading image...</p>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-electric-gradient transition-all duration-300 ease-out" 
                    style={{ width: `${progress > 0 ? progress : 45}%` }} 
                  />
                </div>
                {progress > 0 && <span className="text-[10px] text-slate-gray font-bold">{progress}% completed</span>}
              </div>
            )}
          </div>
        ) : error ? (
          /* Error state with retry */
          <div className="flex flex-col items-center justify-center gap-3 py-4 px-2">
            <div className="p-3 bg-rose-100 rounded-full text-rose-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-semibold text-ink-charcoal">{error}</p>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-3 py-1.5 text-xs font-semibold bg-electric-cobalt text-pure-white rounded-lg shadow-sm hover:bg-electric-cobalt/90 hover:scale-105 transition-all duration-200"
                >
                  Retry Upload
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-1.5 text-xs font-semibold border border-hairline bg-pure-white text-ink-charcoal rounded-lg shadow-sm hover:bg-canvas-cream transition-all duration-200"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        ) : activeImage ? (
          /* Preview state (current image or newly selected file) */
          <div className={cn('relative group w-full flex flex-col items-center justify-center', isAvatar && 'h-full w-full')}>
            <div className={cn('relative max-h-[220px] rounded-[12px] overflow-hidden border border-hairline bg-pure-white flex items-center justify-center p-2', isAvatar && 'h-full w-full max-h-none rounded-none border-none p-0')}>
              <img
                src={activeImage}
                alt={`${typeLabel} preview`}
                className={cn('max-h-[190px] w-auto object-contain rounded-[8px]', isAvatar && 'h-full w-full max-h-none rounded-none object-cover')}
              />
              
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-ink-charcoal/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  className="p-2.5 bg-pure-white rounded-full text-ink-charcoal hover:bg-canvas-cream shadow-md transition-all duration-200 hover:scale-110"
                  title="Replace image"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2.5 bg-rose-500 rounded-full text-pure-white hover:bg-rose-600 shadow-md transition-all duration-200 hover:scale-110"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Idle/Empty drag zone */
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <div className="p-3.5 bg-pure-white border border-hairline rounded-[14px] shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Upload className="h-6 w-6 text-slate-gray" />
            </div>
            {!isAvatar && (
              <div>
                <p className="text-sm font-semibold text-ink-charcoal">
                  Drag & drop your file, or{' '}
                  <span className="text-electric-cobalt hover:underline font-bold">browse files</span>
                </p>
                <p className="text-xs text-slate-gray mt-1">
                  Supports: {displayExtensions}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Centralized display helper text below the field */}
      {!isAvatar && !error && !uploading && (
        <p className="text-xs text-slate-gray px-1 flex items-center gap-1">
          <ImageIcon className="h-3 w-3 text-slate-gray/60" />
          <span>Allowed: <strong>{displayExtensions}</strong> (Max size: <strong>{maxSizeMB}MB</strong>)</span>
        </p>
      )}
    </div>
  )
}
