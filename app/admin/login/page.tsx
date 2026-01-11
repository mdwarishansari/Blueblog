'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import Link from 'next/link'
export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [siteName, setSiteName] = useState('BlueBlog')
  const [siteLogo, setSiteLogo] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  /* Fetch site branding */
  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(data => {
        if (data?.siteName) setSiteName(data.siteName)
        if (data?.siteLogo) setSiteLogo(data.siteLogo)
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      toast.success('Login successful')
      router.replace('/admin/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-100 px-4 flex items-center justify-center">
      
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-purple-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-400/30 blur-3xl" />

      {/* Soft center glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-white/40 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* BRAND */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 shadow-lg">
            {siteLogo ? (
              <img
                src={siteLogo}
                alt={siteName}
                className="h-12 w-12 object-contain"
              />
            ) : (
              <span className="text-lg font-bold text-white">
                {siteName[0]}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">
            {siteName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Sign in to your account
          </p>
        </div>

        {/* CARD */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />

  <Input
    type={showPassword ? 'text' : 'password'}
    placeholder="••••••••"
    value={formData.password}
    onChange={(e) =>
      setFormData({ ...formData, password: e.target.value })
    }
    className="pl-10 pr-10"
    required
  />

  <button
    type="button"
    aria-label={showPassword ? 'Hide password' : 'Show password'}
    onClick={() => setShowPassword(!showPassword)}
    className="
      absolute right-3 top-1/2 -translate-y-1/2
      text-slate-400 hover:text-slate-700
      transition
    "
  >
    {showPassword ? (
      <EyeOff className="h-4.5 w-4.5" />
    ) : (
      <Eye className="h-4.5 w-4.5" />
    )}
  </button>
</div>

            </div>

            {/* Submit */}
            <Button
              type="submit"
              loading={loading}
              className="w-full gap-2"
            >
              <LogIn className="h-4.5 w-4.5" />
              Sign in
            </Button>
          </form>
        </div>

        {/* BACK */}
        <div className="mt-8 text-center">
          <Link
  href="/"
  aria-label="Back to BlueBlog home page"
  className="text-sm text-slate-600 hover:text-slate-900 transition"
>
  ← Back to home
</Link>
        </div>
      </motion.div>
    </div>
  )
}
