import { FaPlus } from 'react-icons/fa'

export default function PermissionsPage() {
  return (
    <div className="min-h-[400px] bg-amber-50 rounded-lg border-2 border-dashed border-amber-200 flex flex-col items-center justify-center">
      <FaPlus className="text-4xl text-amber-400 mb-4" />
      <h2 className="text-xl font-bold text-amber-900 mb-2">إدارة الصلاحيات</h2>
      <p className="text-amber-600 text-center">قيد التطوير</p>
    </div>
  )
} 