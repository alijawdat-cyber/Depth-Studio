import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { ar, en } from 'vuetify/locale'

// ترجمات مخصصة للعربية
const arCustom = {
  ...ar,
  input: {
    ...ar.input,
    appendAction: 'إجراء إضافي',
    prependAction: 'إجراء سابق',
    clear: 'مسح',
    togglePassword: 'إظهار/إخفاء كلمة المرور'
  }
}

// ألوان البراندات المخصصة
const brandColors = {
  // NAVA - ذهبي وأسود فاخر
  nava: {
    primary: '#D4AF37',    // ذهبي
    secondary: '#1C1C1C',  // أسود
    accent: '#F4E4BC',     // ذهبي فاتح
  },
  // Sport&More - أزرق وأبيض رياضي
  sportmore: {
    primary: '#0066CC',    // أزرق
    secondary: '#FFFFFF',  // أبيض
    accent: '#E3F2FD',     // أزرق فاتح
  },
  // INOFF - أخضر طبيعي
  inoff: {
    primary: '#4CAF50',    // أخضر
    secondary: '#2E7D32',  // أخضر داكن
    accent: '#E8F5E8',     // أخضر فاتح
  },
  // BLO - بنفسجي ملكي
  blo: {
    primary: '#9C27B0',    // بنفسجي
    secondary: '#7B1FA2',  // بنفسجي داكن
    accent: '#F3E5F5',     // بنفسجي فاتح
  },
  // Clinica A - وردي طبي
  clinica: {
    primary: '#E91E63',    // وردي
    secondary: '#C2185B',  // وردي داكن
    accent: '#FCE4EC',     // وردي فاتح
  }
}

// إعداد الثيم الافتراضي
const vuetify = createVuetify({
  components,
  directives,
  // إعدادات RTL للغة العربية
  locale: {
    locale: 'ar',
    fallback: 'en',
    rtl: { ar: true, en: false },
    ...arCustom
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',     // أزرق Bootstrap
          secondary: '#424242',   // رمادي داكن
          accent: '#82B1FF',      // أزرق فاتح
          error: '#FF5252',       // أحمر
          info: '#2196F3',        // أزرق إعلامي
          success: '#4CAF50',     // أخضر
          warning: '#FFC107',     // أصفر
          surface: '#FFFFFF',     // خلفية
          background: '#F5F5F5',  // خلفية عامة
        }
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#616161',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
          surface: '#121212',
          background: '#121212',
        }
      },
      // إضافة ثيمات البراندات
      ...Object.fromEntries(
        Object.entries(brandColors).map(([brandName, colors]) => [
          brandName,
          {
            colors: {
              ...colors,
              error: '#FF5252',
              info: '#2196F3',
              success: '#4CAF50',
              warning: '#FFC107',
              surface: '#FFFFFF',
              background: '#F5F5F5',
            }
          }
        ])
      )
    }
  },
  defaults: {
    VBtn: {
      style: 'text-transform: none;', // إزالة الأحرف الكبيرة
    },
    VCard: {
      elevation: 2,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
    }
  }
})

export default vuetify
export { brandColors } 