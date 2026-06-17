// components/Footer.tsx
import Link from 'next/link'
import {
  Facebook,
  Twitter,
  Instagram,
  Github,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { unstable_noStore as noStore } from 'next/cache'
import { Logo } from '@/components/ui/Logo'
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
  noStore()
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
    <footer className="relative mt-0 bg-ink-charcoal border-t border-mid-graphite overflow-hidden">
      {/* Premium Gradient Line Separator */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-electric-cobalt via-vivid-violet to-electric-cobalt" />
      
      {/* Decorative Glow */}
      <div className="absolute -top-40 right-10 w-[300px] h-[300px] bg-electric-cobalt/10 rounded-full blur-[100px] pointer-events-none animate-glow-pulse-1" />

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-16 relative z-10">
        {/* ===============================
            Main grid
        =============================== */}
        <div className="grid gap-12 md:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <Link
              href="/"
              className="group flex items-center gap-3 text-xl font-semibold text-pure-white"
            >
              <Logo
                src={settings.site_logo}
                alt={settings.site_name || 'BlueBlog'}
                variant="footer"
              />

              <span className="font-semibold text-pure-white">
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
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-pure-white">
              Explore
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-slate-gray hover:text-pure-white transition-colors duration-150"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-gray hover:text-pure-white transition-colors duration-150"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-gray hover:text-pure-white transition-colors duration-150"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          {(social.twitter?.trim() || social.facebook?.trim() || social.instagram?.trim() || social.github?.trim()) && (
            <div>
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-widest text-pure-white">
                Connect
              </h3>

              <div className="flex gap-2.5">
                {social.twitter && social.twitter.trim() !== '' && (
                  <a
                    href={normalizeUrl(social.twitter)!}
                    target="_blank"
                    aria-label="Twitter"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-mid-graphite border border-mid-graphite text-slate-gray hover:text-pure-white hover:bg-black transition-all duration-200"
                  >
                    <Twitter className="h-4.5 w-4.5" />
                  </a>
                )}
                {social.facebook && social.facebook.trim() !== '' && (
                  <a
                    href={normalizeUrl(social.facebook)!}
                    target="_blank"
                    aria-label="Facebook"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-mid-graphite border border-mid-graphite text-slate-gray hover:text-pure-white hover:bg-black transition-all duration-200"
                  >
                    <Facebook className="h-4.5 w-4.5" />
                  </a>
                )}
                {social.instagram && social.instagram.trim() !== '' && (
                  <a
                    href={normalizeUrl(social.instagram)!}
                    target="_blank"
                    aria-label="Instagram"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-mid-graphite border border-mid-graphite text-slate-gray hover:text-pure-white hover:bg-black transition-all duration-200"
                  >
                    <Instagram className="h-4.5 w-4.5" />
                  </a>
                )}
                {social.github && social.github.trim() !== '' && (
                  <a
                    href={normalizeUrl(social.github)!}
                    target="_blank"
                    aria-label="GitHub"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-mid-graphite border border-mid-graphite text-slate-gray hover:text-pure-white hover:bg-black transition-all duration-200"
                  >
                    <Github className="h-4.5 w-4.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===============================
            Bottom
        =============================== */}
        <div className="mt-16 border-t border-mid-graphite pt-8 text-center text-xs text-slate-gray">
          <p>
            {settings.footer_text ||
              `© ${year} ${settings.site_name || 'BlueBlog'}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  )
}
