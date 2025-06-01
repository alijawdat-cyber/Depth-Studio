// 🌱 زراعة البيانات الأولية باستخدام Firebase Web SDK
// 📅 تاريخ الإنشاء: 31 مايو 2025
// 👤 المطور: علي جودت

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection } = require('firebase/firestore');
const fs = require('fs');

// إعدادات Firebase project
const firebaseConfig = {
  projectId: 'depth-studio',
  apiKey: 'placeholder-key', // سيتم استبداله بـ actual key
  authDomain: 'depth-studio.firebaseapp.com',
  storageBucket: 'depth-studio.appspot.com',
  messagingSenderId: 'placeholder-sender-id',
  appId: 'placeholder-app-id'
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// قراءة البيانات من ملف JSON
const seedData = JSON.parse(fs.readFileSync('seed-data.json', 'utf8'));

async function uploadData() {
  console.log('🌱 بدء عملية رفع البيانات الأولية إلى Firestore...\n');
  
  try {
    // رفع كل مجموعة على حدة
    for (const [collectionName, collectionData] of Object.entries(seedData)) {
      console.log(`📂 رفع مجموعة: ${collectionName}`);
      
      const documents = Object.entries(collectionData);
      console.log(`   📄 عدد الوثائق: ${documents.length}`);
      
      // رفع كل وثيقة في المجموعة
      for (const [docId, docData] of documents) {
        try {
          const docRef = doc(db, collectionName, docId);
          await setDoc(docRef, docData);
          console.log(`   ✅ تم رفع الوثيقة: ${docId}`);
        } catch (error) {
          console.error(`   ❌ خطأ في رفع الوثيقة ${docId}:`, error.message);
        }
      }
      
      console.log(`✅ تم الانتهاء من مجموعة ${collectionName}\n`);
    }
    
    console.log('🎉 تم رفع جميع البيانات بنجاح!');
    
    // ملخص البيانات المرفوعة
    console.log('\n📋 ملخص البيانات المرفوعة:');
    Object.keys(seedData).forEach(collectionName => {
      const documentsCount = Object.keys(seedData[collectionName]).length;
      console.log(`- ${collectionName}: ${documentsCount} وثيقة`);
    });
    
  } catch (error) {
    console.error('❌ خطأ عام في عملية الرفع:', error);
  }
}

// تنفيذ الدالة
uploadData().then(() => {
  console.log('\n✅ انتهت العملية بنجاح!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ فشلت العملية:', error);
  process.exit(1);
}); 