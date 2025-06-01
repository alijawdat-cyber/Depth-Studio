<!--
  ==============================================
  DEPTH STUDIO - مكون التنبيه الأساسي
  Base Alert Component
  ==============================================
-->

<template>
  <Transition
    :name="transition"
    appear
  >
    <div
      v-if="isVisible"
      :class="alertClasses"
      :role="role"
      :aria-live="ariaLive"
      :aria-atomic="true"
    >
      <!-- أيقونة التنبيه -->
      <div
        v-if="showIcon"
        class="alert__icon"
      >
        <slot name="icon">
          <Icon
            :name="iconName"
            :size="iconSize"
            class="alert__icon-element"
          />
        </slot>
      </div>

      <!-- محتوى التنبيه -->
      <div class="alert__content">
        <!-- العنوان -->
        <div
          v-if="title || $slots.title"
          class="alert__title"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </div>

        <!-- النص الرئيسي -->
        <div
          v-if="text || $slots.default"
          class="alert__text"
        >
          <slot>
            {{ text }}
          </slot>
        </div>

        <!-- الأدوات -->
        <div
          v-if="showActions"
          class="alert__actions"
        >
          <slot name="actions">
            <BaseButton
              v-if="confirmText"
              :variant="confirmVariant"
              :color="color"
              :size="buttonSize"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </BaseButton>
            
            <BaseButton
              v-if="cancelText"
              variant="text"
              :color="color"
              :size="buttonSize"
              @click="handleCancel"
            >
              {{ cancelText }}
            </BaseButton>
          </slot>
        </div>
      </div>

      <!-- زر الإغلاق -->
      <div
        v-if="closable"
        class="alert__close"
      >
        <BaseButton
          variant="text"
          size="sm"
          icon
          @click="handleClose"
          :aria-label="closeAriaLabel"
          class="alert__close-btn"
        >
          <Icon name="close" size="16" />
        </BaseButton>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import BaseButton from './BaseButton.vue'
import Icon from './BaseIcon.vue'

export interface AlertProps {
  // التحكم في الظهور
  modelValue?: boolean
  // المحتوى
  title?: string
  text?: string
  // نوع التنبيه
  type?: 'info' | 'success' | 'warning' | 'error'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  // الشكل والحجم
  variant?: 'filled' | 'outlined' | 'tonal' | 'elevated'
  size?: 'sm' | 'md' | 'lg'
  // العرض
  showIcon?: boolean
  customIcon?: string
  closable?: boolean
  // السلوك
  persistent?: boolean
  autoClose?: boolean
  autoCloseDelay?: number
  // الأدوات
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'filled' | 'outlined' | 'text'
  // إمكانية الوصول
  role?: 'alert' | 'alertdialog' | 'status'
  ariaLive?: 'polite' | 'assertive' | 'off'
  closeAriaLabel?: string
  // التأثيرات
  transition?: string
  dense?: boolean
  border?: boolean
  prominent?: boolean
}

