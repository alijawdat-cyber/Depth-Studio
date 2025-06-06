import { FaPlus } from 'react-icons/fa'

export default function MarketingTools() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">أدوات التسويق</h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <FaPlus className="text-yellow-600 ml-3" />
          <div>
            <h3 className="font-semibold text-yellow-800">قيد التطوير</h3>
            <p className="text-yellow-700 text-sm">أدوات التسويق قيد التطوير</p>
          </div>
        </div>
      </div>
    </div>
  )
}
