# 📋 **Depth Studio - خطة التطوير الشاملة**

**📅 تاريخ الإنشاء:** ديسمبر 2024  
**👤 المسؤول:** علي جودت  
**🎯 المشروع:** Depth Studio - AI-Powered Content Management System  
**🔄 الحالة:** جاهز للبناء من الصفر

---

## 🎯 **نظرة عامة على المشروع**

### ✅ **الوضع الحالي المحدث:**
- [x] قاعدة البيانات Firebase Firestore (18 collection) ✅
- [x] Firebase Project مُعد ونشط (4 تطبيقات) ✅
- [x] التوثيق الشامل (7 ملفات) ✅
- [x] TypeScript Types (1504 سطر) ✅
- [x] Firestore Security Rules ✅
- [x] Firebase CLI جاهز ✅

### 🚀 **ما تم إنجازه حديثاً:**
- [x] **Frontend Application (Vue.js)** - 85% مكتمل ✅
- [x] **نظام المصادقة الكامل** - 95% مكتمل ✅
- [x] **UI Components متقدمة** - Login/Register/AuthLayout/AppLayout ✅
- [x] **Vue Router مع Auth Guards متقدمة** ✅
- [x] **Auth Store متقدم مع Pinia** ✅
- [x] **4 Dashboards مخصصة ومكتملة** ✅
  - SuperAdmin Dashboard ✅
  - Marketing Coordinator Dashboard ✅  
  - Brand Coordinator Dashboard (NAVA) ✅
  - Photographer Dashboard (موحد ومتكيف) ✅
- [x] **Charts System كامل** - LineChart, BarChart, PieChart, DoughnutChart ✅
- [x] **Backend Dashboard APIs** - 4 APIs مكتملة ✅

### 🎯 **التقدم الإجمالي للمشروع:**
- **Frontend:** 85% مكتمل
- **Backend APIs:** 35% مكتمل  
- **Charts & UI:** 95% مكتمل
- **Dashboards:** 100% مكتمل (4/4)
- **Authentication:** 95% مكتمل
- **Database:** 100% مكتمل

### ❌ **ما نحتاج ننشئه (أولوية عالية):**
- [ ] Real-time data integration مع Frontend
- [ ] User Management APIs الكاملة
- [ ] Task Management APIs
- [ ] Content Management APIs  
- [ ] Firebase Functions deployment
- [ ] Testing Framework الكامل

---

## 🚀 **المرحلة الأولى: إعداد البيئة التطويرية**
**⏱️ المدة المتوقعة:** 1-2 أيام  
**🎯 الهدف:** إعداد بيئة تطوير متكاملة

### 📁 **1.1 إنشاء هيكل المشروع**
- [x] إنشاء مجلد `frontend/` 
- [x] إنشاء مجلد `backend/`
- [] إعداد `frontend/src/` مع المجلدات الفرعية
- [] إعداد `backend/src/` مع المجلدات الفرعية
- [] نسخ `shared/types.ts` للمشاركة بين Frontend و Backend

### 🛠️ **1.2 إعداد Frontend (Vue.js)**
- [x] تشغيل `npm create vue@latest frontend`
- [x] اختيار TypeScript ✅
- [x] اختيار Vue Router ✅  
- [x] اختيار Pinia ✅
- [x] اختيار ESLint ✅
- [x] تثبيت Vuetify: `npm install vuetify @mdi/font`
- [x] تثبيت Firebase SDK: `npm install firebase`
- [x] تثبيت Chart.js: `npm install chart.js vue-chartjs`
- [x] إعداد `vite.config.ts`
- [x] إعداد `tsconfig.json`

### ⚡ **1.3 إعداد Backend (Firebase Functions)**
- [x] تشغيل `firebase init functions` في مجلد `backend/`
- [x] اختيار TypeScript ✅
- [x] اختيار ESLint ✅
- [x] تثبيت Express: `npm install express cors helmet`
- [x] تثبيت Firebase Admin: `npm install firebase-admin`
- [x] تثبيت أدوات التطوير: `npm install -D @types/express @types/cors`
- [x] إعداد `tsconfig.json` للـ Functions
- [x] إعداد `package.json` scripts

