# 🌐 دليل دعم RTL - Depth Studio

## 🎯 المقدمة

هذا الدليل يحدد المعايير والممارسات الأفضل لدعم RTL (من اليمين إلى اليسار) في مشروع "Depth Studio" لضمان تجربة مستخدم متميزة للغة العربية.

## ⚙️ الإعدادات الأساسية

### 1. إعدادات Vuetify (src/plugins/vuetify.ts):
```typescript
const vuetify = createVuetify({
  // إعدادات RTL للغة العربية
  locale: {
    locale: 'ar',
    fallback: 'en',
    rtl: { ar: true, en: false }
  },
  // باقي الإعدادات...
})
```

### 2. العنصر الجذري (src/App.vue):
```vue
<template>
  <v-app dir="rtl">
    <router-view />
  </v-app>
</template>
```

## 🎨 قواعد CSS للـ RTL

### CSS العام (src/assets/main.css):
```css
/* دعم RTL شامل */
[dir="rtl"] {
  text-align: right;
}

[dir="ltr"] {
  text-align: left;
}

/* تحسين الخطوط العربية */
html[dir="rtl"] {
  font-family: 'Tajawal', 'Cairo', 'Noto Sans Arabic', 'Inter', sans-serif;
}

/* تحسين الأيقونات */
[dir="rtl"] .v-icon.v-icon--start {
  margin-inline-start: 8px;
  margin-inline-end: 0;
}
```

## 🧩 استخدام مكونات Vuetify مع RTL

### الأزرار مع الأيقونات:
```vue
<!-- ✅ صحيح - استخدم start بدلاً من left -->
<v-btn>
  <v-icon start>mdi-login</v-icon>
  تسجيل الدخول
</v-btn>

<!-- ❌ خطأ - لا تستخدم left مع RTL -->
<v-btn>
  <v-icon left>mdi-login</v-icon>
  تسجيل الدخول
</v-btn>
```

### حقول الإدخال:
```vue
<!-- ✅ صحيح - دع Vuetify يتعامل مع الاتجاه -->
<v-text-field
  label="البريد الإلكتروني"
  prepend-inner-icon="mdi-email"
/>

<!-- ❌ خطأ - لا تضع dir="ltr" إلا للضرورة -->
<v-text-field
  label="البريد الإلكتروني"
  dir="ltr"
/>
```

### التنبيهات والحدود:
```vue
<!-- استخدم border="start" بدلاً من border="left" -->
<v-alert border="start" type="info">
  رسالة تنبيه
</v-alert>
```

## 📝 معايير الكود

### 1. الأيقونات:
- استخدم `start` و `end` بدلاً من `left` و `right`
- استخدم `prepend-inner-icon` و `append-inner-icon` بشكل طبيعي

### 2. المحاذاة:
- استخدم `text-start` و `text-end` بدلاً من `text-left` و `text-right`
- دع Vuetify يتعامل مع الاتجاه تلقائياً

### 3. المسافات:
- استخدم `margin-inline-start` و `margin-inline-end`
- استخدم `padding-inline-start` و `padding-inline-end`

## ⚠️ الأخطاء الشائعة

### ❌ تجنب هذه الممارسات:
```vue
<!-- خطأ: فرض dir="ltr" بدون ضرورة -->
<v-text-field dir="ltr" />

<!-- خطأ: استخدام left/right مع الأيقونات -->
<v-icon left>mdi-icon</v-icon>

<!-- خطأ: محاذاة ثابتة في CSS -->
.component {
  text-align: left !important;
}
```

### ✅ الطريقة الصحيحة:
```vue
<!-- صحيح: دع Vuetify يتعامل مع الاتجاه -->
<v-text-field />

<!-- صحيح: استخدم start/end -->
<v-icon start>mdi-icon</v-icon>

<!-- صحيح: محاذاة متجاوبة -->
.component {
  text-align: inherit;
}
```

## 🔧 حلول للحالات الخاصة

### 1. حقول تتطلب LTR (مثل البريد الإلكتروني):
```vue
<v-text-field
  label="البريد الإلكتروني"
  class="ltr-input"
/>
```

```css
.ltr-input .v-field__input {
  direction: ltr;
  text-align: left;
}
```

### 2. أرقام الهواتف:
```vue
<v-text-field
  label="رقم الهاتف"
  type="tel"
  class="phone-input"
  placeholder="+964 XXX XXX XXXX"
/>
```

```css
.phone-input .v-field__input {
  direction: ltr;
  text-align: left;
}
```

### 3. الأكواد والرموز:
```vue
<v-text-field
  label="رمز التحقق"
  class="code-input"
/>
```

```css
.code-input .v-field__input {
  direction: ltr;
  text-align: center;
  letter-spacing: 0.2em;
}
```

## 📋 قائمة فحص RTL

### ✅ قبل اعتماد أي واجهة:
- [ ] جميع النصوص العربية محاذاة لليمين
- [ ] الأيقونات في المكان الصحيح
- [ ] الأزرار تستخدم `start`/`end` بدلاً من `left`/`right`
- [ ] القوائم والحدود تتبع الاتجاه الصحيح
- [ ] حقول الإدخال تعرض المحتوى بالاتجاه المناسب
- [ ] لا توجد قواعد CSS تفرض LTR بدون ضرورة

### اختبار RTL:
1. افحص الواجهة بالعين المجردة
2. تأكد من أن المحاذاة طبيعية للقارئ العربي
3. اختبر التفاعل مع العناصر (الأزرار، القوائم)
4. تأكد من أن الأيقونات في أماكنها المنطقية

## 🌍 التوطين المستقبلي

### إعداد اللغات المتعددة:
```typescript
// في src/plugins/vuetify.ts
import { ar, en } from 'vuetify/locale'

const vuetify = createVuetify({
  locale: {
    locale: 'ar',
    fallback: 'en',
    messages: { ar, en },
    rtl: { ar: true, en: false }
  }
})
```

### تبديل اللغة:
```vue
<script setup>
import { useLocale } from 'vuetify'

const { locale, isRtl } = useLocale()

const switchLanguage = (lang: string) => {
  locale.value = lang
  document.dir = isRtl.value ? 'rtl' : 'ltr'
}
</script>
```

## 📖 مراجع مفيدة

- [Vuetify RTL Documentation](https://vuetifyjs.com/en/features/rtl/)
- [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [RTL Best Practices](https://www.w3.org/International/questions/qa-html-dir)

---

**آخر تحديث**: 2025-01-27  
**الإصدار**: 1.0  
**المؤلف**: فريق تطوير Depth Studio 