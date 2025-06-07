/**
 * 🔥 سكربت إعداد مجموعات المصادقة المتعددة - Depth Studio
 * ========================================================
 * 
 * 📅 تاريخ الإنشاء: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إنشاء وإعداد 5 مجموعات Firebase جديدة للمصادقة
 * 
 * 📋 المجموعات المطلوبة:
 * 1. phone_verifications - رموز OTP للهواتف العراقية
 * 2. auth_methods - طرق المصادقة للمستخدمين  
 * 3. role_applications - طلبات اختيار الأدوار
 * 4. otp_logs - سجل إرسال رموز OTP
 * 5. auth_activity_logs - سجل نشاط المصادقة
 * 
 * 🔥 فوائد استخدام FieldValue في Firebase:
 * ============================================
 * • serverTimestamp(): توقيت دقيق من الخادم (يحل مشاكل اختلاف التوقيت)
 * • increment(): زيادة/نقصان آمن للأرقام (يحل مشاكل Race Conditions)
 * • arrayUnion(): إضافة عناصر فريدة للمصفوفات
 * • arrayRemove(): حذف عناصر من المصفوفات
 * • delete(): حذف حقول محددة من المستندات
 * 
 * 💡 مثال: عندما يرسل 100 مستخدم OTP في نفس الوقت، FieldValue.increment()
 * يضمن العد الصحيح دون تداخل، بينما العمليات العادية قد تسبب أخطاء في العد
 */

import { db, DATABASE_CONFIG } from '../config/firebase';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import {
  PhoneVerification,
  AuthMethod,
  RoleSelection,
  AuthActivityLog,
  FirebaseTimestamp,
  UserRole,
  AuthProvider,
  NotificationType
} from '@depth-studio/types';

/**
 * 🔧 إعداد مجموعة phone_verifications
 */
async function setupPhoneVerificationsCollection(): Promise<void> {
  try {
    const collectionRef = db.collection(DATABASE_CONFIG.COLLECTIONS.PHONE_VERIFICATIONS);
    
    // إنشاء مستند تجريبي للتأكد من إنشاء المجموعة
    const sampleVerification: Omit<PhoneVerification, 'id'> = {
      phone: '07701234567',
      country_code: '+964',
      full_phone: '+96407701234567',
      otp_code: '123456',
      expires_at: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)) as FirebaseTimestamp, // 5 دقائق
      attempts: 0,
      max_attempts: 3,
      verified: false,
      status: 'pending',
      created_at: Timestamp.now() as FirebaseTimestamp,
      updated_at: Timestamp.now() as FirebaseTimestamp,
      user_id: 'sample_user_id',
      ip_address: '192.168.1.1'
    };

    await collectionRef.add(sampleVerification);
    
    // إنشاء الفهارس المطلوبة
    logger.info('📱 تم إعداد مجموعة phone_verifications');
    logger.info('🔍 الفهارس المطلوبة: phone, user_id, expires_at, verified');
    
  } catch (error) {
    logger.error('❌ خطأ في إعداد phone_verifications:', error);
    throw error;
  }
}

/**
 * 🔐 إعداد مجموعة auth_methods
 */
async function setupAuthMethodsCollection(): Promise<void> {
  try {
    const collectionRef = db.collection(DATABASE_CONFIG.COLLECTIONS.AUTH_METHODS);
    
    // إنشاء مستند تجريبي مع التحقق من صحة نوع المصادقة
    const authProviderType: AuthProvider = 'email'; // التأكد من صحة نوع المصادقة
    const sampleAuthMethod: Omit<AuthMethod, 'id'> = {
      type: authProviderType,
      verified: true,
      created_at: FieldValue.serverTimestamp() as FirebaseTimestamp, // استخدام FieldValue للوقت الخادم
      last_used: FieldValue.serverTimestamp() as FirebaseTimestamp,
      metadata: {
        email_verified: true
      }
    };

    await collectionRef.add(sampleAuthMethod);
    
    logger.info('🔐 تم إعداد مجموعة auth_methods');
    logger.info('🔍 الفهارس المطلوبة: user_id, type, verified, primary');
    
  } catch (error) {
    logger.error('❌ خطأ في إعداد auth_methods:', error);
    throw error;
  }
}

/**
 * 🎭 إعداد مجموعة role_applications
 */
