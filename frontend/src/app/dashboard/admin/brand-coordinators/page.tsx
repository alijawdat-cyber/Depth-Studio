/**
 * 🏢 صفحة إدارة منسقي البراند - Admin Dashboard
 * 🚧 الحالة: قيد التطوير - هيكل أولي
 * 📡 الربط: UserController.ts → getUsersByRole('brand_coordinator')
 * 🎯 المسار: /dashboard/admin/brand-coordinators
 */

export default function BrandCoordinatorsPage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          🏢 إدارة منسقي البراند
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 text-sm">
            📡 سيتم ربطها مع: UserController → GET /api/users?role=brand_coordinator
          </p>
        </div>
      </div>
    </div>
  );
}
