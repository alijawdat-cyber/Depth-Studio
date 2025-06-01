// 🌱 زراعة البيانات الأولية - Depth Studio
// 📅 تاريخ الإنشاء: 31 مايو 2025
// 👤 المطور: علي جودت

const admin = require('firebase-admin');

// تهيئة Firebase Admin SDK
// تهيئة Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'depth-studio'
  });
}

const db = admin.firestore();
const auth = admin.auth();

// 👥 بيانات المستخدمين الأساسيين
const INITIAL_USERS = [
  {
    email: 'alijawdat4@gmail.com',
    password: 'TempPass123!', // كلمة مرور مؤقتة قوية
    displayName: 'علي جودت',
    userData: {
      first_name: 'علي',
      last_name: 'جودت',
      primary_role: 'super_admin',
      is_active: true,
      is_verified: true,
      bio: 'مؤسس ومالك Depth Studio - خبير في إدارة المحتوى الرقمي',
      location: 'بغداد، العراق',
      timezone: 'Asia/Baghdad',
      language: 'ar'
    }
  },
  {
    email: 'hassan.hashim@depthstudio.iq',
    password: 'TempPass123!',
    displayName: 'حسن هاشم',
    userData: {
      first_name: 'حسن',
      last_name: 'هاشم',
      primary_role: 'marketing_coordinator',
      is_active: true,
      is_verified: true,
      bio: 'منسق التسويق - خبير في الحملات الرقمية والتواصل',
      location: 'بغداد، العراق',
      timezone: 'Asia/Baghdad',
      language: 'ar'
    }
  },
  {
    email: 'ali.hazim@depthstudio.iq',
    password: 'TempPass123!',
    displayName: 'علي حازم',
    userData: {
      first_name: 'علي',
      last_name: 'حازم',
      primary_role: 'brand_coordinator',
      is_active: true,
      is_verified: true,
      bio: 'منسق براند NAVA - خبير في إدارة الهوية البصرية',
      location: 'بغداد، العراق',
      timezone: 'Asia/Baghdad',
      language: 'ar'
    }
  },
  {
    email: 'hiba.mohamed@depthstudio.iq',
    password: 'TempPass123!',
    displayName: 'هبة محمد',
    userData: {
      first_name: 'هبة',
      last_name: 'محمد',
      primary_role: 'photographer',
      is_active: true,
      is_verified: true,
      bio: 'مصورة محترفة - راتب ثابت - تخصص التصوير والمراجعة والتصميم',
      location: 'بغداد، العراق',
      timezone: 'Asia/Baghdad',
      language: 'ar'
    }
  },
  {
    email: 'mohammed.qasim@depthstudio.iq',
    password: 'TempPass123!',
    displayName: 'محمد قاسم',
    userData: {
      first_name: 'محمد',
      last_name: 'قاسم',
      primary_role: 'photographer',
      is_active: true,
      is_verified: true,
      bio: 'مصور فريلانسر محترف - تخصص التصوير الفوتوغرافي',
      location: 'بغداد، العراق',
      timezone: 'Asia/Baghdad',
      language: 'ar'
    }
  }
];

