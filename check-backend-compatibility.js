const admin = require('firebase-admin');
const serviceAccount = require('./service account key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function checkBackendCompatibility() {
  console.log('🔍 فحص التوافق بين Backend وقاعدة البيانات - Depth Studio\n');
  
  // APIs المطلوبة في Backend
  const requiredCollections = [
    'users', 'user_permissions', 'roles', 'brands', 'smart_campaigns',
    'campaign_tasks', 'photographer_profiles', 'brand_coordinators',
    'content_library', 'content_categories', 'equipment', 'payments',
    'analytics', 'audit_logs', 'messages', 'settings', 'templates'
  ];
  
  console.log('📊 فحص المجموعات المطلوبة في Backend:');
  let compatibleCount = 0;
  
  for (const collection of requiredCollections) {
    try {
      const snapshot = await db.collection(collection).limit(1).get();
      const exists = !snapshot.empty;
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${collection} - موجود: ${exists}`);
      
      if (exists) {
        compatibleCount++;
        
        // فحص بنية البيانات لمجموعات مهمة
        if (['users', 'brands', 'smart_campaigns'].includes(collection)) {
          const doc = snapshot.docs[0];
          const data = doc.data();
          const fields = Object.keys(data);
          console.log(`   🔑 الحقول (${fields.length}): ${fields.slice(0, 8).join(', ')}${fields.length > 8 ? '...' : ''}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${collection} - خطأ: ${error.message}`);
    }
  }
  
  console.log(`\n📈 نتيجة التوافق: ${compatibleCount}/${requiredCollections.length} (${Math.round(compatibleCount/requiredCollections.length*100)}%)\n`);
  
  // فحص Collections إضافية غير متوقعة
  console.log('🔍 فحص Collections إضافية:');
  const allCollections = await db.listCollections();
  const extraCollections = allCollections
    .map(c => c.id)
    .filter(id => !requiredCollections.includes(id));
  
  if (extraCollections.length > 0) {
    console.log('📁 Collections إضافية موجودة:');
    extraCollections.forEach(collection => {
      console.log(`   ➕ ${collection}`);
    });
  } else {
    console.log('✅ لا توجد collections إضافية');
  }
  
  // فحص الحقول المهمة
  console.log('\n🔑 فحص الحقول الحرجة:');
  await checkCriticalFields();
}

async function checkCriticalFields() {
  const criticalChecks = [
    {
      collection: 'users',
      requiredFields: ['email', 'primary_role', 'firebase_uid', 'is_active'],
      description: 'حقول المستخدمين الأساسية'
    },
    {
      collection: 'brands',
      requiredFields: ['name', 'status', 'brand_type', 'industry'],
      description: 'حقول البراندات الأساسية'
    },
    {
      collection: 'smart_campaigns',
      requiredFields: ['campaign_info', 'campaign_status', 'created_at'],
      description: 'حقول الحملات الأساسية'
    }
  ];
  
  for (const check of criticalChecks) {
    try {
      const snapshot = await db.collection(check.collection).limit(1).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        const availableFields = Object.keys(data);
        
        console.log(`📋 ${check.description}:`);
        let missingFields = [];
        
        for (const field of check.requiredFields) {
          const exists = availableFields.includes(field);
          const status = exists ? '✅' : '❌';
          console.log(`   ${status} ${field}`);
          if (!exists) missingFields.push(field);
        }
        
        if (missingFields.length > 0) {
          console.log(`   ⚠️ حقول مفقودة: ${missingFields.join(', ')}`);
        }
      }
    } catch (error) {
      console.log(`❌ خطأ في فحص ${check.collection}: ${error.message}`);
    }
  }
}

checkBackendCompatibility().catch(console.error); 