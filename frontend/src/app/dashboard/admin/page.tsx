'use client';

import { useEffect, useState } from 'react';
import { 
  FaUsers, 
  FaChartBar, 
  FaDollarSign, 
  FaCamera,
  FaBullhorn,
  FaCog,
  FaExclamationTriangle
} from 'react-icons/fa';

// ======================================
// 🏪 إدارة الحالة
// ======================================

import { useAuth } from '@/store/auth.store';
// 🔧 useAuth: التحقق من صلاحيات الأدمن
// 📋 الفائدة: التأكد من أن المستخدم admin قبل عرض البيانات الحساسة

/**
 * 🛡️ لوحة تحكم الأدمن - Depth Studio
 * ===================================
 * 
 * 🎯 الأهداف:
 * - إحصائيات شاملة للنظام
 * - إدارة المستخدمين والأدوار
 * - مراقبة الأداء والأمان
 * - تحكم كامل في النظام
 * 
 * 📊 الإحصائيات المعروضة:
 * - إجمالي المستخدمين والأدوار
 * - الإيرادات والمدفوعات
 * - المشاريع والحملات النشطة
 * - إحصائيات الأمان والنشاط
 * 
 * 🔧 الأدوات المتاحة:
 * - إدارة المستخدمين
 * - إعدادات النظام
 * - التقارير المتقدمة
 * - مراقبة الأمان
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeProjects: 0,
    pendingApprovals: 0,
    loading: true
  });

  // تحميل الإحصائيات (سيتم ربطها بالـ API لاحقاً)
  useEffect(() => {
    const loadStats = async () => {
      // محاكاة تحميل البيانات
      setTimeout(() => {
        setStats({
          totalUsers: 1247,
          totalRevenue: 125000,
          activeProjects: 89,
          pendingApprovals: 23,
          loading: false
        });
      }, 1000);
    };

    loadStats();
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
            لوحة تحكم الأدمن
          </h1>
          <p className="text-gray-600 mt-1">
            مرحباً {user?.full_name || 'الأدمن'} - إدارة شاملة للنظام
          </p>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            تقرير شامل
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            إعدادات النظام
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* إجمالي المستخدمين */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي المستخدمين</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+12% من الشهر الماضي</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* الإيرادات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
              <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+8% من الشهر الماضي</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* المشاريع النشطة */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">المشاريع النشطة</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
              <p className="text-sm text-blue-600 mt-1">23 مشروع جديد هذا الأسبوع</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaCamera className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* الموافقات المعلقة */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">موافقات معلقة</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              <p className="text-sm text-orange-600 mt-1">تحتاج مراجعة فورية</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <FaExclamationTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* أدوات الإدارة السريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-right">
          <FaUsers className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900">إدارة المستخدمين</h3>
          <p className="text-sm text-gray-600 mt-1">عرض وإدارة جميع المستخدمين</p>
        </button>

        <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-right">
          <FaChartBar className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900">التقارير المالية</h3>
          <p className="text-sm text-gray-600 mt-1">إحصائيات مفصلة للإيرادات</p>
        </button>

        <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-right">
          <FaBullhorn className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900">إدارة الحملات</h3>
          <p className="text-sm text-gray-600 mt-1">مراقبة جميع الحملات النشطة</p>
        </button>

        <button className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-right">
          <FaCog className="w-8 h-8 text-gray-600 mb-3" />
          <h3 className="font-semibold text-gray-900">إعدادات النظام</h3>
          <p className="text-sm text-gray-600 mt-1">تكوين عام للمنصة</p>
        </button>
      </div>

      {/* نشاط حديث */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* آخر المستخدمين */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">آخر المستخدمين المسجلين</h3>
          <div className="space-y-3">
            {[
              { name: 'أحمد محمد', role: 'مصور', time: 'منذ 5 دقائق' },
              { name: 'فاطمة علي', role: 'منسق براند', time: 'منذ 15 دقيقة' },
              { name: 'محمد حسن', role: 'منسق تسويق', time: 'منذ ساعة' },
              { name: 'سارة أحمد', role: 'مصور', time: 'منذ ساعتين' }
            ].map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUsers className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.role}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{user.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات اليوم</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">تسجيلات جديدة</span>
              <span className="font-semibold text-green-600">+12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">مشاريع مكتملة</span>
              <span className="font-semibold text-blue-600">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">إيرادات اليوم</span>
              <span className="font-semibold text-green-600">$2,450</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">معدل الرضا</span>
              <span className="font-semibold text-purple-600">98.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 