const props = withDefaults(defineProps<AlertProps>(), {
  modelValue: true,
  type: 'info',
  variant: 'filled',
  size: 'md',
  showIcon: true,
  closable: false,
  persistent: false,
  autoClose: false,
  autoCloseDelay: 5000,
  confirmVariant: 'filled',
  role: 'alert',
  ariaLive: 'polite',
  closeAriaLabel: 'إغلاق التنبيه',
  transition: 'alert',
  dense: false,
  border: false,
  prominent: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'close': []
  'confirm': []
  'cancel': []
}>()

// الحالة المحلية
const isVisible = ref(props.modelValue)
const autoCloseTimer = ref<number | null>(null)

// الحسابات
const color = computed((): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'surface' => {
  if (props.color) {
    // تحويل الألوان إلى الأنواع المدعومة في BaseButton
    switch (props.color) {
      case 'primary': return 'primary'
      case 'secondary': return 'secondary'
      case 'success': return 'success'
      case 'warning': return 'warning'
      case 'error': return 'error'
      case 'info': return 'info'
      default: return 'primary'
    }
  }
  
  const colorMap = {
    info: 'info' as const,
    success: 'success' as const,
    warning: 'warning' as const,
    error: 'error' as const
  }
  
  return colorMap[props.type] || 'info'
})

const iconName = computed(() => {
  if (props.customIcon) return props.customIcon
  
  const iconMap = {
    info: 'info',
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'alert-circle'
  }
  
  return iconMap[props.type] || 'info'
})

const iconSize = computed(() => {
  const sizeMap = {
    sm: '16',
    md: '20',
    lg: '24'
  }
  return sizeMap[props.size]
})

const buttonSize = computed(() => {
  const sizeMap = {
    sm: 'sm',
    md: 'sm',
    lg: 'md'
  }
  return sizeMap[props.size] as 'sm' | 'md'
})

const showActions = computed(() => {
  return props.confirmText || props.cancelText || false
})

// فئات CSS
const alertClasses = computed(() => [
  'alert',
  `alert--${props.type}`,
  `alert--${props.variant}`,
  `alert--${props.size}`,
  {
    'alert--dense': props.dense,
    'alert--border': props.border,
    'alert--prominent': props.prominent,
    'alert--closable': props.closable,
    'alert--with-actions': showActions.value
  }
])

// معالجات الأحداث
const handleClose = () => {
  if (autoCloseTimer.value) {
    clearTimeout(autoCloseTimer.value)
    autoCloseTimer.value = null
  }
  
  isVisible.value = false
  emit('update:modelValue', false)
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
  if (!props.persistent) {
    handleClose()
  }
}

const handleCancel = () => {
  emit('cancel')
  if (!props.persistent) {
    handleClose()
  }
}

// إدارة الإغلاق التلقائي
const setupAutoClose = () => {
  if (props.autoClose && isVisible.value) {
    autoCloseTimer.value = window.setTimeout(() => {
      handleClose()
    }, props.autoCloseDelay)
  }
}

const clearAutoClose = () => {
  if (autoCloseTimer.value) {
    clearTimeout(autoCloseTimer.value)
    autoCloseTimer.value = null
  }
}

// مراقبة التغييرات
watch(() => props.modelValue, (newValue) => {
  isVisible.value = newValue
  
  if (newValue) {
    setupAutoClose()
  } else {
    clearAutoClose()
  }
})

watch(() => props.autoClose, () => {
  if (props.autoClose && isVisible.value) {
    setupAutoClose()
  } else {
    clearAutoClose()
  }
})

watch(() => props.autoCloseDelay, () => {
  if (props.autoClose && isVisible.value) {
    clearAutoClose()
    setupAutoClose()
  }
})

// التهيئة
onMounted(() => {
  if (props.autoClose && isVisible.value) {
    setupAutoClose()
  }
})

// تنظيف عند الإزالة
const cleanup = () => {
  clearAutoClose()
}

// تصدير الطرق
defineExpose({
  close: handleClose,
  isVisible
})
</script>

<style lang="scss" scoped>
@import '@/styles/foundation/variables';
@import '@/styles/utilities/mixins';

// ===============================
// 🚨 ALERT BASE
// ===============================

.alert {
  // الأساسيات
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  @include border-radius("md");
  @include transition(all, "base");
  
  // النص
  word-wrap: break-word;
  
  // ===============================
  // 🎨 VARIANTS - الأنواع
  // ===============================
  
  &--filled {
    color: var(--color-on-surface);
    
    &.alert--info {
      background-color: var(--color-info);
      color: var(--color-on-info);
    }
    
    &.alert--success {
      background-color: var(--color-success);
      color: var(--color-on-success);
    }
    
    &.alert--warning {
      background-color: var(--color-warning);
      color: var(--color-on-warning);
    }
    
    &.alert--error {
      background-color: var(--color-error);
      color: var(--color-on-error);
    }
  }
  
  &--outlined {
    background-color: var(--color-surface);
    border: 2px solid;
    
    &.alert--info {
      border-color: var(--color-info);
      color: var(--color-info);
    }
    
    &.alert--success {
      border-color: var(--color-success);
      color: var(--color-success);
    }
    
    &.alert--warning {
      border-color: var(--color-warning);
      color: var(--color-warning);
    }
    
    &.alert--error {
      border-color: var(--color-error);
      color: var(--color-error);
    }
  }
  
  &--tonal {
    &.alert--info {
      background-color: var(--color-info-container);
      color: var(--color-info);
    }
    
    &.alert--success {
      background-color: var(--color-success-container);
      color: var(--color-success);
    }
    
    &.alert--warning {
      background-color: var(--color-warning-container);
      color: var(--color-warning);
    }
    
    &.alert--error {
      background-color: var(--color-error-container);
      color: var(--color-error);
    }
  }
  
  &--elevated {
    @include elevation(2);
    background-color: var(--color-surface);
    
    &.alert--info {
      color: var(--color-info);
    }
    
    &.alert--success {
      color: var(--color-success);
    }
    
    &.alert--warning {
      color: var(--color-warning);
    }
    
    &.alert--error {
      color: var(--color-error);
    }
  }
  
  // ===============================
  // 📏 SIZES - الأحجام
  // ===============================
  
  &--sm {
    padding: var(--spacing-sm);
    gap: var(--spacing-xs);
    
    .alert__title {
      @include text-style("body-small");
      font-weight: var(--font-weight-semibold);
    }
    
    .alert__text {
      @include text-style("caption");
    }
  }
  
  &--md {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
    
    .alert__title {
      @include text-style("body");
      font-weight: var(--font-weight-semibold);
    }
    
    .alert__text {
      @include text-style("body-small");
    }
  }
  
  &--lg {
    padding: var(--spacing-lg);
    gap: var(--spacing-md);
    
    .alert__title {
      @include text-style("body-large");
      font-weight: var(--font-weight-semibold);
    }
    
    .alert__text {
      @include text-style("body");
    }
  }
  
  // ===============================
  // 🎯 MODIFIERS - المعدلات
  // ===============================
  
  &--dense {
    padding: var(--spacing-sm) var(--spacing-md);
    gap: var(--spacing-xs);
  }
  
  &--border {
    border-left: 4px solid currentColor;
  }
  
  &--prominent {
    @include elevation(4);
    
    .alert__icon {
      transform: scale(1.2);
    }
  }
  
  &--closable {
    padding-left: calc(var(--spacing-md) + 2rem);
  }
  
  &--with-actions {
    .alert__content {
      flex: 1;
    }
  }
}

// ===============================
// 🎭 ALERT ELEMENTS
// ===============================

.alert__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  
  &-element {
    display: block;
  }
}

