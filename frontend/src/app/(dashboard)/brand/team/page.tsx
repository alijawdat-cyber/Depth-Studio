import { FaPlus } from 'react-icons/fa'

export default function BrandTeam() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">إدارة الفريق</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <FaPlus className="text-blue-600 ml-3" />
          <div>
            <h3 className="font-semibold text-blue-800">قيد التطوير</h3>
            <p className="text-blue-700 text-sm">صفحة إدارة الفريق قيد التطوير</p>
          </div>
        </div>
      </div>
    </div>
  )
}