// 🏢 بيانات البراندات الأولية
const INITIAL_BRANDS = [
  {
    name_ar: 'نافا',
    name_en: 'NAVA',
    company_name: 'شركة نافا للذهب والمجوهرات',
    display_name: 'نافا',
    description: 'براند فاخر متخصص في الذهب والمجوهرات عالية الجودة',
    business_type: {
      category: 'clothing_fashion',
      subcategory: 'jewelry',
      custom_description: 'ذهب ومجوهرات فاخرة'
    },
    visual_identity: {
      primary_colors: [
        {
          color_name: 'ذهبي فاخر',
          hex_code: '#D4AF37',
          usage: 'اللون الرئيسي للبراند',
          is_main: true
        },
        {
          color_name: 'أسود أنيق',
          hex_code: '#1C1C1C',
          usage: 'للنصوص والخلفيات الأنيقة',
          is_main: false
        }
      ],
      photography_style: 'luxury',
      brand_personality: ['elegant', 'professional', 'trustworthy']
    },
    status: 'active'
  },
  {
    name_ar: 'رياضة وأكثر',
    name_en: 'Sport&More',
    company_name: 'شركة الرياضة والصحة',
    display_name: 'Sport&More',
    description: 'براند رياضي متخصص في المعدات والملابس الرياضية',
    business_type: {
      category: 'sports_fitness',
      subcategory: 'equipment',
      custom_description: 'معدات وملابس رياضية'
    },
    visual_identity: {
      primary_colors: [
        {
          color_name: 'أزرق رياضي',
          hex_code: '#0066CC',
          usage: 'اللون الرئيسي النشط',
          is_main: true
        },
        {
          color_name: 'أبيض نظيف',
          hex_code: '#FFFFFF',
          usage: 'للنظافة والوضوح',
          is_main: false
        }
      ],
      photography_style: 'sporty',
      brand_personality: ['friendly', 'bold', 'innovative']
    },
    status: 'active'
  },
  {
    name_ar: 'إن أوف',
    name_en: 'INOFF',
    company_name: 'شركة إن أوف للمنتجات الطبيعية',
    display_name: 'INOFF',
    description: 'براند طبيعي متخصص في المنتجات العضوية والصحية',
    business_type: {
      category: 'health_medical',
      subcategory: 'natural_products',
      custom_description: 'منتجات طبيعية وعضوية'
    },
    visual_identity: {
      primary_colors: [
        {
          color_name: 'أخضر طبيعي',
          hex_code: '#4CAF50',
          usage: 'اللون الرئيسي الطبيعي',
          is_main: true
        },
        {
          color_name: 'بني ترابي',
          hex_code: '#8D6E63',
          usage: 'للطابع الطبيعي والأرضي',
          is_main: false
        }
      ],
      photography_style: 'natural',
      brand_personality: ['trustworthy', 'simple', 'traditional']
    },
    status: 'active'
  },
  {
    name_ar: 'بلو',
    name_en: 'BLO',
    company_name: 'شركة بلو للأزياء الراقية',
    display_name: 'BLO',
    description: 'براند أزياء راقي متخصص في الملابس الأنيقة',
    business_type: {
      category: 'clothing_fashion',
      subcategory: 'luxury_fashion',
      custom_description: 'أزياء راقية وأنيقة'
    },
    visual_identity: {
      primary_colors: [
        {
          color_name: 'بنفسجي ملكي',
          hex_code: '#673AB7',
          usage: 'اللون الرئيسي الملكي',
          is_main: true
        },
        {
          color_name: 'فضي لامع',
          hex_code: '#C0C0C0',
          usage: 'للمسات الأنيقة',
          is_main: false
        }
      ],
      photography_style: 'elegant',
      brand_personality: ['elegant', 'bold', 'professional']
    },
    status: 'active'
  },
  {
    name_ar: 'كلينيكا إيه',
    name_en: 'Clinica A',
    company_name: 'عيادات كلينيكا إيه الطبية',
    display_name: 'Clinica A',
    description: 'مركز طبي متخصص في الرعاية الصحية الشاملة',
    business_type: {
      category: 'health_medical',
      subcategory: 'medical_clinic',
      custom_description: 'خدمات طبية وعلاجية'
    },
    visual_identity: {
      primary_colors: [
        {
          color_name: 'وردي طبي',
          hex_code: '#E91E63',
          usage: 'اللون الرئيسي الطبي',
          is_main: true
        },
        {
          color_name: 'أبيض طبي',
          hex_code: '#FFFFFF',
          usage: 'للنظافة والثقة الطبية',
          is_main: false
        }
      ],
      photography_style: 'medical',
      brand_personality: ['professional', 'trustworthy', 'friendly']
    },
    status: 'active'
  }
];

