'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '@/lib/context/AuthContext'
import SEO from '@/components/seo/SEO'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await login(email, password)

      if (result?.accessToken) {
        router.refresh()
        router.push('/admin/dashboard')
        
      } else {
        setError('Invalid credentials')
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SEO title="Admin Login" description="Access admin dashboard" />

      <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white border shadow rounded-xl">
          <div className="mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-600">
                <span className="text-xl font-bold text-white">B</span>
              </div>
              <span className="text-2xl font-bold">
                {process.env.NEXT_PUBLIC_SITE_NAME}
              </span>
            </Link>

            <h2 className="mt-4 text-2xl font-bold">Admin Login</h2>
            <p className="text-sm text-gray-600">
              Authorized users only
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 text-red-700 rounded bg-red-50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <FiMail className="absolute text-gray-400 left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  className="w-full px-3 py-3 pl-10 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <FiLock className="absolute text-gray-400 left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value.trim())}
                  className="w-full px-3 py-3 pl-10 pr-10 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute text-gray-400 right-3 top-3"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              className="w-full py-3 font-semibold text-white rounded-lg bg-primary-600"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
