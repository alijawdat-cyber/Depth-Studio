# 🎯 Depth Studio - نظام إدارة المحتوى بالذكاء الاصطناعي

![Depth Studio Banner](https://via.placeholder.com/800x200/1a1a1a/ffffff?text=Depth+Studio)

## 📋 نظرة عامة

**Depth Studio** هو نظام إدارة محتوى متطور مدعوم بالذكاء الاصطناعي، مصمم خصيصاً لإدارة المحتوى الرقمي والحملات التسويقية بكفاءة عالية.

### 🏗️ المعمارية

```
Depth-Studio-Unified/
├── 🎨 frontend/          # Vue.js PWA Frontend
├── ⚡ backend/           # Node.js + Firebase Functions
├── 🗄️ database/         # Firestore Configuration
├── 📚 docs/             # Documentation
├── 🔧 shared/           # Shared Types & Utils
└── 📦 package.json      # Root Configuration
```

## 🚀 البدء السريع

### 📋 المتطلبات الأساسية

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Firebase CLI** (تثبيت عالمي)
- **Git**

### ⚡ التثبيت السريع

```bash
# 1. استنسخ المشروع
git clone <repository-url>
cd Depth-Studio-Unified

# 2. تثبيت جميع الـ Dependencies
npm run install:all

# 3. تشغيل البيئة التطويرية
npm run dev
```

## 🛠️ أوامر التطوير

### 🔥 التطوير اليومي
```bash
npm run dev                    # تشغيل Frontend + Backend
npm run dev:frontend          # تشغيل Frontend فقط
npm run dev:backend           # تشغيل Backend فقط
```

### 🏗️ البناء والنشر
```bash
npm run build                 # بناء كامل للمشروع
npm run build:frontend        # بناء Frontend
npm run build:backend         # بناء Backend
```

### 🔥 Firebase
```bash
npm run firebase:serve        # تشغيل Firebase محلياً
npm run firebase:deploy       # نشر إلى Firebase
```

### 🗄️ قاعدة البيانات
```bash
npm run db:seed              # زراعة البيانات التجريبية
npm run db:migrate           # تشغيل الـ Migrations
```

### 🧪 الاختبار والفحص
```bash
npm run test                 # تشغيل جميع الاختبارات
npm run lint                 # فحص جودة الكود
```

## 🏢 المميزات الرئيسية

### 🎯 **نظام المصادقة المتطور**
- ✅ تسجيل دخول بـ Google
- ✅ تسجيل دخول برقم الهاتف
- ✅ تسجيل دخول بالإيميل
- ✅ نظام أدوار متقدم
- ✅ موافقة الإدمن على الحسابات

### 🤖 **الذكاء الاصطناعي**
- ✅ توليد المحتوى التلقائي
- ✅ تحليل الأداء الذكي
- ✅ التوصيات المخصصة

### 📊 **إدارة الحملات**
- ✅ نظام إدارة الحملات المتقدم
- ✅ تتبع الأداء اللحظي
- ✅ إدارة التضارب الذكية

### 🎨 **واجهة مستخدم حديثة**
- ✅ تصميم Tailwind CSS + Shadcn/ui
- ✅ Next.js App Router
- ✅ متجاوب مع جميع الشاشات

## 🗃️ **قاعدة البيانات**

- **النوع:** Firebase Firestore
- **القاعدة:** `depth-production` (الوحيدة المستخدمة)
- **المنطقة:** North America (nam5)
- **الحالة:** نشطة ومحدثة ✅

### 📊 **المجموعات:**
- `roles` - الأدوار الأربعة (super_admin, marketing_coordinator, brand_coordinator, photographer)
- `users` - المستخدمين والملفات الشخصية
- `user_permissions` - صلاحيات مفصلة لكل مستخدم
- `templates` - قوالب المحتوى
- `content` - المحتوى المنشأ
- `campaigns` - الحملات التسويقية
- `settings` - إعدادات النظام
- `notifications` - الإشعارات

## 👥 الأدوار والصلاحيات

| الدور | الصلاحيات |
|-------|----------|
| **Super Admin** | صلاحيات كاملة للنظام |
| **Admin** | إدارة المستخدمين والمحتوى |
| **Content Manager** | إدارة المحتوى والقوالب |
| **Campaign Manager** | إدارة الحملات |
| **Analyst** | عرض التقارير والتحليلات |
| **Viewer** | عرض فقط |

## 🔧 البيئة التطويرية

### 🛠️ التقنيات المستخدمة

#### Frontend
- **Next.js 14** + App Router
- **React 18** + Hooks
- **TypeScript** للأمان والجودة
- **Tailwind CSS** للتصميم
- **Shadcn/ui** للمكونات
- **Firebase SDK** للمصادقة

#### Backend
- **Firebase Functions** (Node.js)
- **Firestore** قاعدة البيانات NoSQL
- **Firebase Auth** للمصادقة
- **Express.js** للـ APIs

#### DevOps
- **Firebase Hosting** للاستضافة
- **GitHub Actions** للـ CI/CD
- **ESLint + Prettier** لجودة الكود

## 📱 API Reference

### 🔑 Authentication
```typescript
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/profile
```

### 👥 Users Management
```typescript
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
PATCH  /api/users/:id/role
```

### 📝 Content Management
```typescript
GET    /api/content
POST   /api/content
PUT    /api/content/:id
DELETE /api/content/:id
GET    /api/content/templates
```

## 🔒 الأمان

- ✅ **Firebase Security Rules** محكمة
- ✅ **JWT Tokens** للمصادقة
- ✅ **Role-Based Access Control**
- ✅ **Input Validation** شاملة
- ✅ **Rate Limiting** لمنع الهجمات

## 📈 الإحصائيات

- 📊 **95%** مكتمل من ناحية التصميم
- 🎯 **85%** مكتمل من ناحية التطبيق
- 🚀 **12** API endpoint رئيسي
- 🎨 **8** صفحة واجهة مستخدم
- 🔧 **4** نظام فرعي متكامل

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء فرع للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 👨‍💻 المطور

**علي جودت** - [alijawdat4@gmail.com](mailto:alijawdat4@gmail.com)

---

<div align="center">
  <strong>صُنع بـ ❤️ في العراق 🇮🇶</strong>
</div> 