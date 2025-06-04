<template>
  <v-app>
    <!-- Main Navigation Drawer (Sidebar) -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      :width="sidebarWidth"
      class="app-sidebar"
      elevation="1"
    >
      <!-- Sidebar Header -->
      <v-list-item
        :prepend-avatar="user?.profile_photo_url"
        :title="user?.display_name || 'مرحباً'"
        :subtitle="user?.primary_role ? roleDisplayName(user.primary_role) : 'مستخدم'"
        class="sidebar-header"
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
            size="small"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <!-- Navigation Menu -->
      <v-list density="compact" nav>
        <template v-for="item in sidebarItems" :key="item.title">
          <!-- Main Menu Item -->
          <v-list-item
            v-if="!item.children"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
            :value="item.value"
            color="primary"
          ></v-list-item>

          <!-- Group with Children -->
          <v-list-group
            v-else
            :value="item.value"
          >
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                :prepend-icon="item.icon"
                :title="item.title"
              ></v-list-item>
            </template>

            <v-list-item
              v-for="child in item.children"
              :key="child.title"
              :title="child.title"
              :to="child.to"
              :prepend-icon="child.icon"
              color="primary"
            ></v-list-item>
          </v-list-group>
        </template>
      </v-list>

      <!-- Sidebar Footer -->
      <template v-slot:append>
        <div class="pa-2">
          <v-btn
            block
            variant="outlined"
            color="error"
            @click="handleLogout"
            :loading="isLoggingOut"
          >
            <v-icon start>mdi-logout</v-icon>
            تسجيل خروج
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar 
      :order="0"
      elevation="1"
      class="app-header"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <!-- Brand Logo & Title -->
      <v-toolbar-title class="d-flex align-center">
        <v-img 
          src="/logo.png" 
          alt="Depth Studio"
          max-width="32"
          class="me-2"
        ></v-img>
        <span class="text-h6 font-weight-bold text-primary">Depth Studio</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Search Bar (if applicable) -->
      <v-text-field
        v-if="showSearchBar"
        v-model="searchQuery"
        hide-details
        placeholder="بحث..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        style="max-width: 300px;"
        class="me-4"
      ></v-text-field>

      <!-- Notifications -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            class="me-2"
          >
            <v-badge
              :content="notificationCount"
              color="error"
              :model-value="notificationCount > 0"
            >
              <v-icon>mdi-bell</v-icon>
            </v-badge>
          </v-btn>
        </template>

        <v-card min-width="300">
          <v-card-title>الإشعارات</v-card-title>
          <v-divider></v-divider>
          
          <v-list v-if="notifications.length > 0">
            <v-list-item
              v-for="notification in notifications"
              :key="notification.id"
              :title="notification.title"
              :subtitle="notification.message"
            ></v-list-item>
          </v-list>
          
          <v-card-text v-else class="text-center">
            لا توجد إشعارات جديدة
          </v-card-text>
        </v-card>
      </v-menu>

      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            class="me-2"
          >
            <v-avatar size="32" class="me-2">
              <v-img 
                :src="user?.profile_photo_url || '/default-avatar.png'"
                :alt="user?.display_name"
              ></v-img>
            </v-avatar>
            <span>{{ user?.display_name }}</span>
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item
            title="الملف الشخصي"
            prepend-icon="mdi-account"
            to="/profile"
          ></v-list-item>
          
          <v-list-item
            title="الإعدادات"
            prepend-icon="mdi-cog"
            to="/settings"
          ></v-list-item>
          
          <v-divider></v-divider>
          
          <v-list-item
            title="تسجيل خروج"
            prepend-icon="mdi-logout"
            @click="handleLogout"
          ></v-list-item>
        </v-list>
      </v-menu>

      <!-- Language Switcher -->
      <v-btn
        icon
        @click="toggleLanguage"
        class="me-2"
      >
        <v-icon>{{ currentLanguage === 'ar' ? 'mdi-translate' : 'mdi-translate-off' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-4">
        <!-- Breadcrumb Navigation -->
        <v-breadcrumbs
          v-if="breadcrumbs.length > 0"
          :items="breadcrumbs"
          class="pa-0 mb-4"
        >
          <template v-slot:divider>
            <v-icon>mdi-chevron-left</v-icon>
          </template>
        </v-breadcrumbs>

        <!-- Page Content -->
        <router-view />
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer app class="app-footer">
      <div class="d-flex justify-space-between align-center w-100">
        <span>&copy; 2024 Depth Studio. جميع الحقوق محفوظة.</span>
        <div>
          <v-btn variant="text" size="small" href="/help">المساعدة</v-btn>
          <v-btn variant="text" size="small" href="/contact">التواصل</v-btn>
        </div>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSidebarStore } from '@/stores/sidebar'
import { useNotificationStore } from '@/stores/notifications'
import { useDashboardStore } from '@/stores/dashboard'

// ======================================
// Stores
// ======================================
const authStore = useAuthStore()
const sidebarStore = useSidebarStore()
const notificationStore = useNotificationStore()
const dashboardStore = useDashboardStore()
const router = useRouter()
const route = useRoute()

// ======================================
// State
// ======================================
const drawer = ref(true)
const rail = ref(false)
const searchQuery = ref('')
const isLoggingOut = ref(false)
const currentLanguage = ref('ar')

// ======================================
// Computed
// ======================================
const user = computed(() => authStore.userProfile)
const sidebarItems = computed(() => sidebarStore.getMenuItems(user.value?.primary_role || ''))
const notifications = computed(() => notificationStore.notifications)
const notificationCount = computed(() => notificationStore.unreadCount)
const sidebarWidth = computed(() => rail.value ? 64 : 256)

// Show search bar on specific pages
const showSearchBar = computed(() => {
  const searchablePages = ['/campaigns', '/tasks', '/content', '/users']
  return searchablePages.some(page => route.path.startsWith(page))
})

// Breadcrumbs from route meta
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.breadcrumb)
  return matched.map(item => ({
    title: String(item.meta?.breadcrumb || ''),
    to: item.path,
    disabled: false
  }))
})

