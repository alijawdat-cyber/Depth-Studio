# 🗄️ **قاعدة البيانات و API الشاملة - Depth Studio**

**📅 تاريخ الإنشاء:** 31 مايو 2025  
**👤 المسؤول:** علي جودت  
**🎯 المشروع:** Depth Studio - AI-Powered Content Management System  
**🔄 الحالة:** هيكل نهائي متوافق مع Firebase مع الحملات الذكية والنظام الديناميكي

---

## 📊 **تحليل المتطلبات المتكامل**

### 🎯 **ملخص التحليل من الملفات:**

**من `depth_studio_ui_requirements.md`:**
- 4 أدوار رئيسية (علي جودت، حسن هاشم، منسقي البراندات، المصورين)
- نظام صلاحيات ديناميكي مرن جداً
- 5 براندات أولية قابلة للإدارة الكاملة
- نظام فئات هرمي متطور (رئيسية → فرعية)
- نظام معدات ديناميكي مرتبط بالفئات
- نظام حملات ذكي ثوري مع توزيع AI
- تمييز أنواع العقود (فريلانسر/راتب ثابت)
- نظام إشعارات متطور
- منع التضارب الزمني والمكاني

**من `firebase_project_documentation.md`:**
- مشروع Firebase نشط مع 9 مستخدمين مسجلين
- 4 تطبيقات مربوطة (Web, iOS, Android, Backend)
- خطة Blaze (Pay-as-you-go) مفعلة
- قوالب بريد عربية مُعدة
- SMS MFA مفعل
- قواعد أمان Firebase تنتهي في 28 يونيو 2025

**من `system_development_environment_report.md`:**
- بيئة تطوير macOS كاملة جاهزة
- Flutter 3.32.0 مع Dart 3.8.0
- أدوات iOS و Android جاهزة
- Firebase CLI مثبت ومحدث

**من `depth_studio_ui_tree_structure.md`:**
- 151 واجهة مختلفة موزعة على الأدوار
- نظام واجهة موحدة للمصورين تتكيف حسب الأدوار
- تصميم متجاوب لجميع المنصات
- نظام ثيمات متكيف حسب البراند

---

## 🏗️ **الدفعة الأولى - هياكل المستخدمين والأدوار**

### 👥 **جدول المستخدمين الرئيسي**
```sql
-- Collection: users
{
  id: string (auto-generated Firebase UID)
  
  // معلومات أساسية
  email: string (unique, indexed)
  phone: string (optional, indexed)
  display_name: string
  first_name: string
  last_name: string
  profile_photo_url: string (optional)
  
  // معلومات الدور والحالة
  primary_role: enum [
    'super_admin',      // علي جودت
    'marketing_coordinator', // حسن هاشم  
    'brand_coordinator', // منسقي البراندات
    'photographer'      // المصورين (موحد)
  ]
  
  // حالة المستخدم
  is_active: boolean (default: true)
  is_verified: boolean (default: false)
  last_login: timestamp
  created_at: timestamp (server timestamp)
  updated_at: timestamp (server timestamp)
  
  // معلومات إضافية
  bio: string (optional)
  location: string (optional) 
  timezone: string (default: 'Asia/Baghdad')
  language: string (default: 'ar')
  
  // بيانات Firebase Authentication
  firebase_uid: string (indexed, unique)
  auth_providers: array [
    'email', 'phone', 'google', 'apple'
  ]
  
  // تتبع الأنشطة  
  total_login_count: number (default: 0)
  last_seen: timestamp
  is_online: boolean (default: false)
  
  // Firestore Security
  created_by: string (reference to users.id)
  updated_by: string (reference to users.id)
}

// Indexes المطلوبة:
- Composite: (primary_role, is_active)
- Composite: (email, is_active) 
- Single: firebase_uid
- Single: phone
- Single: is_online
```

### 🔐 **جدول الصلاحيات الديناميكية المتطورة**
```sql
-- Collection: user_permissions
{
  id: string (auto-generated)
  user_id: string (reference to users.id, indexed)
  
  // صلاحيات الأدوار المتعددة
  roles: array [
    {
      role_type: enum [
        'super_admin', 'marketing_coordinator', 
        'brand_coordinator', 'photographer',
        'content_reviewer', 'designer', 'writer'
      ]
      is_primary: boolean
      granted_at: timestamp
      granted_by: string (reference to users.id)
      expires_at: timestamp (optional)
    }
  ]
  
  // صلاحيات الشاشات والواجهات
  screen_permissions: {
    dashboard: boolean
    users_management: boolean
    brands_management: boolean
    campaigns_management: boolean
    content_review: boolean
    financial_reports: boolean
    analytics: boolean
    settings: boolean
  }
  
  // صلاحيات CRUD التفصيلية
  crud_permissions: {
    users: { create: boolean, read: boolean, update: boolean, delete: boolean }
    brands: { create: boolean, read: boolean, update: boolean, delete: boolean }
    campaigns: { create: boolean, read: boolean, update: boolean, delete: boolean }
    tasks: { create: boolean, read: boolean, update: boolean, delete: boolean }
    content: { create: boolean, read: boolean, update: boolean, delete: boolean }
    payments: { create: boolean, read: boolean, update: boolean, delete: boolean }
    reports: { create: boolean, read: boolean, update: boolean, delete: boolean }
  }
  
  // صلاحيات البراندات المخصصة
  brand_permissions: array [
    {
      brand_id: string (reference to brands.id)
      access_level: enum ['full', 'read_only', 'coordinator', 'content_only']
      can_approve_content: boolean
      can_edit_tasks: boolean
      can_view_financials: boolean
      assigned_at: timestamp
      assigned_by: string (reference to users.id)
    }
  ]
  
  // صلاحيات مخصصة إضافية
  custom_permissions: map {
    permission_name: string
    permission_value: boolean
    description: string
    granted_by: string (reference to users.id)
    granted_at: timestamp
  }
  
  // تتبع وإدارة
  is_active: boolean (default: true)
  last_updated_by: string (reference to users.id)
  created_at: timestamp
  updated_at: timestamp
  
  // سجل التغييرات
  changelog: array [
    {
      action: enum ['granted', 'revoked', 'modified']
      permission_type: string
      old_value: any
      new_value: any
      changed_by: string (reference to users.id)
      changed_at: timestamp
      reason: string (optional)
    }
  ]
}

// Indexes المطلوبة:
- Single: user_id
- Composite: (user_id, is_active)
- Array: brand_permissions.brand_id
```

### 👨‍💼 **جدول ملفات المصورين المتقدم**
```sql
-- Collection: photographer_profiles  
{
  id: string (auto-generated)
  user_id: string (reference to users.id, indexed, unique)
  
  // نوع العقد (مهم جداً للحسابات)
  contract_type: enum ['freelancer', 'salary'] // فريلانسر أو راتب ثابت
  
  // معلومات العقد للفريلانسر
  freelancer_info: {
    base_rate_percentage: number (0.0-1.0) // نسبة من سعر الفئة
    preferred_payment_method: enum ['bank_transfer', 'cash', 'digital_wallet']
    payment_schedule: enum ['per_task', 'weekly', 'bi_weekly', 'monthly']
    minimum_task_value: number (optional)
    
    // تفاصيل مالية
    total_earnings_ytd: number (default: 0) // إجمالي الأرباح هذا العام
    pending_payments: number (default: 0)   // المدفوعات المعلقة
    last_payment_date: timestamp (optional)
  }
  
  // معلومات العقد للراتب الثابت
  salary_info: {
    monthly_salary: number
    monthly_target_tasks: number // الهدف الشهري للمهام
    bonus_per_extra_task: number // مكافأة عن كل مهمة إضافية
    performance_bonus_rate: number // نسبة مكافأة الأداء
    
    // إحصائيات شهرية
    current_month_completed: number (default: 0)
    current_month_target: number
    total_bonus_earned: number (default: 0)
    performance_rating: number (1.0-5.0, default: 3.0)
  }
  
  // التخصصات والمهارات (مرتبطة بالفئات)
  specializations: array [
    {
      category_id: string (reference to content_categories.id)
      skill_level: enum ['beginner', 'intermediate', 'advanced', 'expert']
      experience_years: number
      portfolio_samples: array [string] // URLs للأعمال السابقة
      hourly_rate_modifier: number (0.5-2.0) // معامل تعديل السعر حسب المهارة
    }
  ]
  
  // تفضيلات العمل
  work_preferences: {
    preferred_brands: array [string] (references to brands.id)
    max_concurrent_tasks: number (default: 5)
    preferred_work_hours: {
      start_time: string ('09:00')
      end_time: string ('18:00')
      timezone: string ('Asia/Baghdad')
    }
    available_days: array ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    preferred_locations: array [
      enum ['studio', 'client_location', 'outdoor', 'home', 'travel']
    ]
    max_travel_distance: number (kilometers, default: 50)
  }
  
  // المعدات المملوكة
  owned_equipment: array [
    {
      equipment_id: string (reference to equipment.id)
      condition: enum ['excellent', 'good', 'fair', 'needs_repair']
      purchase_date: timestamp (optional)
      is_available: boolean (default: true)
      maintenance_notes: string (optional)
    }
  ]
  
  // إحصائيات الأداء
  performance_stats: {
    total_tasks_completed: number (default: 0)
    average_rating: number (1.0-5.0, default: 0.0)
    on_time_completion_rate: number (0.0-1.0, default: 0.0)
    client_satisfaction_score: number (1.0-5.0, default: 0.0)
    quality_score_average: number (1.0-5.0, default: 0.0)
    
    // إحصائيات حسب البراند
    brand_performance: map {
      brand_id: {
        tasks_completed: number
        average_rating: number
        preferred_by_brand: boolean
      }
    }
    
    // إحصائيات حسب الفئة
    category_performance: map {
      category_id: {
        tasks_completed: number
        average_time_taken: number (hours)
        quality_score: number
        improvement_trend: enum ['improving', 'stable', 'declining']
      }
    }
  }
  
  // معلومات التواصل والتوفر
  availability: {
    is_currently_available: boolean (default: true)
    unavailable_periods: array [
      {
        start_date: date
        end_date: date  
        reason: string
        type: enum ['vacation', 'sick_leave', 'personal', 'other_work']
      }
    ]
    max_daily_hours: number (default: 8)
    preferred_break_duration: number (minutes, default: 60)
  }
  
  // معلومات مالية للمحاسبة
  financial_info: {
    tax_id: string (optional)
    bank_account: string (encrypted, optional)
    payment_terms: string (optional)
    currency: string (default: 'IQD')
  }
  
  // تواصل وملاحظات
  contact_preferences: {
    preferred_contact_method: enum ['email', 'phone', 'whatsapp', 'telegram']
    whatsapp_number: string (optional)
    telegram_username: string (optional)
  }
  
  // بيانات النظام
  is_active: boolean (default: true)
  verification_status: enum ['pending', 'verified', 'suspended', 'rejected']
  verification_date: timestamp (optional)
  verified_by: string (reference to users.id, optional)
  
  // تواريخ مهمة
  hire_date: timestamp
  created_at: timestamp
  updated_at: timestamp
  last_activity: timestamp
}

// Indexes المطلوبة:
- Single: user_id (unique)
- Composite: (contract_type, is_active)
- Composite: (verification_status, is_active)
- Array: specializations.category_id
- Array: work_preferences.preferred_brands
- Array: owned_equipment.equipment_id
- Single: availability.is_currently_available
```

