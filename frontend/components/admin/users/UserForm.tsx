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
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export default function UserForm({
  initialData,
  showPassword = false,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>(initialData?.role ?? 'WRITER')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit({ name, email, password, role })
    setLoading(false)
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

      <input
        className="input-field"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        disabled={!showPassword} // disable email on edit
      />

      {showPassword && (
        <input
          className="input-field"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      )}

      <select
        className="input-field"
        value={role}
        onChange={e => setRole(e.target.value as Role)}
      >
        <option value="EDITOR">EDITOR</option>
        <option value="WRITER">WRITER</option>
      </select>

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
