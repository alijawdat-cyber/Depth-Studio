import { FaPlus } from 'react-icons/fa'

export default function SocialScheduler() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">جدولة المنشورات</h1>
      <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
        <FaPlus className="text-pink-600 ml-3 inline" />
        <span className="font-semibold text-pink-800">قيد التطوير - </span>
        <span className="text-pink-700 text-sm">جدولة منشورات السوشال ميديا قيد التطوير</span>
      </div>
    </div>
  )
}
