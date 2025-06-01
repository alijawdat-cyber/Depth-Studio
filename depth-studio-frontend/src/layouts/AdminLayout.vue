<template>
  <v-app dir="rtl">
    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" app width="280">
      <!-- Header -->
      <div class="pa-4">
        <h3>Depth Studio</h3>
        <p class="text-caption">لوحة تحكم المدير العام</p>
        <ThemeSwitcher />
      </div>
      
      <!-- Navigation -->
      <v-list nav>
        <v-list-item to="/super-admin/dashboard" exact>
          <template v-slot:prepend>
            <v-icon>mdi-view-dashboard</v-icon>
          </template>
          <v-list-item-title>لوحة التحكم</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/super-admin/users">
          <template v-slot:prepend>
            <v-icon>mdi-account-group</v-icon>
          </template>
          <v-list-item-title>إدارة المستخدمين</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/super-admin/brands">
          <template v-slot:prepend>
            <v-icon>mdi-store</v-icon>
          </template>
          <v-list-item-title>إدارة البراندات</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/super-admin/campaigns">
          <template v-slot:prepend>
            <v-icon>mdi-rocket</v-icon>
          </template>
          <v-list-item-title>الحملات الذكية</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/super-admin/categories">
          <template v-slot:prepend>
            <v-icon>mdi-tag-multiple</v-icon>
          </template>
          <v-list-item-title>إدارة الفئات</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/super-admin/equipment">
          <template v-slot:prepend>
            <v-icon>mdi-camera</v-icon>
          </template>
          <v-list-item-title>إدارة المعدات</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/super-admin/settings">
          <template v-slot:prepend>
            <v-icon>mdi-cog</v-icon>
          </template>
          <v-list-item-title>إعدادات النظام</v-list-item-title>
        </v-list-item>
      </v-list>
      
      <v-spacer />
      
      <!-- User Section -->
      <div class="pa-4">
        <v-btn 
          color="error" 
          variant="outlined" 
          prepend-icon="mdi-logout" 
          block 
          @click="handleSignOut"
        >
          تسجيل الخروج
        </v-btn>
      </div>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>Depth Studio</v-toolbar-title>
      <v-spacer />
      <v-btn icon="mdi-bell" />
      <v-btn icon="mdi-account-circle" />
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'

const drawer = ref(true)
const { signOut, userProfile } = useAuth()
const router = useRouter()

const handleSignOut = async () => {
  try {
    await signOut()
    router.push('/auth/login')
  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error)
  }
}
</script> 