### 👔 **جدول منسقي البراندات**
```sql
-- Collection: brand_coordinators
{
  id: string (auto-generated)
  user_id: string (reference to users.id, indexed)
  brand_id: string (reference to brands.id, indexed)
  
  // معلومات المنسق
  coordinator_title: string // مسؤول مبيعات، منسق تسويق، إلخ
  job_description: text
  
  // المسؤوليات المحددة
  responsibilities: array [
    enum [
      'sales_management',          // إدارة المبيعات
      'content_approval',          // موافقة المحتوى
      'task_coordination',         // تنسيق المهام
      'client_communication',      // التواصل مع العميل
      'quality_control',           // مراقبة الجودة
      'budget_management',         // إدارة الميزانية
      'schedule_management',       // إدارة الجدولة
      'photographer_coordination', // تنسيق المصورين
      'content_review',           // مراجعة المحتوى
      'brand_compliance'          // التزام بمعايير البراند
    ]
  ]
  
  // صلاحيات خاصة مع البراند
  brand_permissions: {
    can_approve_content: boolean (default: true)
    can_reject_content: boolean (default: true)
    can_assign_tasks: boolean (default: true)
    can_modify_deadlines: boolean (default: false)
    can_view_financials: boolean (default: false)
    can_communicate_with_client: boolean (default: true)
    max_budget_authority: number (optional) // أقصى مبلغ يستطيع اعتماده
  }
  
  // معلومات التواصل مع العميل
  client_contact_info: {
    client_primary_contact: string // اسم المسؤول في الشركة
    client_email: string (optional)
    client_phone: string (optional)
    client_whatsapp: string (optional)
    preferred_communication_hours: {
      start_time: string
      end_time: string
      timezone: string
    }
    communication_language: enum ['arabic', 'english', 'both']
  }
  
  // إحصائيات الأداء
  performance_metrics: {
    total_projects_managed: number (default: 0)
    client_satisfaction_rating: number (1.0-5.0, default: 0.0)
    average_response_time: number (hours, default: 0)
    content_approval_rate: number (0.0-1.0, default: 0.0)
    on_time_delivery_rate: number (0.0-1.0, default: 0.0)
    
    // إحصائيات شهرية
    monthly_stats: map {
      'YYYY-MM': {
        projects_completed: number
        client_meetings: number
        content_approved: number
        content_rejected: number
        average_project_rating: number
      }
    }
  }
  
  // جدولة وتوفر
  work_schedule: {
    working_days: array ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    working_hours: {
      start_time: string ('09:00')
      end_time: string ('17:00')
    }
    timezone: string ('Asia/Baghdad')
    is_available: boolean (default: true)
    
    // فترات عدم التوفر
    unavailable_periods: array [
      {
        start_date: date
        end_date: date
        reason: string
        type: enum ['vacation', 'training', 'other_assignment']
      }
    ]
  }
  
  // معلومات العقد
  employment_info: {
    start_date: date
    end_date: date (optional)
    contract_type: enum ['full_time', 'part_time', 'consultant', 'freelance']
    compensation_type: enum ['salary', 'hourly', 'project_based']
    is_exclusive: boolean // هل هو منسق حصري لهذا البراند فقط
  }
  
  // ملاحظات وتقييمات
  notes: {
    management_notes: text (private, من الإدارة)
    client_feedback: text (من العميل)
    self_evaluation: text (من المنسق نفسه)
    areas_for_improvement: array [string]
    strengths: array [string]
  }
  
  // حالة النشاط
  status: enum ['active', 'inactive', 'on_leave', 'terminated']
  is_primary_coordinator: boolean // هل هو المنسق الرئيسي للبراند
  
  // بيانات النظام
  created_at: timestamp
  updated_at: timestamp
  created_by: string (reference to users.id)
  last_activity: timestamp
}

// Indexes المطلوبة:
- Composite: (user_id, brand_id) unique
- Single: brand_id
- Single: user_id  
- Composite: (brand_id, is_primary_coordinator)
- Composite: (status, is_primary_coordinator)
```

---

**🎯 نهاية الدفعة الأولى**  
**📋 المحتوى:** جداول المستخدمين والأدوار والصلاحيات  
**⏭️ التالي:** جداول البراندات والفئات والمعدات الديناميكية 

---

## 🏢 **الدفعة الثانية - البراندات والفئات والمعدات الديناميكية**

### 🎨 **جدول البراندات الديناميكي الشامل**
```sql
-- Collection: brands
{
  id: string (auto-generated)
  
  // معلومات أساسية (إجبارية)
  name_ar: string (indexed) // اسم البراند بالعربية
  name_en: string (indexed) // اسم البراند بالإنجليزية
  company_name: string // اسم الشركة المالكة
  display_name: string // الاسم المعروض (يفضل العربي)
  
  // الشعار بأحجام متعددة
  logos: {
    logo_32x32: string (Storage URL)
    logo_64x64: string (Storage URL)
    logo_128x128: string (Storage URL)
    logo_256x256: string (Storage URL)
    logo_512x512: string (Storage URL)
    logo_vector: string (Storage URL, SVG file)
    logo_main: string (Storage URL, أعلى دقة)
  }
  
  // الوصف والرؤية
  description: text
  vision: text (optional)
  mission: text (optional)
  
  // نوع النشاط التجاري
  business_type: {
    category: enum [
      'clothing_fashion',    // ملابس وأزياء
      'food_beverage',       // طعام ومشروبات
      'health_medical',      // صحة وطب
      'sports_fitness',      // رياضة ولياقة
      'technology',          // تكنولوجيا
      'beauty_cosmetics',    // جمال ومستحضرات
      'home_furniture',      // منزل وأثاث
      'automotive',          // سيارات ومركبات
      'education',           // تعليم وتدريب
      'entertainment',       // ترفيه وفنون
      'real_estate',         // عقارات
      'finance_banking',     // مالية ومصرفية
      'retail_commerce',     // تجارة تجزئة
      'services',            // خدمات عامة
      'other'                // أخرى
    ]
    subcategory: string (optional) // تخصص فرعي
    custom_description: string (optional) // وصف مخصص
  }
  
  // معلومات الاتصال
  contact_info: {
    address: string (optional)
    city: string (optional)
    country: string (default: 'Iraq')
    phone: string (optional)
    email: string (optional)
    website: string (optional)
    social_media: {
      instagram: string (optional)
      facebook: string (optional)
      tiktok: string (optional)
      youtube: string (optional)
      linkedin: string (optional)
      twitter: string (optional)
    }
  }
  
  // الهوية البصرية المبسطة
  visual_identity: {
    // لوحة الألوان الأساسية (3-8 ألوان)
    primary_colors: array [
      {
        color_name: string // مثل: "ذهبي فاخر"
        hex_code: string // مثل: "#D4AF37"
        usage: string // متى يُستخدم هذا اللون
        is_main: boolean // هل هو اللون الرئيسي
      }
    ]
    
    // الألوان الثانوية (اختيارية)
    secondary_colors: array [
      {
        color_name: string
        hex_code: string
        usage: string
      }
    ]
    
    // أسرة الخطوط المفضلة
    fonts: {
      arabic_font: string (optional) // خط عربي مفضل
      english_font: string (optional) // خط إنجليزي مفضل
      font_notes: string (optional) // ملاحظات حول الخطوط
    }
    
    // نمط التصوير المميز
    photography_style: enum [
      'luxury',      // فاخر
      'sporty',      // رياضي  
      'natural',     // طبيعي
      'creative',    // إبداعي
      'medical',     // طبي
      'modern',      // عصري
      'classic',     // كلاسيكي
      'youthful',    // شبابي
      'minimalist',  // بسيط
      'artistic'     // فني
    ]
    
    // الطابع العام
    brand_personality: array [
      enum [
        'formal',        // رسمي
        'friendly',      // ودود
        'professional',  // احترافي
        'playful',       // مرح
        'elegant',       // أنيق
        'simple',        // بسيط
        'bold',          // جريء
        'trustworthy',   // موثوق
        'innovative',    // مبتكر
        'traditional'    // تقليدي
      ]
    ]
    
    // ملفات مرجعية
    brand_guidelines: string (Storage URL, PDF file, optional)
    reference_examples: array [string] (Storage URLs للصور المرجعية)
  }
  
  // معايير الإنتاج الأساسية
  production_standards: {
    // أنواع المحتوى المسموحة
    allowed_content_types: array [
      enum ['photos', 'videos', 'designs', 'animations', 'other']
    ]
    
    // متطلبات التصوير
    photography_requirements: {
      preferred_lighting: array [
        enum ['natural', 'studio', 'mixed', 'golden_hour', 'artificial']
      ]
      required_angles: array [
        enum ['portrait', 'landscape', 'square', 'various', 'specific']
      ]
      style_notes: text (optional) // ملاحظات خاصة بالأسلوب
    }
    
    // مواصفات التصدير
    export_specifications: {
      required_sizes: array [
        {
          size_name: string // مثل: "إنستغرام بوست"
          dimensions: string // مثل: "1080x1080"
          format: enum ['jpg', 'png', 'webp', 'svg']
          quality: enum ['high', 'medium', 'web_optimized']
          usage: string // متى يُستخدم هذا الحجم
        }
      ]
      default_format: enum ['jpg', 'png', 'webp']
      compression_level: enum ['none', 'light', 'medium', 'high']
    }
    
    // متطلبات الجودة
    quality_standards: {
      minimum_resolution: string // مثل: "1920x1080"
      color_profile: enum ['sRGB', 'Adobe_RGB', 'ProPhoto_RGB']
      file_naming_convention: string // مثل: "NAVA_[date]_[type]_[number]"
      watermark_required: boolean
      metadata_requirements: array [string] // البيانات المطلوبة في الملف
    }
  }
  
  // إعدادات الأهداف
  goals_settings: {
    // أهداف شهرية
    monthly_targets: {
      content_count: number (optional) // عدد المحتوى المطلوب شهرياً
      quality_score: number (1.0-5.0, optional) // هدف الجودة
      engagement_target: number (optional) // هدف التفاعل
      budget_limit: number (optional) // الحد الأقصى للميزانية الشهرية
    }
    
    // أهداف سنوية
    yearly_targets: {
      growth_percentage: number (optional) // نسبة النمو المستهدفة
      development_focus: array [string] // مجالات التركيز للتطوير
      expansion_plans: text (optional) // خطط التوسع
    }
    
    // الجمهور المستهدف
    target_audience: {
      age_groups: array [
        enum ['13-18', '19-25', '26-35', '36-45', '46-55', '55+']
      ]
      gender_focus: enum ['male', 'female', 'both', 'other']
      interests: array [string] // اهتمامات الجمهور
      geographic_focus: array [string] // المناطق الجغرافية المستهدفة
    }
    
    // مواسم النشاط
    seasonal_activity: {
      peak_seasons: array [
        {
          season_name: string // مثل: "عيد الفطر"
          start_month: number (1-12)
          end_month: number (1-12)
          activity_multiplier: number (1.0-5.0) // مضاعف النشاط
          special_requirements: text (optional)
        }
      ]
      low_seasons: array [
        {
          season_name: string
          start_month: number
          end_month: number
          reduced_activity: number (0.1-1.0)
        }
      ]
    }
  }
  
  // نظام التسعير المرن
  pricing_system: {
    // هل يستخدم الأسعار العامة أم أسعار مخصصة
    uses_custom_pricing: boolean (default: false)
    
    // أسعار مخصصة لفئات محددة (إذا كان مفعل)
    custom_category_prices: map {
      category_id: {
        custom_base_price: number
        price_modifier: number (0.5-3.0) // معامل تعديل السعر
        special_rates: {
          freelancer_rate: number (0.0-1.0) // نسبة المصور الفريلانسر
          bulk_discount: number (0.0-0.5) // خصم الكمية
          rush_surcharge: number (0.0-1.0) // علاوة الاستعجال
        }
      }
    }
    
    // خصومات وعلاوات خاصة
    special_modifiers: {
      loyalty_discount: number (0.0-0.3) // خصم الولاء
      volume_discounts: array [
        {
          minimum_quantity: number
          discount_percentage: number (0.0-0.5)
        }
      ]
      seasonal_modifiers: array [
        {
          season_name: string
          price_modifier: number (0.5-2.0)
          start_date: date
          end_date: date
        }
      ]
    }
    
    // نظام مكافآت الجودة
    quality_bonuses: {
      excellent_bonus: number (0.0-0.5) // مكافأة الجودة الممتازة
      perfect_bonus: number (0.0-1.0) // مكافأة الجودة المثالية
      on_time_bonus: number (0.0-0.2) // مكافأة التسليم في الوقت
      early_bonus: number (0.0-0.3) // مكافأة التسليم المبكر
    }
  }
  
  // حالة البراند ومعلومات النظام
  status: enum ['active', 'paused', 'archived', 'development'] // نشط، متوقف، مؤرشف، قيد التطوير
  priority: number (1-5) // درجة الأولوية (5 الأعلى)
  
  // معلومات المنسق المخصص
  assigned_coordinator: string (reference to users.id, optional)
  coordinator_assignment_date: timestamp (optional)
  
  // إحصائيات وبيانات الأداء
  statistics: {
    total_projects: number (default: 0)
    completed_projects: number (default: 0)
    total_content_pieces: number (default: 0)
    average_project_rating: number (1.0-5.0, default: 0.0)
    client_satisfaction_score: number (1.0-5.0, default: 0.0)
    
    // إحصائيات مالية
    total_spent: number (default: 0)
    average_monthly_budget: number (default: 0)
    cost_per_content_piece: number (default: 0)
    
    // إحصائيات الوقت
    average_project_duration: number (days, default: 0)
    on_time_delivery_rate: number (0.0-1.0, default: 0.0)
  }
  
  // ملاحظات وتعليقات
  notes: {
    internal_notes: text (ملاحظات داخلية للفريق)
    client_feedback: text (ملاحظات من العميل)
    special_instructions: text (تعليمات خاصة للمصورين)
    preferences: text (تفضيلات خاصة)
  }
  
  // بيانات النظام والتتبع
  created_at: timestamp
  updated_at: timestamp
  created_by: string (reference to users.id)
  last_updated_by: string (reference to users.id)
  last_activity: timestamp // آخر نشاط مع هذا البراند
  
  // معلومات العقد والاتفاق
  contract_info: {
    contract_start_date: date (optional)
    contract_end_date: date (optional)
    contract_type: enum ['monthly', 'project_based', 'yearly', 'ongoing']
    payment_terms: string (optional)
    special_agreements: text (optional)
  }
}

// Indexes المطلوبة:
- Single: name_ar
- Single: name_en  
- Composite: (status, priority)
- Single: assigned_coordinator
- Composite: (business_type.category, status)
- Single: created_by
- Single: last_activity
```

