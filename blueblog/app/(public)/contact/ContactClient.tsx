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
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-400 py-20 text-white text-center">
        <h1 className="mb-4 text-4xl font-bold">Get in Touch</h1>
        <p className="text-lg opacity-90">
          We’d love to hear from you.
        </p>
      </section>

      <section className="container mx-auto px-4 py-16 grid lg:grid-cols-2 gap-12">
        {/* FORM */}
        <div className="rounded-xl border bg-white p-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <p className="text-lg font-semibold">Message sent!</p>
              <Button onClick={() => setSubmitted(false)}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                placeholder="Your name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                type="email"
                placeholder="Your email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <textarea
                className="w-full rounded-lg border p-3"
                rows={5}
                placeholder="Your message"
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                required
              />
              <Button loading={loading} className="w-full gap-2">
                <Send className="h-4 w-4" /> Send Message
              </Button>
            </form>
          )}
        </div>

        {/* INFO */}
        <div className="space-y-6">
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
    <div className="flex items-center gap-4 bg-white border p-4 rounded-lg">
      <div className="text-primary-600">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-gray-600">{value}</p>
      </div>
    </div>
  )
}
