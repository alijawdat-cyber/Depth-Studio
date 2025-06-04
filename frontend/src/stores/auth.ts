import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithCredential,
  type User as FirebaseUser,
  type ConfirmationResult
} from 'firebase/auth'
import { 
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import type { 
  AuthUser, 
  AuthState, 
  LoginCredentials, 
  RegisterData,
  User,
  UserPermissions 
} from '../../../shared/types'

export const useAuthStore = defineStore('auth', () => {
  // ======================================
  // State
  // ======================================
  const user = ref<AuthUser | null>(null)
  const userProfile = ref<User | null>(null)
  const permissions = ref<UserPermissions | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 🆕 Phone Auth State
  const phoneConfirmationResult = ref<ConfirmationResult | null>(null)
  const recaptchaVerifier = ref<RecaptchaVerifier | null>(null)

  // ======================================
  // Getters
  // ======================================
  const isAuthenticated = computed(() => !!user.value)
  const currentUserRole = computed(() => userProfile.value?.primary_role || null)
  const isVerified = computed(() => user.value?.emailVerified || false)
  
  // 🆕 حالة كاملة للـ Auth (تطبيق AuthState)
  const authState = computed(() => ({
    user: user.value,
    userProfile: userProfile.value,
    permissions: permissions.value,
    isAuthenticated: isAuthenticated.value,
    isLoading: isLoading.value,
    error: error.value
  }))

  // ======================================
  // Actions
  // ======================================

  /**
   * تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
   */
  async function login(credentials: LoginCredentials) {
    try {
      isLoading.value = true
      error.value = null

      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      )

      await loadUserProfile(userCredential.user.uid)
      
      return { success: true }
    } catch (err: any) {
      const errorMessage = getFirebaseErrorMessage(err.code)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * تسجيل الدخول بـ Google - محسن
   */
  async function loginWithGoogle() {
    try {
      isLoading.value = true
      error.value = null

      console.log('🔵 بدء عملية تسجيل الدخول بجوجل...')
      
      // 🔍 تشخيص حاسم: التحقق من database configuration
      console.log('🔍 Database Debug Info:', {
        dbInstance: !!db,
        // محاولة استخراج database ID من الـ db object
        databaseId: (db as any)._delegate?._databaseId || 'unknown',
        databaseURL: (db as any)._delegate?._settings?.databaseURL || 'unknown',
        projectId: (db as any)._delegate?._settings?.projectId || 'unknown'
      })

      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')
      
      // محاولة popup أولاً، مع fallback للـ redirect
      let userCredential
      try {
        console.log('🔵 محاولة popup...')
        userCredential = await signInWithPopup(auth, provider)
        console.log('✅ نجح popup، UID:', userCredential.user.uid)
      } catch (popupError: any) {
        console.log('❌ فشل popup:', popupError.code)
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
          // fallback إلى redirect
          await signInWithRedirect(auth, provider)
          return { success: true, message: 'جاري التوجيه للمصادقة...' }
        }
        throw popupError
      }
      
      console.log('🔵 فحص وجود المستخدم في Firestore...')
      console.log('🔍 البحث عن UID:', userCredential.user.uid)
      
      // تحقق من وجود المستخدم في قاعدة البيانات
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
      
      console.log('🔍 نتيجة البحث - يوجد مستند:', userDoc.exists())
      
      if (!userDoc.exists()) {
        console.log('🔵 إنشاء ملف تعريف جديد للمستخدم...')
        
        // إنشاء ملف تعريف جديد للمستخدم
        const newUserProfile: Partial<User> = {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          display_name: userCredential.user.displayName || '',
          first_name: userCredential.user.displayName?.split(' ')[0] || '',
          last_name: userCredential.user.displayName?.split(' ')[1] || '',
          profile_photo_url: userCredential.user.photoURL || undefined,
          primary_role: 'new_user',
          status: 'pending_role_setup',
          is_active: true,
          is_verified: false,
          firebase_uid: userCredential.user.uid,
          auth_providers: ['google'],
          total_login_count: 1,
          timezone: 'Asia/Baghdad',
          language: 'ar',
          is_online: true,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        }

        console.log('🔵 بيانات المستخدم الجديد:', {
          uid: newUserProfile.id,
          email: newUserProfile.email,
          role: newUserProfile.primary_role,
          status: newUserProfile.status
        })

        console.log('🔵 محاولة حفظ المستند في Firestore...')
        
        try {
        await setDoc(doc(db, 'users', userCredential.user.uid), newUserProfile)
          console.log('✅ تم حفظ مستند المستخدم بنجاح!')
        } catch (setDocError: any) {
          console.error('❌ خطأ في حفظ مستند المستخدم:', setDocError)
          console.error('💡 كود الخطأ:', setDocError.code)
          console.error('💡 رسالة الخطأ:', setDocError.message)
          throw setDocError
        }
      } else {
        console.log('ℹ️ المستخدم موجود مسبقاً في Firestore')
      }

      console.log('🔵 تحميل ملف المستخدم...')
      await loadUserProfile(userCredential.user.uid)
      
      console.log('✅ اكتملت عملية تسجيل الدخول بجوجل بنجاح')
      return { success: true }
    } catch (err: any) {
      console.error('❌ خطأ في تسجيل الدخول بجوجل:', err)
      console.error('💡 كود الخطأ:', err.code)
      console.error('💡 رسالة الخطأ:', err.message)
      
      const errorMessage = getFirebaseErrorMessage(err.code)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * إعداد reCAPTCHA للهاتف
   */
  function setupRecaptcha(containerId: string = 'recaptcha-container') {
    try {
      if (recaptchaVerifier.value) {
        recaptchaVerifier.value.clear()
      }
      
      recaptchaVerifier.value = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved')
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired')
          error.value = 'انتهت صلاحية التحقق، حاول مرة أخرى'
        }
      })
      
      return recaptchaVerifier.value
    } catch (err: any) {
      console.error('Setup reCAPTCHA error:', err)
      error.value = 'خطأ في إعداد التحقق'
      return null
    }
  }

  /**
   * إرسال رمز التحقق للهاتف
   */
  async function sendPhoneVerification(phoneNumber: string) {
    try {
      isLoading.value = true
      error.value = null

      // إعداد reCAPTCHA
      const recaptcha = setupRecaptcha()
      if (!recaptcha) {
        throw new Error('فشل في إعداد التحقق')
      }

      // إرسال رمز التحقق
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptcha)
      phoneConfirmationResult.value = confirmationResult
      
      return { 
        success: true, 
        confirmationResult,
        message: 'تم إرسال رمز التحقق بنجاح' 
      }
      
    } catch (err: any) {
      console.error('Send phone verification error:', err)
      const errorMessage = getFirebaseErrorMessage(err.code)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * تأكيد رمز التحقق
   */
  async function verifyPhoneCode(code: string) {
    try {
      isLoading.value = true
      error.value = null

      if (!phoneConfirmationResult.value) {
        throw new Error('لم يتم إرسال رمز التحقق')
      }

      const result = await phoneConfirmationResult.value.confirm(code)
      
      // تحقق من وجود المستخدم في قاعدة البيانات
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      
      if (!userDoc.exists()) {
        // إنشاء ملف تعريف جديد للمستخدم
        const newUserProfile: Partial<User> = {
          id: result.user.uid,
          email: result.user.email || undefined,
          phone: result.user.phoneNumber || undefined,
          display_name: result.user.phoneNumber || 'مستخدم',
          first_name: 'مستخدم',
          last_name: '',
          primary_role: 'new_user',
          status: 'pending_role_setup',
          is_active: true,
          is_verified: false,
          firebase_uid: result.user.uid,
          auth_providers: ['phone'],
          total_login_count: 1,
          timezone: 'Asia/Baghdad',
          language: 'ar',
          is_online: true,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        }

        await setDoc(doc(db, 'users', result.user.uid), newUserProfile)
      }

      await loadUserProfile(result.user.uid)
      
      // تنظيف
      phoneConfirmationResult.value = null
      if (recaptchaVerifier.value) {
        recaptchaVerifier.value.clear()
        recaptchaVerifier.value = null
      }
      
      return { success: true }
      
    } catch (err: any) {
      console.error('Verify phone code error:', err)
      const errorMessage = getFirebaseErrorMessage(err.code)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * تسجيل الدخول بالهاتف - محديث
   */
  async function loginWithPhone(phoneNumber: string) {
    return await sendPhoneVerification(phoneNumber)
  }

  /**
   * معالجة redirect result للـ Google
   */
  async function handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth)
      if (result) {
        await loadUserProfile(result.user.uid)
        return { success: true }
      }
      return { success: false, error: 'لا يوجد نتيجة redirect' }
    } catch (err: any) {
      const errorMessage = getFirebaseErrorMessage(err.code)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    }
  }

  /**
   * تسجيل مستخدم جديد
   */
  async function register(registerData: RegisterData) {
    try {
      isLoading.value = true
      error.value = null

      // إنشاء حساب Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        registerData.email,
        registerData.password
      )

      // إنشاء ملف تعريف المستخدم
      const newUserProfile: Partial<User> = {
        id: userCredential.user.uid,
        email: registerData.email,
        display_name: `${registerData.first_name} ${registerData.last_name}`,
        first_name: registerData.first_name,
        last_name: registerData.last_name,
        phone: registerData.phone,
        primary_role: registerData.primary_role,
        is_active: true,
        is_verified: false,
        firebase_uid: userCredential.user.uid,
        auth_providers: ['email'],
        total_login_count: 1,
        timezone: 'Asia/Baghdad',
        language: 'ar',
        is_online: true,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), newUserProfile)
      await loadUserProfile(userCredential.user.uid)

      return { success: true }
    } catch (err: any) {
      const errorMessage = getFirebaseErrorMessage(err.code)
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * تسجيل الخروج
   */
  async function logout() {
    try {
      isLoading.value = true
      
      // تحديث حالة المستخدم إلى غير متصل
      if (user.value) {
        await setDoc(doc(db, 'users', user.value.uid), {
          is_online: false,
          last_seen: Timestamp.now()
        }, { merge: true })
      }

      await signOut(auth)
      
      // مسح البيانات المحلية
      user.value = null
      userProfile.value = null
      permissions.value = null
      error.value = null
      
      return { success: true }
    } catch (err: any) {
      error.value = 'حدث خطأ أثناء تسجيل الخروج'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 🆕 تعيين خطأ مخصص (يحل مشكلة readonly)
   */
  function setError(message: string) {
    error.value = message
  }

  /**
   * تحميل ملف تعريف المستخدم من قاعدة البيانات
   */
  async function loadUserProfile(uid: string) {
    try {
      console.log('🔵 loadUserProfile: بدء تحميل ملف المستخدم:', uid)
      
      // إضافة retry logic للتعامل مع أخطاء الشبكة
      let retries = 3;
      let userDoc;
      
      while (retries > 0) {
        try {
          console.log(`🔵 loadUserProfile: محاولة ${4 - retries}/3 لتحميل المستند`)
          userDoc = await getDoc(doc(db, 'users', uid))
          console.log('✅ loadUserProfile: نجح استرجاع المستند، موجود:', userDoc.exists())
          break; // نجح الاستعلام، اخرج من الحلقة
        } catch (err: any) {
          retries--;
          console.warn(`❌ loadUserProfile: محاولة تحميل ملف المستخدم فشلت، المحاولات المتبقية: ${retries}`, err)
          
          if (retries === 0) {
            // آخر محاولة فشلت
            if (err.code === 'permission-denied') {
              throw new Error('لا توجد صلاحية لقراءة بيانات المستخدم')
            } else if (err.code === 'unavailable') {
              throw new Error('خدمة قاعدة البيانات غير متاحة حالياً')
            }
            throw err
          }
          
          // انتظار ثانية قبل المحاولة التالية
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      if (userDoc && userDoc.exists()) {
        console.log('✅ loadUserProfile: المستند موجود، استخراج البيانات...')
        const userData = userDoc.data()
        console.log('📄 loadUserProfile: بيانات المستخدم:', {
          id: userDoc.id,
          email: userData.email,
          role: userData.primary_role,
          status: userData.status,
          display_name: userData.display_name
        })
        
        userProfile.value = { 
          id: userDoc.id, 
          ...userData 
        } as User

        // تحميل الصلاحيات
        console.log('🔵 loadUserProfile: تحميل الصلاحيات...')
        await loadUserPermissions(uid)

        // تحديث آخر نشاط
        console.log('🔵 loadUserProfile: تحديث آخر نشاط...')
        await setDoc(doc(db, 'users', uid), {
          last_login: Timestamp.now(),
          is_online: true,
          total_login_count: (userProfile.value.total_login_count || 0) + 1
        }, { merge: true })
        
        console.log('✅ loadUserProfile: اكتمل تحميل ملف المستخدم بنجاح')
      } else {
        console.warn('⚠️ loadUserProfile: ملف المستخدم غير موجود في قاعدة البيانات:', uid)
        userProfile.value = null
      }
    } catch (err: any) {
      console.error('❌ loadUserProfile: خطأ في تحميل ملف تعريف المستخدم:', err)
      console.error('💡 loadUserProfile: كود الخطأ:', err.code)
      console.error('💡 loadUserProfile: رسالة الخطأ:', err.message)
      // لا نرمي الخطأ هنا لتجنب كسر التطبيق
      // بدلاً من ذلك، نسجل الخطأ ونتركه يكمل
      userProfile.value = null
    }
  }

  /**
   * تحميل صلاحيات المستخدم
   */
  async function loadUserPermissions(uid: string) {
    try {
      const permissionsQuery = query(
        collection(db, 'user_permissions'),
        where('user_id', '==', uid),
        where('is_active', '==', true)
      )
      
      const permissionsSnapshot = await getDocs(permissionsQuery)
      
      if (!permissionsSnapshot.empty) {
        const permissionDoc = permissionsSnapshot.docs[0]
        permissions.value = {
          id: permissionDoc.id,
          ...permissionDoc.data()
        } as UserPermissions
      }
    } catch (err) {
      console.error('خطأ في تحميل الصلاحيات:', err)
    }
  }

  /**
   * 🆕 فحص صلاحية معينة
   */
  function hasPermission(permission: string): boolean {
    if (!permissions.value || !permissions.value.is_active) return false
    
    // فحص صلاحيات الشاشات
    if (permissions.value.screen_permissions && 
        (permissions.value.screen_permissions as any)[permission] !== undefined) {
      return (permissions.value.screen_permissions as any)[permission]
    }
    
    // فحص صلاحيات CRUD
    if (permissions.value.crud_permissions) {
      for (const resource in permissions.value.crud_permissions) {
        const resourcePermissions = (permissions.value.crud_permissions as any)[resource]
        if (resourcePermissions && resourcePermissions[permission] !== undefined) {
          return resourcePermissions[permission]
        }
      }
    }
    
    return false
  }

  /**
   * 🆕 فحص إذا المستخدم يقدر يدير براند معين
   */
  function canManageBrand(brandId: string): boolean {
    if (!permissions.value || !permissions.value.brand_permissions) return false
    
    return permissions.value.brand_permissions.some(bp => 
      bp.brand_id === brandId && 
      (bp.access_level === 'full' || bp.access_level === 'coordinator')
    )
  }

  /**
   * تهيئة مراقب حالة المصادقة
   */
  function initAuthListener() {
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          emailVerified: firebaseUser.emailVerified,
          phoneNumber: firebaseUser.phoneNumber || undefined,
        }
        
        await loadUserProfile(firebaseUser.uid)
      } else {
        user.value = null
        userProfile.value = null
        permissions.value = null
      }
    })
  }

  /**
   * ترجمة رسائل خطأ Firebase إلى العربية - محسن
   */
  function getFirebaseErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'المستخدم غير موجود',
      'auth/wrong-password': 'كلمة المرور غير صحيحة',
      'auth/email-already-in-use': 'البريد الإلكتروني مستخدم مسبقاً',
      'auth/weak-password': 'كلمة المرور ضعيفة، يجب أن تكون 6 أحرف على الأقل',
      'auth/invalid-email': 'البريد الإلكتروني غير صحيح',
      'auth/user-disabled': 'تم تعطيل هذا الحساب',
      'auth/too-many-requests': 'تم تجاوز عدد المحاولات المسموحة، حاول لاحقاً',
      'auth/popup-closed-by-user': 'تم إغلاق نافذة تسجيل الدخول',
      'auth/cancelled-popup-request': 'تم إلغاء طلب تسجيل الدخول',
      'auth/popup-blocked': 'تم حظر النافذة المنبثقة من قبل المتصفح',
      // Phone Auth Errors
      'auth/invalid-phone-number': 'رقم الهاتف غير صحيح',
      'auth/invalid-verification-code': 'رمز التحقق غير صحيح',
      'auth/code-expired': 'انتهت صلاحية رمز التحقق',
      'auth/missing-verification-code': 'رمز التحقق مطلوب',
      'auth/missing-phone-number': 'رقم الهاتف مطلوب',
      'auth/quota-exceeded': 'تم تجاوز حد الرسائل المسموح، حاول لاحقاً',
      'auth/app-not-authorized': 'التطبيق غير مصرح له بإرسال رسائل SMS',
      'auth/captcha-check-failed': 'فشل التحقق من الأمان، حاول مرة أخرى'
    }

    return errorMessages[errorCode] || 'حدث خطأ غير متوقع، حاول مرة أخرى'
  }

  /**
   * مسح رسالة الخطأ
   */
  function clearError() {
    error.value = null
  }

  /**
   * 🆕 تحديث دور المستخدم
   */
  async function updateUserRole(role: string, profileData: any) {
    try {
      isLoading.value = true
      error.value = null

      if (!user.value) {
        throw new Error('المستخدم غير مسجل دخول')
      }

      const userDocRef = doc(db, 'users', user.value.uid)
      
      const updateData = {
        primary_role: role,
        status: 'pending_approval',
        ...profileData,
        updated_at: Timestamp.now()
      }

      await setDoc(userDocRef, updateData, { merge: true })
      await loadUserProfile(user.value.uid)

      return { success: true }
    } catch (err: any) {
      error.value = 'خطأ في تحديث الدور'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // ======================================
  // Initialize
  // ======================================
  initAuthListener()

  return {
    // State (🆕 محسن!)
    user: computed(() => user.value),
    userProfile: computed(() => userProfile.value),
    permissions: computed(() => permissions.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    authState, // 🆕 حالة شاملة
    phoneConfirmationResult: computed(() => phoneConfirmationResult.value),
    
    // Getters
    isAuthenticated,
    currentUserRole,
    isVerified,
    
    // Actions
    login,
    loginWithGoogle,
    loginWithPhone,
    sendPhoneVerification, // 🆕
    verifyPhoneCode, // 🆕
    setupRecaptcha, // 🆕
    handleRedirectResult, // 🆕
    register,
    logout,
    loadUserProfile,
    loadUserPermissions,
    updateUserRole,
    clearError,
    setError, // 🆕 لحل مشكلة readonly
    
    // 🆕 دوال فحص الصلاحيات
    hasPermission,
    canManageBrand
  }
}) 