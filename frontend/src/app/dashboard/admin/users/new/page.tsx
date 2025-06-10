/**
 * ➕ صفحة إضافة مستخدم جديد - Admin Dashboard  
 * 🚧 الحالة: قيد التطوير - هيكل أولي
 * 📡 الربط: UserController.ts → createUser API
 * 🎯 المسار: /dashboard/admin/users/new
 */

export default function NewUserPage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          ➕ إضافة مستخدم جديد
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            📡 سيتم ربطها مع: UserController → POST /api/users/create
          </p>
        </div>
      </div>
    </div>
  );
}
