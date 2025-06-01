// ===== DEPTH STUDIO UNIFIED DESIGN SYSTEM =====
// تفعيل نظام التصميم الموحد - يجب أن يكون أولاً
import './styles/main.scss'

// ===== EXISTING STYLES =====
// الأنماط الموجودة - ستبقى للتوافق المؤقت
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')

// ===== DEVELOPMENT HELPERS =====
// إضافة class للـ body للتأكد من جاهزية النظام
if (typeof window !== 'undefined') {
  // التأكد من تحميل النظام
  window.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('depth-studio-ready')
    
    // رسالة في الكونسول للتأكيد
    console.log('🎨 Depth Studio Design System: تم تحميل النظام الموحد بنجاح')
    console.log('📊 Available utilities: animations, RTL, helpers, mixins, print')
    
    // التحقق من وجود المتغيرات
    const testVar = getComputedStyle(document.documentElement).getPropertyValue('--depth-studio-system')
    if (testVar) {
      console.log('✅ Design system variables loaded successfully')
    }
  })
}
