'use client';

/**
 * 📱 صفحة مصادقة الهاتف العراقي - Depth Studio
 * ===============================================
 * 
 * 📅 تاريخ الإنشاء: يونيو 2025
 * 👨‍💻 المطور: علي جودت  
 * 🎯 الهدف: تسجيل دخول/تسجيل بأرقام الهاتف العراقية مع OTP
 * 
 * 📱 المميزات الرئيسية:
 * - دعم جميع الشبكات العراقية (آسياسيل، زين، كورك، إيرثلنك)
 * - إدخال رقم عراقي مع مفتاح +964 مثبت مقدماً
 * - دعم الإدخال مع/بدون الصفر الأول (077.. أو 77..)
 * - إرسال واستقبال OTP مع عداد زمني (60 ثانية)
 * - إعادة إرسال الرمز + تغيير الرقم + تنسيق تلقائي
 * 
 * 🔗 التكامل المتكامل:
 * - auth.service.ts: signInWithPhone(), verifyOTP(), sendOTP(), registerWithPhone()
 * - AuthStore: setUser(), setToken() لحفظ حالة المصادقة
 * - Types: PhoneLoginData, OTPSendRequest, OTPVerifyResult, PhoneRegistrationData
 * - إعادة توجيه: /role-setup للمستخدمين الجدد، /dashboard للموجودين
 * 
 * 🛡️ الأمان والحماية:
 * - تحقق من صحة الأرقام العراقية قبل الإرسال
 * - عداد تنازلي لمنع spam OTP requests
 * - حد أقصى للمحاولات الخاطئة (3 محاولات)
 * - تشفير البيانات عبر API client المحمي
 * 
 * 🎨 تجربة المستخدم المحسنة:
 * - شريط تقدم بصري للمراحل الأربع
 * - كشف تلقائي للشبكة العراقية (آسياسيل/زين/كورك/إيرثلنك)
 * - رسائل خطأ واضحة بالعربية
 * - إعادة توجيه سلسة بين المراحل
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// ======================================
// 🎨 استيرادات الأيقونات من react-icons
// ======================================

import { 
  AiOutlinePhone as Phone,                 // 📱 أيقونة الهاتف - للحقل الرئيسي وعرض الرقم
  AiOutlineKey as Key,                     // 🔑 أيقونة المفتاح - لرمز OTP
  AiOutlineClockCircle as Clock,           // ⏰ أيقونة الساعة - للعداد التنازلي
  AiOutlineReload as RefreshCw,            // 🔄 أيقونة التحديث - لإعادة إرسال OTP
  AiOutlineArrowLeft as ArrowLeft,         // ← أيقونة السهم - للرجوع وتغيير الرقم
  AiOutlineCheckCircle as CheckCircle,     // ✅ أيقونة النجاح - للتحقق الناجح
  AiOutlineCloseCircle as XCircle,         // ❌ أيقونة الخطأ - للأخطاء والفشل
  // AiOutlineWarning as AlertTriangle,       // ⚠️ أيقونة التحذير - للتنبيهات (محجوز للاستخدام المستقبلي)
  AiOutlineInfoCircle as Info,             // ℹ️ أيقونة المعلومات - للنصائح والإرشادات
  AiOutlineEye as Eye,                     // 👁️ أيقونة العين - لإظهار OTP
  AiOutlineEyeInvisible as EyeOff         // 🙈 أيقونة العين المغلقة - لإخفاء OTP
} from 'react-icons/ai';

// ======================================
// 📦 استيرادات الأنواع من @depth-studio/types
// ======================================

import {
  // ======================================
  // 📱 أنواع مصادقة الهاتف العراقي + OTP
  // ======================================
  
  PhoneLoginData,                          // 📋 بيانات تسجيل الدخول بالهاتف للمستخدمين الموجودين
                                          // 🔗 الفائدة: إرسال OTP للمستخدمين المسجلين مسبقاً
                                          // 📊 يحتوي على: phone (رقم الهاتف), country_code (رمز البلد +964)
                                          // 🎯 الاستخدام: handlePhoneSubmit() في authMode = 'login'
                                          // 🔄 التدفق: PhoneLoginData → signInWithPhone() → OTPSendResult
                                          
  PhoneRegistrationData,                   // 📋 بيانات التسجيل الجديد للمستخدمين الجدد بالكامل
                                          // 🔗 الفائدة: إنشاء حساب جديد كامل بالهاتف والاسم والموافقة
                                          // 📊 يحتوي على: phone, country_code, full_name, accept_terms
                                          // 🎯 الاستخدام: handleCompleteRegistration() للمستخدمين الجدد
                                          // 🔄 التدفق: PhoneRegistrationData → registerWithPhone() → AuthResult
                                          
  OTPSendRequest,                          // 📤 طلب إرسال رمز OTP (للتسجيل والدخول وإعادة الإرسال)
                                          // 🔗 الفائدة: إرسال OTP للهاتف مع تحديد الغرض (login/registration)
                                          // 📊 يحتوي على: phone, country_code, user_id?, purpose
                                          // 🎯 الاستخدام: handlePhoneSubmit(), handleResendOTP()
                                          // 🔄 التدفق: OTPSendRequest → sendOTP() → OTPSendResult
                                          
  OTPSendResult,                           // 📨 نتيجة إرسال OTP مع معلومات الانتهاء والمحاولات
                                          // 🔗 الفائدة: عرض حالة الإرسال والعداد التنازلي وإدارة إعادة الإرسال
                                          // 📊 يحتوي على: success, message, expires_at, attempts_remaining, can_resend_at
                                          // 🎯 الاستخدام: تحديث otpStats وإدارة العداد التنازلي
                                          // 🔄 التدفق: OTPSendResult → setOtpStats() → عداد تنازلي UI
                                          
  OTPVerifyRequest,                        // ✅ طلب التحقق من رمز OTP المدخل من المستخدم
                                          // 🔗 الفائدة: التحقق من صحة الرمز المدخل وإكمال المصادقة
                                          // 📊 يحتوي على: phone, country_code, otp_code, user_id?
                                          // 🎯 الاستخدام: handleOTPVerify() عند إدخال الرمز
                                          // 🔄 التدفق: OTPVerifyRequest → verifyOTP() → OTPVerifyResult
                                          
  OTPVerifyResult,                         // 🎯 نتيجة التحقق من OTP مع بيانات المستخدم والتوكن
                                          // 🔗 الفائدة: إكمال المصادقة وتحديد التوجيه التالي (دور/لوحة تحكم)
                                          // 📊 يحتوي على: success, message, user?, token?, needs_role_selection
                                          // 🎯 الاستخدام: handleOTPVerify() لإكمال التحقق وحفظ المستخدم
                                          // 🔄 التدفق: OTPVerifyResult → setUser/setToken → إعادة توجيه
                                          
  AuthResult,                              // 🔐 نتيجة عملية المصادقة الشاملة (تسجيل/دخول)
                                          // 🔗 الفائدة: توحيد نتائج جميع عمليات المصادقة والتسجيل
                                          // 📊 يحتوي على: success, user?, token?, needs_role_selection, message
                                          // 🎯 الاستخدام: handleCompleteRegistration() للتسجيل الجديد
                                          // 🔄 التدفق: AuthResult → تحديد التوجيه (role-setup/dashboard)
                                          
  // ======================================
  // ⏰ أنواع الطوابع الزمنية Firebase
  // ======================================
  
  FirebaseTimestamp                        // 📅 طوابع زمنية Firebase للعدادات والانتهاءات
                                          // 🔗 الفائدة: حساب العداد التنازلي لـ OTP وإدارة انتهاء الصلاحية
                                          // 📊 يوفر دوال: toDate(), seconds, nanoseconds
                                          // 🎯 الاستخدام: getTimeRemainingFromTimestamp() لحساب الوقت المتبقي
                                          // 🔄 التدفق: FirebaseTimestamp → getTimeRemainingFromTimestamp() → عداد تنازلي
} from '@depth-studio/types';

// ======================================
// 🔗 استيرادات الخدمات والمتاجر
// ======================================

import { authService } from '../../services/auth.service';        // 🔐 خدمة المصادقة الرئيسية للربط مع Backend APIs
                                                                  // 🔗 الفائدة: توفير جميع دوال المصادقة المطلوبة لهذه الصفحة
                                                                  // 📊 توفر: signInWithPhone(), verifyOTP(), sendOTP(), registerWithPhone()
                                                                  // 🎯 الاستخدام: جميع عمليات OTP والتسجيل والدخول
                                                                  // 🔄 التكامل: متصلة بـ API client المحمي مع token management

import { useAuthStore } from '../../store/auth.store';             // 🏪 متجر المصادقة العام لحفظ حالة المستخدم في التطبيق
                                                                  // 🔗 الفائدة: إدارة حالة المصادقة global وحفظها في localStorage
                                                                  // 📊 يوفر: user, token, isAuthenticated, setUser(), setToken()
                                                                  // 🎯 الاستخدام: setUser/setToken بعد نجاح التحقق من OTP
                                                                  // 🔄 التكامل: مرتبط بـ API client وإعادة التوجيه

// ======================================
// 🎨 واجهات مخصصة لهذه الصفحة
// ======================================

/** الشبكات العراقية المدعومة */
interface IraqiNetwork {
  name: string;                            // اسم الشبكة
  nameArabic: string;                      // الاسم بالعربية
  prefixes: string[];                      // بادئات الأرقام
  color: string;                           // لون الشبكة للعرض
  icon?: string;                           // أيقونة الشبكة
}

