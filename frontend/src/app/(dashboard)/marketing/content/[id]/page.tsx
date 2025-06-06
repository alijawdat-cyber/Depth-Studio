import { FaPlus } from 'react-icons/fa'

export default function ContentDetail() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">تفاصيل المحتوى</h1>
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
        <FaPlus className="text-stone-600 ml-3 inline" />
        <span className="font-semibold text-stone-800">قيد التطوير - </span>
        <span className="text-stone-700 text-sm">تفاصيل المحتوى قيد التطوير</span>
      </div>
    </div>
  )
}
