'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { userApi } from '@/lib/api/users'
import AdminLayout from '@/components/layout/AdminLayout'
import Loading from '@/components/ui/Loading'
import { FiPlus, FiTrash2, FiEdit } from 'react-icons/fi'

// ✅ ADD THESE IMPORTS
import CreateUserModal from '@/components/admin/users/CreateUserModal'
import EditUserModal from '@/components/admin/users/EditUserModal'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'EDITOR' | 'WRITER'
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  const [showCreate, setShowCreate] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) fetchUsers()
  }, [isAuthenticated])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await userApi.getAll()

      if (res?.status === 'success') {
        setUsers(res.data?.users ?? [])
      } else {
        setUsers([])
      }
    } catch (err) {
      console.error('Failed to load users', err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return
    await userApi.delete(id)
    setUsers(prev => prev.filter(u => u.id !== id))
  }

  if (authLoading || loading) return <Loading />
  if (!isAuthenticated) return null

  // 🚨 HARD RULE
  if (user?.role !== 'ADMIN') {
    return (
      <AdminLayout>
        <p className="text-red-600">Access denied</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>

          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus /> Create User
          </button>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="px-6 py-4">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.role}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="text-blue-600"
                    >
                      <FiEdit />
                    </button>

                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <p className="p-6 text-gray-500">No users found</p>
          )}
        </div>
      </div>

      {/* ✅ CREATE USER MODAL */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onSuccess={fetchUsers}
        />
      )}

      {/* ✅ EDIT USER MODAL */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={fetchUsers}
        />
      )}
    </AdminLayout>
  )
}