// 📂 بيانات الفئات الأولية
const INITIAL_CATEGORIES = [
  // الفئات الرئيسية
  {
    name_ar: 'التصوير الفوتوغرافي',
    name_en: 'Photography',
    category_type: 'main',
    parent_category_id: null,
    sort_order: 1,
    pricing: {
      base_price: 50000, // 50,000 دينار عراقي
      currency: 'IQD',
      pricing_type: 'per_piece'
    },
    time_settings: {
      execution_time_raw: 1,
      execution_time_processed: 2
    },
    status: 'active',
    tags: ['تصوير', 'فوتوغرافي', 'صور']
  },
  {
    name_ar: 'إنتاج الفيديو',
    name_en: 'Video Production',
    category_type: 'main',
    parent_category_id: null,
    sort_order: 2,
    pricing: {
      base_price: 150000, // 150,000 دينار عراقي
      currency: 'IQD',
      pricing_type: 'per_piece'
    },
    time_settings: {
      execution_time_raw: 3,
      execution_time_processed: 6
    },
    status: 'active',
    tags: ['فيديو', 'إنتاج', 'تصوير فيديو']
  },
  {
    name_ar: 'التصميم الجرافيكي',
    name_en: 'Graphic Design',
    category_type: 'main',
    parent_category_id: null,
    sort_order: 3,
    pricing: {
      base_price: 75000, // 75,000 دينار عراقي
      currency: 'IQD',
      pricing_type: 'per_piece'
    },
    time_settings: {
      execution_time_raw: 2,
      execution_time_processed: 3
    },
    status: 'active',
    tags: ['تصميم', 'جرافيك', 'إبداع']
  },
  {
    name_ar: 'المحتوى التسويقي',
    name_en: 'Marketing Content',
    category_type: 'main',
    parent_category_id: null,
    sort_order: 4,
    pricing: {
      base_price: 100000, // 100,000 دينار عراقي
      currency: 'IQD',
      pricing_type: 'per_project'
    },
    time_settings: {
      execution_time_raw: 4,
      execution_time_processed: 8
    },
    status: 'active',
    tags: ['تسويق', 'محتوى', 'إعلان']
  },
  {
    name_ar: 'الخدمات الإضافية',
    name_en: 'Additional Services',
    category_type: 'main',
    parent_category_id: null,
    sort_order: 5,
    pricing: {
      base_price: 25000, // 25,000 دينار عراقي
      currency: 'IQD',
      pricing_type: 'per_hour'
    },
    time_settings: {
      execution_time_raw: 1,
      execution_time_processed: 1
    },
    status: 'active',
    tags: ['خدمات', 'إضافية', 'مساعدة']
  }
];

