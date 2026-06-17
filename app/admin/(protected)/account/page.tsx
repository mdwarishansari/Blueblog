'use client'

import { useEffect, useState } from 'react'
import { Lock, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { ImageUploadField } from '@/components/ui/ImageUploadField'
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

  const [uploadingImage, setUploadingImage] = useState(false)
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
    setUploadingImage(true)
    const form = new FormData()
    form.append('file', file)
    form.append('folderType', 'dp')

    try {
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
      toast.success('Profile image uploaded')
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploadingImage(false)
    }
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
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-ink-charcoal">Account Settings</h1>
        <p className="text-sm text-slate-gray">
          Manage your personal information and security
        </p>
      </div>

      {/* GRID */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* PROFILE */}
        <Card variant="white" className="space-y-6">
          {loading ? (
            /* PROFILE SKELETON */
            <div className="space-y-6 animate-pulse">
              <div className="h-5 w-24 skeleton" />

              <div className="flex flex-col items-center gap-5">
                <div className="h-64 w-64 rounded-full skeleton mx-auto" />
                <div className="h-4 w-32 skeleton mx-auto" />
              </div>

              <div className="space-y-4">
                <div className="h-10 w-full skeleton" />
                <div className="h-10 w-full skeleton" />
                <div className="h-20 w-full skeleton" />
              </div>

              <div className="h-10 w-40 skeleton" />
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-ink-charcoal">Profile Details</h2>

              {/* Avatar */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-ink-charcoal">Profile Picture</label>
                <ImageUploadField
                  typeLabel="Profile Image"
                  currentImageUrl={profile.profileImage}
                  onFileSelect={uploadImage}
                  onClear={() => setProfile(p => ({ ...p, profileImage: '' }))}
                  maxSizeMB={2}
                  uploading={uploadingImage}
                  isAvatar
                />
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-ink-charcoal">Name</label>
                <Input
                  value={profile.name}
                  onChange={e =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-ink-charcoal">Email</label>
                <Input
                  value={profile.email}
                  onChange={e =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-ink-charcoal">Bio</label>
                <Textarea
                  rows={3}
                  value={profile.bio || ''}
                  onChange={e =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  className="bg-pure-white"
                />
              </div>

              <Button onClick={saveProfile} loading={loading} className="gap-2">
                <Save className="h-4 w-4" />
                Save Profile
              </Button>
            </>
          )}
        </Card>

        {/* PASSWORD */}
        <Card variant="white" className="space-y-6">
          <h2 className="text-lg font-semibold text-ink-charcoal">Change Password</h2>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink-charcoal">Current Password</label>
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

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink-charcoal">New Password</label>
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

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink-charcoal">Confirm Password</label>
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
        </Card>
      </div>
    </div>
  )
}