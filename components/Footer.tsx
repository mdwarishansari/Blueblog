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
    <footer className="relative mt-32 bg-slate-900 text-slate-300 overflow-hidden">

      {/* top gradient divider */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

      {/* Decorative floating elements */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl animate-blob" />
      <div className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 right-1/3 h-32 w-32 rounded-full bg-pink-500/10 blur-2xl animate-float" />

      <div className="container mx-auto px-4 py-20 relative z-10">

        {/* ===============================
            Main grid
        =============================== */}
        <div className="grid gap-12 md:grid-cols-4">

          {/* Brand */}
          <div className="space-y-4 md:col-span-2 animate-fade-in-up">
            <Link
              href="/"
              className="group flex items-center gap-3 text-xl font-semibold text-white"
            >
              {settings.site_logo ? (
                <img
                  src={settings.site_logo}
                  alt="Site logo"
                  className="h-9 w-9 object-contain ui-transition group-hover:scale-110"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500 text-sm font-bold text-white ui-transition group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                  B
                </div>
              )}

              <span
                className="
    font-semibold
    bg-gradient-to-r
    from-indigo-400
    via-violet-400
    to-pink-400
    bg-clip-text
    text-transparent
    ui-transition
    group-hover:from-white
    group-hover:via-white
    group-hover:to-white
  "
              >
                {settings.site_name || 'BlueBlog'}
              </span>

            </Link>

            {settings.site_description && (
              <p className="max-w-md text-sm text-slate-400">
                {settings.site_description}
              </p>
            )}
          </div>

          {/* Quick links */}
          <div className="animate-fade-in-up stagger-2">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-200">
              Explore
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="ui-transition hover:text-white hover:translate-x-1 inline-block"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="ui-transition hover:text-white hover:translate-x-1 inline-block"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="ui-transition hover:text-white hover:translate-x-1 inline-block"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="animate-fade-in-up stagger-3">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-200">
              Connect
            </h3>

            <div className="flex gap-3">
              {social.twitter && (
                <a href={normalizeUrl(social.twitter)!} target="_blank"
                  aria-label="Twitter"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 ui-transition hover:bg-gradient-to-br hover:from-indigo-500 hover:to-violet-500 hover:text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-110"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {social.facebook && (
                <a
                  href={normalizeUrl(social.facebook)!}
                  target="_blank"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 ui-transition hover:bg-gradient-to-br hover:from-indigo-500 hover:to-violet-500 hover:text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-110"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={normalizeUrl(social.instagram)!}
                  target="_blank"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 ui-transition hover:bg-gradient-to-br hover:from-indigo-500 hover:to-violet-500 hover:text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-110"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {social.github && (
                <a
                  href={normalizeUrl(social.github)!}
                  target="_blank"
                  aria-label="GitHub"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-300 ui-transition hover:bg-gradient-to-br hover:from-indigo-500 hover:to-violet-500 hover:text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-110"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ===============================
            Bottom
        =============================== */}
        <div className="mt-20 border-t border-slate-800 pt-8 text-center text-sm text-slate-400 space-y-3 animate-fade-in">
          <p>
            {settings.footer_text ||
              `© ${year} ${settings.site_name}. All rights reserved.`}
          </p>


        </div>

      </div>
    </footer>
  )
}
