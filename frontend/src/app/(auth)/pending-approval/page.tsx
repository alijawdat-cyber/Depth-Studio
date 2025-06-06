'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { useAuth } from '@/store/auth-store'


function PendingApprovalPage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  
  const [isLoading, setIsLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(async () => {
      await checkApprovalStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  // Redirect if user is already approved
  useEffect(() => {
    if (user?.primary_role !== 'new_user' && user?.is_active) {
      router.push('/admin')
    }
  }, [user, router])

  const checkApprovalStatus = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      await refreshUser()
      setLastChecked(new Date())
    } catch (error) {
      console.error('Error checking approval status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactSupport = () => {
    const subject = encodeURIComponent('استفسار حول حالة الطلب')
    const body = encodeURIComponent(`
مرحباً فريق Depth Studio،

أرسلت طلب انضمام للمنصة ولكن لم أحصل على رد بعد. 

معلومات حسابي:
- البريد الإلكتروني: ${user?.email}
- تاريخ التقديم: ${user?.created_at}
- الدور المطلوب: ${user?.primary_role}

يرجى مراجعة طلبي والرد في أقرب وقت ممكن.

شكراً لكم
    `)
    
    window.location.href = `mailto:support@depthstudio.com?subject=${subject}&body=${body}`
  }

  const getStatusInfo = () => {
    if (!user) return { status: 'unknown', message: 'خطأ في جلب بيانات المستخدم' }

    switch (user.primary_role) {
      case 'new_user':
        return {
          status: 'pending',
          message: 'طلبك قيد المراجعة',
          description: 'سيتم مراجعة طلبك من قبل المدير العام خلال 24-48 ساعة'
        }
      case 'photographer':
      case 'brand_coordinator':
      case 'marketing_coordinator':
        if (user.is_active) {
          return {
            status: 'approved',
            message: 'تم قبول طلبك!',
            description: 'مرحباً بك في Depth Studio'
          }
        } else {
          return {
            status: 'reviewing',
            message: 'طلبك قيد المراجعة النهائية',
            description: 'يتم الآن تجهيز حسابك، سيتم التفعيل قريباً'
          }
        }
      default:
        return {
          status: 'unknown',
          message: 'حالة غير معروفة',
          description: 'يرجى التواصل مع الدعم'
        }
    }
  }

  const getProgressSteps = () => {
    const baseSteps = [
      { id: 1, title: 'إرسال الطلب', completed: true },
      { id: 2, title: 'مراجعة البيانات', completed: user?.primary_role !== 'new_user' },
      { id: 3, title: 'الموافقة النهائية', completed: user?.is_active === true },
      { id: 4, title: 'تفعيل الحساب', completed: user?.is_active === true }
    ]

    return baseSteps
  }

  const statusInfo = getStatusInfo()
  const progressSteps = getProgressSteps()
  const currentStep = progressSteps.findIndex(step => !step.completed) + 1 || progressSteps.length + 1

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500 text-white rounded-2xl mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {statusInfo.message}
          </h1>
          <p className="text-gray-600">
            {statusInfo.description}
          </p>
        </div>

        {/* Status Alert */}
        {statusInfo.status === 'approved' && (
          <Alert 
            variant="success" 
            message="تهانينا! تم قبول طلبك بنجاح"
            className="mb-6"
          />
        )}

        {/* Progress Steps */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">مراحل معالجة الطلب</h3>
          
          <div className="space-y-4">
            {progressSteps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white'
                    : currentStep === step.id
                    ? 'bg-orange-500 border-orange-500 text-white animate-pulse'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  {step.completed ? '✓' : step.id}
                </div>
                
                <div className="mr-4 flex-1">
                  <div className={`font-medium ${
                    step.completed 
                      ? 'text-green-700'
                      : currentStep === step.id
                      ? 'text-orange-700'
                      : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                
                {step.completed && (
                  <div className="text-green-500 text-sm">
                    مكتمل
                  </div>
                )}
                
                {currentStep === step.id && (
                  <div className="text-orange-500 text-sm animate-pulse">
                    جاري المعالجة...
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* User Info */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات الطلب</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">الاسم</label>
              <p className="font-medium">{user.display_name}</p>
            </div>
            
            <div>
              <label className="text-sm text-gray-600">البريد الإلكتروني</label>
              <p className="font-medium">{user.email}</p>
            </div>
            
            <div>
              <label className="text-sm text-gray-600">الدور المطلوب</label>
              <p className="font-medium">
                {user.primary_role === 'photographer' && 'مصور'}
                {user.primary_role === 'brand_coordinator' && 'منسق براند'}
                {user.primary_role === 'marketing_coordinator' && 'منسق تسويق'}
                {user.primary_role === 'new_user' && 'لم يتم التحديد بعد'}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-gray-600">تاريخ التقديم</label>
              <p className="font-medium">
                {user.created_at ? new Date(user.created_at._seconds * 1000).toLocaleDateString('ar-EG') : 'غير محدد'}
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={checkApprovalStatus}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'جاري التحقق...' : 'تحديث الحالة'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleContactSupport}
              className="flex-1"
            >
              التواصل مع الدعم
            </Button>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="ml-2 rounded border-gray-300 text-primary-600"
              />
              تحديث تلقائي كل 30 ثانية
            </label>
            
            <span>
              آخر تحديث: {lastChecked.toLocaleTimeString('ar-EG')}
            </span>
          </div>
        </div>

        {/* Expected Timeline */}
        <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-bold text-blue-900 mb-2">المدة المتوقعة للمراجعة</h3>
          <div className="space-y-2 text-blue-800">
            <p>• <strong>المصور:</strong> 24-48 ساعة</p>
            <p>• <strong>منسق براند:</strong> 2-3 أيام عمل</p>
            <p>• <strong>منسق تسويق:</strong> 3-5 أيام عمل</p>
          </div>
          <p className="text-sm text-blue-600 mt-3">
            💡 <strong>نصيحة:</strong> تأكد من توفر رقم هاتف صحيح لتسهيل التواصل معك
          </p>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}

// Dynamic export to prevent SSR issues
import dynamic from 'next/dynamic'
export default dynamic(() => Promise.resolve(PendingApprovalPage), { ssr: false }) 