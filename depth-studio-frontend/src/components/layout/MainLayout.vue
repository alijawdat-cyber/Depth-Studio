<!--
==============================================
DEPTH STUDIO - التخطيط الرئيسي
Main Layout Component
==============================================
-->

<template>
  <div 
    class="layout" 
    :class="layoutClasses"
    :data-theme="currentTheme"
  >
    <!-- القائمة الجانبية -->
    <AppSidebar
      v-if="showSidebar"
      v-model:is-open="sidebarOpen"
      v-model:is-compact="sidebarCompact"
      :variant="sidebarVariant"
      :menu-sections="menuSections"
      :current-user="currentUser"
      :current-brand="currentBrand"
      :show-brand-info="showBrandInfo"
      :show-toggle-button="showSidebarToggle"
      :brand-name="brandName"
      :brand-logo="brandLogo"
      @item-click="handleSidebarItemClick"
      @user-action="handleUserAction"
      @toggle="handleSidebarToggle"
    />

    <!-- المحتوى الرئيسي -->
    <div class="layout__main">
      <!-- الشريط العلوي -->
      <AppTopbar
        v-if="showTopbar"
        :variant="topbarVariant"
        :sidebar-open="sidebarOpen"
        :current-user="currentUser"
        :navigation-items="navigationItems"
        :breadcrumbs="breadcrumbs"
        :show-search="showSearch"
        :search-placeholder="searchPlaceholder"
        :search-results="searchResults"
        :show-navigation="showNavigation"
        :show-breadcrumb="showBreadcrumb"
        :show-notifications="showNotifications"
        :notification-count="notificationCount"
        :quick-actions="quickActions"
        :brand-name="brandName"
        :brand-logo="brandLogo"
        @search="handleSearch"
        @search-result-click="handleSearchResultClick"
        @user-action="handleUserAction"
        @quick-action="handleQuickAction"
        @sidebar-toggle="handleTopbarSidebarToggle"
        @notifications-toggle="handleNotificationsToggle"
        @logout="handleLogout"
      />

      <!-- منطقة المحتوى -->
      <main class="layout__content" :class="contentClasses">
        <!-- المحتوى الديناميكي -->
        <router-view v-slot="{ Component, route }">
          <transition
            :name="pageTransition"
            mode="out-in"
            appear
          >
            <component 
              :is="Component" 
              :key="route.fullPath"
              v-bind="routeProps"
            />
          </transition>
        </router-view>

        <!-- حالة التحميل العامة -->
        <div 
          v-if="globalLoading"
          class="layout__loading"
          role="status"
          aria-label="جاري التحميل..."
        >
          <div class="loading-spinner"></div>
          <p class="loading-text">{{ loadingText }}</p>
        </div>

        <!-- رسائل الخطأ العامة -->
        <div 
          v-if="globalError"
          class="layout__error"
          role="alert"
        >
          <BaseIcon name="alert-circle" class="error-icon" />
          <div class="error-content">
            <h3 class="error-title">{{ globalError.title || 'حدث خطأ' }}</h3>
            <p class="error-message">{{ globalError.message }}</p>
            <button 
              v-if="globalError.retry"
              class="error-retry"
              @click="handleErrorRetry"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </main>

      <!-- التذييل -->
      <AppFooter
        v-if="showFooter"
        :variant="footerVariant"
        :brand-name="brandName"
        :brand-logo="brandLogo"
        :show-contact="showFooterContact"
        :show-version="showVersion"
        :version="appVersion"
        @link-action="handleFooterAction"
      />
    </div>

    <!-- Overlay للموبايل -->
    <div 
      v-if="sidebarOpen && isMobile"
      class="layout-overlay layout-overlay--active"
      @click="closeSidebar"
      role="button"
      aria-label="إغلاق القائمة الجانبية"
      tabindex="0"
      @keydown.enter="closeSidebar"
      @keydown.escape="closeSidebar"
    />

    <!-- إشعارات Toast -->
    <Teleport to="body">
      <div 
        v-if="notifications.length > 0"
        class="layout__notifications"
        aria-live="polite"
        aria-atomic="false"
      >
        <transition-group name="notification" tag="div">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification"
            :class="`notification--${notification.type}`"
            role="alert"
          >
            <BaseIcon 
              :name="getNotificationIcon(notification.type)" 
              class="notification__icon"
            />
            <div class="notification__content">
              <div class="notification__title">{{ notification.title }}</div>
              <div 
                v-if="notification.message"
                class="notification__message"
              >
                {{ notification.message }}
              </div>
            </div>
            <button
              class="notification__close"
              @click="dismissNotification(notification.id)"
              :aria-label="`إغلاق إشعار: ${notification.title}`"
            >
              <BaseIcon name="close" />
            </button>
          </div>
        </transition-group>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBreakpoints, useLocalStorage, usePreferredColorScheme } from '@vueuse/core'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import AppFooter from './AppFooter.vue'
