# 🔥 **دليل أوامر Firebase CLI الشامل - Depth Studio**

**📅 تاريخ الإنشاء:** ديسمبر 2024  
**👤 المؤلف:** علي جودت  
**🎯 المشروع:** Depth Studio  
**🗄️ قاعدة البيانات:** depth-production  

---

## 📋 **جدول المحتويات**

1. [معلومات قاعدة البيانات الأساسية](#-معلومات-قاعدة-البيانات-الأساسية)
2. [أوامر Firebase CLI للقراءة](#-أوامر-firebase-cli-للقراءة)
3. [أوامر Node.js المباشرة](#-أوامر-nodejs-المباشرة)
4. [قراءة المجموعات والوثائق](#-قراءة-المجموعات-والوثائق)
5. [أوامر الفحص والتشخيص](#-أوامر-الفحص-والتشخيص)
6. [استخراج البيانات الكاملة](#-استخراج-البيانات-الكاملة)
7. [أمثلة عملية متقدمة](#-أمثلة-عملية-متقدمة)

---

## 🗄️ **معلومات قاعدة البيانات الأساسية**

### **🔥 Firebase Project Info:**
```bash
📋 Project ID: depth-studio
📍 Database: depth-production
🌍 Location: nam5 (North America)
🔧 Type: FIRESTORE_NATIVE
📅 Created: June 3, 2025
🔒 Security: Rules Active
```

### **📊 إحصائيات سريعة:**
```bash
📁 Collections: 19
📄 Documents: 25+
👥 Users: 1 (Ali Jawdat)
🔑 Roles: 4 (Super Admin, Marketing, Brand, Photographer)
🏢 Brands: 1 (Sample Brand)
```

---

## 🔥 **أوامر Firebase CLI للقراءة**

### **1. معلومات المشروع والاتصال:**

#### **🔍 فحص المشاريع المتاحة:**
```bash
firebase projects:list
```

#### **📊 معلومات المشروع الحالي:**
```bash
firebase use
```

#### **🔄 تبديل المشروع:**
```bash
firebase use depth-studio
```

#### **✅ فحص حالة الاتصال:**
```bash
firebase login:list
```

---

### **2. أوامر قواعد البيانات:**

#### **📋 قائمة قواعد البيانات:**
```bash
firebase firestore:databases:list
```
**النتيجة المتوقعة:**
```
┌─────────────────────────────────────────────────────┐
│ Database Name                                       │
├─────────────────────────────────────────────────────┤
│ projects/depth-studio/databases/depth-production    │
└─────────────────────────────────────────────────────┘
```

#### **📊 معلومات قاعدة بيانات محددة:**
```bash
firebase firestore:databases:get depth-production
```
**النتيجة المتوقعة:**
```
┌──────────────────────────────┬─────────────────────────────────────────────────────┐
│ Field                        │ Value                                               │
├──────────────────────────────┼─────────────────────────────────────────────────────┤
│ Name                         │ projects/depth-studio/databases/depth-production    │
├──────────────────────────────┼─────────────────────────────────────────────────────┤
│ Location                     │ nam5                                                │
├──────────────────────────────┼─────────────────────────────────────────────────────┤
│ Type                         │ FIRESTORE_NATIVE                                    │
└──────────────────────────────┴─────────────────────────────────────────────────────┘
```

#### **🔍 فحص فهارس قاعدة البيانات:**
```bash
firebase firestore:indexes
```

#### **📍 مواقع قواعد البيانات المتاحة:**
```bash
firebase firestore:locations
```

---

### **3. أوامر المصادقة (Authentication):**

#### **📊 تصدير بيانات المصادقة:**
```bash
firebase auth:export users_backup.json
```

#### **👥 فحص إعدادات المصادقة:**
```bash
# لا يوجد أمر مباشر - يتم من Console
```

---

## 💻 **أوامر Node.js المباشرة**

### **🔧 الإعداد الأساسي:**
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });
```

### **1. قراءة جميع المجموعات:**

#### **📁 قائمة المجموعات:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });
db.listCollections().then(collections => {
  console.log('📊 Collections:', collections.length);
  collections.forEach(c => console.log('📁', c.id));
});
"
```

**النتيجة المتوقعة:**
```
📊 Collections: 19
📁 analytics
📁 audit_logs
📁 brand_coordinators
📁 brands
📁 campaign_notifications
📁 campaign_tasks
📁 content
📁 content_categories
📁 content_library
📁 equipment
📁 messages
📁 payments
📁 photographer_profiles
📁 roles
📁 settings
📁 smart_campaigns
📁 templates
📁 user_permissions
📁 users
```

---

## 📄 **قراءة المجموعات والوثائق**

### **👥 1. Users Collection:**

#### **قراءة جميع المستخدمين:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function showUsers() {
  const snapshot = await db.collection('users').get();
  console.log('👥 Users Collection:', snapshot.size, 'documents');
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('📄 ID:', doc.id);
    console.log('👤 Name:', data.display_name || data.name);
    console.log('📧 Email:', data.email);
    console.log('🔑 Role:', data.primary_role || data.role);
    console.log('✅ Active:', data.is_active);
    console.log('📅 Created:', data.created_at?.toDate());
    console.log('🕐 Last Login:', data.last_login?.toDate());
    console.log('---');
  });
}
showUsers();
"
```

#### **قراءة مستخدم محدد:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function getUser(userId) {
  const doc = await db.collection('users').doc(userId).get();
  if (doc.exists) {
    console.log('👤 User Data:');
    console.log(JSON.stringify(doc.data(), null, 2));
  } else {
    console.log('❌ User not found');
  }
}
getUser('h1NiEMj7IlXRDxsJvglnT46Cjj22');
"
```

---

### **🔑 2. Roles Collection:**

#### **قراءة جميع الأدوار:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function showRoles() {
  const snapshot = await db.collection('roles').get();
  console.log('🔑 Roles Collection:', snapshot.size, 'documents');
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('📄 ID:', doc.id);
    console.log('🏷️ Role Name:', data.role_name);
    console.log('🇦🇷 Display Name:', data.display_name);
    console.log('📝 Description:', data.description);
    console.log('📊 Hierarchy Level:', data.hierarchy_level);
    console.log('🔒 Permissions:', JSON.stringify(data.permissions, null, 2));
    console.log('---');
  });
}
showRoles();
"
```

---

### **🏢 3. Brands Collection:**

#### **قراءة جميع البراندات:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function showBrands() {
  const snapshot = await db.collection('brands').get();
  console.log('🏢 Brands Collection:', snapshot.size, 'documents');
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('📄 ID:', doc.id);
    console.log('🏷️ Name AR:', data.name?.ar || data.name);
    console.log('🏷️ Name EN:', data.name?.en);
    console.log('💼 Type:', data.brand_type);
    console.log('🏭 Industry:', data.industry);
    console.log('✅ Status:', data.status);
    console.log('📞 Contact:', JSON.stringify(data.contact_info, null, 2));
    console.log('💰 Budget:', JSON.stringify(data.budget_settings, null, 2));
    console.log('---');
  });
}
showBrands();
"
```

