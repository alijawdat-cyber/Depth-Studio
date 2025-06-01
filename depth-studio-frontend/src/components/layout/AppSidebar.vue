<!--
==============================================
DEPTH STUDIO - مكون القائمة الجانبية
App Sidebar Component
==============================================
-->

<template>
  <aside 
    class="sidebar" 
    :class="sidebarClasses"
    role="navigation"
    aria-label="التنقل الرئيسي"
  >
    <!-- رأس القائمة الجانبية -->
    <header class="sidebar__header">
      <router-link 
        to="/" 
        class="sidebar__logo"
        :aria-label="`الانتقال إلى الصفحة الرئيسية - ${brandName}`"
      >
        <BaseIcon 
          :name="brandLogo" 
          class="sidebar__logo-icon"
          size="lg"
        />
        <span 
          v-if="!isCompact" 
          class="sidebar__logo-text"
        >
          {{ brandName }}
        </span>
      </router-link>
      
      <!-- معلومات البراند -->
      <div 
        v-if="showBrandInfo && !isCompact" 
        class="sidebar__brand-info"
      >
        <div class="sidebar__brand-info-name">
          {{ currentBrand?.name }}
        </div>
        <div class="sidebar__brand-info-role">
          {{ currentUserRole }}
        </div>
      </div>
    </header>

    <!-- محتوى القائمة -->
    <nav class="sidebar__menu" role="menu">
      <template v-for="(section, sectionIndex) in menuSections" :key="sectionIndex">
        <div class="sidebar__menu-section">
          <!-- عنوان القسم -->
          <h3 
            v-if="section.title && !isCompact" 
            class="sidebar__menu-section-title"
          >
            {{ section.title }}
          </h3>
          
          <!-- عناصر القائمة -->
          <template v-for="(item, itemIndex) in section.items" :key="itemIndex">
            <SidebarMenuItem
              :item="item"
              :is-compact="isCompact"
              :current-route="currentRoute"
              @item-click="handleItemClick"
              @submenu-toggle="handleSubmenuToggle"
            />
          </template>
        </div>
      </template>
    </nav>

    <!-- تذييل القائمة الجانبية -->
    <footer class="sidebar__footer">
      <!-- معلومات المستخدم -->
      <div 
        class="sidebar__user-info"
        @click="handleUserMenuToggle"
        role="button"
        :aria-expanded="userMenuOpen"
        :aria-label="userMenuAriaLabel"
        tabindex="0"
        @keydown.enter="handleUserMenuToggle"
        @keydown.space.prevent="handleUserMenuToggle"
      >
        <div class="sidebar__user-info-avatar">
          <img 
            v-if="currentUser?.avatar" 
            :src="currentUser.avatar" 
            :alt="`صورة ${currentUser.name}`"
          />
          <span v-else>{{ userInitials }}</span>
        </div>
        
        <div 
          v-if="!isCompact" 
          class="sidebar__user-info-details"
        >
          <div class="user-name">{{ currentUser?.name }}</div>
          <div class="user-role">{{ currentUserRole }}</div>
        </div>
      </div>
      
      <!-- قائمة المستخدم المنسدلة -->
      <Teleport to="body">
        <div 
          v-if="userMenuOpen"
          class="sidebar__user-menu"
          role="menu"
          :style="userMenuStyle"
        >
          <div 
            v-for="(action, index) in userActions" 
            :key="index"
            class="sidebar__user-menu-item"
            :class="{ 'sidebar__user-menu-item--danger': action.danger }"
            role="menuitem"
            tabindex="0"
            @click="handleUserAction(action)"
            @keydown.enter="handleUserAction(action)"
          >
            <BaseIcon 
              :name="action.icon" 
              class="sidebar__user-menu-item-icon"
              size="sm"
            />
            <span class="sidebar__user-menu-item-text">{{ action.label }}</span>
          </div>
        </div>
      </Teleport>
    </footer>

    <!-- زر الطي/التوسيع -->
    <button
      v-if="showToggleButton"
      class="sidebar__toggle-btn"
      :aria-label="toggleButtonAriaLabel"
      @click="handleToggle"
    >
      <BaseIcon 
        :name="toggleIcon" 
        size="sm"
      />
    </button>
  </aside>

  <!-- Overlay للموبايل -->
  <div 
    v-if="isOpen && isMobile"
    class="layout-overlay"
    :class="{ 'layout-overlay--active': isOpen }"
    @click="handleOverlayClick"
    role="button"
    aria-label="إغلاق القائمة الجانبية"
    tabindex="0"
    @keydown.enter="handleOverlayClick"
    @keydown.escape="handleOverlayClick"
  />
