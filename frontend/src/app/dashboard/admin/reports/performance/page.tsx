/**
 * ⚡ صفحة تقارير الأداء - Admin Dashboard
 * 🚧 الحالة: قيد التطوير - هيكل أولي
 * 📡 الربط: CampaignController.ts → getPerformanceReports
 * 🎯 المسار: /dashboard/admin/reports/performance
 */

export default function PerformanceReportsPage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          ⚡ تقارير الأداء
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            📡 سيتم ربطها مع: CampaignController → GET /api/campaigns/reports/performance
          </p>
        </div>
      </div>
    </div>
  );
}
