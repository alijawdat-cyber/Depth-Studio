import { FaPlus } from 'react-icons/fa'

export default function MarketingAutomation() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">أدوات الأتمتة</h1>
      <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
        <FaPlus className="text-violet-600 ml-3 inline" />
        <span className="font-semibold text-violet-800">قيد التطوير - </span>
        <span className="text-violet-700 text-sm">أدوات الأتمتة التسويقية قيد التطوير</span>
      </div>
    </div>
  )
}