</template>

<script setup lang="ts">
// ==============================================
// 🎯 DEPTH STUDIO - مكون القائمة الجانبية المتقدم
// Advanced Sidebar Component with Professional Error Handling
// ==============================================

import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// Composables with fallback support
import { useBreakpoints, useLocalStorage } from '@vueuse/core'
import BaseIcon from '../ui/BaseIcon.vue'
import SidebarMenuItem from './SidebarMenuItem.vue'

// ===============================
// 🏷️ COMPONENT INTERFACES
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
  onClick?: () => void
}

interface MenuSection {
  title?: string
  items: MenuItem[]
}

interface UserAction {
  id: string
  label: string
  icon: string
  action: string
  danger?: boolean
}

interface Brand {
  id: string
  name: string
  logo?: string
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

interface SidebarProps {
  // حالة القائمة
  isOpen?: boolean
  isCompact?: boolean
  variant?: 'default' | 'floating' | 'minimal'
  
  // البيانات
  menuSections?: MenuSection[]
  currentUser?: User
  currentBrand?: Brand
  
  // الإعدادات
  showBrandInfo?: boolean
  showToggleButton?: boolean
  persistent?: boolean
  resizable?: boolean
  
  // التخصيص
  brandName?: string
  brandLogo?: string
  theme?: 'light' | 'dark' | 'auto'
}

const props = withDefaults(defineProps<SidebarProps>(), {
  isOpen: true,
  isCompact: false,
  variant: 'default',
  menuSections: () => [],
  showBrandInfo: true,
  showToggleButton: true,
  persistent: false,
  resizable: false,
  brandName: 'Depth Studio',
  brandLogo: 'camera-outline',
  theme: 'auto'
})

// ===============================
// 🎯 COMPONENT EVENTS
// ===============================

interface SidebarEmits {
  'update:isOpen': [value: boolean]
  'update:isCompact': [value: boolean]
  'item-click': [item: MenuItem]
  'user-action': [action: UserAction]
  'toggle': [isOpen: boolean]
  'resize': [width: number]
}

const emit = defineEmits<SidebarEmits>()

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

// حالة القائمة
const internalIsOpen = ref(props.isOpen)
const internalIsCompact = ref(props.isCompact)
const userMenuOpen = ref(false)
const sidebarWidth = useLocalStorage('sidebar-width', 280)

// تتبع التفاعل
const isHovering = ref(false)
const isDragging = ref(false)
const resizeStartX = ref(0)
const resizeStartWidth = ref(0)

// ===============================
// 💻 COMPUTED PROPERTIES
// ===============================

// Breakpoints
const isMobile = computed(() => breakpoints.smaller('lg'))
const isTablet = computed(() => breakpoints.between('md', 'lg'))
const isDesktop = computed(() => breakpoints.greaterOrEqual('lg'))

// الحالة النشطة
const isOpen = computed({
  get: () => internalIsOpen.value,
  set: (value: boolean) => {
    internalIsOpen.value = value
    emit('update:isOpen', value)
    emit('toggle', value)
  }
})

const isCompact = computed({
  get: () => internalIsCompact.value,
  set: (value: boolean) => {
    internalIsCompact.value = value
    emit('update:isCompact', value)
  }
})

// فئات CSS
const sidebarClasses = computed(() => [
  {
    'sidebar--compact': isCompact.value,
    'sidebar--collapsed': !isOpen.value,
    'sidebar--floating': props.variant === 'floating' || isMobile.value,
    'sidebar--minimal': props.variant === 'minimal',
    'sidebar--open': isOpen.value,
    'sidebar--hovering': isHovering.value,
    'sidebar--resizing': isDragging.value
  }
])

// المسار الحالي
const currentRoute = computed(() => route.path)

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
const toggleButtonAriaLabel = computed(() => 
  isCompact.value ? 'توسيع القائمة الجانبية' : 'تصغير القائمة الجانبية'
)

const userMenuAriaLabel = computed(() => 
  `قائمة المستخدم ${props.currentUser?.name || ''} - ${userMenuOpen.value ? 'مفتوحة' : 'مغلقة'}`
)

const toggleIcon = computed(() => 
  isCompact.value ? 'chevron-right' : 'chevron-left'
)

// أيقونة القائمة
const userMenuStyle = computed((): Record<string, string | number> => {
  // حساب موقع القائمة المنسدلة
  return {
    position: 'fixed' as const,
    bottom: '80px',
    left: isCompact.value ? '70px' : '290px',
    zIndex: 1000
  }
})

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
  },
  {
    id: 'logout',
    label: 'تسجيل الخروج',
    icon: 'logout',
    action: 'logout',
    danger: true
  }
])