---

### **⚙️ 4. Settings Collection:**

#### **قراءة جميع الإعدادات:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function showSettings() {
  const snapshot = await db.collection('settings').get();
  console.log('⚙️ Settings Collection:', snapshot.size, 'documents');
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('📄 ID:', doc.id);
    console.log('🏷️ Key:', data.setting_key);
    console.log('📋 Category:', data.category);
    console.log('💾 Value:', JSON.stringify(data.setting_value, null, 2));
    console.log('📝 Description:', data.description);
    console.log('🔒 Public:', data.is_public);
    console.log('✅ Active:', data.is_active);
    console.log('---');
  });
}
showSettings();
"
```

---

### **🎥 5. Equipment Collection:**

#### **قراءة جميع المعدات:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function showEquipment() {
  const snapshot = await db.collection('equipment').get();
  console.log('🎥 Equipment Collection:', snapshot.size, 'documents');
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('📄 ID:', doc.id);
    console.log('📷 Name AR:', data.name?.ar);
    console.log('📷 Name EN:', data.name?.en);
    console.log('🏷️ Type:', data.equipment_type);
    console.log('🏭 Brand:', data.brand);
    console.log('🎯 Model:', data.model);
    console.log('✅ Available:', data.availability?.is_available);
    console.log('🔧 Condition:', data.condition);
    console.log('📍 Location:', data.location_info?.current_location);
    console.log('---');
  });
}
showEquipment();
"
```

