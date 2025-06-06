'use client'

import { useAuth } from '@/store/auth-store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { 
  FaHome, 
  FaUsers, 
  FaClipboardCheck, 
  FaBuilding, 
  FaCamera, 
  FaChartLine,
  FaSignOutAlt,
  FaCog
} from 'react-icons/fa'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    } else if (user?.primary_role === 'new_user') {
      // المستخدمين الجدد يحتاجون اختيار دور أولاً
      router.push('/role-setup')
    }
  }, [isAuthenticated, user, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const getNavigationItems = () => {
    const role = user?.primary_role
    
    switch (role) {
      case 'super_admin':
        return [
          { icon: FaHome, label: 'الرئيسية', href: '/admin' },
          { icon: FaUsers, label: 'المستخدمين', href: '/admin/users' },
          { icon: FaClipboardCheck, label: 'الموافقات', href: '/admin/approvals' },
          { icon: FaBuilding, label: 'البراندات', href: '/admin/brands' },
          { icon: FaChartLine, label: 'التقارير', href: '/admin/reports' },
          { icon: FaCog, label: 'الإعدادات', href: '/admin/settings' },
        ]
      case 'photographer':
        return [
          { icon: FaHome, label: 'الرئيسية', href: '/photographer' },
          { icon: FaCamera, label: 'المشاريع', href: '/photographer/projects' },
          { icon: FaClipboardCheck, label: 'الجدول', href: '/photographer/schedule' },
          { icon: FaChartLine, label: 'الأرباح', href: '/photographer/earnings' },
          { icon: FaBuilding, label: 'المعرض', href: '/photographer/portfolio' },
        ]
      case 'brand_coordinator':
        return [
          { icon: FaHome, label: 'الرئيسية', href: '/brand' },
          { icon: FaChartLine, label: 'الحملات', href: '/brand/campaigns' },
          { icon: FaUsers, label: 'الفريق', href: '/brand/team' },
          { icon: FaClipboardCheck, label: 'التحليلات', href: '/brand/analytics' },
          { icon: FaBuilding, label: 'المحتوى', href: '/brand/content' },
        ]
      case 'marketing_coordinator':
        return [
          { icon: FaHome, label: 'الرئيسية', href: '/marketing' },
          { icon: FaClipboardCheck, label: 'المحتوى', href: '/marketing/content' },
          { icon: FaChartLine, label: 'الحملات', href: '/marketing/campaigns' },
          { icon: FaBuilding, label: 'السوشال ميديا', href: '/marketing/social' },
          { icon: FaCog, label: 'الأدوات', href: '/marketing/tools' },
        ]
      default:
        return []
    }
  }

  if (!isAuthenticated) {
    return <div className="p-8 text-center">جاري التحميل...</div>
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Depth Studio</h1>
          <p className="text-sm text-gray-600">{user?.display_name || 'مستخدم'}</p>
          <span className="text-xs text-blue-600">
            {user?.primary_role === 'super_admin' && 'مدير عام'}
            {user?.primary_role === 'photographer' && 'مصور'}
            {user?.primary_role === 'brand_coordinator' && 'منسق براند'}
            {user?.primary_role === 'marketing_coordinator' && 'منسق تسويق'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <item.icon className="ml-3 text-gray-600" />
                  <span className="text-gray-700">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
          >
            <FaSignOutAlt className="ml-3" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              لوحة التحكم
            </h2>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleDateString('ar-IQ')}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 