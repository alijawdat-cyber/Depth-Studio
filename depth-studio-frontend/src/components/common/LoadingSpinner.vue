<template>
  <div :class="computedClasses" :style="computedStyles">
    <!-- Circular Spinner -->
    <div v-if="type === 'circular'" class="spinner-circular">
      <svg
        :width="computedSize"
        :height="computedSize"
        viewBox="0 0 50 50"
        class="spinner-svg"
      >
        <circle
          cx="25"
          cy="25"
          :r="circleRadius"
          fill="none"
          :stroke="computedColor"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          class="spinner-circle"
        />
      </svg>
    </div>
    
    <!-- Dots Spinner -->
    <div v-else-if="type === 'dots'" class="spinner-dots">
      <div
        v-for="i in 3"
        :key="i"
        class="spinner-dot"
        :style="{ animationDelay: `${(i - 1) * 0.1}s` }"
      ></div>
    </div>
    
    <!-- Pulse Spinner -->
    <div v-else-if="type === 'pulse'" class="spinner-pulse">
      <div
        v-for="i in 3"
        :key="i"
        class="spinner-pulse-ring"
        :style="{ animationDelay: `${(i - 1) * 0.4}s` }"
      ></div>
    </div>
    
    <!-- Wave Spinner -->
    <div v-else-if="type === 'wave'" class="spinner-wave">
      <div
        v-for="i in 5"
        :key="i"
        class="spinner-wave-bar"
        :style="{ animationDelay: `${(i - 1) * 0.1}s` }"
      ></div>
    </div>
    
    <!-- Loading Text -->
    <div v-if="showText" class="spinner-text">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type StyleValue } from 'vue'

// === PROPS DEFINITION ===
interface Props {
  // Spinner Type
  type?: 'circular' | 'dots' | 'pulse' | 'wave'
  
  // Size Options
  size?: 'small' | 'default' | 'large' | 'x-large' | number | string
  
  // Color Options
  color?: string
  
  // Text Options
  text?: string
  showText?: boolean
  
  // Styling
  customClass?: string
  customStyle?: StyleValue
  
  // Animation Speed
  speed?: 'slow' | 'normal' | 'fast'
  
  // Overlay Mode
  overlay?: boolean
  overlayColor?: string
  overlayOpacity?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'circular',
  size: 'default',
  color: 'primary',
  text: 'Loading...',
  speed: 'normal',
  overlayColor: 'white',
  overlayOpacity: 0.8
})

// === COMPUTED PROPERTIES ===

// Compute actual size in pixels
const computedSize = computed(() => {
  if (typeof props.size === 'number') {
    return `${props.size}px`
  }
  
  if (typeof props.size === 'string' && /^\d+px?$/.test(props.size)) {
    return props.size.endsWith('px') ? props.size : `${props.size}px`
  }
  
  const sizeMap = {
    small: '24px',
    default: '40px',
    large: '56px',
    'x-large': '72px'
  }
  
  return sizeMap[props.size as keyof typeof sizeMap] || sizeMap.default
})

// Compute actual size as number for calculations
const sizeNumber = computed(() => {
  return parseInt(computedSize.value)
})

// Compute circle radius for circular spinner
const circleRadius = computed(() => {
  return Math.max(8, (sizeNumber.value / 2) - 5)
})

// Compute stroke width for circular spinner
const strokeWidth = computed(() => {
  return Math.max(2, sizeNumber.value / 20)
})

// Compute color (support CSS variables and custom colors)
const computedColor = computed(() => {
  // If it's a CSS custom property or hex/rgb color, use as is
  if (props.color.startsWith('--') || props.color.startsWith('#') || props.color.startsWith('rgb')) {
    return props.color
  }
  
  // If it's a theme color, convert to CSS variable
  const themeColors = ['primary', 'secondary', 'success', 'warning', 'error', 'info']
  if (themeColors.includes(props.color)) {
    return `rgb(var(--v-theme-${props.color}))`
  }
  
  // Default fallback
  return props.color
})

// Compute animation duration based on speed
const animationDuration = computed(() => {
  const speedMap = {
    slow: '2s',
    normal: '1.2s',
    fast: '0.8s'
  }
  
  return speedMap[props.speed] || speedMap.normal
})

// Compute CSS classes
const computedClasses = computed(() => {
  const classes = ['loading-spinner']
  
  // Type classes
  classes.push(`spinner-${props.type}`)
  
  // Size classes
  if (typeof props.size === 'string' && !props.size.includes('px')) {
    classes.push(`spinner-${props.size}`)
  }
  
  // Overlay mode
  if (props.overlay) {
    classes.push('spinner-overlay')
  }
  
  // Custom class
  if (props.customClass) {
    classes.push(props.customClass)
  }
  
  return classes.join(' ')
})