// 🎪 بيانات المعدات الأولية
const INITIAL_EQUIPMENT = [
  // كاميرات
  {
    name_ar: 'كاميرا DSLR أساسية',
    name_en: 'Basic DSLR Camera',
    display_name: 'كاميرا DSLR أساسية',
    description: 'كاميرا رقمية أساسية مناسبة للتصوير العادي',
    equipment_category: 'camera_dslr',
    subcategory: 'basic',
    availability: {
      total_quantity: 3,
      available_quantity: 3,
      reserved_quantity: 0,
      maintenance_quantity: 0
    },
    specifications: {
      brand: 'Canon',
      model: 'EOS 2000D',
      technical_specs: {
        resolution: '24MP',
        sensor_size: 'APS-C',
        iso_range: '100-6400'
      }
    },
    status: 'active'
  },
  {
    name_ar: 'كاميرا احترافية',
    name_en: 'Professional Camera',
    display_name: 'كاميرا احترافية',
    description: 'كاميرا احترافية عالية الجودة للمشاريع المتقدمة',
    equipment_category: 'camera_dslr',
    subcategory: 'professional',
    availability: {
      total_quantity: 2,
      available_quantity: 2,
      reserved_quantity: 0,
      maintenance_quantity: 0
    },
    specifications: {
      brand: 'Canon',
      model: 'EOS 5D Mark IV',
      technical_specs: {
        resolution: '30MP',
        sensor_size: 'Full Frame',
        iso_range: '100-32000'
      }
    },
    status: 'active'
  },
  {
    name_ar: 'كاميرا سينمائية',
    name_en: 'Cinema Camera',
    display_name: 'كاميرا سينمائية',
    description: 'كاميرا سينمائية للإنتاج الفيديو عالي الجودة',
    equipment_category: 'camera_cinema',
    subcategory: 'professional',
    availability: {
      total_quantity: 1,
      available_quantity: 1,
      reserved_quantity: 0,
      maintenance_quantity: 0
    },
    specifications: {
      brand: 'Sony',
      model: 'FX6',
      technical_specs: {
        resolution: '4K',
        sensor_size: 'Full Frame',
        recording_format: 'XAVC-S'
      }
    },
    status: 'active'
  },
  // إضاءة
  {
    name_ar: 'إضاءة استوديو أساسية',
    name_en: 'Basic Studio Lighting',
    display_name: 'إضاءة استوديو أساسية',
    description: 'طقم إضاءة استوديو أساسي للتصوير الداخلي',
    equipment_category: 'lighting_studio',
    subcategory: 'basic',
    availability: {
      total_quantity: 2,
      available_quantity: 2,
      reserved_quantity: 0,
      maintenance_quantity: 0
    },
    specifications: {
      brand: 'Godox',
      model: 'SK400II',
      technical_specs: {
        power: '400W',
        color_temperature: '5600K'
      }
    },
    status: 'active'
  },
  {
    name_ar: 'إضاءة LED احترافية',
    name_en: 'Professional LED Lighting',
    display_name: 'إضاءة LED احترافية',
    description: 'إضاءة LED احترافية قابلة للتعديل',
    equipment_category: 'lighting_led',
    subcategory: 'professional',
    availability: {
      total_quantity: 4,
      available_quantity: 4,
      reserved_quantity: 0,
      maintenance_quantity: 0
    },
    specifications: {
      brand: 'Aputure',
      model: 'AL-M9',
      technical_specs: {
        power: '9W',
        color_temperature: '3200K-5500K'
      }
    },
    status: 'active'
  },
  // حاملات ومعدات دعم
  {
    name_ar: 'حامل ثلاثي احترافي',
    name_en: 'Professional Tripod',
    display_name: 'حامل ثلاثي احترافي',
    description: 'حامل ثلاثي احترافي مقاوم وقوي',
    equipment_category: 'support_tripod',
    subcategory: 'professional',
    availability: {
      total_quantity: 5,
      available_quantity: 5,
      reserved_quantity: 0,
      maintenance_quantity: 0
    },
    specifications: {
      brand: 'Manfrotto',
      model: '190X',
      technical_specs: {
        max_load: '7kg',
        material: 'Aluminum'
      }
    },
    status: 'active'
  }
];

// 🛠️ دالة إنشاء حساب مستخدم في Firebase Auth
async function createAuthUser(userInfo) {
  try {
    const userRecord = await auth.createUser({
      email: userInfo.email,
      password: userInfo.password,
      displayName: userInfo.displayName,
      emailVerified: true,
      disabled: false
    });

    console.log(`✅ تم إنشاء حساب Firebase Auth للمستخدم: ${userInfo.displayName} (UID: ${userRecord.uid})`);
    return userRecord.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`⚠️ المستخدم ${userInfo.email} موجود مسبقاً. جاري الحصول على UID...`);
      const existingUser = await auth.getUserByEmail(userInfo.email);
      return existingUser.uid;
    }
    throw error;
  }
}

// 🗄️ دالة زراعة مستخدم في Firestore
async function seedUser(userInfo, firebaseUid) {
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  
  const userData = {
    ...userInfo.userData,
    email: userInfo.email,
    display_name: userInfo.displayName,
    firebase_uid: firebaseUid,
    auth_providers: ['email'],
    total_login_count: 0,
    is_online: false,
    created_at: timestamp,
    updated_at: timestamp,
    created_by: firebaseUid, // المستخدم أنشأ نفسه
    updated_by: firebaseUid
  };

  await db.collection('users').doc(firebaseUid).set(userData);
  console.log(`✅ تم زراعة بيانات المستخدم في Firestore: ${userInfo.displayName}`);
  return firebaseUid;
}

