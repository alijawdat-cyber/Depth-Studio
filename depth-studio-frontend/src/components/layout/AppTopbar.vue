<!--
==============================================
DEPTH STUDIO - مكون الشريط العلوي
App Topbar Component
==============================================
-->

<template>
  <header 
    class="topbar" 
    :class="topbarClasses"
    role="banner"
  >
    <!-- العلامة التجارية -->
    <router-link 
      to="/" 
      class="topbar__brand"
      :aria-label="`الانتقال إلى الصفحة الرئيسية - ${brandName}`"
    >
      <BaseIcon 
        :name="brandLogo" 
        class="topbar__brand-logo"
      />
      <span class="topbar__brand-text">{{ brandName }}</span>
    </router-link>

    <!-- شريط البحث -->
    <div 
      v-if="showSearch" 
      class="topbar__search"
      role="search"
    >
      <BaseIcon 
        name="magnify" 
        class="topbar__search-icon"
      />
      <input
        v-model="searchQuery"
        type="text"
        class="topbar__search-input"
        :placeholder="searchPlaceholder"
        :aria-label="searchAriaLabel"
        @focus="handleSearchFocus"
        @blur="handleSearchBlur"
        @input="handleSearchInput"
        @keydown.escape="handleSearchEscape"
      />
      <button
        v-if="searchQuery"
        class="topbar__search-clear"
        :aria-label="clearSearchAriaLabel"
        @click="handleSearchClear"
      >
        <BaseIcon name="close" />
      </button>
      
      <!-- نتائج البحث -->
      <div 
        v-if="showSearchResults" 
        class="topbar__search-results"
        role="listbox"
      >
        <div 
          v-if="searchResults.length === 0 && searchQuery"
          class="topbar__search-results-empty"
        >
          لا توجد نتائج لـ "{{ searchQuery }}"
        </div>
        <div
          v-for="(result, index) in searchResults"
          :key="index"
          class="topbar__search-results-item"
          role="option"
          :aria-selected="false"
          @click="handleSearchResultClick(result)"
        >
          <BaseIcon 
            :name="result.icon" 
            class="topbar__search-results-item-icon"
          />
          <div class="topbar__search-results-item-content">
            <div class="title">{{ result.title }}</div>
            <div class="subtitle">{{ result.subtitle }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- التنقل -->
    <nav 
      v-if="showNavigation" 
      class="topbar__nav"
      role="navigation"
      aria-label="التنقل الثانوي"
    >
      <router-link
        v-for="(item, index) in navigationItems"
        :key="index"
        :to="item.route"
        class="topbar__nav-item"
        :class="{ 'topbar__nav-item--active': isNavItemActive(item.route) }"
      >
        {{ item.label }}
      </router-link>
    </nav>

    <!-- مسار التنقل -->
    <nav 
      v-if="showBreadcrumb && breadcrumbs.length > 0" 
      class="topbar__breadcrumb"
      aria-label="مسار التنقل"
    >
      <div
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
        class="topbar__breadcrumb-item"
        :class="{ 'topbar__breadcrumb-item--current': index === breadcrumbs.length - 1 }"
      >
        <router-link 
          v-if="crumb.route && index < breadcrumbs.length - 1"
          :to="crumb.route"
        >
          {{ crumb.label }}
        </router-link>
        <span v-else>{{ crumb.label }}</span>
      </div>
    </nav>

    <!-- الإجراءات -->
    <div class="topbar__actions">
      <!-- زر البحث للموبايل -->
      <button
        v-if="!showSearch && isMobile"
        class="topbar__action-btn"
        :aria-label="mobileSearchAriaLabel"
        @click="handleMobileSearchToggle"
      >
        <BaseIcon name="magnify" />
      </button>

      <!-- الإشعارات -->
      <button
        v-if="showNotifications"
        class="topbar__action-btn topbar__action-btn--notifications"
        :aria-label="notificationsAriaLabel"
        @click="handleNotificationsToggle"
      >
        <BaseIcon name="bell-outline" />
        <span 
          v-if="notificationCount > 0"
          class="topbar__badge"
          :class="{ 'topbar__badge--count': notificationCount > 0 }"
        >
          {{ notificationCount > 99 ? '99+' : notificationCount }}
        </span>
      </button>

      <!-- إعدادات سريعة -->
      <button
        v-for="(action, index) in quickActions"
        :key="index"
        class="topbar__action-btn"
        :aria-label="action.label"
        @click="handleQuickAction(action)"
      >
        <BaseIcon :name="action.icon" />
      </button>

      <!-- معلومات المستخدم -->
      <div 
        class="topbar__user"
        :class="{ 'topbar__user--open': userMenuOpen }"
        @click="handleUserMenuToggle"
        role="button"
        :aria-expanded="userMenuOpen"
        :aria-label="userMenuAriaLabel"
        tabindex="0"
        @keydown.enter="handleUserMenuToggle"
        @keydown.space.prevent="handleUserMenuToggle"
      >
        <div class="topbar__user-avatar">
          <img 
            v-if="currentUser?.avatar" 
            :src="currentUser.avatar" 
            :alt="`صورة ${currentUser.name}`"
          />
          <span v-else>{{ userInitials }}</span>
        </div>
        
        <div class="topbar__user-info">
          <div class="name">{{ currentUser?.name }}</div>
          <div class="role">{{ currentUserRole }}</div>
        </div>
        
        <BaseIcon 
          name="chevron-down" 
          class="topbar__user-dropdown"
        />
        
        <!-- قائمة المستخدم المنسدلة -->
        <div 
          v-if="userMenuOpen"
          class="topbar__user-menu"
          role="menu"
        >
          <div 
            v-for="(action, index) in userActions" 
            :key="index"
            class="topbar__user-menu-item"
            :class="{ 'topbar__user-menu-item--danger': action.danger }"
            role="menuitem"
            tabindex="0"
            @click="handleUserAction(action)"
            @keydown.enter="handleUserAction(action)"
          >
            <BaseIcon 
              :name="action.icon" 
              class="topbar__user-menu-item-icon"
            />
            <span class="topbar__user-menu-item-text">{{ action.label }}</span>
          </div>
          
          <div class="topbar__user-menu-divider"></div>
          
          <div 
            class="topbar__user-menu-item topbar__user-menu-item--danger"
            role="menuitem"
            tabindex="0"
            @click="handleLogout"
            @keydown.enter="handleLogout"
          >
            <BaseIcon 
              name="logout" 
              class="topbar__user-menu-item-icon"
            />
            <span class="topbar__user-menu-item-text">تسجيل الخروج</span>
          </div>
        </div>
      </div>
    </div>

    <!-- زر القائمة للموبايل -->
    <button
      class="topbar__mobile-menu"
      :class="{ 'topbar__mobile-menu--open': sidebarOpen }"
      :aria-label="mobileMenuAriaLabel"
      @click="handleMobileMenuToggle"
    >
      <div class="topbar__mobile-menu-icon">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBreakpoints } from '@vueuse/core'
