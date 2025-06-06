import { FaPlus } from 'react-icons/fa'

export default function ApprovalsPage() {
  return (
    <div className="min-h-[400px] bg-orange-50 rounded-lg border-2 border-dashed border-orange-200 flex flex-col items-center justify-center">
      <FaPlus className="text-4xl text-orange-400 mb-4" />
      <h2 className="text-xl font-bold text-orange-900 mb-2">الموافقات</h2>
      <p className="text-orange-600 text-center">قيد التطوير</p>
    </div>
  )
} 