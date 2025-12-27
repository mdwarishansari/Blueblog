'use client';

import { meApi } from '@/lib/api/me';
import { useAuth } from '@/lib/hooks/useAuth';
import { useState } from 'react';

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
  });

  if (!user) return null;

  const submit = async () => {
    await meApi.changePassword(password);
    alert('Password changed. Please login again.');
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-xl font-bold">Account Settings</h1>

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

      <button className="btn-primary" onClick={submit}>
        Change Password
      </button>
    </div>
  );
}
