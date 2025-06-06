import { FaPlus } from 'react-icons/fa'

export default function ProjectDetail() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">تفاصيل المشروع</h1>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <FaPlus className="text-gray-600 ml-3 inline" />
        <span className="font-semibold text-gray-800">قيد التطوير - </span>
        <span className="text-gray-700 text-sm">تفاصيل المشروع قيد التطوير</span>
      </div>
    </div>
  )
}