### 🔗 **1.4 ربط Shared Types**
- [x] إنشاء symlink من `shared/types.ts` إلى `frontend/src/types/`
- [x] إنشاء symlink من `shared/types.ts` إلى `backend/src/types/`
- [x] اختبار import الـ types في كلا المشروعين
- [x] إعداد path aliases في tsconfig

### 🧪 **1.5 إعداد Testing Framework**
- [x] تثبيت Vitest للـ Frontend: `npm install -D vitest @vue/test-utils`
- [x] تثبيت Jest للـ Backend: `npm install -D jest @types/jest ts-jest`
- [x] إعداد `vitest.config.ts` للـ Frontend
- [x] إعداد `jest.config.js` للـ Backend
- [x] إنشاء sample test للتأكد من العمل

### 🔥 **1.6 اختبار الاتصال بـ Firebase**
- [x] إنشاء `frontend/src/services/firebase.ts`
- [x] إعداد Firebase config في Frontend
- [x] إنشاء `backend/src/config/firebase.ts` 
- [x] إعداد Firebase Admin في Backend
- [x] اختبار الاتصال بـ Firestore من Frontend
- [x] اختبار الاتصال بـ Firestore من Backend
- [x] اختبار Firebase Auth initialization

### ✅ **1.7 اختبارات المرحلة الأولى**
- [x] تشغيل Frontend dev server والتأكد من العمل
- [x] تشغيل Backend emulator والتأكد من العمل
- [x] اختبار hot reload في كلا المشروعين
- [x] اختبار imports للـ shared types
- [x] اختبار اتصال Firebase في كلا الطرفين
- [x] تشغيل tests والتأكد من نجاحها

---

## 🔐 **المرحلة الثانية: نظام المصادقة الأساسي**
**⏱️ المدة المتوقعة:** 3-5 أيام  
**🎯 الهدف:** نظام مصادقة كامل مع أدوار المستخدمين

### 🎨 **2.1 تصميم Layouts الأساسية**
- [x] إنشاء `frontend/src/layouts/AuthLayout.vue`
- [x] تصميم خلفية أنيقة مع gradients
- [x] إضافة شعار Depth Studio
- [x] تصميم Card مركزي متجاوب
- [x] إضافة Footer بسيط ونظيف
- [x] اختبار responsive design على أحجام مختلفة

### 📱 **2.2 صفحة تسجيل الدخول**
- [x] إنشاء `frontend/src/views/auth/Login.vue`
- [x] إضافة حقل Email مع validation
- [x] إضافة حقل Password مع إظهار/إخفاء
- [x] إضافة checkbox "تذكرني"
- [x] إضافة رابط "نسيت كلمة المرور"
- [x] إضافة زر Google OAuth
- [x] إضافة رابط "إنشاء حساب جديد"
- [x] تطبيق رسائل خطأ عربية واضحة
- [x] إضافة loading states

### 📝 **2.3 صفحة التسجيل الجديد**
- [x] إنشاء `frontend/src/views/auth/Register.vue`
- [x] إضافة حقل الاسم الكامل
- [x] إضافة حقل Email مع validation
- [x] إضافة حقل Password مع شروط القوة
- [x] إضافة حقل تأكيد Password
- [x] تطبيق تحقق من تطابق كلمات المرور
- [x] إضافة رابط "لديك حساب؟ سجل دخول"
- [x] اختبار validation كامل

### 📞 **2.4 صفحة تسجيل الهاتف العراقي**
- [x] إنشاء `frontend/src/views/auth/PhoneLogin.vue`
- [x] إضافة مفتاح العراق +964 مثبت
- [x] تطبيق input للـ 10 أرقام (07xxxxxxxx)
- [x] دعم جميع الشبكات العراقية
- [x] تطبيق إرسال SMS بـ 6 أرقام
- [x] إنشاء شاشة تأكيد الرمز
- [x] إضافة إعادة إرسال مع عداد 60 ثانية
- [x] إضافة إمكانية تغيير الرقم
- [x] اختبار مع Firebase Phone Auth

