'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@/types'
import { authApi } from '@/lib/api/auth'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // =========================
  // LOGIN
  // =========================
  const login = useCallback(
  async (email: string, password: string) => {
    // authApi.login ALREADY returns { accessToken, refreshToken, user }
    const { accessToken, refreshToken, user } =
      await authApi.login({ email, password })

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))

    setUser(user)

    return { accessToken, refreshToken, user }
  },
  []
)


  // =========================
  // LOGOUT
  // =========================
  const logout = useCallback(async () => {
    try {
      await authApi.logout({
        refreshToken: localStorage.getItem('refreshToken'),
      })
    } catch (_) {}

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  // =========================
  // CHECK AUTH (ON RELOAD)
  // =========================
  const checkAuth = useCallback(async () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    setLoading(false)
    return
  }

  try {
    const user = await authApi.getMe()
    setUser(user)
  } catch {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  } finally {
    setLoading(false)
  }
}, [])


  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isEditor: user?.role === 'EDITOR' || user?.role === 'ADMIN',
    isWriter:
      user?.role === 'WRITER' ||
      user?.role === 'EDITOR' ||
      user?.role === 'ADMIN',
  }
}
