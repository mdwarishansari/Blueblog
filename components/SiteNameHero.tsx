import { getSiteSettings } from '@/lib/getSiteSettings'

export default async function SiteNameHero() {
  const settings = await getSiteSettings()
  const siteName = settings['site_name'] ?? 'BlueBlog'

  return (
    <span className="bg-gradient-to-r from-ink-charcoal via-ink-charcoal to-electric-cobalt bg-clip-text text-transparent underline decoration-electric-cobalt/40 underline-offset-8 decoration-3">
      {siteName}
    </span>
  )
}