// 🔐 دالة زراعة صلاحيات المستخدم
async function seedUserPermissions(userId, role) {
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  
  // صلاحيات Super Admin كاملة
  const superAdminPermissions = {
    screen_permissions: {
      dashboard: true,
      users_management: true,
      brands_management: true,
      campaigns_management: true,
      content_review: true,
      financial_reports: true,
      analytics: true,
      settings: true
    },
    crud_permissions: {
      users: { create: true, read: true, update: true, delete: true },
      brands: { create: true, read: true, update: true, delete: true },
      campaigns: { create: true, read: true, update: true, delete: true },
      tasks: { create: true, read: true, update: true, delete: true },
      content: { create: true, read: true, update: true, delete: true },
      payments: { create: true, read: true, update: true, delete: true },
      reports: { create: true, read: true, update: true, delete: true }
    }
  };
  
  // صلاحيات Marketing Coordinator
  const marketingCoordinatorPermissions = {
    screen_permissions: {
      dashboard: true,
      users_management: false,
      brands_management: true,
      campaigns_management: true,
      content_review: true,
      financial_reports: true,
      analytics: true,
      settings: false
    },
    crud_permissions: {
      users: { create: false, read: true, update: false, delete: false },
      brands: { create: true, read: true, update: true, delete: false },
      campaigns: { create: true, read: true, update: true, delete: false },
      tasks: { create: true, read: true, update: true, delete: false },
      content: { create: true, read: true, update: true, delete: false },
      payments: { create: false, read: true, update: false, delete: false },
      reports: { create: true, read: true, update: false, delete: false }
    }
  };
  
  // صلاحيات محدودة للأدوار الأخرى
  const limitedPermissions = {
    screen_permissions: {
      dashboard: true,
      users_management: false,
      brands_management: false,
      campaigns_management: false,
      content_review: true,
      financial_reports: false,
      analytics: false,
      settings: false
    },
    crud_permissions: {
      users: { create: false, read: false, update: false, delete: false },
      brands: { create: false, read: true, update: false, delete: false },
      campaigns: { create: false, read: true, update: false, delete: false },
      tasks: { create: false, read: true, update: true, delete: false },
      content: { create: true, read: true, update: true, delete: false },
      payments: { create: false, read: false, update: false, delete: false },
      reports: { create: false, read: false, update: false, delete: false }
    }
  };
  
  let permissions;
  switch (role) {
    case 'super_admin':
      permissions = superAdminPermissions;
      break;
    case 'marketing_coordinator':
      permissions = marketingCoordinatorPermissions;
      break;
    default:
      permissions = limitedPermissions;
  }
  
  const permissionData = {
    user_id: userId,
    roles: [{
      role_type: role,
      is_primary: true,
      granted_at: timestamp,
      granted_by: userId, // في البداية، المستخدم يمنح لنفسه
      expires_at: null
    }],
    ...permissions,
    brand_permissions: [],
    custom_permissions: {},
    is_active: true,
    last_updated_by: userId,
    created_at: timestamp,
    updated_at: timestamp,
    changelog: []
  };

  await db.collection('user_permissions').doc(userId).set(permissionData);
  console.log(`✅ تم زراعة صلاحيات المستخدم: ${role}`);
}