### 📂 **جدول الفئات الهرمي الديناميكي**
```sql
-- Collection: content_categories
{
  id: string (auto-generated)
  
  // معلومات الفئة الأساسية
  name_ar: string (indexed) // الاسم بالعربية
  name_en: string (indexed) // الاسم بالإنجليزية
  display_name: string // الاسم المعروض
  description: text
  
  // الهيكل الهرمي
  category_type: enum ['main', 'sub'] // رئيسية أو فرعية
  parent_category_id: string (reference to content_categories.id, optional) // للفئات الفرعية
  sort_order: number (default: 0) // ترتيب العرض
  
  // الأيقونة والألوان
  icon: string (emoji أو رمز)
  color_hex: string // لون مميز للفئة
  
  // إعدادات الأوقات المتقدمة
  time_settings: {
    // وقت التنفيذ بدون معالجة (بالساعات لكل وحدة)
    execution_time_raw: number // مثل: 0.5 ساعة لصورة واحدة
    
    // وقت التنفيذ مع المعالجة الكاملة (بالساعات لكل وحدة)  
    execution_time_processed: number // مثل: 1 ساعة لصورة مع معالجة
    
    // وقت إضافي للتعقيدات
    complexity_time_modifiers: {
      simple: number (0.8-1.0) // بسيط
      medium: number (1.0-1.5) // متوسط
      complex: number (1.5-3.0) // معقد
      custom: number (1.0-5.0) // مخصص
    }
    
    // أوقات إضافية للمراجعة والتنسيق
    review_time: number (hours, default: 0.25) // وقت المراجعة
    approval_time: number (hours, default: 0.1) // وقت الموافقة
    revision_time: number (hours, default: 0.5) // وقت التعديلات
  }
  
  // نظام التسعير المتقدم
  pricing: {
    // السعر الأساسي للفئة الفرعية
    base_price: number // بالدينار العراقي
    currency: string (default: 'IQD')
    
    // أنواع التسعير
    pricing_type: enum ['per_piece', 'per_hour', 'per_project', 'custom']
    
    // نسب المصورين
    photographer_rates: {
      // نسبة المصور الفريلانسر من السعر الأساسي
      freelancer_percentage: number (0.0-1.0, default: 0.7) // 70%
      
      // للمصور براتب ثابت - الكميات فقط (بدون مبالغ مالية)
      salary_count_only: boolean (default: true)
    }
    
    // معاملات تعديل السعر
    price_modifiers: {
      location_modifiers: {
        studio: number (1.0) // السعر الأساسي في الاستوديو
        client_location: number (1.15) // +15% في موقع العميل
        outdoor: number (1.25) // +25% في موقع خارجي
        travel_out_of_city: number (1.5) // +50% للسفر خارج المدينة
        travel_cost_additional: boolean (true) // تكاليف سفر إضافية
      }
      
      quality_modifiers: {
        standard: number (1.0) // جودة عادية
        premium: number (1.2) // جودة مميزة +20%
        luxury: number (1.5) // جودة فاخرة +50%
      }
      
      urgency_modifiers: {
        normal: number (1.0) // التوقيت العادي
        urgent_24h: number (1.3) // خلال 24 ساعة +30%
        urgent_12h: number (1.5) // خلال 12 ساعة +50%
        urgent_6h: number (2.0) // خلال 6 ساعات +100%
      }
      
      quantity_modifiers: array [
        {
          min_quantity: number
          max_quantity: number (optional)
          discount_percentage: number (0.0-0.5) // خصم الكمية
        }
      ]
    }
  }
  
  // المعدات المطلوبة (مرتبطة ديناميكياً)
  required_equipment: array [
    {
      equipment_id: string (reference to equipment.id)
      is_mandatory: boolean // إجباري أم اختياري
      alternative_equipment: array [string] // معدات بديلة مقبولة
      usage_notes: string (optional) // ملاحظات الاستخدام
    }
  ]
  
  // المهارات المطلوبة
  required_skills: array [
    {
      skill_name: string
      skill_level: enum ['basic', 'intermediate', 'advanced', 'expert']
      is_mandatory: boolean
      description: string (optional)
    }
  ]
  
  // أماكن التصوير المناسبة
  suitable_locations: array [
    enum ['studio', 'client_location', 'outdoor', 'home_studio', 'travel', 'virtual']
  ]
  
  // أنواع المحتوى المنتج
  output_types: array [
    {
      type: enum ['photo', 'video', 'design', 'animation', 'mixed']
      format: array [string] // JPG, PNG, MP4, etc.
      typical_quantity: number // العدد المعتاد في المهمة الواحدة
      size_specifications: array [string] // المقاسات المطلوبة
    }
  ]
  
  // قوالب المهام الجاهزة
  task_templates: array [
    {
      template_name: string
      default_quantity: number
      estimated_hours: number
      default_instructions: text
      checklist_items: array [string] // قائمة مراجعة
    }
  ]
  
  // إحصائيات الاستخدام
  usage_statistics: {
    total_tasks_created: number (default: 0)
    total_tasks_completed: number (default: 0)
    average_completion_time: number (hours, default: 0)
    average_quality_score: number (1.0-5.0, default: 0.0)
    most_used_by_brands: array [string] // أكثر البراندات استخداماً
    top_photographers: array [string] // أفضل المصورين في هذه الفئة
    
    // اتجاهات الاستخدام
    monthly_usage_trend: map {
      'YYYY-MM': number // عدد المهام شهرياً
    }
    
    // معدلات النجاح
    success_metrics: {
      completion_rate: number (0.0-1.0, default: 0.0)
      on_time_rate: number (0.0-1.0, default: 0.0)
      client_satisfaction: number (1.0-5.0, default: 0.0)
    }
  }
  
  // حالة الفئة
  status: enum ['active', 'inactive', 'deprecated'] // نشطة، غير نشطة، متروكة
  is_popular: boolean (default: false) // فئة شائعة أم لا
  is_seasonal: boolean (default: false) // فئة موسمية
  
  // معلومات موسمية (إذا كانت موسمية)
  seasonal_info: {
    peak_months: array [number] // الشهور الأكثر طلباً
    low_months: array [number] // الشهور الأقل طلباً
    seasonal_price_modifier: number (0.5-2.0, default: 1.0)
  }
  
  // التصنيفات والتاجات
  tags: array [string] // تاجات للبحث والتصنيف
  search_keywords: array [string] // كلمات مفتاحية للبحث
  
  // بيانات النظام
  created_at: timestamp
  updated_at: timestamp
  created_by: string (reference to users.id)
  last_updated_by: string (reference to users.id)
  
  // معلومات التحكم
  can_be_deleted: boolean (default: true) // هل يمكن حذف الفئة
  deletion_restrictions: array [string] // قيود الحذف إن وجدت
}

// Indexes المطلوبة:
- Single: name_ar
- Single: name_en
- Composite: (category_type, status)
- Single: parent_category_id
- Composite: (category_type, sort_order)
- Array: tags
- Array: search_keywords
- Single: is_popular
- Composite: (is_seasonal, status)
```

