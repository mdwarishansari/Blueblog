'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowLeft, Sparkles, ShieldCheck, Zap, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/ui/Logo'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [siteName, setSiteName] = useState('BlueBlog')

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

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

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
              Next-Gen Publisher
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-[1.15] text-pure-white">
              Publish beautifully. <br />
              Manage seamlessly.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Log in to access your administrative dashboard, write new posts, view performance metrics, and orchestrate categories.
            </p>
          </div>

          {/* Features Checklist */}
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-electric-cobalt/10 border border-electric-cobalt/25">
                <ShieldCheck className="h-4.5 w-4.5 text-electric-cobalt" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-pure-white">Multi-Role Collaborations</h3>
                <p className="text-xs text-slate-400 mt-0.5">Separate workflows for Administrators, Editors, and Writers.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-electric-cobalt/10 border border-electric-cobalt/25">
                <ImageIcon className="h-4 w-4 text-electric-cobalt" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-pure-white">Cloud Media Management</h3>
                <p className="text-xs text-slate-400 mt-0.5">Drag-and-drop uploads directly optimized via Cloudinary CDN.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-electric-cobalt/10 border border-electric-cobalt/25">
                <Zap className="h-4.5 w-4.5 text-electric-cobalt" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-pure-white">Instant Edge Caching</h3>
                <p className="text-xs text-slate-400 mt-0.5">Dynamic routing combined with force-cache evictions for speed.</p>
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

        <div className="mx-auto w-full max-w-[420px] space-y-8">
          {/* Logo on Mobile Only */}
          <div className="lg:hidden flex flex-col items-center text-center">
            <Link href="/" className="mb-4">
              <Logo variant="auth" alt={siteName} />
            </Link>
            <h2 className="text-2xl font-bold text-ink-charcoal tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-gray mt-1">Please enter your credentials to login</p>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-3xl font-extrabold text-ink-charcoal tracking-tight">Sign in</h2>
            <p className="text-sm text-slate-gray mt-2">
              Welcome back! Enter your email and password to access your panel.
            </p>
          </div>

          {/* Form card */}
          <Card variant="white" className="p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-hairline/80 rounded-[24px]">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
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
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-11 focus:ring-2 focus:ring-electric-cobalt/10 focus:border-electric-cobalt bg-pure-white transition-all duration-200"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-gray">
                    Password
                  </label>
                </div>
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

              {/* Submit Action */}
              <div className="pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  className="w-full gap-2 rounded-full py-6 text-sm font-semibold shadow-md shadow-electric-cobalt/10"
                >
                  <LogIn className="h-4 w-4" />
                  Login to Account
                </Button>
              </div>
            </form>
          </Card>

          {/* Links block */}
          <div className="text-center space-y-4">
            <p className="text-sm text-slate-gray">
              New to the platform?{' '}
              <Link href="/register" className="font-semibold text-electric-cobalt hover:text-deep-cobalt hover:underline transition-all">
                Create writer account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
