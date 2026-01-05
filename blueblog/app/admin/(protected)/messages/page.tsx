'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)

  const loadMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages')
      const data = await res.json()
      setMessages(data.messages)
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const markAsRead = async (id: string) => {
    await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    setMessages(m =>
      m.map(msg =>
        msg.id === id ? { ...msg, isRead: true } : msg
      )
    )
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Delete this message permanently?')) return

    const res = await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (!res.ok) {
      toast.error('Failed to delete message')
      return
    }

    toast.success('Message deleted')
    setMessages(m => m.filter(msg => msg.id !== id))
  }

  if (loading) return <div>Loading messages…</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Contact Messages</h1>

      {messages.length === 0 && (
        <p className="text-gray-500">No messages yet.</p>
      )}

      {messages.map(msg => (
        <div
          key={msg.id}
          onClick={() => !msg.isRead && markAsRead(msg.id)}
          className={`cursor-pointer rounded-lg border p-4 transition ${
            msg.isRead ? 'bg-white' : 'bg-blue-50'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{msg.name}</p>
              <p className="text-sm text-gray-500">{msg.email}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {new Date(msg.createdAt).toLocaleString()}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={e => {
                  e.stopPropagation()
                  deleteMessage(msg.id)
                }}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>

          <p className="mt-3 text-gray-800 whitespace-pre-wrap">
            {msg.message}
          </p>

          {!msg.isRead && (
            <span className="mt-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
              Unread
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
