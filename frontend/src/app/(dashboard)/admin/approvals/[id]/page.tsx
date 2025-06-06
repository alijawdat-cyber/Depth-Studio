'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { FaCheck, FaTimes, FaClock, FaUser, FaEnvelope, FaPhone, FaFileAlt, FaDownload } from 'react-icons/fa'

export default function ApprovalDetailsPage() {
  const params = useParams()
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - في الإنتاج سيأتي من Firebase
  const approval = {
    id: params.id,
    applicant: {
      name: 'أحمد محمد علي',
      email: 'ahmed.mohammed@gmail.com',
      phone: '+964 771 234 5678',
      applied_at: '2024-06-03T10:30:00Z'
    },
    requested_role: 'photographer',
    status: 'pending',
    application_data: {
      contract_type: 'freelancer',
      specializations: ['تصوير منتجات', 'تصوير فعاليات'],
      experience: '3 سنوات خبرة في التصوير التجاري للمطاعم والمقاهي في بغداد',
      portfolio_url: 'https://instagram.com/ahmed_photography',
      previous_work: 'عملت مع مطعم بابل وكافيه الأصالة'
    },
    documents: [
      { name: 'السيرة الذاتية.pdf', size: '245 KB', type: 'pdf' },
      { name: 'portfolio.zip', size: '15.2 MB', type: 'zip' },
      { name: 'شهادة_دورة_التصوير.jpg', size: '890 KB', type: 'image' }
    ]
  }

  const handleDecision = async (newDecision: 'approved' | 'rejected') => {
    setIsLoading(true)
    setDecision(newDecision)
    
    // محاكاة API call
    setTimeout(() => {
      setIsLoading(false)
      // إرسال إشعار للمتقدم
      alert(`تم ${newDecision === 'approved' ? 'قبول' : 'رفض'} الطلب وإرسال إشعار للمتقدم`)
    }, 2000)
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'photographer': return 'مصور'
      case 'brand_coordinator': return 'منسق براند'
      case 'marketing_coordinator': return 'منسق تسويق'
      default: return role
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange'
      case 'approved': return 'green'
      case 'rejected': return 'red'
      default: return 'gray'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">تفاصيل طلب الموافقة</h1>
          <p className="text-gray-600">طلب رقم: #{approval.id}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${getStatusColor(approval.status)}-100 text-${getStatusColor(approval.status)}-800`}>
          {approval.status === 'pending' && '⏳ قيد المراجعة'}
          {approval.status === 'approved' && '✅ مقبول'}
          {approval.status === 'rejected' && '❌ مرفوض'}
        </div>
      </div>

      {/* Decision Result */}
      {decision && (
        <Alert 
          variant={decision === 'approved' ? 'success' : 'error'}
          message={decision === 'approved' ? 'تم قبول الطلب بنجاح!' : 'تم رفض الطلب'}
          className="mb-6"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* معلومات المتقدم */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser className="text-blue-500" />
              معلومات المتقدم
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">الاسم الكامل</label>
                <p className="font-medium">{approval.applicant.name}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">البريد الإلكتروني</label>
                <p className="font-medium flex items-center gap-2">
                  <FaEnvelope className="text-gray-400" />
                  {approval.applicant.email}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">رقم الهاتف</label>
                <p className="font-medium flex items-center gap-2">
                  <FaPhone className="text-gray-400" />
                  {approval.applicant.phone}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">تاريخ التقديم</label>
                <p className="font-medium">
                  {new Date(approval.applicant.applied_at).toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>
          </Card>

          {/* تفاصيل الطلب */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              تفاصيل طلب دور {getRoleLabel(approval.requested_role)}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">نوع العقد</label>
                <p className="font-medium">
                  {approval.application_data.contract_type === 'freelancer' ? '💰 فريلانسر' : '📅 راتب ثابت'}
                </p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">التخصصات</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {approval.application_data.specializations.map((spec, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">الخبرة</label>
                <p className="font-medium">{approval.application_data.experience}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">أعمال سابقة</label>
                <p className="font-medium">{approval.application_data.previous_work}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">رابط المعرض</label>
                <a 
                  href={approval.application_data.portfolio_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-800"
                >
                  {approval.application_data.portfolio_url}
                </a>
              </div>
            </div>
          </Card>

          {/* المستندات المرفقة */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FaFileAlt className="text-green-500" />
              المستندات المرفقة ({approval.documents.length})
            </h3>
            
            <div className="space-y-3">
              {approval.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaFileAlt className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">{doc.size}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <FaDownload className="ml-2" />
                    تحميل
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* إجراءات الموافقة */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              إجراءات الموافقة
            </h3>
            
            {!decision && (
              <div className="space-y-4">
                <Button 
                  onClick={() => handleDecision('approved')}
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <FaCheck className="ml-2" />
                  {isLoading ? 'جاري المعالجة...' : 'قبول الطلب'}
                </Button>
                
                <Button 
                  onClick={() => handleDecision('rejected')}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  <FaTimes className="ml-2" />
                  رفض الطلب
                </Button>
                
                <Button variant="outline" className="w-full">
                  <FaClock className="ml-2" />
                  طلب معلومات إضافية
                </Button>
              </div>
            )}

            {decision && (
              <div className="text-center">
                <div className={`text-6xl mb-4 ${decision === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                  {decision === 'approved' ? '✅' : '❌'}
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {decision === 'approved' ? 'تم قبول الطلب' : 'تم رفض الطلب'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  تم إرسال إشعار للمتقدم
                </p>
              </div>
            )}
          </Card>

          {/* ملاحظات */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              ملاحظات إضافية
            </h3>
            
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف ملاحظات للمتقدم..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
              rows={4}
            />
            
            <Button variant="outline" className="w-full mt-3">
              حفظ الملاحظات
            </Button>
          </Card>

          {/* إحصائيات سريعة */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              إحصائيات المتقدم
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">مدة التسجيل</span>
                <span className="font-medium">مستخدم جديد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">عدد الطلبات السابقة</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">معدل الاستجابة</span>
                <span className="font-medium text-green-600">سريع</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 