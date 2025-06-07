# 🔐 إعداد GitHub Secrets للنشر الآمن - Depth Studio

هذا الدليل يشرح كيفية إعداد المتغيرات الحساسة في GitHub لنشر المشروع بأمان.

## 📋 قائمة المتغيرات المطلوبة

### 🔥 Firebase Secrets

| اسم المتغير | الوصف | كيفية الحصول عليه |
|-------------|--------|-------------------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | محتوى ملف Service Account Key | Firebase Console → Project Settings → Service Accounts |
| `FIREBASE_TOKEN` | مفتاح CLI للنشر | `firebase login:ci` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | مفتاح Firebase للفرونت إند | Firebase Console → Project Settings → General |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | معرف المرسل للإشعارات | Firebase Console → Project Settings → Cloud Messaging |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | معرف التطبيق | Firebase Console → Project Settings → General |

### 🔐 Security Secrets

| اسم المتغير | الوصف | مثال |
|-------------|--------|-------|
| `JWT_SECRET` | مفتاح تشفير JWT | `your-super-secret-256-bit-key` |
| `ENCRYPTION_KEY` | مفتاح التشفير العام | `your-encryption-key-256-bit` |

## 🛠️ خطوات الإعداد

### 1. الذهاب إلى إعدادات GitHub

```
https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
```

### 2. إضافة Firebase Service Account

1. اذهب إلى Firebase Console
2. Project Settings → Service Accounts
3. انقر على "Generate new private key"
4. احفظ المحتوى كاملاً كـ `FIREBASE_SERVICE_ACCOUNT_JSON`

```json
{
  "type": "service_account",
  "project_id": "depth-studio",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-...@depth-studio.iam.gserviceaccount.com",
  ...
}
```

### 3. إعداد Firebase CLI Token

```bash
# تشغيل في Terminal
firebase login:ci

# احفظ الناتج كـ FIREBASE_TOKEN
```

### 4. إضافة مفاتيح Frontend

من Firebase Console → Project Settings:

```bash
# General Tab
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDHg1-mxejIMPycZJQeE0sZJmWxsimaMFI
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Cloud Messaging Tab  
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
```

### 5. إنشاء مفاتيح أمنية

```bash
# إنشاء JWT Secret (256-bit)
openssl rand -hex 32

# إنشاء Encryption Key (256-bit)
openssl rand -hex 32
```

## ✅ التحقق من الإعداد

بعد إضافة جميع المتغيرات، تحقق من:

### في GitHub Repository:
- [ ] Settings → Secrets and variables → Actions
- [ ] تأكد من وجود جميع المتغيرات المذكورة أعلاه

### اختبار النشر:
```bash
# إنشاء commit جديد لتشغيل GitHub Actions
git add .
git commit -m "test: GitHub Actions deployment"
git push origin main
```

## 🔧 إعداد محلي للتطوير

### إنشاء ملف .env.local

```bash
# في frontend/
cp .env.example .env.local

# في backend/
cp .env.example .env
```

### إضافة القيم المحلية:

```bash
# backend/.env
NODE_ENV=development
JWT_SECRET=development-jwt-secret-key
ENCRYPTION_KEY=development-encryption-key
GOOGLE_APPLICATION_CREDENTIALS=./keys/serviceAccountKey.json
```

```bash
# frontend/.env.local  
NEXT_PUBLIC_FIREBASE_PROJECT_ID=depth-studio
NEXT_PUBLIC_FIREBASE_API_KEY=your-development-api-key
NEXT_PUBLIC_FIRESTORE_DATABASE_ID=depth-production
```

## 🚨 تحذيرات أمنية

### ❌ لا تضع هذه القيم في:
- `.env` files في Git
- كود JavaScript/TypeScript  
- ملفات التكوين العامة
- تعليقات أو توثيق

### ✅ ضع هذه القيم في:
- GitHub Secrets
- متغيرات البيئة المحلية
- خدمات إدارة المفاتيح (AWS Secrets Manager, etc.)

## 🔄 تحديث المفاتيح

### عند تحديث Firebase Service Account:
1. إنشاء مفتاح جديد من Firebase Console
2. تحديث `FIREBASE_SERVICE_ACCOUNT_JSON` في GitHub
3. حذف المفتاح القديم من Firebase Console

### عند تحديث JWT/Encryption Keys:
1. إنشاء مفاتيح جديدة
2. تحديث GitHub Secrets
3. إعادة نشر التطبيق

## 📞 المساعدة

إذا واجهت مشاكل:

1. **تحقق من Logs**: GitHub Actions → Your workflow run
2. **فحص المتغيرات**: استخدم `npm run validate-env`
3. **Firebase Console**: تحقق من Project Settings

---

**🎯 الهدف**: المشروع جاهز للنشر الآمن بدون كشف أي مفاتيح حساسة! 