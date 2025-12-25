'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiArrowRight, FiTrendingUp, FiUsers, FiBook } from 'react-icons/fi'

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const stats = [
    { icon: FiTrendingUp, value: '10K+', label: 'Monthly Readers' },
    { icon: FiUsers, value: '500+', label: 'Community Members' },
    { icon: FiBook, value: '200+', label: 'Published Articles' },
  ]

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50 via-white to-secondary-50 border">
      <div className="absolute inset-0 bg-grid-primary-100/10 [mask-image:radial-gradient(white,transparent_70%)]" />
      
      <div className="relative px-6 py-16 md:py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Welcome to{' '}
            <span className="text-primary-600">
              {process.env.NEXT_PUBLIC_SITE_NAME || 'TechBlog Pro'}
            </span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            A modern, SEO-optimized blogging platform where technology meets innovation.
            Discover insightful articles, tutorials, and industry trends from expert writers.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
            >
              Explore Articles
              <FiArrowRight size={18} />
            </Link>
            
            <Link
              href="/admin/login?register=true"
              className="inline-flex items-center justify-center rounded-lg border border-primary-600 px-8 py-3 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
            >
              Start Writing
            </Link>
          </div>
        </div>

        {/* Stats */}
        {mounted && (
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-6 text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 text-primary-600 mb-4">
                  <stat.icon size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}