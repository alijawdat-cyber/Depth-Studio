<template>
  <v-card
    :class="computedClasses"
    :style="computedStyles"
    :elevation="computedElevation"
    :variant="variant"
    :color="color"
    :rounded="rounded"
    :flat="flat"
    :hover="hover"
    v-bind="$attrs"
    @click="handleClick"
  >
    <!-- Card Header -->
    <v-card-title
      v-if="title || $slots.title || subtitle || $slots.subtitle || actions || $slots.actions"
      :class="headerClasses"
    >
      <div class="card-header-content">
        <!-- Title Section -->
        <div class="card-title-section">
          <!-- Main Title -->
          <h3 v-if="title || $slots.title" class="card-title">
            <slot name="title">{{ title }}</slot>
          </h3>
          
          <!-- Subtitle -->
          <p v-if="subtitle || $slots.subtitle" class="card-subtitle">
            <slot name="subtitle">{{ subtitle }}</slot>
          </p>
        </div>
        
        <!-- Actions Section -->
        <div v-if="actions || $slots.actions" class="card-actions">
          <slot name="actions">
            <component
              v-for="(action, index) in actions"
              :key="index"
              :is="action.component || 'BaseButton'"
              v-bind="action.props"
              @click="action.onClick"
            >
              {{ action.label }}
            </component>
          </slot>
        </div>
      </div>
    </v-card-title>
    
    <!-- Card Content -->
    <v-card-text
      v-if="$slots.default || content"
      :class="contentClasses"
    >
      <slot>{{ content }}</slot>
    </v-card-text>
    
    <!-- Card Footer -->
    <v-card-actions
      v-if="$slots.footer || footerActions"
      :class="footerClasses"
    >
      <slot name="footer">
        <component
          v-for="(action, index) in footerActions"
          :key="index"
          :is="action.component || 'BaseButton'"
          v-bind="action.props"
          @click="action.onClick"
        >
          {{ action.label }}
        </component>
      </slot>
    </v-card-actions>
    
    <!-- Loading Overlay -->
    <v-overlay
      v-if="loading"
      contained
      class="card-loading-overlay"
    >
      <LoadingSpinner v-if="loadingComponent === 'spinner'" />
      <v-progress-circular
        v-else
        indeterminate
        :size="loadingSize"
        :color="loadingColor"
      />
    </v-overlay>
  </v-card>
</template>

<script setup lang="ts">
import { computed, type StyleValue } from 'vue'
import type { Component } from 'vue'

// === INTERFACES ===
interface CardAction {
  label: string
  component?: string | Component
  props?: Record<string, any>
  onClick?: (event: MouseEvent) => void
}

interface Props {
  // Card Content
  title?: string
  subtitle?: string
  content?: string
  
  // Card Appearance
  variant?: 'flat' | 'elevated' | 'tonal' | 'outlined' | 'text' | 'plain'
  color?: string
  rounded?: boolean | string
  flat?: boolean
  hover?: boolean
  
  // Card Behavior
  clickable?: boolean
  loading?: boolean
  disabled?: boolean
  
  // Elevation System
  elevation?: string | number
  hoverElevation?: string | number
  
  // Actions
  actions?: CardAction[]
  footerActions?: CardAction[]
  
  // Styling
  customClass?: string
  customStyle?: StyleValue
  headerClass?: string
  contentClass?: string
  footerClass?: string
  
  // Animation & Effects
  animate?: boolean
  hoverEffect?: boolean
  pulseEffect?: boolean
  glowEffect?: boolean
  
  // Loading
  loadingComponent?: 'spinner' | 'circular'
  loadingSize?: string | number
  loadingColor?: string
  
  // Layout
  dense?: boolean
  fluid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'elevated',
  rounded: true,
  elevation: 1,
  hoverElevation: 3,
  animate: true,
  hoverEffect: true,
  loadingComponent: 'circular',
  loadingSize: 32,
  loadingColor: 'primary'
})

// === EMITS ===
const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

// === COMPUTED PROPERTIES ===

// Compute elevation
const computedElevation = computed(() => {
  if (props.loading || props.disabled) return props.elevation
  return props.elevation
})

// Compute CSS classes
const computedClasses = computed(() => {
  const classes = ['base-card']
  
  // Animation classes
  if (props.animate) {
    classes.push('card-animate')
  }
  
  // Effect classes
  if (props.hoverEffect) {
    classes.push('card-hover-effect')
  }
  
  if (props.pulseEffect) {
    classes.push('card-pulse')
  }
  
  if (props.glowEffect) {
    classes.push('card-glow')
  }
  
  // State classes
  if (props.clickable) {
    classes.push('card-clickable')
  }
  
  if (props.loading) {
    classes.push('card-loading')
  }
  
  if (props.disabled) {
    classes.push('card-disabled')
  }
  
  if (props.dense) {
    classes.push('card-dense')
  }
  
  if (props.fluid) {
    classes.push('card-fluid')
  }
  
  // Custom class
  if (props.customClass) {
    classes.push(props.customClass)
  }
  
  return classes.join(' ')
})

