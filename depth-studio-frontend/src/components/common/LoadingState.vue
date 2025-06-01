<!--
==============================================
DEPTH STUDIO - مكون حالة التحميل
Loading State Component
==============================================
-->

<template>
  <div 
    class="loading-state" 
    :class="loadingClasses"
    role="status"
    :aria-label="ariaLabel"
    :aria-live="inline ? 'polite' : 'assertive'"
  >
    <!-- Spinner التحميل -->
    <div class="loading-state__spinner" :class="spinnerClasses">
      <template v-if="variant === 'dots'">
        <div class="loading-dots">
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
          <div class="loading-dot"></div>
        </div>
      </template>
      
      <template v-else-if="variant === 'pulse'">
        <div class="loading-pulse"></div>
      </template>
      
      <template v-else-if="variant === 'skeleton'">
        <div class="loading-skeleton">
          <div class="skeleton-line skeleton-line--title"></div>
          <div class="skeleton-line skeleton-line--subtitle"></div>
          <div class="skeleton-line skeleton-line--content"></div>
        </div>
      </template>
      
      <template v-else-if="variant === 'progress'">
        <div class="loading-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <div v-if="showProgress" class="progress-text">
            {{ progress }}%
          </div>
        </div>
      </template>
      
      <template v-else>
        <!-- Spinner الافتراضي -->
        <svg 
          class="loading-spinner" 
          :width="spinnerSize" 
          :height="spinnerSize"
          viewBox="0 0 24 24"
          role="img"
          :aria-label="spinnerAriaLabel"
        >
          <circle
            class="spinner-track"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            opacity="0.1"
          />
          <circle
            class="spinner-circle"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-dasharray="31.416"
            stroke-dashoffset="31.416"
          />
        </svg>
      </template>
    </div>

    <!-- النص التوضيحي -->
    <div 
      v-if="showText && (text || $slots.default)" 
      class="loading-state__text"
    >
      <slot>
        <div class="loading-title">{{ text }}</div>
        <div v-if="subtitle" class="loading-subtitle">{{ subtitle }}</div>
      </slot>
    </div>

    <!-- أزرار إضافية -->
    <div 
      v-if="showActions && (cancelable || retryable)" 
      class="loading-state__actions"
    >
      <button
        v-if="cancelable"
        class="loading-action loading-action--cancel"
        @click="handleCancel"
        :disabled="actionDisabled"
        type="button"
      >
        <BaseIcon name="close" size="sm" />
        {{ cancelText }}
      </button>
      
      <button
        v-if="retryable"
        class="loading-action loading-action--retry"
        @click="handleRetry"
        :disabled="actionDisabled"
        type="button"
      >
        <BaseIcon name="refresh" size="sm" />
        {{ retryText }}
      </button>
    </div>

    <!-- overlay -->
    <div 
      v-if="overlay"
      class="loading-state__overlay"
      @click="handleOverlayClick"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '../ui/BaseIcon.vue'

// ===============================
// 🎛️ COMPONENT PROPS
// ===============================

interface LoadingStateProps {
  // العرض والمظهر
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'progress'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  
  // النص والمحتوى
  text?: string
  subtitle?: string
  showText?: boolean
  
  // التفاعل والأحداث
  cancelable?: boolean
  retryable?: boolean
  showActions?: boolean
  cancelText?: string
  retryText?: string
  actionDisabled?: boolean
  
  // السلوك
  inline?: boolean
  overlay?: boolean
  fullscreen?: boolean
  centered?: boolean
  
  // خصائص التقدم
  progress?: number
  showProgress?: boolean
  
  // إمكانية الوصول
  ariaLabel?: string
  spinnerAriaLabel?: string
}

const props = withDefaults(defineProps<LoadingStateProps>(), {
  variant: 'spinner',
  size: 'md',
  color: 'primary',
  text: 'جاري التحميل...',
  showText: true,
  cancelable: false,
  retryable: false,
  showActions: false,
  cancelText: 'إلغاء',
  retryText: 'إعادة المحاولة',
  actionDisabled: false,
  inline: false,
  overlay: false,
  fullscreen: false,
  centered: true,
  progress: 0,
  showProgress: false,
  ariaLabel: 'جاري التحميل، يرجى الانتظار',
  spinnerAriaLabel: 'مؤشر التحميل'
})

// ===============================
// 🎯 COMPONENT EVENTS
// ===============================

interface LoadingStateEmits {
  'cancel': []
  'retry': []
  'overlay-click': []
}

const emit = defineEmits<LoadingStateEmits>()

// ===============================
// 💻 COMPUTED PROPERTIES
// ===============================

// فئات CSS الرئيسية
const loadingClasses = computed(() => [
  `loading-state--${props.variant}`,
  `loading-state--${props.size}`,
  `loading-state--${props.color}`,
  {
    'loading-state--inline': props.inline,
    'loading-state--overlay': props.overlay,
    'loading-state--fullscreen': props.fullscreen,
    'loading-state--centered': props.centered,
    'loading-state--with-actions': props.showActions
  }
])

// فئات CSS للـ spinner
const spinnerClasses = computed(() => [
  `loading-state__spinner--${props.variant}`,
  `loading-state__spinner--${props.size}`
])

// حجم الـ spinner
const spinnerSize = computed(() => {
  const sizes = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48
  }
  return sizes[props.size]
})

// ===============================
// 🎯 METHODS
// ===============================

const handleCancel = () => {
  emit('cancel')
}

const handleRetry = () => {
  emit('retry')
}

