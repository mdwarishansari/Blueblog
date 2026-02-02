'use client'

import { useEffect, useState } from 'react'
import { Lock, Save, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    profileImage: '',
  })

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const router = useRouter()

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  /* -------- LOAD USER -------- */
  useEffect(() => {
    fetch('/api/admin/account')
      .then(r => r.json())
      .then(setProfile)
  }, [])

  /* -------- IMAGE UPLOAD -------- */
  const uploadImage = async (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)

    const form = new FormData()
    form.append('file', file)

    const res = await fetch('/api/upload/cloudinary', {
      method: 'POST',
      body: form,
    })

    const data = await res.json()
    if (!res.ok || !data.image?.url) {
      toast.error('Image upload failed')
      return
    }

    setProfile(p => ({ ...p, profileImage: data.image.url }))
  }

  /* -------- SAVE PROFILE -------- */
  const saveProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success('Profile updated')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  /* -------- CHANGE PASSWORD -------- */
  const changePassword = async () => {
    if (password.newPassword !== password.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(password),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success('Password updated')
      setPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-sm text-slate-500">
          Manage your personal information and security
        </p>
      </div>

      {/* GRID */}
<div className="grid gap-6 lg:grid-cols-2">

        {/* PROFILE */}
        <div className="bg-card elev-sm rounded-2xl p-6 space-y-6">
  {loading ? (
    /* PROFILE SKELETON */
    <div className="space-y-6 animate-pulse">
      <div className="h-5 w-24 rounded bg-muted" />

      <div className="flex items-center gap-5">
        <div className="h-24 w-24 rounded-full bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
      </div>

      <div className="space-y-4">
        <div className="h-10 w-full rounded bg-muted" />
        <div className="h-10 w-full rounded bg-muted" />
        <div className="h-20 w-full rounded bg-muted" />
      </div>

      <div className="h-10 w-40 rounded bg-muted" />
    </div>
  ) : (
  <>
    <h2 className="text-lg font-semibold">Profile</h2>

    {/* Avatar */}
    <div className="flex items-center gap-5">
      <div className="relative h-24 w-24 rounded-full bg-muted elev-sm overflow-hidden">
        <img
          key={previewImage || profile.profileImage || 'avatar'}
          src={previewImage || profile.profileImage || undefined}
          alt="Profile"
          className="h-full w-full object-cover"
        />
      </div>

      <label className="cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
        <ImageIcon className="h-4 w-4" />
        Change photo
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={e => {
            const file = e.currentTarget.files?.[0]
            if (file) uploadImage(file)
          }}
        />
      </label>
    </div>

    {/* Name */}
    <div className="space-y-1">
      <label className="text-sm font-medium">Name</label>
      <Input
        value={profile.name}
        onChange={e =>
          setProfile({ ...profile, name: e.target.value })
        }
      />
    </div>

    {/* Email */}
    <div className="space-y-1">
      <label className="text-sm font-medium">Email</label>
      <Input
        value={profile.email}
        onChange={e =>
          setProfile({ ...profile, email: e.target.value })
        }
      />
    </div>

    {/* Bio */}
    <div className="space-y-1">
      <label className="text-sm font-medium">Bio</label>
      <textarea
        rows={3}
        value={profile.bio}
        onChange={e =>
          setProfile({ ...profile, bio: e.target.value })
        }
        className="w-full rounded-xl bg-card elev-sm px-3 py-2 text-sm ui-transition focus:outline-none focus:elev-lg"
      />
    </div>

    <Button onClick={saveProfile} loading={loading} className="gap-2">
      <Save className="h-4 w-4" />
      Save Profile
    </Button>
  </>
)}
        </div>
        {/* PASSWORD */}
        <div className="bg-card elev-sm rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold">Change Password</h2>

          <div className="space-y-1">
            <label className="text-sm font-medium">Current Password</label>
            <Input
              type="password"
              value={password.currentPassword}
              onChange={e =>
                setPassword({
                  ...password,
                  currentPassword: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">New Password</label>
            <Input
              type="password"
              value={password.newPassword}
              onChange={e =>
                setPassword({
                  ...password,
                  newPassword: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Confirm Password</label>
            <Input
              type="password"
              value={password.confirmPassword}
              onChange={e =>
                setPassword({
                  ...password,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>

          <Button
            onClick={changePassword}
            loading={loading}
            className="gap-2"
          >
            <Lock className="h-4 w-4" />
            Update Password
          </Button>
        </div>
      </div>
    </div>
  )
}