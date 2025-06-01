// 🌱 زراعة البيانات الأولية باستخدام Service Account Key
// 📅 تاريخ الإنشاء: 31 مايو 2025
// 👤 المطور: علي جودت

const admin = require('firebase-admin');
const fs = require('fs');

// قراءة Service Account Key
let serviceAccount;
try {
  // البحث عن Service Account Key file
  const possibleFiles = [
    'depth-studio-firebase-adminsdk-fbsvc-fd3e03428e.json', // الاسم الفعلي الجديد
    'depth-studio-firebase-adminsdk.json',
    'serviceAccountKey.json',
    'firebase-service-account.json'
  ];
  
  let keyFile = null;
  
  // البحث الأول: بحث مباشر بالأسماء
  for (const file of possibleFiles) {
    if (fs.existsSync(file)) {
      keyFile = file;
      break;
    }
  }
  
  // البحث الثاني: pattern matching للملفات اللي تبدأ بـ depth-studio-firebase-adminsdk
  if (!keyFile) {
    const files = fs.readdirSync('.');
    keyFile = files.find(file => 
      file.startsWith('depth-studio-firebase-adminsdk') && file.endsWith('.json')
    );
  }
  
  if (!keyFile) {
    console.error('❌ لم يتم العثور على Service Account Key file');
    console.log('💡 يرجى تحميل الملف من Firebase Console ووضعه في المجلد الحالي');
    console.log('📁 أسماء الملفات المقبولة:');
    possibleFiles.forEach(name => console.log(`   - ${name}`));
    console.log('   - أو أي ملف يبدأ بـ depth-studio-firebase-adminsdk');
    process.exit(1);
  }
  
  serviceAccount = require(`./${keyFile}`);
  console.log(`✅ تم تحميل Service Account Key من: ${keyFile}`);
  
} catch (error) {
  console.error('❌ خطأ في تحميل Service Account Key:', error.message);
  process.exit(1);
}

// تهيئة Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://depth-studio-default-rtdb.firebaseio.com/`
  });
}

const db = admin.firestore();
const auth = admin.auth();

// قراءة البيانات من ملف JSON
const seedData = JSON.parse(fs.readFileSync('seed-data.json', 'utf8'));

async function uploadDataToFirestore() {
  console.log('🌱 بدء عملية رفع البيانات الأولية إلى Firestore...\n');
  
  let totalDocuments = 0;
  let successCount = 0;
  let errorCount = 0;
  
  try {
    // رفع كل مجموعة على حدة
    for (const [collectionName, collectionData] of Object.entries(seedData)) {
      console.log(`📂 رفع مجموعة: ${collectionName}`);
      
      const documents = Object.entries(collectionData);
      console.log(`   📄 عدد الوثائق: ${documents.length}`);
      totalDocuments += documents.length;
      
      // رفع كل وثيقة في المجموعة
      for (const [docId, docData] of documents) {
        try {
          // تحويل timestamp objects إلى Firebase Timestamp
          const processedData = processTimestamps(docData);
          
          await db.collection(collectionName).doc(docId).set(processedData);
          console.log(`   ✅ تم رفع الوثيقة: ${docId}`);
          successCount++;
        } catch (error) {
          console.error(`   ❌ خطأ في رفع الوثيقة ${docId}:`, error.message);
          errorCount++;
        }
      }
      
      console.log(`✅ تم الانتهاء من مجموعة ${collectionName}\n`);
    }
    
    // ملخص النتائج
    console.log('🎉 تم الانتهاء من عملية الرفع!');
    console.log('\n📊 ملخص النتائج:');
    console.log(`📂 المجموعات: ${Object.keys(seedData).length}`);
    console.log(`📄 إجمالي الوثائق: ${totalDocuments}`);
    console.log(`✅ نجحت: ${successCount}`);
    console.log(`❌ فشلت: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎊 تم رفع جميع البيانات بنجاح!');
    } else {
      console.log(`\n⚠️ تم رفع ${successCount} من ${totalDocuments} وثيقة`);
    }
    
  } catch (error) {
    console.error('❌ خطأ عام في عملية الرفع:', error);
  }
}

// دالة لمعالجة timestamps
function processTimestamps(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(processTimestamps);
  }
  
  const processed = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && value._seconds) {
      // تحويل timestamp object إلى Firebase Timestamp
      processed[key] = admin.firestore.Timestamp.fromMillis(value._seconds * 1000);
    } else if (typeof value === 'object') {
      processed[key] = processTimestamps(value);
    } else {
      processed[key] = value;
    }
  }
  
  return processed;
}

// دالة لإنشاء المستخدمين في Firebase Auth (اختيارية)
async function createAuthUsers() {
  console.log('👥 بدء إنشاء حسابات Firebase Auth...\n');
  
  const users = seedData.users;
  if (!users) {
    console.log('⚠️ لا توجد بيانات مستخدمين للإنشاء');
    return;
  }
  
  for (const [docId, userData] of Object.entries(users)) {
    try {
      const userRecord = await auth.createUser({
        uid: docId,
        email: userData.email,
        displayName: userData.display_name,
        emailVerified: userData.is_verified || false,
        disabled: !userData.is_active
      });
      
      console.log(`✅ تم إنشاء حساب Firebase Auth: ${userData.display_name} (${userRecord.uid})`);
    } catch (error) {
      if (error.code === 'auth/uid-already-exists') {
        console.log(`⚠️ المستخدم ${userData.display_name} موجود مسبقاً`);
      } else {
        console.error(`❌ خطأ في إنشاء المستخدم ${userData.display_name}:`, error.message);
      }
    }
  }
}

// التنفيذ الرئيسي
async function main() {
  try {
    console.log('🚀 بدء عملية زراعة البيانات الشاملة...\n');
    
    // 1. رفع البيانات إلى Firestore
    await uploadDataToFirestore();
    
    console.log('\n' + '='.repeat(50));
    
    // 2. إنشاء حسابات المستخدمين (اختياري)
    const createUsers = process.argv.includes('--create-auth-users');
    if (createUsers) {
      await createAuthUsers();
    } else {
      console.log('💡 لإنشاء حسابات Firebase Auth أيضاً، استخدم: npm run seed -- --create-auth-users');
    }
    
    console.log('\n✅ تم الانتهاء من جميع العمليات بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في العملية الرئيسية:', error);
    process.exit(1);
  }
}

// تشغيل السكريبت
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ فشل في تنفيذ السكريبت:', error);
      process.exit(1);
    });
}

module.exports = { uploadDataToFirestore, createAuthUsers }; 