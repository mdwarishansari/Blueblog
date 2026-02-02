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
      if (!response.ok) throw new Error(data.message)

      toast.success('Settings saved successfully')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-slate-500">
          Manage your site configuration
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

  {/* ================= GENERAL SETTINGS ================= */}
  <div className="bg-card elev-sm rounded-2xl p-6 space-y-6">
    {loading ? (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-48 rounded bg-muted" />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="h-40 w-40 rounded-2xl bg-muted" />
          <div className="space-y-3">
            <div className="h-10 w-32 rounded bg-muted" />
            <div className="h-3 w-40 rounded bg-muted" />
          </div>
        </div>

        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    ) : (
      <>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-2">
            <SettingsIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">General Settings</h2>
            <p className="text-sm text-slate-500">
              Basic site configuration
            </p>
          </div>
        </div>

        {/* LOGO */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Site Logo</label>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="h-40 w-40 rounded-2xl bg-muted elev-sm flex items-center justify-center overflow-hidden">
              <img
                src={settings.site_logo || '/logo-placeholder.png'}
                alt="Site Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="space-y-2">
              <label className="cursor-pointer inline-block">
                <span className="inline-flex items-center rounded-xl bg-card px-4 py-2 text-sm font-medium elev-sm ui-transition hover:elev-lg hover:scale-[1.02]">
                  Change Logo
                </span>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) uploadLogo(file)
                  }}
                />
              </label>
              <p className="text-xs text-slate-500">
                Square image recommended
              </p>
            </div>
          </div>
        </div>

        {/* SITE NAME */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Site Name</label>
          <Input
            value={settings.site_name}
            onChange={e =>
              setSettings({ ...settings, site_name: e.target.value })
            }
          />
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Site Description</label>
          <textarea
            rows={3}
            value={settings.site_description}
            onChange={e =>
              setSettings({
                ...settings,
                site_description: e.target.value,
              })
            }
            className="w-full rounded-xl bg-card elev-sm px-3 py-2 text-sm ui-transition focus:outline-none focus:elev-lg"
          />
        </div>

        {/* EMAIL */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Contact Email</label>
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
  </div>

  {/* ================= SOCIAL LINKS ================= */}
  <div className="bg-card elev-sm rounded-2xl p-6 space-y-6">
    {loading ? (
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-40 rounded bg-muted" />
          </div>
        </div>

        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-10 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
    ) : (
      <>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-2">
            <Globe className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Social Media</h2>
            <p className="text-sm text-slate-500">
              Public profile links
            </p>
          </div>
        </div>

        {/* Twitter */}
        <div className="space-y-1">
  <label className="flex items-center gap-2 text-sm font-medium">
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
        <div className="space-y-1">
  <label className="flex items-center gap-2 text-sm font-medium">
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
        <div className="space-y-1">
  <label className="flex items-center gap-2 text-sm font-medium">
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
        <div className="space-y-1">
  <label className="flex items-center gap-2 text-sm font-medium">
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
  </div>

  {/* ================= FOOTER ================= */}
  <div className="bg-card elev-sm rounded-2xl p-6 space-y-6 lg:col-span-2">
    {loading ? (
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-48 rounded bg-muted" />
          </div>
        </div>

        <div className="h-32 w-full rounded bg-muted" />
      </div>
    ) : (
      <>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-2">
            <LinkIcon className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Footer</h2>
            <p className="text-sm text-slate-500">
              Footer text and branding
            </p>
          </div>
        </div>

        <textarea
          rows={4}
          value={settings.footer_text}
          onChange={e =>
            setSettings({ ...settings, footer_text: e.target.value })
          }
          className="w-full rounded-xl bg-card elev-sm px-3 py-2 text-sm ui-transition focus:outline-none focus:elev-lg"
        />
      </>
    )}
  </div>

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
