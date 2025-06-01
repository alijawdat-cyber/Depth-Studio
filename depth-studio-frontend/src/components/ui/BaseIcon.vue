<!--
  ==============================================
  DEPTH STUDIO - مكون الأيقونة الأساسي
  Base Icon Component
  ==============================================
-->

<template>
  <component
    :is="tag"
    :class="iconClasses"
    :style="iconStyles"
    :aria-hidden="decorative"
    :aria-label="ariaLabel"
    :role="role"
    v-bind="$attrs"
  >
    <!-- SVG Icons -->
    <svg
      v-if="isSvgIcon"
      :width="computedSize"
      :height="computedSize"
      :viewBox="viewBox"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path :d="svgPath" :fill="currentColor" />
    </svg>
    
    <!-- Font Icons (Material, FontAwesome, etc.) -->
    <i
      v-else-if="isFontIcon"
      :class="fontIconClass"
    ></i>
    
    <!-- Unicode/Emoji Icons -->
    <span
      v-else-if="isUnicodeIcon"
      class="icon__unicode"
    >
      {{ name }}
    </span>
    
    <!-- Loading/Spinner -->
    <div
      v-else-if="name === 'loading'"
      class="icon__spinner"
    >
      <svg
        :width="computedSize"
        :height="computedSize"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="32"
          stroke-dashoffset="32"
        />
      </svg>
    </div>
    
    <!-- Default/Fallback -->
    <span
      v-else
      class="icon__fallback"
    >
      {{ fallbackText }}
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

export interface IconProps {
  // اسم الأيقونة
  name: string
  // حجم الأيقونة
  size?: string | number
  // لون الأيقونة
  color?: string
  // دوران الأيقونة
  rotate?: number
  // انعكاس أفقي
  flip?: boolean
  // انعكاس عمودي
  flipVertical?: boolean
  // نوع الأيقونة
  type?: 'svg' | 'font' | 'unicode'
  // مكتبة الأيقونات
  library?: 'material' | 'fontawesome' | 'custom'
  // العنصر المناسب
  tag?: string | Component
  // إمكانية الوصول
  decorative?: boolean
  ariaLabel?: string
  // خصائص SVG
  viewBox?: string
  // متغيرات تفاعلية
  clickable?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<IconProps>(), {
  size: '24',
  type: 'svg',
  library: 'material',
  tag: 'span',
  decorative: false,
  viewBox: '0 0 24 24',
  clickable: false,
  disabled: false
})

// خريطة الأيقونات SVG
const svgIcons: Record<string, string> = {
  // أيقونات أساسية
  'home': 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  'menu': 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
  'close': 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  'search': 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  'user': 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  'settings': 'M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z',
  
  // أيقونات التحكم
  'edit': 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  'delete': 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  'save': 'M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z',
  'add': 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  'remove': 'M19 13H5v-2h14v2z',
  
  // أيقونات التنقل
  'arrow-back': 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z',
  'arrow-forward': 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
  'arrow-up': 'M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z',
  'arrow-down': 'M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z',
  'expand-more': 'M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z',
  'expand-less': 'M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z',
  
  // أيقونات الحالة
  'check': 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  'check-circle': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
  'error': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  'warning': 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z',
  'info': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  
  // أيقونات العين
  'eye': 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
  'eye-off': 'M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z',
  
  // أيقونات التنبيه
  'alert-circle': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  'alert-triangle': 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'
}

// حساب نوع الأيقونة
const isSvgIcon = computed(() => {
  return props.type === 'svg' || svgIcons[props.name]
})

const isFontIcon = computed(() => {
  return props.type === 'font'
})

const isUnicodeIcon = computed(() => {
  return props.type === 'unicode'
})

// حساب الحجم
const computedSize = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : props.size
})

// حساب اللون
const currentColor = computed(() => {
  return props.color || 'currentColor'
})

// حساب مسار SVG
const svgPath = computed(() => {
  return svgIcons[props.name] || ''
})

// حساب فئة أيقونة الخط
const fontIconClass = computed(() => {
  const library = props.library
  const iconName = props.name
  
  const libraryPrefixes = {
    material: 'material-icons',
    fontawesome: 'fas fa-'
  }
  
  if (library === 'material') {
    return `${libraryPrefixes.material}`
  } else if (library === 'fontawesome') {
    return `${libraryPrefixes.fontawesome}${iconName}`
  }
  
  return iconName
})

