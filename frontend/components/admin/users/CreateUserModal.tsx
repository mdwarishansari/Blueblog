'use client'

import { useState } from 'react'
import UserForm from './UserForm'
import { userApi } from '@/lib/api/users'

export default function CreateUserModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function validateCreateUser(form: {
    name: string
    email: string
    password: string
    role: string
  }) {
    const errors: Record<string, string> = {}

    if (!form.name || form.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (
      !form.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      errors.email = 'Please enter a valid email address'
    }

    if (!form.password || form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (!['EDITOR', 'WRITER'].includes(form.role)) {
      errors.role = 'Invalid role selected'
    }

    return errors
  }

  const handleCreate = async (data: any) => {
    const validationErrors = validateCreateUser(data)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return // ❌ STOP API CALL
    }

    try {
      setLoading(true)
      setErrors({})

      await userApi.create(data)

      onSuccess()
      onClose()
    } catch (err: any) {
      // Backend fallback (should rarely happen now)
      setErrors({
        general: err?.message || 'Failed to create user',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="text-xl font-bold mb-4">Create User</h2>

        {errors.general && (
          <p className="mb-3 text-sm text-red-600">
            {errors.general}
          </p>
        )}

        <UserForm
          showPassword
          errors={errors}          // ✅ PASS ERRORS
          loading={loading}        // ✅ OPTIONAL UX
          onSubmit={handleCreate}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
