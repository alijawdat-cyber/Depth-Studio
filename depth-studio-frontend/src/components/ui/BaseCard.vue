<!--
  ==============================================
  DEPTH STUDIO - مكون البطاقة الأساسي
  Base Card Component
  ==============================================
-->

<template>
  <component
    :is="tag"
    :class="cardClasses"
    :style="cardStyles"
    v-bind="linkProps"
    @click="handleClick"
  >
    <!-- الصورة العلوية -->
    <div
      v-if="image || $slots.image"
      class="card__image"
      :class="imageClasses"
    >
      <slot name="image">
        <img
          v-if="image"
          :src="image"
          :alt="imageAlt"
          :class="{ 'card__img--cover': imageCover }"
          loading="lazy"
        />
      </slot>
    </div>
    
    <!-- محتوى البطاقة -->
    <div
      v-if="hasContent"
      class="card__content"
    >
      <!-- الرأس -->
      <header
        v-if="hasHeader"
        class="card__header"
      >
        <!-- العنوان الرئيسي -->
        <div
          v-if="title || $slots.title"
          class="card__title"
        >
          <slot name="title">
            <component
              :is="titleTag"
              class="card__title-text"
            >
              {{ title }}
            </component>
          </slot>
        </div>
        
        <!-- العنوان الفرعي -->
        <div
          v-if="subtitle || $slots.subtitle"
          class="card__subtitle"
        >
          <slot name="subtitle">
            <span class="card__subtitle-text">{{ subtitle }}</span>
          </slot>
        </div>
        
        <!-- أيقونة أو عناصر إضافية -->
        <div
          v-if="$slots.action"
          class="card__action"
        >
          <slot name="action" />
        </div>
      </header>
      
      <!-- الجسم الرئيسي -->
      <main
        v-if="text || $slots.default"
        class="card__body"
      >
        <slot>
          <p v-if="text" class="card__text">{{ text }}</p>
        </slot>
      </main>
      
      <!-- القدم -->
      <footer
        v-if="$slots.footer"
        class="card__footer"
      >
        <slot name="footer" />
      </footer>
    </div>
    
    <!-- التحميل -->
    <div
      v-if="loading"
      class="card__loading"
    >
      <div class="card__loading-content">
        <slot name="loading">
          <div class="card__skeleton">
            <div class="skeleton skeleton--title"></div>
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text skeleton--short"></div>
          </div>
        </slot>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { Component } from 'vue'

