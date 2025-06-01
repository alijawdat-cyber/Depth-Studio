<template>
  <v-app dir="rtl">
    <!-- Navigation Drawer -->
    <v-navigation-drawer 
      v-model="drawer" 
      app 
      width="280"
      color="surface"
      elevation="4"
      class="admin-drawer animate-in"
    >
      <!-- Header -->
      <div class="drawer-header p-4 text-center bg-surface-alt border-b border-muted">
        <v-avatar size="48" class="mb-2 hover-lift">
          <v-img src="/logo-depth-studio.png" alt="Depth Studio" />
        </v-avatar>
        <h3 class="text-h6 font-weight-bold text-primary mb-1">Depth Studio</h3>
        <p class="text-caption text-muted">لوحة تحكم المدير العام</p>
      </div>
      
      <!-- Main Navigation -->
      <v-list nav density="comfortable" class="pt-3">
        <v-list-item 
          to="/super-admin/dashboard"
          exact
          color="primary"
          class="nav-item mb-1 mx-3 rounded"
        >
          <template v-slot:prepend>
            <v-icon>mdi-view-dashboard</v-icon>
          </template>
          <v-list-item-title class="font-weight-medium">لوحة التحكم</v-list-item-title>
        </v-list-item>
        
        <v-list-item 
          to="/super-admin/users"
          color="primary"
          class="nav-item mb-1 mx-3 rounded"
        >
          <template v-slot:prepend>
            <v-icon>mdi-account-group</v-icon>
          </template>
          <v-list-item-title class="font-weight-medium">إدارة المستخدمين</v-list-item-title>
        </v-list-item>
        
        <v-list-item 
          to="/super-admin/brands"
          color="primary"
          class="nav-item mb-1 mx-3 rounded"
        >
          <template v-slot:prepend>
            <v-icon>mdi-store</v-icon>
          </template>
          <v-list-item-title class="font-weight-medium">إدارة البراندات</v-list-item-title>
        </v-list-item>
        
        <v-list-item 
          to="/super-admin/campaigns"
          color="primary"
          class="nav-item mb-1 mx-3 rounded"
        >
          <template v-slot:prepend>
            <v-icon>mdi-rocket</v-icon>
          </template>
          <v-list-item-title class="font-weight-medium">الحملات الذكية</v-list-item-title>
        </v-list-item>
        
        <v-list-item 
          to="/super-admin/categories"
          color="primary"
          class="nav-item mb-1 mx-3 rounded"
        >
          <template v-slot:prepend>
            <v-icon>mdi-tag-multiple</v-icon>
          </template>
          <v-list-item-title class="font-weight-medium">إدارة الفئات</v-list-item-title>
        </v-list-item>
        
        <v-list-item 
          to="/super-admin/equipment"
          color="primary"
          class="nav-item mb-1 mx-3 rounded"
        >
          <template v-slot:prepend>
            <v-icon>mdi-camera</v-icon>
          </template>
          <v-list-item-title class="font-weight-medium">إدارة المعدات</v-list-item-title>
        </v-list-item>
        
        <v-list-item 
          to="/super-admin/settings"
          color="primary"
          class="nav-item mb-1 mx-3 rounded"
        >
          <template v-slot:prepend>
            <v-icon>mdi-cog</v-icon>
          </template>
          <v-list-item-title class="font-weight-medium">إعدادات النظام</v-list-item-title>
        </v-list-item>
      </v-list>
      
      <v-spacer />
      
      <!-- User Section -->
      <div class="user-section border-t border-muted">
        <v-list-item class="pa-4">
          <template v-slot:prepend>
            <v-avatar size="32" class="hover-scale">
              <v-icon>mdi-account-circle</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ userProfile?.displayName || userProfile?.email }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption text-muted">
            المدير العام
          </v-list-item-subtitle>
        </v-list-item>
        
        <BaseButton
          label="تسجيل الخروج"
          leading-icon="mdi-logout"
          color="error"
          variant="outlined"
          size="small"
          class="ma-3"
          block
          animate
          @click="handleSignOut"
        />
      </div>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar 
      app 
      elevation="2"
      color="surface"
      density="comfortable"
      class="admin-header"
    >
      <BaseButton
        icon="mdi-menu"
        variant="text"
        size="small"
        class="me-2"
        @click="drawer = !drawer"
      />
      
      <v-toolbar-title class="text-h6 font-weight-bold">
        Depth Studio
      </v-toolbar-title>
      
      <v-spacer />
      
      <!-- Quick Actions -->
      <BaseButton
        icon="mdi-bell"
        variant="text"
        size="small"
        class="me-2 position-relative"
      >
        <v-badge 
          content="3" 
          color="error"
          floating
        />
      </BaseButton>
      
      <BaseButton
        icon="mdi-account-circle"
        variant="text"
        size="small"
      />
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <div class="main-content animate-fade-in">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

const { userProfile, signOut } = useAuth()
const router = useRouter()
const drawer = ref(true)

const handleSignOut = async () => {
  try {
    await signOut()
    router.push('/auth/login')
  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error)
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-system/index';

.admin-drawer {
  // === CORE STYLES ===
  border-radius: 0 16px 16px 0;
  
  [dir="rtl"] & {
    border-radius: 16px 0 0 16px;
  }
  
  // Header specific styles
  .drawer-header {
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-surface), 1) 100%);
    
    .v-avatar {
      transition: all var(--transition-duration-normal) var(--transition-timing-ease-out);
      
      &:hover {
        transform: translateY(-2px);
      }
    }
  }
  
  // Navigation items
  .nav-item {
    transition: all var(--transition-duration-fast) var(--transition-timing-ease-out);
    
    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateX(-2px);
      
      [dir="rtl"] & {
        transform: translateX(2px);
      }
    }
    
    &.v-list-item--active {
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }
  }
  
  // User section
  .user-section {
    .v-avatar {
      transition: transform var(--transition-normal) var(--easing-ease-out);
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
}

.admin-header {
  backdrop-filter: blur(8px);
  
  .v-toolbar-title {
    background: linear-gradient(45deg, var(--color-primary), var(--color-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.main-content {
  animation: fadeIn var(--transition-normal) var(--easing-ease-out);
  min-height: calc(100vh - 64px);
  
  // Page transitions
  :deep(.router-view) {
    animation: slideIn var(--transition-normal) var(--easing-ease-out);
  }
}

// === RESPONSIVE STYLES ===
@media (max-width: 768px) {
  .admin-drawer {
    .nav-item {
      margin-left: var(--spacing-2);
      margin-right: var(--spacing-2);
    }
  }
}

// === PRINT STYLES ===
@media print {
  .admin-drawer,
  .admin-header {
    display: none !important;
  }
  
  .main-content {
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style> 