'use client'

import Link from 'next/link'
import { FaCamera, FaCalendarAlt, FaDollarSign, FaImages, FaPlus, FaClock } from 'react-icons/fa'

export default function PhotographerDashboard() {
  // Mock data for photographer
  const stats = {
    completedProjects: 24,
    upcomingProjects: 3,
    totalEarnings: 12500000,
    averageRating: 4.8,
    portfolioItems: 156
  }

  const upcomingProjects = [
    {
      id: '1',
      title: 'تصوير منتجات براند X',
      brand: 'براند X',
      date: '2024-06-10',
      time: '10:00',
      location: 'بغداد - الكرادة',
      payment: 500000
    },
    {
      id: '2',
      title: 'جلسة تصوير شخصية',
      brand: 'عميل فردي',
      date: '2024-06-12',
      time: '14:00', 
      location: 'بغداد - الجادرية',
      payment: 300000
    }
  ]

  const recentActivities = [
    { type: 'project_completed', message: 'تم إنهاء مشروع تصوير براند Y', time: 'منذ ساعتين' },
    { type: 'payment_received', message: 'تم استلام دفعة بقيمة 750,000 IQD', time: 'منذ 4 ساعات' },
    { type: 'project_assigned', message: 'تم تعيين مشروع جديد من براند Z', time: 'أمس' }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">مرحباً بعودتك! 📸</h1>
            <p className="mt-1 opacity-90">
              لديك {stats.upcomingProjects} مشاريع قادمة هذا الأسبوع
            </p>
          </div>
          <div className="text-left">
            <div className="text-sm opacity-75">تقييمك العام</div>
            <div className="text-2xl font-bold">⭐ {stats.averageRating}/5</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <FaCamera className="text-green-600 text-xl" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.completedProjects}
              </div>
              <div className="text-gray-600">مشروع مكتمل</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <FaCalendarAlt className="text-blue-600 text-xl" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.upcomingProjects}
              </div>
              <div className="text-gray-600">مشاريع قادمة</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <FaDollarSign className="text-yellow-600 text-xl" />
            </div>
            <div className="mr-4">
              <div className="text-lg font-bold text-gray-900">
                {(stats.totalEarnings / 1000).toFixed(0)}K IQD
              </div>
              <div className="text-gray-600">إجمالي الأرباح</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <FaImages className="text-purple-600 text-xl" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.portfolioItems}
              </div>
              <div className="text-gray-600">صورة في المعرض</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Projects */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">المشاريع القادمة</h2>
            <Link href="/photographer/projects">
              <span className="text-blue-600 hover:text-blue-800 text-sm">عرض الكل</span>
            </Link>
          </div>
          
          <div className="space-y-4">
            {upcomingProjects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600">{project.brand}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                      <FaCalendarAlt className="ml-1" />
                      {project.date} - {project.time}
                    </div>
                    <div className="text-sm text-gray-500">{project.location}</div>
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-green-600">
                      {project.payment.toLocaleString()} IQD
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Link href="/photographer/schedule">
            <button className="w-full mt-4 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100">
              إدارة الجدول الزمني
            </button>
          </Link>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">آخر النشاطات</h2>
          
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className={`w-2 h-2 rounded-full mt-2 ml-3 ${
                  activity.type === 'project_completed' ? 'bg-green-500' :
                  activity.type === 'payment_received' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <Link href="/photographer/earnings">
            <button className="w-full mt-4 bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100">
              عرض الأرباح والمدفوعات
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Access Menu */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">وصول سريع</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/photographer/projects">
            <div className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <FaCamera className="mx-auto text-2xl text-blue-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">المشاريع</div>
            </div>
          </Link>
          
          <Link href="/photographer/schedule">
            <div className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <FaClock className="mx-auto text-2xl text-green-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">الجدول</div>
            </div>
          </Link>
          
          <Link href="/photographer/portfolio">
            <div className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <FaImages className="mx-auto text-2xl text-purple-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">المعرض</div>
            </div>
          </Link>
          
          <Link href="/photographer/earnings">
            <div className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <FaDollarSign className="mx-auto text-2xl text-yellow-600 mb-2" />
              <div className="text-sm font-medium text-gray-900">الأرباح</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Development Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-blue-600">
            <FaPlus className="text-lg" />
          </div>
          <div className="mr-3">
            <h3 className="font-semibold text-blue-800">قيد التطوير</h3>
            <p className="text-blue-700 text-sm">
              هذه الصفحة قيد التطوير. سيتم إضافة المزيد من المميزات والإحصائيات التفاعلية قريباً
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
