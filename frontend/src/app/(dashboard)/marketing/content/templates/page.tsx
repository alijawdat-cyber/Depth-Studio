import { FaPlus } from 'react-icons/fa'

export default function ContentTemplates() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">قوالب المحتوى</h1>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <FaPlus className="text-amber-600 ml-3 inline" />
        <span className="font-semibold text-amber-800">قيد التطوير - </span>
        <span className="text-amber-700 text-sm">قوالب المحتوى الجاهزة قيد التطوير</span>
      </div>
    </div>
  )
}