// ===============================
// 🎯 METHODS
// ===============================

// معالج النقر على العنصر
const handleItemClick = (item: MenuItem) => {
  emit('item-click', item)
  
  if (item.route) {
    router.push(item.route)
  } else if (item.href) {
    window.open(item.href, '_blank')
  } else if (item.onClick) {
    item.onClick()
  }
  
  // إغلاق القائمة على الموبايل
  if (isMobile.value) {
    isOpen.value = false
  }
}

// معالج تبديل القائمة الفرعية
const handleSubmenuToggle = (itemId: string, isExpanded: boolean) => {
  // يمكن إضافة منطق لحفظ حالة القوائم الفرعية
  console.log(`Submenu ${itemId} ${isExpanded ? 'expanded' : 'collapsed'}`)
}

// معالج تبديل القائمة
const handleToggle = () => {
  if (isMobile.value) {
    isOpen.value = !isOpen.value
  } else {
    isCompact.value = !isCompact.value
  }
}

// معالج قائمة المستخدم
const handleUserMenuToggle = () => {
  userMenuOpen.value = !userMenuOpen.value
}

// معالج إجراءات المستخدم
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
    case 'logout':
      // منطق تسجيل الخروج
      break
  }
}

// معالج النقر على Overlay
const handleOverlayClick = () => {
  if (isMobile.value) {
    isOpen.value = false
  }
}

// معالجات تغيير الحجم
const handleResizeStart = (event: MouseEvent) => {
  if (!props.resizable) return
  
  isDragging.value = true
  resizeStartX.value = event.clientX
  resizeStartWidth.value = sidebarWidth.value
  
  document.addEventListener('mousemove', handleResizeMove)
  document.addEventListener('mouseup', handleResizeEnd)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

const handleResizeMove = (event: MouseEvent) => {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - resizeStartX.value
  const newWidth = Math.max(200, Math.min(400, resizeStartWidth.value + deltaX))
  
  sidebarWidth.value = newWidth
  emit('resize', newWidth)
}

const handleResizeEnd = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeEnd)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// معالج النقر خارج القائمة
const handleClickOutside = (event: Event) => {
  if (userMenuOpen.value) {
    userMenuOpen.value = false
  }
}

// ===============================
// 🔄 WATCHERS
// ===============================

// مراقبة تغييرات الـ props
watch(() => props.isOpen, (newValue) => {
  internalIsOpen.value = newValue
})

watch(() => props.isCompact, (newValue) => {
  internalIsCompact.value = newValue
})

// مراقبة تغييرات نقطة الانكسار
watch(isMobile, (mobile) => {
  if (mobile) {
    // على الموبايل: إغلاق القائمة افتراضياً
    isOpen.value = false
  } else {
    // على سطح المكتب: فتح القائمة افتراضياً
    isOpen.value = true
  }
})

// ===============================
// 🎪 LIFECYCLE HOOKS
// ===============================

onMounted(() => {
  // إعداد مستمعي الأحداث
  document.addEventListener('click', handleClickOutside)
  
  // تطبيق حجم القائمة المحفوظ
  if (props.resizable) {
    nextTick(() => {
      const sidebar = document.querySelector('.sidebar') as HTMLElement
      if (sidebar) {
        sidebar.style.width = `${sidebarWidth.value}px`
      }
    })
  }
})

onUnmounted(() => {
  // تنظيف مستمعي الأحداث
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('mousemove', handleResizeMove)
  document.removeEventListener('mouseup', handleResizeEnd)
})
</script>

<style lang="scss">
/* تم استيراد الأنماط من layouts/_sidebar.scss */
</style> 