'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Edit, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Post, User, Category, Image as ImageType } from '@prisma/client'
import { formatDateTime } from '@/lib/utils'
import { getOptimizedImageUrl } from '@/lib/cloudinary.utils'

interface PostTableProps {
  posts: (Post & {
    author: Pick<User, 'id' | 'name' | 'email'>
    bannerImage: ImageType | null
    categories: Category[]
  })[]
  user: Pick<User, 'id' | 'role'>
}

export default function PostTable({ posts, user }: PostTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  /* ================= BULK LOGIC (UNCHANGED) ================= */
  const selectedPosts = posts.filter(p => selectedRows.includes(p.id))
  const hasDraft = selectedPosts.some(p => p.status === 'DRAFT')
  const hasPublished = selectedPosts.some(p => p.status === 'PUBLISHED')

  const canPublish =
    (user.role === 'ADMIN' || user.role === 'EDITOR') &&
    hasDraft &&
    !hasPublished

  const canUnpublish =
    (user.role === 'ADMIN' || user.role === 'EDITOR') &&
    hasPublished &&
    !hasDraft

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
    await fetch('/api/admin/posts/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedRows, action }),
    })
    setSelectedRows([])
    window.location.reload()
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">

      {/* ================= BULK BAR ================= */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-10 mb-4 flex flex-col gap-3 rounded-xl bg-card px-4 py-3 elev-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} selected
          </span>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => runBulk('DELETE')}
            >
              Delete
            </Button>

            {canPublish && (
              <Button size="sm" onClick={() => runBulk('PUBLISH')}>
                Publish
              </Button>
            )}

            {canUnpublish && (
              <Button variant="outline" size="sm" onClick={() => runBulk('DRAFT')}>
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
              className="w-full max-w-full overflow-hidden rounded-xl bg-card p-2 elev-sm"

            >
              {/* SELECT */}
              <div className="mb-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRows.includes(post.id)}
                  onChange={() => handleSelectRow(post.id)}
                />
                <span className="text-xs text-muted-foreground">
                  Select
                </span>
              </div>

              {/* IMAGE */}
              {imageUrl && (
                <div className="relative mb-2 h-20 w-full overflow-hidden rounded-md">

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
                className="block text-[13px] font-semibold leading-snug break-words"
              >
                {post.title}
              </Link>

              {/* SLUG */}
              <p className="mt-1 text-[11px] text-muted-foreground break-all">
                {post.slug}
              </p>

              {/* META */}
              <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                <div>
  Status:{' '}
  <span
    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
      post.status === 'PUBLISHED'
        ? 'bg-green-100 text-green-700'
        : 'bg-yellow-100 text-yellow-700'
    }`}
  >
    {post.status}
  </span>
</div>

                <div>Author: {post.author.name}</div>
                <div>Created: {formatDateTime(post.createdAt)}</div>
              </div>

              {/* ACTIONS */}
              <div className="mt-3 flex flex-wrap gap-2">

                {post.status === 'PUBLISHED' && (
                  <a
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="rounded-md p-1.5 hover:bg-muted"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}

                {canEdit(post) && (
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="rounded-md p-1.5 hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                )}

                {canDelete(post) && (
                  <button
                    onClick={() => deleteSingle(post.id)}
                    className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {posts.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No posts found
          </div>
        )}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="min-w-[900px] w-full table-fixed border-separate border-spacing-y-2">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr>
              <th className="w-10 px-4">
                <input
                  type="checkbox"
                  checked={selectedRows.length === posts.length && posts.length > 0}
                  onChange={handleSelectAll}
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
                <tr key={post.id} className="bg-card rounded-xl elev-sm">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(post.id)}
                      onChange={() => handleSelectRow(post.id)}
                    />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-3 max-w-[320px]">
                      {imageUrl && (
                        <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg">
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
                          className="line-clamp-2 text-sm font-medium break-words"
                        >
                          {post.title}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                          {post.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 truncate">{post.author.name}</td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {post.categories.slice(0, 2).map(cat => (
                        <span
                          key={cat.id}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs truncate"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </td>

                 <td className="px-4 py-4">
  <span
    className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
      post.status === 'PUBLISHED'
        ? 'bg-green-100 text-green-700'
        : 'bg-yellow-100 text-yellow-700'
    }`}
  >
    {post.status}
  </span>
</td>


                  <td className="px-4 py-4 text-xs">
                    {formatDateTime(post.createdAt)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {canEdit(post) && (
                        <Link href={`/admin/posts/${post.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      )}
                      {canDelete(post) && (
                        <button onClick={() => deleteSingle(post.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