import BaseIcon from '../ui/BaseIcon.vue'

// ===============================
// 🏷️ INTERFACES
// ===============================

interface MenuItem {
  id: string
  label: string
  icon: string
  route?: string
  href?: string
  children?: MenuItem[]
  badge?: string | number
  disabled?: boolean
  permission?: string
}

interface MenuSection {
  title?: string
  items: MenuItem[]
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

interface Brand {
  id: string
  name: string
  logo?: string
}

interface NavigationItem {
  label: string
  route: string
}

interface Breadcrumb {
  label: string
  route?: string
}

interface SearchResult {
  id: string
  title: string
  subtitle: string
  icon: string
  route?: string
  action?: () => void
}

interface QuickAction {
  id: string
  label: string
  icon: string
  action: string
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface GlobalError {
  title?: string
  message: string
  retry?: boolean
}

// ===============================
// 🎛️ COMPONENT PROPS
// ===============================

interface MainLayoutProps {
  // التخطيط العام
  variant?: 'default' | 'fluid' | 'boxed'
  
  // القائمة الجانبية
  showSidebar?: boolean
  sidebarVariant?: 'default' | 'floating' | 'minimal'
  sidebarDefaultOpen?: boolean
  sidebarDefaultCompact?: boolean
  showSidebarToggle?: boolean
  
  // الشريط العلوي
  showTopbar?: boolean
  topbarVariant?: 'default' | 'transparent' | 'compact' | 'elevated'
  showSearch?: boolean
  showNavigation?: boolean
  showBreadcrumb?: boolean
  showNotifications?: boolean
  
  // التذييل
  showFooter?: boolean
  footerVariant?: 'default' | 'minimal' | 'extended'
  showFooterContact?: boolean
  showVersion?: boolean
  
  // البيانات
  currentUser?: User
  currentBrand?: Brand
  menuSections?: MenuSection[]
  navigationItems?: NavigationItem[]
  breadcrumbs?: Breadcrumb[]
  searchResults?: SearchResult[]
  quickActions?: QuickAction[]
  
  // الحالة
  globalLoading?: boolean
  loadingText?: string
  globalError?: GlobalError | null
  notificationCount?: number
  
