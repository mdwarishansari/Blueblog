'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import AdminSettingsForm from '@/components/settings/AdminSettingsForm';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <p className="text-red-600">Access denied</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <AdminSettingsForm />
      </div>
    </AdminLayout>
  );
}
