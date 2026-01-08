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
    <div className="w-full max-w-full overflow-x-auto">
      {/* BULK BAR */}
      {selectedRows.length > 0 && (
        <div className="sticky top-0 z-10 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 elev-sm">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} selected
          </span>

          <div className="flex gap-2">
            <Button
  variant="outline"
  size="sm"
  className="text-red-600 border-red-200 hover:bg-red-50"
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

      {/* TABLE */}
      <table className="min-w-[900px] w-full border-separate border-spacing-y-2 table-fixed">
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
            <th className="px-4 text-left hidden md:table-cell w-[180px]">Author</th>
            <th className="px-4 text-left hidden lg:table-cell w-[200px]">Categories</th>
            <th className="px-4 text-left w-[120px]">Status</th>
            <th className="px-4 text-left hidden xl:table-cell w-[160px]">Created</th>
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
                className="bg-card rounded-xl elev-sm hover:ui-lift ui-transition"
              >
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(post.id)}
                    onChange={() => handleSelectRow(post.id)}
                  />
                </td>

                {/* POST */}
                <td className="px-4 py-4 overflow-hidden">
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

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="block text-sm font-medium text-fg hover:text-primary
                                   line-clamp-2 break-words"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">
                        {post.slug}
                      </p>
                    </div>
                  </div>
                </td>

                {/* AUTHOR */}
                <td className="px-4 py-4 hidden md:table-cell">
                  <p className="text-sm truncate">{post.author.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {post.author.email}
                  </p>
                </td>

                {/* CATEGORIES */}
                <td className="px-4 py-4 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {post.categories.slice(0, 2).map(cat => (
                      <span
                        key={cat.id}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs truncate"
                      >
                        {cat.name}
                      </span>
                    ))}
                    {post.categories.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{post.categories.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                {/* STATUS */}
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      post.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {post.status}
                  </span>
                </td>

                {/* CREATED */}
                <td className="px-4 py-4 text-sm text-muted-foreground hidden xl:table-cell truncate">
                  {formatDateTime(post.createdAt)}
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    {post.status === 'PUBLISHED' && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 rounded-lg hover:bg-muted"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}

                    {canEdit(post) && (
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="p-2 rounded-lg hover:bg-muted"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    )}

                    {canDelete(post) && (
                      <button
                        onClick={() => deleteSingle(post.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-600"
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

      {/* EMPTY */}
      {posts.length === 0 && (
        <div className="p-12 text-center text-muted-foreground">
          No posts found
        </div>
      )}
    </div>
  )
}
