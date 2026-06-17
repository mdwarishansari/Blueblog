'use client'

import { useState, useEffect } from 'react'
import {
  Save,
  Globe,
  Link as LinkIcon,
  Settings as SettingsIcon,
  Twitter,
  Facebook,
  Instagram,
  Github,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { ImageUploadPreview } from '@/components/ui/ImageUploadPreview'
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
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: '',
    site_description: '',
    contact_email: '',
    footer_text: '',
    site_logo: '',
    social_links: {},
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings')
      const data = await response.json()
      if (response.ok) setSettings(data)
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const uploadLogo = async (file: File) => {
    setUploadingLogo(true)
    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: form,
      })

      const data = await res.json()
      if (!res.ok || !data.image?.url) {
        toast.error('Logo upload failed')
        return
      }

      setSettings(s => ({ ...s, site_logo: data.image.url }))
      toast.success('Logo uploaded')
    } catch {
      toast.error('Logo upload failed')
    } finally {
      setUploadingLogo(false)
    }
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
      if (!response.ok) throw new Error(data.message)

      toast.success('Settings saved successfully')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-charcoal">Settings</h1>
        <p className="text-sm text-slate-gray">
          Manage your site configuration
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ================= GENERAL SETTINGS ================= */}
        <Card variant="white" className="space-y-6">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[12px] bg-canvas-cream border border-hairline" />
                <div className="space-y-2">
                  <div className="h-4 w-32 skeleton" />
                  <div className="h-3 w-48 skeleton" />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="h-40 w-40 rounded-[16px] bg-canvas-cream border border-hairline" />
                <div className="space-y-3">
                  <div className="h-10 w-32 skeleton" />
                  <div className="h-3 w-40 skeleton" />
                </div>
              </div>

              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-32 skeleton" />
                  <div className="h-10 w-full skeleton" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="rounded-[12px] bg-canvas-cream border border-hairline p-2">
                  <SettingsIcon className="h-5 w-5 text-electric-cobalt" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink-charcoal">General Settings</h2>
                  <p className="text-sm text-slate-gray">
                    Basic site configuration
                  </p>
                </div>
              </div>

              {/* LOGO */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink-charcoal">Site Logo</label>
                <ImageUploadPreview
                  typeLabel="Logo"
                  currentImageUrl={settings.site_logo}
                  onFileSelect={uploadLogo}
                  onClear={() => setSettings(s => ({ ...s, site_logo: '' }))}
                  maxSizeMB={2}
                  allowedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']}
                  uploading={uploadingLogo}
                />
              </div>

              {/* SITE NAME */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink-charcoal">Site Name</label>
                <Input
                  value={settings.site_name}
                  onChange={e =>
                    setSettings({ ...settings, site_name: e.target.value })
                  }
                />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink-charcoal">Site Description</label>
                <Textarea
                  rows={3}
                  value={settings.site_description}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      site_description: e.target.value,
                    })
                  }
                  className="bg-pure-white"
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink-charcoal">Contact Email</label>
                <Input
                  type="email"
                  value={settings.contact_email}
                  onChange={e =>
                    setSettings({ ...settings, contact_email: e.target.value })
                  }
                />
              </div>
            </>
          )}
        </Card>

        {/* ================= SOCIAL LINKS ================= */}
        <Card variant="white" className="space-y-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[12px] bg-canvas-cream border border-hairline" />
                <div className="space-y-2">
                  <div className="h-4 w-32 skeleton" />
                  <div className="h-3 w-40 skeleton" />
                </div>
              </div>

              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-28 skeleton" />
                  <div className="h-10 w-full skeleton" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="rounded-[12px] bg-canvas-cream border border-hairline p-2">
                  <Globe className="h-5 w-5 text-electric-cobalt" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink-charcoal">Social Media</h2>
                  <p className="text-sm text-slate-gray">
                    Public profile links
                  </p>
                </div>
              </div>

              {/* Twitter */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-ink-charcoal">
                  <Twitter className="h-4 w-4 text-sky-500" />
                  Twitter
                </label>

                <Input
                  value={settings.social_links.twitter || ''}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      social_links: {
                        ...settings.social_links,
                        twitter: e.target.value,
                      },
                    })
                  }
                  placeholder="username"
                />
              </div>

              {/* Facebook */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-ink-charcoal">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  Facebook
                </label>

                <Input
                  value={settings.social_links.facebook || ''}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      social_links: {
                        ...settings.social_links,
                        facebook: e.target.value,
                      },
                    })
                  }
                  placeholder="username"
                />
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-ink-charcoal">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  Instagram
                </label>

                <Input
                  value={settings.social_links.instagram || ''}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      social_links: {
                        ...settings.social_links,
                        instagram: e.target.value,
                      },
                    })
                  }
                  placeholder="username"
                />
              </div>

              {/* GitHub */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-sm font-medium text-ink-charcoal">
                  <Github className="h-4 w-4 text-slate-700" />
                  GitHub
                </label>

                <Input
                  value={settings.social_links.github || ''}
                  onChange={e =>
                    setSettings({
                      ...settings,
                      social_links: {
                        ...settings.social_links,
                        github: e.target.value,
                      },
                    })
                  }
                  placeholder="username"
                />
              </div>
            </>
          )}
        </Card>

        {/* ================= FOOTER ================= */}
        <Card variant="white" className="space-y-6 lg:col-span-2">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[12px] bg-canvas-cream border border-hairline" />
                <div className="space-y-2">
                  <div className="h-4 w-32 skeleton" />
                  <div className="h-3 w-48 skeleton" />
                </div>
              </div>

              <div className="h-32 w-full skeleton" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="rounded-[12px] bg-canvas-cream border border-hairline p-2">
                  <LinkIcon className="h-5 w-5 text-electric-cobalt" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-ink-charcoal">Footer</h2>
                  <p className="text-sm text-slate-gray">
                    Footer text and branding
                  </p>
                </div>
              </div>

              <Textarea
                rows={4}
                value={settings.footer_text}
                onChange={e =>
                  setSettings({ ...settings, footer_text: e.target.value })
                }
                className="bg-pure-white"
              />
            </>
          )}
        </Card>

      </div>

      {/* SAVE */}
      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} className="gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  )
}
