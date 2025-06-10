/**
 * 📸 صفحة إدارة المصورين - Admin Dashboard
 * 🚧 الحالة: قيد التطوير - هيكل أولي  
 * 📡 الربط: UserController.ts → getUsersByRole('photographer')
 * 🎯 المسار: /dashboard/admin/photographers
 */

export default function PhotographersPage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          📸 إدارة المصورين
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 text-sm">
            📡 سيتم ربطها مع: UserController → GET /api/users?role=photographer
          </p>
        </div>
      </div>
    </div>
  );
}
