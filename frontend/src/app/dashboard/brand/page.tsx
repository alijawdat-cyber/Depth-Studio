'use client';

import { useEffect, useState } from 'react';
import { 
  FaBullhorn, 
  FaFileAlt, 
  FaUsers, 
  FaChartLine,
  FaEye,
  FaHeart
} from 'react-icons/fa';

import { useAuth } from '@/store/auth.store';

interface Campaign {
  id: number;
  title: string;
  status: 'active' | 'draft' | 'completed';
  budget: number;
  reach: number;
  engagement: number;
  startDate: string;
}

/**
 * 🏢 لوحة تحكم منسق البراند - Depth Studio
 * ========================================
 * 
 * 🎯 الأهداف:
 * - إدارة حملات البراند والتسويق
 * - متابعة أداء المحتوى والوصول
 * - تنسيق مع المصورين والفرق
 * - تحليل النتائج والإحصائيات
 */
export default function BrandDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalReach: 0,
    avgEngagement: 0,
    contentPieces: 0,
    loading: true
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setTimeout(() => {
        setStats({
          activeCampaigns: 12,
          totalReach: 250000,
          avgEngagement: 8.5,
          contentPieces: 89,
          loading: false
        });

        setCampaigns([
          {
            id: 1,
            title: 'حملة الصيف 2024',
            status: 'active',
            budget: 15000,
            reach: 45000,
            engagement: 9.2,
            startDate: '2024-12-01'
          },
          {
            id: 2,
            title: 'إطلاق منتج جديد',
            status: 'draft',
            budget: 25000,
            reach: 0,
            engagement: 0,
            startDate: '2024-12-20'
          },
          {
            id: 3,
            title: 'حملة نهاية العام',
            status: 'active',
            budget: 30000,
            reach: 78000,
            engagement: 12.1,
            startDate: '2024-11-15'
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
            لوحة تحكم البراند
          </h1>
          <p className="text-gray-600 mt-1">
            مرحباً {user?.full_name || 'منسق البراند'} - إدارة حملاتك ومحتواك
          </p>
        </div>
        
        <div className="flex items-center space-x-3 space-x-reverse">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            حملة جديدة
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            تقرير شامل
          </button>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* الحملات النشطة */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">الحملات النشطة</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeCampaigns}</p>
              <p className="text-sm text-blue-600 mt-1">3 حملات جديدة هذا الشهر</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaBullhorn className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* إجمالي الوصول */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الوصول</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalReach.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+22% من الشهر الماضي</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaEye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* متوسط التفاعل */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">متوسط التفاعل</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgEngagement}%</p>
              <p className="text-sm text-purple-600 mt-1">أعلى من المتوسط</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FaHeart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* قطع المحتوى */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">قطع المحتوى</p>
              <p className="text-3xl font-bold text-gray-900">{stats.contentPieces}</p>
              <p className="text-sm text-orange-600 mt-1">15 قطعة هذا الأسبوع</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <FaFileAlt className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* الحملات الحالية */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">الحملات الحالية</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            عرض الكل
          </button>
        </div>
        
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 space-x-reverse mb-2">
                    <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : campaign.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status === 'active' ? 'نشطة' : 
                       campaign.status === 'draft' ? 'مسودة' : 'مكتملة'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">الميزانية:</span>
                      <span className="mr-1">${campaign.budget.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">الوصول:</span>
                      <span className="mr-1">{campaign.reach.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="font-medium">التفاعل:</span>
                      <span className="mr-1">{campaign.engagement}%</span>
                    </div>
                    <div>
                      <span className="font-medium">تاريخ البداية:</span>
                      <span className="mr-1">{campaign.startDate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors">
                    تفاصيل
                  </button>
                  <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    تحرير
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* أدوات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* إنشاء محتوى */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaFileAlt className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">إنشاء محتوى</h3>
            <p className="text-sm text-gray-600 mb-4">أضف محتوى جديد للحملات</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full">
              إنشاء محتوى
            </button>
          </div>
        </div>

        {/* إدارة الفريق */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">إدارة الفريق</h3>
            <p className="text-sm text-gray-600 mb-4">تنسيق مع المصورين والمسوقين</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors w-full">
              عرض الفريق
            </button>
          </div>
        </div>

        {/* التحليلات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaChartLine className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">تحليلات متقدمة</h3>
            <p className="text-sm text-gray-600 mb-4">تقارير مفصلة للأداء</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full">
              عرض التحليلات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 