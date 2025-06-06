import { FaPlus } from 'react-icons/fa'

export default function AvailabilityManagement() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">إدارة التوفر</h1>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <FaPlus className="text-green-600 ml-3 inline" />
        <span className="font-semibold text-green-800">قيد التطوير - </span>
        <span className="text-green-700 text-sm">إدارة التوفر قيد التطوير</span>
      </div>
    </div>
  )
}
