const admin = require('firebase-admin');
const fs = require('fs');

// تهيئة Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://depth-studio-default-rtdb.firebaseio.com/'
});

const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function analyzeSystem() {
  console.log('🔍 التحليل الثاني الشامل للنظام...\n');
  
  try {
    // 1. فحص Collections
    console.log('📁 فحص Collections:');
    const collections = await db.listCollections();
    console.log(`✅ تم العثور على ${collections.length} collections:\n`);
    
    const collectionData = {};
    
    for (const collection of collections) {
      const snapshot = await collection.get();
      const docs = snapshot.docs;
      
      console.log(`📂 ${collection.id}: ${docs.length} documents`);
      
      collectionData[collection.id] = {
        count: docs.length,
        documents: []
      };
      
      // تحليل بنية أول 2 documents
      for (let i = 0; i < Math.min(2, docs.length); i++) {
        const doc = docs[i];
        const data = doc.data();
        const fields = Object.keys(data);
        
        console.log(`   📄 ${doc.id}: ${fields.length} fields`);
        console.log(`      🔑 Fields: ${fields.slice(0, 8).join(', ')}${fields.length > 8 ? '...' : ''}`);
        
        collectionData[collection.id].documents.push({
          id: doc.id,
          fieldCount: fields.length,
          fields: fields
        });
      }
      
      console.log('');
    }
    
    // 2. قراءة الفهارس
    console.log('📊 فحص الفهارس:');
    let indexes = null;
    let indexesByCollection = {};
    
    try {
      const indexesContent = fs.readFileSync('./firestore.indexes.json', 'utf8');
      indexes = JSON.parse(indexesContent);
      
      // التحقق من الصيغة الجديدة أو القديمة
      let totalIndexes = 0;
      
      if (indexes.indexes) {
        // الصيغة القديمة (Firebase standard format)
        console.log(`✅ تم العثور على ${indexes.indexes.length} فهرس (صيغة Firebase):\n`);
        
        indexes.indexes.forEach(index => {
          const collection = index.collectionGroup;
          if (!indexesByCollection[collection]) {
            indexesByCollection[collection] = [];
          }
          indexesByCollection[collection].push(index.fields);
        });
        
      } else {
        // الصيغة الجديدة (مبسطة)
        for (const [collection, collectionIndexes] of Object.entries(indexes)) {
          indexesByCollection[collection] = collectionIndexes;
          totalIndexes += collectionIndexes.length;
        }
        
        console.log(`✅ تم العثور على ${totalIndexes} فهرس (صيغة مبسطة):\n`);
      }
      
      for (const [collection, collectionIndexes] of Object.entries(indexesByCollection)) {
        console.log(`📂 ${collection}: ${collectionIndexes.length} indexes`);
        
        if (Array.isArray(collectionIndexes)) {
          collectionIndexes.forEach((indexInfo, i) => {
            let indexName = '';
            
            if (typeof indexInfo === 'string') {
              indexName = indexInfo;
            } else if (indexInfo.fields) {
              indexName = indexInfo.fields.map(f => f.fieldPath).join(' + ');
            } else {
              indexName = JSON.stringify(indexInfo);
            }
            
            console.log(`   📊 Index ${i+1}: ${indexName}`);
          });
        }
        console.log('');
      }
      
    } catch (error) {
      console.log('❌ خطأ في قراءة الفهارس:', error.message);
    }
    
    // 3. قراءة القواعد (من الملف المحلي)
    console.log('🔒 فحص قواعد الأمان:');
    try {
      const rulesContent = fs.readFileSync('../firestore.rules', 'utf8');
      const rulesLines = rulesContent.split('\n').length;
      console.log(`✅ ملف القواعد: ${rulesLines} سطر`);
      
      // تحليل Collections المذكورة في القواعد
      const collectionsInRules = [];
      const lines = rulesContent.split('\n');
      lines.forEach(line => {
        const match = line.match(/match \/([^\/\{]+)\/\{/);
        if (match && match[1] !== 'databases' && match[1] !== 'document=**') {
          collectionsInRules.push(match[1]);
        }
      });
      
      console.log(`🔐 Collections في القواعد: ${collectionsInRules.join(', ')}\n`);
      
    } catch (error) {
      console.log('❌ خطأ في قراءة ملف القواعد:', error.message);
    }
    
    // 4. تحليل التوافق
    console.log('🔍 تحليل التوافق:');
    
    // المقارنة مع Collections المتوقعة
    const expectedCollections = [
      'users', 'user_permissions', 'photographer_info', 'brands', 
      'campaigns', 'content', 'content_categories', 'payments', 
      'equipment', 'notifications'
    ];
    
    const actualCollections = Object.keys(collectionData);
    
    console.log('📋 مقارنة Collections:');
    expectedCollections.forEach(expected => {
      if (actualCollections.includes(expected)) {
        console.log(`   ✅ ${expected}: موجود (${collectionData[expected].count} documents)`);
      } else {
        console.log(`   ❌ ${expected}: مفقود`);
      }
    });
    
    // Collections إضافية
    const extraCollections = actualCollections.filter(actual => !expectedCollections.includes(actual));
    if (extraCollections.length > 0) {
      console.log(`   ⚠️ Collections إضافية: ${extraCollections.join(', ')}`);
    }
    
    console.log('');
    
    // 5. تحليل الفهارس vs Collections
    console.log('📊 مقارنة الفهارس:');
    
    const indexCollections = Object.keys(indexesByCollection);
    expectedCollections.forEach(collection => {
      if (indexCollections.includes(collection)) {
        const count = indexesByCollection[collection].length;
        console.log(`   ✅ ${collection}: ${count} فهرس`);
      } else {
        console.log(`   ❌ ${collection}: لا يوجد فهارس`);
      }
    });
    
    console.log('');
    
    // 6. إحصائيات شاملة
    console.log('📈 الإحصائيات الشاملة:');
    console.log(`   📁 Collections: ${actualCollections.length}/${expectedCollections.length}`);
    
    const totalIndexesCount = indexes ? (indexes.indexes ? indexes.indexes.length : totalIndexes) : 0;
    console.log(`   📊 فهارس: ${totalIndexesCount}`);
    console.log(`   📄 مجموع Documents: ${Object.values(collectionData).reduce((sum, col) => sum + col.count, 0)}`);
    
    // حساب التوافق
    const collectionCompatibility = (actualCollections.filter(c => expectedCollections.includes(c)).length / expectedCollections.length) * 100;
    const indexCompatibility = (indexCollections.filter(c => expectedCollections.includes(c)).length / expectedCollections.length) * 100;
    
    console.log(`   🎯 توافق Collections: ${collectionCompatibility.toFixed(1)}%`);
    console.log(`   🎯 توافق الفهارس: ${indexCompatibility.toFixed(1)}%`);
    
    console.log('\n✅ التحليل مكتمل!');
    
  } catch (error) {
    console.error('❌ خطأ في التحليل:', error);
  } finally {
    process.exit(0);
  }
}

analyzeSystem(); 