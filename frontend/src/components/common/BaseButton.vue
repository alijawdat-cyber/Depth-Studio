<template>
  <button
    :type="type"
    :class="buttonClass"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <!-- Loading State -->
    <span v-if="loading" class="flex items-center justify-center gap-2">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      <span v-if="loadingText">{{ loadingText }}</span>
    </span>
    <!-- Normal Content -->
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClass = computed(() => [
  'btn',
  'inline-flex items-center justify-center',
  'font-medium rounded-md transition-all duration-200',
  'focus:outline-none focus:ring-2 focus:ring-offset-2',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  
  // Size variants
  {
    'px-3 py-1.5 text-sm': props.size === 'sm',
    'px-4 py-2 text-base': props.size === 'md',
    'px-6 py-3 text-lg': props.size === 'lg'
  },
  
  // Color variants
  {
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': props.variant === 'primary',
    'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500': props.variant === 'outline',
    'text-gray-700 hover:bg-gray-100 focus:ring-gray-500': props.variant === 'ghost',
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': props.variant === 'danger'
  },
  
  // Block variant
  {
    'w-full': props.block
  }
])
</script>

<style scoped>
.depth-button {
  /* كل الأنماط محددة في main.css للتجانس */
  transition: all var(--transition-fast) !important;
}

/* تحسينات إضافية للأزرار */
.depth-button--primary.v-btn--variant-elevated {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600)) !important;
  box-shadow: var(--shadow-md) !important;
}

.depth-button--primary.v-btn--variant-elevated:hover {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700)) !important;
  box-shadow: var(--shadow-lg) !important;
  transform: translateY(-1px);
}

.depth-button--gray.v-btn--variant-outlined {
  border-color: var(--border-strong) !important;
  color: var(--text) !important;
}

.depth-button--gray.v-btn--variant-outlined:hover {
  background-color: var(--surface-variant) !important;
  border-color: var(--text-light) !important;
}

.depth-button--loading {
  pointer-events: none;
}

.depth-button--icon {
  min-width: var(--component-height) !important;
  padding: 0 !important;
}

.depth-button--icon.depth-button--small {
  min-width: var(--component-height-sm) !important;
}

.depth-button--icon.depth-button--large {
  min-width: var(--component-height-lg) !important;
}

/* تحسين للنصوص */
.depth-button :deep(.v-btn__content) {
  font-weight: var(--font-medium) !important;
  gap: var(--space-2) !important;
}

/* حالة التعطيل */
.depth-button--disabled {
  opacity: 0.6 !important;
  pointer-events: none !important;
  transform: none !important;
}

/* التركيز */
.depth-button:focus-visible {
  outline: 2px solid var(--primary-500) !important;
  outline-offset: 2px !important;
}
</style> 