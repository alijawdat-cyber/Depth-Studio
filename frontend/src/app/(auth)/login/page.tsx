'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { useAuth } from '@/store/auth-store'
import { FaGoogle, FaEnvelope, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa'

export default function LoginPage() {
  const router = useRouter()
  const { login, loginWithGoogle, isLoading, error, clearError, user, isAuthenticated } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')

  // Auto redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔥 User is authenticated in login page, redirecting to dashboard...', user)
      
      // Redirect based on user role immediately
      let redirectPath = '/admin' // default
      
      switch (user.primary_role) {
        case 'super_admin':
          redirectPath = '/admin'
          break
        case 'marketing_coordinator':
          redirectPath = '/marketing'
          break
        case 'brand_coordinator':
          redirectPath = '/brand'
          break
        case 'photographer':
          redirectPath = '/photographer'
          break
        case 'new_user':
          redirectPath = '/role-setup'
          break
        default:
          redirectPath = '/admin'
      }
      
      // Check status
      if (user.status === 'pending_approval') {
        redirectPath = '/pending-approval'
      }
      
      console.log(`🔄 Login page: Redirecting ${user.primary_role} (${user.status}) to ${redirectPath}`)
      router.push(redirectPath)
    }
  }, [isAuthenticated, user, router])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setFormError('')

    if (!email || !password) {
      setFormError('يرجى ملء جميع الحقول')
      return
    }

    try {
      await login(email, password)
      // التوجيه بعد تسجيل الدخول الناجح سيتم بواسطة AuthWrapper
    } catch (error) {
      // Show specific error message if Firebase is not available
      if (error instanceof Error && error.message.includes('Firebase')) {
        setFormError('خدمة الاستيثاق غير متاحة حالياً. يرجى المحاولة لاحقاً.')
      } else {
        setFormError('خطأ في تسجيل الدخول. يرجى التحقق من البيانات.')
      }
    }
  }

   const handleGoogleLogin = async () => {
     clearError()
     try {
       console.log('Starting Google login...')
       await loginWithGoogle()
       console.log('Google login successful, AuthWrapper will handle redirect...')
       // التوجيه بعد تسجيل الدخول الناجح سيتم بواسطة AuthWrapper
     } catch (error) {
       console.error('Google login error:', error)
       setFormError('خطأ في تسجيل الدخول بـ Google')
     }
   }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-2xl mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً بعودتك
          </h1>
          <p className="text-gray-600">
            سجل دخولك إلى Depth Studio
          </p>
        </div>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          {/* Error Alert */}
          {(error || formError) && (
            <Alert 
              variant="error" 
              message={error || formError}
              dismissible
              onDismiss={() => {
                clearError()
                setFormError('')
              }}
              className="mb-6"
            />
          )}

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="pl-10"
                  required
                />
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  required
                />
                <FaEyeSlash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="mr-2 text-sm text-gray-600">تذكرني</span>
              </label>
                          <Link href="/reset-password" className="text-sm text-primary-600 hover:text-primary-700">
              نسيت كلمة المرور؟
            </Link>
            </div>

                         <Button 
               type="submit" 
               className="w-full" 
               disabled={isLoading}
             >
               {isLoading ? 'جاري التحميل...' : 'تسجيل الدخول'}
             </Button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">أو سجل دخولك بـ</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <FaGoogle className="ml-2 text-red-500" />
              تسجيل الدخول بـ Google
            </Button>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/phone-login')}
            >
              <FaPhone className="ml-2 text-green-500" />
              تسجيل الدخول برقم الهاتف
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <span className="text-gray-600">ليس لديك حساب؟ </span>
            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              سجل الآن
            </Link>
          </div>
        </Card>

        {/* Help */}
        <div className="text-center mt-6">
          <Link href="/help" className="text-sm text-gray-500 hover:text-gray-700">
            تحتاج مساعدة؟ تواصل معنا
          </Link>
        </div>
      </div>
    </div>
  )
} 