### 🎪 **جدول المعدات الديناميكي الشامل**
```sql
-- Collection: equipment
{
  id: string (auto-generated)
  
  // معلومات أساسية
  name_ar: string (indexed) // اسم المعدة بالعربية
  name_en: string (indexed) // اسم المعدة بالإنجليزية
  display_name: string // الاسم المعروض
  description: text
  
  // تصنيف المعدة
  equipment_category: enum [
    'camera_dslr',           // كاميرا DSLR
    'camera_mirrorless',     // كاميرا بدون مرآة
    'camera_cinema',         // كاميرا سينمائية
    'camera_phone',          // كاميرا هاتف
    'lens_wide',             // عدسة واسعة
    'lens_portrait',         // عدسة بورتريت
    'lens_macro',            // عدسة ماكرو
    'lens_telephoto',        // عدسة تيليفوتو
    'lighting_studio',       // إضاءة استوديو
    'lighting_led',          // إضاءة LED
    'lighting_natural',      // إضاءة طبيعية
    'lighting_flash',        // فلاش
    'audio_microphone',      // ميكروفون
    'audio_recorder',        // مسجل صوت
    'audio_headphones',      // سماعات
    'support_tripod',        // حامل ثلاثي
    'support_monopod',       // حامل أحادي
    'support_gimbal',        // جيمبال
    'support_slider',        // سلايدر
    'backdrop_white',        // خلفية بيضاء
    'backdrop_black',        // خلفية سوداء
    'backdrop_colored',      // خلفية ملونة
    'backdrop_custom',       // خلفية مخصصة
    'software_editing',      // برنامج تحرير
    'software_design',       // برنامج تصميم
    'computer_editing',      // جهاز تحرير
    'storage_card',          // كارت ذاكرة
    'storage_drive',         // قرص تخزين
    'accessory_battery',     // بطارية
    'accessory_charger',     // شاحن
    'accessory_cable',       // كابل
    'accessory_filter',      // فلتر
    'other'                  // أخرى
  ]
  
  // تصنيف فرعي
  subcategory: string (optional) // تصنيف أكثر تفصيلاً
  
  // المواصفات التقنية
  specifications: {
    brand: string (optional) // العلامة التجارية
    model: string (optional) // الموديل
    year: number (optional) // سنة الإصدار
    
    // مواصفات تقنية عامة
    technical_specs: map {
      resolution: string (optional) // دقة الكاميرا
      sensor_size: string (optional) // حجم المستشعر
      iso_range: string (optional) // مدى الآيزو
      battery_life: string (optional) // عمر البطارية
      weight: string (optional) // الوزن
      dimensions: string (optional) // الأبعاد
      connectivity: array [string] // أنواع التوصيل
      storage_type: string (optional) // نوع التخزين
      max_capacity: string (optional) // السعة القصوى
      power_consumption: string (optional) // استهلاك الطاقة
    }
    
    // ملاحظات تقنية
    technical_notes: text (optional)
    compatibility_notes: text (optional) // ملاحظات التوافق
  }
  
  // معلومات التوفر والملكية
  availability: {
    ownership_type: enum ['company_owned', 'photographer_owned', 'rental', 'client_provided']
    total_quantity: number (default: 1) // العدد الإجمالي المتوفر
    available_quantity: number (default: 1) // العدد المتوفر حالياً
    reserved_quantity: number (default: 0) // العدد المحجوز
    
    // مواقع التواجد
    locations: array [
      {
        location_name: string // اسم الموقع
        location_type: enum ['studio', 'office', 'photographer_home', 'storage', 'other']
        quantity_at_location: number
        contact_person: string (optional) // الشخص المسؤول
        notes: string (optional)
      }
    ]
    
    // معلومات الإيجار (إذا كانت للإيجار)
    rental_info: {
      rental_rate_hourly: number (optional)
      rental_rate_daily: number (optional)
      rental_rate_weekly: number (optional)
      security_deposit: number (optional)
      rental_terms: text (optional)
    }
  }
  
  // حالة المعدة
  condition: {
    overall_condition: enum ['excellent', 'very_good', 'good', 'fair', 'poor', 'needs_repair']
    condition_notes: text (optional)
    last_inspection_date: timestamp (optional)
    next_maintenance_date: timestamp (optional)
    
    // مشاكل معروفة
    known_issues: array [
      {
        issue_description: string
        severity: enum ['minor', 'moderate', 'major', 'critical']
        reported_date: timestamp
        reported_by: string (reference to users.id)
        status: enum ['reported', 'acknowledged', 'in_repair', 'resolved']
      }
    ]
  }
  
  // معلومات الصيانة
  maintenance: {
    last_maintenance_date: timestamp (optional)
    maintenance_frequency: enum ['weekly', 'monthly', 'quarterly', 'yearly', 'as_needed']
    maintenance_notes: text (optional)
    warranty_info: {
      has_warranty: boolean (default: false)
      warranty_expiry: timestamp (optional)
      warranty_provider: string (optional)
      warranty_terms: text (optional)
    }
    
    // سجل الصيانة
    maintenance_history: array [
      {
        maintenance_date: timestamp
        maintenance_type: enum ['routine', 'repair', 'upgrade', 'calibration']
        performed_by: string // اسم الفني أو الشركة
        cost: number (optional)
        description: text
        parts_replaced: array [string] (optional)
      }
    ]
  }
  
  // معلومات الشراء والمالية
  financial_info: {
    purchase_price: number (optional)
    purchase_date: timestamp (optional)
    purchased_from: string (optional) // المورد
    current_value: number (optional) // القيمة الحالية
    depreciation_rate: number (optional) // معدل الإهلاك السنوي
    
    // معلومات التأمين
    insurance_info: {
      is_insured: boolean (default: false)
      insurance_provider: string (optional)
      insurance_value: number (optional)
      insurance_expiry: timestamp (optional)
      policy_number: string (optional)
    }
  }
  
  // ارتباط بالفئات
  related_categories: array [string] (references to content_categories.id)
  is_essential_for_categories: array [string] // الفئات التي تعتبر هذه المعدة أساسية لها
  
  // متطلبات الاستخدام
  usage_requirements: {
    skill_level_required: enum ['beginner', 'intermediate', 'advanced', 'expert']
    training_required: boolean (default: false)
    certification_required: boolean (default: false)
    safety_notes: text (optional)
    handling_instructions: text (optional)
  }
  
  // تتبع الاستخدام
  usage_tracking: {
    total_usage_hours: number (default: 0)
    last_used_date: timestamp (optional)
    last_used_by: string (reference to users.id, optional)
    most_frequent_users: array [string] // أكثر المستخدمين
    
    // إحصائيات الاستخدام
    usage_statistics: {
      monthly_usage_hours: map {
        'YYYY-MM': number // ساعات الاستخدام شهرياً
      }
      breakdown_by_category: map {
        category_id: number // ساعات الاستخدام لكل فئة
      }
      utilization_rate: number (0.0-1.0, default: 0.0) // معدل الاستخدام
    }
  }
  
  // صور ومستندات
  media: {
    equipment_photos: array [string] (Storage URLs)
    manual_pdf: string (Storage URL, optional)
    specification_sheet: string (Storage URL, optional)
    tutorial_videos: array [string] (optional)
  }
  
  // حالة النشاط
  status: enum ['active', 'inactive', 'retired', 'sold', 'lost', 'stolen']
  is_available_for_booking: boolean (default: true)
  
  // ملاحظات وتعليقات
  notes: {
    admin_notes: text (ملاحظات إدارية)
    user_feedback: array [
      {
        user_id: string (reference to users.id)
        rating: number (1-5)
        comment: text
        date: timestamp
      }
    ]
    usage_tips: text (نصائح الاستخدام)
  }
  
  // بيانات النظام
  created_at: timestamp
  updated_at: timestamp
  created_by: string (reference to users.id)
  last_updated_by: string (reference to users.id)
}

// Indexes المطلوبة:
- Single: name_ar
- Single: name_en
- Single: equipment_category
- Composite: (equipment_category, status)
- Array: related_categories
- Array: is_essential_for_categories
- Single: is_available_for_booking
- Composite: (availability.ownership_type, status)
- Composite: (condition.overall_condition, status)
```

---

**🎯 نهاية الدفعة الثانية**  
**📋 المحتوى:** جداول البراندات والفئات والمعدات الديناميكية  
**⏭️ التالي:** جداول الحملات الذكية ونظام التوزيع المتطور

---

## 🚀 **الدفعة الثالثة - الحملات الذكية ونظام التوزيع المتطور (المميزة الثورية)**

### 🎯 **جدول الحملات الذكية (Core Innovation)**
```sql
-- Collection: smart_campaigns
{
  id: string (auto-generated)
  
  // معلومات أساسية للحملة
  campaign_name: string (indexed)
  campaign_description: text
  campaign_type: enum ['smart_auto', 'manual_guided', 'hybrid'] // ذكي تلقائي، يدوي موجه، هجين
  
  // مدخلات الحملة الأساسية
  campaign_inputs: {
    // الكمية الإجمالية
    total_quantity: number // 100 وحدة مثلاً
    
    // نوع توزيع الكمية
    quantity_distribution: {
      distribution_method: enum ['equal', 'weighted', 'custom', 'ai_optimized']
      
      // توزيع مخصص للفئات (إذا كان custom)
      custom_distribution: map {
        category_id: {
          requested_quantity: number
          priority_weight: number (1.0-5.0)
        }
      }
      
      // مرونة في التوزيع
      allow_ai_adjustments: boolean (default: true)
      max_deviation_percentage: number (0.0-0.5, default: 0.2) // 20% مرونة
    }
    
    // البراندات المستهدفة
    target_brands: array [
      {
        brand_id: string (reference to brands.id)
        allocation_percentage: number (0.0-1.0) // نسبة التخصيص
        priority_level: enum ['high', 'medium', 'low']
        special_requirements: text (optional)
        budget_limit: number (optional) // حد الميزانية لهذا البراند
      }
    ]
    
    // المصورين المتاحين
    available_photographers: array [
      {
        photographer_id: string (reference to users.id)
        is_preferred: boolean (default: false)
        max_workload_percentage: number (0.0-1.0, default: 1.0) // أقصى حمولة عمل
        exclusions: array [string] // فئات أو براندات مستبعدة
        special_rates: {
          rate_modifier: number (0.5-2.0, default: 1.0)
          bonus_eligible: boolean (default: true)
        }
      }
    ]
  }
  
  // الفترة الزمنية والجدولة
  scheduling: {
    // التواريخ الأساسية
    start_date: date
    end_date: date
    
    // ساعات العمل اليومية
    daily_work_hours: {
      start_time: string ('09:00') // وقت بداية العمل
      end_time: string ('18:00')   // وقت نهاية العمل
      timezone: string (default: 'Asia/Baghdad')
      
      // أيام العمل
      working_days: array [
        enum ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      ]
      
      // استثناءات الأيام
      excluded_dates: array [date] // أيام العطل
      special_working_dates: array [
        {
          date: date
          start_time: string
          end_time: string
          notes: string (optional)
        }
      ]
    }
    
    // مرونة الجدولة
    scheduling_flexibility: {
      allow_weekend_work: boolean (default: false)
      allow_overtime: boolean (default: false)
      max_daily_hours: number (default: 8)
      min_break_between_tasks: number (minutes, default: 30)
      allow_overlapping_tasks: boolean (default: false)
    }
    
    // أولويات الجدولة
    scheduling_priorities: array [
      enum [
        'deadline_first',     // الأولوية للمواعيد النهائية
        'brand_priority',     // الأولوية حسب أهمية البراند
        'efficiency_first',   // الأولوية للكفاءة
        'quality_first',      // الأولوية للجودة
        'photographer_preference', // الأولوية لتفضيلات المصور
        'equipment_availability',  // الأولوية لتوفر المعدات
        'location_optimization'    // الأولوية لتحسين المواقع
      ]
    ]
  }
  
  // إعدادات الذكاء الاصطناعي للتوزيع
  ai_distribution_settings: {
    // خوارزمية التوزيع المفضلة
    algorithm_preference: enum ['balanced', 'efficiency', 'quality', 'cost_optimized', 'custom']
    
    // معايير التحسين
    optimization_criteria: {
      time_efficiency_weight: number (0.0-1.0, default: 0.3)
      cost_optimization_weight: number (0.0-1.0, default: 0.2)
      quality_priority_weight: number (0.0-1.0, default: 0.3)
      photographer_satisfaction_weight: number (0.0-1.0, default: 0.2)
    }
    
    // إعدادات منع التضارب
    conflict_prevention: {
      prevent_time_conflicts: boolean (default: true)
      prevent_equipment_conflicts: boolean (default: true)
      prevent_location_conflicts: boolean (default: true)
      prevent_photographer_overload: boolean (default: true)
      
      // مسافة التنقل بين المواقع
      max_travel_time_between_tasks: number (minutes, default: 60)
      consider_traffic_patterns: boolean (default: true)
    }
    
    // تعلم آلي وتحسين
    machine_learning: {
      use_historical_data: boolean (default: true)
      adapt_to_photographer_performance: boolean (default: true)
      learn_from_feedback: boolean (default: true)
      auto_adjust_estimates: boolean (default: true)
    }
  }
  
  // حالة الحملة ومراحل التنفيذ
  campaign_status: enum [
    'draft',           // مسودة
    'planning',        // قيد التخطيط
    'ai_processing',   // معالجة AI
    'ready_for_review', // جاهز للمراجعة
    'approved',        // معتمد
    'active',          // نشط
    'paused',          // متوقف
    'completed',       // مكتمل
    'cancelled'        // ملغي
  ]
  
  // معلومات الموافقة
  approval_info: {
    requires_approval: boolean (default: true)
    approval_status: enum ['pending', 'approved', 'rejected', 'revision_requested']
    approved_by: string (reference to users.id, optional)
    approval_date: timestamp (optional)
    approval_notes: text (optional)
    
    // مستويات الموافقة
    approval_levels: array [
      {
        level_name: string // مثل: "موافقة المنسق"
        required_role: enum ['marketing_coordinator', 'brand_coordinator', 'super_admin']
        status: enum ['pending', 'approved', 'rejected']
        approved_by: string (reference to users.id, optional)
        approval_date: timestamp (optional)
        notes: text (optional)
      }
    ]
  }
  
  // التكلفة المتوقعة والفعلية
  financial_estimates: {
    // التكلفة المتوقعة
    estimated_total_cost: number
    estimated_photographer_payments: number
    estimated_equipment_costs: number
    estimated_travel_costs: number
    estimated_overhead_costs: number
    
    // التكلفة الفعلية (تحديث أثناء التنفيذ)
    actual_total_cost: number (default: 0)
    actual_photographer_payments: number (default: 0)
    actual_equipment_costs: number (default: 0)
    actual_travel_costs: number (default: 0)
    actual_overhead_costs: number (default: 0)
    
    // تكسير التكلفة حسب البراند
    cost_breakdown_by_brand: map {
      brand_id: {
        estimated_cost: number
        actual_cost: number
        percentage_of_total: number
      }
    }
  }
  
  // إحصائيات التقدم (تحديث مباشر)
  progress_statistics: {
    total_tasks_generated: number (default: 0)
    tasks_completed: number (default: 0)
    tasks_in_progress: number (default: 0)
    tasks_pending: number (default: 0)
    tasks_cancelled: number (default: 0)
    
    // نسب الإنجاز
    overall_completion_percentage: number (0.0-1.0, default: 0.0)
    on_schedule_percentage: number (0.0-1.0, default: 0.0)
    quality_score_average: number (1.0-5.0, default: 0.0)
    
    // تفصيل حسب البراند
    brand_progress: map {
      brand_id: {
        completed_tasks: number
        total_tasks: number
        completion_percentage: number
        average_quality_score: number
        on_time_delivery_rate: number
      }
    }
    
    // تفصيل حسب المصور
    photographer_progress: map {
      photographer_id: {
        assigned_tasks: number
        completed_tasks: number
        average_time_per_task: number (hours)
        quality_rating: number (1.0-5.0)
        on_time_rate: number (0.0-1.0)
      }
    }
  }
  
  // سجل نشاط الحملة
  activity_log: array [
    {
      timestamp: timestamp
      event_type: enum [
        'campaign_created', 'ai_distribution_completed', 'task_assigned',
        'task_completed', 'task_cancelled', 'conflict_detected',
        'conflict_resolved', 'schedule_updated', 'budget_updated'
      ]
      description: string
      performed_by: string (reference to users.id, optional)
      affected_entities: array [string] // IDs للمهام أو المصورين المتأثرين
      metadata: map // بيانات إضافية حسب نوع الحدث
    }
  ]
  
  // إعدادات الإشعارات
  notification_settings: {
    notify_on_milestones: boolean (default: true)
    milestone_percentages: array [number] // مثل: [25, 50, 75, 90, 100]
    
    notify_on_conflicts: boolean (default: true)
    notify_on_delays: boolean (default: true)
    notify_on_quality_issues: boolean (default: true)
    
    // مستلمي الإشعارات
    notification_recipients: array [
      {
        user_id: string (reference to users.id)
        notification_types: array [string] // أنواع الإشعارات المرغوبة
        delivery_method: enum ['email', 'sms', 'push', 'in_app']
      }
    ]
  }
  
  // بيانات النظام والتتبع
  created_at: timestamp
  updated_at: timestamp
  created_by: string (reference to users.id)
  last_updated_by: string (reference to users.id)
  
  // معلومات ختام الحملة
  completion_info: {
    actual_end_date: timestamp (optional)
    completion_notes: text (optional)
    final_report_generated: boolean (default: false)
    lessons_learned: text (optional)
    recommendations_for_future: text (optional)
  }
}

// Indexes المطلوبة:
- Single: campaign_name
- Composite: (campaign_status, created_at)
- Array: campaign_inputs.target_brands.brand_id
- Array: campaign_inputs.available_photographers.photographer_id
- Composite: (scheduling.start_date, scheduling.end_date)
- Single: created_by
```

