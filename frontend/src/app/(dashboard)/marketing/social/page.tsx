import { FaPlus } from 'react-icons/fa'

export default function MarketingSocial() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">إدارة السوشال ميديا</h1>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <FaPlus className="text-purple-600 ml-3" />
          <div>
            <h3 className="font-semibold text-purple-800">قيد التطوير</h3>
            <p className="text-purple-700 text-sm">إدارة السوشال ميديا قيد التطوير</p>
          </div>
        </div>
      </div>
    </div>
  )
}
