// lib/getSiteSettings.ts
import { serverApiGet } from '@/lib/serverApi'

export async function getSiteSettings() {
  // Returns a legacy-like object for components expecting { site_name, site_logo, ... }
  const [siteInfoRes, socialRes, settingsRes] = await Promise.all([
    serverApiGet<any>('/settings/site-info', undefined, { revalidate: 60 }),
    serverApiGet<any>('/settings/social-links', undefined, { revalidate: 60 }),
    serverApiGet<any>('/settings', undefined, { revalidate: 60 }).catch(() => null),
  ])

  const siteInfo = siteInfoRes.data || {}
  const social = socialRes.data || {}
  const legacy = settingsRes?.data || {}

  return {
    site_name: legacy.site_name || siteInfo.siteName || 'BlueBlog',
    site_logo: legacy.site_logo || siteInfo.siteLogo || '',
    site_description: legacy.site_description || siteInfo.description || '',
    social_links: social,
  } as Record<string, any>
}
