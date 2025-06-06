import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AuthWrapper } from '@/components/auth/auth-wrapper'

export default function HomePage() {
  return (
    <AuthWrapper>
      {/* This content will only show for unauthenticated users */}
      {/* Authenticated users will be automatically redirected to their dashboard */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-2xl mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              مرحباً بك في Depth Studio
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              منصة إدارة المحتوى والتصوير الرقمي
            </p>
          </div>
          
          <div className="space-y-4">
            <Link href="/login" className="block">
              <Button className="w-full" variant="primary">
                تسجيل الدخول
              </Button>
            </Link>
            
            <Link href="/register" className="block">
              <Button className="w-full" variant="secondary">
                إنشاء حساب جديد
              </Button>
            </Link>
          </div>

          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              استوديو متكامل لإدارة المشاريع والتصوير الرقمي في العراق
            </p>
          </div>
        </div>
      </div>
    </AuthWrapper>
  )
}