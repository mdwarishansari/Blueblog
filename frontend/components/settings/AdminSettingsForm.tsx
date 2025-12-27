'use client';

import { useEffect, useState } from 'react';
import { settingsApi } from '@/lib/api/settings';
import { meApi } from '@/lib/api/me';

export default function AdminSettingsForm() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    profileImage: '',
  });

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    settingsApi.get().then(res => {
      const obj: Record<string, string> = {};
      res.data.data.forEach((s: any) => {
        obj[s.key] = s.value;
      });
      setSettings(obj);
    });
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    await settingsApi.update(settings);
    setLoading(false);
    setMessage('Settings updated');
  };

  const saveProfile = async () => {
    setLoading(true);
    await meApi.updateProfile(profile);
    setLoading(false);
    setMessage('Profile updated');
  };

  const changePassword = async () => {
    if (password.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);

      await meApi.changePassword(password);

      // 🔥 CRITICAL PART
      await logout();                // clears tokens + user
      router.replace('/admin/login'); // force re-login

    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SITE SETTINGS */}
      <section className="card space-y-4">
        <h2 className="font-semibold text-lg">Site Settings</h2>

        <input
          className="input-field"
          placeholder="Site Name"
          value={settings.site_name || ''}
          onChange={e =>
            setSettings({ ...settings, site_name: e.target.value })
          }
        />

        <textarea
          className="input-field"
          placeholder="Site Description"
          value={settings.site_description || ''}
          onChange={e =>
            setSettings({
              ...settings,
              site_description: e.target.value,
            })
          }
        />

        <button className="btn-primary" onClick={saveSettings}>
          Save Site Settings
        </button>
      </section>

      {/* PROFILE */}
      <section className="card space-y-4">
        <h2 className="font-semibold text-lg">Profile</h2>

        <input
          className="input-field"
          placeholder="Name"
          value={profile.name}
          onChange={e =>
            setProfile({ ...profile, name: e.target.value })
          }
        />

        <textarea
          className="input-field"
          placeholder="Bio"
          value={profile.bio}
          onChange={e =>
            setProfile({ ...profile, bio: e.target.value })
          }
        />

        <input
          className="input-field"
          placeholder="Profile Image URL"
          value={profile.profileImage}
          onChange={e =>
            setProfile({ ...profile, profileImage: e.target.value })
          }
        />

        <button className="btn-primary" onClick={saveProfile}>
          Update Profile
        </button>
      </section>

      {/* PASSWORD */}
      <section className="card space-y-4">
        <h2 className="font-semibold text-lg">Change Password</h2>

        <input
          type="password"
          className="input-field"
          placeholder="Current Password"
          onChange={e =>
            setPassword({ ...password, currentPassword: e.target.value })
          }
        />

        <input
          type="password"
          className="input-field"
          placeholder="New Password"
          onChange={e =>
            setPassword({ ...password, newPassword: e.target.value })
          }
        />

        <button className="btn-danger" onClick={changePassword}>
          Change Password
        </button>
      </section>

      {message && <p className="text-green-600">{message}</p>}
    </div>
  );
}
