'use client'

import Link from 'next/link'
import { FaChartLine, FaImage, FaHashtag, FaCog, FaPlus } from 'react-icons/fa'

export default function MarketingDashboard() {
  const marketingStats = {
    contentPublished: 45,
    socialReach: 125000,
    campaignsActive: 8,
    conversionRate: 3.2
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold">لوحة تحكم منسق التسويق 📈</h1>
        <p className="mt-1 opacity-90">إدارة المحتوى والحملات التسويقية</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <FaImage className="text-green-600 text-xl" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">{marketingStats.contentPublished}</div>
              <div className="text-gray-600">محتوى منشور</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <FaHashtag className="text-blue-600 text-xl" />
            </div>
            <div className="mr-4">
              <div className="text-lg font-bold text-gray-900">
                {(marketingStats.socialReach / 1000).toFixed(0)}K
              </div>
              <div className="text-gray-600">وصول اجتماعي</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <FaChartLine className="text-purple-600 text-xl" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">{marketingStats.campaignsActive}</div>
              <div className="text-gray-600">حملات نشطة</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <FaChartLine className="text-yellow-600 text-xl" />
            </div>
            <div className="mr-4">
              <div className="text-2xl font-bold text-gray-900">{marketingStats.conversionRate}%</div>
              <div className="text-gray-600">معدل التحويل</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/marketing/content">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
            <FaImage className="text-2xl text-green-600 mb-2" />
            <h3 className="font-semibold text-gray-900">إدارة المحتوى</h3>
            <p className="text-sm text-gray-600">إنشاء وجدولة المحتوى</p>
          </div>
        </Link>

                  <Link href="/marketing/campaigns">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
            <FaChartLine className="text-2xl text-blue-600 mb-2" />
            <h3 className="font-semibold text-gray-900">الحملات</h3>
            <p className="text-sm text-gray-600">متابعة الحملات التسويقية</p>
          </div>
        </Link>

                  <Link href="/marketing/social">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
            <FaHashtag className="text-2xl text-purple-600 mb-2" />
            <h3 className="font-semibold text-gray-900">السوشال ميديا</h3>
            <p className="text-sm text-gray-600">إدارة المنصات الاجتماعية</p>
          </div>
        </Link>

                  <Link href="/marketing/tools">
          <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
            <FaCog className="text-2xl text-yellow-600 mb-2" />
            <h3 className="font-semibold text-gray-900">الأدوات</h3>
            <p className="text-sm text-gray-600">أدوات التسويق المتقدمة</p>
          </div>
        </Link>
      </div>

      {/* Development Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <FaPlus className="text-green-600 text-lg ml-3" />
          <div>
            <h3 className="font-semibold text-green-800">قيد التطوير</h3>
            <p className="text-green-700 text-sm">
              صفحة منسق التسويق قيد التطوير - سيتم إضافة أدوات تحليلية متقدمة قريباً
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
