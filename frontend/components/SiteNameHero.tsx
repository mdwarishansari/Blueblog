import { getSiteSettings } from '@/lib/getSiteSettings'

export default async function SiteNameHero() {
  const settings = await getSiteSettings()
  const siteName = settings['site_name'] ?? 'BlueBlog'

  return (
    <span className="text-white underline decoration-white/30 underline-offset-8">
      {siteName}
    </span>
  )
}
