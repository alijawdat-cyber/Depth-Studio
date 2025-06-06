import { FaPlus } from 'react-icons/fa'

export default function SocialAnalytics() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">تحليلات السوشال ميديا</h1>
      <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-lg p-4">
        <FaPlus className="text-fuchsia-600 ml-3 inline" />
        <span className="font-semibold text-fuchsia-800">قيد التطوير - </span>
        <span className="text-fuchsia-700 text-sm">تحليلات السوشال ميديا قيد التطوير</span>
      </div>
    </div>
  )
}