/** مراحل عملية المصادقة */
type AuthStep = 'phone_input' | 'otp_verification' | 'name_input' | 'success';

/** نوع المصادقة */
type AuthMode = 'login' | 'register';

/** إحصائيات OTP */
interface OTPStats {
  timeRemaining: number;                   // الوقت المتبقي بالثواني
  attemptsRemaining: number;               // المحاولات المتبقية
  canResend: boolean;                      // هل يمكن إعادة الإرسال
  lastSentAt: Date | null;                 // وقت آخر إرسال
}

/** حالة النموذج */
interface FormState {
  phone: string;                           // رقم الهاتف المدخل
  fullName: string;                        // الاسم الكامل (للتسجيل الجديد)
  otpCode: string;                         // رمز OTP المدخل
  acceptTerms: boolean;                    // موافقة على الشروط
  isLoading: boolean;                      // حالة التحميل
  error: string | null;                    // رسالة الخطأ
  showOTP: boolean;                        // إظهار/إخفاء OTP
}

// ======================================
// 📱 ثوابت الشبكات العراقية
// ======================================

/**
 * 🇮🇶 الشبكات العراقية المدعومة
 * يدعم جميع الشبكات الرئيسية مع بادئاتها الحقيقية
 */
const IRAQI_NETWORKS: IraqiNetwork[] = [
  {
    name: 'AsiaCell',
    nameArabic: 'آسياسيل',
    prefixes: ['077', '078'],              // آسياسيل الأرقام الجديدة والقديمة
    color: 'bg-blue-500',                  // لون أزرق مميز
  },
  {
    name: 'Zain',
    nameArabic: 'زين',
    prefixes: ['078', '079'],              // زين العراق
    color: 'bg-purple-500',                // لون بنفسجي مميز
  },
  {
    name: 'Korek',
    nameArabic: 'كورك',
    prefixes: ['075'],                     // كورك تليكوم
    color: 'bg-green-500',                 // لون أخضر مميز
  },
  {
    name: 'Earthlink',
    nameArabic: 'إيرثلنك',
    prefixes: ['076'],                     // إيرثلنك
    color: 'bg-orange-500',                // لون برتقالي مميز
  }
];