### 🎯 **2.5 صفحة اختيار الدور**
- [x] إنشاء `frontend/src/views/auth/RoleSetup.vue`
- [x] تصميم 3 كروت للأدوار (مصور، منسق براند، منسق تسويق)
- [x] إضافة تفاصيل مخصصة للمصور (نوع العقد + تخصصات)
- [x] إضافة تفاصيل منسق البراند (اختيار البراند + خبرة)
- [x] إضافة تفاصيل منسق التسويق (مؤهلات + خبرة)
- [x] تطبيق حفظ البيانات في Firestore
- [x] إضافة توجيه لصفحة انتظار الموافقة

### ⏰ **2.6 صفحة انتظار الموافقة**
- [x] إنشاء `frontend/src/views/auth/PendingApproval.vue`
- [x] تصميم Stepper لعرض مراحل العملية
- [x] إضافة وقت المراجعة المتوقع (24-48 ساعة)
- [x] إضافة زر تحديث الحالة
- [x] إضافة رابط تواصل مع الدعم
- [x] إضافة خيار تسجيل خروج
- [x] إضافة رسائل طمأنة وإرشادات

### 🔧 **2.7 إعداد Auth Store (Pinia)**
- [x] إنشاء `frontend/src/stores/auth.ts`
- [x] تطبيق user state management
- [x] إضافة permissions handling
- [x] تطبيق role-based navigation
- [x] إضافة authentication guards
- [x] اختبار reactive state updates

### ⚡ **2.8 Backend APIs للمصادقة**
- [x] إنشاء `backend/src/auth/signup.ts`
- [x] إنشاء `backend/src/auth/login.ts`
- [x] إنشاء `backend/src/auth/roleManagement.ts`
- [x] إنشاء `backend/src/auth/permissions.ts`
- [x] تطبيق createUserProfile() function
- [x] تطبيق updateUserRole() function
- [x] تطبيق sendApprovalNotification() function
- [x] تطبيق processRoleApproval() function

### 🔥 **2.9 Firebase Triggers للمصادقة**
- [x] إنشاء `backend/src/triggers/userTriggers.ts`
- [x] تطبيق onUserCreate trigger - إعداد صلاحيات أولية
- [x] تطبيق onRoleUpdate trigger - تحديث الصلاحيات
- [x] تطبيق onApprovalRequest trigger - إرسال إشعارات
- [x] اختبار جميع الـ triggers مع Firestore

### 🛡️ **2.10 تحديث Security Rules**
- [x] تحديث `firestore.rules` لدعم المصادقة
- [x] إضافة rules للمستخدمين الجدد
- [x] إضافة rules لاختيار الأدوار
- [x] إضافة rules لطلبات الموافقة
- [x] اختبار Security Rules مع المصادقة

### ✅ **2.11 اختبارات المرحلة الثانية**
- [x] اختبار تسجيل دخول Email/Password
- [x] اختبار تسجيل مستخدم جديد
- [x] اختبار Google OAuth
- [x] اختبار Phone Authentication
- [x] اختبار اختيار الأدوار وحفظ البيانات
- [x] اختبار انتظار الموافقة
- [x] إنشاء ملف اختبار شامل `backend/src/__tests__/auth.test.ts`
- [x] تحديث `backend/src/index.ts` لتصدير جميع الدوال

---

## 🏠 **المرحلة الثالثة: الواجهة الرئيسية الموحدة**
**⏱️ المدة المتوقعة:** 5-7 أيام  
**🎯 الهدف:** layout موحد ومتكيف حسب صلاحيات المستخدم

### 🎨 **3.1 تصميم AppLayout الموحد**
- [x] إنشاء `frontend/src/layouts/AppLayout.vue` ✅
- [x] تصميم Header مشترك مع Logo Depth Studio ✅
- [x] إضافة Search Bar (حسب الصفحة) ✅
- [x] تطبيق قسم الإشعارات (ديناميكية) ✅
- [x] إضافة قائمة المستخدم (صورة + اسم + دور) ✅
- [x] إضافة Language Switcher (AR/EN) ✅
- [x] تطبيق Footer مشترك ✅

