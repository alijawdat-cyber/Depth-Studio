import { FaPlus } from 'react-icons/fa'

export default function BudgetManagement() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">إدارة الميزانية</h1>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <FaPlus className="text-blue-600 ml-3 inline" />
        <span className="font-semibold text-blue-800">قيد التطوير - </span>
        <span className="text-blue-700 text-sm">تتبع وإدارة الميزانيات</span>
      </div>
    </div>
  )
}
