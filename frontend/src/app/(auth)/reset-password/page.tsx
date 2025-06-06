'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('يرجى إدخال البريد الإلكتروني')
      return
    }

    setIsLoading(true)
    
    // محاكاة إرسال رابط إعادة التعيين
    setTimeout(() => {
      setIsLoading(false)
      setEmailSent(true)
    }, 2000)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-2xl mb-6">
            <span className="text-2xl">✉️</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            تم إرسال الرابط!
          </h1>
          
          <p className="text-gray-600 mb-6">
            تم إرسال رابط إعادة تعيين كلمة المرور إلى:
            <br />
            <strong>{email}</strong>
          </p>
          
          <Alert variant="info" message="تحقق من صندوق البريد الوارد والرسائل غير المرغوب فيها" className="mb-6" />
          
          <div className="space-y-4">
            <Button onClick={() => setEmailSent(false)} variant="outline" className="w-full">
              إرسال مرة أخرى
            </Button>
            
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <FaArrowLeft className="ml-2" />
                العودة لتسجيل الدخول
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-2xl mb-4">
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            إعادة تعيين كلمة المرور
          </h1>
          <p className="text-gray-600">
            أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
          </p>
        </div>

        <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          {/* Error Alert */}
          {error && (
            <Alert 
              variant="error" 
              message={error}
              dismissible
              onDismiss={() => setError('')}
              className="mb-6"
            />
          )}

          {/* Reset Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <span className="text-gray-600">تذكرت كلمة المرور؟ </span>
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              سجل دخولك
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