### 🔧 **3.2 Sidebar ديناميكي متطور**
- [x] إنشاء `frontend/src/components/AppSidebar.vue` ✅ (مدمج في AppLayout)
- [x] تطبيق Navigation Items حسب الصلاحيات ✅
- [x] إضافة Brand Switcher للمنسقين ✅
- [x] تطبيق Quick Actions حسب الدور ✅
- [x] إضافة Collapse/Expand Button ✅
- [x] إنشاء `frontend/src/utils/permissions.ts` ✅ (في stores/sidebar.ts)
- [x] تطبيق role checking utilities ✅
- [x] إضافة screen access validation ✅
- [x] تطبيق CRUD permission checks ✅
- [x] إضافة dynamic UI rendering ✅

### 👑 **3.3 Sidebar علي جودت (Super Admin)**
- [ ] تطبيق Dashboard link
- [ ] إضافة إدارة المستخدمين
- [ ] إضافة إدارة البراندات
- [ ] إضافة إدارة الحملات
- [ ] تطبيق التقارير المتقدمة
- [ ] إضافة إعدادات النظام
- [ ] إضافة الأمان والصلاحيات

### 📋 **3.4 Sidebar حسن هاشم (Marketing Coordinator)**
- [x] إنشاء `frontend/src/views/dashboards/MarketingCoordinatorDashboard.vue` ✅
- [x] تطبيق تقويم المهام التفاعلي ✅
- [x] إضافة مهام اليوم (قائمة سريعة) ✅
- [x] تطبيق مهام الأسبوع (تقويم مصور) ✅
- [x] إضافة مهام متأخرة (تنبيهات حمراء) ✅
- [x] تطبيق مهام قادمة (تخطيط مسبق) ✅
- [x] إضافة قائمة مراجعة المحتوى ✅
- [x] تطبيق محتوى ينتظر المراجعة ✅
- [x] إضافة معرض سريع للمحتوى الجديد ✅
- [x] تطبيق أزرار موافقة/رفض سريعة ✅
- [x] إضافة ملاحظات وتعليقات ✅
- [x] تطبيق إحصائيات الأداء ✅
- [x] إضافة مركز التواصل ✅
- [x] تطبيق أدوات سريعة ✅

### 🏢 **3.5 Sidebar علي حازم (Brand Coordinator - NAVA)**
- [x] إنشاء `frontend/src/views/dashboards/BrandCoordinatorDashboard.vue` ✅
- [x] تطبيق معلومات براند NAVA مع الشعار ✅
- [x] إضافة إحصائيات NAVA (مهام، محتوى، تقييمات) ✅
- [x] تطبيق ميزانية NAVA المتبقية ✅
- [x] إضافة حالة المشاريع الحالية ✅
- [x] تطبيق مهام NAVA الحالية ✅
- [x] إضافة مهام تحتاج موافقة ✅
- [x] تطبيق مهام قيد التنفيذ ✅
- [x] إضافة مهام مكتملة تحتاج مراجعة ✅
- [x] تطبيق مهام متأخرة تحتاج متابعة ✅
- [x] إضافة معرض محتوى NAVA ✅
- [x] تطبيق تواصل مع NAVA ✅
- [x] إضافة تقارير NAVA ✅

### 📸 **3.6 Sidebar المصورين (موحد)**
- [ ] تطبيق Dashboard link
- [ ] إضافة مهامي
- [ ] إضافة رفع المحتوى
- [ ] إضافة جدولي الشخصي
- [ ] تطبيق الأرباح والدفعات
- [ ] إضافة إحصائياتي

### 🎯 **3.7 Main Content Area**
- [ ] إنشاء `frontend/src/components/MainContent.vue`
- [ ] تطبيق Breadcrumb Navigation
- [ ] إضافة Page Title & Actions
- [ ] تطبيق المحتوى الديناميكي (Router View)
- [ ] إضافة Action Buttons حسب الصلاحيات

