// components/Footer.tsx
import Link from 'next/link'
import {
  Facebook,
  Twitter,
  Instagram,
  Github,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
function normalizeUrl(url?: string) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `https://${url}`
}

/* -------------------------------------
   Data
------------------------------------- */
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

/* -------------------------------------
   Component
------------------------------------- */
export default async function Footer() {
  const settings = await getSettings()
  const year = new Date().getFullYear()
  const social = settings.social_links || {}

  return (
    <footer className="relative mt-20 bg-pure-white border-t border-hairline overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 relative z-10">
        {/* ===============================
            Main grid
        =============================== */}
        <div className="grid gap-12 md:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <Link
              href="/"
              className="group flex items-center gap-3 text-xl font-semibold text-ink-charcoal"
            >
              {settings.site_logo ? (
                <img
                  src={settings.site_logo}
                  alt="Site logo"
                  className="h-9 w-9 object-contain rounded-full"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-ivory border border-hairline text-sm font-bold text-ink-charcoal">
                  B
                </div>
              )}

              <span className="font-semibold text-ink-charcoal">
                {settings.site_name || 'BlueBlog'}
              </span>
            </Link>

            {settings.site_description && (
              <p className="max-w-md text-sm text-slate-gray">
                {settings.site_description}
              </p>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-ink-charcoal">
              Explore
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-slate-gray hover:text-ink-charcoal transition-colors duration-150"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-gray hover:text-ink-charcoal transition-colors duration-150"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-gray hover:text-ink-charcoal transition-colors duration-150"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-ink-charcoal">
              Connect
            </h3>

            <div className="flex gap-2.5">
              {social.twitter && (
                <a
                  href={normalizeUrl(social.twitter)!}
                  target="_blank"
                  aria-label="Twitter"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-pure-white border border-hairline text-slate-gray hover:text-ink-charcoal hover:bg-canvas-cream transition-all duration-200"
                >
                  <Twitter className="h-4.5 w-4.5" />
                </a>
              )}
              {social.facebook && (
                <a
                  href={normalizeUrl(social.facebook)!}
                  target="_blank"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-pure-white border border-hairline text-slate-gray hover:text-ink-charcoal hover:bg-canvas-cream transition-all duration-200"
                >
                  <Facebook className="h-4.5 w-4.5" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={normalizeUrl(social.instagram)!}
                  target="_blank"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-pure-white border border-hairline text-slate-gray hover:text-ink-charcoal hover:bg-canvas-cream transition-all duration-200"
                >
                  <Instagram className="h-4.5 w-4.5" />
                </a>
              )}
              {social.github && (
                <a
                  href={normalizeUrl(social.github)!}
                  target="_blank"
                  aria-label="GitHub"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-pure-white border border-hairline text-slate-gray hover:text-ink-charcoal hover:bg-canvas-cream transition-all duration-200"
                >
                  <Github className="h-4.5 w-4.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ===============================
            Bottom
        =============================== */}
        <div className="mt-16 border-t border-hairline pt-8 text-center text-xs text-steel-gray">
          <p>
            {settings.footer_text ||
              `© ${year} ${settings.site_name || 'BlueBlog'}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  )
}
