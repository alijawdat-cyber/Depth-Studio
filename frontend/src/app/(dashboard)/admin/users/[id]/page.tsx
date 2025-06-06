import { FaPlus } from 'react-icons/fa'

export default function UserDetailsPage() {
  return (
    <div className="min-h-[400px] bg-blue-50 rounded-lg border-2 border-dashed border-blue-200 flex flex-col items-center justify-center">
      <FaPlus className="text-4xl text-blue-400 mb-4" />
      <h2 className="text-xl font-bold text-blue-900 mb-2">تفاصيل المستخدم</h2>
      <p className="text-blue-600 text-center">قيد التطوير</p>
    </div>
  )
} 