// 📸 دالة زراعة ملف المصور
async function seedPhotographerProfile(userId, userInfo, contractType) {
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  
  const profileData = {
    user_id: userId,
    contract_type: contractType,
    
    // معلومات العقد حسب النوع
    ...(contractType === 'freelancer' ? {
      freelancer_info: {
        base_rate_percentage: 0.7, // 70% للفريلانسر
        preferred_payment_method: 'bank_transfer',
        payment_schedule: 'per_task',
        total_earnings_ytd: 0,
        pending_payments: 0
      }
    } : {
      salary_info: {
        monthly_salary: 800000, // 800,000 دينار شهرياً
        monthly_target_tasks: 20,
        bonus_per_extra_task: 15000, // 15,000 دينار لكل مهمة إضافية
        performance_bonus_rate: 0.1,
        current_month_completed: 0,
        current_month_target: 20,
        total_bonus_earned: 0,
        performance_rating: 3.0
      }
    }),
    
    specializations: [],
    work_preferences: {
      preferred_brands: [],
      max_concurrent_tasks: 5,
      preferred_work_hours: {
        start_time: '09:00',
        end_time: '18:00',
        timezone: 'Asia/Baghdad'
      },
      available_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      preferred_locations: ['studio', 'client_location'],
      max_travel_distance: 50
    },
    
    owned_equipment: [],
    performance_stats: {
      total_tasks_completed: 0,
      average_rating: 0.0,
      on_time_completion_rate: 0.0,
      client_satisfaction_score: 0.0,
      quality_score_average: 0.0,
      brand_performance: {},
      category_performance: {}
    },
    
    availability: {
      is_currently_available: true,
      unavailable_periods: [],
      max_daily_hours: 8,
      preferred_break_duration: 60
    },
    
    financial_info: {
      currency: 'IQD'
    },
    
    contact_preferences: {
      preferred_contact_method: 'email'
    },
    
    is_active: true,
    verification_status: 'verified',
    verification_date: timestamp,
    verified_by: userId,
    hire_date: timestamp,
    created_at: timestamp,
    updated_at: timestamp,
    last_activity: timestamp
  };

  await db.collection('photographer_profiles').add(profileData);
  console.log(`✅ تم زراعة ملف المصور: ${userInfo.displayName} (${contractType})`);
}

// 🏢 دالة زراعة البراندات
async function seedBrands(adminUserId) {
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  
  for (const brand of INITIAL_BRANDS) {
    const brandData = {
      ...brand,
      contact_info: {
        country: 'Iraq',
        city: 'بغداد'
      },
      production_standards: {
        allowed_content_types: ['photos', 'videos', 'designs'],
        photography_requirements: {
          preferred_lighting: ['natural', 'studio'],
          required_angles: ['portrait', 'landscape', 'square'],
          style_notes: 'يفضل الأسلوب الأنيق والمتوافق مع هوية البراند'
        },
        export_specifications: {
          required_sizes: [
            {
              size_name: 'إنستغرام بوست',
              dimensions: '1080x1080',
              format: 'jpg',
              quality: 'high',
              usage: 'منشورات إنستغرام المربعة'
            },
            {
              size_name: 'فيسبوك غلاف',
              dimensions: '1200x630',
              format: 'jpg',
              quality: 'high',
              usage: 'صور الغلاف والمنشورات'
            }
          ],
          default_format: 'jpg',
          compression_level: 'light'
        },
        quality_standards: {
          minimum_resolution: '1920x1080',
          color_profile: 'sRGB',
          file_naming_convention: `${brand.name_en}_[date]_[type]_[number]`,
          watermark_required: false,
          metadata_requirements: ['copyright', 'description']
        }
      },
      goals_settings: {
        monthly_targets: {
          content_count: 30,
          quality_score: 4.0,
          budget_limit: 2000000 // 2 مليون دينار شهرياً
        },
        target_audience: {
          age_groups: ['19-25', '26-35', '36-45'],
          gender_focus: 'both',
          interests: ['أزياء', 'جودة', 'فخامة'],
          geographic_focus: ['بغداد', 'أربيل', 'البصرة']
        }
      },
      created_at: timestamp,
      updated_at: timestamp,
      created_by: adminUserId,
      last_updated_by: adminUserId
    };

    const brandRef = await db.collection('brands').add(brandData);
    console.log(`✅ تم زراعة البراند: ${brand.display_name} (ID: ${brandRef.id})`);
    
    // حفظ Brand ID للاستخدام مع منسق البراند
    if (brand.name_en === 'NAVA') {
      global.navaBrandId = brandRef.id;
    }
  }
}

