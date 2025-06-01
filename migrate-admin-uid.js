const admin = require('firebase-admin');

// تهيئة Firebase Admin (إذا لم تكن مهيأة)
if (!admin.apps.length) {
  const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-fd3e03428e.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'depth-studio'
  });
}

const db = admin.firestore();

async function migrateAdminUser() {
  console.log('🚀 بدء نقل بيانات المدير إلى UID الصحيح...\n');

  try {
    // 1. جلب البيانات الحالية
    const oldDoc = await db.collection('users').doc('temp-admin-001').get();
    
    if (!oldDoc.exists) {
      console.log('❌ لا توجد بيانات في temp-admin-001');
      return;
    }

    const userData = oldDoc.data();
    const realUID = userData.firebase_uid;
    
    console.log(`📧 Email: ${userData.email}`);
    console.log(`🆔 Real UID: ${realUID}`);
    console.log(`👤 Role: ${userData.primary_role}\n`);

    // 2. إنشاء document جديد بـ UID الصحيح
    console.log('📝 إنشاء document جديد...');
    await db.collection('users').doc(realUID).set({
      ...userData,
      status: 'active', // تأكد من أن المدير active
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      migration_note: `تم النقل من ${oldDoc.id} في ${new Date().toISOString()}`
    });

    // 3. حذف document القديم
    console.log('🗑️ حذف document القديم...');
    await db.collection('users').doc('temp-admin-001').delete();

    // 4. التحقق من النجاح
    console.log('✅ تم النقل بنجاح!\n');
    
    const newDoc = await db.collection('users').doc(realUID).get();
    if (newDoc.exists) {
      const newData = newDoc.data();
      console.log('🔍 تأكيد البيانات الجديدة:');
      console.log(`   📧 Email: ${newData.email}`);
      console.log(`   🆔 Document ID: ${newDoc.id}`);
      console.log(`   👤 Role: ${newData.primary_role}`);
      console.log(`   ✅ Status: ${newData.status}`);
      console.log('\n🎉 يمكنك الآن تسجيل الدخول بنجاح!');
    }

  } catch (error) {
    console.error('❌ خطأ في النقل:', error);
  }
}

// تشغيل النقل
migrateAdminUser()
  .then(() => {
    console.log('\n✨ انتهت العملية!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ فشل في العملية:', error);
    process.exit(1);
  }); 