'use client'

import { useState, useEffect } from 'react'
import { Save, Globe, Link as LinkIcon, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

interface SiteSettings {
  site_name: string
  site_description: string
  contact_email: string
  footer_text: string
  site_logo?: string
  social_links: {
    twitter?: string
    facebook?: string
    instagram?: string
    github?: string
  }
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: '',
    site_description: '',
    contact_email: '',
    footer_text: '',
    site_logo: '',
    social_links: {}
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      if (response.ok) {
        setSettings(data)
      }
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const uploadLogo = async (file: File) => {
  // instant preview
  const localPreview = URL.createObjectURL(file)
  setSettings(s => ({ ...s, site_logo: localPreview }))

  const form = new FormData()
  form.append('file', file)

  const res = await fetch('/api/upload/cloudinary', {
    method: 'POST',
    body: form,
  })

  const data = await res.json()

  if (!res.ok || !data.image?.url) {
    toast.error('Logo upload failed')
    return
  }

  // replace preview with real url
  setSettings(s => ({ ...s, site_logo: data.image.url }))
}


  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save settings')
      }

      toast.success('Settings saved successfully')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your site configuration</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <div className="rounded-xl border bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-primary-100 p-2">
              <SettingsIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
              <p className="text-sm text-gray-600">Basic site configuration</p>
            </div>
          </div>

          <div>
  <label className="block text-sm font-medium text-gray-700">
    Site Logo
  </label>

  <div className="flex items-center gap-4 mt-2">
    <img
      src={settings.site_logo || '/logo-placeholder.png'}
      alt="Site Logo"
      className="h-16 w-16 rounded-lg border object-contain bg-white"
    />

    <label className="cursor-pointer text-sm text-primary-600">
      Change Logo
      <input
        type="file"
        hidden
        accept="image/*"
        onChange={e => {
  const file = e.target.files?.[0]
  if (file) {
    uploadLogo(file)
  }
}}

      />
    </label>
  </div>
</div>


          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Site Name
              </label>
              <Input
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="BlueBlog"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Site Description
              </label>
              <textarea
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="A modern, SEO-optimized blogging platform"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Email
              </label>
              <Input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                placeholder="contact@blueblog.com"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="rounded-xl border bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Social Media</h2>
              <p className="text-sm text-gray-600">Your social media profiles</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Twitter
              </label>
              <div className="mt-1 flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
                  twitter.com/
                </span>
                <Input
                  value={settings.social_links?.twitter || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    social_links: { ...settings.social_links, twitter: e.target.value }
                  })}
                  className="rounded-l-none"
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Facebook
              </label>
              <div className="mt-1 flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
                  facebook.com/
                </span>
                <Input
                  value={settings.social_links?.facebook || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    social_links: { ...settings.social_links, facebook: e.target.value }
                  })}
                  className="rounded-l-none"
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Instagram
              </label>
              <div className="mt-1 flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
                  instagram.com/
                </span>
                <Input
                  value={settings.social_links?.instagram || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    social_links: { ...settings.social_links, instagram: e.target.value }
                  })}
                  className="rounded-l-none"
                  placeholder="username"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Settings */}
        <div className="rounded-xl border bg-white p-6 lg:col-span-2">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-gray-100 p-2">
              <LinkIcon className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Footer Settings</h2>
              <p className="text-sm text-gray-600">Footer text and links</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Footer Text
              </label>
              <textarea
                value={settings.footer_text}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                rows={4}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="© 2024 BlueBlog. All rights reserved."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}