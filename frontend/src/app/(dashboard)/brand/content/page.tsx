import { FaPlus } from 'react-icons/fa'

export default function BrandContent() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">مكتبة المحتوى</h1>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <FaPlus className="text-green-600 ml-3" />
          <div>
            <h3 className="font-semibold text-green-800">قيد التطوير</h3>
            <p className="text-green-700 text-sm">مكتبة المحتوى قيد التطوير</p>
          </div>
        </div>
      </div>
    </div>
  )
}
