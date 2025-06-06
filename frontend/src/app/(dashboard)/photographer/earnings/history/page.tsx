import { FaPlus } from 'react-icons/fa'

export default function EarningsHistory() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">تاريخ المدفوعات</h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <FaPlus className="text-yellow-600 ml-3 inline" />
        <span className="font-semibold text-yellow-800">قيد التطوير - </span>
        <span className="text-yellow-700 text-sm">تاريخ المدفوعات قيد التطوير</span>
      </div>
    </div>
  )
}
