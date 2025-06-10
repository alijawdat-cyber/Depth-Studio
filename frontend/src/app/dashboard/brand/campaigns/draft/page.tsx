/**
 * 📝 صفحة الحملات المسودة - Brand Dashboard
 * 🚧 الحالة: قيد التطوير - هيكل أولي
 * 📡 الربط: CampaignController.ts → getDraftCampaigns
 * 🎯 المسار: /dashboard/brand/campaigns/draft
 */

export default function DraftCampaignsPage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          📝 الحملات المسودة
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-800 text-sm">
            📡 سيتم ربطها مع: CampaignController → GET /api/campaigns?status=draft
          </p>
        </div>
      </div>
    </div>
  );
}