// ======================================
// 🔧 دوال مساعدة للتحقق والتنسيق
// ======================================

// ======================================
// 🔧 دوال مساعدة للتحقق والتنسيق
// ======================================
// ملاحظة: هذه الدوال مُعرّفة خارج الـ component لأنها pure functions
// وسيتم استخدامها داخل useCallback في الـ component

// ======================================
// 📱 صفحة مصادقة الهاتف الرئيسية
// ======================================

/**
 * 🔍 التحقق من صحة رقم الهاتف العراقي
 * يتحقق من الطول والبادئة ويدعم الإدخال مع/بدون الصفر
 * 
 * @param phone - رقم الهاتف المدخل
 * @returns هل الرقم صحيح ومعلومات الشبكة
 */
function validateIraqiPhone(phone: string): { 
  isValid: boolean; 
  network: IraqiNetwork | null; 
  formattedPhone: string;
  error?: string;
} {
  // إزالة الفراغات والرموز الإضافية
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
  
  // التحقق من طول الرقم (يجب أن يكون 10 أرقام مع الصفر أو 9 بدونه)
  if (cleanPhone.length < 9 || cleanPhone.length > 10) {
    return {
      isValid: false,
      network: null,
      formattedPhone: cleanPhone,
      error: 'رقم الهاتف يجب أن يكون 10 أرقام (مع الصفر) أو 9 أرقام (بدون الصفر)'
    };
  }
  
  // تنسيق الرقم - إضافة الصفر إذا لم يكن موجوداً
  let formattedPhone = cleanPhone;
  if (cleanPhone.length === 9) {
    formattedPhone = '0' + cleanPhone;
  }
  
  // التحقق من البادئة
  const prefix = formattedPhone.substring(0, 3);
  const network = IRAQI_NETWORKS.find(n => n.prefixes.includes(prefix));
  
  if (!network) {
    return {
      isValid: false,
      network: null,
      formattedPhone,
      error: `البادئة ${prefix} غير مدعومة. البادئات المدعومة: ${IRAQI_NETWORKS.flatMap(n => n.prefixes).join(', ')}`
    };
  }
  
  return {
    isValid: true,
    network,
    formattedPhone,
  };
}

