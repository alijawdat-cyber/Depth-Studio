# 🎨 Depth Studio

**مشروع تطبيق متعدد المنصات مع Next.js Frontend و Firebase Backend**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 🎯 **نظرة عامة**

Depth Studio هو مشروع متكامل يجمع بين واجهة أمامية حديثة مبنية بـ Next.js وخلفية قوية مدعومة بـ Firebase. المشروع يركز على تقديم تجربة مستخدم متميزة مع نظام إدارة شامل للبراندات والمشاريع.

## 🏗️ **البنية المعمارية**

### 🖥️ **الواجهة الأمامية (Frontend)**
```
frontend/
├── src/
│   ├── components/          # مكونات React قابلة للإعادة
│   ├── app/                 # Next.js App Router (صفحات التطبيق)
│   │   ├── (auth)/         # مجموعة صفحات المصادقة
│   │   ├── (dashboard)/    # مجموعة صفحات الداشبورد
│   │   └── globals.css     # ستايلات عامة
│   ├── lib/                # مكتبات وإعدادات Firebase
│   ├── store/              # إدارة الحالة باستخدام Zustand
│   ├── services/           # خدمات API والتكامل
│   ├── hooks/              # Custom React Hooks
│   ├── providers/          # React Context Providers
│   ├── types/              # تعريفات TypeScript
│   └── middleware.ts       # Next.js Middleware
└── public/                 # الملفات الثابتة
```

### 🔥 **Backend & Infrastructure**
```
├── firebase.json            # تكوين Firebase
├── firestore.rules         # قواعد أمان Firestore
├── firestore.indexes.json  # فهارس قاعدة البيانات
├── seed-database.js        # سكريبت زراعة البيانات
└── dist/                   # ملفات النشر
```

## 🚀 **التقنيات المستخدمة**

### **Frontend Stack**
- **Next.js 14** - إطار العمل الأساسي
- **React 18** - مكتبة UI المتقدمة
- **TypeScript** - لغة البرمجة المحسنة
- **Tailwind CSS** - إطار عمل CSS المتقدم
- **Zustand** - إدارة الحالة الحديثة
- **React Query** - إدارة البيانات والـ API
- **Shadcn/ui** - مكونات UI حديثة

### **Backend & Database**
- **Firebase Authentication** - نظام المصادقة
- **Cloud Firestore** - قاعدة البيانات NoSQL
- **Firebase Hosting** - استضافة التطبيق
- **Firebase Storage** - تخزين الملفات
- **Cloud Functions** - الوظائف الخلفية

### **Development Tools**
- **ESLint** - فحص جودة الكود
- **Prettier** - تنسيق الكود
- **TypeScript** - فحص الأنواع
- **Vitest** - اختبارات سريعة
- **Git** - إدارة الإصدارات

## 🎨 **نظام التصميم**

المشروع يحتوي على نظام تصميم متطور يشمل:

### **نظام الألوان**
- 🌞 **الوضع الفاتح والمظلم** مع تبديل ديناميكي
- 🎨 **نظام ألوان Tailwind** مع تخصيصات البراند
- 📊 **متغيرات CSS** ديناميكية للثيمات
- ♿ **تباين محسن** يتوافق مع معايير WCAG AA/AAA

### **النمط (Typography)**
- 📱 **تصميم متجاوب** لجميع الأحجام
- 🔤 **خطوط متنوعة** مع أوزان مختلفة
- 🌐 **دعم RTL** كامل للغة العربية

### **المكونات**
- 🧩 **مكونات React** قابلة للإعادة ومعيارية
- 🎭 **Framer Motion** للحركات السلسة
- 📐 **Flexbox & Grid** تخطيطات متجاوبة

## 📋 **الميزات المنجزة**

### ✅ **نظام إدارة الألوان**
- [x] متغيرات CSS شاملة
- [x] دعم الوضع المظلم/الفاتح
- [x] ألوان البراندات المختلفة
- [x] تحسينات التباين

### ✅ **البنية التحتية**
- [x] إعداد Firebase كامل
- [x] قواعد أمان Firestore
- [x] Next.js App Router
- [x] تكوين الاستضافة

### ✅ **بيئة التطوير**
- [x] تكوين TypeScript
- [x] إعداد ESLint و Prettier
- [x] تكوين Next.js للبناء السريع
- [x] Tailwind CSS و Shadcn/ui

## 🛠️ **التشغيل والتطوير**