// Compute custom styles
const computedStyles = computed((): StyleValue => {
  const styles: Record<string, string> = {
    '--spinner-size': computedSize.value,
    '--spinner-color': computedColor.value,
    '--spinner-duration': animationDuration.value
  }
  
  // Overlay styles
  if (props.overlay) {
    styles['--overlay-color'] = props.overlayColor
    styles['--overlay-opacity'] = props.overlayOpacity.toString()
  }
  
  // Apply custom styles
  if (props.customStyle) {
    if (typeof props.customStyle === 'string') {
      return `${Object.entries(styles).map(([key, value]) => `${key}: ${value}`).join('; ')}; ${props.customStyle}`
    } else if (Array.isArray(props.customStyle)) {
      return [styles, ...props.customStyle]
    } else {
      Object.assign(styles, props.customStyle)
    }
  }
  
  return styles
})
</script>

<style lang="scss" scoped>
@import '@/styles/design-system/index';

// === LOADING SPINNER COMPONENT ===
.loading-spinner {
  // RTL support
  [dir="rtl"] & {
    direction: inherit;
  }
  
  // Core container styles
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.inline {
    display: inline-flex;
  }
  
  &.fullscreen {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    z-index: 9999;
  }
  
  &.overlay {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(2px);
    z-index: 10;
  }
  
  // Loading content wrapper
  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-3);
    text-align: center;
    
    // Text styles
    .loading-text {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
      letter-spacing: 0.5px;
      margin: 0;
    }
    
    .loading-subtext {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
      margin: 0;
    }
  }
}

// === SPINNER TYPES ===

// Circular spinner
.spinner-circular {
  width: var(--spinner-size);
  height: var(--spinner-size);
  border: 3px solid rgba(var(--spinner-color), 0.2);
  border-top: 3px solid var(--spinner-color);
  border-radius: 50%;
  animation: spinRotate var(--spinner-speed) linear infinite;
}

// Dots spinner
.spinner-dots {
  display: flex;
  gap: 4px;
  
  .dot {
    width: calc(var(--spinner-size) / 4);
    height: calc(var(--spinner-size) / 4);
    background: var(--spinner-color);
    border-radius: 50%;
    animation: spinDots var(--spinner-speed) ease-in-out infinite;
    
    &:nth-child(2) {
      animation-delay: -0.1s;
    }
    
    &:nth-child(3) {
      animation-delay: -0.2s;
    }
  }
}

// Pulse spinner
.spinner-pulse {
  width: var(--spinner-size);
  height: var(--spinner-size);
  background: var(--spinner-color);
  border-radius: 50%;
  animation: spinPulse var(--spinner-speed) ease-in-out infinite;
}

// Wave spinner
.spinner-wave {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: var(--spinner-size);
  
  .bar {
    width: calc(var(--spinner-size) / 8);
    height: 100%;
    background: var(--spinner-color);
    border-radius: 2px;
    animation: spinWave var(--spinner-speed) ease-in-out infinite;
    
    &:nth-child(2) { animation-delay: -0.1s; }
    &:nth-child(3) { animation-delay: -0.2s; }
    &:nth-child(4) { animation-delay: -0.3s; }
    &:nth-child(5) { animation-delay: -0.4s; }
  }
}

// === SIZE VARIANTS ===
.size-xs {
  --spinner-size: 16px;
  --font-size-sm: 0.75rem;
  --font-size-xs: 0.6875rem;
}

.size-sm {
  --spinner-size: 20px;
  --font-size-sm: 0.875rem;
  --font-size-xs: 0.75rem;
}

.size-md {
  --spinner-size: 32px;
  --font-size-sm: 1rem;
  --font-size-xs: 0.875rem;
}

.size-lg {
  --spinner-size: 48px;
  --font-size-sm: 1.125rem;
  --font-size-xs: 1rem;
}

.size-xl {
  --spinner-size: 64px;
  --font-size-sm: 1.25rem;
  --font-size-xs: 1.125rem;
}

// === COLOR VARIANTS ===
.color-primary {
  --spinner-color: var(--color-primary);
}

.color-secondary {
  --spinner-color: var(--color-secondary);
}

.color-success {
  --spinner-color: var(--color-success);
}

.color-warning {
  --spinner-color: var(--color-warning);
}

.color-error {
  --spinner-color: var(--color-error);
}

.color-info {
  --spinner-color: var(--color-info);
}

.color-white {
  --spinner-color: #ffffff;
}

// === SPEED VARIANTS ===
.speed-slow {
  --spinner-speed: 2s;
}

.speed-normal {
  --spinner-speed: 1s;
}

.speed-fast {
  --spinner-speed: 0.6s;
}

// === ANIMATIONS ===
@keyframes spinRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spinDots {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spinPulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes spinWave {
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }
  20% {
    transform: scaleY(1);
  }
}

// === REDUCED MOTION SUPPORT ===
@media (prefers-reduced-motion: reduce) {
  .spinner-circular,
  .spinner-dots .dot,
  .spinner-pulse,
  .spinner-wave .bar {
    animation-duration: 3s;
    animation-iteration-count: 1;
  }
}

// === RESPONSIVE DESIGN ===
@media (max-width: 600px) {
  .loading-spinner {
    &.fullscreen {
      .loading-content {
        padding: var(--spacing-4);
        
        .loading-text {
          font-size: 0.875rem;
        }
        
        .loading-subtext {
          font-size: 0.75rem;
        }
      }
    }
  }
}

// === PRINT STYLES ===
@media print {
  .loading-spinner {
    display: none !important;
  }
}
</style> 