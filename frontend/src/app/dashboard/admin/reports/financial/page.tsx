/**
 * 💰 صفحة التقارير المالية - Admin Dashboard
 * 🚧 الحالة: قيد التطوير - هيكل أولي
 * 📡 الربط: PaymentController.ts → getFinancialReports
 * 🎯 المسار: /dashboard/admin/reports/financial
 */

export default function FinancialReportsPage() {
  return (
    <div className="p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">
          💰 التقارير المالية
        </h1>
        <p className="text-gray-600">
          🚧 هذه الصفحة قيد التطوير
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            📡 سيتم ربطها مع: PaymentController → GET /api/payments/reports/financial
          </p>
        </div>
      </div>
    </div>
  );
}
