const admin = require('firebase-admin');
const serviceAccount = require('./service account key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.settings({ databaseId: 'depth-production' });

async function checkDatabaseSchema() {
  console.log('🔍 فحص مخطط قاعدة البيانات - Depth Studio\n');
  
  try {
    const collections = await db.listCollections();
    console.log(`📊 إجمالي المجموعات: ${collections.length}\n`);
    
    for (const collection of collections) {
      console.log(`📁 مجموعة: ${collection.id}`);
      
      const snapshot = await collection.limit(3).get();
      console.log(`   📋 عدد الوثائق: ${snapshot.size}`);
      
      if (!snapshot.empty) {
        const firstDoc = snapshot.docs[0];
        const data = firstDoc.data();
        const fields = Object.keys(data);
        
        console.log(`   🔑 الحقول الموجودة (${fields.length}):`);
        fields.forEach(field => {
          const value = data[field];
          const type = Array.isArray(value) ? 'array' : typeof value;
          console.log(`      - ${field}: ${type}`);
        });
      }
      console.log('');
    }
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

checkDatabaseSchema(); 