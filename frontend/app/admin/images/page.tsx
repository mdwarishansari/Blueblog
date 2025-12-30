'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/layout/AdminLayout'
import Loading from '@/components/ui/Loading'
import Button from '@/components/ui/Button'
import { imageApi } from '@/lib/api/images'
import { useAuth } from '@/lib/hooks/useAuth'
import { FiUpload, FiTrash2, FiEye, FiImage } from 'react-icons/fi'

interface ImageItem {
  id: string
  url: string
  altText: string | null
  width: number | null
  height: number | null
  createdAt: string
}

export default function MediaLibraryPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [authLoading, isAuthenticated, router])

  /* ---------------- FETCH IMAGES ---------------- */
  const fetchImages = async () => {
    try {
      setLoading(true)
      const res = await imageApi.getAll()

setImages(
  (res.images || []).map((img: any) => ({
    id: img.id,
    url: img.url,
    altText: img.altText ?? null,
    width: img.width ?? null,
    height: img.height ?? null,
    createdAt: img.createdAt ?? img.created_at ?? '',
  }))
) 
    } catch (err) {
      console.error('Failed to fetch images', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) fetchImages()
  }, [isAuthenticated])

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image permanently?')) return
    await imageApi.delete(id)
    setImages(prev => prev.filter(img => img.id !== id))
  }

  if (authLoading || loading) return <Loading />
  if (!isAuthenticated) return null

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Media Library</h1>
            <p className="text-gray-600">Images from Cloudinary</p>
          </div>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {images.map(img => (
              <div key={img.id} className="overflow-hidden border rounded-lg group">
                <img src={img.url} className="object-cover w-full h-40" />

                <div className="flex justify-center gap-2 py-2 opacity-0 group-hover:opacity-100">
                  <a href={img.url} target="_blank" className="p-2 bg-white rounded">
                    <FiEye />
                  </a>
                  <button onClick={() => handleDelete(img.id)} className="p-2 bg-white rounded">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border rounded-xl">
            <FiImage size={40} className="mx-auto mb-4 text-gray-400" />
            <p>No images found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
