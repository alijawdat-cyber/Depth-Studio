/**
 * 🚀 صفحة الحملات النشطة - Brand Dashboard
 * 🚧 الحالة: قيد التطوير - هيكل أولي
 * 📡 الربط: CampaignController.ts → getActiveCampaigns
 * 🎯 المسار: /dashboard/brand/campaigns/active
 */

export default function ActiveCampaignsPage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          🚀 الحملات النشطة
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            📡 سيتم ربطها مع: CampaignController → GET /api/campaigns?status=active
          </p>
        </div>
      </div>
    </div>
  );
}
