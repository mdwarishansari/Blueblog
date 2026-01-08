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

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-28 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Contact Messages</h1>
        <p className="text-sm text-slate-500">
          Messages submitted through the contact form
        </p>
      </div>

      {messages.length === 0 && (
        <div className="bg-card elev-sm rounded-xl p-6 text-center text-slate-500">
          No messages yet.
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4">
        {messages.map(msg => {
          const unread = !msg.isRead

          return (
            <div
              key={msg.id}
              onClick={() => unread && markAsRead(msg.id)}
              className={`
                relative
                cursor-pointer
                rounded-2xl
                p-5
                ui-transition
                ui-lift
                ${unread ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-card'}
                elev-sm
                hover:elev-lg
              `}
            >
              {/* Unread indicator */}
              {unread && (
                <span className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-indigo-500" />
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {/* Sender */}
                <div>
                  <p className="font-semibold text-fg">{msg.name}</p>
                  <p className="text-sm text-slate-500">{msg.email}</p>
                </div>

                {/* Meta + actions */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50"
                    onClick={e => {
                      e.stopPropagation()
                      deleteMessage(msg.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Message */}
              <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                {msg.message}
              </p>

              {/* Badge */}
              {unread && (
                <div className="mt-4">
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm">
                    Unread
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
