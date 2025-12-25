'use client'

import { useState } from 'react'
import { FiUser, FiCalendar, FiSend, FiThumbsUp } from 'react-icons/fi'
import { formatDate } from '@/lib/utils/formatDate'

interface Comment {
  id: string
  author: string
  avatar?: string
  content: string
  date: string
  likes: number
  replies?: Comment[]
}

interface CommentsProps {
  postId: string
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'John Doe',
      content: 'Great article! Very informative and well-written.',
      date: '2024-01-15T10:30:00Z',
      likes: 5,
    },
    {
      id: '2',
      author: 'Jane Smith',
      content: 'Thanks for sharing these insights. Looking forward to more content like this.',
      date: '2024-01-14T14:20:00Z',
      likes: 3,
      replies: [
        {
          id: '2-1',
          author: 'Admin',
          content: 'Thank you for your feedback! More content coming soon.',
          date: '2024-01-14T15:00:00Z',
          likes: 1,
        },
      ],
    },
  ])

  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleSubmitComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'You',
      content: newComment,
      date: new Date().toISOString(),
      likes: 0,
    }

    setComments([comment, ...comments])
    setNewComment('')
  }

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return

    const reply: Comment = {
      id: `${parentId}-${Date.now()}`,
      author: 'You',
      content: replyContent,
      date: new Date().toISOString(),
      likes: 0,
    }

    // Find parent comment and add reply
    const updatedComments = comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply],
        }
      }
      return comment
    })

    setComments(updatedComments)
    setReplyContent('')
    setReplyingTo(null)
  }

  const handleLike = (commentId: string, isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      // Update reply like
      const updatedComments = comments.map(comment => {
        if (comment.id === parentId && comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === commentId
                ? { ...reply, likes: reply.likes + 1 }
                : reply
            ),
          }
        }
        return comment
      })
      setComments(updatedComments)
    } else {
      // Update comment like
      const updatedComments = comments.map(comment =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
      setComments(updatedComments)
    }
  }

  return (
    <div className="space-y-8">
      {/* Comment Form */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a Comment</h3>
        <div className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSubmitComment}
              className="inline-flex items-center gap-2 btn-primary"
              disabled={!newComment.trim()}
            >
              <FiSend size={18} />
              Post Comment
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>

        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            {/* Main Comment */}
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <FiUser size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{comment.author}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FiCalendar size={14} />
                      {formatDate(comment.date)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center gap-1 text-gray-600 hover:text-primary-600"
                >
                  <FiThumbsUp size={18} />
                  <span>{comment.likes}</span>
                </button>
              </div>
              
              <p className="text-gray-700 mb-4">{comment.content}</p>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                </button>
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && (
                <div className="mt-4 pl-8 border-l-2 border-gray-200">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleSubmitReply(comment.id)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                      disabled={!replyContent.trim()}
                    >
                      Post Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyContent('')
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 space-y-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <FiUser size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {reply.author}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(reply.date)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleLike(reply.id, true, comment.id)}
                        className="flex items-center gap-1 text-gray-600 hover:text-primary-600 text-sm"
                      >
                        <FiThumbsUp size={14} />
                        <span>{reply.likes}</span>
                      </button>
                    </div>
                    <p className="text-gray-700 text-sm">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  )
}