import { FaPlus } from 'react-icons/fa'

export default function NotificationsPage() {
  return (
    <div className="min-h-[400px] bg-rose-50 rounded-lg border-2 border-dashed border-rose-200 flex flex-col items-center justify-center">
      <FaPlus className="text-4xl text-rose-400 mb-4" />
      <h2 className="text-xl font-bold text-rose-900 mb-2">إعدادات الإشعارات</h2>
      <p className="text-rose-600 text-center">قيد التطوير</p>
    </div>
  )
} 