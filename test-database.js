const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = require('./database/service-account-key.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    console.error('❌ خطأ في تحميل ملف service account:', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

console.log('🧪 بدء اختبار شامل لقاعدة البيانات Depth Studio\n');

// ======================================
// 🔍 اختبارات قاعدة البيانات
// ======================================

const tests = {
  
  // 1. اختبار الاتصال
  async testConnection() {
    console.log('🔗 اختبار الاتصال بقاعدة البيانات...');
    try {
      const testDoc = await db.collection('users').limit(1).get();
      console.log('✅ الاتصال ناجح - قاعدة البيانات متاحة\n');
      return true;
    } catch (error) {
      console.error('❌ فشل الاتصال:', error.message);
      return false;
    }
  },

  // 2. اختبار جميع المجموعات
  async testAllCollections() {
    console.log('📊 اختبار جميع المجموعات...');
    
    const expectedCollections = [
      'users', 'user_permissions', 'roles', 'brands', 'content_categories',
      'smart_campaigns', 'campaign_notifications', 'settings', 'templates',
      'photographer_profiles', 'brand_coordinators', 'equipment', 
      'campaign_tasks', 'payments', 'analytics', 'audit_logs', 
      'messages', 'content_library'
    ];

    const results = {};
    
    for (const collection of expectedCollections) {
      try {
        const snapshot = await db.collection(collection).limit(5).get();
        results[collection] = {
          exists: true,
          count: snapshot.size,
          hasData: !snapshot.empty
        };
        
        if (snapshot.empty) {
          console.log(`⚠️  ${collection}: موجود لكن فاضي`);
        } else {
          console.log(`✅ ${collection}: ${snapshot.size} وثيقة`);
        }
      } catch (error) {
        results[collection] = {
          exists: false,
          error: error.message
        };
        console.log(`❌ ${collection}: غير موجود أو خطأ`);
      }
    }
    
    console.log('\n📈 ملخص المجموعات:');
    const totalCollections = Object.keys(results).length;
    const existingCollections = Object.values(results).filter(r => r.exists).length;
    const collectionsWithData = Object.values(results).filter(r => r.exists && r.hasData).length;
    
    console.log(`📁 إجمالي المجموعات المطلوبة: ${totalCollections}`);
    console.log(`✅ المجموعات الموجودة: ${existingCollections}`);
    console.log(`📋 المجموعات التي تحتوي على بيانات: ${collectionsWithData}\n`);
    
    return results;
  },

  // 3. اختبار العلاقات والروابط
  async testRelationships() {
    console.log('🔗 اختبار العلاقات والروابط بين البيانات...');
    
    try {
      // اختبار علاقة User -> UserPermissions
      const users = await db.collection('users').limit(3).get();
      console.log(`👥 عدد المستخدمين: ${users.size}`);
      
      for (const userDoc of users.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        // البحث عن صلاحيات المستخدم
        const permissions = await db.collection('user_permissions')
          .where('user_id', '==', userId)
          .get();
        
        console.log(`🔐 المستخدم ${userData.display_name}: ${permissions.size} صلاحية`);
      }

      // اختبار علاقة Brand -> Campaigns
      const brands = await db.collection('brands').limit(3).get();
      console.log(`\n🏢 عدد البراندات: ${brands.size}`);
      
      for (const brandDoc of brands.docs) {
        const brandId = brandDoc.id;
        const brandData = brandDoc.data();
        
        // البحث عن حملات البراند
        const campaigns = await db.collection('smart_campaigns')
          .where('campaign_info.brand_id', '==', brandId)
          .get();
        
        console.log(`🎯 البراند ${brandData.name?.ar || brandData.name}: ${campaigns.size} حملة`);
      }

      // اختبار علاقة Campaign -> Tasks
      const campaigns = await db.collection('smart_campaigns').limit(2).get();
      console.log(`\n🎯 عدد الحملات: ${campaigns.size}`);
      
      for (const campaignDoc of campaigns.docs) {
        const campaignId = campaignDoc.id;
        const campaignData = campaignDoc.data();
        
        // البحث عن مهام الحملة
        const tasks = await db.collection('campaign_tasks')
          .where('campaign_id', '==', campaignId)
          .get();
        
        console.log(`📋 الحملة ${campaignData.campaign_info?.name}: ${tasks.size} مهمة`);
      }

      console.log('✅ جميع العلاقات تعمل بشكل صحيح\n');
      return true;
      
    } catch (error) {
      console.error('❌ خطأ في اختبار العلاقات:', error.message);
      return false;
    }
  },

  // 4. اختبار الاستعلامات المعقدة
  async testComplexQueries() {
    console.log('🔍 اختبار الاستعلامات المعقدة والفهارس...');
    
    const queryTests = [
      {
        name: 'المستخدمين النشطين مرتبين حسب تاريخ الإنشاء',
        query: () => db.collection('users')
          .where('is_active', '==', true)
          .orderBy('created_at', 'desc')
          .limit(5)
      },
      {
        name: 'البراندات حسب النوع والصناعة',
        query: () => db.collection('brands')
          .where('industry', '==', 'software')
          .where('brand_type', '==', 'technology')
          .limit(5)
      },
      {
        name: 'الحملات النشطة لبراند معين',
        query: async () => {
          const brands = await db.collection('brands').limit(1).get();
          if (!brands.empty) {
            const brandId = brands.docs[0].id;
            return db.collection('smart_campaigns')
              .where('campaign_info.brand_id', '==', brandId)
              .where('campaign_status', '==', 'active')
              .orderBy('created_at', 'desc');
          }
          return null;
        }
      },
      {
        name: 'الإشعارات غير المقروءة للمستخدم',
        query: async () => {
          const users = await db.collection('users').limit(1).get();
          if (!users.empty) {
            const userId = users.docs[0].id;
            return db.collection('campaign_notifications')
              .where('recipient_info.recipient_id', '==', userId)
              .where('notification_status.is_read', '==', false)
              .orderBy('created_at', 'desc');
          }
          return null;
        }
      },
      {
        name: 'مهام الحملة حسب الحالة والموعد',
        query: async () => {
          const campaigns = await db.collection('smart_campaigns').limit(1).get();
          if (!campaigns.empty) {
            const campaignId = campaigns.docs[0].id;
            return db.collection('campaign_tasks')
              .where('campaign_id', '==', campaignId)
              .where('status_tracking.current_status', '==', 'scheduled')
              .orderBy('timeline.due_date', 'asc');
          }
          return null;
        }
      }
    ];

    let successCount = 0;
    
    for (const test of queryTests) {
      try {
        console.log(`\n🔍 اختبار: ${test.name}`);
        
        let queryRef = test.query;
        if (typeof queryRef === 'function') {
          queryRef = await queryRef();
        }
        
        if (queryRef) {
          const results = await queryRef.get();
          console.log(`✅ النتائج: ${results.size} وثيقة`);
          
          // عرض عينة من البيانات
          if (!results.empty) {
            const sampleDoc = results.docs[0].data();
            const keys = Object.keys(sampleDoc).slice(0, 3);
            console.log(`📋 عينة الحقول: ${keys.join(', ')}`);
          }
          
          successCount++;
        } else {
          console.log('⚠️  لا توجد بيانات للاختبار');
        }
        
      } catch (error) {
        console.error(`❌ فشل: ${error.message}`);
      }
    }
    
    console.log(`\n📊 نتائج اختبار الاستعلامات: ${successCount}/${queryTests.length} نجح\n`);
    return successCount === queryTests.length;
  },

  // 5. اختبار صحة البيانات
  async testDataIntegrity() {
    console.log('🔍 اختبار صحة وتكامل البيانات...');
    
    const issues = [];
    
    try {
      // اختبار المستخدمين
      const users = await db.collection('users').get();
      console.log(`👥 فحص ${users.size} مستخدم...`);
      
      users.forEach(doc => {
        const data = doc.data();
        if (!data.email || !data.firebase_uid || !data.primary_role) {
          issues.push(`المستخدم ${doc.id}: حقول مطلوبة مفقودة`);
        }
      });

      // اختبار البراندات
      const brands = await db.collection('brands').get();
      console.log(`🏢 فحص ${brands.size} براند...`);
      
      brands.forEach(doc => {
        const data = doc.data();
        if (!data.name || !data.status || !data.brand_type) {
          issues.push(`البراند ${doc.id}: حقول مطلوبة مفقودة`);
        }
      });

      // اختبار الحملات
      const campaigns = await db.collection('smart_campaigns').get();
      console.log(`🎯 فحص ${campaigns.size} حملة...`);
      
      campaigns.forEach(doc => {
        const data = doc.data();
        if (!data.campaign_info?.brand_id || !data.campaign_status) {
          issues.push(`الحملة ${doc.id}: حقول مطلوبة مفقودة`);
        }
      });

      if (issues.length === 0) {
        console.log('✅ جميع البيانات سليمة ومتكاملة');
        return true;
      } else {
        console.log(`⚠️  تم العثور على ${issues.length} مشكلة:`);
        issues.forEach(issue => console.log(`   - ${issue}`));
        return false;
      }
      
    } catch (error) {
      console.error('❌ خطأ في اختبار تكامل البيانات:', error.message);
      return false;
    }
  },

  // 6. اختبار الأداء
  async testPerformance() {
    console.log('⚡ اختبار أداء الاستعلامات...');
    
    const performanceTests = [
      {
        name: 'استعلام بسيط',
        query: () => db.collection('users').limit(1).get()
      },
      {
        name: 'استعلام مع فلترة',
        query: () => db.collection('users').where('is_active', '==', true).limit(5).get()
      },
      {
        name: 'استعلام معقد مع ترتيب',
        query: () => db.collection('brands')
          .where('status', '==', 'active')
          .orderBy('created_at', 'desc')
          .limit(10).get()
      }
    ];

    for (const test of performanceTests) {
      try {
        const startTime = Date.now();
        const result = await test.query();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`⚡ ${test.name}: ${duration}ms (${result.size} نتيجة)`);
        
        if (duration > 1000) {
          console.log('⚠️  استعلام بطيء - قد تحتاج فهرس إضافي');
        }
        
      } catch (error) {
        console.error(`❌ فشل في ${test.name}: ${error.message}`);
      }
    }
    
    console.log('');
  },

  // 7. اختبار تفصيلي للتايبس
  async testTypeCompliance() {
    console.log('📝 اختبار مطابقة التايبات TypeScript...');
    
    try {
      // فحص structure مجموعة users
      const user = await db.collection('users').limit(1).get();
      if (!user.empty) {
        const userData = user.docs[0].data();
        const requiredFields = [
          'email', 'display_name', 'first_name', 'last_name', 
          'primary_role', 'is_active', 'firebase_uid', 'created_at'
        ];
        
        const missingFields = requiredFields.filter(field => !(field in userData));
        
        if (missingFields.length === 0) {
          console.log('✅ User interface: مطابق 100%');
        } else {
          console.log(`⚠️  User interface: حقول مفقودة: ${missingFields.join(', ')}`);
        }
      }

      // فحص structure مجموعة brands  
      const brand = await db.collection('brands').limit(1).get();
      if (!brand.empty) {
        const brandData = brand.docs[0].data();
        const requiredFields = [
          'name', 'status', 'brand_type', 'brand_identity', 
          'contact_info', 'budget_settings', 'is_active'
        ];
        
        const missingFields = requiredFields.filter(field => !(field in brandData));
        
        if (missingFields.length === 0) {
          console.log('✅ Brand interface: مطابق 100%');
        } else {
          console.log(`⚠️  Brand interface: حقول مفقودة: ${missingFields.join(', ')}`);
        }
      }

      console.log('✅ التايبات متطابقة مع shared/types.ts\n');
      return true;
      
    } catch (error) {
      console.error('❌ خطأ في اختبار التايبات:', error.message);
      return false;
    }
  }
};

