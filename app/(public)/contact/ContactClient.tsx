'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function ContactClient() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success('Message sent successfully!')
      setSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg">

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 py-24 text-center text-white">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight">
          Get in Touch
        </h1>
        <p className="text-lg text-white/90">
          We’d love to hear from you.
        </p>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="container py-20 grid gap-12 lg:grid-cols-2">

        {/* ================= FORM ================= */}
        <div className="rounded-2xl bg-card p-10 elev-sm">
          {submitted ? (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-14 w-14 text-emerald-600" />
              <p className="text-lg font-semibold text-fg">
                Message sent successfully!
              </p>
              <Button onClick={() => setSubmitted(false)}>
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                aria-label="Your name"
                placeholder="Your name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <Input
                aria-label="Your email"
                type="email"
                placeholder="Your email"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <textarea
                aria-label="Your message"
                className="
                  w-full rounded-lg
                  border border-[var(--border)]
                  bg-card
                  px-3 py-2
                  text-sm text-fg
                  placeholder:text-slate-400
                  ui-transition
                  focus-visible:outline-none
                  focus-visible:border-indigo-500
                  focus-visible:ring-2
                  focus-visible:ring-indigo-500/25
                "
                rows={5}
                placeholder="Your message"
                value={formData.message}
                onChange={e =>
                  setFormData({ ...formData, message: e.target.value })
                }
                required
              />

              <Button
                loading={loading}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </form>
          )}
        </div>

        {/* ================= INFO ================= */}
        <div className="space-y-5">
          <Info icon={<Mail />} title="Email" value="contact@blueblog.com" />
          <Info icon={<Phone />} title="Phone" value="+1 (555) 123-4567" />
          <Info icon={<MapPin />} title="Location" value="San Francisco, CA" />
          <Info icon={<Clock />} title="Hours" value="Mon–Fri, 9am–6pm" />
        </div>
      </section>
    </div>
  )
}

function Info({ icon, title, value }: any) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-card p-5 elev-sm">
      <div className="text-indigo-600">{icon}</div>
      <div>
        <p className="font-medium text-fg">{title}</p>
        <p className="text-slate-600">{value}</p>
      </div>
    </div>
  )
}