// 👔 دالة زراعة منسق البراند (علي حازم لبراند NAVA)
async function seedBrandCoordinator(coordinatorUserId, navaBrandId, adminUserId) {
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  
  const coordinatorData = {
    user_id: coordinatorUserId,
    brand_id: navaBrandId,
    coordinator_title: 'منسق براند رئيسي',
    job_description: 'مسؤول عن إدارة وتنسيق جميع أنشطة براند NAVA وضمان جودة المحتوى',
    responsibilities: [
      'content_approval',
      'task_coordination',
      'client_communication',
      'quality_control',
      'brand_compliance'
    ],
    brand_permissions: {
      can_approve_content: true,
      can_reject_content: true,
      can_assign_tasks: true,
      can_modify_deadlines: false,
      can_view_financials: false,
      can_communicate_with_client: true,
      max_budget_authority: 500000 // 500,000 دينار
    },
    client_contact_info: {
      client_primary_contact: 'مدير التسويق - NAVA',
      preferred_communication_hours: {
        start_time: '09:00',
        end_time: '17:00',
        timezone: 'Asia/Baghdad'
      },
      communication_language: 'arabic'
    },
    performance_metrics: {
      total_projects_managed: 0,
      client_satisfaction_rating: 0.0,
      average_response_time: 0,
      content_approval_rate: 0.0,
      on_time_delivery_rate: 0.0,
      monthly_stats: {}
    },
    work_schedule: {
      working_days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      working_hours: {
        start_time: '09:00',
        end_time: '17:00'
      },
      timezone: 'Asia/Baghdad',
      is_available: true,
      unavailable_periods: []
    },
    employment_info: {
      start_date: timestamp,
      contract_type: 'full_time',
      compensation_type: 'salary',
      is_exclusive: true
    },
    notes: {
      management_notes: 'منسق ممتاز مع خبرة واسعة في إدارة البراندات الفاخرة',
      areas_for_improvement: [],
      strengths: ['تواصل ممتاز', 'إدارة وقت فعالة', 'فهم عميق للهوية البصرية']
    },
    status: 'active',
    is_primary_coordinator: true,
    created_at: timestamp,
    updated_at: timestamp,
    created_by: adminUserId,
    last_activity: timestamp
  };

  await db.collection('brand_coordinators').add(coordinatorData);
  console.log(`✅ تم زراعة منسق البراند: علي حازم لبراند NAVA`);
}

// 📂 دالة زراعة الفئات
async function seedCategories(adminUserId) {
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  
  for (const category of INITIAL_CATEGORIES) {
    const categoryData = {
      ...category,
      required_equipment: [],
      required_skills: [],
      suitable_locations: ['studio', 'client_location'],
      output_types: [
        {
          type: 'photo',
          format: ['JPG', 'PNG'],
          typical_quantity: 5,
          size_specifications: ['1080x1080', '1200x630']
        }
      ],
      task_templates: [],
      usage_statistics: {
        total_tasks_created: 0,
        total_tasks_completed: 0,
        average_completion_time: 0,
        average_quality_score: 0.0,
        most_used_by_brands: [],
        top_photographers: [],
        monthly_usage_trend: {},
        success_metrics: {
          completion_rate: 0.0,
          on_time_rate: 0.0,
          client_satisfaction: 0.0
        }
      },
      is_popular: false,
      is_seasonal: false,
      search_keywords: category.tags,
      created_at: timestamp,
      updated_at: timestamp,
      created_by: adminUserId,
      last_updated_by: adminUserId,
      can_be_deleted: true,
      deletion_restrictions: []
    };

    await db.collection('content_categories').add(categoryData);
    console.log(`✅ تم زراعة الفئة: ${category.name_ar}`);
  }
}