export interface CardProps {
  // نوع البطاقة
  variant?: 'elevated' | 'outlined' | 'filled' | 'tonal'
  // حجم البطاقة
  size?: 'sm' | 'md' | 'lg' | 'xl'
  // لون البطاقة
  color?: 'surface' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  // شكل الحواف
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  // عرض كامل
  block?: boolean
  // قابلة للنقر
  clickable?: boolean
  // حالة التحميل
  loading?: boolean
  // تأثير الهوفر
  hover?: boolean
  // المحتوى
  title?: string
  subtitle?: string
  text?: string
  // الصورة
  image?: string
  imageAlt?: string
  imageCover?: boolean
  // العلامة المناسبة
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  // الروابط
  href?: string
  to?: string | object
  target?: string
  // التخطيط
  horizontal?: boolean
  reverse?: boolean
  // التأثيرات الخاصة
  gradient?: boolean
  glass?: boolean
  // الأبعاد
  maxWidth?: string
  height?: string
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'elevated',
  size: 'md',
  color: 'surface',
  rounded: 'md',
  block: false,
  clickable: false,
  loading: false,
  hover: true,
  imageCover: true,
  titleTag: 'h3',
  horizontal: false,
  reverse: false,
  gradient: false,
  glass: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const slots = useSlots()

// تحديد العنصر المناسب
const tag = computed((): string | Component => {
  if (props.href) return 'a'
  if (props.to) return 'router-link'
  if (props.clickable) return 'button'
  return 'article'
})

// خصائص الرابط
const linkProps = computed(() => {
  const props_: any = {}
  
  if (props.href) {
    props_.href = props.href
    if (props.target) props_.target = props.target
  }
  
  if (props.to) {
    props_.to = props.to
  }
  
  return props_
})

// فحص وجود المحتوى
const hasContent = computed(() => {
  return !props.loading && (hasHeader.value || props.text || slots.default || slots.footer)
})

const hasHeader = computed(() => {
  return props.title || props.subtitle || slots.title || slots.subtitle || slots.action
})

// فئات CSS
const cardClasses = computed(() => [
  'card',
  `card--${props.variant}`,
  `card--${props.color}`,
  `card--${props.size}`,
  `card--rounded-${props.rounded}`,
  {
    'card--block': props.block,
    'card--clickable': props.clickable || props.href || props.to,
    'card--loading': props.loading,
    'card--hover': props.hover && !props.loading,
    'card--horizontal': props.horizontal,
    'card--reverse': props.reverse,
    'card--gradient': props.gradient,
    'card--glass': props.glass
  }
])

const imageClasses = computed(() => [
  {
    'card__image--cover': props.imageCover
  }
])

// أنماط CSS
const cardStyles = computed(() => {
  const styles: any = {}
  
  if (props.maxWidth) {
    styles.maxWidth = props.maxWidth
  }
  
  if (props.height) {
    styles.height = props.height
  }
  
  return styles
})

// معالج النقر
const handleClick = (event: MouseEvent) => {
  if (props.loading) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<style lang="scss" scoped>
@import '@/styles/foundation/variables';
@import '@/styles/utilities/mixins';

.card {
  // الأساسيات
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  overflow: hidden;
  @include transition(all, "base");
  
  // التفاعل
  &--clickable {
    cursor: pointer;
    user-select: none;
    
    &:focus-visible {
      @include focus-effect;
    }
  }
  
  // تأثير الهوفر
  &--hover:hover:not(.card--loading) {
    @include hover-effect(1.02, 3);
  }
  
  // ===============================
  // 🎨 VARIANTS - الأنواع
  // ===============================
  
  &--elevated {
    @include elevation(1);
    border: 1px solid var(--color-border);
    
    &:hover {
      @include elevation(3);
    }
  }
  
  &--outlined {
    border: 2px solid var(--color-border);
    background-color: transparent;
  }
  
  &--filled {
    background-color: var(--color-surface-variant);
    border: none;
  }
  
  &--tonal {
    background-color: var(--color-primary-container);
    border: 1px solid var(--color-primary);
    color: var(--color-primary);
  }
  
  // ===============================
  // 🎯 COLORS - الألوان
  // ===============================
  
  &--surface {
    // الافتراضي
  }
  
  &--primary {
    background-color: var(--color-primary-container);
    color: var(--color-primary);
    border-color: var(--color-primary);
  }
  
  &--secondary {
    background-color: var(--color-secondary-container);
    color: var(--color-secondary);
    border-color: var(--color-secondary);
  }
  
  &--success {
    background-color: var(--color-success-container);
    color: var(--color-success);
    border-color: var(--color-success);
  }
  
  &--warning {
    background-color: var(--color-warning-container);
    color: var(--color-warning);
    border-color: var(--color-warning);
  }
  
  &--error {
    background-color: var(--color-error-container);
    color: var(--color-error);
    border-color: var(--color-error);
  }
  
  // ===============================
  // 📏 SIZES - الأحجام
  // ===============================
  
  &--sm {
    @include border-radius("sm");
    
    .card__content {
      padding: var(--spacing-sm);
    }
    
    .card__title-text {
      @include text-style("body-large");
    }
  }
  
  &--md {
    @include border-radius("md");
    
    .card__content {
      padding: var(--spacing-md);
    }
    
    .card__title-text {
      @include text-style("heading-6");
    }
  }
  
  &--lg {
    @include border-radius("md");
    
    .card__content {
      padding: var(--spacing-lg);
    }
    
    .card__title-text {
      @include text-style("heading-5");
    }
  }
  
  &--xl {
    @include border-radius("lg");
    
    .card__content {
      padding: var(--spacing-xl);
    }
    
    .card__title-text {
      @include text-style("heading-4");
    }
  }
  
  // ===============================
  // 🔘 SHAPES - الأشكال
  // ===============================
  
  &--rounded-none { border-radius: 0; }
  &--rounded-sm { @include border-radius("sm"); }
  &--rounded-md { @include border-radius("md"); }
  &--rounded-lg { @include border-radius("lg"); }
  &--rounded-xl { @include border-radius("xl"); }
  &--rounded-full { @include border-radius("full"); }
  
  // ===============================
  // 📐 LAYOUT - التخطيط
  // ===============================
  
  &--block {
    width: 100%;
  }
  
  &--horizontal {
    flex-direction: row;
    
    .card__image {
      flex: 0 0 auto;
      width: 200px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .card__content {
      flex: 1;
    }
  }
  
  &--reverse {
    &.card--horizontal {
      flex-direction: row-reverse;
    }
    
    &:not(.card--horizontal) {
      flex-direction: column-reverse;
    }
  }
  
  // ===============================
  // 🎭 SPECIAL EFFECTS
  // ===============================
  
  &--gradient {
    background: linear-gradient(135deg, var(--color-primary-container), var(--color-secondary-container));
  }
  
  &--glass {
    @include glass-effect;
  }
  
  // ===============================
  // 🔄 LOADING STATE
  // ===============================
  
  &--loading {
    pointer-events: none;
    
    .card__content {
      display: none;
    }
  }
}

// ===============================
// 🖼️ IMAGE SECTION
// ===============================

.card__image {
  position: relative;
  overflow: hidden;
  
  &--cover {
    height: 200px;
  }
  
  img {
    display: block;
    width: 100%;
    height: auto;
    @include transition(transform, "base");
    
    &.card__img--cover {
      height: 100%;
      object-fit: cover;
    }
  }
  
  .card--hover:hover & img {
    transform: scale(1.05);
  }
}

// ===============================
// 📝 CONTENT SECTIONS
// ===============================

.card__content {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--spacing-sm);
}

.card__header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  
  // Header مع Action
  &:has(.card__action) {
    flex-direction: row;
    align-items: flex-start;
    gap: var(--spacing-sm);
    
    .card__title,
    .card__subtitle {
      flex: 1;
    }
    
    .card__action {
      flex-shrink: 0;
    }
  }
}

.card__title {
  .card__title-text {
    margin: 0;
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
  }
}

.card__subtitle {
  .card__subtitle-text {
    @include text-style("body-small");
    color: var(--color-text-secondary);
  }
}

.card__body {
  flex: 1;
  
  .card__text {
    margin: 0;
    @include text-style("body");
    color: var(--color-text-primary);
    line-height: var(--line-height-relaxed);
  }
}

.card__footer {
  @include flex-between;
  gap: var(--spacing-sm);
  margin-top: auto;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-divider);
}