async function setupRoleApplicationsCollection(): Promise<void> {
  try {
    const collectionRef = db.collection(DATABASE_CONFIG.COLLECTIONS.ROLE_APPLICATIONS);
    
    // إنشاء مستند تجريبي مع التحقق من صحة الدور
    const selectedRole: UserRole = 'photographer'; // التأكد من صحة الدور
    const sampleRoleApplication: Omit<RoleSelection, 'id'> = {
      user_id: 'sample_user_id',
      selected_role: selectedRole,
      additional_data: {
        contract_type: 'freelancer',
        specializations: ['portrait', 'product'],
        portfolio_links: ['https://example.com/portfolio']
      },
      status: 'pending',
      applied_at: Timestamp.now() as FirebaseTimestamp,
      created_at: Timestamp.now() as FirebaseTimestamp,
      updated_at: Timestamp.now() as FirebaseTimestamp
    };

    await collectionRef.add(sampleRoleApplication);
    
    logger.info('🎭 تم إعداد مجموعة role_applications');
    logger.info('🔍 الفهارس المطلوبة: user_id, status, selected_role, applied_at');
    
  } catch (error) {
    logger.error('❌ خطأ في إعداد role_applications:', error);
    throw error;
  }
}

/**
 * 📝 إعداد مجموعة otp_logs
 */
async function setupOTPLogsCollection(): Promise<void> {
  try {
    const collectionRef = db.collection(DATABASE_CONFIG.COLLECTIONS.OTP_LOGS);
    
    // إنشاء مستند تجريبي مع استخدام FieldValue للعمليات المتقدمة
    const sampleOTPLog = {
      phone: '07701234567',
      country_code: '+964',
      otp_code: '123456',
      purpose: 'registration',
      status: 'sent',
      attempts: 1,
      user_id: 'sample_user_id',
      sent_at: FieldValue.serverTimestamp(), // استخدام FieldValue للوقت الخادم
      expires_at: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      delivery_attempts: FieldValue.increment(1) // استخدام FieldValue للزيادة التدريجية
    };

    await collectionRef.add(sampleOTPLog);
    
    logger.info('📝 تم إعداد مجموعة otp_logs');
    logger.info('🔍 الفهارس المطلوبة: phone, user_id, sent_at, status, purpose');
    
  } catch (error) {
    logger.error('❌ خطأ في إعداد otp_logs:', error);
    throw error;
  }
}

/**
 * 📊 إعداد مجموعة auth_activity_logs
 */
async function setupAuthActivityLogsCollection(): Promise<void> {
  try {
    const collectionRef = db.collection(DATABASE_CONFIG.COLLECTIONS.AUTH_ACTIVITY_LOGS);
    
    // إنشاء مستند تجريبي مع التحقق من صحة طريقة المصادقة
    const loginAuthMethod: AuthProvider = 'email'; // التأكد من صحة طريقة المصادقة
    const sampleActivityLog: Omit<AuthActivityLog, 'id'> = {
      user_id: 'sample_user_id',
      activity_type: 'login_success',
      auth_method: loginAuthMethod,
      success: true,
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      location: {
        country: 'Iraq',
        city: 'Baghdad'
      },
      created_at: Timestamp.now() as FirebaseTimestamp,
      updated_at: Timestamp.now() as FirebaseTimestamp,
      additional_data: {
        login_source: 'mobile_app'
      }
    };

    await collectionRef.add(sampleActivityLog);
    
    logger.info('📊 تم إعداد مجموعة auth_activity_logs');
    logger.info('🔍 الفهارس المطلوبة: user_id, activity_type, timestamp, success');
    
  } catch (error) {
    logger.error('❌ خطأ في إعداد auth_activity_logs:', error);
    throw error;
  }
}

/**
 * 🗑️ تنظيف المستندات التجريبية
 */
async function cleanupSampleDocuments(): Promise<void> {
  try {
    const collections = [
      DATABASE_CONFIG.COLLECTIONS.PHONE_VERIFICATIONS,
      DATABASE_CONFIG.COLLECTIONS.AUTH_METHODS,
      DATABASE_CONFIG.COLLECTIONS.ROLE_APPLICATIONS,
      DATABASE_CONFIG.COLLECTIONS.OTP_LOGS,
      DATABASE_CONFIG.COLLECTIONS.AUTH_ACTIVITY_LOGS
    ];

    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName)
        .where('user_id', '==', 'sample_user_id')
        .get();
      
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      logger.info(`🗑️ تم تنظيف المستندات التجريبية من ${collectionName}`);
    }
    
    // تأكيد أنواع الإشعارات التي ستُستخدم بعد الإعداد
    const setupCompleteNotification: NotificationType = 'task_completed';
    logger.info(`✅ نوع الإشعار عند اكتمال الإعداد: ${setupCompleteNotification}`);
    
    // إضافة timestamp للتتبع باستخدام FieldValue
    const cleanupTimestamp = FieldValue.serverTimestamp();
    logger.info('🕒 وقت التنظيف:', { timestamp: cleanupTimestamp });
    
  } catch (error) {
    logger.error('❌ خطأ في تنظيف المستندات التجريبية:', error);
  }
}

