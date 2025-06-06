'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { authService } from '@/lib/auth'
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function PhoneLoginPage() {
  const router = useRouter()
  const recaptchaRef = useRef<HTMLDivElement>(null)
  
  const [step, setStep] = useState<'phone' | 'verification'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null)
  const [resendTimer, setResendTimer] = useState(0)

  // Initialize reCAPTCHA
  useEffect(() => {
    if (step === 'phone' && recaptchaRef.current && !recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved')
        },
        'expired-callback': () => {
          setError('انتهت صلاحية التحقق، يرجى المحاولة مرة أخرى')
        }
      })
      setRecaptchaVerifier(verifier)
    }
  }, [step, recaptchaVerifier])

  // Timer for resend
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  // تنسيق رقم الهاتف العراقي
  const formatIraqiPhone = (value: string) => {
    // إزالة كل شيء عدا الأرقام
    let cleaned = value.replace(/\D/g, '')
    
    // إذا بدأ بـ 0، نزيله
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1)
    }
    
    // إضافة التنسيق: XXX XXX XXXX
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`
  }

  const validateIraqiPhone = (phone: string) => {
    // تنظيف الرقم
    const cleaned = phone.replace(/\D/g, '')
    
    // التحقق من طول الرقم (10 أرقام بدون مفتاح البلد)
    if (cleaned.length !== 10) return false
    
    // التحقق من أن الرقم يبدأ بأرقام صحيحة للشبكات العراقية
    const validPrefixes = ['077', '078', '079', '070', '071', '075', '076', '073', '074']
    const prefix = cleaned.substring(0, 3)
    
    return validPrefixes.includes(prefix)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatIraqiPhone(e.target.value)
    if (formatted.replace(/\D/g, '').length <= 10) {
      setPhoneNumber(formatted)
      setError('')
    }
  }

  const handleSendCode = async () => {
    const cleanedPhone = phoneNumber.replace(/\D/g, '')
    
    if (!validateIraqiPhone(cleanedPhone)) {
      setError('رقم الهاتف غير صالح. يرجى إدخال رقم عراقي صحيح')
      return
    }

    if (!recaptchaVerifier) {
      setError('خطأ في التحقق، يرجى إعادة تحميل الصفحة')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const fullPhoneNumber = `+964${cleanedPhone}`
      const confirmation = await authService.sendPhoneVerification({
        phoneNumber: fullPhoneNumber,
        recaptchaVerifier
      })
      
      setConfirmationResult(confirmation)
      setStep('verification')
      setResendTimer(60) // دقيقة واحدة
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إرسال رمز التحقق')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!confirmationResult) {
      setError('خطأ في التحقق، يرجى المحاولة مرة أخرى')
      return
    }

    if (verificationCode.length !== 6) {
      setError('رمز التحقق يجب أن يكون 6 أرقام')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await authService.verifyPhoneCode(confirmationResult, verificationCode)
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'رمز التحقق غير صحيح')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendTimer > 0) return
    
    setResendTimer(60)
    setError('')
    
    try {
      const cleanedPhone = phoneNumber.replace(/\D/g, '')
      const fullPhoneNumber = `+964${cleanedPhone}`
      
      if (recaptchaVerifier) {
        const confirmation = await authService.sendPhoneVerification({
          phoneNumber: fullPhoneNumber,
          recaptchaVerifier
        })
        setConfirmationResult(confirmation)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في إعادة إرسال الرمز')
      setResendTimer(0)
    }
  }

  const handleBack = () => {
    setStep('phone')
    setVerificationCode('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-2xl mb-4">
            <span className="text-2xl">📱</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'phone' ? 'تسجيل الدخول برقم الهاتف' : 'تأكيد رقم الهاتف'}
          </h1>
          <p className="text-gray-600">
            {step === 'phone' 
              ? 'أدخل رقم هاتفك العراقي لتسجيل الدخول'
              : `تم إرسال رمز التحقق إلى +964 ${phoneNumber}`
            }
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

          {step === 'phone' ? (
            /* Phone Input Step */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 text-sm">964+</span>
                  </div>
                  <Input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="750 123 4567"
                    className="pr-16 text-left direction-ltr"
                    maxLength={13}
                    required
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <p>أرقام مدعومة: آسياسيل (077-079)، زين (070-071)، كورك (075)، إيرثلنك (076)</p>
                </div>
              </div>

              <Button 
                onClick={handleSendCode}
                className="w-full" 
                disabled={isLoading || !phoneNumber}
              >
                {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
              </Button>

              {/* reCAPTCHA */}
              <div ref={recaptchaRef}></div>
            </div>
          ) : (
            /* Verification Step */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز التحقق
                </label>
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setVerificationCode(value)
                    setError('')
                  }}
                  placeholder="123456"
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
                <div className="mt-2 text-xs text-gray-500 text-center">
                  أدخل الرمز المكون من 6 أرقام المرسل إلى هاتفك
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  تغيير الرقم
                </Button>
                <Button 
                  onClick={handleVerifyCode}
                  className="flex-1" 
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? 'جاري التحقق...' : 'تأكيد الرمز'}
                </Button>
              </div>

              {/* Resend Code */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">
                    يمكن إعادة الإرسال بعد {resendTimer} ثانية
                  </p>
                ) : (
                  <button
                    onClick={handleResendCode}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    إعادة إرسال الرمز
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <span className="text-gray-600">تفضل طريقة أخرى؟ </span>
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              تسجيل دخول بالإيميل
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