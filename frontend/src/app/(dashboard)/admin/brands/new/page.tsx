'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FaBuilding, FaUpload, FaPalette, FaGlobe } from 'react-icons/fa'

export default function NewBrandPage() {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    budget_monthly: '',
    color_primary: '#3B82F6',
    color_secondary: '#10B981',
    logo: null as File | null
  })

  const [isLoading, setIsLoading] = useState(false)

  const industries = [
    'مطاعم وأطعمة',
    'أزياء وملابس', 
    'تكنولوجيا',
    'عقارات',
    'صحة وتجميل',
    'تعليم وتدريب',
    'خدمات مالية',
    'سياحة وسفر',
    'رياضة ولياقة',
    'أخرى'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // محاكاة API call
    setTimeout(() => {
      setIsLoading(false)
      alert('تم إنشاء البراند بنجاح!')
    }, 2000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        logo: e.target.files![0]
      }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إضافة براند جديد</h1>
        <p className="text-gray-600">أضف براند جديد إلى منصة Depth Studio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* معلومات أساسية */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaBuilding className="text-blue-500" />
            المعلومات الأساسية
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم البراند <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="مثال: مطعم بابل"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الصناعة <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                required
              >
                <option value="">اختر نوع الصناعة</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف البراند
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="وصف مختصر عن البراند والخدمات التي يقدمها..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* معلومات الاتصال */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaGlobe className="text-green-500" />
            معلومات الاتصال
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الموقع الإلكتروني
              </label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@brand.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+964 770 123 4567"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان
              </label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="بغداد، الكرادة، شارع أبو نواس"
              />
            </div>
          </div>
        </Card>

        {/* الميزانية والألوان */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaPalette className="text-purple-500" />
            الميزانية والهوية البصرية
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الميزانية الشهرية (دولار)
              </label>
              <Input
                type="number"
                value={formData.budget_monthly}
                onChange={(e) => handleInputChange('budget_monthly', e.target.value)}
                placeholder="1000"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اللون الأساسي
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={formData.color_primary}
                  onChange={(e) => handleInputChange('color_primary', e.target.value)}
                  className="w-16 h-12 p-1"
                />
                <Input
                  type="text"
                  value={formData.color_primary}
                  onChange={(e) => handleInputChange('color_primary', e.target.value)}
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اللون الثانوي
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={formData.color_secondary}
                  onChange={(e) => handleInputChange('color_secondary', e.target.value)}
                  className="w-16 h-12 p-1"
                />
                <Input
                  type="text"
                  value={formData.color_secondary}
                  onChange={(e) => handleInputChange('color_secondary', e.target.value)}
                  placeholder="#10B981"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* رفع اللوغو */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaUpload className="text-orange-500" />
            لوغو البراند
          </h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            {formData.logo ? (
              <div>
                <p className="text-green-600 font-medium">تم رفع الملف: {formData.logo.name}</p>
                <p className="text-sm text-gray-500">حجم الملف: {(formData.logo.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">اسحب اللوغو هنا أو</p>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload">
              <Button type="button" variant="outline" className="cursor-pointer">
                اختر ملف
              </Button>
            </label>
            
            <p className="text-xs text-gray-500 mt-2">
              أنواع الملفات المدعومة: PNG, JPG, SVG (الحد الأقصى: 2MB)
            </p>
          </div>
        </Card>

        {/* أزرار التحكم */}
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline">
            إلغاء
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'جاري الحفظ...' : 'إنشاء البراند'}
          </Button>
        </div>
      </form>
    </div>
  )
} 