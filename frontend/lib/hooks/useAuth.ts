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
    const result = await authApi.login({ email, password })

    if (!result) {
      throw new Error('Login failed: empty response')
    }

    const { accessToken, refreshToken, user } = result

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
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      await authApi.logout(refreshToken)
    }
  } catch {}

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
    const apiUser = await authApi.getMe()

const normalizedUser = {
  ...apiUser,
  profileImage: apiUser.profileImage ?? apiUser.profile_image ?? null,
}

setUser(normalizedUser)
localStorage.setItem('user', JSON.stringify(normalizedUser))

  } catch {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  } finally {
    setLoading(false)
  }
}, [])

  const refreshUser = useCallback(async () => {
  try {
    const updatedUser = await authApi.getMe()
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  } catch {
    // silent fail
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
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isEditor: user?.role === 'EDITOR' || user?.role === 'ADMIN',
    isWriter:
      user?.role === 'WRITER' ||
      user?.role === 'EDITOR' ||
      user?.role === 'ADMIN',
  }
}