### 📋 **جدول مهام الحملة المتطور**
```sql
-- Collection: campaign_tasks
{
  id: string (auto-generated)
  
  // ربط بالحملة والمعلومات الأساسية
  campaign_id: string (reference to smart_campaigns.id, indexed)
  task_sequence_number: number // رقم تسلسلي في الحملة
  
  // معلومات المهمة الأساسية
  task_info: {
    task_title: string
    task_description: text
    category_id: string (reference to content_categories.id)
    brand_id: string (reference to brands.id)
    
    // الكمية والتفاصيل
    quantity: number // عدد القطع المطلوبة
    content_type: enum ['photo', 'video', 'design', 'mixed']
    quality_level: enum ['standard', 'premium', 'luxury']
    urgency_level: enum ['normal', 'urgent', 'rush']
  }
  
  // تخصيص المصور والموافقة
  assignment: {
    assigned_photographer: string (reference to users.id, indexed)
    assignment_method: enum ['ai_auto', 'manual', 'photographer_choice']
    assignment_date: timestamp
    assigned_by: string (reference to users.id)
    
    // حالة قبول المهمة
    acceptance_status: enum ['pending', 'accepted', 'declined', 'negotiating']
    photographer_response_date: timestamp (optional)
    photographer_notes: text (optional) // ملاحظات المصور عند القبول/الرفض
    
    // معلومات إعادة التخصيص (إذا رُفضت)
    reassignment_history: array [
      {
        previous_photographer: string (reference to users.id)
        decline_reason: string
        decline_date: timestamp
        new_assignment_date: timestamp
      }
    ]
  }
  
  // الجدولة الزمنية المتطورة
  scheduling: {
    // الوقت المخطط له
    scheduled_start_time: timestamp
    scheduled_end_time: timestamp
    estimated_duration: number (hours)
    
    // الوقت الفعلي
    actual_start_time: timestamp (optional)
    actual_end_time: timestamp (optional)
    actual_duration: number (hours, optional)
    
    // مرونة التوقيت
    can_be_rescheduled: boolean (default: true)
    earliest_possible_start: timestamp
    latest_acceptable_end: timestamp
    
    // إدارة تعديل الجدولة
    schedule_changes: array [
      {
        change_date: timestamp
        old_start_time: timestamp
        old_end_time: timestamp
        new_start_time: timestamp
        new_end_time: timestamp
        change_reason: string
        changed_by: string (reference to users.id)
        photographer_approval: boolean
      }
    ]
  }
  
  // المعدات المطلوبة والمحجوزة
  equipment_requirements: {
    required_equipment: array [
      {
        equipment_id: string (reference to equipment.id)
        is_mandatory: boolean
        alternative_equipment: array [string] // معدات بديلة
        reservation_status: enum ['pending', 'reserved', 'confirmed', 'unavailable']
        reserved_from: timestamp (optional)
        reserved_until: timestamp (optional)
      }
    ]
    
    // حالة توفر المعدات
    equipment_availability_confirmed: boolean (default: false)
    equipment_conflicts: array [
      {
        equipment_id: string
        conflict_description: string
        conflict_resolution: string (optional)
        resolved: boolean (default: false)
      }
    ]
  }
  
  // الموقع ومعلومات التصوير
  location_info: {
    location_type: enum ['studio', 'client_location', 'outdoor', 'travel', 'home', 'virtual']
    
    // تفاصيل الموقع
    location_details: {
      address: string (optional)
      coordinates: {
        latitude: number (optional)
        longitude: number (optional)
      }
      location_name: string (optional)
      special_instructions: text (optional)
      contact_person: string (optional)
      contact_phone: string (optional)
    }
    
    // تقدير المسافة والسفر
    travel_info: {
      distance_from_previous_task: number (kilometers, optional)
      estimated_travel_time: number (minutes, optional)
      travel_cost: number (optional)
      transportation_method: enum ['car', 'public', 'walking', 'other']
    }
  }
  
  // السعر والحسابات المالية
  pricing: {
    // السعر الأساسي المحسوب
    base_price: number
    
    // معاملات التعديل المطبقة
    applied_modifiers: {
      location_modifier: number (1.0-2.0)
      quality_modifier: number (1.0-1.5)
      urgency_modifier: number (1.0-2.0)
      quantity_modifier: number (0.5-1.0) // خصم الكمية
      brand_modifier: number (0.8-1.3) // تعديل خاص بالبراند
      photographer_skill_modifier: number (0.8-1.5)
    }
    
    // السعر النهائي
    final_price: number // بعد تطبيق جميع المعاملات
    
    // توزيع الدفع
    payment_breakdown: {
      photographer_payment: number // للمصور الفريلانسر
      equipment_cost: number // تكلفة المعدات
      travel_allowance: number // بدل السفر
      overhead_cost: number // تكاليف إضافية
    }
    
    // حالة الدفع
    payment_status: enum ['pending', 'approved', 'paid', 'disputed']
    payment_date: timestamp (optional)
  }
  
  // حالة المهمة ومراحل التنفيذ
  task_status: enum [
    'scheduled',        // مجدولة
    'notified',        // تم إشعار المصور
    'accepted',        // مقبولة من المصور
    'in_preparation',  // قيد التحضير
    'in_progress',     // قيد التنفيذ
    'completed',       // مكتملة
    'under_review',    // قيد المراجعة
    'revision_required', // تحتاج تعديل
    'approved',        // معتمدة
    'cancelled',       // ملغية
    'failed'          // فاشلة
  ]
  
  // تفاصيل التنفيذ
  execution_details: {
    // ملفات المحتوى المنتج
    produced_content: array [
      {
        file_url: string (Storage URL)
        file_type: enum ['photo', 'video', 'design', 'other']
        file_size: number (bytes)
        file_format: string
        upload_date: timestamp
        processing_status: enum ['raw', 'edited', 'final']
        quality_score: number (1.0-5.0, optional)
      }
    ]
    
    // ملاحظات التنفيذ
    photographer_notes: text (optional) // ملاحظات المصور أثناء التنفيذ
    execution_challenges: text (optional) // تحديات واجهها المصور
    client_feedback: text (optional) // ملاحظات العميل
    
    // قياس الجودة
    quality_assessment: {
      technical_quality: number (1.0-5.0, optional)
      creative_quality: number (1.0-5.0, optional)
      brand_compliance: number (1.0-5.0, optional)
      overall_satisfaction: number (1.0-5.0, optional)
      reviewed_by: string (reference to users.id, optional)
      review_date: timestamp (optional)
      review_notes: text (optional)
    }
  }
  
  // إدارة التعديلات والمراجعات
  revisions: {
    revision_count: number (default: 0)
    max_allowed_revisions: number (default: 3)
    
    revision_history: array [
      {
        revision_number: number
        requested_date: timestamp
        requested_by: string (reference to users.id)
        revision_description: text
        revision_deadline: timestamp
        completion_date: timestamp (optional)
        status: enum ['pending', 'in_progress', 'completed', 'declined']
        photographer_response: text (optional)
      }
    ]
  }
  
  // نظام الإشعارات للمهمة
  notifications: {
    // إشعارات مرسلة
    sent_notifications: array [
      {
        notification_type: enum [
          'task_assigned', 'deadline_reminder', 'schedule_change',
          'equipment_ready', 'client_feedback', 'payment_ready'
        ]
        recipient: string (reference to users.id)
        sent_date: timestamp
        delivery_method: enum ['email', 'sms', 'push', 'in_app']
        read_status: boolean (default: false)
        read_date: timestamp (optional)
      }
    ]
    
    // إشعارات مجدولة
    scheduled_notifications: array [
      {
        notification_type: string
        scheduled_time: timestamp
        recipient: string (reference to users.id)
        is_sent: boolean (default: false)
        message_content: text
      }
    ]
  }
  
  // إدارة التضارب والمشاكل
  conflicts_and_issues: {
    // التضاربات المكتشفة
    detected_conflicts: array [
      {
        conflict_id: string
        conflict_type: enum [
          'time_overlap', 'equipment_unavailable', 'location_conflict',
          'photographer_overload', 'budget_exceeded'
        ]
        conflict_description: string
        detected_date: timestamp
        severity: enum ['low', 'medium', 'high', 'critical']
        
        // حل التضارب
        resolution_status: enum ['unresolved', 'in_progress', 'resolved', 'accepted_risk']
        resolution_description: string (optional)
        resolved_date: timestamp (optional)
        resolved_by: string (reference to users.id, optional)
      }
    ]
    
    // مشاكل أخرى
    reported_issues: array [
      {
        issue_type: enum ['quality', 'delay', 'communication', 'technical', 'other']
        issue_description: text
        reported_by: string (reference to users.id)
        reported_date: timestamp
        priority: enum ['low', 'medium', 'high', 'urgent']
        status: enum ['open', 'investigating', 'resolved', 'closed']
        resolution_notes: text (optional)
      }
    ]
  }
  
  // بيانات النظام والتتبع
  created_at: timestamp
  updated_at: timestamp
  last_activity: timestamp // آخر تحديث أو نشاط على المهمة
  
  // حفظ النسخة الأصلية من AI
  ai_generation_data: {
    ai_confidence_score: number (0.0-1.0) // مدى ثقة AI في هذا التخصيص
    alternative_suggestions: array [
      {
        photographer_id: string
        confidence_score: number
        reasoning: string
      }
    ]
    generation_algorithm: string // نوع الخوارزمية المستخدمة
    generation_timestamp: timestamp
  }
}

// Indexes المطلوبة:
- Single: campaign_id
- Composite: (campaign_id, task_sequence_number)
- Single: assignment.assigned_photographer
- Composite: (assignment.assigned_photographer, task_status)
- Composite: (task_info.brand_id, task_status)
- Composite: (task_info.category_id, task_status)
- Composite: (scheduling.scheduled_start_time, task_status)
- Single: task_status
- Composite: (assignment.acceptance_status, scheduling.scheduled_start_time)
```

