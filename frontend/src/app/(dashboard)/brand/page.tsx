'use client'

import Link from 'next/link'
import { FaChartLine, FaUsers, FaImage, FaDollarSign, FaPlus } from 'react-icons/fa'

export default function BrandDashboard() {
  const brandStats = {
    activeCampaigns: 5,
    completedProjects: 18,
    teamMembers: 8,
    monthlyBudget: 25000000,
    budgetUsed: 18500000
  }

  const budgetPercentage = (brandStats.budgetUsed / brandStats.monthlyBudget) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold">لوحة تحكم منسق البراند 🏢</h1>
        <p className="mt-1 opacity-90">إدارة الحملات والمشاريع</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <FaChartLine className="text-blue-600 text-xl" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">{brandStats.activeCampaigns}</div>
              <div className="text-gray-600">حملات نشطة</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <FaImage className="text-green-600 text-xl" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">{brandStats.completedProjects}</div>
              <div className="text-gray-600">مشروع مكتمل</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <FaUsers className="text-purple-600 text-xl" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">{brandStats.teamMembers}</div>
              <div className="text-gray-600">عضو في الفريق</div>
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
                {Math.round(budgetPercentage)}%
              </div>
              <div className="text-gray-600">من الميزانية</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/brand/campaigns">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
            <FaChartLine className="text-2xl text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">إدارة الحملات</h3>
            <p className="text-sm text-gray-600">إنشاء ومتابعة الحملات</p>
          </div>
        </Link>

                  <Link href="/brand/team">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
            <FaUsers className="text-2xl text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">إدارة الفريق</h3>
            <p className="text-sm text-gray-600">متابعة أداء الفريق</p>
          </div>
        </Link>

                  <Link href="/brand/analytics">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
            <FaChartLine className="text-2xl text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">التحليلات</h3>
            <p className="text-sm text-gray-600">تقارير الأداء</p>
          </div>
        </Link>

                  <Link href="/brand/content">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
            <FaImage className="text-2xl text-yellow-600 mb-2" />
            <h3 className="font-semibold text-gray-900">مكتبة المحتوى</h3>
            <p className="text-sm text-gray-600">إدارة المحتوى</p>
          </div>
        </Link>
      </div>

      {/* Development Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <FaPlus className="text-purple-600 text-lg ml-3" />
          <div>
            <h3 className="font-semibold text-purple-800">قيد التطوير</h3>
            <p className="text-purple-700 text-sm">
              صفحة منسق البراند قيد التطوير - سيتم إضافة المزيد من المميزات قريباً
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
