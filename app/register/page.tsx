'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, UserPlus, User, Check, X, ArrowLeft, Sparkles, BookOpen, PenTool, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/ui/Logo'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [siteName, setSiteName] = useState('BlueBlog')

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

  /* Fetch site branding settings */
  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(data => {
        if (data?.siteName) setSiteName(data.siteName)
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
      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${ok ? 'bg-forest/10 border-forest text-forest' : 'bg-canvas-cream border-hairline text-slate-gray/30'}`}>
        {ok ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
      </div>
      {label}
    </div>
  )

  return (
    <div className="min-h-screen flex font-sans bg-canvas-cream">
      {/* LEFT SIDE: Brand & Feature Pitch (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-gradient-to-br from-[#0b0f19] via-[#0d1527] to-[#111e3b] relative overflow-hidden text-pure-white border-r border-hairline/10">
        {/* Glow ambient effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-electric-cobalt/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        
        {/* Subtle grid lines background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/" className="hover:opacity-90 ui-transition">
            <Logo variant="auth" alt={siteName} />
          </Link>
        </div>

        {/* Hero Pitch */}
        <div className="relative z-10 my-auto max-w-lg space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-cobalt/15 border border-electric-cobalt/30 text-xs font-semibold text-electric-cobalt tracking-wide uppercase">
              <Sparkles className="h-3 w-3" />
              Creator Program
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-[1.15] text-pure-white">
              Share your insights <br />
              with the world.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Create your writer account to gain access to our custom WYSIWYG editor, SEO metrics generator, and collaborative draft verification queue.
            </p>
          </div>

          {/* Features Checklist */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-electric-cobalt/10 border border-electric-cobalt/25">
                <PenTool className="h-4 w-4 text-electric-cobalt" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-pure-white">Rich Typography & Editor</h3>
                <p className="text-xs text-slate-400 mt-0.5">Write clean articles with embedded images, code snippets, and custom block styles.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-electric-cobalt/10 border border-electric-cobalt/25">
                <BookOpen className="h-4 w-4 text-electric-cobalt" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-pure-white">Live Search Optimization</h3>
                <p className="text-xs text-slate-400 mt-0.5">Check title lengths, canonical URLs, and meta description scores on the fly.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-electric-cobalt/10 border border-electric-cobalt/25">
                <CheckSquare className="h-4 w-4 text-electric-cobalt" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-pure-white">Publishing Pipeline</h3>
                <p className="text-xs text-slate-400 mt-0.5">Save draft reviews and submit content for instant admin verification.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-6">
          <span>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600">Secure AES-256 Auth</span>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 bg-canvas-cream relative">
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-gray hover:text-ink-charcoal transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 ui-transition" />
            Home
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[420px] space-y-6 my-8">
          {/* Logo on Mobile Only */}
          <div className="lg:hidden flex flex-col items-center text-center">
            <Link href="/" className="mb-4">
              <Logo variant="auth" alt={siteName} />
            </Link>
            <h2 className="text-2xl font-bold text-ink-charcoal tracking-tight">Create your account</h2>
            <p className="text-sm text-slate-gray mt-1">Join {siteName} as a content writer</p>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-3xl font-extrabold text-ink-charcoal tracking-tight">Register</h2>
            <p className="text-sm text-slate-gray mt-2">
              Join us! Fill out the credentials below to set up your profile.
            </p>
          </div>

          {/* Form card */}
          <Card variant="white" className="p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-hairline/80 rounded-[24px]">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-gray">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-11 focus:ring-2 focus:ring-electric-cobalt/10 focus:border-electric-cobalt bg-pure-white transition-all duration-200"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-gray">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-11 focus:ring-2 focus:ring-electric-cobalt/10 focus:border-electric-cobalt bg-pure-white transition-all duration-200"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-gray">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-11 pr-11 focus:ring-2 focus:ring-electric-cobalt/10 focus:border-electric-cobalt bg-pure-white transition-all duration-200"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-gray hover:text-ink-charcoal transition-colors focus:outline-none"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-gray">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-11 focus:ring-2 focus:ring-electric-cobalt/10 focus:border-electric-cobalt bg-pure-white transition-all duration-200"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="rounded-[16px] bg-canvas-cream border border-hairline/80 p-4 space-y-2 mt-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-gray mb-1">
                  Password requirements:
                </p>
                <CheckItem ok={passwordChecks.length} label="At least 8 characters" />
                <CheckItem ok={passwordChecks.uppercase} label="One uppercase letter" />
                <CheckItem ok={passwordChecks.number} label="One number" />
                <CheckItem ok={passwordChecks.match} label="Passwords match" />
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading || !allChecksPass}
                  className="w-full gap-2 rounded-full py-6 text-sm font-semibold shadow-md shadow-electric-cobalt/10"
                >
                  <UserPlus className="h-4 w-4" />
                  Create Writer Account
                </Button>
              </div>
            </form>
          </Card>

          {/* Links block */}
          <div className="text-center space-y-4">
            <p className="text-sm text-slate-gray">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-electric-cobalt hover:text-deep-cobalt hover:underline transition-all">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
