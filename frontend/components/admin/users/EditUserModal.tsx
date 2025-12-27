'use client'

import UserForm from './UserForm'
import { userApi } from '@/lib/api/users'

export default function EditUserModal({
  user,
  onClose,
  onSuccess,
}: {
  user: any
  onClose: () => void
  onSuccess: () => void
}) {
  const handleUpdate = async (data: any) => {
    await userApi.update(user.id, {
      name: data.name,
      role: data.role,
    })
    onSuccess()
    onClose()
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <UserForm
          initialData={user}
          onSubmit={handleUpdate}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
