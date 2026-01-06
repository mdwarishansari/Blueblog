'use client'
import { useEffect, useState } from 'react'

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/admin/account')
      .then(r => r.json())
      .then(setUser)
  }, [])

  return user
}
