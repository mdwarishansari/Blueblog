'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
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
      .catch(() => { })
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
    <div className="min-h-screen bg-canvas-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Container className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        {/* BRAND LOGO */}
        <Link href="/" className="mb-6 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pure-white border border-hairline shadow-subtle mb-3 hover:bg-surface-ivory transition-colors">
            {siteLogo ? (
              <img src={siteLogo} alt={siteName} className="h-8 w-8 object-contain rounded-full" />
            ) : (
              <span className="text-lg font-bold text-ink-charcoal">{siteName[0]}</span>
            )}
          </div>
          <h1 className="text-xl font-bold text-ink-charcoal">Welcome back</h1>
          <p className="text-sm text-slate-gray mt-1">Sign in to {siteName}</p>
        </Link>

        {/* CARD CONTAINER */}
        <Card variant="white" className="w-full sm:max-w-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-gray">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-gray" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-11"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-gray">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-gray" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-gray hover:text-ink-charcoal transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                loading={loading}
                className="w-full gap-2 rounded-full"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Button>
            </div>
          </form>
        </Card>

        {/* FOOTER LINKS */}
        <p className="mt-6 text-center text-sm text-slate-gray">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-electric-cobalt hover:text-deep-cobalt transition-colors">
            Create one
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-slate-gray hover:text-ink-charcoal transition-colors">
            ← Back to home
          </Link>
        </div>
      </Container>
    </div>
  )
}