### 🔔 **جدول إشعارات الحملة الذكية**
```sql
-- Collection: campaign_notifications
{
  id: string (auto-generated)
  
  // ربط بالحملة والمهمة
  campaign_id: string (reference to smart_campaigns.id, indexed)
  task_id: string (reference to campaign_tasks.id, optional, indexed)
  
  // معلومات الإشعار
  notification_info: {
    notification_type: enum [
      // إشعارات المهام
      'task_assigned',           // مهمة جديدة مخصصة
      'task_reminder_24h',       // تذكير قبل 24 ساعة
      'task_reminder_2h',        // تذكير قبل ساعتين
      'task_started',            // بدء تنفيذ المهمة
      'task_completed',          // إكمال المهمة
      'task_cancelled',          // إلغاء المهمة
      'task_rescheduled',        // تعديل جدولة المهمة
      'task_revision_requested', // طلب تعديل
      
      // إشعارات الحملة
      'campaign_started',        // بداية الحملة
      'campaign_milestone',      // إنجاز معلم هام (25%, 50%, 75%)
      'campaign_completed',      // إكمال الحملة
      'campaign_delayed',        // تأخير في الحملة
      'campaign_budget_alert',   // تجاوز الميزانية
      
      // إشعارات التضارب
      'conflict_detected',       // اكتشاف تضارب
      'conflict_resolved',       // حل التضارب
      'equipment_unavailable',   // عدم توفر معدات
      'schedule_conflict',       // تضارب في الجدولة
      
      // إشعارات الجودة
      'quality_issue',           // مشكلة في الجودة
      'content_approved',        // موافقة على المحتوى
      'content_rejected',        // رفض المحتوى
      
      // إشعارات مالية
      'payment_ready',           // الدفعة جاهزة
      'payment_processed',       // تم معالجة الدفعة
      'budget_exceeded'          // تجاوز الميزانية
    ]
    
    priority_level: enum ['low', 'medium', 'high', 'urgent']
    title: string // عنوان الإشعار
    message: text // محتوى الإشعار
    action_required: boolean (default: false) // هل يتطلب إجراء
    
    // تفاصيل الإجراء المطلوب
    required_action: {
      action_type: enum ['accept_task', 'review_content', 'resolve_conflict', 'update_schedule', 'other']
      action_deadline: timestamp (optional)
      action_url: string (optional) // رابط للإجراء
      action_data: map (optional) // بيانات إضافية للإجراء
    }
  }
  
  // المرسل والمستقبل
  sender_info: {
    sender_type: enum ['system', 'user', 'ai_agent']
    sender_id: string (reference to users.id, optional) // إذا كان من مستخدم
    sender_name: string // اسم المرسل للعرض
  }
  
  recipient_info: {
    recipient_id: string (reference to users.id, indexed)
    recipient_role: enum ['photographer', 'brand_coordinator', 'marketing_coordinator', 'super_admin']
    
    // طريقة التوصيل
    delivery_methods: array [
      {
        method: enum ['email', 'sms', 'push_notification', 'in_app', 'whatsapp']
        status: enum ['pending', 'sent', 'delivered', 'failed', 'read']
        sent_at: timestamp (optional)
        delivered_at: timestamp (optional)
        read_at: timestamp (optional)
        failure_reason: string (optional)
      }
    ]
  }
  
  // حالة الإشعار
  notification_status: {
    overall_status: enum ['pending', 'sent', 'delivered', 'read', 'acted_upon', 'expired']
    is_read: boolean (default: false)
    read_at: timestamp (optional)
    
    // الإجراء المتخذ
    action_taken: {
      action_performed: boolean (default: false)
      action_date: timestamp (optional)
      action_description: string (optional)
      action_result: enum ['accepted', 'rejected', 'completed', 'failed']
    }
  }
  
  // إعدادات التكرار والمتابعة
  follow_up: {
    is_recurring: boolean (default: false)
    recurrence_pattern: enum ['none', 'daily', 'weekly', 'before_deadline']
    
    // إشعارات المتابعة
    follow_up_notifications: array [
      {
        follow_up_time: timestamp
        follow_up_message: text
        is_sent: boolean (default: false)
        escalation_level: enum ['normal', 'escalated', 'urgent']
      }
    ]
    
    // تصعيد الإشعار
    escalation_rules: {
      escalate_after: number (hours, optional) // تصعيد بعد كم ساعة
      escalate_to: string (reference to users.id, optional)
      escalation_message: text (optional)
    }
  }
  
  // البيانات المرتبطة
  related_data: {
    // إشارات لكيانات أخرى
    related_brand_id: string (reference to brands.id, optional)
    related_photographer_id: string (reference to users.id, optional)
    related_equipment_ids: array [string] (optional)
    
    // بيانات إضافية للإشعار
    metadata: map {
      // مثل: progress_percentage, budget_amount, deadline_date
    }
    
    // مرفقات
    attachments: array [
      {
        file_url: string (Storage URL)
        file_name: string
        file_type: string
        file_size: number (bytes)
      }
    ]
  }
  
  // تتبع التفاعل
  interaction_tracking: {
    view_count: number (default: 0)
    last_viewed: timestamp (optional)
    
    // تفاعلات المستخدم
    user_interactions: array [
      {
        interaction_type: enum ['viewed', 'clicked', 'dismissed', 'shared', 'replied']
        interaction_time: timestamp
        interaction_data: map (optional)
      }
    ]
  }
  
  // بيانات النظام
  created_at: timestamp
  updated_at: timestamp
  expires_at: timestamp (optional) // متى ينتهي صلاحية الإشعار
  
  // إعدادات العرض
  display_settings: {
    show_in_dashboard: boolean (default: true)
    show_in_mobile: boolean (default: true)
    highlight_color: string (optional) // لون التمييز
    icon: string (optional) // أيقونة مخصصة
  }
}

// Indexes المطلوبة:
- Single: campaign_id
- Single: task_id
- Composite: (recipient_info.recipient_id, notification_status.overall_status)
- Composite: (notification_info.notification_type, created_at)
- Composite: (notification_info.priority_level, notification_status.is_read)
- Composite: (created_at, expires_at)
- Single: notification_status.overall_status
```

---

**🎯 نهاية الدفعة الثالثة**  
**📋 المحتوى:** الحملات الذكية ونظام التوزيع المتطور مع منع التضارب  
**⏭️ التالي:** مسارات API الشاملة ونظام إدارة المحتوى والتقارير

---

## 📊 **الدفعة الرابعة - API Routes وإدارة المحتوى والتقارير**

