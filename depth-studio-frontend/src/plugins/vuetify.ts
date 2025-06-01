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

// ألوان البراندات المخصصة (متوافقة مع النظام الجديد)
const brandColors = {
  // NAVA - ذهبي وأسود فاخر
  nava: {
    primary: '#D4AF37',    // ذهبي
    secondary: '#1C1C1C',  // أسود
    accent: '#F4E4BC',     // ذهبي فاتح
    surface: '#FEFEFE',    // أبيض دافئ
    background: '#F8F6F0', // كريمي فاتح
  },
  // Sport&More - أزرق وأبيض رياضي
  sportmore: {
    primary: '#0066CC',    // أزرق
    secondary: '#FFFFFF',  // أبيض
    accent: '#E3F2FD',     // أزرق فاتح
    surface: '#FFFFFF',    // أبيض
    background: '#F7FBFF', // أزرق فاتح جداً
  },
  // INOFF - أخضر طبيعي
  inoff: {
    primary: '#4CAF50',    // أخضر
    secondary: '#2E7D32',  // أخضر داكن
    accent: '#E8F5E8',     // أخضر فاتح
    surface: '#FFFFFF',    // أبيض
    background: '#F1F8E9', // أخضر فاتح جداً
  },
  // BLO - بنفسجي ملكي
  blo: {
    primary: '#9C27B0',    // بنفسجي
    secondary: '#7B1FA2',  // بنفسجي داكن
    accent: '#F3E5F5',     // بنفسجي فاتح
    surface: '#FFFFFF',    // أبيض
    background: '#F8F5F9', // بنفسجي فاتح جداً
  },
  // Clinica A - وردي طبي
  clinica: {
    primary: '#E91E63',    // وردي
    secondary: '#C2185B',  // وردي داكن
    accent: '#FCE4EC',     // وردي فاتح
    surface: '#FFFFFF',    // أبيض
    background: '#FDF7FA', // وردي فاتح جداً
  }
}

