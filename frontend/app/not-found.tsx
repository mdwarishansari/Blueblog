"use client"
import Link from 'next/link'
import { FiHome, FiSearch, FiFileText, FiArrowLeft } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-100 text-primary-600 text-6xl font-bold mb-6">
          404
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved to another URL.
          Please check the URL or navigate back to the homepage.
        </p>
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/"
            className="group bg-white p-4 rounded-xl border hover:shadow-md transition-shadow text-center"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200">
              <FiHome size={24} className="text-primary-600" />
            </div>
            <div className="font-medium text-gray-900">Homepage</div>
            <div className="text-sm text-gray-500 mt-1">Return to home</div>
          </Link>
          
          <Link
            href="/blog"
            className="group bg-white p-4 rounded-xl border hover:shadow-md transition-shadow text-center"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-100 flex items-center justify-center group-hover:bg-primary-200">
              <FiFileText size={24} className="text-primary-600" />
            </div>
            <div className="font-medium text-gray-900">Browse Blog</div>
            <div className="text-sm text-gray-500 mt-1">Read our articles</div>
          </Link>
        </div>
        
        {/* Search Form */}
        <div className="bg-white p-6 rounded-xl border mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Search Instead</h3>
          <form className="flex gap-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="search"
                placeholder="What are you looking for?"
                className="pl-10 w-full input-field"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Search
            </button>
          </form>
        </div>
        
        {/* Back Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft size={18} />
            Go Back
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center gap-2 btn-primary"
          >
            <FiHome size={18} />
            Return to Homepage
          </Link>
        </div>
        
        {/* Contact Support */}
        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-gray-500">
            Still can't find what you're looking for?{' '}
            <Link href="/contact" className="text-primary-600 hover:text-primary-700">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}