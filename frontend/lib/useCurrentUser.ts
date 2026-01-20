'use client'
import { useEffect, useState } from 'react'
import { apiGet } from './api'

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    apiGet('/auth/me')
      .then((data: any) => setUser(data.data?.user || data.user))
      .catch(() => setUser(null))
  }, [])

  return user
}
