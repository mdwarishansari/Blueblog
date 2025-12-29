'use client'

import Link from 'next/link'
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto text-gray-300 bg-gray-900 border-t">
      <div className="px-4 py-10 mx-auto max-w-7xl">
        {/* Top */}
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-8 h-8 font-bold text-gray-900 bg-white rounded-lg">
                B
              </div>
              <span className="text-xl font-bold text-white">
                {process.env.NEXT_PUBLIC_SITE_NAME || 'Blog'}
              </span>
            </Link>
            <p className="max-w-sm text-sm text-gray-400">
              A clean and simple blog for sharing articles, tutorials, and ideas
              that actually matter.
            </p>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white uppercase">
                Platform
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-white uppercase">
                Company
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-white uppercase">
                Social
              </h4>
              <div className="flex gap-3">
                <a href="#" aria-label="GitHub" className="hover:text-white">
                  <FiGithub size={20} />
                </a>
                <a href="#" aria-label="Twitter" className="hover:text-white">
                  <FiTwitter size={20} />
                </a>
                <a href="#" aria-label="LinkedIn" className="hover:text-white">
                  <FiLinkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 mt-10 text-sm text-center text-gray-400 border-t border-gray-800">
          © {year} {process.env.NEXT_PUBLIC_SITE_NAME || 'Blog'}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