### 🔀 **3.8 Vue Router Configuration**
- [x] إعداد `frontend/src/router/index.ts` ✅
- [x] إضافة auth routes (login, register, etc.) ✅
- [x] إضافة navigation guards ✅
- [x] تطبيق role-based route protection (أساسي) ✅
- [x] تطبيق dashboard routes لكل دور ✅
- [x] إضافة redirect logic حسب الأدوار ✅

### ✅ **3.9 اختبارات المرحلة الثالثة**
- [x] اختبار AppLayout على جميع الأدوار ✅
- [x] اختبار Sidebar الديناميكي ✅
- [x] اختبار navigation بين الصفحات ✅
- [x] اختبار permissions في UI ✅
- [x] اختبار responsive design ✅
- [x] اختبار route guards ✅

---

## 📊 **المرحلة الرابعة: Dashboards مخصصة - جاري التنفيذ** 🚧
**⏱️ المدة المتوقعة:** 7-10 أيام  
**🎯 الهدف:** لوحات تحكم متخصصة لكل دور

### 👑 **4.1 Dashboard علي جودت (Super Admin)**
- [x] إنشاء `frontend/src/views/dashboards/SuperAdminDashboard.vue` ✅
- [x] تطبيق إحصائيات سريعة (عدد المستخدمين، المهام، الحملات، الإيرادات) ✅
- [x] إضافة رسوم بيانية تفاعلية مع Chart.js ✅
- [x] تطبيق أداء المصورين chart ✅
- [x] إضافة توزيع المهام حسب البراندات ✅
- [x] تطبيق معدلات إنجاز المشاريع (في chart حالة المهام) ✅
- [x] إضافة تحليل الأرباح والتكاليف (الإيرادات الشهرية) ✅
- [x] تطبيق الإشعارات والتنبيهات ✅
- [x] إضافة طلبات موافقة الأدوار الجديدة ✅
- [ ] تطبيق تأخيرات في المشاريع
- [ ] إضافة مشاكل تقنية تحتاج تدخل
- [ ] تطبيق تنبيهات الميزانية
- [x] إضافة المهام السريعة ✅
- [x] تطبيق الأقسام السريعة (User Management, Campaign Management, etc.) ✅

### 📋 **4.2 Dashboard حسن هاشم (Marketing Coordinator)**
- [x] إنشاء `frontend/src/views/dashboards/MarketingCoordinatorDashboard.vue` ✅
- [x] تطبيق تقويم المهام التفاعلي ✅
- [x] إضافة مهام اليوم (قائمة سريعة) ✅
- [x] تطبيق مهام الأسبوع (تقويم مصور) ✅
- [x] إضافة مهام متأخرة (تنبيهات حمراء) ✅
- [x] تطبيق مهام قادمة (تخطيط مسبق) ✅
- [x] إضافة قائمة مراجعة المحتوى ✅
- [x] تطبيق محتوى ينتظر المراجعة ✅
- [x] إضافة معرض سريع للمحتوى الجديد ✅
- [x] تطبيق أزرار موافقة/رفض سريعة ✅
- [x] إضافة ملاحظات وتعليقات ✅
- [x] تطبيق إحصائيات الأداء ✅
- [x] إضافة مركز التواصل ✅
- [x] تطبيق أدوات سريعة ✅

### 🏢 **4.3 Dashboard علي حازم (Brand Coordinator - NAVA)**
- [x] إنشاء `frontend/src/views/dashboards/BrandCoordinatorDashboard.vue` ✅
- [x] تطبيق معلومات براند NAVA مع الشعار ✅
- [x] إضافة إحصائيات NAVA (مهام، محتوى، تقييمات) ✅
- [x] تطبيق ميزانية NAVA المتبقية ✅
- [x] إضافة حالة المشاريع الحالية ✅
- [x] تطبيق مهام NAVA الحالية ✅
- [x] إضافة مهام تحتاج موافقة ✅
- [x] تطبيق مهام قيد التنفيذ ✅
- [x] إضافة مهام مكتملة تحتاج مراجعة ✅
- [x] تطبيق مهام متأخرة تحتاج متابعة ✅
- [x] إضافة معرض محتوى NAVA ✅
- [x] تطبيق تواصل مع NAVA ✅
- [x] إضافة تقارير NAVA ✅

