'use client'

import SEO from '@/components/seo/SEO'
import { useState } from 'react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with us"
        canonical="/contact"
      />

      <div className="max-w-4xl px-4 mx-auto py-14">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Contact</h1>
          <p className="mt-3 text-gray-600">
            Have a question, feedback, or suggestion? Reach out.
          </p>
        </div>

        {/* Form */}
        <div className="p-8 bg-white border shadow-sm rounded-xl">
          {submitted ? (
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Message sent
              </h2>
              <p className="mt-2 text-gray-600">
                Thanks for reaching out. We’ll get back to you if needed.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(true)
              }}
              className="space-y-5"
            >
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  Message
                </label>
                <textarea
                  rows={5}
                  required
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 font-semibold text-white rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