/**
 * 🎯 الدالة الرئيسية لإعداد جميع المجموعات
 */
async function setupAllAuthCollections(): Promise<void> {
  try {
    logger.info('🚀 بدء إعداد مجموعات المصادقة المتعددة...');
    
    // التحقق من الأدوار المدعومة مع Type Safety
    const supportedRoles: UserRole[] = ['marketing_coordinator', 'brand_coordinator', 'photographer'];
    logger.info('🎭 الأدوار المدعومة في النظام:', supportedRoles);
    
    // التحقق من طرق المصادقة المدعومة مع Type Safety
    const supportedAuthProviders: AuthProvider[] = ['email', 'phone', 'google'];
    logger.info('🔐 طرق المصادقة المدعومة:', supportedAuthProviders);
    
    // التحقق من أنواع الإشعارات المدعومة للمصادقة مع Type Safety
    const authNotificationTypes: NotificationType[] = [
      'task_assigned',      // إشعار تعيين مهمة (لطلبات الأدوار)
      'task_completed',     // إشعار اكتمال مهمة (موافقة على دور)
      'task_cancelled'      // إشعار إلغاء مهمة (رفض دور)
    ];
    logger.info('🔔 أنواع الإشعارات المستخدمة في المصادقة:', authNotificationTypes);
    
    // إعداد جميع المجموعات
    await setupPhoneVerificationsCollection();
    await setupAuthMethodsCollection();
    await setupRoleApplicationsCollection();
    await setupOTPLogsCollection();
    await setupAuthActivityLogsCollection();
    
    logger.info('✅ تم إعداد جميع مجموعات المصادقة بنجاح!');
    
    // انتظار قليل ثم تنظيف المستندات التجريبية
    setTimeout(async () => {
      await cleanupSampleDocuments();
      logger.info('🎉 اكتمل إعداد نظام المصادقة المتعددة!');
    }, 5000);
    
  } catch (error) {
    logger.error('❌ خطأ في إعداد مجموعات المصادقة:', error);
    throw error;
  }
}

/**
 * 📋 معلومات الفهارس المطلوبة للإنشاء اليدوي في Firebase Console
 */
export const REQUIRED_INDEXES = {
  phone_verifications: [
    { fields: ['phone', 'verified'], order: 'asc' },
    { fields: ['user_id', 'expires_at'], order: 'desc' },
    { fields: ['phone', 'expires_at'], order: 'desc' }
  ],
  auth_methods: [
    { fields: ['user_id', 'type'], order: 'asc' },
    { fields: ['user_id', 'primary'], order: 'desc' },
    { fields: ['type', 'verified'], order: 'asc' }
  ],
  role_applications: [
    { fields: ['status', 'applied_at'], order: 'desc' },
    { fields: ['user_id', 'status'], order: 'asc' },
    { fields: ['selected_role', 'status'], order: 'asc' }
  ],
  otp_logs: [
    { fields: ['phone', 'sent_at'], order: 'desc' },
    { fields: ['user_id', 'purpose'], order: 'desc' },
    { fields: ['status', 'sent_at'], order: 'desc' }
  ],
  auth_activity_logs: [
    { fields: ['user_id', 'timestamp'], order: 'desc' },
    { fields: ['activity_type', 'timestamp'], order: 'desc' },
    { fields: ['success', 'timestamp'], order: 'desc' }
  ]
};

// تشغيل السكربت إذا تم استدعاؤه مباشرة
if (require.main === module) {
  setupAllAuthCollections()
    .then(() => {
      logger.info('🎉 اكتمل إعداد نظام المصادقة المتعددة بنجاح!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ فشل في إعداد نظام المصادقة:', error);
      process.exit(1);
    });
}

export {
  setupAllAuthCollections,
  setupPhoneVerificationsCollection,
  setupAuthMethodsCollection,
  setupRoleApplicationsCollection,
  setupOTPLogsCollection,
  setupAuthActivityLogsCollection,
  cleanupSampleDocuments
}; 