// خصائص إمكانية الوصول
const role = computed(() => {
  return props.decorative ? undefined : 'img'
})

const ariaLabel = computed(() => {
  return props.ariaLabel || (props.decorative ? undefined : props.name)
})

// نص البديل
const fallbackText = computed(() => {
  const fallbacks: Record<string, string> = {
    'loading': '⟳',
    'search': '🔍',
    'user': '👤',
    'home': '🏠',
    'menu': '☰',
    'close': '✕',
    'check': '✓',
    'error': '⚠',
    'warning': '⚠',
    'info': 'ℹ',
    'edit': '✎',
    'delete': '🗑',
    'save': '💾',
    'add': '+',
    'remove': '-'
  }
  
  return fallbacks[props.name] || '?'
})

// فئات CSS
const iconClasses = computed(() => [
  'icon',
  `icon--${props.type}`,
  {
    'icon--clickable': props.clickable,
    'icon--disabled': props.disabled,
    'icon--flip': props.flip,
    'icon--flip-vertical': props.flipVertical
  }
])

// أنماط CSS
const iconStyles = computed(() => {
  const styles: any = {
    fontSize: computedSize.value,
    width: computedSize.value,
    height: computedSize.value
  }
  
  if (props.color) {
    styles.color = props.color
  }
  
  if (props.rotate) {
    styles.transform = `rotate(${props.rotate}deg)`
  }
  
  return styles
})
</script>

<style lang="scss" scoped>
@import '@/styles/foundation/variables';
@import '@/styles/utilities/mixins';

.icon {
  // الأساسيات
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  vertical-align: middle;
  user-select: none;
  
  // الحركات
  @include transition(all, "fast");
  
  // ===============================
  // 🎯 TYPES - الأنواع
  // ===============================
  
  &--svg {
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
  
  &--font {
    font-style: normal;
    line-height: 1;
    
    // Material Icons
    &.material-icons {
      font-family: 'Material Icons';
      font-weight: normal;
      font-style: normal;
      font-size: inherit;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
    }
  }
  
  &--unicode {
    font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif;
    line-height: 1;
  }
  
  // ===============================
  // 🔄 TRANSFORMATIONS - التحويلات
  // ===============================
  
  &--flip {
    transform: scaleX(-1);
  }
  
  &--flip-vertical {
    transform: scaleY(-1);
  }
  
  &--flip.icon--flip-vertical {
    transform: scale(-1, -1);
  }
  
  // ===============================
  // 🎭 INTERACTIVE STATES - الحالات
  // ===============================
  
  &--clickable {
    cursor: pointer;
    @include border-radius("sm");
    padding: 2px;
    
    &:hover {
      background-color: var(--color-hover);
      transform: scale(1.1);
    }
    
    &:focus-visible {
      @include focus-effect;
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
  
  &--disabled {
    opacity: map-get($opacity, "38");
    pointer-events: none;
  }
  
  // ===============================
  // 🔄 SPINNER ANIMATION
  // ===============================
  
  &__spinner {
    svg {
      animation: icon-spin 1s linear infinite;
    }
  }
  
  // ===============================
  // 🎨 SPECIAL EFFECTS
  // ===============================
  
  &__fallback {
    font-weight: bold;
    @include text-style("body");
  }
  
  // عرض محتوى الخط
  &--font.material-icons::before {
    content: attr(data-icon);
  }
}

// ===============================
// 🎬 ANIMATIONS
// ===============================

@keyframes icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// ===============================
// 🎯 ACCESSIBILITY
// ===============================

@media (prefers-reduced-motion: reduce) {
  .icon {
    transition: none !important;
    
    &__spinner svg {
      animation: none !important;
    }
    
    &:hover,
    &:active {
      transform: none !important;
    }
  }
}

// ===============================
// 📄 PRINT STYLES
// ===============================

@media print {
  .icon {
    &__spinner,
    &--clickable {
      display: none !important;
    }
    
    &__fallback {
      color: #000 !important;
    }
  }
}
</style> 