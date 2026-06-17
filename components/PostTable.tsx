'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Edit, Trash2, ExternalLink, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Post, User, Category, Image as ImageType } from '@prisma/client'
import { formatDateTime } from '@/lib/utils'
import { getOptimizedImageUrl } from '@/lib/cloudinary.utils'
import toast from 'react-hot-toast'

interface PostTableProps {
  posts: (Post & {
    author: Pick<User, 'id' | 'name' | 'email'>
    bannerImage: ImageType | null
    categories: Category[]
  })[]
  user: Pick<User, 'id' | 'role'>
  showBulkActions?: boolean
}

export default function PostTable({ posts, user }: PostTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  /* ================= BULK LOGIC ================= */
  const selectedPosts = posts.filter(p => selectedRows.includes(p.id))
  const hasDraft = selectedPosts.some(p => p.status === 'DRAFT')
  const hasPublished = selectedPosts.some(p => p.status === 'PUBLISHED')
  const hasPending = selectedPosts.some(p => p.status === 'VERIFICATION_PENDING')

  const isAdminOrEditor = user.role === 'ADMIN' || user.role === 'EDITOR'

  const canPublish =
    isAdminOrEditor &&
    (hasDraft || hasPending) &&
    !hasPublished

  const canUnpublish =
    isAdminOrEditor &&
    hasPublished &&
    !hasDraft &&
    !hasPending

  const handleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === posts.length ? [] : posts.map(p => p.id)
    )
  }

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const canEdit = (post: Post) =>
    user.role === 'ADMIN' ||
    user.role === 'EDITOR' ||
    (user.role === 'WRITER' && post.authorId === user.id)

  const canDelete = (post: Post) =>
    user.role === 'ADMIN' ||
    (user.role === 'WRITER' && post.authorId === user.id)

  const deleteSingle = async (id: string) => {
    if (!window.confirm('Delete this post?')) return
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
    window.location.reload()
  }

  const runBulk = async (action: 'DELETE' | 'PUBLISH' | 'DRAFT') => {
    setLoading(true)
    try {
      await fetch('/api/admin/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedRows, action }),
      })
      toast.success(`${action === 'PUBLISH' ? 'Published' : action === 'DRAFT' ? 'Moved to draft' : 'Deleted'} ${selectedRows.length} posts`)
      setSelectedRows([])
      window.location.reload()
    } catch {
      toast.error('Action failed')
    } finally {
      setLoading(false)
    }
  }

  // Get status badge style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-50 text-forest border border-green-100'
      case 'VERIFICATION_PENDING':
        return 'bg-lavender-mist text-vivid-violet border border-purple-100'
      default:
        return 'bg-canvas-cream text-slate-gray border border-hairline'
    }
  }

  const getStatusLabel = (status: string) => {
    if (status === 'VERIFICATION_PENDING') return 'Pending'
    return status
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">

      {/* ================= BULK BAR ================= */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-10 mb-4 flex flex-col gap-3 rounded-[16px] bg-pure-white border border-hairline px-4 py-3 shadow-md sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-semibold text-slate-gray">
            {selectedRows.length} selected
          </span>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => runBulk('DELETE')}
              loading={loading}
            >
              Delete
            </Button>

            {canPublish && (
              <Button
                size="sm"
                variant="default"
                onClick={() => runBulk('PUBLISH')}
                loading={loading}
                className="gap-1.5 rounded-full"
              >
                <CheckCircle className="h-4 w-4" />
                Publish
              </Button>
            )}

            {canUnpublish && (
              <Button variant="outline" size="sm" className="rounded-full border-hairline" onClick={() => runBulk('DRAFT')} loading={loading}>
                Move to Draft
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ================= MOBILE LIST ================= */}
      <div className="md:hidden w-full px-2 space-y-3 overflow-x-hidden">

        {posts.map(post => {
          const imageUrl = post.bannerImage?.url
            ? getOptimizedImageUrl(post.bannerImage.url, 320, 180)
            : null

          return (
            <div
              key={post.id}
              className={`w-full max-w-full overflow-hidden rounded-[16px] bg-pure-white border border-hairline p-4 shadow-subtle hover:shadow-md transition-shadow duration-200 ${
                post.status === 'VERIFICATION_PENDING' ? 'border-l-4 border-vivid-violet' : ''
              }`}
            >
              {/* SELECT */}
              <div className="mb-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(post.id)}
                  onChange={() => handleSelectRow(post.id)}
                  className="h-4 w-4 rounded border-hairline accent-electric-cobalt"
                />
                <span className="text-xs font-semibold text-slate-gray">
                  Select
                </span>
              </div>

              {/* IMAGE */}
              {imageUrl && (
                <div className="relative mb-2.5 h-20 w-full overflow-hidden rounded-[8px] border border-hairline">
                  <Image
                    src={imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* TITLE */}
              <Link
                href={`/admin/posts/${post.id}`}
                className="block text-sm font-semibold leading-snug break-words text-ink-charcoal hover:text-electric-cobalt transition-colors"
              >
                {post.title}
              </Link>

              {/* SLUG */}
              <p className="mt-1 text-xs text-slate-gray break-all">
                {post.slug}
              </p>

              {/* META */}
              <div className="mt-2 space-y-1 text-xs text-slate-gray">
                <div>
                  Status:{' '}
                  <span className={`inline-block rounded-[8px] px-2 py-0.5 text-xs font-semibold ${getStatusStyle(post.status)}`}>
                    {getStatusLabel(post.status)}
                  </span>
                </div>

                <div>Author: {post.author.name}</div>
                <div>Created: {formatDateTime(post.createdAt)}</div>
              </div>

              {/* ACTIONS */}
              <div className="mt-3 flex flex-wrap gap-2 border-t border-hairline pt-3">

                {post.status === 'PUBLISHED' && (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="rounded-full p-1.5 hover:bg-canvas-cream text-slate-gray hover:text-ink-charcoal"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}

                {canEdit(post) && (
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="rounded-full p-1.5 hover:bg-canvas-cream text-slate-gray hover:text-ink-charcoal"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                )}

                {canDelete(post) && (
                  <button
                    onClick={() => deleteSingle(post.id)}
                    className="rounded-full p-1.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {posts.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-gray font-semibold">
            No posts found
          </div>
        )}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="min-w-[900px] w-full table-fixed border-separate border-spacing-y-2.5">
          <thead className="text-xs uppercase text-slate-gray font-semibold">
            <tr>
              <th className="w-10 px-4">
                <input
                  type="checkbox"
                  checked={selectedRows.length === posts.length && posts.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-hairline accent-electric-cobalt"
                />
              </th>
              <th className="px-4 text-left w-[320px]">Post</th>
              <th className="px-4 text-left w-[180px]">Author</th>
              <th className="px-4 text-left w-[200px]">Categories</th>
              <th className="px-4 text-left w-[120px]">Status</th>
              <th className="px-4 text-left w-[160px]">Created</th>
              <th className="px-4 text-left w-[140px]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {posts.map(post => {
              const imageUrl = post.bannerImage?.url
                ? getOptimizedImageUrl(post.bannerImage.url, 120, 80)
                : null

              return (
                <tr
                  key={post.id}
                  className={`bg-pure-white border border-hairline shadow-subtle hover:shadow-md transition-shadow duration-200 ${
                    post.status === 'VERIFICATION_PENDING' ? 'border-l-4 border-vivid-violet' : ''
                  }`}
                >
                  <td className="px-4 py-4 rounded-l-[16px] border-y border-l border-hairline">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(post.id)}
                      onChange={() => handleSelectRow(post.id)}
                      className="h-4 w-4 rounded border-hairline accent-electric-cobalt"
                    />
                  </td>

                  <td className="px-4 py-4 border-y border-hairline">
                    <div className="flex gap-3 max-w-[320px]">
                      {imageUrl && (
                        <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-[8px] border border-hairline">
                          <Image
                            src={imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="line-clamp-2 text-sm font-semibold text-ink-charcoal break-words hover:text-electric-cobalt transition-colors"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-slate-gray truncate mt-0.5">
                          {post.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 border-y border-hairline text-sm text-ink-charcoal truncate">
                    {post.author.name}
                  </td>

                  <td className="px-4 py-4 border-y border-hairline">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {post.categories.slice(0, 2).map(cat => (
                        <span
                          key={cat.id}
                          className="rounded-[8px] bg-lavender-mist text-vivid-violet px-2.5 py-0.5 text-xs truncate"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-4 border-y border-hairline">
                    <span className={`inline-block rounded-[8px] px-2.5 py-0.5 text-xs font-semibold ${getStatusStyle(post.status)}`}>
                      {getStatusLabel(post.status)}
                    </span>
                  </td>

                  <td className="px-4 py-4 border-y border-hairline text-xs text-slate-gray">
                    {formatDateTime(post.createdAt)}
                  </td>

                  <td className="px-4 py-4 rounded-r-[16px] border-y border-r border-hairline">
                    <div className="flex gap-1.5">
                      {post.status === 'PUBLISHED' && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-full hover:bg-canvas-cream text-slate-gray hover:text-ink-charcoal transition-colors duration-150"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      {canEdit(post) && (
                        <Link href={`/admin/posts/${post.id}`} className="p-1.5 rounded-full hover:bg-canvas-cream text-slate-gray hover:text-ink-charcoal transition-colors duration-150">
                          <Edit className="h-4 w-4" />
                        </Link>
                      )}
                      {canDelete(post) && (
                        <button
                          onClick={() => deleteSingle(post.id)}
                          className="p-1.5 rounded-full hover:bg-red-50 text-red-600 transition-colors duration-150"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="p-10 text-center text-xs text-slate-gray font-semibold">
            No posts found
          </div>
        )}
      </div>
    </div>
  )
}
