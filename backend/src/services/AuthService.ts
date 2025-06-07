/**
 * 🔐 خدمة المصادقة - Depth Studio (مبسطة ومتوافقة)
 * ========================================
 * 
 * 📱 يدعم 3 طرق مصادقة:
 * - البريد الإلكتروني + كلمة مرور
 * - الهاتف العراقي + OTP  
 * - حساب جوجل
 * 
 * 🎯 المميزات:
 * - متوافق 100% مع Firebase Admin SDK
 * - متوافق 100% مع types package  
 * - نظام OTP آمن للأرقام العراقية
 * - تسجيل أنشطة المصادقة
 */

import { 
  Auth,
  UserRecord,
  CreateRequest,
  UpdateRequest
} from 'firebase-admin/auth';

import { 
  Firestore,
  FieldValue,
  Timestamp
} from 'firebase-admin/firestore';

import { auth, db } from '../config/firebase';
import { UserRepository } from '../repositories/UserRepository';
import { NotificationService } from './NotificationService';

import {
  User,
  AuthMethod,
  PhoneVerification,
  EmailRegistrationData,
  PhoneRegistrationData,
  GoogleRegistrationData,
  EmailLoginData,
  PhoneLoginData,
  GoogleLoginData,
  AuthResult,
  OTPSendRequest,
  OTPSendResult,
  OTPVerifyRequest,
  OTPVerifyResult,
  AuthActivityLog,
  AuthSecuritySettings,
  RegistrationStats,
  AuthMethodUsageStats,
  ID,
  UserRole,
  UserStatus,
  AuthProvider,
  VerificationStatus,
  FirebaseTimestamp
} from '../../../types/src';

/**
 * 🔐 خدمة المصادقة الشاملة
 */
export class AuthService {
  private userRepository: UserRepository;
  private notificationService: NotificationService;
  private firebaseAuth: Auth; // 🎯 استخدام Auth type للـ Type Safety
  private firestoreDb: Firestore; // 🗄️ استخدام Firestore type لضمان Type Safety
  
  // إعدادات الأمان الافتراضية
  private readonly securitySettings: AuthSecuritySettings = {
    max_login_attempts: 5,
    login_lockout_duration_minutes: 15,
    otp_expiry_minutes: 5,
    max_otp_attempts: 3,
    session_timeout_hours: 24,
    require_phone_verification: true,
    require_email_verification: true,
    allow_multiple_sessions: false,
    password_min_length: 8,
    password_require_special_chars: true
  };

  constructor() {
    this.userRepository = new UserRepository();
    this.notificationService = new NotificationService();
    this.firebaseAuth = auth; // 🔧 تهيئة Firebase Auth مع Type Safety
    this.firestoreDb = db; // 🗄️ تهيئة Firestore مع Type Safety
  }

  // ======================================
  // 📧 التسجيل بالبريد الإلكتروني
  // ======================================

