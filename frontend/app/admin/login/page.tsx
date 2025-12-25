'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '@/lib/hooks/useAuth'
import SEO from '@/components/seo/SEO'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register } = useAuth()

  const isRegister = searchParams.get('register') === 'true'

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
      let result

      if (isRegister) {
        // TEMP name logic (can add name field later)
        const name = email.split('@')[0]

        result = await register(name, email, password)
      } else {
        result = await login(email, password)
      }

      // ✅ Correct success check
      if (result?.accessToken) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setError('Authentication failed')
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SEO
        title={isRegister ? 'Register' : 'Login'}
        description="Access your admin dashboard"
      />

      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {process.env.NEXT_PUBLIC_SITE_NAME}
              </span>
            </Link>

            <h2 className="text-3xl font-bold text-gray-900">
              {isRegister ? 'Create your account' : 'Sign in to your account'}
            </h2>
            <p className="mt-2 text-gray-600">
              {isRegister
                ? 'Start your writing journey today'
                : 'Access your admin dashboard'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading
                ? isRegister
                  ? 'Creating account...'
                  : 'Signing in...'
                : isRegister
                ? 'Create account'
                : 'Sign in'}
            </button>
          </form>

          {/* ✅ FIXED TOGGLE LINK (THIS IS WHAT YOU ASKED ABOUT) */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link
                href={
                  isRegister
                    ? '/admin/login'
                    : '/admin/login?register=true'
                }
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {isRegister ? 'Sign in' : 'Sign up'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