---

### **📊 6. Analytics Collection:**

#### **قراءة تحليلات النظام:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function showAnalytics() {
  const snapshot = await db.collection('analytics').get();
  console.log('📊 Analytics Collection:', snapshot.size, 'documents');
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('📄 ID:', doc.id);
    console.log('🎯 Type:', data.analytics_type);
    console.log('🌍 Context:', JSON.stringify(data.context, null, 2));
    console.log('📈 Event Info:', JSON.stringify(data.event_info, null, 2));
    console.log('📅 Created:', data.created_at?.toDate());
    console.log('---');
  });
}
showAnalytics();
"
```

---

## 🔍 **أوامر الفحص والتشخيص**

### **1. اختبار شامل للنظام:**
```bash
node test-database.js
```

### **2. فحص الاتصال:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function testConnection() {
  try {
    const testDoc = await db.collection('users').limit(1).get();
    console.log('✅ الاتصال ناجح - قاعدة البيانات متاحة');
    console.log('📊 وجد', testDoc.size, 'وثيقة في مجموعة users');
  } catch (error) {
    console.error('❌ فشل الاتصال:', error.message);
  }
}
testConnection();
"
```

### **3. إحصائيات سريعة:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function quickStats() {
  try {
    const collections = await db.listCollections();
    console.log('📊 إجمالي المجموعات:', collections.length);
    
    for(const collection of collections) {
      const snapshot = await collection.limit(100).get();
      console.log('📁', collection.id + ':', snapshot.size, 'وثيقة');
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}
quickStats();
"
```

---

## 📤 **استخراج البيانات الكاملة**

### **1. تصدير مجموعة كاملة:**
```bash
node -e "
const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function exportCollection(collectionName) {
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = {};
    
    snapshot.forEach(doc => {
      data[doc.id] = doc.data();
    });
    
    fs.writeFileSync(\`\${collectionName}_backup.json\`, JSON.stringify(data, null, 2));
    console.log('✅ تم تصدير', collectionName, 'إلى الملف:', \`\${collectionName}_backup.json\`);
  } catch (error) {
    console.error('❌ خطأ في التصدير:', error.message);
  }
}

exportCollection('users');
"
```

### **2. تصدير قاعدة البيانات كاملة:**
```bash
node -e "
const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function fullBackup() {
  try {
    const collections = await db.listCollections();
    const backup = {};
    
    for(const collection of collections) {
      const snapshot = await collection.get();
      backup[collection.id] = {};
      
      snapshot.forEach(doc => {
        backup[collection.id][doc.id] = doc.data();
      });
      
      console.log('✅ تم تصدير', collection.id, ':', snapshot.size, 'وثيقة');
    }
    
    fs.writeFileSync('depth_studio_full_backup.json', JSON.stringify(backup, null, 2));
    console.log('🎉 تم إنشاء نسخة احتياطية كاملة: depth_studio_full_backup.json');
  } catch (error) {
    console.error('❌ خطأ في النسخ الاحتياطي:', error.message);
  }
}

fullBackup();
"
```

---

## 🔍 **أمثلة عملية متقدمة**

### **1. البحث مع فلتر:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function searchActiveUsers() {
  const snapshot = await db.collection('users')
    .where('is_active', '==', true)
    .orderBy('created_at', 'desc')
    .get();
  
  console.log('👥 المستخدمين النشطين:', snapshot.size);
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('-', data.display_name, '(' + data.primary_role + ')');
  });
}
searchActiveUsers();
"
```

### **2. عد الوثائق في كل مجموعة:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function countDocuments() {
  const collections = await db.listCollections();
  const counts = {};
  
  for(const collection of collections) {
    const snapshot = await collection.count().get();
    counts[collection.id] = snapshot.data().count;
  }
  
  console.log('📊 عدد الوثائق في كل مجموعة:');
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([name, count]) => {
      console.log(\`📁 \${name}: \${count} وثيقة\`);
    });
}
countDocuments();
"
```

