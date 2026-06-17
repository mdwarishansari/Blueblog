'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, UserPlus, User, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [siteName, setSiteName] = useState('BlueBlog')
  const [siteLogo, setSiteLogo] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Password validation state
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    match: formData.password === formData.confirmPassword && formData.confirmPassword !== '',
  }

  const allChecksPass = Object.values(passwordChecks).every(Boolean)

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

    if (!allChecksPass) {
      toast.error('Please fix password requirements')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')

      toast.success('Account created successfully!')
      router.replace('/admin/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const CheckItem = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-xs font-semibold ${ok ? 'text-forest' : 'text-slate-gray'}`}>
      {ok ? <Check className="h-3.5 w-3.5 text-forest" /> : <X className="h-3.5 w-3.5 text-slate-gray/50" />}
      {label}
    </div>
  )

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
          <h1 className="text-xl font-bold text-ink-charcoal">Create your account</h1>
          <p className="text-sm text-slate-gray mt-1">Join {siteName} today</p>
        </Link>

        {/* CARD CONTAINER */}
        <Card variant="white" className="w-full sm:max-w-md p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-gray">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-gray" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-11"
                  required
                />
              </div>
            </div>

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

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-gray">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-gray" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-11"
                  required
                />
              </div>
            </div>

            {/* Password Requirements */}
            <div className="rounded-[16px] bg-surface-ivory border border-hairline p-4 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-gray mb-1">
                Password requirements:
              </p>
              <CheckItem ok={passwordChecks.length} label="At least 8 characters" />
              <CheckItem ok={passwordChecks.uppercase} label="One uppercase letter" />
              <CheckItem ok={passwordChecks.number} label="One number" />
              <CheckItem ok={passwordChecks.match} label="Passwords match" />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                loading={loading}
                disabled={!allChecksPass}
                className="w-full gap-2 rounded-full"
              >
                <UserPlus className="h-4 w-4" />
                Create Account
              </Button>
            </div>
          </form>
        </Card>

        {/* FOOTER LINKS */}
        <p className="mt-6 text-center text-sm text-slate-gray">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-electric-cobalt hover:text-deep-cobalt transition-colors">
            Sign in
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
