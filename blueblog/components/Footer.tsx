// components/Footer.tsx
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Github, Heart } from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getSettings() {
  const rows = await prisma.setting.findMany()

  const settings: any = {
    site_name: 'BlueBlog',
    site_description: '',
    footer_text: '',
    social_links: {},
  }

  for (const row of rows) {
    if (row.key === 'social_links') {
      try {
        settings.social_links = JSON.parse(row.value || '{}')
      } catch {
        settings.social_links = {}
      }
    } else {
      settings[row.key] = row.value
    }
  }

  return settings
}

export default async function Footer() {
  const settings = await getSettings()
  const year = new Date().getFullYear()
  const social = settings.social_links || {}

  return (
    <footer className="mt-auto border-t bg-secondary-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">

          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-2">
              {settings.site_logo && (
  <img
    src={settings.site_logo}
    alt="Site logo"
    className="h-8 w-8 object-contain"
  />
)}

              <span className="text-xl font-bold text-gray-900">
                {settings.site_name}
              </span>
            </Link>
            {settings.site_description && (
              <p className="mt-4 text-gray-600">
                {settings.site_description}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-gray-600">
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Connect</h3>
            <div className="flex gap-3">
              {social.twitter && (
                <a href={social.twitter} target="_blank">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {social.facebook && (
                <a href={social.facebook} target="_blank">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {social.github && (
                <a href={social.github} target="_blank">
                  <Github className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t pt-6 text-center text-gray-600">
          <p>
            {settings.footer_text ||
              `© ${year} ${settings.site_name}. All rights reserved.`}
          </p>
          <p className="mt-2 text-sm">
            Made with <Heart className="inline h-4 w-4 text-red-500" />
          </p>
        </div>
      </div>
    </footer>
  )
}
