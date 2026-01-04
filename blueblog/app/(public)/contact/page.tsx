'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import { Mail, Phone, MapPin, Send, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { generateSEO } from '@/lib/seo'
import toast from 'react-hot-toast'

export const metadata: Metadata = generateSEO({
  title: 'Contact Us',
  description: 'Get in touch with us',
})

export default function ContactPage() {
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message')
      }

      toast.success('Message sent successfully!')
      setSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-400 py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center text-white">
            <h1 className="mb-6 text-4xl font-bold sm:text-5xl">Get in Touch</h1>
            <p className="text-xl opacity-90">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div className="rounded-2xl border bg-white p-8 shadow-lg">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Send us a message</h2>
                <p className="mt-2 text-gray-600">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </div>

              {submitted ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    Message Sent Successfully!
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Thank you for contacting us. We'll get back to you soon.
                  </p>
                  <Button onClick={() => setSubmitted(false)} className="gap-2">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Your message here..."
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="rounded-2xl border bg-white p-8 shadow-lg">
                <h3 className="mb-6 text-xl font-bold text-gray-900">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary-100 p-3">
                      <Mail className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Email</h4>
                      <p className="mt-1 text-gray-600">contact@blueblog.com</p>
                      <p className="text-sm text-gray-500">We respond within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-100 p-3">
                      <Phone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Phone</h4>
                      <p className="mt-1 text-gray-600">+1 (555) 123-4567</p>
                      <p className="text-sm text-gray-500">Mon-Fri from 9am to 5pm</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-green-100 p-3">
                      <MapPin className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Location</h4>
                      <p className="mt-1 text-gray-600">123 Blog Street</p>
                      <p className="text-sm text-gray-500">San Francisco, CA 94107</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-purple-100 p-3">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Business Hours</h4>
                      <p className="mt-1 text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-sm text-gray-500">Weekend: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="rounded-2xl border bg-white p-8 shadow-lg">
                <h3 className="mb-6 text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
                
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h4 className="font-medium text-gray-900">How long does it take to get a response?</h4>
                    <p className="mt-1 text-gray-600">
                      We typically respond within 24 hours on weekdays and 48 hours on weekends.
                    </p>
                  </div>
                  
                  <div className="border-b pb-4">
                    <h4 className="font-medium text-gray-900">Can I write for BlueBlog?</h4>
                    <p className="mt-1 text-gray-600">
                      Yes! We're always looking for talented writers. Contact us with your writing samples.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">Do you offer advertising?</h4>
                    <p className="mt-1 text-gray-600">
                      Yes, we offer various advertising options. Contact us for media kit and rates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}