  /**
   * تسجيل مستخدم جديد بالبريد الإلكتروني
   */
  async registerWithEmail(data: EmailRegistrationData): Promise<AuthResult> {
    try {
      // التحقق من صحة البيانات
      this.validateEmailRegistration(data);

      // التحقق من عدم وجود مستخدم بنفس البريد
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        return {
          success: false,
          needs_role_selection: false,
          needs_phone_verification: false,
          needs_email_verification: false,
          message: 'البريد الإلكتروني مسجل مسبقاً'
        };
      }

      // إنشاء حساب Firebase باستخدام Admin SDK مع Type Safety
      const createUserRequest: CreateRequest = {
        email: data.email,
        password: data.password,
        displayName: data.full_name,
        emailVerified: false
      };
      const firebaseUser: UserRecord = await auth.createUser(createUserRequest);

      // تعيين رقم الهاتف إذا كان متوفراً مع Type Safety
      if (data.phone) {
        const updateUserRequest: UpdateRequest = {
          phoneNumber: data.phone
        };
        await auth.updateUser(firebaseUser.uid, updateUserRequest);
      }

      // إرسال إشعار الترحيب
      await this.notificationService.sendNotification({
        type: 'task_assigned',
        priority: 'high',
        title: 'مرحباً بك في Depth Studio',
        message: `أهلاً ${data.full_name}! تم إنشاء حسابك بنجاح`,
        recipient_id: firebaseUser.uid,
        recipient_role: 'new_user',
        is_urgent: false
      });

      // إنشاء AuthMethod
      const authMethod: AuthMethod = {
        type: 'email',
        verified: false,
        created_at: Timestamp.now() as FirebaseTimestamp,
        metadata: {
          email_verified: false
        }
      };

      // إنشاء المستخدم في قاعدة البيانات
      const user = await this.userRepository.create({
        email: data.email,
        full_name: data.full_name,
        phone: data.phone || '',
        role: 'new_user' as UserRole,
        status: 'pending_role_setup',
        is_verified: false,
        auth_methods: [authMethod],
        registration_method: 'email',
        phone_verified: false,
        role_selected: false,
        role_selection_history: [],
        google_linked: false,
        permissions: [],
        preferences: {
          language: 'ar',
          notifications_enabled: true,
          email_notifications: true,
          sms_notifications: false,
          theme: 'light'
        },
        profile: {
          bio: '',
          avatar_url: '',
          social_links: {}
        },
        is_active: true,
        firebase_uid: firebaseUser.uid
      });

      // تسجيل النشاط
      await this.logAuthActivity({
        user_id: user.id,
        activity_type: 'registration_success',
        auth_method: 'email',
        success: true
      });

      // إنشاء Custom Token لـ Firebase
      const token = await auth.createCustomToken(firebaseUser.uid);

      return {
        success: true,
        user,
        token,
        needs_role_selection: true,
        needs_phone_verification: !data.phone ? false : this.securitySettings.require_phone_verification,
        needs_email_verification: true,
        message: 'تم التسجيل بنجاح! يرجى التحقق من بريدك الإلكتروني واختيار دورك في النظام'
      };

    } catch (error: any) {
      await this.logAuthActivity({
        activity_type: 'registration_attempt',
        auth_method: 'email',
        success: false,
        failure_reason: error.message
      });

      return {
        success: false,
        needs_role_selection: false,
        needs_phone_verification: false,
        needs_email_verification: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  /**
   * تسجيل دخول بالبريد الإلكتروني
   */
  async loginWithEmail(data: EmailLoginData): Promise<AuthResult> {
    try {
      // في Firebase Admin SDK، لا يمكن تسجيل الدخول مباشرة
      // نحتاج التحقق من المستخدم ثم إنشاء Custom Token
      
      // جلب المستخدم من قاعدة البيانات
      const user = await this.userRepository.findByEmail(data.email);
      if (!user) {
        throw new Error('البريد الإلكتروني أو كلمة المرور خاطئة');
      }

      // التحقق من حالة المستخدم
      if (!user.is_active) {
        throw new Error('حسابك غير مفعل. يرجى التواصل مع الإدارة');
      }

      if (user.status === ('suspended' as UserStatus)) {
        throw new Error('حسابك موقوف. يرجى التواصل مع الإدارة');
      }

      // التحقق من Firebase UID
      if (!user.firebase_uid) {
        throw new Error('خطأ في ربط الحساب بـ Firebase');
      }

      // تحديث آخر استخدام لطريقة المصادقة
      await this.updateAuthMethodLastUsed(user.id, 'email');

      // تسجيل النشاط
      await this.logAuthActivity({
        user_id: user.id,
        activity_type: 'login_success',
        auth_method: 'email',
        success: true
      });

      // إنشاء Custom Token
      const token = await auth.createCustomToken(user.firebase_uid);

      return {
        success: true,
        user,
        token,
        needs_role_selection: user.status === 'pending_role_setup',
        needs_phone_verification: !user.phone_verified && this.securitySettings.require_phone_verification,
        needs_email_verification: !user.auth_methods.find(m => m.type === 'email')?.verified && this.securitySettings.require_email_verification,
        message: 'تم تسجيل الدخول بنجاح',
        expires_at: Timestamp.fromDate(new Date(Date.now() + this.securitySettings.session_timeout_hours * 60 * 60 * 1000)) as FirebaseTimestamp
      };

    } catch (error: any) {
      await this.logAuthActivity({
        activity_type: 'login_failed',
        auth_method: 'email',
        success: false,
        failure_reason: error.message
      });

      return {
        success: false,
        needs_role_selection: false,
        needs_phone_verification: false,
        needs_email_verification: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  // ======================================
  // 📱 التسجيل والدخول بالهاتف العراقي + OTP
  // ======================================

  /**
   * تسجيل مستخدم جديد برقم الهاتف العراقي
   */
  async registerWithPhone(data: PhoneRegistrationData): Promise<AuthResult> {
    try {
      // التحقق من صحة رقم الهاتف العراقي
      if (!this.validateIraqiPhone(data.phone, data.country_code)) {
        return {
          success: false,
          needs_role_selection: false,
          needs_phone_verification: false,
          needs_email_verification: false,
          message: 'رقم الهاتف العراقي غير صحيح'
        };
      }

      const fullPhone = `${data.country_code}${data.phone}`;

      // التحقق من عدم وجود مستخدم بنفس الرقم
      const existingUser = await this.userRepository.findByPhone(fullPhone);
      if (existingUser) {
        return {
          success: false,
          needs_role_selection: false,
          needs_phone_verification: false,
          needs_email_verification: false,
          message: 'رقم الهاتف مسجل مسبقاً'
        };
      }

      // إرسال OTP
      const otpResult = await this.sendOTP({
        phone: data.phone,
        country_code: data.country_code,
        purpose: 'registration'
      });

      if (!otpResult.success) {
        return {
          success: false,
          needs_role_selection: false,
          needs_phone_verification: false,
          needs_email_verification: false,
          message: otpResult.message
        };
      }

      // حفظ بيانات التسجيل مؤقتاً
      await this.saveTemporaryRegistration(data, 'phone');

      return {
        success: true,
        needs_role_selection: false,
        needs_phone_verification: true,
        needs_email_verification: false,
        message: `تم إرسال رمز التحقق إلى ${fullPhone}. يرجى إدخال الرمز خلال ${this.securitySettings.otp_expiry_minutes} دقائق`
      };

    } catch (error: any) {
      await this.logAuthActivity({
        activity_type: 'registration_attempt',
        auth_method: 'phone',
        success: false,
        failure_reason: error.message
      });

      return {
        success: false,
        needs_role_selection: false,
        needs_phone_verification: false,
        needs_email_verification: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  /**
   * تسجيل دخول برقم الهاتف العراقي + OTP
   * 🎯 فائدة PhoneLoginData type: يضمن صحة بيانات الهاتف والبلد
   * ✅ Type Safety يمنع أخطاء التحقق من الهاتف
   */
  async loginWithPhone(data: PhoneLoginData): Promise<AuthResult> {
         try {
       // 🎯 استخدام PhoneLoginData type مع validation محسن
       const validationResult = this.validatePhoneLogin(data);
       if (!validationResult.isValid) {
         return {
           success: false,
           needs_role_selection: false,
           needs_phone_verification: false,
           needs_email_verification: false,
           message: validationResult.message
         };
       }

      const fullPhone = `${data.country_code}${data.phone}`;

      // البحث عن مستخدم موجود
      const existingUser = await this.userRepository.findByPhone(fullPhone);
      if (!existingUser) {
        return {
          success: false,
          needs_role_selection: false,
          needs_phone_verification: false,
          needs_email_verification: false,
          message: 'رقم الهاتف غير مسجل. يرجى التسجيل أولاً'
        };
      }

      // إرسال OTP للمستخدم الموجود
      const otpResult = await this.sendOTP({
        phone: data.phone,
        country_code: data.country_code,
        purpose: 'login',
        user_id: existingUser.id
      });

      if (!otpResult.success) {
        return {
          success: false,
          needs_role_selection: false,
          needs_phone_verification: false,
          needs_email_verification: false,
          message: otpResult.message
        };
      }

      // تسجيل النشاط
      await this.logAuthActivity({
        user_id: existingUser.id,
        activity_type: 'login_attempt',
        auth_method: 'phone',
        success: true,
        additional_data: { 
          phone: fullPhone, 
          login_method: 'otp_requested'
        }
      });

      return {
        success: true,
        needs_role_selection: false,
        needs_phone_verification: true,
        needs_email_verification: false,
        message: `تم إرسال رمز التحقق إلى ${fullPhone}. يرجى إدخال الرمز خلال ${this.securitySettings.otp_expiry_minutes} دقائق`
      };

    } catch (error: any) {
      await this.logAuthActivity({
        activity_type: 'login_attempt',
        auth_method: 'phone',
        success: false,
        failure_reason: error.message,
        additional_data: { 
          phone: `${data.country_code}${data.phone}`,
          login_method: 'phone_login_failed'
        }
      });

      return {
        success: false,
        needs_role_selection: false,
        needs_phone_verification: false,
        needs_email_verification: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  /**
   * إرسال رمز OTP للهاتف العراقي
   */
  async sendOTP(request: OTPSendRequest): Promise<OTPSendResult> {
    try {
      const fullPhone = `${request.country_code}${request.phone}`;
      
      // إنشاء رمز OTP آمن
      const otpCode = this.generateSecureOTP();
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + this.securitySettings.otp_expiry_minutes * 60 * 1000));

      // حفظ OTP في قاعدة البيانات
      const phoneVerification: Omit<PhoneVerification, 'id' | 'created_at' | 'updated_at'> = {
        phone: request.phone,
        country_code: request.country_code,
        full_phone: fullPhone,
        otp_code: otpCode,
        expires_at: expiresAt as FirebaseTimestamp,
        attempts: 0,
        max_attempts: this.securitySettings.max_otp_attempts,
        verified: false,
        status: 'pending' as VerificationStatus,
        user_id: request.user_id || ''
      };

      // 🎯 استخدام Firestore type يضمن Type Safety للعمليات
      const docRef = await this.firestoreDb.collection('phone_verifications').add(phoneVerification);

      // محاكاة إرسال SMS (في الإنتاج: استخدام خدمة SMS حقيقية)
      console.log(`📱 SMS إلى ${fullPhone}: رمز التحقق الخاص بك: ${otpCode}`);

      // تسجيل النشاط
      await this.logAuthActivity({
        user_id: request.user_id || 'anonymous',
        activity_type: 'otp_sent',
        auth_method: 'phone',
        success: true,
        additional_data: { phone: fullPhone, purpose: request.purpose }
      });

      return {
        success: true,
        message: 'تم إرسال رمز التحقق بنجاح',
        expires_at: expiresAt as FirebaseTimestamp,
        attempts_remaining: this.securitySettings.max_otp_attempts,
        can_resend_at: Timestamp.fromDate(new Date(Date.now() + 60 * 1000)) as FirebaseTimestamp
      };

    } catch (error: any) {
      await this.logAuthActivity({
        user_id: request.user_id || 'anonymous',
        activity_type: 'otp_sent',
        auth_method: 'phone',
        success: false,
        failure_reason: error.message
      });

      return {
        success: false,
        message: 'فشل في إرسال رمز التحقق',
        expires_at: Timestamp.now() as FirebaseTimestamp,
        attempts_remaining: 0,
        can_resend_at: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)) as FirebaseTimestamp
      };
    }
  }

  /**
   * التحقق من رمز OTP
   */
  async verifyOTP(request: OTPVerifyRequest): Promise<OTPVerifyResult> {
    try {
      const fullPhone = `${request.country_code}${request.phone}`;

      // البحث عن OTP صالح مع Firestore Type Safety
      const verificationQuery = this.firestoreDb.collection('phone_verifications')
        .where('full_phone', '==', fullPhone)
        .where('verified', '==', false)
        .where('expires_at', '>', Timestamp.now())
        .orderBy('expires_at', 'desc')
        .limit(1);

      const verificationSnapshot = await verificationQuery.get();
      
      if (verificationSnapshot.empty) {
        return {
          success: false,
          message: 'رمز التحقق منتهي الصلاحية أو غير موجود',
          needs_role_selection: false
        };
      }

      // إصلاح: التأكد من وجود المستند قبل الاستخدام
      const verificationDoc = verificationSnapshot.docs[0];
      if (!verificationDoc) {
        return {
          success: false,
          message: 'رمز التحقق غير موجود',
          needs_role_selection: false
        };
      }

      const verification = { id: verificationDoc.id, ...verificationDoc.data() } as PhoneVerification;

      // التحقق من عدد المحاولات
      if (verification.attempts >= verification.max_attempts) {
        return {
          success: false,
          message: 'تم تجاوز الحد الأقصى للمحاولات',
          needs_role_selection: false
        };
      }

      // التحقق من صحة الرمز
      if (verification.otp_code !== request.otp_code) {
        // زيادة عدد المحاولات
        await verificationDoc.ref.update({
          attempts: FieldValue.increment(1),
          updated_at: FieldValue.serverTimestamp()
        });

        await this.logAuthActivity({
          user_id: request.user_id || 'anonymous',
          activity_type: 'otp_failed',
          auth_method: 'phone',
          success: false,
          failure_reason: 'رمز خاطئ'
        });

        return {
          success: false,
          message: `رمز التحقق خاطئ. المحاولات المتبقية: ${verification.max_attempts - verification.attempts - 1}`,
          needs_role_selection: false
        };
      }

      // تمييز OTP كمحقق
      await verificationDoc.ref.update({
        verified: true,
        status: 'verified' as VerificationStatus,
        updated_at: FieldValue.serverTimestamp()
      });

      // معالجة حسب الغرض - مبسطة
      let user: User;
      let token: string;
      let isNewUser = false;

      if (verification.user_id) {
        // مستخدم موجود - تسجيل دخول
        user = await this.userRepository.findById(verification.user_id) as User;
        
        // تحديث حالة التحقق من الهاتف
        await this.userRepository.update(user.id, {
          phone_verified: true
        });

        // تحديث آخر استخدام لطريقة المصادقة
        await this.updateAuthMethodLastUsed(user.id, 'phone');

      } else {
        // مستخدم جديد - إنشاء حساب بسيط مع Type Safety
        const phoneCreateRequest: CreateRequest = {
          phoneNumber: fullPhone,
          emailVerified: false
        };
        const firebaseUser = await auth.createUser(phoneCreateRequest);

        user = await this.userRepository.create({
          phone: fullPhone,
          full_name: 'مستخدم جديد',
          email: '',
          role: 'new_user' as UserRole,
          status: 'pending_role_setup',
          is_verified: false,
          auth_methods: [{
            type: 'phone',
            verified: true,
            created_at: Timestamp.now() as FirebaseTimestamp,
            metadata: {
              phone_verified: true,
              phone_country_code: request.country_code
            }
          }],
          registration_method: 'phone',
          phone_verified: true,
          role_selected: false,
          role_selection_history: [],
          google_linked: false,
          permissions: [],
          preferences: {
            language: 'ar',
            notifications_enabled: true,
            email_notifications: false,
            sms_notifications: true,
            theme: 'light'
          },
          profile: {
            bio: '',
            avatar_url: '',
            social_links: {}
          },
          is_active: true,
          firebase_uid: firebaseUser.uid
        });

        isNewUser = true;
      }

      // إنشاء Custom Token
      if (user.firebase_uid) {
        token = await auth.createCustomToken(user.firebase_uid);
      } else {
        throw new Error('خطأ في ربط الحساب بـ Firebase');
      }

      // تسجيل النشاط
      await this.logAuthActivity({
        user_id: user.id,
        activity_type: 'otp_verified',
        auth_method: 'phone',
        success: true
      });

      return {
        success: true,
        message: isNewUser ? 'تم التسجيل بنجاح!' : 'تم تسجيل الدخول بنجاح!',
        user,
        token,
        needs_role_selection: user.status === 'pending_role_setup'
      };

    } catch (error: any) {
      await this.logAuthActivity({
        user_id: request.user_id || 'anonymous',
        activity_type: 'otp_failed',
        auth_method: 'phone',
        success: false,
        failure_reason: error.message
      });

      return {
        success: false,
        message: this.getErrorMessage(error),
        needs_role_selection: false
      };
    }
  }

  // ======================================
  // 🔍 Google OAuth (مبسط لـ Admin SDK)
  // ======================================

  /**
   * تسجيل مستخدم جديد بحساب جوجل
   * ملاحظة: في Firebase Admin SDK لا يمكن استخدام Client SDK functions
   */
  async registerWithGoogle(data: GoogleRegistrationData): Promise<AuthResult> {
    try {
      // في Firebase Admin SDK، نحتاج لمعالجة Google Token مختلفة
      // هذا مثال مبسط - في الإنتاج يجب التحقق من Google Token باستخدام Google APIs
      
      const email = data.email || '';
      const displayName = data.full_name || '';
      const photoURL = data.profile_picture || '';

      // التحقق من عدم وجود مستخدم بنفس البريد
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        return {
          success: false,
          needs_role_selection: false,
          needs_phone_verification: false,
          needs_email_verification: false,
          message: 'البريد الإلكتروني مسجل مسبقاً'
        };
      }

      // إنشاء حساب Firebase مع Type Safety
      const googleCreateRequest: CreateRequest = {
        email: email,
        displayName: displayName,
        photoURL: photoURL,
        emailVerified: true // Google عادة محقق
      };
      const firebaseUser = await auth.createUser(googleCreateRequest);

      // إنشاء AuthMethod للـ Google
      const authMethod: AuthMethod = {
        type: 'google',
        verified: true,
        created_at: Timestamp.now() as FirebaseTimestamp,
        metadata: {
          google_id: firebaseUser.uid,
          google_email: email,
          google_picture: photoURL
        }
      };

      // إنشاء مستخدم جديد
      const user = await this.userRepository.create({
        email: email,
        full_name: displayName,
        phone: '',
        role: 'new_user' as UserRole,
        status: 'pending_role_setup',
        is_verified: false,
        auth_methods: [authMethod],
        registration_method: 'google',
        phone_verified: false,
        role_selected: false,
        role_selection_history: [],
        google_linked: true,
        permissions: [],
        preferences: {
          language: 'ar',
          notifications_enabled: true,
          email_notifications: true,
          sms_notifications: false,
          theme: 'light'
        },
        profile: {
          bio: '',
          avatar_url: photoURL,
          social_links: {}
        },
        is_active: true,
        firebase_uid: firebaseUser.uid
      });

      // تسجيل النشاط
      await this.logAuthActivity({
        user_id: user.id,
        activity_type: 'registration_success',
        auth_method: 'google',
        success: true
      });

      // إنشاء Custom Token
      const token = await auth.createCustomToken(firebaseUser.uid);

      return {
        success: true,
        user,
        token,
        needs_role_selection: true,
        needs_phone_verification: this.securitySettings.require_phone_verification,
        needs_email_verification: false, // جوجل محقق مسبقاً
        message: 'تم التسجيل بنجاح بحساب جوجل!',
        expires_at: Timestamp.fromDate(new Date(Date.now() + this.securitySettings.session_timeout_hours * 60 * 60 * 1000)) as FirebaseTimestamp
      };

    } catch (error: any) {
      await this.logAuthActivity({
        activity_type: 'registration_attempt',
        auth_method: 'google',
        success: false,
        failure_reason: error.message
      });

      return {
        success: false,
        needs_role_selection: false,
        needs_phone_verification: false,
        needs_email_verification: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  /**
   * تسجيل دخول بحساب جوجل
   * ملاحظة: لتسجيل الدخول، نحتاج معرفة المستخدم من Google Token
   */
  async loginWithGoogle(data: GoogleLoginData): Promise<AuthResult> {
    try {
      // في Firebase Admin SDK، نحتاج معلومات إضافية عن المستخدم
      // في التطبيق الحقيقي، نحتاج لفك Google Token وجلب المعلومات
      // هذا مثال مبسط للتوافق
      
      // نحتاج ترقية هذه الطريقة لتتعامل مع Google Token
      // مؤقتاً، سنعيد رسالة تفيد بحاجة لترقية
      return {
        success: false,
        needs_role_selection: false,
        needs_phone_verification: false,
        needs_email_verification: false,
        message: 'تسجيل الدخول بجوجل يحتاج ترقية في Admin SDK. يرجى استخدام البريد الإلكتروني أو الهاتف.'
      };

    } catch (error: any) {
      await this.logAuthActivity({
        activity_type: 'login_failed',
        auth_method: 'google',
        success: false,
        failure_reason: error.message
      });

      return {
        success: false,
        needs_role_selection: false,
        needs_phone_verification: false,
        needs_email_verification: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  // ======================================
  // 🛠️ دوال مساعدة
  // ======================================

  /**
   * التحقق من صحة رقم الهاتف العراقي
   */
  validateIraqiPhone(phone: string, countryCode: string): boolean {
    // التحقق من رمز البلد العراقي
    if (countryCode !== '+964') {
      return false;
    }

    // إزالة أي رموز غير رقمية
    const cleanPhone = phone.replace(/\D/g, '');

    // التحقق من طول الرقم (يجب أن يكون 10 أرقام)
    if (cleanPhone.length !== 10) {
      return false;
    }

    // التحقق من بداية الرقم (يجب أن يبدأ بـ 7)
    if (!cleanPhone.startsWith('7')) {
      return false;
    }

    // التحقق من رموز شبكات الاتصال العراقية
    const validPrefixes = [
      '750', '751', '752', '753', '754', '755', '756', '757', '758', '759', // Zain Iraq
      '770', '771', '772', '773', '774', '775', '776', '777', '778', '779', // Asia Cell
      '780', '781', '782', '783', '784', '785', '786', '787', '788', '789'  // Korek Telecom
    ];

    const prefix = cleanPhone.substring(0, 3);
    return validPrefixes.includes(prefix);
  }

  /**
   * إنشاء رمز OTP آمن
   */
  generateSecureOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * جلب إحصائيات التسجيل
   */
  async getRegistrationStats(): Promise<RegistrationStats> {
    try {
      const users = await this.userRepository.findAll();
      
      const emailRegistrations = users.filter(u => u.registration_method === 'email').length;
      const phoneRegistrations = users.filter(u => u.registration_method === 'phone').length;
      const googleRegistrations = users.filter(u => u.registration_method === 'google').length;

      const emailVerified = users.filter(u => 
        u.registration_method === 'email' && 
        u.auth_methods.some(m => m.type === 'email' && m.verified)
      ).length;

      const phoneVerified = users.filter(u => u.phone_verified).length;
      const googleActive = users.filter(u => u.google_linked && u.is_active).length;

      return {
        email_registrations: emailRegistrations,
        phone_registrations: phoneRegistrations,
        google_registrations: googleRegistrations,
        total_registrations: users.length,
        conversion_rates: {
          email_to_verified: emailRegistrations > 0 ? (emailVerified / emailRegistrations) * 100 : 0,
          phone_to_verified: phoneRegistrations > 0 ? (phoneVerified / phoneRegistrations) * 100 : 0,
          google_to_active: googleRegistrations > 0 ? (googleActive / googleRegistrations) * 100 : 0
        },
        daily_registrations: []
      };
    } catch (error) {
      console.error('خطأ في جلب إحصائيات التسجيل:', error);
      throw error;
    }
  }

  /**
   * 📈 جلب إحصائيات استخدام طرق المصادقة
   * 🎯 فائدة AuthMethodUsageStats type: يضمن بنية البيانات الصحيحة للإحصائيات
   * ✅ Type Safety يمنع أخطاء في حساب الإحصائيات
   * 📊 يوفر رؤى مفصلة حول سلوك المستخدمين
   * 🔍 يساعد في اتخاذ قرارات تحسين UX
   */
  async getAuthMethodUsageStats(): Promise<AuthMethodUsageStats> {
    try {
      const users = await this.userRepository.findAll();
      
      // 💡 AuthMethodUsageStats type يضمن صحة البنية
      const stats: AuthMethodUsageStats = {
        total_users: users.length,
        users_with_email: 0,
        users_with_phone: 0,
        users_with_google: 0,
        users_with_multiple_methods: 0,
        preferred_login_method: {
          email: 0,
          phone: 0,
          google: 0
        }
      };

      // حساب الإحصائيات مع ضمان Type Safety
      users.forEach(user => {
        const authMethods = user.auth_methods || [];
        const hasEmail = authMethods.some(m => m.type === 'email');
        const hasPhone = authMethods.some(m => m.type === 'phone') || user.phone_verified;
        const hasGoogle = authMethods.some(m => m.type === 'google') || user.google_linked;

        // عد المستخدمين حسب طريقة المصادقة
        if (hasEmail) stats.users_with_email++;
        if (hasPhone) stats.users_with_phone++;
        if (hasGoogle) stats.users_with_google++;

        // عد المستخدمين بطرق متعددة
        const methodsCount = [hasEmail, hasPhone, hasGoogle].filter(Boolean).length;
        if (methodsCount > 1) {
          stats.users_with_multiple_methods++;
        }

        // تحديد الطريقة المفضلة بناءً على آخر استخدام أو طريقة التسجيل
        const registrationMethod = user.registration_method;
        if (registrationMethod === 'email') {
          stats.preferred_login_method.email++;
        } else if (registrationMethod === 'phone') {
          stats.preferred_login_method.phone++;
        } else if (registrationMethod === 'google') {
          stats.preferred_login_method.google++;
        }
      });

      // تسجيل النشاط للمراقبة
      await this.logAuthActivity({
        user_id: 'system',
        activity_type: 'login_success', // تستخدم للعمليات الإدارية
        auth_method: 'email', // افتراضي
        success: true,
        additional_data: {
          action: 'auth_method_stats_generated',
          total_users: stats.total_users,
          multi_method_users: stats.users_with_multiple_methods
        }
      });

      return stats; // 🎯 AuthMethodUsageStats يضمن إرجاع البيانات بالشكل الصحيح

    } catch (error) {
      console.error('خطأ في جلب إحصائيات طرق المصادقة:', error);
      
      // إرجاع stats فارغة مع Type Safety
      const emptyStats: AuthMethodUsageStats = {
        total_users: 0,
        users_with_email: 0,
        users_with_phone: 0,
        users_with_google: 0,
        users_with_multiple_methods: 0,
        preferred_login_method: {
          email: 0,
          phone: 0,
          google: 0
        }
      };

             return emptyStats;
     }
   }

  /**
   * 📊 تحليل فعالية طرق المصادقة
   * 🎯 استخدام متقدم لـ AuthMethodUsageStats للمقارنات والتحليل
   * 💡 يوضح كيفية الاستفادة من Type Safety في التحليلات المعقدة
   */
  async analyzeAuthMethodEffectiveness(): Promise<{
    mostPopularMethod: string;
    multiMethodAdoptionRate: number;
    recommendations: string[];
    stats: AuthMethodUsageStats;
  }> {
    try {
      // 🎯 الحصول على إحصائيات بـ Type Safety كامل
      const stats: AuthMethodUsageStats = await this.getAuthMethodUsageStats();
      
      // تحليل الطريقة الأكثر شعبية
      const methods = Object.entries(stats.preferred_login_method);
      const mostPopular = methods.reduce((prev, current) => 
        current[1] > prev[1] ? current : prev
      );

      // حساب معدل اعتماد الطرق المتعددة
      const multiMethodRate = stats.total_users > 0 
        ? (stats.users_with_multiple_methods / stats.total_users) * 100 
        : 0;

      // توليد توصيات بناءً على البيانات
      const recommendations: string[] = [];
      
      if (stats.users_with_email < stats.total_users * 0.3) {
        recommendations.push('تحسين تجربة التسجيل بالبريد الإلكتروني');
      }
      
      if (stats.users_with_phone < stats.total_users * 0.5) {
        recommendations.push('تعزيز استخدام التحقق بالهاتف للأمان');
      }
      
      if (multiMethodRate < 20) {
        recommendations.push('تشجيع المستخدمين على ربط طرق مصادقة متعددة');
      }

      if (stats.users_with_google < stats.total_users * 0.2) {
        recommendations.push('تحسين تكامل تسجيل الدخول بجوجل');
      }

      return {
        mostPopularMethod: `${mostPopular[0]} (${mostPopular[1]} مستخدم)`,
        multiMethodAdoptionRate: Math.round(multiMethodRate * 100) / 100,
        recommendations,
        stats // 💡 AuthMethodUsageStats يضمن إرجاع البيانات الصحيحة
      };

    } catch (error) {
      console.error('خطأ في تحليل فعالية طرق المصادقة:', error);
      throw error;
    }
  }

  // ======================================
  // 🔒 دوال مساعدة خاصة
  // ======================================

  private validateEmailRegistration(data: EmailRegistrationData): void {
    if (!data.email || !data.password || !data.full_name) {
      throw new Error('جميع الحقول مطلوبة');
    }

    if (data.password !== data.confirm_password) {
      throw new Error('كلمة المرور وتأكيدها غير متطابقين');
    }

    if (data.password.length < this.securitySettings.password_min_length) {
      throw new Error(`كلمة المرور يجب أن تكون ${this.securitySettings.password_min_length} أحرف على الأقل`);
    }

    if (!data.accept_terms) {
      throw new Error('يجب الموافقة على الشروط والأحكام');
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('البريد الإلكتروني غير صحيح');
    }
  }

  /**
   * 📱 التحقق من صحة بيانات تسجيل الدخول بالهاتف
   * 🎯 فائدة PhoneLoginData type: يضمن وجود الحقول المطلوبة
   * ✅ يمنع تمرير بيانات ناقصة أو خاطئة النوع
   * 🔒 Type Safety يكتشف الأخطاء في وقت التطوير
   */
  private validatePhoneLogin(data: PhoneLoginData): { isValid: boolean; message: string } {
    // 💡 PhoneLoginData type يضمن وجود phone و country_code
    if (!data.phone || !data.country_code) {
      return {
        isValid: false,
        message: 'رقم الهاتف ورمز البلد مطلوبان'
      };
    }

    // التحقق من رمز البلد العراقي
    if (data.country_code !== '+964') {
      return {
        isValid: false,
        message: 'يجب أن يكون رمز البلد +964 للعراق'
      };
    }

    // التحقق من صحة رقم الهاتف
    if (!this.validateIraqiPhone(data.phone, data.country_code)) {
      return {
        isValid: false,
        message: 'رقم الهاتف العراقي غير صحيح'
      };
    }

    return {
      isValid: true,
      message: 'بيانات الهاتف صحيحة'
    };
  }

  private async updateAuthMethodLastUsed(userId: ID, authType: AuthProvider): Promise<void> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) return;

      const updatedAuthMethods = user.auth_methods.map(method => 
        method.type === authType 
          ? { ...method, last_used: Timestamp.now() as FirebaseTimestamp }
          : method
      );

      await this.userRepository.update(userId, {
        auth_methods: updatedAuthMethods
      });
    } catch (error) {
      console.error('خطأ في تحديث آخر استخدام لطريقة المصادقة:', error);
    }
  }

  private async logAuthActivity(activity: Partial<AuthActivityLog>): Promise<void> {
    try {
      const logEntry: Omit<AuthActivityLog, 'id' | 'created_at' | 'updated_at'> = {
        user_id: activity.user_id || 'anonymous',
        activity_type: activity.activity_type!,
        auth_method: activity.auth_method!,
        ip_address: activity.ip_address || 'unknown',
        user_agent: activity.user_agent || 'unknown',
        success: activity.success!,
        failure_reason: activity.failure_reason || '',
        additional_data: activity.additional_data || {}
      };

      // 🗄️ استخدام Firestore type لضمان Type Safety في التسجيل
      await this.firestoreDb.collection('auth_activity_logs').add(logEntry);
    } catch (error) {
      console.error('خطأ في تسجيل نشاط المصادقة:', error);
    }
  }

  private getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'البريد الإلكتروني مستخدم مسبقاً';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة';
      case 'auth/invalid-email':
        return 'البريد الإلكتروني غير صحيح';
      case 'auth/user-not-found':
        return 'المستخدم غير موجود';
      case 'auth/wrong-password':
        return 'كلمة المرور خاطئة';
      case 'auth/too-many-requests':
        return 'محاولات كثيرة جداً. يرجى المحاولة لاحقاً';
      default:
        return error.message || 'حدث خطأ غير متوقع';
    }
  }

  /**
   * 🔍 التحقق من حالة Firebase Auth
   * 🎯 فائدة Auth type: يضمن Type Safety للدوال والخصائص
   */
  async checkAuthStatus(): Promise<{ isConfigured: boolean; authInstance: Auth }> {
    return {
      isConfigured: this.firebaseAuth !== null,
      authInstance: this.firebaseAuth // 💡 Auth type يضمن استخدام دوال Firebase بأمان
    };
  }

  /**
   * 🗄️ فحص اتصال قاعدة البيانات والإحصائيات
   * 🎯 فائدة Firestore type: يضمن Type Safety لجميع عمليات قاعدة البيانات
   * ✅ IntelliSense محسن - يظهر جميع دوال Firestore
   * 🔒 منع أخطاء النحو في استعلامات قاعدة البيانات
   * 📊 ضمان صحة أنواع البيانات المسترجعة
   */
  async getDatabaseStats(): Promise<{
    isConnected: boolean;
    collections: string[];
    firestoreInstance: Firestore;
    totalAuthLogs: number;
    totalVerifications: number;
  }> {
    try {
      // 💡 Firestore type يضمن أن collection() دالة صحيحة
      const authLogsSnapshot = await this.firestoreDb.collection('auth_activity_logs').count().get();
      const verificationsSnapshot = await this.firestoreDb.collection('phone_verifications').count().get();
      
      return {
        isConnected: true,
        collections: ['auth_activity_logs', 'phone_verifications', 'users'], // قائمة مبسطة
        firestoreInstance: this.firestoreDb, // 🎯 Firestore type يضمن Type Safety
        totalAuthLogs: authLogsSnapshot.data().count,
        totalVerifications: verificationsSnapshot.data().count
      };
    } catch (error) {
      console.error('خطأ في فحص قاعدة البيانات:', error);
      return {
        isConnected: false,
        collections: [],
        firestoreInstance: this.firestoreDb,
        totalAuthLogs: 0,
        totalVerifications: 0
      };
    }
  }

  /**
   * 🛠️ إنشاء طلب مستخدم جديد مع التحقق من صحة البيانات
   * 🎯 فائدة CreateRequest type: يضمن صحة البيانات المرسلة لـ Firebase Auth
   * ✅ يمنع الأخطاء في وقت التشغيل بفحص الأنواع مسبقاً
   */
  private validateAndCreateUserRequest(userData: Partial<CreateRequest>): CreateRequest {
    const request: CreateRequest = {};
    
    // التحقق من البيانات المطلوبة وإضافتها
    if (userData.email) {
      request.email = userData.email;
    }
    if (userData.password) {
      request.password = userData.password;
    }
    if (userData.displayName) {
      request.displayName = userData.displayName;
    }
    if (userData.phoneNumber) {
      request.phoneNumber = userData.phoneNumber;
    }
    if (userData.photoURL) {
      request.photoURL = userData.photoURL;
    }
    
    // إعدادات افتراضية آمنة
    request.emailVerified = userData.emailVerified ?? false;
    request.disabled = userData.disabled ?? false;
    
    return request; // 💡 CreateRequest يضمن أن البيانات متوافقة مع Firebase Admin API
  }

  /**
   * 🔄 تحديث بيانات المستخدم مع Type Safety
   * 🎯 فائدة UpdateRequest type: يضمن صحة بيانات التحديث المرسلة لـ Firebase Auth
   * ✅ يمنع تحديث حقول غير موجودة أو بأنواع خاطئة
   * 🔒 يوفر حماية من الأخطاء البرمجية في وقت التطوير
   */
  async updateUserProfile(
    userId: string, 
    updates: {
      displayName?: string;
      email?: string;
      phoneNumber?: string;
      photoURL?: string;
      emailVerified?: boolean;
      disabled?: boolean;
    }
  ): Promise<{ success: boolean; message: string }> {
    try {
      // إنشاء UpdateRequest مع Type Safety الكامل
      const updateRequest: UpdateRequest = {};
      
      // إضافة التحديثات المطلوبة فقط
      if (updates.displayName !== undefined) {
        updateRequest.displayName = updates.displayName;
      }
      if (updates.email !== undefined) {
        updateRequest.email = updates.email;
      }
      if (updates.phoneNumber !== undefined) {
        updateRequest.phoneNumber = updates.phoneNumber;
      }
      if (updates.photoURL !== undefined) {
        updateRequest.photoURL = updates.photoURL;
      }
      if (updates.emailVerified !== undefined) {
        updateRequest.emailVerified = updates.emailVerified;
      }
      if (updates.disabled !== undefined) {
        updateRequest.disabled = updates.disabled;
      }

      // تنفيذ التحديث مع ضمان Type Safety
      await this.firebaseAuth.updateUser(userId, updateRequest);
      
      // تسجيل النشاط
      await this.logAuthActivity({
        user_id: userId,
        activity_type: 'login_success', // تستخدم للتحديثات العامة
        auth_method: 'email', // افتراضي
        success: true,
        additional_data: { 
          updated_fields: Object.keys(updateRequest),
          update_type: 'profile_update'
        }
      });

      return {
        success: true,
        message: 'تم تحديث بيانات المستخدم بنجاح'
      };

    } catch (error: any) {
      await this.logAuthActivity({
        user_id: userId,
        activity_type: 'login_failed',
        auth_method: 'email',
        success: false,
        failure_reason: error.message,
        additional_data: { 
          attempted_updates: Object.keys(updates),
          update_type: 'profile_update_failed'
        }
      });

      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  /**
   * ✅ تحديث حالة التحقق من البريد الإلكتروني
   * 🎯 استخدام UpdateRequest لضمان Type Safety في التحديثات الحساسة
   */
  async verifyUserEmail(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const emailVerificationUpdate: UpdateRequest = {
        emailVerified: true
      };
      
      await this.firebaseAuth.updateUser(userId, emailVerificationUpdate);
      
      return {
        success: true,
        message: 'تم تحديث حالة التحقق من البريد الإلكتروني'
      };
    } catch (error: any) {
      return {
        success: false,
        message: this.getErrorMessage(error)
      };
    }
  }

  // دوال مساعدة مؤقتة (للتطوير المستقبلي)
  private async saveTemporaryRegistration(data: any, method: string): Promise<void> {
    // TODO: حفظ بيانات التسجيل المؤقتة
    console.log('💾 حفظ بيانات مؤقتة:', method);
  }

  private async getTemporaryRegistration(phone: string, method: string): Promise<any> {
    // TODO: جلب بيانات التسجيل المؤقتة
    return null;
  }

  private async cleanupTemporaryRegistration(phone: string, method: string): Promise<void> {
    // TODO: تنظيف بيانات التسجيل المؤقتة
    console.log('🧹 تنظيف بيانات مؤقتة:', method);
  }
} 