import { FaPlus } from 'react-icons/fa'

export default function ContentCalendar() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">تقويم المحتوى</h1>
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
        <FaPlus className="text-sky-600 ml-3 inline" />
        <span className="font-semibold text-sky-800">قيد التطوير - </span>
        <span className="text-sky-700 text-sm">تقويم المحتوى التسويقي قيد التطوير</span>
      </div>
    </div>
  )
}