// Compute header classes
const headerClasses = computed(() => {
  const classes = ['card-header']
  
  if (props.headerClass) {
    classes.push(props.headerClass)
  }
  
  return classes.join(' ')
})

// Compute content classes
const contentClasses = computed(() => {
  const classes = ['card-content']
  
  if (props.dense) {
    classes.push('card-content-dense')
  }
  
  if (props.contentClass) {
    classes.push(props.contentClass)
  }
  
  return classes.join(' ')
})

// Compute footer classes
const footerClasses = computed(() => {
  const classes = ['card-footer']
  
  if (props.footerClass) {
    classes.push(props.footerClass)
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
  if (props.clickable && !props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/design-system/index';

// === BASE CARD COMPONENT ===
.base-card {
  // RTL support
  [dir="rtl"] & {
    direction: inherit;
  }
  
  // Core styles
  &.v-card {
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    transition: all var(--transition-normal) var(--easing-ease-out);
    background-color: var(--color-surface-card) !important;
    
    // === FIXED TEXT COLORS ===
    // إصلاح ألوان النصوص لضمان التباين الواضح
    .v-card-title,
    .card-title {
      color: var(--color-text-primary) !important;
      font-weight: var(--font-weight-semibold);
      font-family: var(--font-family-primary);
      line-height: var(--line-height-tight);
    }
    
    .v-card-subtitle,
    .card-subtitle {
      color: var(--color-text-secondary) !important;
      font-weight: var(--font-weight-regular);
      font-family: var(--font-family-primary);
      margin-top: var(--spacing-1);
    }
    
    .v-card-text {
      color: var(--color-text-primary) !important;
      font-family: var(--font-family-primary);
      
      // إصلاح النصوص الفرعية داخل المحتوى
      .text-muted,
      .text-secondary {
        color: var(--color-text-secondary) !important;
      }
      
      .text-caption {
        color: var(--color-text-tertiary) !important;
      }
      
      // إصلاح ألوان العناصر الأخرى
      p, span, div {
        color: inherit;
      }
      
      // الرموز والأيقونات
      .v-icon {
        opacity: 1 !important;
      }
    }
    
    // إصلاح header content
    .card-header-content {
      .card-title-section {
        .card-title {
          color: var(--color-text-primary) !important;
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          margin-bottom: var(--spacing-1);
        }
        
        .card-subtitle {
          color: var(--color-text-secondary) !important;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-regular);
        }
      }
    }
    
    // === EXISTING STYLES ===
    // Hover effects
    &.hover-effect:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    // Clickable card
    &.clickable {
      cursor: pointer;
      
      &:hover {
        background-color: rgba(var(--v-theme-primary), 0.02);
      }
    }
    
    // Loading overlay
    &.loading {
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(2px);
        z-index: 10;
      }
    }
  }
  
  // Header section
  .card-header {
    position: relative;
    
    &.has-actions {
      padding-inline-end: 60px;
    }
    
    .header-actions {
      position: absolute;
      top: 16px;
      inset-inline-end: 16px;
      display: flex;
      gap: 8px;
    }
  }
  
  // Content section
  .card-content {
    position: relative;
    
    &.dense {
      padding: var(--spacing-3);
    }
    
    &.fluid {
      padding: 0;
    }
  }
  
  // Footer section
  .card-footer {
    border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    background: rgba(var(--v-theme-surface), 0.5);
    
    &.dense {
      padding: var(--spacing-3);
    }
    
    .footer-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-2);
      
      [dir="rtl"] & {
        justify-content: flex-start;
      }
    }
  }
  
  // Elevation variants
  &.elevation-minimal {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  &.elevation-strong {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }
  
  // Animation classes
  &.animate-fade-in {
    animation: cardFadeIn 0.3s ease-out;
  }
  
  &.animate-slide-up {
    animation: cardSlideUp 0.4s ease-out;
  }
  
  // Responsive design
  @media (max-width: 600px) {
    &.v-card {
      border-radius: var(--border-radius-md);
      
      .card-header {
        &.has-actions {
          padding-inline-end: 50px;
        }
        
        .header-actions {
          top: 12px;
          inset-inline-end: 12px;
        }
      }
      
      .footer-actions {
        flex-direction: column;
        
        .v-btn {
          width: 100%;
        }
      }
    }
  }
}

// Loading spinner overlay
.card-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(2px);
  z-index: 10;
  border-radius: inherit;
  
  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-3);
    
    .loading-text {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
  }
}

// Animation keyframes
@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Print styles
@media print {
  .base-card {
    &.v-card {
      break-inside: avoid;
      box-shadow: none !important;
      border: 1px solid #ccc !important;
      
      .card-header {
        .header-actions {
          display: none !important;
        }
      }
      
      .card-footer {
        .footer-actions {
          display: none !important;
        }
      }
    }
  }
  
  .card-loading-overlay {
    display: none !important;
  }
}
</style> 