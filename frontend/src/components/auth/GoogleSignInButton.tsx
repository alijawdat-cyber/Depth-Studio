'use client'

import React, { useState } from 'react'
import clsx from 'clsx'
import { 
  signInWithGoogleSmart,
  getGoogleRedirectResult,
  extractGoogleToken,
  extractGoogleUserInfo,
  GoogleUserInfo
} from '@/lib/firebase'
import { GoogleLoginData, AuthResult } from '@depth-studio/types'
import { UserCredential } from 'firebase/auth'

// ======================================
// 🎨 Google Sign-in Button Component
// ======================================

/** خصائص مكون Google Sign-in Button */
export interface GoogleSignInButtonProps {
  /** دالة استدعاء عند نجاح المصادقة */
  // eslint-disable-next-line no-unused-vars
  onSuccess: (result: AuthResult) => void;
  /** دالة استدعاء عند حدوث خطأ */
  // eslint-disable-next-line no-unused-vars
  onError: (error: Error) => void;
  /** نوع الزر (تسجيل دخول أو تسجيل جديد) */
  variant?: 'login' | 'register';
  /** حجم الزر */
  size?: 'sm' | 'md' | 'lg';
  /** تعطيل الزر */
  disabled?: boolean;
  /** نص مخصص للزر */
  customText?: string;
  /** عرض الزر بالكامل */
  fullWidth?: boolean;
  /** فئة CSS إضافية */
  className?: string;
}

/**
 * 🌐 مكون Google Sign-in Button
 * مطابق لتصميم Google Material Design مع دعم كامل للعربية
 */
