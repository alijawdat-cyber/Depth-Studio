# 🎨 Depth Studio

**مشروع تطبيق متعدد المنصات مع Vue.js Frontend و Firebase Backend**

[![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![Vuetify](https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=AEDDFF)](https://vuetifyjs.com/)

## 🎯 **نظرة عامة**

Depth Studio هو مشروع متكامل يجمع بين واجهة أمامية حديثة مبنية بـ Vue.js وخلفية قوية مدعومة بـ Firebase. المشروع يركز على تقديم تجربة مستخدم متميزة مع نظام إدارة شامل للبراندات والمشاريع.

## 🏗️ **البنية المعمارية**

### 🖥️ **الواجهة الأمامية (Frontend)**
```
depth-studio-frontend/
├── src/
│   ├── components/          # مكونات Vue قابلة للإعادة
│   ├── views/               # صفحات التطبيق
│   ├── layouts/             # تخطيطات الصفحات
│   ├── stores/              # إدارة الحالة باستخدام Pinia
│   ├── services/            # خدمات API والتكامل
│   ├── styles/              # نظام التصميم والألوان
│   ├── composables/         # Composition API utilities
│   ├── plugins/             # إعدادات المكونات الإضافية
│   ├── router/              # تكوين Vue Router
│   ├── types/               # تعريفات TypeScript
│   └── firebase/            # تكوين Firebase
└── public/                  # الملفات الثابتة
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
- **Vue.js 3.5+** - إطار العمل الأساسي
- **TypeScript** - لغة البرمجة المحسنة
- **Vuetify 3.8+** - مكتبة Material Design
- **Pinia** - إدارة الحالة الحديثة
- **Vue Router 4** - التوجيه والتنقل
- **Vite** - أداة البناء السريعة
- **SCSS/Sass** - معالج CSS المتقدم

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
- **Git** - إدارة الإصدارات

## 🎨 **نظام التصميم**

المشروع يحتوي على نظام تصميم متطور يشمل:

### **نظام الألوان**
- 🌞 **الوضع الفاتح والمظلم** مع تبديل ديناميكي
- 🎨 **ألوان البراندات** المختلفة (NAVA, Sport&More, INOFF, BLO, Clinica)
- 📊 **تدرجات لونية** شاملة (50-950 لكل لون)
- ♿ **تباين محسن** يتوافق مع معايير WCAG AA/AAA

### **النمط (Typography)**
- 📱 **تصميم متجاوب** لجميع الأحجام
- 🔤 **خطوط متنوعة** مع أوزان مختلفة
- 🌐 **دعم RTL** كامل للغة العربية

### **المكونات**
- 🧩 **مكونات قابلة للإعادة** ومعيارية
- 🎭 **حركات وانتقالات** سلسة
- 📐 **تخطيطات مرنة** ومتجاوبة

## 📋 **الميزات المنجزة**

### ✅ **نظام إدارة الألوان**
- [x] متغيرات CSS شاملة
- [x] دعم الوضع المظلم/الفاتح
- [x] ألوان البراندات المختلفة
- [x] تحسينات التباين

### ✅ **البنية التحتية**
- [x] إعداد Firebase كامل
- [x] قواعد أمان Firestore
- [x] سكريبتات زراعة البيانات
- [x] تكوين الاستضافة

### ✅ **بيئة التطوير**
- [x] تكوين TypeScript
- [x] إعداد ESLint و Prettier
- [x] تكوين Vite للبناء السريع
- [x] دعم RTL والترجمة

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
cd depth-studio-frontend
npm install

# تشغيل الخادم التطويري
npm run dev

# في نافذة طرفية أخرى - تثبيت تبعيات Backend
cd ..
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
├── 📁 depth-studio-frontend/    # الواجهة الأمامية Vue.js
│   ├── src/                    # الكود المصدري
│   ├── public/                 # الملفات العامة
│   ├── dist/                   # ملفات البناء
│   └── package.json           # تبعيات الواجهة
├── 📁 dist/                    # ملفات النشر
├── 📁 .firebase/               # كاش Firebase
├── 🔥 firebase.json            # تكوين Firebase
├── 🔒 firestore.rules         # قواعد الأمان
├── 📊 firestore.indexes.json  # فهارس البيانات
├── 🌱 seed-database.js        # زراعة البيانات
├── 📦 package.json            # تبعيات Backend
├── 📖 README.md               # هذا الملف
└── 🔧 .gitignore              # ملفات مستبعدة
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
- 🎨 **المكونات:** 50+ مكون Vue
- 🎭 **الثيمات:** 6 ثيمات مختلفة
- 🌍 **اللغات:** العربية والإنجليزية

---

**🎯 المشروع في التطوير النشط - المزيد من الميزات قادمة قريباً!**

Made with ❤️ in Iraq 🇮🇶 