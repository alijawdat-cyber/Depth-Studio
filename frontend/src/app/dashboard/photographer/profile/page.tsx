/**
 * 👤 صفحة الملف الشخصي - Photographer Dashboard
 * 🚧 الحالة: قيد التطوير - هيكل أولي
 * 📡 الربط: AuthController.ts → updateProfile API
 * 🎯 المسار: /dashboard/photographer/profile
 */

export default function PhotographerProfilePage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          👤 الملف الشخصي
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            📡 سيتم ربطها مع: AuthController → PATCH /api/auth/profile/:userId
          </p>
        </div>
      </div>
    </div>
  );
}
