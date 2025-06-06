import { FaCamera, FaPlus, FaCalendarAlt } from 'react-icons/fa'

export default function PhotographerProjects() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaCamera className="ml-3 text-blue-600" />
            مشاريع التصوير
          </h1>
          <p className="text-gray-600 mt-1">إدارة ومتابعة جميع مشاريع التصوير</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">12</div>
          <div className="text-gray-600">مشاريع نشطة</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">45</div>
          <div className="text-gray-600">مشاريع مكتملة</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-yellow-600">3</div>
          <div className="text-gray-600">في انتظار الموافقة</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-purple-600">2.5M IQD</div>
          <div className="text-gray-600">إجمالي الأرباح</div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <FaPlus className="text-blue-600 text-xl ml-3" />
          <div>
            <h3 className="text-lg font-semibold text-blue-800">قيد التطوير - صفحة المشاريع</h3>
            <p className="text-blue-700 mt-1">
              سيتم إضافة قائمة تفصيلية بجميع المشاريع مع إمكانية التصفية والبحث
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
