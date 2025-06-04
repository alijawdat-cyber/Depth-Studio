import './assets/styles/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

// إضافة فونتات Google للعربية
const link = document.createElement('link')
link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&family=Noto+Sans+Arabic:wght@100;200;300;400;500;600;700;800;900&display=swap'
link.rel = 'stylesheet'
document.head.appendChild(link)

// Vuetify بسيط جداً
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#2563eb',
          secondary: '#64748b', 
          error: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981'
        }
      }
    }
  }
})

const app = createApp(App)

app.use(createPinia())

// تهيئة AuthStore بعد إنشاء Pinia
const authStore = useAuthStore()

app.use(router)
app.use(vuetify)

app.mount('#app')