// 🎪 دالة زراعة المعدات
async function seedEquipment(adminUserId) {
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  
  for (const equipment of INITIAL_EQUIPMENT) {
    const equipmentData = {
      ...equipment,
      purchase_info: {
        purchase_date: timestamp,
        purchase_price: 0,
        warranty_expiry: null,
        supplier: 'مخزن الشركة'
      },
      maintenance_schedule: {
        last_maintenance: timestamp,
        next_maintenance: null,
        maintenance_interval_days: 365,
        maintenance_notes: []
      },
      usage_statistics: {
        total_bookings: 0,
        total_usage_hours: 0,
        average_rating: 0.0,
        most_used_by: [],
        popular_with_categories: [],
        maintenance_cost_ytd: 0
      },
      location_info: {
        current_location: 'المخزن الرئيسي',
        default_location: 'المخزن الرئيسي',
        is_portable: true,
        requires_setup: false
      },
      created_at: timestamp,
      updated_at: timestamp,
      created_by: adminUserId,
      last_updated_by: adminUserId
    };

    await db.collection('equipment').add(equipmentData);
    console.log(`✅ تم زراعة المعدة: ${equipment.name_ar}`);
  }
}

// 🚀 الدالة الرئيسية لزراعة جميع البيانات
async function seedAllData() {
  try {
    console.log('🌱 بدء عملية زراعة البيانات الأولية...\n');
    
    // 1. إنشاء المستخدمين
    console.log('👥 مرحلة 1: إنشاء المستخدمين...');
    const userIds = [];
    
    for (const userInfo of INITIAL_USERS) {
      const firebaseUid = await createAuthUser(userInfo);
      const userId = await seedUser(userInfo, firebaseUid);
      await seedUserPermissions(userId, userInfo.userData.primary_role);
      
      userIds.push({ id: userId, info: userInfo });
      
      // إنشاء ملفات المصورين
      if (userInfo.userData.primary_role === 'photographer') {
        const contractType = userInfo.displayName === 'هبة محمد' ? 'salary' : 'freelancer';
        await seedPhotographerProfile(userId, userInfo, contractType);
      }
    }
    
    console.log('\n');
    
    // 2. زراعة البراندات
    console.log('🏢 مرحلة 2: زراعة البراندات...');
    const adminUserId = userIds.find(u => u.info.userData.primary_role === 'super_admin').id;
    await seedBrands(adminUserId);
    
    console.log('\n');
    
    // 3. زراعة منسق البراند
    console.log('👔 مرحلة 3: زراعة منسق البراند...');
    const coordinatorUserId = userIds.find(u => u.info.displayName === 'علي حازم').id;
    if (global.navaBrandId && coordinatorUserId) {
      await seedBrandCoordinator(coordinatorUserId, global.navaBrandId, adminUserId);
    }
    
    console.log('\n');
    
    // 4. زراعة الفئات
    console.log('📂 مرحلة 4: زراعة الفئات...');
    await seedCategories(adminUserId);
    
    console.log('\n');
    
    // 5. زراعة المعدات
    console.log('🎪 مرحلة 5: زراعة المعدات...');
    await seedEquipment(adminUserId);
    
    console.log('\n🎉 تم الانتهاء من زراعة جميع البيانات الأولية بنجاح!');
    console.log('\n📋 ملخص ما تم زراعته:');
    console.log(`👥 المستخدمين: ${INITIAL_USERS.length}`);
    console.log(`🏢 البراندات: ${INITIAL_BRANDS.length}`);
    console.log(`📂 الفئات: ${INITIAL_CATEGORIES.length}`);
    console.log(`🎪 المعدات: ${INITIAL_EQUIPMENT.length}`);
    console.log(`👔 منسقي البراندات: 1`);
    console.log(`📸 ملفات المصورين: 2`);
    
  } catch (error) {
    console.error('❌ خطأ في زراعة البيانات:', error);
  }
}

// تشغيل الزراعة
if (require.main === module) {
  seedAllData()
    .then(() => {
      console.log('\n✅ تم الانتهاء من المهمة');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل في زراعة البيانات:', error);
      process.exit(1);
    });
}

module.exports = {
  seedAllData,
  INITIAL_USERS,
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_EQUIPMENT
}; 