// إعداد الثيم الافتراضي المحسن
const vuetify = createVuetify({
  components,
  directives,
  
  // === LOCALE CONFIGURATION ===
  // إعدادات اللغة والاتجاه
  locale: {
    locale: 'ar',
    fallback: 'en',
    rtl: { ar: true, en: false },
    messages: { ar: arCustom, en }
  },
  
  // === THEME CONFIGURATION ===
  // إعدادات الثيم المتوافقة مع النظام الجديد
  theme: {
    defaultTheme: 'light',
    variations: {
      colors: ['primary', 'secondary', 'accent'],
      lighten: 5,
      darken: 5,
    },
    themes: {
      // Light Theme (Default)
      light: {
        dark: false,
        colors: {
          // Core Colors
          primary: '#399ff0',        // متوافق مع CSS variables
          secondary: '#424242',      // رمادي داكن
          accent: '#82B1FF',         // أزرق فاتح
          
          // Status Colors
          error: '#ef4444',          // أحمر
          warning: '#f59e0b',        // برتقالي
          info: '#3b82f6',           // أزرق إعلامي
          success: '#22c55e',        // أخضر
          
          // Surface Colors
          surface: '#ffffff',        // أبيض
          background: '#fafafa',     // رمادي فاتح جداً
          
          // Text Colors (will be overridden by CSS variables)
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
          'on-surface': '#212121',
          'on-background': '#212121',
          'on-error': '#ffffff',
          'on-warning': '#000000',
          'on-info': '#ffffff',
          'on-success': '#ffffff',
        }
      },
      
      // Dark Theme
      dark: {
        dark: true,
        colors: {
          // Core Colors (adjusted for dark mode)
          primary: '#60a5fa',        // أزرق أفتح للوضع المظلم
          secondary: '#616161',      // رمادي متوسط
          accent: '#FF4081',         // وردي لامع
          
          // Status Colors
          error: '#ef4444',
          warning: '#fb8c00',        // برتقالي أغمق
          info: '#3b82f6',
          success: '#22c55e',
          
          // Surface Colors
          surface: '#424242',        // رمادي داكن
          background: '#212121',     // أسود رمادي
          
          // Text Colors
          'on-primary': '#ffffff',
          'on-secondary': '#ffffff',
          'on-surface': '#fafafa',
          'on-background': '#fafafa',
          'on-error': '#ffffff',
          'on-warning': '#000000',
          'on-info': '#ffffff',
          'on-success': '#ffffff',
        }
      },
      
      // Brand Themes
      ...Object.fromEntries(
        Object.entries(brandColors).map(([brandName, colors]) => [
          brandName,
          {
            dark: false,
            colors: {
              ...colors,
              error: '#ef4444',
              warning: '#f59e0b',
              info: '#3b82f6',
              success: '#22c55e',
              'on-primary': brandName === 'nava' ? '#000000' : '#ffffff',
              'on-secondary': brandName === 'sportmore' ? '#000000' : '#ffffff',
              'on-surface': '#212121',
              'on-background': '#212121',
            }
          }
        ])
      )
    }
  },
  
  // === DISPLAY CONFIGURATION ===
  // إعدادات العرض والتجاوب
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      xs: 0,
      sm: 375,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1440,
    },
  },
  
  // === DEFAULTS CONFIGURATION ===
  // الإعدادات الافتراضية للمكونات
  defaults: {
    global: {
      ripple: true,
      elevation: 1,
    },
    
    // Button Defaults
    VBtn: {
      style: 'text-transform: none; font-weight: 500;',
      rounded: 'lg',
      elevation: 1,
      ripple: true,
    },
    
    // Card Defaults
    VCard: {
      elevation: 1,
      rounded: 'lg',
      variant: 'elevated',
    },
    
    // Text Field Defaults
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      hideDetails: 'auto',
    },
    
    // Select Defaults
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      hideDetails: 'auto',
    },
    
    // Textarea Defaults
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      hideDetails: 'auto',
    },
    
    // Checkbox Defaults
    VCheckbox: {
      density: 'comfortable',
      hideDetails: 'auto',
    },
    
    // Radio Defaults
    VRadio: {
      density: 'comfortable',
    },
    
    // Switch Defaults
    VSwitch: {
      density: 'comfortable',
      hideDetails: 'auto',
    },
    
    // Chip Defaults
    VChip: {
      rounded: 'lg',
      size: 'default',
    },
    
    // Avatar Defaults
    VAvatar: {
      rounded: 'circle',
    },
    
    // Badge Defaults
    VBadge: {
      rounded: 'circle',
    },
    
    // Alert Defaults
    VAlert: {
      rounded: 'lg',
      variant: 'tonal',
      border: 'start',
    },
    
    // Dialog Defaults
    VDialog: {
      rounded: 'xl',
      elevation: 24,
    },
    
    // Bottom Sheet Defaults
    VBottomSheet: {
      rounded: 'xl',
    },
    
    // Menu Defaults
    VMenu: {
      rounded: 'lg',
      elevation: 8,
    },
    
    // Tooltip Defaults
    VTooltip: {
      rounded: 'lg',
    },
    
    // Snackbar Defaults
    VSnackbar: {
      rounded: 'lg',
      elevation: 6,
    },
    
    // App Bar Defaults
    VAppBar: {
      elevation: 1,
      rounded: false,
    },
    
    // Navigation Drawer Defaults
    VNavigationDrawer: {
      elevation: 1,
      rounded: false,
    },
    
    // List Defaults
    VList: {
      rounded: 'lg',
      density: 'comfortable',
    },
    
    // List Item Defaults
    VListItem: {
      rounded: 'lg',
      density: 'comfortable',
    },
    
    // Divider Defaults
    VDivider: {
      opacity: 0.12,
    },
    
    // Data Table Defaults
    VDataTable: {
      rounded: 'lg',
      elevation: 1,
      density: 'comfortable',
    },
    
    // Pagination Defaults
    VPagination: {
      rounded: 'circle',
      density: 'comfortable',
    },
    
    // Progress Linear Defaults
    VProgressLinear: {
      rounded: true,
      height: 6,
    },
    
    // Progress Circular Defaults
    VProgressCircular: {
      size: 32,
      width: 3,
    },
    
    // Skeleton Loader Defaults
    VSkeletonLoader: {
      elevation: 1,
      rounded: 'lg',
    },
    
    // Expansion Panels Defaults
    VExpansionPanels: {
      rounded: 'lg',
      elevation: 1,
    },
    
    // Tabs Defaults
    VTabs: {
      rounded: 'lg',
      density: 'comfortable',
    },
    
    // Window Defaults
    VWindow: {
      rounded: 'lg',
    },
    
    // Stepper Defaults
    VStepper: {
      rounded: 'lg',
      elevation: 1,
    },
  },
  
  // === ICONS CONFIGURATION ===
  // إعدادات الأيقونات
  icons: {
    defaultSet: 'mdi',
    aliases: {
      // Theme Toggle Icons
      lightMode: 'mdi-white-balance-sunny',
      darkMode: 'mdi-moon-waning-crescent',
      systemMode: 'mdi-monitor',
      
      // Brand Icons
      nava: 'mdi-diamond-stone',
      sportmore: 'mdi-football',
      inoff: 'mdi-leaf',
      blo: 'mdi-palette',
      clinica: 'mdi-medical-bag',
      
      // Common Actions
      settings: 'mdi-cog',
      logout: 'mdi-logout',
      profile: 'mdi-account-circle',
      dashboard: 'mdi-view-dashboard',
      users: 'mdi-account-group',
      brands: 'mdi-domain',
      reports: 'mdi-chart-line',
      
      // Directions (RTL/LTR)
      arrowNext: 'mdi-arrow-left',
      arrowPrevious: 'mdi-arrow-right',
      chevronNext: 'mdi-chevron-left',
      chevronPrevious: 'mdi-chevron-right',
    },
  },
})

export default vuetify
export { brandColors } 