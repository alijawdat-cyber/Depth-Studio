import { FaPlus } from 'react-icons/fa'

export default function SEOTools() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">أدوات السيو</h1>
      <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
        <FaPlus className="text-lime-600 ml-3 inline" />
        <span className="font-semibold text-lime-800">قيد التطوير - </span>
        <span className="text-lime-700 text-sm">أدوات تحسين محركات البحث قيد التطوير</span>
      </div>
    </div>
  )
}