// ======================================
// Methods
// ======================================

/**
 * Get display name for user role
 */
function roleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    'super_admin': 'المدير العام',
    'marketing_coordinator': 'منسق التسويق',
    'brand_coordinator': 'منسق البراند',
    'photographer': 'مصور'
  }
  return roleNames[role] || role
}

/**
 * Handle user logout
 */
async function handleLogout() {
  try {
    isLoggingOut.value = true
    
    dashboardStore.cleanup()
    
    await authStore.logout()
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    isLoggingOut.value = false
  }
}

/**
 * Toggle language
 */
function toggleLanguage() {
  currentLanguage.value = currentLanguage.value === 'ar' ? 'en' : 'ar'
  // Implement language switching logic
}

// ======================================
// Lifecycle
// ======================================
onMounted(async () => {
  console.log('🔵 AppLayout mounted, current user:', user.value?.email)
  
  if (user.value && user.value.primary_role !== 'new_user') {
    console.log('🔵 تهيئة Dashboard Store للمستخدم:', user.value.email)
    try {
      await dashboardStore.initializeRealtimeListeners()
      console.log('✅ تم تهيئة Dashboard Store بنجاح')
    } catch (error) {
      console.error('❌ خطأ في تهيئة Dashboard Store:', error)
    }
  }
  
  if (user.value) {
    console.log('🔵 User found, loading notifications...')
  notificationStore.loadNotifications()
  } else {
    console.log('⚠️ No user found, skipping notifications')
  }
  
  sidebarStore.initializeSidebar(user.value?.primary_role || '')
})
</script>

<style scoped>
.app-sidebar {
  border-right: 1px solid rgb(var(--v-theme-surface-variant));
}

.sidebar-header {
  padding: 16px 12px;
  background-color: rgb(var(--v-theme-surface-variant));
}

.app-header {
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

.app-footer {
  border-top: 1px solid rgb(var(--v-theme-surface-variant));
  padding: 8px 16px;
  min-height: 48px;
}

/* RTL support */
[dir="rtl"] .v-navigation-drawer {
  border-left: 1px solid rgb(var(--v-theme-surface-variant));
  border-right: none;
}
</style> 