### **متطلبات النظام**
```bash
Node.js >= 18.0.0
npm >= 8.0.0
Git
```

### **التثبيت والتشغيل**
```bash
# استنساخ المشروع
git clone https://github.com/alijawdat4/Depth-Studio.git
cd Depth-Studio

# تثبيت تبعيات الواجهة الأمامية
cd frontend
npm install

# تشغيل الخادم التطويري
npm run dev

# في نافذة طرفية أخرى - تثبيت تبعيات Backend
cd ../backend
npm install

# تشغيل Firebase المحلي (اختياري)
firebase serve
```

### **سكريبتات مفيدة**
```bash
# بناء المشروع للإنتاج
npm run build

# فحص الكود
npm run lint

# تنسيق الكود
npm run format

# فحص الأنواع
npm run type-check

# زراعة البيانات التجريبية
npm run seed
```

## 🎯 **المراحل القادمة**

### 📱 **تطبيق Flutter Mobile**
- [ ] تطبيق iOS أصلي
- [ ] تطبيق Android
- [ ] مزامنة مع الواجهة الويب

### 🤖 **تكامل الذكاء الاصطناعي**
- [ ] Cloud Functions للـ AI
- [ ] معالجة الصور الذكية
- [ ] تحليلات متقدمة

### 🚀 **تحسينات الأداء**
- [ ] تحسين SEO
- [ ] Progressive Web App
- [ ] تحسين سرعة التحميل

## 📁 **هيكل المشروع الكامل**

```
Depth-Studio/
├── 📁 frontend/               # الواجهة الأمامية Next.js
│   ├── src/                  # الكود المصدري
│   ├── public/               # الملفات العامة
│   ├── .next/                # ملفات البناء
│   └── package.json          # تبعيات الواجهة
├── 📁 backend/               # Firebase Functions
│   ├── src/                  # دوال Firebase
│   ├── lib/                  # ملفات البناء
│   └── package.json          # تبعيات Backend
├── 📁 shared/                # الأنواع المشتركة
├── 📁 docs/                  # الوثائق الشاملة
├── 📁 .firebase/             # كاش Firebase
├── 🔥 firebase.json          # تكوين Firebase
├── 🔒 firestore.rules       # قواعد الأمان
├── 📊 firestore.indexes.json # فهارس البيانات
├── 📦 package.json          # تبعيات الجذر
├── 📖 README.md             # هذا الملف
└── 🔧 .gitignore            # ملفات مستبعدة
```

## 🤝 **المساهمة**

نرحب بجميع المساهمات! يرجى اتباع الخطوات التالية:

1. **Fork** المشروع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/amazing-feature`)
3. **Commit** التغييرات (`git commit -m 'Add amazing feature'`)
4. **Push** للفرع (`git push origin feature/amazing-feature`)
5. فتح **Pull Request**

### **إرشادات المساهمة**
- اتبع نمط الكود الموجود
- أضف تعليقات واضحة
- اختبر التغييرات قبل الإرسال
- اتبع نظام الألوان المحدد

## 📄 **الترخيص**

هذا المشروع مرخص تحت **رخصة خاصة** - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 👤 **المطور**

**علي جودت** - مطور Full Stack
- 🌐 **GitHub:** [@alijawdat4](https://github.com/alijawdat4)
- 📧 **Email:** alijawdat4@gmail.com
- 💼 **LinkedIn:** [علي جودت](https://linkedin.com/in/alijawdat)

## 🔗 **روابط مفيدة**

- 📚 [توثيق Firebase](./firebase_project_documentation.md)
- 🌳 [هيكل الواجهة](./depth_studio_ui_tree_structure.md)
- 📋 [متطلبات UI](./depth_studio_ui_requirements.md)
- 🗃️ [مواصفات قاعدة البيانات](./depth_studio_database_api_specification.md)
- 🔧 [توثيق Git](./git_repository_documentation.md)

## 📊 **إحصائيات المشروع**

- 📁 **عدد الملفات:** 200+ ملف
- 🏗️ **البنية:** Monorepo متعدد التقنيات
- 🎨 **المكونات:** 50+ مكون React
- 🎭 **UI Library:** Shadcn/ui + Tailwind
- 🌍 **اللغات:** العربية والإنجليزية

---

**🎯 المشروع في التطوير النشط - المزيد من الميزات قادمة قريباً!**

Made with ❤️ in Iraq 🇮🇶 