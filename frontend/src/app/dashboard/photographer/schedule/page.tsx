/**
 * 📅 صفحة الجدولة والمواعيد - Photographer Dashboard
 * 🚧 الحالة: قيد التطوير - هيكل أولي
 * 📡 الربط: CampaignController.ts → getPhotographerSchedule
 * 🎯 المسار: /dashboard/photographer/schedule
 */

export default function SchedulePage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          📅 الجدولة والمواعيد
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-indigo-800 text-sm">
            📡 سيتم ربطها مع: CampaignController → GET /api/campaigns/photographer/schedule
          </p>
        </div>
      </div>
    </div>
  );
}