  // التخصيص
  brandName?: string
  brandLogo?: string
  appVersion?: string
  theme?: 'light' | 'dark' | 'auto'
  pageTransition?: string
  showBrandInfo?: boolean
  searchPlaceholder?: string
}

const props = withDefaults(defineProps<MainLayoutProps>(), {
  variant: 'default',
  showSidebar: true,
  sidebarVariant: 'default',
  sidebarDefaultOpen: true,
  sidebarDefaultCompact: false,
  showSidebarToggle: true,
  showTopbar: true,
  topbarVariant: 'default',
  showSearch: true,
  showNavigation: true,
  showBreadcrumb: true,
  showNotifications: true,
  showFooter: true,
  footerVariant: 'default',
  showFooterContact: true,
  showVersion: false,
  menuSections: () => [],
  navigationItems: () => [],
  breadcrumbs: () => [],
  searchResults: () => [],
  quickActions: () => [],
  globalLoading: false,
  loadingText: 'جاري التحميل...',
  globalError: null,
  notificationCount: 0,
  brandName: 'Depth Studio',
  brandLogo: 'camera-outline',
  appVersion: '1.0.0',
  theme: 'auto',
  pageTransition: 'fade',
  showBrandInfo: true,
  searchPlaceholder: 'البحث...'
})

// ===============================
// 🎯 COMPONENT EVENTS
// ===============================

interface MainLayoutEmits {
  'user-action': [action: any]
  'sidebar-item-click': [item: MenuItem]
  'search': [query: string]
  'search-result-click': [result: SearchResult]
  'quick-action': [action: QuickAction]
  'notifications-toggle': [open: boolean]
  'logout': []
  'footer-action': [action: string]
  'error-retry': []
}

const emit = defineEmits<MainLayoutEmits>()

// ===============================
// 🧩 COMPOSABLES
// ===============================

const route = useRoute()
const router = useRouter()
const breakpoints = useBreakpoints({
  sm: 576,
  md: 768,
  lg: 1024
})
const preferredScheme = usePreferredColorScheme()

// ===============================
// 🔄 REACTIVE STATE
// ===============================

const sidebarOpen = useLocalStorage('sidebar-open', props.sidebarDefaultOpen)
const sidebarCompact = useLocalStorage('sidebar-compact', props.sidebarDefaultCompact)
const currentThemeStorage = useLocalStorage('theme', props.theme)
const notifications = ref<Notification[]>([])
const notificationCounter = ref(0)

// ===============================
// 💻 COMPUTED PROPERTIES
// ===============================

// Breakpoints
const isMobile = computed(() => breakpoints.smaller('lg'))
const isTablet = computed(() => breakpoints.between('md', 'lg'))

// فئات CSS
const layoutClasses = computed(() => [
  `layout--${props.variant}`,
  {
    'layout--with-sidebar': props.showSidebar,
    'layout--sidebar-open': sidebarOpen.value,
    'layout--sidebar-compact': sidebarCompact.value,
    'layout--mobile': isMobile.value,
    'layout--tablet': isTablet.value
  }
])

const contentClasses = computed(() => [
  {
    'layout__content--loading': props.globalLoading,
    'layout__content--error': props.globalError,
    'layout__content--prose': route.meta?.contentType === 'prose',
    'layout__content--grid': route.meta?.contentType === 'grid',
    'layout__content--flex': route.meta?.contentType === 'flex'
  }
])

// إدارة الثيم
const currentTheme = computed(() => {
  if (currentThemeStorage.value === 'auto') {
    return preferredScheme.value
  }
  return currentThemeStorage.value
})

// خصائص الـ route
const routeProps = computed(() => ({
  // تمرير بيانات إضافية للمكونات
  currentUser: props.currentUser,
  currentBrand: props.currentBrand
}))

// ===============================
// 🎯 METHODS
// ===============================

// معالجات القائمة الجانبية
const handleSidebarItemClick = (item: MenuItem) => {
  emit('sidebar-item-click', item)
}

const handleSidebarToggle = (open: boolean) => {
  sidebarOpen.value = open
}

const handleTopbarSidebarToggle = (open: boolean) => {
  sidebarOpen.value = open
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

// معالجات البحث
const handleSearch = (query: string) => {
  emit('search', query)
}

const handleSearchResultClick = (result: SearchResult) => {
  emit('search-result-click', result)
}

// معالجات المستخدم
const handleUserAction = (action: any) => {
  emit('user-action', action)
}

const handleQuickAction = (action: QuickAction) => {
  emit('quick-action', action)
}

const handleNotificationsToggle = (open: boolean) => {
  emit('notifications-toggle', open)
}

const handleLogout = () => {
  emit('logout')
}

// معالجات التذييل
const handleFooterAction = (action: string) => {
  emit('footer-action', action)
}

// معالجات الأخطاء
const handleErrorRetry = () => {
  emit('error-retry')
}

// إدارة الإشعارات
const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = `notification-${++notificationCounter.value}`
  const newNotification: Notification = {
    ...notification,
    id,
    duration: notification.duration || 5000
  }
  
  notifications.value.push(newNotification)
  
  // إزالة تلقائية
  if (newNotification.duration && newNotification.duration > 0) {
    setTimeout(() => {
      dismissNotification(id)
    }, newNotification.duration)
  }
}

const dismissNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const getNotificationIcon = (type: Notification['type']) => {
  const icons = {
    success: 'check-circle',
    error: 'alert-circle',
    warning: 'alert-triangle',
    info: 'information-outline'
  }
  return icons[type]
}

// تغيير الثيم
const setTheme = (theme: 'light' | 'dark' | 'auto') => {
  currentThemeStorage.value = theme
}

// ===============================
// 🔄 WATCHERS
// ===============================

// إغلاق القائمة الجانبية على الموبايل عند تغيير الصفحة
watch(route, () => {
  if (isMobile.value && sidebarOpen.value) {
    sidebarOpen.value = false
  }
})

// تطبيق الثيم على الـ body
watch(currentTheme, (theme) => {
  document.documentElement.setAttribute('data-theme', theme)
}, { immediate: true })

// ===============================
// 🎪 LIFECYCLE HOOKS
// ===============================

onMounted(() => {
  // تطبيق إعدادات القائمة الجانبية حسب حجم الشاشة
  if (isMobile.value) {
    sidebarOpen.value = false
  }
})

// ===============================
// 🎁 PROVIDE/INJECT
// ===============================

// توفير دوال مفيدة للمكونات الفرعية
provide('addNotification', addNotification)
provide('setTheme', setTheme)
provide('currentTheme', currentTheme)
provide('isMobile', isMobile)
provide('isTablet', isTablet)
</script>

<style lang="scss">
/* تم استيراد الأنماط من layouts/_main.scss */

// أنماط إضافية للتحكم في الانتقالات
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

// أنماط الإشعارات
.layout__notifications {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 9999;
  pointer-events: none;
  
  [dir="rtl"] & {
    right: auto;
    left: var(--spacing-lg);
  }
}

.notification {
  @include flex-start(row, var(--spacing-sm));
  background: var(--color-surface);
  border: 1px solid var(--color-divider);
  @include border-radius("md");
  @include elevation(3);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  min-width: 300px;
  max-width: 400px;
  pointer-events: all;
  
  &--success {
    border-left: 4px solid var(--color-success);
    
    [dir="rtl"] & {
      border-left: none;
      border-right: 4px solid var(--color-success);
    }
  }
  
  &--error {
    border-left: 4px solid var(--color-error);
    
    [dir="rtl"] & {
      border-left: none;
      border-right: 4px solid var(--color-error);
    }
  }
  
  &--warning {
    border-left: 4px solid var(--color-warning);
    
    [dir="rtl"] & {
      border-left: none;
      border-right: 4px solid var(--color-warning);
    }
  }
  
  &--info {
    border-left: 4px solid var(--color-info);
    
    [dir="rtl"] & {
      border-left: none;
      border-right: 4px solid var(--color-info);
    }
  }
  
  &__icon {
    @include size(20px);
    flex-shrink: 0;
  }
  
  &__content {
    flex: 1;
    min-width: 0;
  }
  
  &__title {
    @include text-style("body");
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
    margin-bottom: var(--spacing-xs);
  }
  
  &__message {
    @include text-style("body-small");
    color: var(--color-text-secondary);
  }
  
  &__close {
    @include size(24px);
    @include flex-center;
    background: none;
    border: none;
    @include border-radius("sm");
    color: var(--color-text-hint);
    cursor: pointer;
    @include transition(all, "fast");
    
    &:hover {
      background: var(--color-surface-variant);
      color: var(--color-text-secondary);
    }
  }
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style> 