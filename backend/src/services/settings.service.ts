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
  private readonly defaultSettings: Settings = {
    siteName: 'BlueBlog',
    siteUrl: 'http://localhost:3000',
    description: 'A modern, SEO-optimized blogging platform',
    social: {},
  }

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
        case 'siteName':
          normalized.siteName = value
          break

        case 'siteUrl':
          normalized.siteUrl = value
          break

        case 'description':
          normalized.description = value
          break

        case 'siteLogo':
          normalized.siteLogo = value
          break

        case 'social':
          normalized.social = value
          break

        case 'footerHtml':
          normalized.footerHtml = value
          break

        case 'contactEmail':
          normalized.contactEmail = value
          break

        default:
          // ignore unknown keys safely
          break
      }
    }

    return {
      ...this.defaultSettings,
      ...normalized,
    }
  }

  /* ----------------------------- UPDATE SETTINGS ---------------------------- */
  async updateSettings(newSettings: Partial<Settings>) {
    const entries = Object.entries(newSettings)

    for (const [key, value] of entries) {
      if (value === undefined) continue

      await prisma.setting.upsert({
        where: { key },
        update: {
          value: typeof value === 'string' ? value : JSON.stringify(value),
        },
        create: {
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
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
