import prisma from '../utils/prisma'
import { AppError } from '../middlewares/error.middleware'

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

export class SettingsService {
  private readonly defaultSettings: Settings = {
    siteName: 'BlueBlog',
    siteUrl: 'http://localhost:3000',
    description: 'A modern, SEO-optimized blogging platform',
    social: {},
  }

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
      case 'site_logo':
        normalized.siteLogo = value
        break

      case 'site_name':
        normalized.siteName = value
        break

      case 'site_url':
        normalized.siteUrl = value
        break

      case 'description':
        normalized.description = value
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
        // ❌ ignore unknown keys safely
        break
    }
  }

  return {
    ...this.defaultSettings,
    ...normalized,
  }
}


  async updateSettings(newSettings: Partial<Settings>) {
    // Convert settings object to array of key-value pairs
    const settingsArray = Object.entries(newSettings).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
    }))

    // Update or create each setting
    for (const setting of settingsArray) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      })
    }

    return this.getSettings()
  }

  async getSocialLinks() {
    const settings = await this.getSettings()
    return settings.social || {}
  }

  async updateSocialLinks(social: Settings['social']) {
    const currentSettings = await this.getSettings()
    const updatedSettings = {
      ...currentSettings,
      social: { ...currentSettings.social, ...social },
    }

    return this.updateSettings(updatedSettings)
  }

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
    const currentSettings = await this.getSettings()
    const updatedSettings = { ...currentSettings, ...siteInfo }

    return this.updateSettings(updatedSettings)
  }
}

export default new SettingsService()