/**
 * ➕ صفحة إنشاء حملة جديدة - Brand Dashboard
 * 🚧 الحالة: قيد التطوير - هيكل أولي
 * 📡 الربط: CampaignController.ts → createCampaign
 * 🎯 المسار: /dashboard/brand/campaigns/new
 */

export default function NewCampaignPage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          ➕ إنشاء حملة جديدة
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 text-sm">
            📡 سيتم ربطها مع: CampaignController → POST /api/campaigns/create
          </p>
        </div>
      </div>
    </div>
  );
}