import BaseIcon from '../ui/BaseIcon.vue'

// ===============================
// 🏷️ COMPONENT INTERFACES
// ===============================

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

interface UserAction {
  id: string
  label: string
  icon: string
  action: string
  danger?: boolean
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
}

// ===============================
// 🎛️ COMPONENT PROPS
// ===============================

interface TopbarProps {
  // العرض والإعدادات
  variant?: 'default' | 'transparent' | 'compact' | 'elevated'
  sidebarOpen?: boolean
  
  // البيانات
  currentUser?: User
  navigationItems?: NavigationItem[]
  breadcrumbs?: Breadcrumb[]
  
  // البحث
  showSearch?: boolean
  searchPlaceholder?: string
  searchResults?: SearchResult[]
  
  // الميزات
  showNavigation?: boolean
  showBreadcrumb?: boolean
  showNotifications?: boolean
  notificationCount?: number
  quickActions?: QuickAction[]
  
  // التخصيص
  brandName?: string
  brandLogo?: string
  theme?: 'light' | 'dark' | 'auto'
}

const props = withDefaults(defineProps<TopbarProps>(), {
  variant: 'default',
  sidebarOpen: false,
  navigationItems: () => [],
  breadcrumbs: () => [],
  showSearch: true,
  searchPlaceholder: 'البحث...',
  searchResults: () => [],
  showNavigation: true,
  showBreadcrumb: true,
  showNotifications: true,
  notificationCount: 0,
  quickActions: () => [],
  brandName: 'Depth Studio',
  brandLogo: 'camera-outline',
  theme: 'auto'
})

// ===============================
// 🎯 COMPONENT EVENTS
// ===============================

interface TopbarEmits {
  'search': [query: string]
  'search-result-click': [result: SearchResult]
  'user-action': [action: UserAction]
  'quick-action': [action: QuickAction]
  'sidebar-toggle': [open: boolean]
  'notifications-toggle': [open: boolean]
  'logout': []
}

