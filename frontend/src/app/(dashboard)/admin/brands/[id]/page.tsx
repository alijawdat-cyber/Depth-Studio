import { FaPlus } from 'react-icons/fa'

export default function BrandDetailsPage() {
  return (
    <div className="min-h-[400px] bg-green-50 rounded-lg border-2 border-dashed border-green-200 flex flex-col items-center justify-center">
      <FaPlus className="text-4xl text-green-400 mb-4" />
      <h2 className="text-xl font-bold text-green-900 mb-2">تفاصيل البراند</h2>
      <p className="text-green-600 text-center">قيد التطوير</p>
    </div>
  )
}
