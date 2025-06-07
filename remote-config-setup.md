# 🎛️ إعداد Remote Config Parameters في Firebase Console

## 📋 الخطوات المطلوبة:

### 1. الدخول إلى Firebase Console
- اذهب إلى: https://console.firebase.google.com/
- اختر مشروع `depth-studio`
- من القائمة الجانبية، اختر **Remote Config**

### 2. إنشاء Parameters الأساسية

#### 🔧 **max_upload_size_mb**
- **Parameter key:** `max_upload_size_mb`
- **Default value:** `10`
- **Value type:** Number
- **Description:** الحد الأقصى لحجم الملفات المرفوعة بالميجابايت

#### ⚡ **api_rate_limit**
- **Parameter key:** `api_rate_limit`
- **Default value:** `100`
- **Value type:** Number
- **Description:** عدد الطلبات المسموحة في الدقيقة لكل مستخدم

#### 🚧 **maintenance_mode**
- **Parameter key:** `maintenance_mode`
- **Default value:** `false`
- **Value type:** Boolean
- **Description:** تفعيل وضع الصيانة للموقع

#### 🆕 **enable_new_features**
- **Parameter key:** `enable_new_features`
- **Default value:** `false`
- **Value type:** Boolean
- **Description:** تفعيل الميزات الجديدة التجريبية

#### 🔐 **max_login_attempts**
- **Parameter key:** `max_login_attempts`
- **Default value:** `5`
- **Value type:** Number
- **Description:** عدد محاولات تسجيل الدخول المسموحة

#### ⏰ **session_timeout_minutes**
- **Parameter key:** `session_timeout_minutes`
- **Default value:** `60`
- **Value type:** Number
- **Description:** مدة انتهاء الجلسة بالدقائق

### 3. إعدادات إضافية مقترحة

#### 📊 **featured_photographers_limit**
- **Parameter key:** `featured_photographers_limit`
- **Default value:** `6`
- **Value type:** Number
- **Description:** عدد المصورين المميزين في الصفحة الرئيسية

#### 🎨 **enable_dark_mode**
- **Parameter key:** `enable_dark_mode`
- **Default value:** `true`
- **Value type:** Boolean
- **Description:** تفعيل الوضع المظلم

#### 💰 **payment_methods**
- **Parameter key:** `payment_methods`
- **Default value:** `["visa", "mastercard", "paypal"]`
- **Value type:** JSON
- **Description:** طرق الدفع المتاحة

#### 🧪 **beta_user_percentage**
- **Parameter key:** `beta_user_percentage`
- **Default value:** `10`
- **Value type:** Number
- **Description:** نسبة المستخدمين الذين يحصلون على الميزات التجريبية

### 4. نشر التحديثات
- بعد إضافة جميع Parameters، اضغط **Publish changes**
- أضف وصف للتحديث: "Initial Remote Config setup for Depth Studio"
- اضغط **Publish**

### 5. التحقق من التطبيق
- ستصبح القيم متاحة فوراً في التطبيق
- يمكن تغييرها في أي وقت بدون إعادة نشر الكود

## 🎯 الاستخدام في الكود:

### Backend:
```typescript
import { remoteConfigService } from '../config/firebase';

// فحص وضع الصيانة
if (remoteConfigService.isMaintenanceMode()) {
  return res.status(503).json({ message: 'الموقع في وضع الصيانة' });
}

// الحصول على حد الرفع
const maxSize = remoteConfigService.getValue('max_upload_size_mb', 10);
```

### Frontend:
```typescript
import { remoteConfig } from '../lib/remoteConfig';

// الحصول على القيم
const darkModeEnabled = await remoteConfig.getBoolean('enable_dark_mode');
const featuredLimit = await remoteConfig.getNumber('featured_photographers_limit');
```

## ✅ التحقق من النجاح:
- يجب أن تظهر جميع Parameters في Remote Config Console
- يجب أن تعمل القيم في التطبيق فوراً
- يمكن تغيير القيم ومشاهدة التأثير مباشرة 