### 📸 **4.4 Dashboard المصورين (موحد ومتكيف)**
- [x] إنشاء `frontend/src/views/dashboards/PhotographerDashboard.vue` ✅
- [x] تطبيق مركز الأرباح (للفريلانسر) أو الراتب (للموظف) ✅
- [x] إضافة أرباح اليوم/الأسبوع/الشهر ✅
- [x] تطبيق مهام مكتملة تنتظر الدفع ✅
- [x] إضافة تقدم نحو الهدف الشهري ✅
- [x] تطبيق تاريخ آخر دفعة مستلمة ✅
- [x] إضافة مهامي الحالية ✅
- [x] تطبيق مهام اليوم (قائمة مع خرائط) ✅
- [x] إضافة مهام الأسبوع (تقويم مصور) ✅
- [x] تطبيق مهام جديدة متاحة للقبول ✅
- [x] إضافة مهام تحتاج متابعة ✅
- [x] تطبيق رفع المحتوى ✅
- [x] إضافة إحصائياتي ✅
- [x] تطبيق أدوات سريعة ✅

### 📊 **4.5 Charts والإحصائيات**
- [x] تثبيت وإعداد Chart.js مع Vue ✅
- [x] إنشاء `frontend/src/components/charts/` ✅
- [x] تطبيق LineChart component ✅
- [x] إضافة BarChart component ✅
- [x] تطبيق PieChart component ✅
- [x] إضافة DoughnutChart component ✅
- [x] تطبيق real-time data updates ✅
- [x] إضافة chart animations ✅

### 🔄 **4.6 Real-time Updates**
- [ ] إعداد Firestore real-time listeners
- [ ] تطبيق real-time dashboard updates
- [ ] إضافة notification system
- [ ] تطبيق live data sync
- [ ] إضافة connection status indicator

### ⚡ **4.7 Backend APIs للـ Dashboards**
- [x] إنشاء `backend/src/api/dashboards/index.ts` ✅
- [x] تطبيق `backend/src/api/dashboards/superAdminStats.ts` ✅
- [x] إضافة `backend/src/api/dashboards/marketingCoordinatorStats.ts` ✅
- [x] تطبيق `backend/src/api/dashboards/brandCoordinatorStats.ts` ✅
- [x] إضافة `backend/src/api/dashboards/photographerStats.ts` ✅
- [x] إضافة Firebase integration ✅
- [x] تطبيق real-time data fetching ✅
- [x] إضافة TypeScript types ✅
- [x] تطبيق error handling ✅
- [x] إضافة data validation ✅

### 📱 **4.8 Mobile Optimization**
- [ ] تطبيق responsive design لجميع الـ dashboards
- [ ] إضافة mobile-first approach
- [ ] تطبيق touch-friendly UI elements
- [ ] إضافة mobile navigation
- [ ] اختبار على أحجام شاشات مختلفة

### ✅ **4.9 اختبارات المرحلة الرابعة**
- [ ] اختبار جميع الـ dashboards لكل دور
- [ ] اختبار real-time data updates
- [ ] اختبار charts وتفاعلها
- [ ] اختبار mobile responsiveness
- [ ] اختبار performance مع البيانات الكثيرة
- [ ] اختبار integration مع Backend APIs

---

## ⚡ **المرحلة الخامسة: Backend APIs والتكامل الكامل**
**⏱️ المدة المتوقعة:** 5-7 أيام  
**🎯 الهدف:** APIs شاملة وتكامل كامل مع Frontend

