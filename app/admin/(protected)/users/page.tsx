'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import toast from 'react-hot-toast'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  profileImage?: string | null
  createdAt: string
  _count: {
    posts: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'WRITER',
    password: '',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      if (response.ok) setUsers(data.users)
    } catch {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = editingUser
      ? `/api/admin/users/${editingUser.id}`
      : '/api/admin/users'

    const method = editingUser ? 'PUT' : 'POST'
    const body = editingUser
      ? { ...formData, password: undefined }
      : formData

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      toast.success(data.message)
      setIsModalOpen(false)
      setEditingUser(null)
      setFormData({ name: '', email: '', role: 'WRITER', password: '' })
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEdit = (user: UserData) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      toast.success(data.message)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  )

  const roleStyles: Record<string, string> = {
    ADMIN:
      'bg-purple-100 text-purple-700 shadow-[0_6px_16px_rgba(168,85,247,0.35)]',
    EDITOR:
      'bg-blue-100 text-blue-700 shadow-[0_6px_16px_rgba(59,130,246,0.35)]',
    WRITER:
      'bg-green-100 text-green-700 shadow-[0_6px_16px_rgba(34,197,94,0.35)]',
  }

  return (
    <div className="space-y-8 w-full max-w-full overflow-x-hidden">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-slate-500">
            Manage blog users and permissions
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New User
        </Button>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="bg-card elev-sm rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* ================= MOBILE LIST ================= */}
      <div className="md:hidden space-y-3 px-2">
  {loading
    ? Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-card p-3 elev-sm animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-40 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))
    : filteredUsers.map(user => (
          <div
            key={user.id}
            className="rounded-xl bg-card p-3 elev-sm w-full max-w-full overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-5 w-5 text-slate-400" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-3 py-1 ${roleStyles[user.role]}`}>
                {user.role}
              </span>
              <span className="text-slate-500">
                Posts: {user._count.posts}
              </span>
              <span className="text-slate-500">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(user)}
              >
                <Edit className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-red-50"
                onClick={() => handleDelete(user.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-card elev-sm rounded-2xl overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Role</th>
              <th className="px-6 py-4 text-left">Posts</th>
              <th className="px-6 py-4 text-left">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
  {loading
    ? Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          <td colSpan={5} className="px-6 py-5">
            <div className="h-6 rounded bg-muted animate-pulse" />
          </td>
        </tr>
      ))
    : filteredUsers.map(user => (
              <tr
                key={user.id}
                className="ui-transition hover:bg-muted"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-slate-400" />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${roleStyles[user.role]}`}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  {user._count.posts}
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingUser(null)
          setFormData({ name: '', email: '', role: 'WRITER', password: '' })
        }}
        title={editingUser ? 'Edit User' : 'Create User'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <select
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value })}
            className="w-full rounded-xl bg-muted px-3 py-2 text-sm ui-transition focus:outline-none"
          >
            <option value="WRITER">Writer</option>
            <option value="EDITOR">Editor</option>
          </select>

          {!editingUser && (
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={e =>
                setFormData({ ...formData, password: e.target.value })
              }
              minLength={6}
              required
            />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