### 📁 **جدول إدارة المحتوى المنتج**
```sql
-- Collection: content_library
{
  id: string (auto-generated)
  
  // ربط بالمهمة والحملة
  task_id: string (reference to campaign_tasks.id, indexed)
  campaign_id: string (reference to smart_campaigns.id, indexed)
  brand_id: string (reference to brands.id, indexed)
  category_id: string (reference to content_categories.id, indexed)
  
  // معلومات المحتوى الأساسية
  content_info: {
    title: string
    description: text (optional)
    content_type: enum ['photo', 'video', 'design', 'animation', 'document', 'other']
    file_format: string // JPG, PNG, MP4, PDF, etc.
    
    // تصنيفات المحتوى
    content_tags: array [string] // تاجات للبحث
    content_style: enum ['product', 'lifestyle', 'portrait', 'landscape', 'commercial', 'artistic']
    target_platform: array [
      enum ['instagram_post', 'instagram_story', 'facebook_post', 'tiktok', 'website', 'print', 'other']
    ]
  }
  
  // الملفات والإصدارات
  file_versions: array [
    {
      version_number: number // 1, 2, 3...
      version_type: enum ['raw', 'edited', 'final', 'web_optimized', 'print_ready']
      file_url: string (Cloud Storage URL)
      file_size: number (bytes)
      dimensions: string // مثل: "1920x1080"
      resolution: string // مثل: "300 DPI"
      color_profile: string // sRGB, Adobe RGB
      
      // معلومات التحرير
      editing_software: string (optional)
      editing_notes: text (optional)
      filter_effects: array [string] (optional)
      
      // معلومات النشر
      uploaded_at: timestamp
      uploaded_by: string (reference to users.id)
      file_status: enum ['draft', 'review', 'approved', 'rejected', 'published', 'archived']
    }
  ]
  
  // ميتاداتا الصورة/الفيديو
  technical_metadata: {
    // بيانات الكاميرا (EXIF)
    camera_info: {
      camera_make: string (optional)
      camera_model: string (optional)
      lens_info: string (optional)
      focal_length: string (optional)
      aperture: string (optional)
      shutter_speed: string (optional)
      iso: string (optional)
      flash_used: boolean (optional)
    }
    
    // بيانات الموقع
    location_metadata: {
      gps_coordinates: {
        latitude: number (optional)
        longitude: number (optional)
      }
      location_name: string (optional)
      shooting_date: timestamp (optional)
      weather_conditions: string (optional)
    }
    
    // بيانات تقنية للفيديو
    video_metadata: {
      duration: number (seconds, optional)
      frame_rate: string (optional)
      codec: string (optional)
      bitrate: string (optional)
      audio_info: string (optional)
    }
  }
  
  // حقوق الملكية والاستخدام
  rights_and_usage: {
    photographer_id: string (reference to users.id)
    copyright_owner: enum ['photographer', 'brand', 'shared', 'client']
    usage_rights: array [
      enum ['commercial', 'editorial', 'social_media', 'print', 'web', 'unlimited']
    ]
    license_type: enum ['exclusive', 'non_exclusive', 'buyout', 'limited']
    license_duration: string (optional) // مدة الترخيص
    restrictions: text (optional) // قيود الاستخدام
    
    // معلومات النموذج (إذا وجد أشخاص)
    model_releases: array [
      {
        model_name: string
        release_signed: boolean
        release_date: timestamp (optional)
        release_document_url: string (Storage URL, optional)
      }
    ]
  }
  
  // مراجعة وموافقة المحتوى
  review_process: {
    current_review_status: enum ['pending', 'in_review', 'approved', 'rejected', 'revision_requested']
    
    // سجل المراجعات
    review_history: array [
      {
        review_id: string
        reviewer_id: string (reference to users.id)
        reviewer_role: enum ['brand_coordinator', 'marketing_coordinator', 'client', 'creative_director']
        review_date: timestamp
        review_status: enum ['approved', 'rejected', 'revision_requested']
        
        // تفاصيل المراجعة
        quality_scores: {
          technical_quality: number (1.0-5.0)
          creative_quality: number (1.0-5.0)
          brand_compliance: number (1.0-5.0)
          message_clarity: number (1.0-5.0)
          overall_rating: number (1.0-5.0)
        }
        
        feedback: {
          positive_feedback: text (optional)
          areas_for_improvement: text (optional)
          specific_revisions: text (optional)
          approval_notes: text (optional)
        }
        
        // المرفقات
        review_attachments: array [
          {
            attachment_url: string (Storage URL)
            attachment_type: enum ['annotated_image', 'reference', 'document']
            description: string (optional)
          }
        ]
      }
    ]
  }
  
  // الاستخدام والنشر
  usage_tracking: {
    // منصات النشر
    published_platforms: array [
      {
        platform: string
        published_date: timestamp
        post_url: string (optional)
        engagement_metrics: {
          views: number (optional)
          likes: number (optional)
          comments: number (optional)
          shares: number (optional)
          reach: number (optional)
        }
        performance_notes: text (optional)
      }
    ]
    
    // إحصائيات الاستخدام
    usage_statistics: {
      total_downloads: number (default: 0)
      total_views: number (default: 0)
      last_accessed: timestamp (optional)
      most_accessed_version: number (optional)
      
      // الاستخدام حسب القسم
      usage_by_department: map {
        department: number // عدد مرات الاستخدام
      }
    }
  }
  
  // الذكاء الاصطناعي والتحليل
  ai_analysis: {
    // تحليل المحتوى البصري
    visual_analysis: {
      dominant_colors: array [string] // الألوان السائدة
      detected_objects: array [string] // الكائنات المكتشفة
      facial_detection: {
        faces_detected: number
        emotions_detected: array [string]
        age_estimation: array [string] (optional)
      }
      composition_score: number (1.0-5.0, optional)
      lighting_quality: enum ['poor', 'fair', 'good', 'excellent']
    }
    
    // تحليل توافق البراند
    brand_compliance: {
      color_compliance_score: number (0.0-1.0)
      style_compliance_score: number (0.0-1.0)
      logo_visibility: enum ['not_visible', 'visible', 'prominent']
      brand_guidelines_adherence: number (1.0-5.0)
      compliance_notes: text (optional)
    }
    
    // اقتراحات التحسين
    ai_suggestions: {
      improvement_suggestions: array [string]
      alternative_crops: array [string] (Storage URLs)
      color_corrections: array [string]
      style_recommendations: array [string]
    }
  }
  
  // البحث والفهرسة
  search_metadata: {
    keywords: array [string] // كلمات مفتاحية للبحث
    auto_generated_keywords: array [string] // مولدة بواسطة AI
    description_searchable: text // نص قابل للبحث
    
    // فهرسة متقدمة
    indexing_data: {
      primary_subject: string // الموضوع الرئيسي
      secondary_subjects: array [string]
      mood: array [string] // المزاج والإحساس
      style_tags: array [string] // تاجات الأسلوب
      technical_tags: array [string] // تاجات تقنية
    }
  }
  
  // حالة المحتوى
  content_status: enum ['active', 'archived', 'deleted', 'private', 'expired']
  
  // بيانات النظام
  created_at: timestamp
  updated_at: timestamp
  archived_at: timestamp (optional)
  
  // إحصائيات الأداء
  performance_metrics: {
    engagement_score: number (1.0-5.0, default: 0.0)
    conversion_rate: number (0.0-1.0, optional)
    roi_estimate: number (optional)
    client_satisfaction_score: number (1.0-5.0, optional)
  }
}

// Indexes المطلوبة:
- Single: task_id
- Single: campaign_id
- Composite: (brand_id, content_status)
- Composite: (category_id, created_at)
- Array: content_info.content_tags
- Array: search_metadata.keywords
- Composite: (review_process.current_review_status, created_at)
- Single: rights_and_usage.photographer_id
- Composite: (content_info.content_type, content_status)
```

### 💰 **جدول المدفوعات والمحاسبة**
```sql
-- Collection: payments
{
  id: string (auto-generated)
  
  // ربط بالمهمة والمصور
  task_id: string (reference to campaign_tasks.id, indexed)
  campaign_id: string (reference to smart_campaigns.id, indexed)
  photographer_id: string (reference to users.id, indexed)
  brand_id: string (reference to brands.id, indexed)
  
  // معلومات الدفعة
  payment_info: {
    payment_type: enum ['task_payment', 'bonus', 'expense_reimbursement', 'advance', 'penalty_deduction']
    amount: number
    currency: string (default: 'IQD')
    
    // تفاصيل الحساب
    calculation_breakdown: {
      base_amount: number // المبلغ الأساسي
      bonuses: array [
        {
          bonus_type: enum ['quality', 'on_time', 'early_delivery', 'client_satisfaction', 'loyalty']
          bonus_amount: number
          bonus_percentage: number
          description: string
        }
      ]
      deductions: array [
        {
          deduction_type: enum ['late_delivery', 'quality_issue', 'revision_cost', 'equipment_damage']
          deduction_amount: number
          description: string
        }
      ]
      taxes: number (optional)
      final_amount: number // المبلغ النهائي
    }
  }
  
  // حالة الدفع
  payment_status: enum ['pending', 'approved', 'processing', 'paid', 'failed', 'cancelled', 'disputed']
  
  // تواريخ مهمة
  dates: {
    created_date: timestamp
    approved_date: timestamp (optional)
    processing_date: timestamp (optional)
    paid_date: timestamp (optional)
    due_date: timestamp (optional)
  }
  
  // معلومات الدفع
  payment_method: {
    method_type: enum ['bank_transfer', 'cash', 'digital_wallet', 'check', 'mobile_payment']
    bank_info: {
      bank_name: string (optional)
      account_number: string (encrypted, optional)
      iban: string (optional)
      swift_code: string (optional)
    }
    digital_wallet_info: {
      wallet_type: string (optional)
      wallet_number: string (optional)
    }
    reference_number: string (optional) // رقم المرجع
    transaction_id: string (optional) // معرف المعاملة
  }
  
  // الموافقات
  approvals: {
    requires_approval: boolean (default: true)
    approval_level: enum ['coordinator', 'manager', 'finance', 'admin']
    approved_by: string (reference to users.id, optional)
    approval_notes: text (optional)
    
    // سجل الموافقات
    approval_history: array [
      {
        approved_by: string (reference to users.id)
        approval_date: timestamp
        approval_status: enum ['approved', 'rejected', 'pending_info']
        notes: text (optional)
      }
    ]
  }
  
  // المستندات والإيصالات
  documents: {
    invoice_url: string (Storage URL, optional)
    receipt_url: string (Storage URL, optional)
    tax_certificate_url: string (Storage URL, optional)
    additional_documents: array [
      {
        document_name: string
        document_url: string (Storage URL)
        document_type: enum ['invoice', 'receipt', 'contract', 'tax_doc', 'other']
      }
    ]
  }
  
  // إشعارات الدفع
  notifications: {
    photographer_notified: boolean (default: false)
    admin_notified: boolean (default: false)
    notification_dates: {
      photographer_notification: timestamp (optional)
      admin_notification: timestamp (optional)
      reminder_sent: timestamp (optional)
    }
  }
  
  // بيانات النظام
  created_at: timestamp
  updated_at: timestamp
  created_by: string (reference to users.id)
  processed_by: string (reference to users.id, optional)
}

// Indexes المطلوبة:
- Single: task_id
- Single: photographer_id
- Composite: (photographer_id, payment_status)
- Composite: (brand_id, dates.created_date)
- Composite: (payment_status, dates.due_date)
- Single: campaign_id
```

### 📈 **مسارات API الشاملة**

#### 🔐 **Authentication & Authorization**
```javascript
// Firebase Authentication Integration
POST   /api/auth/login
POST   /api/auth/register  
POST   /api/auth/logout
POST   /api/auth/refresh-token
GET    /api/auth/profile
PUT    /api/auth/profile
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-phone
POST   /api/auth/resend-verification

// Dynamic Permissions
GET    /api/permissions/user/{userId}
PUT    /api/permissions/user/{userId}
GET    /api/permissions/roles
POST   /api/permissions/grant
DELETE /api/permissions/revoke
GET    /api/permissions/check/{permission}
```

#### 👥 **Users & Profiles Management**
```javascript
// Users CRUD
GET    /api/users                    // List with filtering
GET    /api/users/{id}               // Get single user
PUT    /api/users/{id}               // Update user
DELETE /api/users/{id}               // Soft delete
POST   /api/users/{id}/activate      // Activate user
POST   /api/users/{id}/deactivate    // Deactivate user

// Photographer Profiles
GET    /api/photographers            // List all photographers
GET    /api/photographers/{id}       // Get photographer profile
PUT    /api/photographers/{id}       // Update photographer profile
GET    /api/photographers/available  // Get available photographers
GET    /api/photographers/{id}/performance // Performance stats
GET    /api/photographers/{id}/schedule    // Get schedule
PUT    /api/photographers/{id}/availability // Update availability

// Brand Coordinators
GET    /api/coordinators             // List coordinators
GET    /api/coordinators/{id}        // Get coordinator
PUT    /api/coordinators/{id}        // Update coordinator
GET    /api/coordinators/brand/{brandId} // Get brand coordinators
```

#### 🏢 **Brands Management**
```javascript
// Brands CRUD
GET    /api/brands                   // List with pagination & filters
POST   /api/brands                   // Create new brand
GET    /api/brands/{id}              // Get brand details
PUT    /api/brands/{id}              // Update brand
DELETE /api/brands/{id}              // Archive brand
POST   /api/brands/{id}/activate     // Activate brand
GET    /api/brands/{id}/stats        // Brand statistics

// Brand Settings
GET    /api/brands/{id}/visual-identity    // Get visual identity
PUT    /api/brands/{id}/visual-identity    // Update visual identity
GET    /api/brands/{id}/pricing            // Get pricing settings
PUT    /api/brands/{id}/pricing            // Update pricing
GET    /api/brands/{id}/coordinators       // Get brand coordinators
PUT    /api/brands/{id}/coordinators       // Assign coordinators
```

