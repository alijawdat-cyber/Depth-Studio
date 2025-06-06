import { FaPlus } from 'react-icons/fa'

export default function EmailCampaigns() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">حملات الإيميل</h1>
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <FaPlus className="text-neutral-600 ml-3 inline" />
        <span className="font-semibold text-neutral-800">قيد التطوير - </span>
        <span className="text-neutral-700 text-sm">حملات الإيميل التسويقي قيد التطوير</span>
      </div>
    </div>
  )
}
