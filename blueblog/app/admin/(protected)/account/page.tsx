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
  profileImage: '', // CLOUDINARY URL ONLY
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
  // 1️⃣ SAFE preview (base64, never revoked)
  const reader = new FileReader()
  reader.onload = () => {
    setPreviewImage(reader.result as string)
  }
  reader.readAsDataURL(file)

  // 2️⃣ upload to cloudinary
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

  // 3️⃣ store only cloudinary URL
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
const changePassword = async (): Promise<void> => {
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
    <div className="space-y-10 max-w-3xl">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {/* PROFILE */}
      <div className="rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold">Profile</h2>

        <div className="flex items-center gap-4">
          <img
  key={previewImage || profile.profileImage || 'avatar'}
  src={previewImage || profile.profileImage || undefined}
  className="h-20 w-20 rounded-full object-cover border"
/>

          <label className="cursor-pointer text-sm text-primary-600 flex items-center gap-2">
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

        <Input
          placeholder="Name"
          value={profile.name}
          onChange={e => setProfile({ ...profile, name: e.target.value })}
        />

        <Input
          placeholder="Email"
          value={profile.email}
          onChange={e => setProfile({ ...profile, email: e.target.value })}
        />

        <textarea
          value={profile.bio}
          onChange={e => setProfile({ ...profile, bio: e.target.value })}
          className="w-full rounded-lg border p-2"
          rows={3}
        />

        <Button onClick={saveProfile} loading={loading}>
          <Save className="h-4 w-4 mr-2" /> Save Profile
        </Button>
      </div>

      {/* PASSWORD */}
      <div className="rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold">Change Password</h2>

        <Input
          type="password"
          placeholder="Current password"
          value={password.currentPassword}
          onChange={e => setPassword({ ...password, currentPassword: e.target.value })}
        />

        <Input
          type="password"
          placeholder="New password"
          value={password.newPassword}
          onChange={e => setPassword({ ...password, newPassword: e.target.value })}
        />

        <Input
          type="password"
          placeholder="Confirm password"
          value={password.confirmPassword}
          onChange={e => setPassword({ ...password, confirmPassword: e.target.value })}
        />

        <Button onClick={changePassword} loading={loading}>
          <Lock className="h-4 w-4 mr-2" /> Update Password
        </Button>
      </div>
    </div>
  )
}
