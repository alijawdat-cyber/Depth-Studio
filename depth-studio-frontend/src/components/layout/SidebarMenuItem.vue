<!--
==============================================
DEPTH STUDIO - مكون عنصر القائمة الجانبية
Sidebar Menu Item Component
==============================================
-->

<template>
  <div class="sidebar-menu-item">
    <!-- عنصر القائمة الرئيسي -->
    <component
      :is="itemComponent"
      :to="item.route"
      :href="item.href"
      class="sidebar__menu-item"
      :class="itemClasses"
      :role="item.children ? 'button' : 'menuitem'"
      :aria-expanded="item.children ? isExpanded : undefined"
      :aria-label="item.label"
      :tabindex="item.disabled ? -1 : 0"
      @click="handleClick"
      @keydown.enter="handleClick"
      @keydown.space.prevent="handleClick"
    >
      <!-- أيقونة العنصر -->
      <BaseIcon 
        :name="item.icon" 
        class="sidebar__menu-icon"
        size="sm"
      />
      
      <!-- نص العنصر -->
      <span 
        v-if="!isCompact" 
        class="sidebar__menu-text"
      >
        {{ item.label }}
      </span>
      
      <!-- الشارة -->
      <span 
        v-if="item.badge && !isCompact" 
        class="sidebar__menu-badge"
      >
        {{ item.badge }}
      </span>
      
      <!-- سهم القائمة الفرعية -->
      <BaseIcon 
        v-if="item.children && !isCompact" 
        :name="arrowIcon"
        class="sidebar__menu-arrow"
        size="xs"
      />
    </component>
    
    <!-- القائمة الفرعية -->
    <div 
      v-if="item.children"
      class="sidebar__submenu"
      :class="{ 'sidebar__submenu--expanded': isExpanded }"
    >
      <SidebarMenuItem
        v-for="(child, index) in item.children"
        :key="index"
        :item="child"
        :is-compact="isCompact"
        :current-route="currentRoute"
        @item-click="(item: MenuItem) => emit('item-click', item)"
        @submenu-toggle="(itemId: string, isExpanded: boolean) => emit('submenu-toggle', itemId, isExpanded)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseIcon from '../ui/BaseIcon.vue'

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

// ===============================
// 🎛️ COMPONENT PROPS
// ===============================

interface MenuItemProps {
  item: MenuItem
  isCompact?: boolean
  currentRoute?: string
}

const props = withDefaults(defineProps<MenuItemProps>(), {
  isCompact: false,
  currentRoute: ''
})

// ===============================
// 🎯 COMPONENT EVENTS
// ===============================

interface MenuItemEmits {
  'item-click': [item: MenuItem]
  'submenu-toggle': [itemId: string, isExpanded: boolean]
}

const emit = defineEmits<MenuItemEmits>()

// ===============================
// 🔄 REACTIVE STATE
// ===============================

const isExpanded = ref(false)

// ===============================
// 💻 COMPUTED PROPERTIES
// ===============================

// تحديد نوع المكون
const itemComponent = computed(() => {
  if (props.item.route) return 'router-link'
  if (props.item.href) return 'a'
  return 'button'
})

// فئات CSS للعنصر
const itemClasses = computed(() => [
  {
    'sidebar__menu-item--active': isActive.value,
    'sidebar__menu-item--disabled': props.item.disabled,
    'sidebar__menu-item--has-children': !!props.item.children,
    'sidebar__menu-item--expanded': isExpanded.value
  }
])

// تحديد ما إذا كان العنصر نشطاً
const isActive = computed(() => {
  if (!props.item.route || !props.currentRoute) return false
  return props.currentRoute === props.item.route ||
         props.currentRoute.startsWith(props.item.route + '/')
})

// أيقونة السهم
const arrowIcon = computed(() => 
  isExpanded.value ? 'chevron-down' : 'chevron-right'
)

// ===============================
// 🎯 METHODS
// ===============================

const handleClick = (event: Event) => {
  if (props.item.disabled) return
  
  // إذا كان العنصر يحتوي على قائمة فرعية
  if (props.item.children) {
    event.preventDefault()
    isExpanded.value = !isExpanded.value
    emit('submenu-toggle', props.item.id, isExpanded.value)
    return
  }
  
  // إصدار حدث النقر
  emit('item-click', props.item)
  
  // تنفيذ الإجراء المخصص
  if (props.item.onClick) {
    props.item.onClick()
  }
}
</script>

<style lang="scss">
/* تم استيراد الأنماط من layouts/_sidebar.scss */
</style> 