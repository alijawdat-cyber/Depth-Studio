import { FaPlus } from 'react-icons/fa'

export default function InvoicesManagement() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">إدارة الفواتير</h1>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <FaPlus className="text-purple-600 ml-3 inline" />
        <span className="font-semibold text-purple-800">قيد التطوير - </span>
        <span className="text-purple-700 text-sm">إدارة الفواتير قيد التطوير</span>
      </div>
    </div>
  )
}
