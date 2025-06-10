/**
 * 📊 صفحة تقارير المشاريع - Admin Dashboard
 * 🚧 الحالة: قيد التطوير - هيكل أولي
 * 📡 الربط: CampaignController.ts → getProjectReports
 * 🎯 المسار: /dashboard/admin/reports/projects
 */

export default function ProjectReportsPage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          📊 تقارير المشاريع
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            📡 سيتم ربطها مع: CampaignController → GET /api/campaigns/reports/projects
          </p>
        </div>
      </div>
    </div>
  );
}