// ===============================
// ⏳ LOADING SKELETON
// ===============================

.card__loading {
  position: absolute;
  inset: 0;
  @include flex-center;
  background-color: var(--color-surface);
}

.card__loading-content {
  width: 100%;
  height: 100%;
  padding: var(--spacing-md);
}

.card__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  
  .skeleton {
    @include loading-skeleton;
    
    &--title {
      height: 1.5rem;
      width: 70%;
    }
    
    &--text {
      height: 1rem;
      
      &--short {
        width: 50%;
      }
    }
  }
}

// ===============================
// 📱 RESPONSIVE
// ===============================

@include mobile-layout {
  .card {
    &--horizontal {
      flex-direction: column;
      
      .card__image {
        width: 100%;
        height: 150px;
      }
    }
    
    &--lg,
    &--xl {
      .card__content {
        padding: var(--spacing-md);
      }
    }
  }
}

// ===============================
// 🌙 THEME VARIATIONS
// ===============================

[data-theme="dark"] {
  .card {
    &--elevated {
      @include elevation(2);
    }
    
    &--glass {
      @include glass-effect(0.1, 20px);
    }
  }
}

// ===============================
// 🎯 ACCESSIBILITY
// ===============================

@media (prefers-reduced-motion: reduce) {
  .card {
    transition: none !important;
    
    &--hover:hover {
      transform: none !important;
    }
    
    .card__image img {
      transition: none !important;
      
      .card--hover:hover & {
        transform: none !important;
      }
    }
  }
}

// ===============================
// 📄 PRINT STYLES
// ===============================

@media print {
  .card {
    border: 1px solid #000 !important;
    background: #fff !important;
    box-shadow: none !important;
    
    &__loading {
      display: none !important;
    }
  }
}
</style> 