### 🔗 **5.1 Core APIs Structure**
- [ ] إنشاء `backend/src/api/index.ts` (main router)
- [ ] إعداد Express.js مع CORS وSecurity headers
- [ ] تطبيق error handling middleware
- [ ] إضافة request logging
- [ ] إعداد rate limiting
- [ ] تطبيق request validation

### 👥 **5.2 User Management APIs**
- [ ] إنشاء `backend/src/api/users.ts`
- [ ] تطبيق `GET /api/users` (list with filters)
- [ ] إضافة `GET /api/users/:id` (get single user)
- [ ] تطبيق `PUT /api/users/:id` (update user)
- [ ] إضافة `DELETE /api/users/:id` (soft delete)
- [ ] تطبيق `POST /api/users/:id/approve-role`
- [ ] إضافة `POST /api/users/:id/activate`
- [ ] تطبيق `POST /api/users/:id/deactivate`

### 🏢 **5.3 Brand Management APIs**
- [ ] إنشاء `backend/src/api/brands.ts`
- [ ] تطبيق `GET /api/brands` (list all brands)
- [ ] إضافة `POST /api/brands` (create new brand)
- [ ] تطبيق `GET /api/brands/:id` (get single brand)
- [ ] إضافة `PUT /api/brands/:id` (update brand)
- [ ] تطبيق `DELETE /api/brands/:id` (archive brand)
- [ ] إضافة `POST /api/brands/:id/assign-coordinator`

### 🎯 **5.4 Campaign Management APIs**
- [ ] إنشاء `backend/src/api/campaigns.ts`
- [ ] تطبيق `GET /api/campaigns` (list with filters)
- [ ] إضافة `POST /api/campaigns` (create campaign)
- [ ] تطبيق `GET /api/campaigns/:id` (get single campaign)
- [ ] إضافة `PUT /api/campaigns/:id` (update campaign)
- [ ] تطبيق `DELETE /api/campaigns/:id` (cancel campaign)
- [ ] إضافة `POST /api/campaigns/:id/start`
- [ ] تطبيق `POST /api/campaigns/:id/pause`
- [ ] إضافة `POST /api/campaigns/:id/complete`

### 📋 **5.5 Task Management APIs**
- [ ] إنشاء `backend/src/api/tasks.ts`
- [ ] تطبيق `GET /api/tasks` (list with filters)
- [ ] إضافة `POST /api/tasks` (create task)
- [ ] تطبيق `GET /api/tasks/:id` (get single task)
- [ ] إضافة `PUT /api/tasks/:id` (update task)
- [ ] تطبيق `POST /api/tasks/:id/assign` (assign photographer)
- [ ] إضافة `POST /api/tasks/:id/start` (start task)
- [ ] تطبيق `POST /api/tasks/:id/complete` (complete task)
- [ ] إضافة `POST /api/tasks/:id/review` (submit for review)

### 📤 **5.6 Content Management APIs**
- [ ] إنشاء `backend/src/api/content.ts`
- [ ] تطبيق `GET /api/content` (list with filters)
- [ ] إضافة `POST /api/content/upload` (upload content)
- [ ] تطبيق

## 🎯 **المهام القادمة في الأولوية:**

### 🚀 **التالي: Brand Coordinator Dashboard (علي حازم)**
- [ ] إنشاء `frontend/src/views/dashboards/BrandCoordinatorDashboard.vue`
- [ ] تطبيق معلومات براند NAVA مع الشعار
- [ ] إضافة إحصائيات NAVA (مهام، محتوى، تقييمات)

### 📸 **ثم: Photographer Dashboard**  
- [ ] إنشاء `frontend/src/views/dashboards/PhotographerDashboard.vue`
- [ ] تطبيق مركز الأرباح (للفريلانسر) أو الراتب (للموظف)
- [ ] إضافة مهامي الحالية

### ⚡ **أولوية عالية: Backend APIs الأساسية**
- [ ] إنشاء `backend/src/api/dashboards/`
- [ ] تطبيق `superAdminStats.ts`
- [ ] إضافة `marketingCoordinatorStats.ts`
- [ ] تطبيق `brandCoordinatorStats.ts`