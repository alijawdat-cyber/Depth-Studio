# 📚 وثائق استيرادات Frontend Auth Repository

## 🎯 الهدف من هذا الملف
شرح مفصل لفائدة كل استيراد في `frontend-auth-repository.ts` وكيفية استخدامه للتوافق التام مع Backend والأنواع.

---

## 🔐 الاستيرادات الأساسية للمصادقة

### `AuthMethod` - طرق المصادقة المتاحة
```typescript
interface AuthMethod {
  type: AuthProvider;                    // نوع المصادقة (email, phone, google)
  verified: boolean;                     // هل تم التحقق من هذه الطريقة
  created_at: FirebaseTimestamp;         // متى تم إضافة هذه الطريقة
  last_used?: FirebaseTimestamp;         // آخر استخدام لهذه الطريقة
  metadata?: object;                     // بيانات إضافية
}
```
**🎯 الاستخدام في Repository:**
- `getUserAuthMethods()`: جلب جميع طرق المصادقة للمستخدم
- `getAuthProviderFromMethod()`: تحديد نوع مقدم المصادقة
- عرض إعدادات الأمان في صفحة الحساب

---

### `PhoneVerification` - بيانات التحقق من الهاتف العراقي
```typescript
interface PhoneVerification extends BaseEntity {
  phone: string;                         // رقم الهاتف (بدون رمز البلد)
  country_code: string;                  // رمز البلد (+964 للعراق)
  otp_code: string;                      // رمز OTP (6 أرقام)
  expires_at: FirebaseTimestamp;         // متى ينتهي صلاحية الرمز
  attempts: number;                      // عدد محاولات التحقق
  verified: boolean;                     // هل تم التحقق بنجاح
  status: VerificationStatus;            // حالة التحقق
}
```
**🎯 الاستخدام في Repository:**
- `getPhoneVerificationStatus()`: تتبع حالة التحقق من الهاتف
- إدارة cache OTP ومعلومات التحقق
- عرض تقدم عملية التحقق للمستخدم

---

### `AuthSecuritySettings` - إعدادات الأمان
```typescript
interface AuthSecuritySettings {
  max_login_attempts: number;            // الحد الأقصى لمحاولات الدخول
  login_lockout_duration_minutes: number; // مدة الحجب بالدقائق
  otp_expiry_minutes: number;            // مدة انتهاء OTP بالدقائق
  max_otp_attempts: number;              // الحد الأقصى لمحاولات OTP
  session_timeout_hours: number;        // انتهاء الجلسة بالساعات
  require_phone_verification: boolean;   // إلزام تحقق الهاتف
  require_email_verification: boolean;   // إلزام تحقق البريد
}
```
**🎯 الاستخدام في Repository:**
- `getSecuritySettings()`: الحصول على إعدادات الأمان الحالية
- تطبيق قيود الأمان في التطبيق
- إعدادات صفحة الأمان في الملف الشخصي

---

### `AuthProvider` - أنواع مقدمي المصادقة
```typescript
type AuthProvider = 'email' | 'phone' | 'google';
```
**🎯 الاستخدام في Repository:**
- `getAuthProviderFromMethod()`: تحديد نوع المصادقة
- فلترة الإحصائيات حسب نوع المصادقة
- تسجيل الأنشطة مع نوع المصادقة الصحيح

---

### `FirebaseTimestamp` - نوع التوقيت في Firebase
```typescript
type FirebaseTimestamp = Timestamp; // من Firebase Admin SDK
```
**🎯 الاستخدام في Repository:**
- `logLocalAuthActivity()`: تسجيل الوقت بالنوع الصحيح
- معالجة تواريخ انتهاء OTP والجلسات
- التوافق مع قاعدة بيانات Firebase

---

## 📋 بيانات التسجيل وتسجيل الدخول

### `EmailRegistrationData` / `PhoneRegistrationData` / `GoogleRegistrationData`
**🎯 الاستخدام:**
- `registerWithEmail()` / `registerWithPhone()` / `registerWithGoogle()`
- ضمان Type Safety للبيانات الواردة
- التحقق من صحة البيانات قبل الإرسال للـ Backend

### `EmailLoginData` / `PhoneLoginData` / `GoogleLoginData`
**🎯 الاستخدام:**
- `loginWithEmail()` / `loginWithPhone()` / `loginWithGoogle()`
- توحيد هيكل البيانات مع Backend
- سهولة التطوير والصيانة

