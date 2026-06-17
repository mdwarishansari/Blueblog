'use client'

import { useEffect, useState } from 'react'
import { Trash2, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'

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
      setMessages(data.messages || [])
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

  return (
    <div className="space-y-6">
      {/* ================= HEADER (ALWAYS VISIBLE) ================= */}
      <div>
        <h1 className="text-2xl font-bold text-ink-charcoal">Contact Messages</h1>
        <p className="text-sm text-slate-gray">
          Messages submitted through the contact form
        </p>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="space-y-4">
        {loading ? (
          /* ===== SKELETON CARDS ===== */
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="relative rounded-[16px] bg-pure-white border border-hairline p-6 shadow-subtle animate-pulse space-y-4"
            >
              <div className="absolute left-0 top-0 h-full w-1 rounded-l-[16px] bg-canvas-cream" />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-40 skeleton" />
                  <div className="h-3 w-52 skeleton" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-3 w-32 skeleton" />
                  <div className="h-8 w-8 rounded-full skeleton" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full skeleton" />
                <div className="h-3 w-11/12 skeleton" />
              </div>
            </div>
          ))
        ) : messages.length === 0 ? (
          /* ===== EMPTY STATE ===== */
          <EmptyState
            title="No messages yet"
            description="Messages submitted by visitors will show up here."
            icon={<Mail className="h-10 w-10 text-slate-gray" />}
          />
        ) : (
          /* ===== REAL DATA ===== */
          messages.map(msg => {
            const unread = !msg.isRead

            return (
              <div
                key={msg.id}
                onClick={() => unread && markAsRead(msg.id)}
                className={`
                  relative cursor-pointer rounded-[16px] p-6 border shadow-subtle ui-transition hoverLift
                  ${unread
                    ? 'bg-surface-ivory border-electric-cobalt/30'
                    : 'bg-pure-white border-hairline'}
                `}
              >
                {unread && (
                  <span className="absolute left-0 top-0 h-full w-1 rounded-l-[16px] bg-electric-cobalt" />
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-ink-charcoal">{msg.name}</p>
                    <p className="text-sm text-slate-gray">{msg.email}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-gray">
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

                <p className="mt-4 whitespace-pre-wrap text-sm text-ink-charcoal leading-relaxed">
                  {msg.message}
                </p>

                {unread && (
                  <div className="mt-4">
                    <Badge variant="blue">
                      Unread
                    </Badge>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