.alert__content {
  flex: 1;
  min-width: 0;
  
  > *:not(:last-child) {
    margin-bottom: var(--spacing-xs);
  }
}

.alert__title {
  margin: 0;
  line-height: var(--line-height-tight);
}

.alert__text {
  margin: 0;
  line-height: var(--line-height-normal);
  opacity: map-get($opacity, "90");
}

.alert__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  
  @include mobile-layout {
    flex-direction: column;
    align-items: stretch;
  }
}

.alert__close {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
}

.alert__close-btn {
  opacity: map-get($opacity, "70");
  
  &:hover {
    opacity: 1;
  }
}

// ===============================
// 🎬 ANIMATIONS
// ===============================

.alert-enter-active,
.alert-leave-active {
  transition: all var(--transition-duration-base) var(--transition-easing-standard);
}

.alert-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.alert-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

// انتقالات مخصصة
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--transition-duration-base) var(--transition-easing-standard);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-duration-base) var(--transition-easing-standard);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all var(--transition-duration-base) var(--transition-easing-spring);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

// ===============================
// 📱 RESPONSIVE
// ===============================

@include mobile-layout {
  .alert {
    padding: var(--spacing-sm);
    
    &--lg {
      padding: var(--spacing-md);
    }
    
    &--closable {
      padding-left: calc(var(--spacing-sm) + 1.5rem);
    }
  }
  
  .alert__close {
    top: var(--spacing-xs);
    left: var(--spacing-xs);
  }
}

// ===============================
// 🌙 THEME VARIATIONS
// ===============================

[data-theme="dark"] {
  .alert {
    &--elevated {
      @include elevation(3);
    }
  }
}

// ===============================
// 🎯 ACCESSIBILITY
// ===============================

@media (prefers-reduced-motion: reduce) {
  .alert,
  .alert-enter-active,
  .alert-leave-active,
  .slide-down-enter-active,
  .slide-down-leave-active,
  .fade-enter-active,
  .fade-leave-active,
  .scale-enter-active,
  .scale-leave-active {
    transition: none !important;
    animation: none !important;
  }
}

// ===============================
// 📄 PRINT STYLES
// ===============================

@media print {
  .alert {
    border: 1px solid #000 !important;
    background: #fff !important;
    color: #000 !important;
    box-shadow: none !important;
  }
  
  .alert__close {
    display: none !important;
  }
}

// ===============================
// 🔧 UTILITY CLASSES
// ===============================

.alert--inline {
  display: inline-flex;
}

.alert--block {
  display: flex;
  width: 100%;
}

.alert--text-center {
  text-align: center;
  
  .alert__content {
    text-align: center;
  }
}

.alert--no-icon {
  .alert__icon {
    display: none;
  }
}

.alert--icon-top {
  align-items: flex-start;
  
  .alert__icon {
    margin-top: 0;
  }
}
</style> 