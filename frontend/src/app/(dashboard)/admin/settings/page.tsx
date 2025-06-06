import { FaPlus } from 'react-icons/fa'

export default function SettingsPage() {
  return (
    <div className="min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
      <FaPlus className="text-4xl text-gray-400 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">الإعدادات</h2>
      <p className="text-gray-600 text-center">قيد التطوير</p>
    </div>
  )
}