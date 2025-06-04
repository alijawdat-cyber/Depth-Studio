# 🚀 **دليل التشغيل والنشر المختصر - Depth Studio**

**المشروع**: Depth Studio - نظام إدارة المحتوى بالذكاء الاصطناعي  
**النسخة**: 1.0.0  
**المطور**: Ali Jawdat

---

## 📋 **الأوامر الأساسية**

### **🔧 إعداد أولي:**
```bash
# 1. انتقال للمشروع
cd /Users/alijawdat/Downloads/Depth-app

# 2. تثبيت كل المكتبات
npm run install:all

# 3. فحص Firebase
firebase login
firebase use depth-studio
```

### **🚀 تشغيل التطوير:**
```bash
# تشغيل Frontend + Backend معاً (الأفضل)
npm run dev

# أو تشغيل منفصل:
npm run dev:frontend    # http://localhost:5173
npm run dev:backend     # http://localhost:5001
```

### **🔨 البناء:**
```bash
# بناء كامل
npm run build

# بناء منفصل  
npm run build:frontend  # ينتج: frontend/dist/
npm run build:backend   # ينتج: backend/lib/
```

### **📤 النشر:**
```bash
# نشر كامل لـ Firebase
npm run build
firebase deploy

# نشر منفصل
firebase deploy --only hosting    # Frontend فقط
firebase deploy --only functions  # Backend فقط
```

---

## 🔍 **أوامر الفحص والتشخيص**

### **فحص الصحة:**
```bash
# فحص المنافذ النشطة
netstat -an | grep LISTEN | grep -E '300[0-9]|500[0-9]|517[0-9]'

# فحص Firebase
firebase projects:list
firebase use

# اختبار API
curl -s http://localhost:5001/depth-studio/us-central1/health | jq .
curl -s http://localhost:5001/depth-studio/us-central1/test | jq .
```

### **فحص ملفات البيئة:**
```bash
# فحص Backend .env
cat backend/.env | grep -E '^[A-Z_]+'

# فحص Frontend .env  
cat frontend/.env | grep -E '^VITE_'
```

### **فحص المكتبات:**
```bash
# فحص إصدارات
node --version    # يجب >= 18
npm --version     # يجب >= 9
firebase --version

# فحص المكتبات القديمة
npm outdated
cd frontend && npm outdated
cd ../backend && npm outdated
```

---

## 🛠️ **حل المشاكل الشائعة**

### **مشكلة المنافذ:**
```bash
# إيجاد وإنهاء العمليات
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:5001 | xargs kill -9  # Backend
```

### **مشكلة المكتبات:**
```bash
# إعادة تثبيت كامل
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all
```

### **مشكلة Firebase:**
```bash
# إعادة تسجيل الدخول
firebase logout && firebase login
firebase use depth-studio
```

### **إعادة تشغيل كامل:**
```bash
# إيقاف كل العمليات
pkill -f "node.*dev|vite|firebase"

# مسح وإعادة بناء
rm -rf frontend/dist backend/lib
npm run build

# إعادة تشغيل
npm run dev
```

---

## 📊 **المعلومات المهمة**

### **المنافذ المستخدمة:**
- **Frontend**: http://localhost:5173
- **Backend/Functions**: http://localhost:5001  
- **Firebase UI**: http://localhost:4000

### **ملفات البيئة الحالية:**

#### **Backend (.env):**
```
NODE_ENV=development
PORT=3001
FUNCTIONS_PORT=5001
FRONTEND_URL=http://localhost:5173
FIREBASE_PROJECT_ID=depth-studio
GOOGLE_CLIENT_ID=584154257700-d6vp6d8376am0c0loaphib4o4rfiii6.apps.googleusercontent.com
```

#### **Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:5001
VITE_FIREBASE_PROJECT_ID=depth-studio
VITE_GOOGLE_CLIENT_ID=584154257700-d6vp6d8376am0c0loaphib4o4rfiii6.apps.googleusercontent.com
VITE_USE_EMULATOR=true
```

### **التقنيات المستخدمة:**
- **Frontend**: Vue.js 3.5.13 + Vite 6.2.4 + Vuetify 3.8.7
- **Backend**: Node.js + Firebase Functions 6.3.2 + Express 4.21.2
- **Database**: Firestore + Firebase Auth
- **Deployment**: Firebase Hosting + Functions

### **URLs المهمة:**
- **الإنتاج**: https://depth-studio.firebaseapp.com
- **Firebase Console**: https://console.firebase.google.com/project/depth-studio
- **Backend API**: https://depthbackend--depth-studio.us-central1.hosted.app

---

## 🔧 **أوامر سريعة للحفظ**

```bash
# التشغيل اليومي
cd /Users/alijawdat/Downloads/Depth-app && npm run dev

# البناء والنشر
npm run build && firebase deploy

# إعادة تشغيل عند المشاكل  
pkill -f "node.*dev|vite|firebase" && npm run dev

# فحص الصحة
curl -s http://localhost:5001/depth-studio/us-central1/health

# تحديث المكتبات
npm run install:all
```

---

**آخر تحديث**: ديسمبر 2024  
**حالة المشروع**: ✅ جاهز للاستخدام  
**المطور**: Ali Jawdat (alijawdat4@gmail.com)