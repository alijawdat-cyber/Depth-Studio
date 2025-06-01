<!--
  ==============================================
  DEPTH STUDIO - مكون الزر الأساسي
  Base Button Component
  ==============================================
-->

<template>
  <component
    :is="tag"
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    :href="href"
    :to="to"
    @click="handleClick"
    v-bind="$attrs"
  >
    <!-- أيقونة البداية -->
    <Icon
      v-if="prependIcon && !loading"
      :name="prependIcon"
      :size="iconSize"
      class="btn__icon btn__icon--prepend"
    />
    
    <!-- مؤشر التحميل -->
    <div
      v-if="loading"
      class="btn__loading"
    >
      <Icon
        name="loading"
        :size="iconSize"
        class="btn__loading-icon"
      />
    </div>
    
    <!-- محتوى الزر -->
    <span
      v-if="$slots.default"
      class="btn__content"
      :class="{ 'btn__content--hidden': loading }"
    >
      <slot />
    </span>
    
    <!-- أيقونة النهاية -->
    <Icon
      v-if="appendIcon && !loading"
      :name="appendIcon"
      :size="iconSize"
      class="btn__icon btn__icon--append"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import type { Component } from 'vue'
import Icon from './BaseIcon.vue'

export interface ButtonProps {
  // نوع الزر
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal'
  // لون الزر
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'surface'
  // حجم الزر
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  // شكل الزر
  shape?: 'rounded' | 'pill' | 'square'
  // عرض كامل
  block?: boolean
  // حالة الإعاقة
  disabled?: boolean
  // حالة التحميل
  loading?: boolean
  // أيقونة البداية
  prependIcon?: string
  // أيقونة النهاية
  appendIcon?: string
  // زر أيقونة فقط
  icon?: boolean
  // نوع HTML
  type?: 'button' | 'submit' | 'reset'
  // رابط خارجي
  href?: string
  // رابط داخلي (Vue Router)
  to?: string | object
  // هدف الرابط
  target?: string
  // تفعيل التدرج
  gradient?: boolean
  // تفعيل التوهج
  glow?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'filled',
  color: 'primary',
  size: 'md',
  shape: 'rounded',
  block: false,
  disabled: false,
  loading: false,
  icon: false,
  type: 'button',
  gradient: false,
  glow: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const attrs = useAttrs()

// تحديد العنصر المناسب
const tag = computed((): string | Component => {
  if (props.href) return 'a'
  if (props.to) return 'router-link'
  return 'button'
})

// حساب حجم الأيقونة
const iconSize = computed(() => {
  const sizeMap = {
    xs: '14',
    sm: '16', 
    md: '18',
    lg: '20',
    xl: '24'
  }
  return sizeMap[props.size]
})

// حساب فئات CSS
const buttonClasses = computed(() => [
  'btn',
  `btn--${props.variant}`,
  `btn--${props.color}`,
  `btn--${props.size}`,
  `btn--${props.shape}`,
  {
    'btn--block': props.block,
    'btn--disabled': props.disabled,
    'btn--loading': props.loading,
    'btn--icon': props.icon,
    'btn--gradient': props.gradient,
    'btn--glow': props.glow
  }
])

// معالج النقر
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<style lang="scss" scoped>
@import '@/styles/foundation/variables';
@import '@/styles/utilities/mixins';

.btn {
  // الأساسيات
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  
  // النص والخط
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  
  // التفاعل
  cursor: pointer;
  user-select: none;
  border: none;
  outline: none;
  
  // الحركات
  @include transition(all, "fast");
  
  // التركيز
  &:focus-visible {
    @include focus-effect;
  }
  
  // التأثيرات التفاعلية
  &:not(.btn--disabled):not(.btn--loading) {
    &:hover {
      @include hover-effect(1.02);
    }
    
    &:active {
      @include active-effect(0.98);
    }
  }
  
  // ===============================
  // 📏 SIZES - الأحجام
  // ===============================
  
  &--xs {
    padding: var(--spacing-xs) var(--spacing-sm);
    @include text-style("caption");
    min-height: 2rem;
    @include border-radius("sm");
    
    &.btn--icon {
      @include size(2rem);
      padding: 0;
    }
  }
  
  &--sm {
    padding: var(--spacing-sm) var(--spacing-md);
    @include text-style("body-small");
    min-height: 2.25rem;
    @include border-radius("sm");
    
    &.btn--icon {
      @include size(2.25rem);
      padding: 0;
    }
  }
  
  &--md {
    padding: var(--spacing-sm) var(--spacing-lg);
    @include text-style("body");
    min-height: 2.5rem;
    @include border-radius("md");
    
    &.btn--icon {
      @include size(2.5rem);
      padding: 0;
    }
  }
  
  &--lg {
    padding: var(--spacing-md) var(--spacing-xl);
    @include text-style("body-large");
    min-height: 3rem;
    @include border-radius("md");
    
    &.btn--icon {
      @include size(3rem);
      padding: 0;
    }
  }
  
  &--xl {
    padding: var(--spacing-lg) var(--spacing-2xl);
    @include text-style("heading-6");
    min-height: 3.5rem;
    @include border-radius("lg");
    
    &.btn--icon {
      @include size(3.5rem);
      padding: 0;
    }
  }
  
  // ===============================
  // 🎨 VARIANTS - الأنواع
  // ===============================
  
  // النوع المملوء
  &--filled {
    &.btn--primary {
      background-color: var(--color-primary);
      color: var(--color-on-primary);
      
      &:hover:not(.btn--disabled) {
        background-color: var(--color-primary-variant);
      }
    }
    
    &.btn--secondary {
      background-color: var(--color-secondary);
      color: var(--color-on-secondary);
      
      &:hover:not(.btn--disabled) {
        background-color: var(--color-secondary-variant);
      }
    }
    
    &.btn--success {
      background-color: var(--color-success);
      color: var(--color-on-success);
    }
    
    &.btn--warning {
      background-color: var(--color-warning);
      color: var(--color-on-warning);
    }
    
    &.btn--error {
      background-color: var(--color-error);
      color: var(--color-on-error);
    }
    
    &.btn--surface {
      background-color: var(--color-surface-variant);
      color: var(--color-text-primary);
    }
  }
  
  // النوع المحاط
  &--outlined {
    background-color: transparent;
    border: 1px solid currentColor;
    
    &.btn--primary {
      color: var(--color-primary);
      border-color: var(--color-primary);
      
      &:hover:not(.btn--disabled) {
        background-color: var(--color-primary);
        color: var(--color-on-primary);
      }
    }
    
    &.btn--secondary {
      color: var(--color-secondary);
      border-color: var(--color-secondary);
      
      &:hover:not(.btn--disabled) {
        background-color: var(--color-secondary);
        color: var(--color-on-secondary);
      }
    }
  }
  
  // النوع النصي
  &--text {
    background-color: transparent;
    
    &.btn--primary {
      color: var(--color-primary);
      
      &:hover:not(.btn--disabled) {
        background-color: var(--color-hover);
      }
    }
    
    &.btn--secondary {
      color: var(--color-secondary);
      
      &:hover:not(.btn--disabled) {
        background-color: var(--color-hover);
      }
    }
  }
  
  // النوع المرتفع
  &--elevated {
    @include elevation(2);
    
    &:hover:not(.btn--disabled) {
      @include elevation(4);
    }
    
    &.btn--primary {
      background-color: var(--color-primary);
      color: var(--color-on-primary);
    }
  }
  
  // النوع الطيفي
  &--tonal {
    &.btn--primary {
      background-color: var(--color-primary-container);
      color: var(--color-primary);
    }
    
    &.btn--secondary {
      background-color: var(--color-secondary-container);
      color: var(--color-secondary);
    }
  }
  
  // ===============================
  // 🔘 SHAPES - الأشكال
  // ===============================
  
  &--rounded {
    // استخدام border-radius المحدد في الحجم
  }
  
  &--pill {
    border-radius: 50px;
  }
  
  &--square {
    border-radius: 0;
  }
  
  // ===============================
  // 🎭 SPECIAL EFFECTS
  // ===============================
  
  &--gradient {
    &.btn--primary {
      @include gradient(135deg, var(--color-primary), var(--color-primary-variant));
    }
  }
  
  &--glow {
    &.btn--primary {
      @include glow-effect(var(--color-primary));
    }
  }
  
  // ===============================
  // 📏 LAYOUT - التخطيط
  // ===============================
  
  &--block {
    display: flex;
    width: 100%;
  }
  
  &--icon {
    @include flex-center;
    flex-shrink: 0;
  }
  
  // ===============================
  // 🔄 STATES - الحالات
  // ===============================
  
  &--disabled {
    @include disabled-effect;
  }
  
  &--loading {
    pointer-events: none;
  }
}

// ===============================
// 🔧 BUTTON ELEMENTS
// ===============================

.btn__content {
  @include transition(opacity, "fast");
  
  &--hidden {
    opacity: 0;
  }
}

.btn__icon {
  display: flex;
  flex-shrink: 0;
  
  &--prepend {
    margin-left: calc(var(--spacing-xs) * -0.5);
  }
  
  &--append {
    margin-right: calc(var(--spacing-xs) * -0.5);
  }
}

.btn__loading {
  position: absolute;
  @include flex-center;
}

.btn__loading-icon {
  @include transition(transform, "base");
  animation: btn-spin 1s linear infinite;
}

@keyframes btn-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// ===============================
// 📱 RESPONSIVE
// ===============================

@include mobile-layout {
  .btn {
    &--lg {
      padding: var(--spacing-sm) var(--spacing-lg);
      min-height: 2.75rem;
    }
    
    &--xl {
      padding: var(--spacing-md) var(--spacing-xl);
      min-height: 3rem;
    }
  }
}
</style> 