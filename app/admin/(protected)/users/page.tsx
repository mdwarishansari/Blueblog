'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { SearchInput } from '@/components/ui/SearchInput'
import { Badge } from '@/components/ui/Badge'
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
    role: 'EDITOR',
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

  const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'violet' | 'green' | 'blue'> = {
    ADMIN: 'violet',
    EDITOR: 'blue',
    WRITER: 'green',
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-charcoal">Users</h1>
          <p className="text-sm text-slate-gray">
            Manage blog users and permissions
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 self-start">
          <Plus className="h-4 w-4" />
          New User
        </Button>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="max-w-sm">
        <SearchInput
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ================= MOBILE LIST ================= */}
      <div className="md:hidden space-y-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[16px] bg-pure-white border border-hairline p-4 shadow-subtle flex items-center gap-3 animate-pulse"
              >
                <div className="h-10 w-10 rounded-full skeleton" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 skeleton" />
                  <div className="h-3 w-40 skeleton" />
                </div>
              </div>
            ))
          : filteredUsers.map(user => (
              <Card
                key={user.id}
                variant="white"
                className="p-4 w-full max-w-full overflow-hidden space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-canvas-cream border border-hairline flex items-center justify-center shrink-0">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-5 w-5 text-slate-gray" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-charcoal truncate">{user.name}</p>
                    <p className="text-xs text-slate-gray truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant={roleBadgeVariant[user.role] || 'secondary'}>
                    {user.role}
                  </Badge>
                  <span className="text-slate-gray">
                    Posts: {user._count.posts}
                  </span>
                  <span className="text-slate-gray">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-hairline">
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
              </Card>
            ))}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-pure-white border border-hairline rounded-[16px] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-gray border-b border-hairline bg-surface-ivory">
                <th className="px-6 py-4 text-left font-semibold">User</th>
                <th className="px-6 py-4 text-left font-semibold">Role</th>
                <th className="px-6 py-4 text-left font-semibold">Posts</th>
                <th className="px-6 py-4 text-left font-semibold">Joined</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-hairline">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-hairline">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full skeleton" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 skeleton" />
                          <div className="h-3 w-24 skeleton" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-5 w-16 rounded-[8px] skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 skeleton" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-16 rounded-[8px] skeleton float-right" /></td>
                  </tr>
                ))
              ) : (
                filteredUsers.map(user => (
                  <tr
                    key={user.id}
                    className="ui-transition hover:bg-canvas-cream"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-canvas-cream border border-hairline flex items-center justify-center shrink-0">
                          {user.profileImage ? (
                            <img
                              src={user.profileImage}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserIcon className="h-5 w-5 text-slate-gray" />
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-medium text-ink-charcoal">{user.name}</p>
                          <p className="text-xs text-slate-gray">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={roleBadgeVariant[user.role] || 'secondary'}>
                        {user.role}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-gray">
                      {user._count.posts}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-gray">
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
                ))
              )}
            </tbody>
          </table>
        </div>
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
        description="Configure details and credentials for user"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-gray">Name</label>
            <Input
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-gray">Email</label>
            <Input
              type="email"
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-gray">Role</label>
            <select
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value })}
              className="
                flex h-11 w-full
                rounded-[16px]
                border border-hairline
                bg-pure-white
                px-4 py-2.5
                text-sm text-ink-charcoal
                transition-all duration-200 ease-in-out
                hover:border-slate-300
                focus:outline-none
                focus:border-electric-cobalt
                focus:ring-1
                focus:ring-electric-cobalt
              "
            >
              <option value="WRITER">Writer</option>
              <option value="EDITOR">Editor</option>
            </select>
          </div>

          {!editingUser && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-gray">Password</label>
              <Input
                type="password"
                placeholder="Choose password (min 6 chars)"
                value={formData.password}
                onChange={e =>
                  setFormData({ ...formData, password: e.target.value })
                }
                minLength={6}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-hairline">
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
