<template>
  <v-btn
    :class="computedClasses"
    :style="computedStyles"
    :disabled="disabled || loading"
    :loading="loading"
    :size="size"
    :variant="computedVariant"
    :color="computedColor"
    :rounded="rounded"
    :block="block"
    :icon="isIconOnly"
    v-bind="$attrs"
    @click="handleClick"
  >
    <!-- Leading Icon -->
    <template v-if="leadingIcon && !isIconOnly" #prepend>
      <v-icon
        :icon="leadingIcon"
        :size="iconSize"
      />
    </template>
    
    <!-- Main Icon (for icon-only buttons) -->
    <v-icon
      v-if="isIconOnly"
      :icon="icon || leadingIcon"
      :size="iconSize"
    />
    
    <!-- Button Text -->
    <span v-if="!isIconOnly && ($slots.default || label)">
      <slot>{{ label }}</slot>
    </span>
    
    <!-- Trailing Icon -->
    <template v-if="trailingIcon && !isIconOnly" #append>
      <v-icon
        :icon="trailingIcon"
        :size="iconSize"
      />
    </template>
  </v-btn>
</template>

<script setup lang="ts">
import { computed, type StyleValue } from 'vue'

// === PROPS DEFINITION ===
interface Props {
  // Button Content
  label?: string
  icon?: string
  leadingIcon?: string
  trailingIcon?: string
  
  // Button States
  loading?: boolean
  disabled?: boolean
  
  // Button Appearance
  variant?: 'flat' | 'elevated' | 'tonal' | 'outlined' | 'text' | 'plain'
  color?: string
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  rounded?: boolean | string
  block?: boolean
  
  // Custom Styling
  customClass?: string
  customStyle?: StyleValue
  
  // Button Behavior
  type?: 'button' | 'submit' | 'reset'
  href?: string
  to?: string | object
  
  // Animation & Effects
  animate?: boolean
  pulse?: boolean
  glow?: boolean
  shadowOnHover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'elevated',
  color: 'primary',
  size: 'default',
  rounded: true,
  animate: true,
  shadowOnHover: true,
  type: 'button'
})

// === EMITS DEFINITION ===
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// === COMPUTED PROPERTIES ===

// Check if button is icon-only
const isIconOnly = computed(() => {
  return !!(props.icon || (props.leadingIcon && !props.label && !props.trailingIcon))
})

// Compute button variant
const computedVariant = computed(() => {
  if (props.loading) return 'elevated'
  return props.variant
})

// Compute button color
const computedColor = computed(() => {
  return props.color
})

// Compute icon size based on button size
const iconSize = computed(() => {
  const sizeMap = {
    'x-small': 'small',
    'small': 'small',
    'default': 'default',
    'large': 'large',
    'x-large': 'x-large'
  }
  return sizeMap[props.size] || 'default'
})

// Compute CSS classes
const computedClasses = computed(() => {
  const classes = ['base-button']
  
  // Animation classes
  if (props.animate) {
    classes.push('btn-animate')
  }
  
  // Effect classes
  if (props.pulse) {
    classes.push('btn-pulse')
  }
  
  if (props.glow) {
    classes.push('btn-glow')
  }
  
  if (props.shadowOnHover) {
    classes.push('btn-shadow-hover')
  }
  
  // Loading state
  if (props.loading) {
    classes.push('btn-loading')
  }
  
  // Icon only
  if (isIconOnly.value) {
    classes.push('btn-icon-only')
  }
  
  // Custom class
  if (props.customClass) {
    classes.push(props.customClass)
  }
  
  return classes.join(' ')
})

// Compute custom styles
const computedStyles = computed((): StyleValue => {
  const styles: Record<string, string> = {}
  
  // Apply custom styles
  if (props.customStyle) {
    if (typeof props.customStyle === 'string') {
      return props.customStyle
    } else if (Array.isArray(props.customStyle)) {
      return props.customStyle
    } else {
      Object.assign(styles, props.customStyle)
    }
  }
  
  return styles
})

// === EVENT HANDLERS ===
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-system/index';

// Base component styles
.base-button {
  // RTL support using CSS logical properties
  [dir="rtl"] & {
    direction: inherit;
  }
  
  // Vuetify enhancements
  &.v-btn {
    transition: all var(--transition-normal) var(--easing-ease-out);
    
    // Loading state
    &.loading {
      pointer-events: none;
      
      .v-btn__loader {
        color: inherit;
      }
    }
    
    // Icon positioning for RTL
    &:not(.v-btn--icon) {
      .v-icon {
        &.v-icon--start {
          margin-inline-end: 8px;
          margin-inline-start: 0;
        }
        
        &.v-icon--end {
          margin-inline-start: 8px;
          margin-inline-end: 0;
        }
      }
    }
    
    // Enhanced hover effects
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    // Disabled state
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
  
  // Animation effects
  &.animate-pulse {
    animation: buttonPulse 1.5s infinite;
  }
  
  &.animate-glow {
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      inset: -2px;
      background: linear-gradient(45deg, 
        var(--color-primary), 
        var(--color-secondary), 
        var(--color-primary));
      border-radius: inherit;
      z-index: -1;
      filter: blur(6px);
      opacity: 0;
      transition: opacity var(--transition-normal);
    }
    
    &:hover::before {
      opacity: 0.7;
    }
  }
  
  // Icon-only button styles
  &.icon-only {
    min-width: auto;
    padding: 0;
    aspect-ratio: 1;
    
    .v-icon {
      margin: 0 !important;
    }
  }
  
  // Responsive sizing
  @media (max-width: 600px) {
    &.responsive {
      min-width: 40px;
      padding: 0 12px;
      
      .v-btn__content {
        font-size: 0.875rem;
      }
    }
  }
}

// Animation keyframes
@keyframes buttonPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0.4);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 8px rgba(var(--v-theme-primary), 0);
  }
}

// Color variant enhancements
.v-btn--variant-elevated {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
  }
}

.v-btn--variant-outlined {
  border-width: 2px !important;
  
  &:hover {
    border-width: 2px !important;
    background-color: rgba(var(--v-theme-primary), 0.1);
  }
}

// Size enhancements
.v-btn--size-x-small {
  min-height: 24px !important;
  padding: 0 8px !important;
  font-size: 0.75rem !important;
}

.v-btn--size-small {
  min-height: 32px !important;
  padding: 0 12px !important;
  font-size: 0.875rem !important;
}

.v-btn--size-large {
  min-height: 48px !important;
  padding: 0 24px !important;
  font-size: 1.125rem !important;
}

.v-btn--size-x-large {
  min-height: 56px !important;
  padding: 0 32px !important;
  font-size: 1.25rem !important;
}

// Print styles
@media print {
  .base-button {
    &.v-btn {
      box-shadow: none !important;
      border: 1px solid #666 !important;
      background: white !important;
      color: black !important;
      
      &::before {
        display: none !important;
      }
    }
  }
}
</style> 