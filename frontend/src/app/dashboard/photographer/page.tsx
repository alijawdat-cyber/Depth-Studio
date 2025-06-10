'use client';

import { useEffect, useState } from 'react';
import { 
  FaCamera, 
  FaTasks, 
  FaDollarSign, 
  FaStar,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle
} from 'react-icons/fa';

import { useAuth } from '@/store/auth.store';

interface Task {
  id: number;
  title: string;
  client: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmed' | 'pending';
}

/**
 * 📸 لوحة تحكم المصور - Depth Studio
 * ==================================
 * 
 * 🎯 الأهداف:
 * - عرض المهام والمشاريع الحالية
 * - إدارة الجدول الزمني والمواعيد
 * - متابعة الأرباح والإحصائيات
 * - رفع الأعمال والمعرض
 * 
 * 📊 المعلومات المعروضة:
 * - المهام النشطة والقادمة
 * - الأرباح الشهرية والسنوية
 * - تقييمات العملاء
 * - إحصائيات الأداء
 */
export default function PhotographerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeTasks: 0,
    monthlyEarnings: 0,
    averageRating: 0,
    completedProjects: 0,
    loading: true
  });

  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // محاكاة تحميل البيانات
      setTimeout(() => {
        setStats({
          activeTasks: 8,
          monthlyEarnings: 4500,
          averageRating: 4.8,
          completedProjects: 127,
          loading: false
        });

        setUpcomingTasks([
          {
            id: 1,
            title: 'جلسة تصوير منتجات',
            client: 'شركة الأناقة',
            date: '2024-12-15',
            time: '10:00 ص',
            location: 'بغداد - الكرادة',
            status: 'confirmed'
          },
          {
            id: 2,
            title: 'تصوير حفل زفاف',
            client: 'عائلة الأحمد',
            date: '2024-12-18',
            time: '6:00 م',
            location: 'بغداد - الجادرية',
            status: 'pending'
          },
          {
            id: 3,
            title: 'تصوير إعلان تجاري',
            client: 'مطعم بغداد',
            date: '2024-12-20',
            time: '2:00 م',
            location: 'بغداد - المنصور',
            status: 'confirmed'
          }
        ]);
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
            لوحة تحكم المصور
          </h1>
          <p className="text-gray-600 mt-1">
            مرحباً {user?.full_name || 'المصور'} - إدارة مهامك ومشاريعك
          </p>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            مهمة جديدة
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            معرض الأعمال
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* المهام النشطة */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">المهام النشطة</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeTasks}</p>
              <p className="text-sm text-blue-600 mt-1">3 مهام هذا الأسبوع</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaTasks className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* الأرباح الشهرية */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الأرباح الشهرية</p>
              <p className="text-3xl font-bold text-gray-900">${stats.monthlyEarnings.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+15% من الشهر الماضي</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* التقييم */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">متوسط التقييم</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
              <p className="text-sm text-yellow-600 mt-1">من 5 نجوم</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FaStar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* المشاريع المكتملة */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">مشاريع مكتملة</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completedProjects}</p>
              <p className="text-sm text-purple-600 mt-1">منذ بداية العام</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaCamera className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* المهام القادمة */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">المهام القادمة</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            عرض الكل
          </button>
        </div>
        
        <div className="space-y-4">
          {upcomingTasks.map((task) => (
            <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 space-x-reverse mb-2">
                    <h4 className="font-semibold text-gray-900">{task.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status === 'confirmed' ? 'مؤكد' : 'في الانتظار'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{task.client}</p>
                  
                  <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-500">
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span>{task.date}</span>
                    </div>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <FaClock className="w-4 h-4" />
                      <span>{task.time}</span>
                    </div>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <FaMapMarkerAlt className="w-4 h-4" />
                      <span>{task.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                    تفاصيل
                  </button>
                  {task.status === 'confirmed' && (
                    <button className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-sm hover:bg-green-200 transition-colors">
                      <FaCheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* أدوات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* رفع الأعمال */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCamera className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">رفع أعمال جديدة</h3>
            <p className="text-sm text-gray-600 mb-4">أضف صورك الجديدة للمعرض</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
              رفع الصور
            </button>
          </div>
        </div>

        {/* الجدول الزمني */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">إدارة الجدول</h3>
            <p className="text-sm text-gray-600 mb-4">عرض وتنظيم مواعيدك</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full">
              عرض التقويم
            </button>
          </div>
        </div>

        {/* التقارير */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaDollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">تقارير الأرباح</h3>
            <p className="text-sm text-gray-600 mb-4">تفاصيل دخلك ومدفوعاتك</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full">
              عرض التقارير
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 