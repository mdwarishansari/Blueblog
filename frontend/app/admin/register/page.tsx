'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiCheck } from 'react-icons/fi'
import { authApi, RegisterCredentials } from '@/lib/api/auth'
import SEO from '@/components/seo/SEO'

export default function RegisterPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)

  const validateForm = (): string[] => {
    const errors: string[] = []
    
    if (!formData.name.trim()) {
      errors.push('Name is required')
    }
    
    if (!formData.email.trim()) {
      errors.push('Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Invalid email format')
    }
    
    if (!formData.password) {
      errors.push('Password is required')
    } else if (formData.password.length < 6) {
      errors.push('Password must be at least 6 characters')
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match')
    }
    
    return errors
  }

  const calculatePasswordStrength = (password: string) => {
    let score = 0
    if (password.length >= 6) score += 25
    if (/[a-z]/.test(password)) score += 25
    if (/[A-Z]/.test(password)) score += 25
    if (/[0-9]/.test(password)) score += 25
    setPasswordStrength(score)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (errors.length > 0) {
      setError(errors.join(', '))
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      
      if (response.status === 'success') {
        setSuccess('Registration successful! Redirecting to dashboard...')
        
        // Save tokens
        if (response.data?.tokens) {
          localStorage.setItem('accessToken', response.data.tokens.accessToken)
          localStorage.setItem('refreshToken', response.data.tokens.refreshToken)
        }
        
        // Redirect after delay
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 2000)
      } else {
        setError(response.message || 'Registration failed')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof RegisterCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'password') {
      calculatePasswordStrength(value)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500'
    if (passwordStrength < 50) return 'bg-orange-500'
    if (passwordStrength < 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Very Weak'
    if (passwordStrength < 50) return 'Weak'
    if (passwordStrength < 75) return 'Good'
    return 'Strong'
  }

  const passwordRequirements = [
    { label: 'At least 6 characters', met: formData.password.length >= 6 },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'Contains number', met: /[0-9]/.test(formData.password) },
  ]

  return (
    <>
      <SEO 
        title="Register" 
        description="Create a new account"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border">
          <div>
            <div className="flex justify-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {process.env.NEXT_PUBLIC_SITE_NAME}
                </span>
              </Link>
            </div>
            
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-gray-600">
              Start your writing journey today
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" size={20} />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" size={20} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" size={20} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="pl-10 pr-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEyeOff className="text-gray-400" size={20} />
                    ) : (
                      <FiEye className="text-gray-400" size={20} />
                    )}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength < 25 ? 'text-red-600' :
                        passwordStrength < 50 ? 'text-orange-600' :
                        passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                {formData.password && (
                  <div className="mt-3 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {req.met ? (
                          <FiCheck className="text-green-500" size={16} />
                        ) : (
                          <div className="w-4 h-4 border border-gray-300 rounded"></div>
                        )}
                        <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" size={20} />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="pl-10 pr-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="text-gray-400" size={20} />
                    ) : (
                      <FiEye className="text-gray-400" size={20} />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/admin/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>

          {/* Demo Note */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Registration Features:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start gap-2">
                <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
                <span>Real-time password strength indicator</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
                <span>Password requirements validation</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
                <span>Email format validation</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-green-500 mt-0.5 flex-shrink-0" size={14} />
                <span>Auto-redirect to dashboard after registration</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}