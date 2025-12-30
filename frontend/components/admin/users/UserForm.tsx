'use client'

import { useState } from 'react'

type Role = 'ADMIN' | 'EDITOR' | 'WRITER'

interface Props {
  initialData?: {
    name?: string
    email?: string
    role?: Role
  }
  showPassword?: boolean
  errors?: Record<string, string>
  loading?: boolean
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export default function UserForm({
  initialData,
  showPassword = false,
  errors = {},
  loading = false,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>(initialData?.role ?? 'WRITER')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({ name, email, password, role })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="input-field"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}

      <input
        className="input-field"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        disabled={!showPassword}
      />
      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}

      {showPassword && (
        <>
          <input
            className="input-field"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
        </>
      )}

      <select
        className="input-field"
        value={role}
        onChange={e => setRole(e.target.value as Role)}
      >
        <option value="EDITOR">EDITOR</option>
        <option value="WRITER">WRITER</option>
      </select>
      {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}
