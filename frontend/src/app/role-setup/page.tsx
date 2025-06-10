/**
 * 🎭 صفحة اختيار الدور - Depth Studio Frontend
 * =============================================
 * 
 * 📅 محدث: يونيو 2025
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: صفحة تفاعلية لاختيار الدور المناسب للمستخدم
 * 
 * 🎭 الأدوار المدعومة:
 * - مصور (photographer) - مع اختيار نوع العقد والتخصصات
 * - منسق البراند (brand_coordinator) - مع اختيار البراند
 * - منسق التسويق (marketing_coordinator) - مع بيانات تفصيلية
 * 
 * 🔑 المميزات الرئيسية:
 * - نماذج ديناميكية تتغير حسب الدور المختار
 * - validation شامل للبيانات المدخلة
 * - اختيار البراندات مع البحث للمنسقين
 * - عرض أنواع العقود للمصورين
 * - التوجيه التلقائي لصفحة الانتظار بعد الإرسال
 * 
 * 🔗 التكامل:
 * - roleSelection.service.ts للخدمات
 * - AuthStore للمستخدم الحالي
 * - Brand types للبراندات المتاحة
 * - ContractType للعقود المتاحة
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { roleSelectionService } from '@/services/roleSelection.service';

// ======================================
// 📦 استيرادات الأنواع من @depth-studio/types
// ======================================

import {
  // 🎭 أنواع اختيار الأدوار الأساسية - لإدارة عملية اختيار الدور
  RoleSelectionSubmission,  // 📝 بيانات تقديم طلب الدور (selected_role + additional_data + motivation)
  
  // 👥 أنواع المستخدمين والبراندات - للتعامل مع بيانات المستخدمين والبراندات  
  Brand,                    // 🏢 نوع البراند الكامل - للبحث وعرض البراندات لمنسقي البراند
  User,                     // 👤 نوع المستخدم الكامل - للتحقق من المستخدم الحالي في useAuthStore
  
  // 🎯 التعدادات المطلوبة - لفهم أنواع الأدوار والعقود والبراندات
  UserRole,                 // 🎭 أدوار المستخدم (photographer, brand_coordinator, marketing_coordinator)
  ContractType,             // 📄 أنواع عقود المصورين (freelancer, salary) - لاختيار نوع العقد
  BrandType,                // 🏢 أنواع البراندات (local, international, startup, enterprise) - لعرض معلومات البراند
  Industry                  // 🏭 الصناعات (fashion, food, technology, etc.) - لعرض صناعة البراند
} from '@depth-studio/types';

// ======================================
// 📝 أنواع البيانات المحلية
// ======================================

/** حالة النموذج المحلي */
interface FormState {
  selectedRole: UserRole | null;          // الدور المختار
  motivation: string;                     // دافع اختيار الدور
  
  // بيانات المصور
  contractType: ContractType | null;      // نوع العقد للمصور
  specializations: string[];              // التخصصات المطلوبة
  experienceYears: number;                // سنوات الخبرة
  portfolioLinks: string[];               // روابط معرض الأعمال
  equipmentOwned: string[];               // المعدات المملوكة
  
  // بيانات منسق البراند
  selectedBrandId: string;                // معرف البراند المختار
  brandSearchQuery: string;               // استعلام البحث عن البراند
  brandCoordinatorExperience: string;     // خبرة منسق البراند
  
  // بيانات منسق التسويق
  marketingExperience: string;            // خبرة التسويق
  campaignsManagedCount: number;          // عدد الحملات المدارة
}

/** خيارات التخصصات للمصور */
const PHOTOGRAPHY_SPECIALIZATIONS = [
  'تصوير المنتجات',
  'تصوير الطعام',
  'تصوير الأزياء',
  'تصوير الفعاليات',
  'تصوير الطبيعة',
  'تصوير البورتريه',
  'التصوير الصحفي',
  'تصوير المعمارية'
];

/** أنواع المعدات الشائعة */
const COMMON_EQUIPMENT = [
  'كاميرا DSLR',
  'كاميرا Mirrorless',
  'عدسات متنوعة',
  'معدات الإضاءة',
  'حامل ثلاثي القوائم',
  'خلفيات التصوير',
  'معدات الصوت',
  'ملحقات أخرى'
];

