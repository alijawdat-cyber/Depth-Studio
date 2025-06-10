/**
 * ✅ صفحة المهام الحالية - Photographer Dashboard
 * 🚧 الحالة: قيد التطوير - هيكل أولي
 * 📡 الربط: CampaignController.ts → getPhotographerTasks('current')
 * 🎯 المسار: /dashboard/photographer/tasks/current
 */

export default function CurrentTasksPage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          ✅ المهام الحالية
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            📡 سيتم ربطها مع: CampaignController → GET /api/campaigns/photographer/tasks?status=current
          </p>
        </div>
      </div>
    </div>
  );
}