#### 📂 **Categories & Equipment**
```javascript
// Categories Management
GET    /api/categories               // Hierarchical list
POST   /api/categories               // Create category
GET    /api/categories/{id}          // Get category
PUT    /api/categories/{id}          // Update category
DELETE /api/categories/{id}          // Delete category
GET    /api/categories/tree          // Get category tree
GET    /api/categories/{id}/pricing  // Get category pricing

// Equipment Management
GET    /api/equipment                // List equipment
POST   /api/equipment                // Add equipment
GET    /api/equipment/{id}           // Get equipment details
PUT    /api/equipment/{id}           // Update equipment
DELETE /api/equipment/{id}           // Remove equipment
GET    /api/equipment/available      // Available equipment
POST   /api/equipment/{id}/reserve   // Reserve equipment
POST   /api/equipment/{id}/release   // Release equipment
GET    /api/equipment/{id}/schedule  // Equipment schedule
```

#### 🚀 **Smart Campaigns (الميزة الثورية)**
```javascript
// Campaign Creation & Management
POST   /api/campaigns                // Create new campaign
GET    /api/campaigns                // List campaigns
GET    /api/campaigns/{id}           // Get campaign details
PUT    /api/campaigns/{id}           // Update campaign
DELETE /api/campaigns/{id}           // Cancel campaign

// AI Distribution Engine
POST   /api/campaigns/{id}/ai-distribute    // Trigger AI distribution
GET    /api/campaigns/{id}/distribution     // Get distribution results
PUT    /api/campaigns/{id}/adjust-distribution // Manual adjustments
POST   /api/campaigns/{id}/regenerate       // Regenerate distribution

// Campaign Execution
POST   /api/campaigns/{id}/start            // Start campaign
POST   /api/campaigns/{id}/pause            // Pause campaign
POST   /api/campaigns/{id}/resume           // Resume campaign
GET    /api/campaigns/{id}/progress         // Real-time progress
GET    /api/campaigns/{id}/conflicts        // Detected conflicts
POST   /api/campaigns/{id}/resolve-conflict // Resolve conflict

// Approval Workflow
POST   /api/campaigns/{id}/submit-approval  // Submit for approval
POST   /api/campaigns/{id}/approve          // Approve campaign
POST   /api/campaigns/{id}/reject           // Reject campaign
GET    /api/campaigns/{id}/approval-status  // Approval status
```

#### 📋 **Tasks Management**
```javascript
// Task CRUD
GET    /api/tasks                    // List tasks with filters
GET    /api/tasks/{id}               // Get task details
PUT    /api/tasks/{id}               // Update task
DELETE /api/tasks/{id}               // Cancel task

// Task Assignment
POST   /api/tasks/{id}/assign        // Assign to photographer
POST   /api/tasks/{id}/accept        // Photographer accepts
POST   /api/tasks/{id}/decline       // Photographer declines
POST   /api/tasks/{id}/reassign      // Reassign task

// Task Execution
POST   /api/tasks/{id}/start         // Start task execution
POST   /api/tasks/{id}/complete      // Mark as completed
POST   /api/tasks/{id}/submit-content // Submit content
GET    /api/tasks/{id}/conflicts     // Check conflicts
POST   /api/tasks/{id}/reschedule    // Reschedule task

// Photographer APIs
GET    /api/photographer/tasks       // My assigned tasks
GET    /api/photographer/schedule    // My schedule
POST   /api/photographer/availability // Update availability
GET    /api/photographer/earnings    // Earnings dashboard
```

#### 📁 **Content Management**
```javascript
// Content Library
GET    /api/content                  // Browse content library
POST   /api/content                  // Upload new content
GET    /api/content/{id}             // Get content details
PUT    /api/content/{id}             // Update content metadata
DELETE /api/content/{id}             // Archive content

// Content Review
GET    /api/content/pending-review   // Content awaiting review
POST   /api/content/{id}/review      // Submit review
POST   /api/content/{id}/approve     // Approve content
POST   /api/content/{id}/reject      // Reject content
POST   /api/content/{id}/request-revision // Request revision

// Content Search & AI
GET    /api/content/search           // Advanced search
POST   /api/content/{id}/ai-analyze  // AI analysis
GET    /api/content/{id}/suggestions // AI suggestions
GET    /api/content/similar          // Find similar content
```

#### 💰 **Payments & Financial**
```javascript
// Payments Management
GET    /api/payments                 // List payments
POST   /api/payments                 // Create payment
GET    /api/payments/{id}            // Get payment details
PUT    /api/payments/{id}            // Update payment
POST   /api/payments/{id}/approve    // Approve payment
POST   /api/payments/{id}/process    // Process payment

// Financial Reports
GET    /api/reports/financial        // Financial overview
GET    /api/reports/photographer-earnings // Photographer earnings
GET    /api/reports/brand-spending   // Brand spending analysis
GET    /api/reports/cost-breakdown   // Cost breakdown
GET    /api/exports/payments         // Export payments data
```

#### 🔔 **Notifications System**
```javascript
// Notifications Management
GET    /api/notifications            // Get user notifications
POST   /api/notifications            // Send notification
PUT    /api/notifications/{id}/read  // Mark as read
DELETE /api/notifications/{id}       // Delete notification
POST   /api/notifications/mark-all-read // Mark all as read

// Notification Settings
GET    /api/notification-settings    // Get preferences
PUT    /api/notification-settings    // Update preferences
POST   /api/notifications/test       // Test notification delivery
```

#### 📊 **Analytics & Reports**
```javascript
// Dashboard Analytics
GET    /api/analytics/dashboard      // Main dashboard data
GET    /api/analytics/campaigns      // Campaign analytics
GET    /api/analytics/photographers  // Photographer performance
GET    /api/analytics/brands         // Brand analytics
GET    /api/analytics/revenue        // Revenue analytics

// Advanced Reports
GET    /api/reports/productivity     // Productivity reports
GET    /api/reports/quality-trends   // Quality trend analysis
GET    /api/reports/efficiency       // Efficiency reports
GET    /api/reports/custom           // Custom report builder
POST   /api/reports/generate         // Generate custom report
GET    /api/reports/export/{format}  // Export reports (PDF, Excel)
```

#### ⚙️ **System Management**
```javascript
// System Configuration
GET    /api/system/settings          // System settings
PUT    /api/system/settings          // Update settings
GET    /api/system/health            // System health check
GET    /api/system/version           // Version information

// Admin Tools
GET    /api/admin/users              // Admin user management
POST   /api/admin/backup             // Backup system
POST   /api/admin/maintenance        // Maintenance mode
GET    /api/admin/logs               // System logs
GET    /api/admin/stats              // System statistics
```

### 🔧 **Technical Implementation Details**

#### 📱 **Real-time Updates**
```javascript
// Firebase Realtime Database paths for live updates
/campaigns/{campaignId}/progress
/tasks/{taskId}/status  
/notifications/{userId}
/conflicts/real-time
/equipment/availability

// WebSocket events for instant updates
campaign.progress.updated
task.status.changed
notification.received
conflict.detected
equipment.availability.changed
```

#### 🛡️ **Security Rules (Firestore)**
```javascript
// Firebase Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Brand coordinators can access their brand data
    match /brands/{brandId} {
      allow read, write: if request.auth != null && 
        isAssignedCoordinator(request.auth.uid, brandId);
    }
    
    // Campaign access based on role and brand assignment
    match /smart_campaigns/{campaignId} {
      allow read: if request.auth != null && hasAccessToCampaign(request.auth.uid, campaignId);
      allow write: if request.auth != null && canManageCampaigns(request.auth.uid);
    }
    
    // Task access for assigned photographers
    match /campaign_tasks/{taskId} {
      allow read: if request.auth != null && 
        (isAssignedPhotographer(request.auth.uid, taskId) || hasManageAccess(request.auth.uid));
      allow write: if request.auth != null && canModifyTask(request.auth.uid, taskId);
    }
  }
}
```

#### 🔄 **Integration Specifications**

**Firebase Services Integration:**
- **Authentication:** Multi-provider auth (Email, Phone, Google, Apple)
- **Firestore:** Main database with real-time sync
- **Realtime Database:** Live updates and presence
- **Cloud Storage:** File and media storage
- **Cloud Functions:** Server-side logic and AI processing
- **Cloud Messaging:** Push notifications
- **Analytics:** User behavior tracking

**AI Integration (Google Gemini):**
- Campaign distribution optimization
- Content quality analysis
- Conflict detection and resolution
- Performance prediction
- Automated scheduling suggestions

**External APIs:**
- Google Maps: Location services and travel time calculation
- SMS Gateway: OTP and notifications
- Payment Gateway: Iraqi banking integration
- Weather API: Location-based weather data

#### 📊 **Performance Optimization**

**Database Indexing Strategy:**
```javascript
// Composite indexes for complex queries
campaigns_by_status_and_date
tasks_by_photographer_and_status  
content_by_brand_and_category
payments_by_photographer_and_date
notifications_by_user_and_priority

// Single field indexes for simple queries
user_email, user_phone, brand_name
category_name, equipment_name
task_status, campaign_status
```

**Caching Strategy:**
- **Redis Cache:** Session data, frequent queries
- **CDN:** Static assets and processed images
- **Local Storage:** User preferences, offline data
- **Service Worker:** Offline functionality

#### 🚀 **Deployment & Scaling**

**Architecture:**
- **Frontend:** Vue.js PWA with offline support
- **Backend:** Firebase Cloud Functions (Node.js)
- **Database:** Firestore with Realtime Database
- **Storage:** Cloud Storage with CDN
- **AI Processing:** Google Vertex AI

**Monitoring & Analytics:**
- Firebase Performance Monitoring
- Google Analytics 4
- Custom error tracking
- Real-time usage statistics

---

**🎯 نهاية الدفعة الرابعة والأخيرة**  
**📋 المحتوى:** مسارات API الشاملة ونظام إدارة المحتوى والمدفوعات  
**✅ مكتمل:** نظام قاعدة بيانات شامل مع 4 دفعات متكاملة

---

## 🎊 **ملخص المشروع الكامل**

### 🏆 **الإنجازات الرئيسية:**

**1. نظام المستخدمين المتطور:**
- إدارة الأدوار الديناميكية
- صلاحيات مرنة وقابلة للتخصيص  
- ملفات شخصية شاملة للمصورين

**2. إدارة البراندات الذكية:**
- هوية بصرية متكاملة
- نظام تسعير مرن
- إعدادات جودة قابلة للتخصيص

**3. الحملات الذكية (الميزة الثورية):**
- توزيع AI للمهام تلقائياً
- منع التضارب الذكي
- جدولة محسنة وإدارة الموارد

**4. إدارة المحتوى المتقدمة:**
- مكتبة محتوى ذكية  
- مراجعة وموافقة متدرجة
- تحليل AI للجودة والتوافق

**5. نظام مالي شامل:**
- حسابات دقيقة للمصورين
- مدفوعات آمنة ومتتبعة
- تقارير مالية تفصيلية

### 💪 **القوة التقنية:**
- **قاعدة بيانات:** 12 جدول رئيسي مترابط
- **API Routes:** 80+ مسار للعمليات المختلفة  
- **Firebase Integration:** استخدام كامل للخدمات
- **AI Features:** ذكاء اصطناعي متطور
- **Real-time Updates:** تحديثات فورية

### 🎯 **الجاهزية للتطوير:**
- ✅ قاعدة بيانات مصممة بالكامل
- ✅ مسارات API محددة  
- ✅ قواعد الأمان موضوعة
- ✅ استراتيجية التحسين جاهزة
- ✅ خطة النشر والتوسع مكتملة

**🚀 المشروع جاهز للتطوير والتنفيذ!**