### **3. تحليل البيانات بالتاريخ:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function analyzeByDate() {
  const snapshot = await db.collection('users').get();
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.created_at) {
      const date = data.created_at.toDate();
      console.log('👤', data.display_name, 'تم إنشاؤه في:', date.toLocaleDateString('ar-EG'));
    }
  });
}
analyzeByDate();
"
```

---

## 🛠️ **أوامر الصيانة والمراقبة**

### **1. مراقبة النشاط:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function monitorActivity() {
  const snapshot = await db.collection('users').get();
  
  console.log('📊 نشاط المستخدمين:');
  snapshot.forEach(doc => {
    const data = doc.data();
    const lastLogin = data.last_login ? data.last_login.toDate() : 'لم يسجل دخول مطلقاً';
    const isOnline = data.is_online ? '🟢 متصل' : '🔴 غير متصل';
    
    console.log(\`👤 \${data.display_name}: \${isOnline}, آخر دخول: \${lastLogin}\`);
  });
}
monitorActivity();
"
```

### **2. فحص سلامة البيانات:**
```bash
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-b3e31c6dcb.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function checkDataIntegrity() {
  console.log('🔍 فحص سلامة البيانات...');
  
  // فحص المستخدمين بدون أدوار
  const users = await db.collection('users').get();
  const usersWithoutRoles = [];
  
  users.forEach(doc => {
    const data = doc.data();
    if (!data.primary_role) {
      usersWithoutRoles.push(data.display_name || doc.id);
    }
  });
  
  if (usersWithoutRoles.length > 0) {
    console.log('⚠️ مستخدمين بدون أدوار:', usersWithoutRoles);
  } else {
    console.log('✅ جميع المستخدمين لديهم أدوار');
  }
  
  // فحص البراندات النشطة
  const brands = await db.collection('brands').where('status', '==', 'active').get();
  console.log('🏢 البراندات النشطة:', brands.size);
}
checkDataIntegrity();
"
```

---

## 📝 **ملاحظات مهمة**

### **🔒 الأمان:**
- استخدم ملف `service account` الصحيح
- احم ملف المفاتيح من الوصول العام
- راجع صلاحيات Firebase Rules

### **⚡ الأداء:**
- استخدم `.limit()` للاستعلامات الكبيرة
- استخدم الفهارس للاستعلامات المعقدة
- راقب استهلاك القراءات

### **🔄 النسخ الاحتياطي:**
- قم بنسخ احتياطي دوري
- احفظ النسخ في مكان آمن
- اختبر استعادة البيانات

---

## 🎯 **الخلاصة**

هذا الدليل يغطي جميع طرق قراءة بيانات Firebase Firestore لمشروع Depth Studio، من الأوامر الأساسية إلى التحليلات المتقدمة. استخدم هذه الأوامر للمراقبة والصيانة والتطوير.

**آخر تحديث:** ديسمبر 2024  
**المطور:** Ali Jawdat  
**للدعم:** alijawdat4@gmail.com 