const emit = defineEmits<TopbarEmits>()

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

// ===============================
// 🔄 REACTIVE STATE
// ===============================

const searchQuery = ref('')
const searchFocused = ref(false)
const userMenuOpen = ref(false)
const showSearchResults = ref(false)
const mobileSearchOpen = ref(false)

// ===============================
// 💻 COMPUTED PROPERTIES
// ===============================

// Breakpoints
const isMobile = computed(() => breakpoints.smaller('lg'))
const isTablet = computed(() => breakpoints.between('md', 'lg'))

// فئات CSS
const topbarClasses = computed(() => [
  `topbar--${props.variant}`,
  {
    'topbar--search-focused': searchFocused.value,
    'topbar--mobile-search-open': mobileSearchOpen.value
  }
])

// معلومات المستخدم
const currentUserRole = computed(() => props.currentUser?.role || 'مستخدم')
const userInitials = computed(() => {
  if (!props.currentUser?.name) return 'U'
  return props.currentUser.name
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// تسميات إمكانية الوصول
const searchAriaLabel = computed(() => `البحث في ${props.brandName}`)
const clearSearchAriaLabel = computed(() => 'مسح البحث')
const mobileSearchAriaLabel = computed(() => 'فتح البحث')
const notificationsAriaLabel = computed(() => 
  `الإشعارات${props.notificationCount > 0 ? ` (${props.notificationCount} جديد)` : ''}`
)
const userMenuAriaLabel = computed(() => 
  `قائمة المستخدم ${props.currentUser?.name || ''} - ${userMenuOpen.value ? 'مفتوحة' : 'مغلقة'}`
)
const mobileMenuAriaLabel = computed(() => 
  `${props.sidebarOpen ? 'إغلاق' : 'فتح'} القائمة الجانبية`
)

// إجراءات المستخدم
const userActions = computed<UserAction[]>(() => [
  {
    id: 'profile',
    label: 'الملف الشخصي',
    icon: 'account-circle',
    action: 'profile'
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    icon: 'cog',
    action: 'settings'
  },
  {
    id: 'help',
    label: 'المساعدة',
    icon: 'help-circle',
    action: 'help'
  }
])

// ===============================
// 🎯 METHODS
// ===============================

const isNavItemActive = (itemRoute: string) => {
  return route.path === itemRoute || route.path.startsWith(itemRoute + '/')
}

const handleSearchFocus = () => {
  searchFocused.value = true
  showSearchResults.value = true
}

const handleSearchBlur = () => {
  // تأخير لإعطاء الوقت للنقر على النتائج
  setTimeout(() => {
    searchFocused.value = false
    showSearchResults.value = false
  }, 200)
}

const handleSearchInput = () => {
  emit('search', searchQuery.value)
}

const handleSearchEscape = () => {
  searchQuery.value = ''
  showSearchResults.value = false
}

const handleSearchClear = () => {
  searchQuery.value = ''
  emit('search', '')
}

const handleSearchResultClick = (result: SearchResult) => {
  emit('search-result-click', result)
  showSearchResults.value = false
  
  if (result.route) {
    router.push(result.route)
  } else if (result.action) {
    result.action()
  }
}

const handleMobileSearchToggle = () => {
  mobileSearchOpen.value = !mobileSearchOpen.value
}

const handleUserMenuToggle = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const handleUserAction = (action: UserAction) => {
  emit('user-action', action)
  userMenuOpen.value = false
  
  // تنفيذ الإجراءات الافتراضية
  switch (action.action) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'help':
      router.push('/help')
      break
  }
}

const handleQuickAction = (action: QuickAction) => {
  emit('quick-action', action)
}

const handleNotificationsToggle = () => {
  emit('notifications-toggle', true)
}

const handleMobileMenuToggle = () => {
  emit('sidebar-toggle', !props.sidebarOpen)
}

const handleLogout = () => {
  emit('logout')
  userMenuOpen.value = false
}

const handleClickOutside = (event: Event) => {
  if (userMenuOpen.value) {
    userMenuOpen.value = false
  }
  if (showSearchResults.value) {
    showSearchResults.value = false
  }
}

// ===============================
// 🔄 WATCHERS
// ===============================

watch(searchQuery, (newQuery) => {
  if (newQuery.length > 0) {
    showSearchResults.value = true
  }
})

// ===============================
// 🎪 LIFECYCLE HOOKS
// ===============================

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss">
/* تم استيراد الأنماط من layouts/_topbar.scss */
</style> 