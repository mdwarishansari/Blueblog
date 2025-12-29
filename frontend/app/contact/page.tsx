import SEO from '@/components/seo/SEO'
import { FiMail, FiMapPin, FiInfo } from 'react-icons/fi'

export default function ContactPage() {
  return (
    <>
      <SEO
        title="Contact"
        description="Get in touch with us for questions, feedback, or collaboration."
        canonical="/contact"
      />

      <div className="max-w-4xl px-4 py-16 mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Contact</h1>
          <p className="mt-3 text-gray-600">
            We’re happy to hear from you. Reach out using the details below.
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-8 sm:grid-cols-2">
          {/* Email */}
          <div className="p-6 bg-white border rounded-xl">
            <div className="flex items-center gap-3 mb-3 text-primary-600">
              <FiMail size={22} />
              <h3 className="text-lg font-semibold text-gray-900">Email</h3>
            </div>
            <p className="text-gray-600">
              For general inquiries, feedback, or collaboration:
            </p>
            <p className="mt-2 font-medium text-gray-900">
              contact@example.com
            </p>
          </div>

          {/* Location / Info */}
          <div className="p-6 bg-white border rounded-xl">
            <div className="flex items-center gap-3 mb-3 text-primary-600">
              <FiMapPin size={22} />
              <h3 className="text-lg font-semibold text-gray-900">Location</h3>
            </div>
            <p className="text-gray-600">
              This is an online-first platform. Our team works remotely and
              publishes content globally.
            </p>
          </div>
        </div>

        {/* Note */}
        <div className="p-6 mt-12 border rounded-xl bg-gray-50">
          <div className="flex items-center gap-2 mb-2 text-gray-700">
            <FiInfo />
            <span className="font-medium">Note</span>
          </div>
          <p className="text-sm text-gray-600">
            We currently do not support direct contact forms. Please use email
            for all communication. This helps us avoid spam and keep things
            simple.
          </p>
        </div>
      </div>
    </>
  )
}