// ======================================
// 🎭 المكون الرئيسي
// ======================================

export default function RoleSetupPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // حالة النموذج
  const [formState, setFormState] = useState<FormState>({
    selectedRole: null,
    motivation: '',
    contractType: null,
    specializations: [],
    experienceYears: 0,
    portfolioLinks: [''],
    equipmentOwned: [],
    selectedBrandId: '',
    brandSearchQuery: '',
    brandCoordinatorExperience: '',
    marketingExperience: '',
    campaignsManagedCount: 0
  });
  
  // حالة التطبيق
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // بيانات خارجية
  const [availableBrands, setAvailableBrands] = useState<Brand[]>([]);
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // ======================================
  // 🔄 تأثيرات جانبية
  // ======================================

  /** تحميل البيانات الأولية */
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user) {
        router.push('/login');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // تحميل أنواع العقود للمصورين - استخدام الاسم الصحيح للدالة
        const contractTypesResult = await roleSelectionService.getContractTypesForPhotographer();
        const extractedContractTypes = contractTypesResult.contract_types.map(ct => ct.type);
        setContractTypes(extractedContractTypes);
        
        console.log('✅ تم تحميل البيانات الأولية بنجاح');
      } catch (error) {
        console.error('❌ خطأ في تحميل البيانات الأولية:', error);
        setError('فشل في تحميل البيانات الأولية. حاول مرة أخرى.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [user, router]);

  /** تحميل البراندات عند اختيار منسق البراند */
  useEffect(() => {
    const loadBrandsForCoordinator = async () => {
      if (formState.selectedRole !== 'brand_coordinator') {
        return;
      }
      
      setLoadingBrands(true);
      
      try {
        // استخدام الاسم الصحيح للدالة
        const brandsResult = await roleSelectionService.searchBrandsForCoordinator({
          searchQuery: formState.brandSearchQuery.trim() || undefined,
          status: 'active', // استخدام BrandStatus
          has_coordinator: false // البحث عن البراندات التي ليس لديها منسق
        });
        setAvailableBrands(brandsResult.brands);
        
        console.log(`✅ تم تحميل ${brandsResult.brands.length} براند للاختيار`);
      } catch (error) {
        console.error('❌ خطأ في تحميل البراندات:', error);
        setError('فشل في تحميل البراندات. حاول مرة أخرى.');
      } finally {
        setLoadingBrands(false);
      }
    };

    loadBrandsForCoordinator();
  }, [formState.selectedRole, formState.brandSearchQuery]);

  // ======================================
  // 🎯 معالجات الأحداث
  // ======================================

  /** معالج اختيار الدور */
  const handleRoleSelection = (role: UserRole) => {
    setFormState(prev => ({
      ...prev,
      selectedRole: role,
      // إعادة تصفير البيانات المتخصصة
      contractType: null,
      specializations: [],
      selectedBrandId: '',
      brandSearchQuery: '',
      marketingExperience: '',
      campaignsManagedCount: 0
    }));
    setError(null);
  };

  /** معالج تغيير التخصصات */
  const handleSpecializationToggle = (specialization: string) => {
    setFormState(prev => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter(s => s !== specialization)
        : [...prev.specializations, specialization]
    }));
  };

  /** معالج تغيير المعدات */
  const handleEquipmentToggle = (equipment: string) => {
    setFormState(prev => ({
      ...prev,
      equipmentOwned: prev.equipmentOwned.includes(equipment)
        ? prev.equipmentOwned.filter(e => e !== equipment)
        : [...prev.equipmentOwned, equipment]
    }));
  };

  /** معالج إضافة/تعديل رابط المعرض */
  const handlePortfolioLinkChange = (index: number, value: string) => {
    setFormState(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.map((link, i) => 
        i === index ? value : link
      )
    }));
  };

  /** معالج إضافة رابط معرض جديد */
  const addPortfolioLink = () => {
    setFormState(prev => ({
      ...prev,
      portfolioLinks: [...prev.portfolioLinks, '']
    }));
  };

  /** معالج حذف رابط معرض */
  const removePortfolioLink = (index: number) => {
    if (formState.portfolioLinks.length > 1) {
      setFormState(prev => ({
        ...prev,
        portfolioLinks: prev.portfolioLinks.filter((_, i) => i !== index)
      }));
    }
  };

  /** معالج البحث في البراندات */
  const handleBrandSearch = (query: string) => {
    setFormState(prev => ({
      ...prev,
      brandSearchQuery: query,
      selectedBrandId: '' // إعادة تصفير الاختيار عند البحث
    }));
  };

  /** التحقق من صحة البيانات */
  const validateForm = (): string | null => {
    if (!formState.selectedRole) {
      return 'يرجى اختيار الدور المطلوب';
    }

    if (formState.motivation.trim().length < 10) {
      return 'يرجى كتابة دافع واضح لاختيار هذا الدور (10 أحرف على الأقل)';
    }

    switch (formState.selectedRole) {
      case 'photographer':
        if (!formState.contractType) {
          return 'يرجى اختيار نوع العقد';
        }
        if (formState.specializations.length === 0) {
          return 'يرجى اختيار تخصص واحد على الأقل';
        }
        if (formState.experienceYears < 0) {
          return 'سنوات الخبرة يجب أن تكون رقم موجب';
        }
        break;

      case 'brand_coordinator':
        if (!formState.selectedBrandId) {
          return 'يرجى اختيار البراند المطلوب التنسيق له';
        }
        if (formState.brandCoordinatorExperience.trim().length < 10) {
          return 'يرجى وصف خبرتك في تنسيق البراندات (10 أحرف على الأقل)';
        }
        break;

      case 'marketing_coordinator':
        if (formState.marketingExperience.trim().length < 10) {
          return 'يرجى وصف خبرتك في التسويق (10 أحرف على الأقل)';
        }
        if (formState.campaignsManagedCount < 0) {
          return 'عدد الحملات يجب أن يكون رقم موجب أو صفر';
        }
        break;
    }

    return null; // البيانات صحيحة
  };

  /** دالة مساعدة لتنسيق نوع البراند بالعربية */
  const formatBrandTypeArabic = (brandType: BrandType): string => {
    switch (brandType) {
      case 'local': return 'محلي';
      case 'international': return 'دولي';
      case 'startup': return 'ناشئ';
      case 'enterprise': return 'مؤسسي';
      default: return brandType;
    }
  };

  /** دالة مساعدة لتنسيق الصناعة بالعربية */
  const formatIndustryArabic = (industry: Industry): string => {
    switch (industry) {
      case 'fashion': return 'الأزياء';
      case 'food': return 'الطعام';
      case 'technology': return 'التكنولوجيا';
      case 'healthcare': return 'الرعاية الصحية';
      case 'education': return 'التعليم';
      case 'automotive': return 'السيارات';
      case 'real_estate': return 'العقارات';
      case 'travel': return 'السفر';
      case 'beauty': return 'الجمال';
      case 'other': return 'أخرى';
      default: return industry;
    }
  };

  /** التحقق من نوع المستخدم الحالي */
  const validateCurrentUser = (currentUser: User | null): currentUser is User => {
    return currentUser !== null && 
           Boolean(currentUser.id) && 
           Boolean(currentUser.email);
  };

  /** معالج إرسال النموذج */
  const handleSubmit = async () => {
    if (!validateCurrentUser(user)) {
      setError('خطأ: لم يتم العثور على بيانات المستخدم الصحيحة');
      return;
    }

    // التحقق من صحة البيانات
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // إعداد البيانات الإضافية حسب الدور
      let additionalData: RoleSelectionSubmission['additional_data'] = {};

      switch (formState.selectedRole) {
        case 'photographer':
          additionalData = {
            contract_type: formState.contractType!,
            specializations: formState.specializations,
            experience_years: formState.experienceYears,
            portfolio_links: formState.portfolioLinks.filter(link => link.trim()),
            equipment_owned: formState.equipmentOwned
          };
          break;

        case 'brand_coordinator':
          additionalData = {
            selected_brand_id: formState.selectedBrandId,
            brand_search_query: formState.brandSearchQuery,
            brand_coordinator_experience: formState.brandCoordinatorExperience
          };
          break;

        case 'marketing_coordinator':
          additionalData = {
            marketing_experience: formState.marketingExperience,
            campaigns_managed: formState.campaignsManagedCount
          };
          break;
      }

      // إعداد طلب الإرسال
      const submissionData: RoleSelectionSubmission = {
        selected_role: formState.selectedRole!,
        motivation: formState.motivation.trim(),
        additional_data: additionalData
      };

      // إرسال الطلب
      await roleSelectionService.submitRoleSelection(user.id, submissionData);

      console.log(`✅ تم إرسال طلب اختيار الدور: ${formState.selectedRole}`);

      // التوجيه لصفحة الانتظار
      router.push('/pending');

    } catch (error) {
      console.error('❌ خطأ في إرسال طلب اختيار الدور:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير متوقع في إرسال الطلب';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======================================
  // 🎨 العرض
  // ======================================

  // حالة التحميل الأولي
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-2xl mb-4">
            <span className="text-2xl">🎭</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            اختيار الدور المناسب
          </h1>
          <p className="text-lg text-gray-600">
            اختر الدور الذي يناسب مهاراتك وخبرتك في استوديو Depth
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* اختيار الدور */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">1. اختر الدور المطلوب</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* مصور */}
              <div 
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  formState.selectedRole === 'photographer' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300'
                }`}
                onClick={() => handleRoleSelection('photographer')}
              >
                <div className="text-4xl mb-3">📸</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">مصور</h3>
                <p className="text-gray-600 text-sm">
                  التخصص في التصوير الرقمي والإبداعي لمختلف أنواع المحتوى
                </p>
              </div>

              {/* منسق البراند */}
              <div 
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  formState.selectedRole === 'brand_coordinator' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300'
                }`}
                onClick={() => handleRoleSelection('brand_coordinator')}
              >
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">منسق البراند</h3>
                <p className="text-gray-600 text-sm">
                  إدارة وتنسيق المشاريع والحملات لبراند محدد
                </p>
              </div>

              {/* منسق التسويق */}
              <div 
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  formState.selectedRole === 'marketing_coordinator' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-300'
                }`}
                onClick={() => handleRoleSelection('marketing_coordinator')}
              >
                <div className="text-4xl mb-3">📈</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">منسق التسويق</h3>
                <p className="text-gray-600 text-sm">
                  تخطيط وإدارة الحملات التسويقية والترويجية
                </p>
              </div>
            </div>
          </div>

          {/* دافع الاختيار */}
          {formState.selectedRole && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. دافع اختيار هذا الدور</h2>
              <textarea
                value={formState.motivation}
                onChange={(e) => setFormState(prev => ({ ...prev, motivation: e.target.value }))}
                placeholder="اشرح لنا لماذا تريد هذا الدور وما الذي يؤهلك له..."
                className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={500}
              />
              <div className="text-sm text-gray-500 text-right mt-2">
                {formState.motivation.length}/500 حرف
              </div>
            </div>
          )}

          {/* النماذج المتخصصة */}
          {formState.selectedRole === 'photographer' && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">3. بيانات المصور</h2>
              
              {/* نوع العقد */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">نوع العقد المطلوب</label>
                <div className="grid md:grid-cols-2 gap-4">
                  {contractTypes.map((contractType) => (
                    <div
                      key={contractType}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formState.contractType === contractType
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                      onClick={() => setFormState(prev => ({ ...prev, contractType }))}
                    >
                      <h3 className="font-semibold text-gray-900">
                        {contractType === 'freelancer' ? 'فريلانسر' : 'راتب ثابت'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {contractType === 'freelancer' 
                          ? 'العمل بنظام المشاريع والأجر حسب القطعة'
                          : 'العمل بنظام الراتب الشهري الثابت'
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* التخصصات */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">التخصصات (اختر واحد أو أكثر)</label>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PHOTOGRAPHY_SPECIALIZATIONS.map((specialization) => (
                    <label
                      key={specialization}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formState.specializations.includes(specialization)}
                        onChange={() => handleSpecializationToggle(specialization)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="mr-3 text-gray-700">{specialization}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* سنوات الخبرة */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">سنوات الخبرة</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formState.experienceYears}
                  onChange={(e) => setFormState(prev => ({ ...prev, experienceYears: parseInt(e.target.value) || 0 }))}
                  className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="أدخل عدد سنوات الخبرة"
                />
              </div>

              {/* روابط المعرض */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">روابط معرض الأعمال</label>
                {formState.portfolioLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => handlePortfolioLinkChange(index, e.target.value)}
                      placeholder="https://example.com/portfolio"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {formState.portfolioLinks.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removePortfolioLink(index)}
                        className="px-3"
                      >
                        ❌
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPortfolioLink}
                  className="text-primary-600 border-primary-600 hover:bg-primary-50"
                >
                  إضافة رابط آخر +
                </Button>
              </div>

              {/* المعدات المملوكة */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">المعدات المملوكة (اختياري)</label>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {COMMON_EQUIPMENT.map((equipment) => (
                    <label
                      key={equipment}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formState.equipmentOwned.includes(equipment)}
                        onChange={() => handleEquipmentToggle(equipment)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="mr-3 text-gray-700">{equipment}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* نموذج منسق البراند */}
          {formState.selectedRole === 'brand_coordinator' && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">3. بيانات منسق البراند</h2>
              
              {/* البحث في البراندات */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">البحث عن البراند</label>
                <input
                  type="text"
                  value={formState.brandSearchQuery}
                  onChange={(e) => handleBrandSearch(e.target.value)}
                  placeholder="ابحث عن البراند بالاسم..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* اختيار البراند */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">اختر البراند المطلوب</label>
                {loadingBrands ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">جاري تحميل البراندات...</p>
                  </div>
                ) : availableBrands.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                    {availableBrands.map((brand) => (
                      <div
                        key={brand.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formState.selectedBrandId === brand.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                        onClick={() => setFormState(prev => ({ ...prev, selectedBrandId: brand.id }))}
                      >
                        <h3 className="font-semibold text-gray-900">{brand.name.ar}</h3>
                        <p className="text-sm text-gray-600 mt-1">{brand.description.ar}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span>🏢 {formatBrandTypeArabic(brand.brand_type)}</span>
                          <span className="mx-2">•</span>
                          <span>🏭 {formatIndustryArabic(brand.industry)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد براندات متاحة حالياً. جرب البحث بكلمات أخرى.
                  </div>
                )}
              </div>

              {/* خبرة منسق البراند */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">خبرتك في تنسيق البراندات</label>
                <textarea
                  value={formState.brandCoordinatorExperience}
                  onChange={(e) => setFormState(prev => ({ ...prev, brandCoordinatorExperience: e.target.value }))}
                  placeholder="اشرح خبرتك السابقة في التعامل مع البراندات وإدارة المشاريع..."
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  maxLength={500}
                />
                <div className="text-sm text-gray-500 text-right mt-2">
                  {formState.brandCoordinatorExperience.length}/500 حرف
                </div>
              </div>
            </div>
          )}

          {/* نموذج منسق التسويق */}
          {formState.selectedRole === 'marketing_coordinator' && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">3. بيانات منسق التسويق</h2>
              
              {/* خبرة التسويق */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">خبرتك في مجال التسويق</label>
                <textarea
                  value={formState.marketingExperience}
                  onChange={(e) => setFormState(prev => ({ ...prev, marketingExperience: e.target.value }))}
                  placeholder="اشرح خبرتك في التسويق الرقمي، إدارة الحملات، وسائل التواصل الاجتماعي..."
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  maxLength={500}
                />
                <div className="text-sm text-gray-500 text-right mt-2">
                  {formState.marketingExperience.length}/500 حرف
                </div>
              </div>

              {/* عدد الحملات المدارة */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">عدد الحملات التي أدرتها سابقاً</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={formState.campaignsManagedCount}
                  onChange={(e) => setFormState(prev => ({ ...prev, campaignsManagedCount: parseInt(e.target.value) || 0 }))}
                  className="w-full md:w-1/3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="أدخل عدد الحملات"
                />
              </div>
            </div>
          )}

          {/* رسالة الخطأ */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              رجوع
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={!formState.selectedRole || isSubmitting}
              className="px-8"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  جاري الإرسال...
                </>
              ) : (
                'إرسال الطلب'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 