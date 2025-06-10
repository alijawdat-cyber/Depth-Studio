/**
 * 📁 صفحة إدارة المحتوى - Brand Dashboard
 * 🚧 الحالة: قيد التطوير - هيكل أولي
 * 📡 الربط: ContentController.ts → getBrandContent
 * 🎯 المسار: /dashboard/brand/content
 */

export default function BrandContentPage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          📁 إدارة المحتوى
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-800 text-sm">
            📡 سيتم ربطها مع: ContentController → GET /api/content/brand (2,111 سطر APIs)
          </p>
        </div>
      </div>
    </div>
  );
}