---

## 🎯 نتائج العمليات

### `AuthResult` - نتيجة عمليات المصادقة
```typescript
interface AuthResult {
  success: boolean;                      // هل العملية نجحت
  user?: User;                           // بيانات المستخدم
  token?: string;                        // JWT token
  needs_role_selection: boolean;         // هل يحتاج اختيار دور
  needs_phone_verification: boolean;     // هل يحتاج تحقق هاتف
  message: string;                       // رسالة للمستخدم
}
```
**🎯 الاستخدام:**
- إرجاع موحد لجميع عمليات التسجيل والدخول
- إدارة تدفق المستخدم بعد المصادقة
- عرض الرسائل المناسبة للمستخدم

### `OTPSendResult` / `OTPVerifyResult`
**🎯 الاستخدام:**
- `sendOTP()` / `verifyOTP()` / `resendOTP()`
- إدارة عملية OTP بالتفصيل
- عرض حالة الإرسال والتحقق للمستخدم

---

## 📊 الإحصائيات والتحليلات

### `RegistrationStats` - إحصائيات التسجيل
**🎯 الاستخدام:**
- `getRegistrationStats()`: للوحة تحكم الأدمن
- تحليل فعالية طرق التسجيل المختلفة
- تقارير نمو المستخدمين

### `AuthMethodUsageStats` - إحصائيات استخدام طرق المصادقة
**🎯 الاستخدام:**
- `getAuthMethodUsageStats()`: لتحليل سلوك المستخدمين
- تحسين تجربة المستخدم
- اتخاذ قرارات المنتج

### `AuthActivityLog` - سجل أنشطة المصادقة
**🎯 الاستخدام:**
- `getAuthActivityLog()`: للأمان والمراقبة
- `logLocalAuthActivity()`: تسجيل الأنشطة محلياً
- كشف النشاط المشبوه

---

## 🔗 الأنواع المساعدة

### `AuthSessionState` - حالة جلسة المصادقة
**🎯 الاستخدام:**
- `getLocalSessionState()`: إدارة حالة الجلسة
- تتبع حالة المصادقة في التطبيق
- إدارة التوجيه والصلاحيات

### `ID` - نوع المعرف الفريد
**🎯 الاستخدام:**
- جميع العمليات التي تستخدم معرفات
- Type Safety للمعرفات
- التوافق مع قاعدة البيانات

### `User` - نوع المستخدم
**🎯 الاستخدام:**
- إرجاع بيانات المستخدم في النتائج
- cache المستخدمين
- التوافق مع أنواع المستخدمين

### `FrontendQueryOptions` - خيارات الاستعلام
**🎯 الاستخدام:**
- جميع عمليات البحث والفلترة
- إدارة cache والصفحات
- التوافق مع واجهة BaseRepository

---

## ✅ التوافق مع Backend

### 🔗 ربط مع AuthService.ts (1,430 سطر)
جميع العمليات في `FrontendAuthRepository` تتوافق مع:
- `AuthService.registerWithEmail()` ↔ `registerWithEmail()`
- `AuthService.loginWithPhone()` ↔ `loginWithPhone()`
- `AuthService.sendOTP()` ↔ `sendOTP()`
- `AuthService.getUserAuthMethods()` ↔ `getUserAuthMethods()`

### 📋 ربط مع APIs
جميع الـ APIs مربوطة بالأنواع الصحيحة:
- `/api/auth/register/email` ← `EmailRegistrationData`
- `/api/auth/login/phone` ← `PhoneLoginData`
- `/api/auth/send-otp` ← `OTPSendRequest`
- `/api/auth/methods/:userId` → `AuthMethod[]`

---

## 🎯 الخلاصة

**كل استيراد له غرض محدد ويُستخدم فعلياً في Repository:**
- ✅ **استيرادات البيانات**: للعمليات الأساسية (تسجيل، دخول، OTP)
- ✅ **استيرادات النتائج**: لإرجاع موحد ومنظم
- ✅ **استيرادات الإحصائيات**: للتحليلات واتخاذ القرارات
- ✅ **استيرادات المساعدة**: للـ Type Safety والتوافق

**🔗 التوافق 100%:**
- مع Backend AuthService (1,430 سطر)
- مع أنواع @depth-studio/types (314 سطر)
- مع BaseRepository Pattern (508 سطر)

**🚫 لا يوجد استيرادات غير مستخدمة** - كل نوع له دور وفائدة في النظام! 