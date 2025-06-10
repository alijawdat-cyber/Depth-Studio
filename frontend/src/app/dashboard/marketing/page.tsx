'use client';

import { useEffect, useState } from 'react';
import { 
  FaBullhorn, 
  FaChartLine, 
  FaUsers, 
  FaDollarSign,
  FaEye,
  FaMousePointer,
  FaArrowUp
} from 'react-icons/fa';

import { useAuth } from '@/store/auth.store';

/**
 * 📈 لوحة تحكم منسق التسويق - Depth Studio
 * ==========================================
 * 
 * 🎯 الأهداف:
 * - تحليل أداء الحملات التسويقية
 * - متابعة معدلات التحويل والوصول
 * - إدارة الميزانيات والإعلانات
 * - تحسين استراتيجيات التسويق
 */
export default function MarketingDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    conversionRate: 0,
    adSpend: 0,
    roi: 0,
    loading: true
  });

  useEffect(() => {
    const loadData = async () => {
      setTimeout(() => {
        setStats({
          totalCampaigns: 24,
          conversionRate: 12.5,
          adSpend: 45000,
          roi: 320,
          loading: false
        });
      }, 1000);
    };

    loadData();
  }, []);

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            لوحة تحكم التسويق
          </h1>
          <p className="text-gray-600 mt-1">
            مرحباً {user?.full_name || 'منسق التسويق'} - تحليل وتحسين الحملات
          </p>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            حملة إعلانية
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            تقرير الأداء
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* إجمالي الحملات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الحملات</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCampaigns}</p>
              <p className="text-sm text-blue-600 mt-1">8 حملات نشطة</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaBullhorn className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* معدل التحويل */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">معدل التحويل</p>
              <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
              <p className="text-sm text-green-600 mt-1">+2.3% من الشهر الماضي</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaMousePointer className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* إنفاق الإعلانات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إنفاق الإعلانات</p>
              <p className="text-3xl font-bold text-gray-900">${stats.adSpend.toLocaleString()}</p>
              <p className="text-sm text-purple-600 mt-1">هذا الشهر</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaDollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* عائد الاستثمار */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">عائد الاستثمار</p>
              <p className="text-3xl font-bold text-gray-900">{stats.roi}%</p>
              <p className="text-sm text-orange-600 mt-1">أداء ممتاز</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <FaArrowUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* أدوات التسويق */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* تحليل الجمهور */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">تحليل الجمهور</h3>
            <p className="text-sm text-gray-600 mb-4">فهم سلوك العملاء المستهدفين</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
              عرض التحليل
            </button>
          </div>
        </div>

        {/* إدارة الحملات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaChartLine className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">إدارة الحملات</h3>
            <p className="text-sm text-gray-600 mb-4">تتبع وتحسين أداء الحملات</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full">
              إدارة الحملات
            </button>
          </div>
        </div>

        {/* تقارير الأداء */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEye className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">تقارير الأداء</h3>
            <p className="text-sm text-gray-600 mb-4">تقارير مفصلة ومؤشرات KPI</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full">
              عرض التقارير
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 