import { FaPlus } from 'react-icons/fa'

export default function SocialCampaigns() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">حملات السوشال ميديا</h1>
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <FaPlus className="text-slate-600 ml-3 inline" />
        <span className="font-semibold text-slate-800">قيد التطوير - </span>
        <span className="text-slate-700 text-sm">حملات السوشال ميديا قيد التطوير</span>
      </div>
    </div>
  )
}
