import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  type User,
  type UserCredential
} from 'firebase/auth'
import { auth } from '@/firebase/config'

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

const AuthService = {
  /**
   * تسجيل دخول بالإيميل وكلمة المرور
   */
  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    try {
      console.log('🔐 محاولة تسجيل الدخول بالإيميل:', email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ تم تسجيل الدخول بنجاح')
      return userCredential
    } catch (error: any) {
      console.error('❌ خطأ في تسجيل الدخول:', error)
      throw this.handleAuthError(error)
    }
  },

  /**
   * إنشاء حساب جديد بالإيميل وكلمة المرور
   */
  async registerWithEmail(email: string, password: string, fullName?: string): Promise<UserCredential> {
    try {
      console.log('📝 محاولة إنشاء حساب جديد بالإيميل:', email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      // تحديث الملف الشخصي إذا تم توفير الاسم
      if (fullName && userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName
        })
        console.log('✅ تم تحديث اسم المستخدم:', fullName)
      }
      
      console.log('✅ تم إنشاء الحساب بنجاح')
      return userCredential
    } catch (error: any) {
      console.error('❌ خطأ في إنشاء الحساب:', error)
      throw this.handleAuthError(error)
    }
  },

  /**
   * تسجيل دخول/تسجيل بـ Google
   */
  async signInWithGoogle(): Promise<UserCredential> {
    try {
      console.log('🔄 محاولة تسجيل الدخول بـ Google...')
      
      let userCredential: UserCredential
      
      try {
        // محاولة استخدام النافذة المنبثقة أولاً
        userCredential = await signInWithPopup(auth, googleProvider)
        console.log('✅ تم تسجيل الدخول بـ Google عبر popup')
      } catch (popupError: any) {
        console.log('⚠️ فشل popup، جاري المحاولة بـ redirect...', popupError.code)
        
        // إذا فشل popup، استخدم redirect
        await signInWithRedirect(auth, googleProvider)
        throw new Error('redirect_in_progress')
      }
      
      return userCredential
    } catch (error: any) {
      console.error('❌ خطأ في تسجيل الدخول بـ Google:', error)
      
      if (error.message === 'redirect_in_progress') {
        throw error
      }
      
      throw this.handleAuthError(error)
    }
  },

  /**
   * التحقق من نتيجة إعادة التوجيه عند تحميل الصفحة
   */
  async handleRedirectResult(): Promise<UserCredential | null> {
    try {
      console.log('🔍 فحص نتيجة إعادة التوجيه...')
      const result = await getRedirectResult(auth)
      
      if (result) {
        console.log('✅ تم العثور على نتيجة إعادة التوجيه:', result.user.email)
        return result
      }
      
      return null
    } catch (error: any) {
      console.error('❌ خطأ في معالجة نتيجة إعادة التوجيه:', error)
      throw this.handleAuthError(error)
    }
  },

  /**
   * تسجيل الخروج
   */
  async signOut(): Promise<void> {
    try {
      console.log('🚪 تسجيل الخروج...')
      await signOut(auth)
      console.log('✅ تم تسجيل الخروج بنجاح')
    } catch (error: any) {
      console.error('❌ خطأ في تسجيل الخروج:', error)
      throw this.handleAuthError(error)
    }
  },

  /**
   * إرسال رابط إعادة تعيين كلمة المرور
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      console.log('📧 إرسال رابط إعادة تعيين كلمة المرور لـ:', email)
      await sendPasswordResetEmail(auth, email)
      console.log('✅ تم إرسال رابط إعادة تعيين كلمة المرور')
    } catch (error: any) {
      console.error('❌ خطأ في إرسال رابط إعادة تعيين كلمة المرور:', error)
      throw this.handleAuthError(error)
    }
  },

  /**
   * تغيير كلمة المرور للمستخدم الحالي
   */
  async changePassword(newPassword: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('المستخدم غير مسجل دخول')
    }

    try {
      console.log('🔑 تغيير كلمة المرور...')
      await updatePassword(auth.currentUser, newPassword)
      console.log('✅ تم تغيير كلمة المرور بنجاح')
    } catch (error: any) {
      console.error('❌ خطأ في تغيير كلمة المرور:', error)
      throw this.handleAuthError(error)
    }
  },

  /**
   * معالجة أخطاء Firebase Auth وتحويلها لرسائل عربية
   */
  handleAuthError(error: any): Error {
    let arabicMessage = 'حدث خطأ غير متوقع'

    switch (error.code) {
      case 'auth/user-not-found':
        arabicMessage = 'البريد الإلكتروني غير مسجل'
        break
      case 'auth/wrong-password':
        arabicMessage = 'كلمة المرور غير صحيحة'
        break
      case 'auth/email-already-in-use':
        arabicMessage = 'البريد الإلكتروني مستخدم بالفعل'
        break
      case 'auth/weak-password':
        arabicMessage = 'كلمة المرور ضعيفة جداً'
        break
      case 'auth/invalid-email':
        arabicMessage = 'البريد الإلكتروني غير صحيح'
        break
      case 'auth/too-many-requests':
        arabicMessage = 'تم تجاوز عدد المحاولات المسموح به، يرجى المحاولة لاحقاً'
        break
      case 'auth/network-request-failed':
        arabicMessage = 'خطأ في الاتصال بالإنترنت'
        break
      case 'auth/requires-recent-login':
        arabicMessage = 'يجب تسجيل الدخول مرة أخرى لإتمام هذه العملية'
        break
      case 'auth/popup-closed-by-user':
        arabicMessage = 'تم إغلاق النافذة قبل إكمال العملية'
        break
      case 'auth/popup-blocked':
        arabicMessage = 'تم حظر النوافذ المنبثقة، يرجى السماح بها والمحاولة مرة أخرى'
        break
      case 'auth/cancelled-popup-request':
        arabicMessage = 'تم إلغاء العملية'
        break
      case 'auth/unauthorized-domain':
        arabicMessage = 'النطاق غير مصرح له بالوصول'
        break
      case 'auth/operation-not-allowed':
        arabicMessage = 'طريقة المصادقة هذه غير مفعلة'
        break
      default:
        arabicMessage = error.message || 'حدث خطأ في المصادقة'
    }

    const customError = new Error(arabicMessage)
    customError.name = error.code || 'AuthError'
    return customError
  }
}

export default AuthService 