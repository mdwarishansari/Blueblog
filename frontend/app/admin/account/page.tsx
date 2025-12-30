'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { meApi } from '@/lib/api/me'
import { imageApi } from '@/lib/api/images'
import Loading from '@/components/ui/Loading'
import Link from 'next/link'
export default function AccountSettingsPage() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)

  // profile state
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)

  // password state
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
  })

  useEffect(() => {
    if (user) {
      setName(user.name)
      setBio(user.bio || '')
      setProfileImage(user.profileImage || null)
    }
  }, [user])

  if (!user) return <Loading />

  /* ================= PROFILE UPDATE ================= */
  const updateProfile = async () => {
    try {
      setLoading(true)
      await meApi.updateProfile({
  name,
  bio,
  ...(profileImage ? { profileImage } : {}),
})


      await refreshUser()
      alert('Profile updated')
    } catch {
      alert('Profile update failed')
    } finally {
      setLoading(false)
    }
  }

  /* ================= PASSWORD CHANGE ================= */
  const changePassword = async () => {
    try {
      await meApi.changePassword(password)
      alert('Password changed. Please login again.')
    } catch {
      alert('Password change failed')
    }
  }

  /* ================= IMAGE UPLOAD ================= */
  const uploadAvatar = async (file: File) => {
  try {
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    const image = await imageApi.upload(formData);

    // 1️⃣ Update local state
    setProfileImage(image.url);

    // 2️⃣ SAVE TO USER PROFILE (THIS WAS MISSING)
    await meApi.updateProfile({
      profileImage: image.url,
    });

  } catch (err) {
    alert('Image upload failed');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <h1 className="text-2xl font-bold">Account Settings</h1>
    <Link
  href="/admin/dashboard"
  className="inline-flex items-center text-sm text-primary-600 hover:underline"
>
  ← Back to Dashboard
</Link>

      {/* PROFILE SECTION */}
      <div className="p-6 space-y-4 bg-white rounded-xl">
        <h2 className="text-lg font-semibold">Profile</h2>

        <div className="flex items-center gap-4">
          <img
            src={profileImage || '/default-avatar.png'}
            className="w-20 h-20 border rounded-full"
          />
          <label className="text-sm text-blue-600 cursor-pointer">
            Change Photo
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={e => e.target.files && uploadAvatar(e.target.files[0])}
            />
          </label>
        </div>

        <input
          className="input-field"
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <textarea
          className="input-field"
          placeholder="Bio"
          value={bio}
          onChange={e => setBio(e.target.value)}
        />

        <button className="btn-primary" onClick={updateProfile} disabled={loading}>
          Save Profile
        </button>
      </div>

      {/* PASSWORD SECTION */}
      <div className="p-6 space-y-4 bg-white rounded-xl">
        <h2 className="text-lg font-semibold">Change Password</h2>

        <input
          type="password"
          className="input-field"
          placeholder="Current password"
          onChange={e =>
            setPassword({ ...password, currentPassword: e.target.value })
          }
        />

        <input
          type="password"
          className="input-field"
          placeholder="New password"
          onChange={e =>
            setPassword({ ...password, newPassword: e.target.value })
          }
        />

        <button className="btn-primary" onClick={changePassword}>
          Change Password
        </button>
      </div>
    </div>
  )
}