const handleOverlayClick = () => {
  emit('overlay-click')
}
</script>

<style lang="scss" scoped>
/**
 * ==============================================
 * LOADING STATE COMPONENT STYLES
 * ==============================================
 */

@use '../../styles/foundation/variables' as *;
@use '../../styles/foundation/colors' as *;
@use '../../styles/foundation/spacing' as *;
@use '../../styles/foundation/typography' as *;
@use '../../styles/foundation/breakpoints' as *;
@use '../../styles/utilities/mixins' as *;

.loading-state {
  @include flex-center(column, var(--spacing-md));
  min-height: 120px;
  
  // المتغيرات
  &--inline {
    @include flex-start(row, var(--spacing-sm));
    min-height: auto;
    
    .loading-state__text {
      text-align: right;
      
      [dir="ltr"] & {
        text-align: left;
      }
    }
  }
  
  &--overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(var(--color-surface-rgb), 0.8);
    @include backdrop-blur(10px);
    z-index: map-get($z-index, "modal");
  }
  
  &--fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-background);
    z-index: map-get($z-index, "modal");
  }
  
  &--centered {
    justify-content: center;
    align-items: center;
  }
  
  // الأحجام
  &--xs {
    min-height: 60px;
    gap: var(--spacing-xs);
  }
  
  &--sm {
    min-height: 80px;
    gap: var(--spacing-sm);
  }
  
  &--md {
    min-height: 120px;
    gap: var(--spacing-md);
  }
  
  &--lg {
    min-height: 160px;
    gap: var(--spacing-lg);
  }
  
  &--xl {
    min-height: 200px;
    gap: var(--spacing-xl);
  }
  
  // الألوان
  &--primary {
    --loading-color: var(--color-primary);
  }
  
  &--secondary {
    --loading-color: var(--color-secondary);
  }
  
  &--success {
    --loading-color: var(--color-success);
  }
  
  &--warning {
    --loading-color: var(--color-warning);
  }
  
  &--error {
    --loading-color: var(--color-error);
  }
  
  &--info {
    --loading-color: var(--color-info);
  }
  
  // الـ Spinner
  &__spinner {
    color: var(--loading-color, var(--color-primary));
    
    &--xs {
      @include size(16px);
    }
    
    &--sm {
      @include size(20px);
    }
    
    &--md {
      @include size(24px);
    }
    
    &--lg {
      @include size(32px);
    }
    
    &--xl {
      @include size(48px);
    }
  }
  
  // النص
  &__text {
    text-align: center;
    
    .loading-title {
      @include text-style("body");
      color: var(--color-text-primary);
      font-weight: var(--font-weight-medium);
      margin-bottom: var(--spacing-xs);
    }
    
    .loading-subtitle {
      @include text-style("body-small");
      color: var(--color-text-secondary);
    }
  }
  
  // الأزرار
  &__actions {
    @include flex-center(row, var(--spacing-sm));
    
    @include mobile-layout {
      flex-direction: column;
      width: 100%;
    }
  }
  
  // Overlay
  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    cursor: pointer;
  }
}

// أزرار الإجراءات
.loading-action {
  @include flex-center(row, var(--spacing-xs));
  @include border-radius("md");
  @include transition(all, "fast");
  border: 1px solid var(--color-divider);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  
  &:hover {
    background: var(--color-surface-variant);
    color: var(--color-text-primary);
  }
  
  &:focus-visible {
    @include focus-effect;
  }
  
  &:disabled {
    @include disabled-effect;
  }
  
  &--cancel {
    &:hover {
      border-color: var(--color-error);
      color: var(--color-error);
    }
  }
  
  &--retry {
    &:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }
  }
  
  @include mobile-layout {
    width: 100%;
    justify-content: center;
  }
}

// أنواع الـ Loading المختلفة

// Spinner الافتراضي
.loading-spinner {
  animation: spin 1s linear infinite;
  
  .spinner-circle {
    animation: dash 1.5s ease-in-out infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

// النقاط المتحركة
.loading-dots {
  @include flex-center(row, var(--spacing-xs));
  
  .loading-dot {
    @include size(8px);
    @include border-radius("full");
    background: currentColor;
    animation: bounce 1.4s ease-in-out infinite both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

// النبضة
.loading-pulse {
  @include size(40px);
  @include border-radius("full");
  background: currentColor;
  animation: pulse 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

// Skeleton
.loading-skeleton {
  width: 100%;
  max-width: 300px;
  
  .skeleton-line {
    height: 16px;
    @include border-radius("sm");
    background: linear-gradient(
      90deg,
      var(--color-surface-variant) 25%,
      var(--color-surface) 50%,
      var(--color-surface-variant) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
    margin-bottom: var(--spacing-sm);
    
    &--title {
      height: 20px;
      width: 60%;
    }
    
    &--subtitle {
      height: 16px;
      width: 80%;
    }
    
    &--content {
      height: 14px;
      width: 100%;
      margin-bottom: 0;
    }
  }
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

// شريط التقدم
.loading-progress {
  width: 100%;
  max-width: 300px;
  
  .progress-bar {
    width: 100%;
    height: 8px;
    background: var(--color-surface-variant);
    @include border-radius("full");
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(
        90deg,
        var(--loading-color),
        lighten(var(--loading-color), 10%)
      );
      @include border-radius("full");
      @include transition(width, "smooth");
    }
  }
  
  .progress-text {
    @include text-style("caption");
    color: var(--color-text-secondary);
    text-align: center;
    margin-top: var(--spacing-xs);
  }
}
</style> 