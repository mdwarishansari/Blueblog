import prisma from '../utils/prisma'
import { AppError } from '../middlewares/error.middleware'

export interface Settings {
  siteName: string
  siteUrl: string
  description: string
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
    const settings = await prisma.setting.findMany()

    // Convert array of settings to object
    const settingsObj = settings.reduce((acc, setting) => {
      try {
        acc[setting.key] = JSON.parse(setting.value)
      } catch {
        acc[setting.key] = setting.value
      }
      return acc
    }, {} as Record<string, any>)

    // Merge with default settings
    return { ...this.defaultSettings, ...settingsObj }
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