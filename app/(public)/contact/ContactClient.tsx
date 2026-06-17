'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Send, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import toast from 'react-hot-toast'

export default function ContactClient({ settings }: { settings: any }) {
  const email = settings?.contact_email || 'contact@blueblog.com'
  const phone = settings?.contact_phone || '+1 (555) 123-4567'
  const location = settings?.contact_location || 'San Francisco, CA'
  const hours = settings?.contact_hours || 'Mon–Fri, 9am–6pm'
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
    <div className="min-h-screen bg-canvas-cream pb-12">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-canvas-cream to-lavender-mist/50 py-20 border-b border-hairline">
        <Container className="relative z-10 text-center">
          <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-pure-white border border-hairline px-3.5 py-1 text-xs font-semibold text-vivid-violet shadow-sm">
            Contact
          </div>
          <h1 className="mb-4 text-3xl sm:text-[48px] font-bold tracking-tight text-ink-charcoal leading-tight">
            Get in Touch
          </h1>
          <p className="text-base sm:text-lg text-slate-gray max-w-xl mx-auto">
            We'd love to hear from you. Feel free to reach out with any questions.
          </p>
        </Container>
      </section>

      {/* ================= CONTENT ================= */}
      <Section className="py-12">
        <Container className="grid gap-10 lg:grid-cols-2">
          {/* ================= FORM ================= */}
          <Card variant="white" className="p-8 md:p-10">
            {submitted ? (
              <div className="text-center space-y-5 py-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-forest border border-green-100 mb-4">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-ink-charcoal">
                  Message sent successfully!
                </h3>
                <p className="text-sm text-slate-gray max-w-xs mx-auto">
                  Thank you for reaching out. We will get back to you as soon as possible.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="secondary" className="rounded-full">
                  Send another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-gray mb-1.5">
                    Your Name
                  </label>
                  <Input
                    aria-label="Your name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-gray mb-1.5">
                    Your Email
                  </label>
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
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-gray mb-1.5">
                    Your Message
                  </label>
                  <Textarea
                    aria-label="Your message"
                    rows={5}
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={e =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    loading={loading}
                    className="w-full gap-2 rounded-full"
                    type="submit"
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </form>
            )}
          </Card>

          {/* ================= INFO ================= */}
          <div className="space-y-4">
            <InfoCard icon={<Mail className="h-5 w-5" />} title="Email" value={email} />
            <InfoCard icon={<Phone className="h-5 w-5" />} title="Phone" value={phone} />
            <InfoCard icon={<MapPin className="h-5 w-5" />} title="Location" value={location} />
            <InfoCard icon={<Clock className="h-5 w-5" />} title="Hours" value={hours} />
          </div>
        </Container>
      </Section>
    </div>
  )
}

function InfoCard({ icon, title, value }: any) {
  return (
    <Card variant="white" className="flex items-center gap-4 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lavender-mist text-vivid-violet">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-gray">{title}</p>
        <p className="font-medium text-ink-charcoal mt-0.5">{value}</p>
      </div>
    </Card>
  )
}
