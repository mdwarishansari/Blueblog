'use client'

import { createContext, useContext } from 'react'
import { useAuth as useAuthLogic } from '@/lib/hooks/useAuth'
import { User } from '@/types'

type AuthContextType = ReturnType<typeof useAuthLogic>

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthLogic()

  if (auth.loading) return null // ⛔ prevent header flash

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