/**
 * 🎨 تنسيق رقم الهاتف للعرض
 * ينسق الرقم بشكل جميل مع فواصل
 * مثال: 07712345678 → 0771 234 5678
 */
function formatPhoneDisplay(phone: string): string {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
  if (cleanPhone.length === 10) {
    return `${cleanPhone.substring(0, 4)} ${cleanPhone.substring(4, 7)} ${cleanPhone.substring(7)}`;
  }
  return phone;
}

/**
 * ⏰ تحويل FirebaseTimestamp إلى ثواني متبقية
 * يحسب الفرق بين الوقت الحالي ووقت انتهاء الصلاحية
 */
function getTimeRemainingFromTimestamp(timestamp: FirebaseTimestamp): number {
  const expiryDate = timestamp.toDate();
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
}

/**
 * 📅 تنسيق الوقت المتبقي للعرض
 * يحول الثواني إلى نص عربي مفهوم
 */
function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'انتهت الصلاحية';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${seconds} ثانية`;
}

/**
 * 🔄 التحقق من إمكانية إعادة الإرسال (حماية إضافية)
 * يتحقق من الوقت المسموح بين الطلبات لمنع spam
 * 
 * 💡 الفائدة: محجوز للاستخدام المستقبلي - فحص إضافي client-side لضمان عدم إرسال OTP بكثرة
 * 🔗 التكامل: سيُستخدم في المستقبل مع handleResendOTP لحماية إضافية من جانب الفرونت إند
 * 📊 القيم: lastSentAt (آخر إرسال), cooldownSeconds (فترة الانتظار - افتراضي 60 ثانية)
 * 🛡️ الحماية: طبقة إضافية من الحماية بجانب Backend rate limiting
 * 
 * ملاحظة: حالياً otpStats.canResend يدير هذه الوظيفة، لكن هذه الدالة جاهزة للاستخدام المستقبلي
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
function canResendOTP(lastSentAt: Date | null, cooldownSeconds: number = 60): boolean {
  if (!lastSentAt) return true;
  
  const now = new Date();
  const diffMs = now.getTime() - lastSentAt.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  
  return diffSeconds >= cooldownSeconds;
}

export default function PhoneAuthPage(): React.JSX.Element {
  
  // ======================================
  // 📊 الحالة المحلية للصفحة
  // ======================================
  
  const [currentStep, setCurrentStep] = useState<AuthStep>('phone_input');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [detectedNetwork, setDetectedNetwork] = useState<IraqiNetwork | null>(null);
  const [otpStats, setOtpStats] = useState<OTPStats>({
    timeRemaining: 0,
    attemptsRemaining: 3,
    canResend: true,
    lastSentAt: null
  });
  
  const [formState, setFormState] = useState<FormState>({
    phone: '',
    fullName: '',
    otpCode: '',
    acceptTerms: false,
    isLoading: false,
    error: null,
    showOTP: false
  });
  
  // ======================================
  // 🔗 الخدمات والأدوات المطلوبة
  // ======================================
  
  const router = useRouter();                          // 📍 للتنقل بين الصفحات
  const searchParams = useSearchParams();              // 🔍 لقراءة معاملات URL
  const { setUser, setToken } = useAuthStore();        // 🏪 تحديث حالة المصادقة
  
  // ======================================
  // ⚡ التأثيرات الجانبية
  // ======================================
  
  /**
   * العداد التنازلي لـ OTP
   * يحدث كل ثانية عندما يكون OTP نشطاً
   */
  useEffect(() => {
    if (currentStep === 'otp_verification' && otpStats.timeRemaining > 0) {
      const timer = setInterval(() => {
        setOtpStats(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
          canResend: prev.timeRemaining <= 1
        }));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentStep, otpStats.timeRemaining]);
  
  /**
   * قراءة معاملات URL عند التحميل
   * يدعم التنقل المباشر من صفحات أخرى
   */
  useEffect(() => {
    if (!searchParams) return;
    
    const mode = searchParams.get('mode');
    const phone = searchParams.get('phone');
    
    if (mode === 'register' || mode === 'login') {
      setAuthMode(mode);
    }
    
    if (phone) {
      setFormState(prev => ({ ...prev, phone }));
      // التحقق من الرقم المرسل
      const validation = validateIraqiPhone(phone);
      if (validation.isValid) {
        setDetectedNetwork(validation.network);
        setFormState(prev => ({ ...prev, phone: validation.formattedPhone }));
      }
    }
  }, [searchParams]);
  
  // ======================================
  // 🔧 دوال معالجة النماذج
  // ======================================
  
  /**
   * معالجة تغيير رقم الهاتف
   * يتحقق من الرقم تلقائياً ويكتشف الشبكة
   */
  const handlePhoneChange = useCallback((value: string): void => {
    const validation = validateIraqiPhone(value);
    
    setFormState(prev => ({
      ...prev,
      phone: validation.formattedPhone,
      error: validation.error || null
    }));
    
    setDetectedNetwork(validation.network);
  }, []);
  
  /**
   * معالجة تقديم رقم الهاتف
   * يرسل OTP أو ينتقل لمرحلة إدخال الاسم
   */
  const handlePhoneSubmit = useCallback(async (): Promise<void> => {
    const validation = validateIraqiPhone(formState.phone);
    
    if (!validation.isValid) {
      setFormState(prev => ({
        ...prev,
        error: validation.error || 'رقم هاتف غير صحيح'
      }));
      return;
    }
    
    setFormState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // تحضير بيانات الطلب
      const otpRequest: OTPSendRequest = {
        phone: validation.formattedPhone.substring(1), // إزالة الصفر
        country_code: '+964',
        purpose: authMode === 'login' ? 'login' : 'registration'
      };
      
      // محاولة إرسال OTP
      let otpResult: OTPSendResult;
      
      if (authMode === 'login') {
        // محاولة تسجيل الدخول
        const loginData: PhoneLoginData = {
          phone: validation.formattedPhone.substring(1),
          country_code: '+964'
        };
        
                 const authResult = await authService.signInWithPhone(loginData);
        
        if (!authResult.success) {
          // المستخدم غير موجود - تحويل للتسجيل
          setAuthMode('register');
          setCurrentStep('name_input');
          setFormState(prev => ({
            ...prev,
            isLoading: false,
            error: 'لم نجد حساب بهذا الرقم. سنقوم بإنشاء حساب جديد لك.'
          }));
          return;
        }
        
        // تم العثور على المستخدم، استخراج معلومات OTP من الرد
        otpResult = {
          success: true,
          message: authResult.message,
          expires_at: authResult.expires_at!, // متأكدين أنه موجود للـ phone login
          attempts_remaining: 3,
          can_resend_at: authResult.expires_at! // نفس وقت الانتهاء افتراضياً
        };
        
      } else {
        // إرسال OTP للتسجيل الجديد
        otpResult = await authService.sendOTP(otpRequest);
      }
      
      if (otpResult.success) {
        // نجح الإرسال - الانتقال لمرحلة التحقق
        setCurrentStep('otp_verification');
        setOtpStats({
          timeRemaining: getTimeRemainingFromTimestamp(otpResult.expires_at),
          attemptsRemaining: otpResult.attempts_remaining,
          canResend: false,
          lastSentAt: new Date()
        });
        
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          error: null
        }));
        
      } else {
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          error: otpResult.message
        }));
      }
      
    } catch (error) {
      console.error('❌ خطأ في إرسال OTP:', error);
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'حدث خطأ في إرسال رمز التحقق'
      }));
    }
  }, [formState.phone, authMode]);
  
  /**
   * معالجة التحقق من OTP
   * يتحقق من الرمز ويكمل عملية المصادقة
   */
  const handleOTPVerify = useCallback(async (): Promise<void> => {
    if (formState.otpCode.length !== 6) {
      setFormState(prev => ({
        ...prev,
        error: 'يرجى إدخال رمز التحقق المكون من 6 أرقام'
      }));
      return;
    }
    
    setFormState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const verification = validateIraqiPhone(formState.phone);
      
      const verifyRequest: OTPVerifyRequest = {
        phone: verification.formattedPhone.substring(1), // إزالة الصفر
        country_code: '+964',
        otp_code: formState.otpCode
      };
      
      const result: OTPVerifyResult = await authService.verifyOTP(verifyRequest);
      
      if (result.success) {
        // نجح التحقق
        if (result.user && result.token) {
          // تحديث حالة المصادقة
          setUser(result.user);
          setToken(result.token);
          
          setCurrentStep('success');
          
          // إعادة التوجيه بعد 2 ثانية
          setTimeout(() => {
            if (result.needs_role_selection) {
              router.push('/role-setup');
            } else {
              router.push('/dashboard');
            }
          }, 2000);
          
        } else if (authMode === 'register') {
          // نحتاج اسم المستخدم للتسجيل
          setCurrentStep('name_input');
        }
        
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          error: null
        }));
        
      } else {
        // فشل التحقق
        setOtpStats(prev => ({
          ...prev,
          attemptsRemaining: Math.max(0, prev.attemptsRemaining - 1)
        }));
        
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message,
          otpCode: '' // مسح الرمز الخاطئ
        }));
      }
      
    } catch (error) {
      console.error('❌ خطأ في التحقق من OTP:', error);
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'حدث خطأ في التحقق من الرمز'
      }));
    }
  }, [formState.otpCode, formState.phone, authMode, setUser, setToken, router]);
  
  /**
   * إعادة إرسال OTP
   * يرسل رمز جديد إذا كان مسموحاً
   */
  const handleResendOTP = useCallback(async (): Promise<void> => {
    if (!otpStats.canResend) return;
    
    setFormState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const validation = validateIraqiPhone(formState.phone);
      
      const otpRequest: OTPSendRequest = {
        phone: validation.formattedPhone.substring(1),
        country_code: '+964',
        purpose: authMode === 'login' ? 'login' : 'registration'
      };
      
      const result = await authService.sendOTP(otpRequest);
      
      if (result.success) {
        setOtpStats({
          timeRemaining: getTimeRemainingFromTimestamp(result.expires_at),
          attemptsRemaining: result.attempts_remaining,
          canResend: false,
          lastSentAt: new Date()
        });
        
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          otpCode: '' // مسح الرمز السابق
        }));
        
      } else {
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message
        }));
      }
      
    } catch (error) {
      console.error('❌ خطأ في إعادة إرسال OTP:', error);
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'حدث خطأ في إعادة إرسال الرمز'
      }));
    }
  }, [otpStats.canResend, formState.phone, authMode]);

  /**
   * معالجة إكمال التسجيل الجديد
   * يكمل التسجيل بالاسم الكامل
   */
  const handleCompleteRegistration = useCallback(async (): Promise<void> => {
    if (!formState.fullName.trim()) {
      setFormState(prev => ({
        ...prev,
        error: 'يرجى إدخال الاسم الكامل'
      }));
      return;
    }
    
    if (!formState.acceptTerms) {
      setFormState(prev => ({
        ...prev,
        error: 'يجب الموافقة على الشروط والأحكام'
      }));
      return;
    }
    
    setFormState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const validation = validateIraqiPhone(formState.phone);
      
      const registrationData: PhoneRegistrationData = {
        phone: validation.formattedPhone.substring(1), // إزالة الصفر
        country_code: '+964',
        full_name: formState.fullName.trim(),
        accept_terms: formState.acceptTerms
      };
      
      // استخدام التسجيل الجديد من authService
      const result: AuthResult = await authService.registerWithPhone(registrationData);
      
      if (result.success) {
        setCurrentStep('success');
        
        // إعادة التوجيه بعد 2 ثانية
        setTimeout(() => {
          if (result.needs_role_selection) {
            router.push('/role-setup');
          } else {
            router.push('/dashboard');
          }
        }, 2000);
        
      } else {
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message
        }));
      }
      
    } catch (error) {
      console.error('❌ خطأ في إكمال التسجيل:', error);
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'حدث خطأ في إنشاء الحساب'
      }));
    }
  }, [formState.fullName, formState.acceptTerms, formState.phone, router]);
  
  /**
   * العودة لخطوة سابقة
   */
  const handleGoBack = useCallback((): void => {
    switch (currentStep) {
      case 'otp_verification':
        setCurrentStep('phone_input');
        setFormState(prev => ({ ...prev, otpCode: '', error: null }));
        break;
      case 'name_input':
        setCurrentStep('otp_verification');
        setFormState(prev => ({ ...prev, fullName: '', acceptTerms: false, error: null }));
        break;
      default:
        // العودة للصفحة الرئيسية
        router.push('/');
        break;
    }
  }, [currentStep, router]);

  // ======================================
  // 🎨 عرض واجهة المستخدم
  // ======================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          
          {/* العنوان الرئيسي */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Phone className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {authMode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
            </h1>
            <p className="text-gray-600">
              {currentStep === 'phone_input' && 'أدخل رقم الهاتف العراقي'}
              {currentStep === 'otp_verification' && 'أدخل رمز التحقق المرسل إليك'}
              {currentStep === 'name_input' && 'أكمل بياناتك الشخصية'}
              {currentStep === 'success' && 'مرحباً بك في Depth Studio!'}
            </p>
          </div>

          {/* شريط التقدم */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              {['phone_input', 'otp_verification', 'name_input', 'success'].map((step, index) => {
                const stepIndex = ['phone_input', 'otp_verification', 'name_input', 'success'].indexOf(currentStep);
                const isActive = index <= stepIndex;
                const isCurrent = index === stepIndex;
                
                return (
                  <div
                    key={step}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      isActive 
                        ? (isCurrent ? 'bg-blue-500 text-white' : 'bg-green-500 text-white')
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isActive && !isCurrent ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((['phone_input', 'otp_verification', 'name_input', 'success'].indexOf(currentStep) + 1) / 4) * 100}%` 
                }}
              ></div>
            </div>
          </div>

          {/* المحتوى الرئيسي */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            
            {/* مرحلة إدخال رقم الهاتف */}
            {currentStep === 'phone_input' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف العراقي
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">+964</span>
                    </div>
                    <input
                      type="tel"
                      value={formState.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="7712345678"
                      className="w-full pr-16 pl-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
                      disabled={formState.isLoading}
                      maxLength={10}
                    />
                  </div>
                  
                  {/* عرض الشبكة المكتشفة */}
                  {detectedNetwork && (
                    <div className="mt-2 flex items-center space-x-2 space-x-reverse">
                      <div className={`w-3 h-3 rounded-full ${detectedNetwork.color}`}></div>
                      <span className="text-sm text-gray-600">
                        شبكة {detectedNetwork.nameArabic}
                      </span>
                    </div>
                  )}
                  
                  {/* رقم منسق للعرض */}
                  {formState.phone && (
                    <div className="mt-2 text-sm text-gray-600">
                      الرقم: +964{formatPhoneDisplay(formState.phone)}
                    </div>
                  )}
                </div>

                {/* معلومات الشبكات المدعومة */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">الشبكات المدعومة:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {IRAQI_NETWORKS.map((network) => (
                      <div key={network.name} className="flex items-center space-x-2 space-x-reverse">
                        <div className={`w-2 h-2 rounded-full ${network.color}`}></div>
                        <span className="text-xs text-gray-600">
                          {network.nameArabic} ({network.prefixes.join(', ')})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* أزرار التحكم */}
                <div className="space-y-3">
                  <button
                    onClick={handlePhoneSubmit}
                    disabled={formState.isLoading || !validateIraqiPhone(formState.phone).isValid}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {formState.isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
                  </button>
                  
                  <button
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="w-full text-blue-500 hover:text-blue-600 py-2 transition-colors"
                  >
                    {authMode === 'login' ? 'إنشاء حساب جديد' : 'تسجيل دخول بحساب موجود'}
                  </button>
                </div>
              </div>
            )}

            {/* مرحلة التحقق من OTP */}
            {currentStep === 'otp_verification' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                    <Key className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">تم إرسال رمز التحقق</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    أرسلنا رمز التحقق إلى رقم:
                  </p>
                  <p className="text-blue-600 font-medium">
                    +964{formatPhoneDisplay(formState.phone)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رمز التحقق (6 أرقام)
                  </label>
                  <div className="relative">
                    <input
                      type={formState.showOTP ? 'text' : 'password'}
                      value={formState.otpCode}
                      onChange={(e) => setFormState(prev => ({ 
                        ...prev, 
                        otpCode: e.target.value.replace(/\D/g, '').slice(0, 6),
                        error: null 
                      }))}
                      placeholder="123456"
                      className="w-full pr-3 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                      disabled={formState.isLoading}
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setFormState(prev => ({ ...prev, showOTP: !prev.showOTP }))}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center"
                    >
                      {formState.showOTP ? 
                        <EyeOff className="w-5 h-5 text-gray-400" /> : 
                        <Eye className="w-5 h-5 text-gray-400" />
                      }
                    </button>
                  </div>
                </div>

                {/* العداد التنازلي وإعادة الإرسال */}
                <div className="text-center">
                  {otpStats.timeRemaining > 0 ? (
                    <div className="flex items-center justify-center space-x-2 space-x-reverse text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>ينتهي خلال: {formatTimeRemaining(otpStats.timeRemaining)}</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      disabled={formState.isLoading || !otpStats.canResend}
                      className="flex items-center justify-center space-x-2 space-x-reverse text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${formState.isLoading ? 'animate-spin' : ''}`} />
                      <span>إعادة إرسال الرمز</span>
                    </button>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    المحاولات المتبقية: {otpStats.attemptsRemaining}
                  </p>
                </div>

                {/* أزرار التحكم */}
                <div className="space-y-3">
                  <button
                    onClick={handleOTPVerify}
                    disabled={formState.isLoading || formState.otpCode.length !== 6}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {formState.isLoading ? 'جاري التحقق...' : 'تحقق من الرمز'}
                  </button>
                  
                  <button
                    onClick={handleGoBack}
                    className="w-full text-gray-500 hover:text-gray-600 py-2 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>تغيير رقم الهاتف</span>
                  </button>
                </div>
              </div>
            )}

            {/* مرحلة إدخال الاسم (للتسجيل الجديد) */}
            {currentStep === 'name_input' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">أكمل بياناتك</h3>
                  <p className="text-gray-600 text-sm">
                    خطوة أخيرة لإنشاء حسابك الجديد
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={formState.fullName}
                    onChange={(e) => setFormState(prev => ({ 
                      ...prev, 
                      fullName: e.target.value,
                      error: null 
                    }))}
                    placeholder="أدخل اسمك الكامل"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={formState.isLoading}
                  />
                </div>

                <div className="flex items-start space-x-3 space-x-reverse">
                  <input
                    type="checkbox"
                    id="accept_terms"
                    checked={formState.acceptTerms}
                    onChange={(e) => setFormState(prev => ({ 
                      ...prev, 
                      acceptTerms: e.target.checked,
                      error: null 
                    }))}
                    className="mt-1"
                    disabled={formState.isLoading}
                  />
                  <label htmlFor="accept_terms" className="text-sm text-gray-600">
                    أوافق على{' '}
                    <a href="/terms" className="text-blue-500 hover:text-blue-600">
                      الشروط والأحكام
                    </a>
                    {' '}و{' '}
                    <a href="/privacy" className="text-blue-500 hover:text-blue-600">
                      سياسة الخصوصية
                    </a>
                  </label>
                </div>

                {/* أزرار التحكم */}
                <div className="space-y-3">
                  <button
                    onClick={handleCompleteRegistration}
                    disabled={formState.isLoading || !formState.fullName.trim() || !formState.acceptTerms}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {formState.isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
                  </button>
                  
                  <button
                    onClick={handleGoBack}
                    className="w-full text-gray-500 hover:text-gray-600 py-2 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>رجوع</span>
                  </button>
                </div>
              </div>
            )}

            {/* مرحلة النجاح */}
            {currentStep === 'success' && (
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {authMode === 'login' ? 'مرحباً بعودتك!' : 'تم إنشاء حسابك بنجاح!'}
                  </h3>
                  <p className="text-gray-600">
                    جاري إعادة توجيهك...
                  </p>
                </div>
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            )}

            {/* رسالة الخطأ */}
            {formState.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 space-x-reverse">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 text-sm">{formState.error}</p>
                </div>
              </div>
            )}
          </div>

          {/* معلومات إضافية */}
          <div className="mt-6 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-left" dir="ltr">
                  <h4 className="text-sm font-medium text-blue-800 mb-1" dir="rtl">نصائح مهمة:</h4>
                  <ul className="text-xs text-blue-700 space-y-1" dir="rtl">
                    <li>• تأكد من إدخال رقم الهاتف بدون رمز البلد (+964)</li>
                    <li>• يمكنك إدخال الرقم مع أو بدون الصفر الأول</li>
                    <li>• رمز التحقق صالح لمدة 10 دقائق فقط</li>
                    <li>• يمكنك طلب رمز جديد بعد انتهاء الوقت</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 