export function GoogleSignInButton({
  onSuccess,
  onError,
  variant = 'login',
  size = 'md',
  disabled = false,
  customText,
  fullWidth = false,
  className
}: GoogleSignInButtonProps) {
  // ======================================
  // 🔄 حالة المكون
  // ======================================
  
  const [isLoading, setIsLoading] = useState(false);
  
  // ======================================
  // 📝 النصوص حسب النوع
  // ======================================
  
  const texts = {
    login: customText || 'تسجيل الدخول بحساب جوجل',
    register: customText || 'إنشاء حساب بجوجل'
  };
  
  // ======================================
  // 🎨 أنماط التصميم
  // ======================================
  
  const baseClasses = [
    // التصميم الأساسي
    'inline-flex items-center justify-center',
    'font-medium rounded-lg transition-all duration-200',
    'border border-gray-300 bg-white hover:bg-gray-50',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    'shadow-sm hover:shadow-md',
    
    // حالة التعطيل
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-sm',
    
    // العرض الكامل
    fullWidth ? 'w-full' : '',
  ].filter(Boolean);
  
  const sizes = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-3',
    lg: 'px-8 py-4 text-lg gap-4'
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  // ======================================
  // 🔧 معالج النقر على الزر
  // ======================================
  
  const handleGoogleSignIn = async () => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    
    try {
      console.log(`🌐 بدء ${variant === 'login' ? 'تسجيل الدخول' : 'التسجيل'} بجوجل...`);
      
      // محاولة تسجيل الدخول الذكي
      const userCredential = await signInWithGoogleSmart();
      
      if (userCredential) {
        // نجح تسجيل الدخول مباشرة (Popup)
        await processGoogleResult(userCredential);
      } else {
        // تم استخدام Redirect، سيتم معالجة النتيجة عند العودة للصفحة
        console.log('🔄 تم استخدام Google Redirect، انتظار العودة للصفحة...');
      }
      
    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول بجوجل:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      const friendlyError = getFriendlyErrorMessage(errorMessage);
      
      onError(new Error(friendlyError));
      setIsLoading(false);
    }
  };
  
  // ======================================
  // 🔄 معالجة نتيجة Google Auth
  // ======================================
  
  const processGoogleResult = async (userCredential: UserCredential) => {
    try {
      // استخراج Google ID Token
      const googleToken = await extractGoogleToken(userCredential);
      
      // استخراج معلومات المستخدم
      const userInfo = extractGoogleUserInfo(userCredential);
      
      console.log('👤 معلومات المستخدم من جوجل:', {
        email: userInfo.email,
        name: userInfo.displayName,
        isNewUser: userInfo.isNewUser
      });
      
      // تجهيز البيانات للإرسال للـ Backend
      const googleLoginData: GoogleLoginData = {
        google_token: googleToken
      };
      
      // إنشاء نتيجة صحيحة مع google_token للمعالجة في المكون الأب
      const result: AuthResult & { 
        google_token: string; 
        googleUserInfo: GoogleUserInfo;
        googleLoginData: GoogleLoginData;
      } = {
        success: true,
        message: `تم ${variant === 'login' ? 'تسجيل الدخول' : 'التسجيل'} بجوجل بنجاح`,
        needs_role_selection: userInfo.isNewUser, // المستخدمون الجدد يحتاجون اختيار دور
        needs_phone_verification: false, // جوجل لا يحتاج تحقق هاتف
        needs_email_verification: false, // البريد الإلكتروني محقق من جوجل
        google_token: googleToken,
        googleUserInfo: userInfo,
        googleLoginData,
        // سيتم إضافة user و token من الـ Backend في المكون الأب
      };
       
       onSuccess(result as AuthResult);
      setIsLoading(false);
      
    } catch (error) {
      console.error('❌ خطأ في معالجة نتيجة جوجل:', error);
      onError(error instanceof Error ? error : new Error('فشل في معالجة بيانات جوجل'));
      setIsLoading(false);
    }
  };
  
  // ======================================
  // 🌐 فحص نتيجة Redirect عند التحميل
  // ======================================
  
  React.useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getGoogleRedirectResult();
        if (result) {
          console.log('📥 تم استلام نتيجة Google Redirect');
          await processGoogleResult(result);
        }
      } catch (error) {
        console.error('❌ خطأ في فحص نتيجة Google Redirect:', error);
        onError(error instanceof Error ? error : new Error('فشل في معالجة نتيجة Google Redirect'));
      }
    };
    
    checkRedirectResult();
  }, []);
  
  // ======================================
  // 📝 رسائل الأخطاء الودية
  // ======================================
  
  const getFriendlyErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes('popup-closed-by-user')) {
      return 'تم إلغاء عملية تسجيل الدخول';
    }
    
    if (errorMessage.includes('popup-blocked')) {
      return 'تم حجب النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة والمحاولة مرة أخرى';
    }
    
    if (errorMessage.includes('network-request-failed')) {
      return 'خطأ في الاتصال بالإنترنت. يرجى المحاولة مرة أخرى';
    }
    
    if (errorMessage.includes('too-many-requests')) {
      return 'تم تجاوز الحد المسموح من المحاولات. يرجى المحاولة لاحقاً';
    }
    
    return 'حدث خطأ في تسجيل الدخول بجوجل. يرجى المحاولة مرة أخرى';
  };
  
  // ======================================
  // 🎨 رندر المكون
  // ======================================
  
  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading}
      className={clsx(
        baseClasses,
        sizes[size],
        'text-gray-700',
        className
      )}
      aria-label={texts[variant]}
    >
      {/* أيقونة جوجل */}
      {isLoading ? (
        <div className={clsx('animate-spin', iconSizes[size])}>
          <svg className="w-full h-full" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="32"
              strokeDashoffset="32"
            >
              <animate
                attributeName="stroke-dasharray"
                dur="2s"
                values="0 32;16 16;0 32;0 32"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-dashoffset"
                dur="2s"
                values="0;-16;-32;-32"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
      ) : (
        <svg className={iconSizes[size]} viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      
      {/* النص */}
      <span className="font-medium">
        {isLoading ? 'جاري التحميل...' : texts[variant]}
      </span>
    </button>
  );
}

// ======================================
// 📤 تصدير المكون
// ======================================

export default GoogleSignInButton; 