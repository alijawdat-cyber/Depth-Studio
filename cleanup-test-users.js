// 🧹 تنظيف المستخدمين التجريبيين من Firestore - Depth Studio
// 📅 تاريخ الإنشاء: 28 يناير 2025
// 👤 المطور: Sonnet 4 بناءً على طلب علي جودت
// 🎯 الهدف: حذف بيانات المستخدمين التجريبيين قبل بناء نظام التسجيل الجديد

const admin = require('firebase-admin');

// تهيئة Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = require('./depth-studio-firebase-adminsdk-fbsvc-fd3e03428e.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'depth-studio'
    });
    console.log('✅ تم تهيئة Firebase Admin SDK بنجاح');
  } catch (error) {
    console.error('❌ خطأ في تهيئة Firebase Admin SDK:', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

// 📋 قائمة المستخدمين المطلوب حذفهم
const USERS_TO_DELETE = [
  {
    email: 'hassan.hashim@depthstudio.iq',
    displayName: 'حسن هاشم',
    role: 'marketing_coordinator'
  },
  {
    email: 'ali.hazim@depthstudio.iq',
    displayName: 'علي حازم',
    role: 'brand_coordinator'
  },
  {
    email: 'hiba.mohamed@depthstudio.iq',
    displayName: 'هبة محمد',
    role: 'photographer'
  },
  {
    email: 'mohammed.qasim@depthstudio.iq',
    displayName: 'محمد قاسم',
    role: 'photographer'
  }
];

// 🔍 البحث عن مستخدم بناءً على البريد الإلكتروني
async function findUserByEmail(email) {
  try {
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .get();
    
    if (usersSnapshot.empty) {
      console.log(`⚠️ لم يتم العثور على مستخدم بالبريد: ${email}`);
      return null;
    }
    
    const userDoc = usersSnapshot.docs[0];
    return {
      id: userDoc.id,
      data: userDoc.data()
    };
  } catch (error) {
    console.error(`❌ خطأ في البحث عن المستخدم ${email}:`, error.message);
    return null;
  }
}

// 🗑️ حذف وثيقة مستخدم من مجموعة users
async function deleteUserDocument(userId, userEmail, userName) {
  try {
    await db.collection('users').doc(userId).delete();
    console.log(`✅ تم حذف المستخدم من مجموعة users: ${userName} (${userEmail})`);
    return true;
  } catch (error) {
    console.error(`❌ خطأ في حذف المستخدم ${userName}:`, error.message);
    return false;
  }
}

// 🔐 حذف صلاحيات المستخدم من user_permissions
async function deleteUserPermissions(userId, userName) {
  try {
    const permDoc = await db.collection('user_permissions').doc(userId).get();
    if (permDoc.exists) {
      await db.collection('user_permissions').doc(userId).delete();
      console.log(`✅ تم حذف صلاحيات المستخدم: ${userName}`);
      return true;
    } else {
      console.log(`⚠️ لا توجد صلاحيات للمستخدم: ${userName}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ خطأ في حذف صلاحيات المستخدم ${userName}:`, error.message);
    return false;
  }
}

// 📷 حذف ملف المصور من photographer_profiles
async function deletePhotographerProfile(userId, userName) {
  try {
    const profileDoc = await db.collection('photographer_profiles').doc(userId).get();
    if (profileDoc.exists) {
      await db.collection('photographer_profiles').doc(userId).delete();
      console.log(`✅ تم حذف ملف المصور: ${userName}`);
      return true;
    } else {
      console.log(`⚠️ لا يوجد ملف مصور للمستخدم: ${userName}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ خطأ في حذف ملف المصور ${userName}:`, error.message);
    return false;
  }
}

// 🏢 حذف منسق البراند من brand_coordinators
async function deleteBrandCoordinator(userId, userName) {
  try {
    // البحث عن وثيقة منسق البراند
    const coordinatorSnapshot = await db.collection('brand_coordinators')
      .where('coordinator_user_id', '==', userId)
      .get();
    
    if (coordinatorSnapshot.empty) {
      console.log(`⚠️ لا توجد وثيقة منسق براند للمستخدم: ${userName}`);
      return true;
    }
    
    // حذف جميع الوثائق المرتبطة بهذا المنسق
    const deletePromises = coordinatorSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);
    
    console.log(`✅ تم حذف وثائق منسق البراند: ${userName} (${coordinatorSnapshot.size} وثيقة)`);
    return true;
  } catch (error) {
    console.error(`❌ خطأ في حذف منسق البراند ${userName}:`, error.message);
    return false;
  }
}

// 🔄 حذف مستخدم واحد مع جميع الوثائق المرتبطة
async function deleteUserCompletely(userInfo) {
  console.log(`\n🔄 بدء حذف المستخدم: ${userInfo.displayName} (${userInfo.email})`);
  
  // 1. البحث عن المستخدم
  const user = await findUserByEmail(userInfo.email);
  if (!user) {
    console.log(`⚠️ تم تخطي ${userInfo.displayName} - غير موجود في قاعدة البيانات`);
    return false;
  }
  
  const userId = user.id;
  console.log(`📋 تم العثور على المستخدم: ${userInfo.displayName} (ID: ${userId})`);
  
  let allSuccess = true;
  
  // 2. حذف صلاحيات المستخدم
  const permSuccess = await deleteUserPermissions(userId, userInfo.displayName);
  allSuccess = allSuccess && permSuccess;
  
  // 3. حذف ملف المصور (إذا كان مصوراً)
  if (userInfo.role === 'photographer') {
    const profileSuccess = await deletePhotographerProfile(userId, userInfo.displayName);
    allSuccess = allSuccess && profileSuccess;
  }
  
  // 4. حذف منسق البراند (إذا كان منسق براند)
  if (userInfo.role === 'brand_coordinator') {
    const coordinatorSuccess = await deleteBrandCoordinator(userId, userInfo.displayName);
    allSuccess = allSuccess && coordinatorSuccess;
  }
  
  // 5. حذف المستخدم نفسه (أخيراً)
  const userSuccess = await deleteUserDocument(userId, userInfo.email, userInfo.displayName);
  allSuccess = allSuccess && userSuccess;
  
  if (allSuccess) {
    console.log(`✅ تم حذف ${userInfo.displayName} بنجاح مع جميع البيانات المرتبطة`);
  } else {
    console.log(`⚠️ تم حذف ${userInfo.displayName} مع بعض المشاكل`);
  }
  
  return allSuccess;
}

// 📊 التحقق من حالة البيانات قبل وبعد التنظيف
async function checkDataStatus(phase) {
  console.log(`\n📊 فحص حالة البيانات - ${phase}:`);
  
  try {
    // فحص مجموعة users
    const usersSnapshot = await db.collection('users').get();
    console.log(`👥 عدد المستخدمين في مجموعة users: ${usersSnapshot.size}`);
    
    // عرض المستخدمين الموجودين
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      console.log(`  - ${userData.display_name || userData.email} (${userData.primary_role})`);
    });
    
    // فحص مجموعة user_permissions
    const permissionsSnapshot = await db.collection('user_permissions').get();
    console.log(`🔐 عدد وثائق الصلاحيات: ${permissionsSnapshot.size}`);
    
    // فحص مجموعة photographer_profiles
    const photographersSnapshot = await db.collection('photographer_profiles').get();
    console.log(`📷 عدد ملفات المصورين: ${photographersSnapshot.size}`);
    
    // فحص مجموعة brand_coordinators
    const coordinatorsSnapshot = await db.collection('brand_coordinators').get();
    console.log(`🏢 عدد منسقي البراندات: ${coordinatorsSnapshot.size}`);
    
  } catch (error) {
    console.error(`❌ خطأ في فحص البيانات:`, error.message);
  }
}

// 🚀 الدالة الرئيسية للتنظيف
async function cleanupTestUsers() {
  console.log('🧹 بدء عملية تنظيف المستخدمين التجريبيين...\n');
  
  try {
    // فحص البيانات قبل التنظيف
    await checkDataStatus('قبل التنظيف');
    
    // تأكيد المتابعة
    console.log('\n⚠️ سيتم حذف البيانات الآتية:');
    USERS_TO_DELETE.forEach(user => {
      console.log(`  - ${user.displayName} (${user.email}) - ${user.role}`);
    });
    
    console.log('\n🔄 بدء عملية الحذف...');
    
    // حذف كل مستخدم
    let successCount = 0;
    for (const userInfo of USERS_TO_DELETE) {
      const success = await deleteUserCompletely(userInfo);
      if (success) successCount++;
      
      // انتظار قصير بين العمليات
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // فحص البيانات بعد التنظيف
    await checkDataStatus('بعد التنظيف');
    
    // تقرير نهائي
    console.log(`\n🎯 تقرير التنظيف النهائي:`);
    console.log(`✅ تم حذف ${successCount} من ${USERS_TO_DELETE.length} مستخدمين بنجاح`);
    
    if (successCount === USERS_TO_DELETE.length) {
      console.log('🎉 تمت عملية التنظيف بنجاح! البيئة جاهزة لتطوير نظام التسجيل الجديد');
    } else {
      console.log('⚠️ تمت العملية مع بعض المشاكل. يرجى المراجعة');
    }
    
  } catch (error) {
    console.error('❌ خطأ عام في عملية التنظيف:', error);
  } finally {
    console.log('\n👋 انتهاء عملية التنظيف');
  }
}

// تشغيل السكريبت
if (require.main === module) {
  cleanupTestUsers()
    .then(() => {
      console.log('✅ تم تنفيذ سكريبت التنظيف بنجاح');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ فشل سكريبت التنظيف:', error);
      process.exit(1);
    });
}

module.exports = {
  cleanupTestUsers,
  findUserByEmail,
  deleteUserCompletely
}; 