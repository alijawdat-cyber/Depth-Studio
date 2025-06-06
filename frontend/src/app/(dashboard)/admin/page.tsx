'use client'

import { useAuth } from '@/store/auth-store'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { AuthWrapper } from '@/components/auth/auth-wrapper'
import { FaUsers, FaClipboardCheck, FaBuilding, FaChartLine, FaTimes, FaCheck, FaClock } from 'react-icons/fa'

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const [stats] = useState({
    totalUsers: 45,
    pendingApprovals: 8,
    activeBrands: 12,
    thisMonthProjects: 23
  })

  return (
    <AuthWrapper requireAuth={true} allowedRoles={['super_admin']}>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً بك، {user?.display_name}
          </h1>
          <p className="text-gray-600">
            لوحة تحكم المدير العام - Depth Studio
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
              </div>
              <FaUsers className="text-3xl text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">طلبات الموافقة</p>
                <p className="text-3xl font-bold text-orange-900">{stats.pendingApprovals}</p>
              </div>
              <FaClipboardCheck className="text-3xl text-orange-500" />
            </div>
          </Card>

          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">البراندات النشطة</p>
                <p className="text-3xl font-bold text-green-900">{stats.activeBrands}</p>
              </div>
              <FaBuilding className="text-3xl text-green-500" />
            </div>
          </Card>

          <Card className="p-6 bg-purple-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">مشاريع هذا الشهر</p>
                <p className="text-3xl font-bold text-purple-900">{stats.thisMonthProjects}</p>
              </div>
              <FaChartLine className="text-3xl text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              طلبات الموافقة الأخيرة
            </h3>
            <div className="space-y-3">
              {[
                { name: 'أحمد محمد', role: 'مصور', status: 'pending', time: 'منذ ساعتين' },
                { name: 'فاطمة علي', role: 'منسق براند', status: 'approved', time: 'منذ 4 ساعات' },
                { name: 'سارة حسن', role: 'منسق تسويق', status: 'rejected', time: 'منذ يوم' },
              ].map((request, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{request.name}</p>
                    <p className="text-sm text-gray-600">{request.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{request.time}</span>
                    {request.status === 'pending' && <FaClock className="text-orange-500" />}
                    {request.status === 'approved' && <FaCheck className="text-green-500" />}
                    {request.status === 'rejected' && <FaTimes className="text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              إحصائيات سريعة
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">مصورين نشطين</span>
                <span className="font-bold text-blue-600">18</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">منسقي براند</span>
                <span className="font-bold text-green-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">منسقي تسويق</span>
                <span className="font-bold text-purple-600">6</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">مشاريع مكتملة</span>
                <span className="font-bold text-indigo-600">156</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AuthWrapper>
  )
} 