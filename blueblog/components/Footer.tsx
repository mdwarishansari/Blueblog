import Link from 'next/link'
import { Facebook, Twitter, Instagram, Github, Heart } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t bg-secondary-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400" />
              <span className="text-xl font-bold text-gray-900">
                {process.env.NEXT_PUBLIC_SITE_NAME || 'BlueBlog'}
              </span>
            </Link>
            <p className="mt-4 text-gray-600">
              {process.env.NEXT_PUBLIC_SITE_DESCRIPTION}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/category/technology" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Technology
                </Link>
              </li>
              <li>
                <Link href="/category/web-development" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href="/category/design" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Design
                </Link>
              </li>
              <li>
                <Link href="/category/business" className="text-gray-600 hover:text-primary-600 transition-colors">
                  Business
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Connect</h3>
            <p className="mb-4 text-gray-600">
              Follow us on social media for updates.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="rounded-lg bg-white p-2 text-gray-700 shadow-sm hover:text-primary-600 hover:shadow transition-all"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-lg bg-white p-2 text-gray-700 shadow-sm hover:text-primary-600 hover:shadow transition-all"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-lg bg-white p-2 text-gray-700 shadow-sm hover:text-primary-600 hover:shadow transition-all"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-lg bg-white p-2 text-gray-700 shadow-sm hover:text-primary-600 hover:shadow transition-all"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-gray-600">
            © {currentYear} {process.env.NEXT_PUBLIC_SITE_NAME || 'BlueBlog'}. All rights reserved.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Made with <Heart className="inline h-4 w-4 text-red-500" /> using Next.js, Tailwind CSS & Prisma
          </p>
        </div>
      </div>
    </footer>
  )
}