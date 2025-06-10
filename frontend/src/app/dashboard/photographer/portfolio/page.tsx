/**
 * 📷 صفحة معرض الأعمال - Photographer Dashboard
 * 🚧 الحالة: قيد التطوير - هيكل أولي
 * 📡 الربط: ContentController.ts → getPhotographerPortfolio
 * 🎯 المسار: /dashboard/photographer/portfolio
 */

export default function PortfolioPage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          📷 معرض أعمالي
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-800 text-sm">
            📡 سيتم ربطها مع: ContentController → GET /api/content/photographer/portfolio
          </p>
        </div>
      </div>
    </div>
  );
}
