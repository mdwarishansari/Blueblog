import prisma from '../utils/prisma'
import { AppError } from '../middlewares/error.middleware'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface Settings {
  siteName: string
  siteUrl: string
  description: string
  siteLogo?: string
  social?: {
    twitter?: string
    facebook?: string
    instagram?: string
    linkedin?: string
    github?: string
  }
  footerHtml?: string
  contactEmail?: string
}

/* -------------------------------------------------------------------------- */
/* Service                                                                    */
/* -------------------------------------------------------------------------- */

export class SettingsService {
  // private readonly defaultSettings: Settings = {
  //   siteName: 'BlueBlog',
  //   siteUrl: 'http://localhost:3000',
  //   description: 'A modern, SEO-optimized blogging platform',
  //   social: {},
  // }

  /* ------------------------------ GET SETTINGS ----------------------------- */
  async getSettings(): Promise<Settings> {
  const rows = await prisma.setting.findMany()

  const normalized: Partial<Settings> = {}

  for (const row of rows) {
    let value: any
    try {
      value = JSON.parse(row.value)
    } catch {
      value = row.value
    }

    switch (row.key) {
      case 'site_name':
        normalized.siteName = value
        break

      case 'site_description':
        normalized.description = value
        break

      case 'footer_text':
        normalized.footerHtml = value
        break

      case 'contact_email':
        normalized.contactEmail = value
        break

      case 'site_logo':
        normalized.siteLogo = value
        break

      case 'social_links':
        normalized.social = value
        break
    }
  }

  return {
    siteName: normalized.siteName ?? 'BlueBlog',
    siteUrl: 'http://localhost:3000', 
    description: normalized.description ?? '',
    footerHtml: normalized.footerHtml ?? '',
    contactEmail: normalized.contactEmail ?? '',
    siteLogo: normalized.siteLogo ?? '',
    social: normalized.social ?? {},
  }
}


  /* ----------------------------- UPDATE SETTINGS ---------------------------- */
  async updateSettings(newSettings: Partial<Settings>) {
  const keyMap: Record<string, string> = {
    siteName: 'site_name',
    description: 'site_description',
    footerHtml: 'footer_text',
    contactEmail: 'contact_email',
    siteLogo: 'site_logo',
    social: 'social_links',
  }

  for (const [camelKey, value] of Object.entries(newSettings)) {
    if (value === undefined) continue

    const dbKey = keyMap[camelKey]
    if (!dbKey) continue

    await prisma.setting.upsert({
      where: { key: dbKey },
      update: {
        value: typeof value === 'string'
          ? value
          : JSON.stringify(value),
      },
      create: {
        key: dbKey,
        value: typeof value === 'string'
          ? value
          : JSON.stringify(value),
      },
    })
  }

  return this.getSettings()
}


  /* ----------------------------- SOCIAL LINKS ------------------------------- */
  async getSocialLinks() {
    const settings = await this.getSettings()
    return settings.social || {}
  }

  async updateSocialLinks(social: Settings['social']) {
    if (!social) {
      throw new AppError('Invalid social links payload', 400)
    }

    const current = await this.getSettings()

    return this.updateSettings({
      social: {
        ...current.social,
        ...social,
      },
    })
  }

  /* ------------------------------- SITE INFO -------------------------------- */
  async getSiteInfo() {
    const settings = await this.getSettings()

    return {
      siteName: settings.siteName,
      siteUrl: settings.siteUrl,
      description: settings.description,
      siteLogo: settings.siteLogo ?? null,
    }
  }

  async updateSiteInfo(siteInfo: {
    siteName?: string
    siteUrl?: string
    description?: string
  }) {
    return this.updateSettings(siteInfo)
  }
}

/* -------------------------------------------------------------------------- */

export default new SettingsService()
