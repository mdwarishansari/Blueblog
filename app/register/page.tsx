'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, UserPlus, User, Check, X, Sparkles, Zap, Shield, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
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
        <div className={`flex items-center gap-2 text-sm ${ok ? 'text-emerald-600' : 'text-slate-400'}`}>
            {ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            {label}
        </div>
    )

    return (
        <div className="min-h-screen flex">
            {/* ================= LEFT: ANIMATED ILLUSTRATION ================= */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
                {/* Animated background elements */}
                <div className="absolute inset-0">
                    {/* Large floating orbs */}
                    <motion.div
                        className="absolute top-20 left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
                        animate={{
                            x: [0, 50, 0],
                            y: [0, -30, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl"
                        animate={{
                            x: [0, -40, 0],
                            y: [0, 40, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-cyan-400/20 blur-2xl"
                        animate={{
                            x: [0, 30, 0],
                            y: [0, -50, 0],
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* Grid pattern */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                    {/* Floating particles */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute h-2 w-2 rounded-full bg-white/30"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -100, 0],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="mb-8">
                            <motion.div
                                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur-sm"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Sparkles className="h-4 w-4" />
                                Join our community
                            </motion.div>
                        </div>

                        <motion.h1
                            className="text-5xl font-bold leading-tight mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            Start your
                            <br />
                            <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                                writing journey
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-lg text-white/80 mb-10 max-w-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            Create an account and share your stories with readers around the world.
                        </motion.p>

                        {/* Feature highlights */}
                        <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            {[
                                { icon: Zap, text: 'Publish instantly' },
                                { icon: Globe, text: 'Reach global audience' },
                                { icon: Shield, text: 'Secure & reliable' },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.text}
                                    className="flex items-center gap-3 text-white/90"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.1 }}
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <span>{item.text}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* ================= RIGHT: FORM ================= */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full max-w-md"
                >
                    {/* BRAND */}
                    <motion.div
                        className="mb-8 text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Link href="/" className="inline-block">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 shadow-lg ui-transition hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">
                                {siteLogo ? (
                                    <img src={siteLogo} alt={siteName} className="h-10 w-10 object-contain" />
                                ) : (
                                    <span className="text-xl font-bold text-white">{siteName[0]}</span>
                                )}
                            </div>
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
                        <p className="mt-2 text-slate-600">Join {siteName} today</p>
                    </motion.div>

                    {/* FORM */}
                    <motion.div
                        className="rounded-2xl bg-white p-8 shadow-xl border border-slate-100"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </motion.div>

                            {/* Email */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 }}
                            >
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </motion.div>

                            {/* Password */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 ui-transition"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Confirm Password */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.45 }}
                            >
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </motion.div>

                            {/* Password Requirements */}
                            <motion.div
                                className="rounded-xl bg-slate-50 p-4 space-y-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <p className="text-xs font-medium text-slate-500 mb-2">Password requirements:</p>
                                <CheckItem ok={passwordChecks.length} label="At least 8 characters" />
                                <CheckItem ok={passwordChecks.uppercase} label="One uppercase letter" />
                                <CheckItem ok={passwordChecks.number} label="One number" />
                                <CheckItem ok={passwordChecks.match} label="Passwords match" />
                            </motion.div>

                            {/* Submit */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 }}
                            >
                                <Button
                                    type="submit"
                                    loading={loading}
                                    disabled={!allChecksPass}
                                    className="w-full gap-2"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Create Account
                                </Button>
                            </motion.div>
                        </form>
                    </motion.div>

                    {/* Login link */}
                    <motion.p
                        className="mt-6 text-center text-sm text-slate-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 ui-transition">
                            Sign in
                        </Link>
                    </motion.p>

                    {/* Back to home */}
                    <motion.div
                        className="mt-4 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.65 }}
                    >
                        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 ui-transition">
                            ← Back to home
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    )
}
