'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, Edit, Trash2, MoreVertical, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Post, User, Category, Image as ImageType } from '@prisma/client'
import { formatDateTime } from '@/lib/utils'
// import { getOptimizedImageUrl } from '@/lib/cloudinary'
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
    if (selectedRows.length === posts.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(posts.map(post => post.id))
    }
  }

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  const canEdit = (post: Post) => {
    if (user.role === 'ADMIN' || user.role === 'EDITOR') return true
    if (user.role === 'WRITER' && post.authorId === user.id) return true
    return false
  }

  const canDelete = (post: Post) => {
    if (user.role === 'ADMIN') return true
    if (user.role === 'WRITER' && post.authorId === user.id) return true
    return false
  }

  const deleteSingle = async (id: string) => {
  if (!window.confirm('Delete this post?')) return

  await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' })
  window.location.reload()
}

const runBulk = async (action: 'DELETE' | 'PUBLISH' | 'DRAFT') => {
  await fetch('/api/admin/posts/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ids: selectedRows,
      action,
    }),
  })

  setSelectedRows([])
  window.location.reload()
}


  return (
    <div className="overflow-x-auto">
    {selectedRows.length > 0 && (
  <div className="sticky top-0 z-10 mb-4 flex items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm">

    <span className="text-sm text-gray-700">
      {selectedRows.length} selected
    </span>

    <div className="flex gap-2">
      {/* DELETE — always allowed */}
      <Button
  variant="destructive"
  size="sm"
  onClick={() => runBulk('DELETE')}
>
  Delete
</Button>


      {/* PUBLISH */}
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


      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                checked={selectedRows.length === posts.length && posts.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Post
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Author
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Categories
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Created
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {posts.map((post) => {
            const imageUrl = post.bannerImage?.url
              ? getOptimizedImageUrl(post.bannerImage.url, 100, 60)
              : null

            return (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={selectedRows.includes(post.id)}
                    onChange={() => handleSelectRow(post.id)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {imageUrl && (
                      <div className="relative h-10 w-16 flex-shrink-0 overflow-hidden rounded">
                        <Image
                          src={imageUrl}
                          alt={post.bannerImage?.altText || post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="hover:text-primary-600"
                        >
                          {post.title}
                        </Link>
                      </div>
                      <div className="text-sm text-gray-500">{post.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">{post.author.name}</div>
                  <div className="text-sm text-gray-500">{post.author.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {post.categories.slice(0, 2).map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center rounded-full bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700"
                      >
                        {category.name}
                      </span>
                    ))}
                    {post.categories.length > 2 && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        +{post.categories.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    post.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {formatDateTime(post.createdAt)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    {post.status === 'PUBLISHED' && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="View"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {canEdit(post) && (
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    )}
                    {canDelete(post) && (
                      <button
  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
  title="Delete"
  onClick={() => deleteSingle(post.id)}
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
        <div className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Eye className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No posts found</h3>
          <p className="text-gray-600">Get started by creating your first post.</p>
          <Link href="/admin/posts/new" className="mt-4 inline-block">
            <Button>Create Post</Button>
          </Link>
        </div>
      )}
    </div>
  )
}