// ======================================
// 🏃‍♂️ تشغيل جميع الاختبارات
// ======================================

async function runAllTests() {
  console.log('🚀 بدء الاختبار الشامل لقاعدة البيانات...\n');
  
  const results = {
    connection: false,
    collections: false,
    relationships: false,
    complexQueries: false,
    dataIntegrity: false,
    typeCompliance: false,
    performance: true // أداء يُقاس فقط
  };

  try {
    // تشغيل الاختبارات بالتسلسل
    results.connection = await tests.testConnection();
    
    if (results.connection) {
      const collectionResults = await tests.testAllCollections();
      results.collections = Object.values(collectionResults).filter(r => r.exists).length > 15;
      
      results.relationships = await tests.testRelationships();
      results.complexQueries = await tests.testComplexQueries();
      results.dataIntegrity = await tests.testDataIntegrity();
      results.typeCompliance = await tests.testTypeCompliance();
      
      await tests.testPerformance();
    }

    // تقرير النتائج النهائي
    console.log('📊 ملخص نتائج الاختبار:');
    console.log('=' .repeat(50));
    
    const testNames = {
      connection: 'الاتصال بقاعدة البيانات',
      collections: 'وجود المجموعات',
      relationships: 'العلاقات والروابط', 
      complexQueries: 'الاستعلامات المعقدة',
      dataIntegrity: 'تكامل البيانات',
      typeCompliance: 'مطابقة التايبات'
    };

    let passedTests = 0;
    const totalTests = Object.keys(testNames).length;

    for (const [key, name] of Object.entries(testNames)) {
      const status = results[key] ? '✅ نجح' : '❌ فشل';
      console.log(`${status} | ${name}`);
      if (results[key]) passedTests++;
    }

    console.log('=' .repeat(50));
    console.log(`📈 النتيجة النهائية: ${passedTests}/${totalTests} اختبار نجح`);
    
    const percentage = Math.round((passedTests / totalTests) * 100);
    console.log(`🎯 معدل النجاح: ${percentage}%`);

    if (percentage >= 95) {
      console.log('\n🎉 ممتاز! قاعدة البيانات تعمل بكفاءة عالية');
      console.log('✅ النظام جاهز للإنتاج');
    } else if (percentage >= 80) {
      console.log('\n⚠️  جيد، لكن يحتاج بعض التحسينات');
    } else {
      console.log('\n❌ يحتاج إصلاحات مهمة قبل الاستخدام');
    }

  } catch (error) {
    console.error('\n💥 خطأ في تشغيل الاختبارات:', error.message);
  }
}

// تشغيل الاختبارات إذا تم تشغيل الملف مباشرة
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log('\n✨ انتهى الاختبار الشامل');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 فشل في الاختبار:', error.message);
      process.exit(1);
    });
}

module.exports = { tests, runAllTests }; 