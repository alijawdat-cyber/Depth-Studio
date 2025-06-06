import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  FaQuestionCircle, 
  FaEnvelope, 
  FaPhone, 
  FaWhatsapp,
  FaArrowLeft,
  FaBook,
  FaVideo,
  FaComments
} from 'react-icons/fa'

export default function HelpPage() {
  const helpCategories = [
    {
      icon: FaQuestionCircle,
      title: 'الأسئلة الشائعة',
      description: 'أجوبة للأسئلة الأكثر شيوعاً',
      items: [
        'كيفية تسجيل الدخول',
        'إعادة تعيين كلمة المرور',
        'إدارة الملف الشخصي',
        'رفع الصور والملفات'
      ]
    },
    {
      icon: FaBook,
      title: 'أدلة الاستخدام',
      description: 'شروحات مفصلة لجميع الميزات',
      items: [
        'دليل المصورين',
        'دليل منسقي البراند',
        'دليل فريق التسويق',
        'إعدادات النظام'
      ]
    },
    {
      icon: FaVideo,
      title: 'فيديوهات تعليمية',
      description: 'شروحات مرئية خطوة بخطوة',
      items: [
        'كيفية البدء',
        'إدارة المشاريع',
        'التعامل مع العملاء',
        'إعداد المعرض'
      ]
    }
  ]

  const contactMethods = [
    {
      icon: FaEnvelope,
      title: 'البريد الإلكتروني',
      value: 'support@depthstudio.com',
      description: 'سنرد عليك خلال 24 ساعة',
      color: 'text-blue-600'
    },
    {
      icon: FaWhatsapp,
      title: 'واتساب',
      value: '+964 770 123 4567',
      description: 'متاح من 9 صباحاً إلى 9 مساءً',
      color: 'text-green-600'
    },
    {
      icon: FaPhone,
      title: 'الهاتف',
      value: '+964 1 234 567',
      description: 'خدمة العملاء المباشرة',
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                مركز المساعدة والدعم
              </h1>
              <p className="text-gray-600">
                نحن هنا لمساعدتك في استخدام Depth Studio بأفضل طريقة ممكنة
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">
                <FaArrowLeft className="ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quick Search */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ابحث عن حل سريع
            </h2>
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="ابحث في المساعدة..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </Card>

        {/* Help Categories */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {helpCategories.map((category, index) => (
            <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mb-3">
                  <category.icon className="text-primary-600 text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {category.description}
                </p>
              </div>
              
              <ul className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <button className="text-sm text-primary-600 hover:text-primary-700 text-right w-full">
                      • {item}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-2xl mb-4">
              <FaComments className="text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              تواصل معنا مباشرة
            </h2>
            <p className="text-gray-600">
              لم تجد ما تبحث عنه؟ فريق الدعم الفني جاهز لمساعدتك
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <div key={index} className="text-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <method.icon className={`text-2xl ${method.color} mx-auto mb-3`} />
                <h3 className="font-semibold text-gray-900 mb-1">
                  {method.title}
                </h3>
                <p className={`font-mono text-sm ${method.color} mb-2`}>
                  {method.value}
                </p>
                <p className="text-xs text-gray-600">
                  {method.description}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Status & Updates */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            حالة النظام: <span className="text-green-600 font-medium">يعمل بشكل طبيعي</span>
          </p>
          <p className="text-xs text-gray-400">
            آخر تحديث: {new Date().toLocaleDateString('ar-IQ')}
          </p>
        </div>
      </div>
    </div>
  )
} 