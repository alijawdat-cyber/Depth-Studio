'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, SelectableCard } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { authService } from '@/lib/auth'
import { useAuth } from '@/store/auth-store'


type Role = 'photographer' | 'brand_coordinator' | 'marketing_coordinator'

interface RoleData {
  photographer: {
    contractType: 'freelancer' | 'salary' | ''
    specializations: string[]
    experience: string
    availability: string[]
  }
  brand_coordinator: {
    brandId: string
    experience: string
    previousWork: string
  }
  marketing_coordinator: {
    experience: string
    education: string
    certifications: string[]
    previousCompanies: string
  }
}

function RoleSetupPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [selectedRole, setSelectedRole] = useState<Role | ''>('')
  const [roleData, setRoleData] = useState<RoleData>({
    photographer: {
      contractType: '',
      specializations: [],
      experience: '',
      availability: []
    },
    brand_coordinator: {
      brandId: '',
      experience: '',
      previousWork: ''
    },
    marketing_coordinator: {
      experience: '',
      education: '',
      certifications: [],
      previousCompanies: ''
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    router.push('/login')
    return null
  }

  const roleOptions = [
    {
      id: 'photographer' as Role,
      title: 'مصور',
      description: 'التقط صور عالية الجودة للبراندات والعملاء',
      icon: '📸',
      features: ['إدارة المشاريع', 'تحرير الصور', 'معرض شخصي']
    },
    {
      id: 'brand_coordinator' as Role,
      title: 'منسق براند',
      description: 'أدِر حملات ومحتوى براند محدد',
      icon: '🏢',
      features: ['إدارة المحتوى', 'تنسيق الحملات', 'التواصل مع المصورين']
    },
    {
      id: 'marketing_coordinator' as Role,
      title: 'منسق تسويق',
      description: 'أدِر العمليات التسويقية والفرق',
      icon: '📊',
      features: ['تحليل البيانات', 'إدارة الفرق', 'استراتيجيات التسويق']
    }
  ]

  const handleRoleDataChange = (field: string, value: string | string[]) => {
    if (!selectedRole) return

    setRoleData(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [field]: value
      }
    }))
  }

  const validatePhotographerData = () => {
    const data = roleData.photographer
    if (!data.contractType) {
      setError('يرجى اختيار نوع العقد')
      return false
    }
    if (data.specializations.length === 0) {
      setError('يرجى اختيار تخصص واحد على الأقل')
      return false
    }
    return true
  }

  const validateBrandCoordinatorData = () => {
    const data = roleData.brand_coordinator
    if (!data.brandId) {
      setError('يرجى اختيار البراند الذي تريد العمل معه')
      return false
    }
    if (!data.experience) {
      setError('يرجى إدخال خبرتك في مجال التنسيق')
      return false
    }
    return true
  }

  const validateMarketingCoordinatorData = () => {
    const data = roleData.marketing_coordinator
    if (!data.experience || !data.education) {
      setError('يرجى ملء جميع الحقول المطلوبة')
      return false
    }
    return true
  }

  const validateForm = () => {
    if (!selectedRole) {
      setError('يرجى اختيار دور')
      return false
    }

    switch (selectedRole) {
      case 'photographer':
        return validatePhotographerData()
      case 'brand_coordinator':
        return validateBrandCoordinatorData()
      case 'marketing_coordinator':
        return validateMarketingCoordinatorData()
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setError('')

    try {
      if (selectedRole) {
        await authService.updateUserRole({
          userId: user.firebase_uid,
          role: selectedRole,
          roleData: roleData[selectedRole] as Record<string, unknown>,
          status: 'pending_approval'
        })
      }

      // توجيه لصفحة انتظار الموافقة (بدون /auth لأنها route group)
      router.push('/pending-approval')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في حفظ البيانات')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-2xl mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            اختر دورك المناسب
          </h1>
          <p className="text-gray-600">
            حدد دورك في Depth Studio لبدء رحلتك معنا
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert 
            variant="error" 
            message={error}
            dismissible
            onDismiss={() => setError('')}
            className="mb-6"
          />
        )}

        {/* Role Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roleOptions.map((role) => (
            <SelectableCard
              key={role.id}
              selected={selectedRole === role.id}
              onSelect={() => setSelectedRole(role.id)}
              size="lg"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{role.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {role.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {role.description}
                </p>
                <div className="space-y-2">
                  {role.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-center text-sm text-gray-500">
                      <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </SelectableCard>
          ))}
        </div>

        {/* Role-specific Forms */}
        {selectedRole && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              معلومات إضافية - {roleOptions.find(r => r.id === selectedRole)?.title}
            </h3>

            {selectedRole === 'photographer' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع العقد <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectableCard
                      selected={roleData.photographer.contractType === 'freelancer'}
                      onSelect={() => handleRoleDataChange('contractType', 'freelancer')}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">💰</div>
                        <h4 className="font-medium">فريلانسر</h4>
                        <p className="text-sm text-gray-500">أجر بالقطعة</p>
                      </div>
                    </SelectableCard>
                    <SelectableCard
                      selected={roleData.photographer.contractType === 'salary'}
                      onSelect={() => handleRoleDataChange('contractType', 'salary')}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">📅</div>
                        <h4 className="font-medium">راتب ثابت</h4>
                        <p className="text-sm text-gray-500">راتب شهري</p>
                      </div>
                    </SelectableCard>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التخصصات <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['تصوير منتجات', 'تصوير شخصي', 'تصوير فعاليات', 'تصوير طعام', 'تصوير معماري', 'تصوير موضة'].map(spec => (
                      <label key={spec} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={roleData.photographer.specializations.includes(spec)}
                          onChange={(e) => {
                            const current = roleData.photographer.specializations
                            const updated = e.target.checked 
                              ? [...current, spec]
                              : current.filter(s => s !== spec)
                            handleRoleDataChange('specializations', updated)
                          }}
                          className="rounded border-gray-300 text-primary-600"
                        />
                        <span className="mr-2 text-sm">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الخبرة
                  </label>
                  <Input
                    value={roleData.photographer.experience}
                    onChange={(e) => handleRoleDataChange('experience', e.target.value)}
                    placeholder="مثال: 3 سنوات خبرة في التصوير التجاري"
                  />
                </div>
              </div>
            )}

            {selectedRole === 'brand_coordinator' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البراند <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={roleData.brand_coordinator.brandId}
                    onChange={(e) => handleRoleDataChange('brandId', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                  >
                    <option value="">اختر البراند</option>
                    <option value="nava">NAVA - ملابس نسائية</option>
                    <option value="tech-brand">TechBrand - أجهزة ذكية</option>
                    <option value="food-brand">FoodBrand - مطاعم</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    خبرتك في التنسيق <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={roleData.brand_coordinator.experience}
                    onChange={(e) => handleRoleDataChange('experience', e.target.value)}
                    placeholder="مثال: سنتين خبرة في إدارة حسابات التواصل الاجتماعي"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    أعمال سابقة
                  </label>
                  <textarea
                    value={roleData.brand_coordinator.previousWork}
                    onChange={(e) => handleRoleDataChange('previousWork', e.target.value)}
                    placeholder="اذكر أهم الأعمال السابقة أو المشاريع التي عملت عليها"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {selectedRole === 'marketing_coordinator' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الخبرة التسويقية <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={roleData.marketing_coordinator.experience}
                    onChange={(e) => handleRoleDataChange('experience', e.target.value)}
                    placeholder="مثال: 5 سنوات في التسويق الرقمي وإدارة الحملات"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المؤهل العلمي <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={roleData.marketing_coordinator.education}
                    onChange={(e) => handleRoleDataChange('education', e.target.value)}
                    placeholder="مثال: بكالوريوس إدارة أعمال - تسويق"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الشهادات والدورات
                  </label>
                  <Input
                    value={roleData.marketing_coordinator.certifications.join(', ')}
                    onChange={(e) => handleRoleDataChange('certifications', e.target.value.split(', '))}
                    placeholder="مثال: Google Analytics, Facebook Blueprint, HubSpot"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الشركات السابقة
                  </label>
                  <textarea
                    value={roleData.marketing_coordinator.previousCompanies}
                    onChange={(e) => handleRoleDataChange('previousCompanies', e.target.value)}
                    placeholder="اذكر أهم الشركات التي عملت معها ودورك فيها"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Submit Button */}
        {selectedRole && (
          <div className="text-center">
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full md:w-auto px-8 py-3"
            >
              {isLoading ? 'جاري الحفظ...' : 'إرسال الطلب للمراجعة'}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              سيتم مراجعة طلبك من قبل المدير العام خلال 24-48 ساعة
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Dynamic export to prevent SSR issues
import dynamic from 'next/dynamic'
export default dynamic(() => Promise.resolve(RoleSetupPage), { ssr: false }) 