<!--
==============================================
DEPTH STUDIO - مكون الحالة الفارغة
Empty State Component
==============================================
-->

<template>
  <div 
    class="empty-state" 
    :class="emptyStateClasses"
    role="region"
    :aria-label="ariaLabel"
  >
    <!-- الأيقونة أو الصورة -->
    <div class="empty-state__visual">
      <slot name="visual">
        <template v-if="illustration">
          <img 
            :src="illustration" 
            :alt="illustrationAlt"
            class="empty-state__illustration"
            loading="lazy"
          />
        </template>
        <template v-else>
          <div class="empty-state__icon-container">
            <BaseIcon 
              :name="icon" 
              :size="iconSize"
              class="empty-state__icon"
            />
          </div>
        </template>
      </slot>
    </div>

    <!-- المحتوى النصي -->
    <div class="empty-state__content">
      <!-- العنوان -->
      <h2 
        v-if="title || $slots.title" 
        class="empty-state__title"
      >
        <slot name="title">{{ title }}</slot>
      </h2>

      <!-- الوصف -->
      <p 
        v-if="description || $slots.description" 
        class="empty-state__description"
      >
        <slot name="description">{{ description }}</slot>
      </p>

      <!-- محتوى إضافي -->
      <div 
        v-if="$slots.content" 
        class="empty-state__extra-content"
      >
        <slot name="content"></slot>
      </div>
    </div>

    <!-- الأزرار والإجراءات -->
    <div 
      v-if="showActions" 
      class="empty-state__actions"
    >
      <slot name="actions">
        <!-- الزر الأساسي -->
        <BaseButton
          v-if="primaryAction"
          :variant="primaryAction.variant || 'filled'"
          :size="actionSize"
          :loading="primaryAction.loading"
          :disabled="primaryAction.disabled"
          @click="handlePrimaryAction"
        >
          <BaseIcon v-if="primaryAction.icon" :name="primaryAction.icon" size="sm" />
          {{ primaryAction.label }}
        </BaseButton>

        <!-- الزر الثانوي -->
        <BaseButton
          v-if="secondaryAction"
          :variant="secondaryAction.variant || 'outlined'"
          :size="actionSize"
          :loading="secondaryAction.loading"
          :disabled="secondaryAction.disabled"
          @click="handleSecondaryAction"
        >
          <BaseIcon v-if="secondaryAction.icon" :name="secondaryAction.icon" size="sm" />
          {{ secondaryAction.label }}
        </BaseButton>

        <!-- أزرار إضافية -->
        <template v-if="extraActions && extraActions.length > 0">
          <BaseButton
            v-for="(action, index) in extraActions"
            :key="index"
            :variant="action.variant || 'text'"
            :size="actionSize"
            :loading="action.loading"
            :disabled="action.disabled"
            @click="handleExtraAction(action)"
          >
            <BaseIcon v-if="action.icon" :name="action.icon" size="sm" />
            {{ action.label }}
          </BaseButton>
        </template>
      </slot>
    </div>

    <!-- روابط مفيدة -->
    <div 
      v-if="helpLinks && helpLinks.length > 0" 
      class="empty-state__help"
    >
      <div class="empty-state__help-title">روابط مفيدة:</div>
      <ul class="empty-state__help-links">
        <li
          v-for="(link, index) in helpLinks"
          :key="index"
          class="empty-state__help-link-item"
        >
          <router-link
            v-if="link.route"
            :to="link.route"
            class="empty-state__help-link"
          >
            <BaseIcon 
              v-if="link.icon" 
              :name="link.icon" 
              size="sm"
            />
            {{ link.label }}
          </router-link>
          <a
            v-else-if="link.href"
            :href="link.href"
            class="empty-state__help-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BaseIcon 
              v-if="link.icon" 
              :name="link.icon" 
              size="sm"
            />
            {{ link.label }}
          </a>
          <button
            v-else
            class="empty-state__help-link empty-state__help-link--button"
            @click="handleHelpLinkClick(link)"
          >
            <BaseIcon 
              v-if="link.icon" 
              :name="link.icon" 
              size="sm"
            />
            {{ link.label }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '../ui/BaseIcon.vue'
import BaseButton from '../ui/BaseButton.vue'

// ===============================
// 🏷️ COMPONENT INTERFACES
// ===============================

interface EmptyStateAction {
  label: string
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal'
  icon?: string
  loading?: boolean
  disabled?: boolean
  action?: string | (() => void)
}

interface HelpLink {
  label: string
  icon?: string
  route?: string
  href?: string
  action?: string | (() => void)
}

// ===============================
// 🎛️ COMPONENT PROPS
// ===============================

interface EmptyStateProps {
  // المحتوى الأساسي
  title?: string
  description?: string
  icon?: string
  illustration?: string
  illustrationAlt?: string
  
  // المظهر والحجم
  variant?: 'default' | 'compact' | 'detailed' | 'centered'
  size?: 'sm' | 'md' | 'lg'
  iconSize?: 'sm' | 'md' | 'lg' | 'xl'
  actionSize?: 'sm' | 'md' | 'lg'
  
  // الإجراءات
  showActions?: boolean
  primaryAction?: EmptyStateAction
  secondaryAction?: EmptyStateAction
  extraActions?: EmptyStateAction[]
  
  // المساعدة والروابط
  helpLinks?: HelpLink[]
  
  // السلوك
  fullHeight?: boolean
  bordered?: boolean
  
  // إمكانية الوصول
  ariaLabel?: string
}

const props = withDefaults(defineProps<EmptyStateProps>(), {
  icon: 'folder-outline',
  variant: 'default',
  size: 'md',
  iconSize: 'xl',
  actionSize: 'md',
  showActions: true,
  extraActions: () => [],
  helpLinks: () => [],
  fullHeight: false,
  bordered: false,
  ariaLabel: 'لا توجد عناصر للعرض'
})

// ===============================
// 🎯 COMPONENT EVENTS
// ===============================

interface EmptyStateEmits {
  'primary-action': [action?: string]
  'secondary-action': [action?: string]
  'extra-action': [action: EmptyStateAction]
  'help-link-click': [link: HelpLink]
}

const emit = defineEmits<EmptyStateEmits>()

// ===============================
// 💻 COMPUTED PROPERTIES
// ===============================

// فئات CSS
const emptyStateClasses = computed(() => [
  `empty-state--${props.variant}`,
  `empty-state--${props.size}`,
  {
    'empty-state--full-height': props.fullHeight,
    'empty-state--bordered': props.bordered,
    'empty-state--with-actions': props.showActions && (props.primaryAction || props.secondaryAction),
    'empty-state--with-help': props.helpLinks.length > 0
  }
])

// ===============================
// 🎯 METHODS
// ===============================

const handlePrimaryAction = () => {
  if (props.primaryAction?.action) {
    if (typeof props.primaryAction.action === 'function') {
      props.primaryAction.action()
    } else {
      emit('primary-action', props.primaryAction.action)
    }
  } else {
    emit('primary-action')
  }
}

const handleSecondaryAction = () => {
  if (props.secondaryAction?.action) {
    if (typeof props.secondaryAction.action === 'function') {
      props.secondaryAction.action()
    } else {
      emit('secondary-action', props.secondaryAction.action)
    }
  } else {
    emit('secondary-action')
  }
}

const handleExtraAction = (action: EmptyStateAction) => {
  if (action.action) {
    if (typeof action.action === 'function') {
      action.action()
    }
  }
  emit('extra-action', action)
}

const handleHelpLinkClick = (link: HelpLink) => {
  if (link.action) {
    if (typeof link.action === 'function') {
      link.action()
    }
  }
  emit('help-link-click', link)
}
</script>

<style lang="scss" scoped>
/**
 * ==============================================
 * EMPTY STATE COMPONENT STYLES
 * ==============================================
 */

@use '../../styles/foundation/variables' as *;
@use '../../styles/foundation/colors' as *;
@use '../../styles/foundation/spacing' as *;
@use '../../styles/foundation/typography' as *;
@use '../../styles/foundation/breakpoints' as *;
@use '../../styles/utilities/mixins' as *;

.empty-state {
  @include flex-center(column, var(--spacing-lg));
  text-align: center;
  padding: var(--spacing-xl);
  
  // المتغيرات
  &--compact {
    padding: var(--spacing-lg);
    gap: var(--spacing-md);
    
    .empty-state__visual {
      .empty-state__icon-container {
        @include size(60px);
      }
    }
    
    .empty-state__title {
      @include text-style("title-medium");
    }
  }
  
  &--detailed {
    padding: var(--spacing-2xl);
    gap: var(--spacing-xl);
    max-width: 600px;
    margin: 0 auto;
  }
  
  &--centered {
    min-height: 60vh;
    justify-content: center;
  }
  
  &--full-height {
    min-height: calc(100vh - 200px);
    justify-content: center;
  }
  
  &--bordered {
    border: 2px dashed var(--color-divider);
    @include border-radius("lg");
    background: var(--color-surface-variant);
  }
  
  // الأحجام
  &--sm {
    padding: var(--spacing-lg);
    gap: var(--spacing-sm);
    
    .empty-state__title {
      @include text-style("title-small");
    }
    
    .empty-state__description {
      @include text-style("body-small");
    }
  }
  
  &--md {
    padding: var(--spacing-xl);
    gap: var(--spacing-md);
  }
  
  &--lg {
    padding: var(--spacing-2xl);
    gap: var(--spacing-lg);
  }
  
  // العناصر المرئية
  &__visual {
    flex-shrink: 0;
  }
  
  &__icon-container {
    @include flex-center;
    @include size(80px);
    @include border-radius("full");
    background: var(--color-surface-variant);
    color: var(--color-text-hint);
    margin: 0 auto var(--spacing-md);
    
    .empty-state--sm & {
      @include size(60px);
    }
    
    .empty-state--lg & {
      @include size(100px);
    }
  }
  
  &__icon {
    opacity: 0.7;
  }
  
  &__illustration {
    max-width: 200px;
    max-height: 200px;
    width: 100%;
    height: auto;
    margin: 0 auto;
    
    .empty-state--sm & {
      max-width: 150px;
      max-height: 150px;
    }
    
    .empty-state--lg & {
      max-width: 300px;
      max-height: 300px;
    }
  }
  
  // المحتوى النصي
  &__content {
    flex: 1;
    min-width: 0;
  }
  
  &__title {
    @include text-style("title-large");
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-sm);
    
    .empty-state--sm & {
      @include text-style("title-medium");
    }
    
    .empty-state--lg & {
      @include text-style("display-small");
    }
  }
  
  &__description {
    @include text-style("body-large");
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    max-width: 400px;
    margin: 0 auto;
    
    .empty-state--sm & {
      @include text-style("body");
    }
    
    .empty-state--lg & {
      @include text-style("body-large");
      max-width: 500px;
    }
  }
  
  &__extra-content {
    margin-top: var(--spacing-md);
    
    @include mobile-layout {
      margin-top: var(--spacing-sm);
    }
  }
  
  // الأزرار والإجراءات
  &__actions {
    @include flex-center(row, var(--spacing-md));
    flex-wrap: wrap;
    
    @include mobile-layout {
      flex-direction: column;
      width: 100%;
      gap: var(--spacing-sm);
      
      :deep(.btn) {
        width: 100%;
      }
    }
  }
  
  // المساعدة والروابط
  &__help {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-divider);
    
    &-title {
      @include text-style("label-medium");
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-sm);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    &-links {
      list-style: none;
      padding: 0;
      margin: 0;
      @include flex-center(row, var(--spacing-md));
      flex-wrap: wrap;
      
      @include mobile-layout {
        flex-direction: column;
        gap: var(--spacing-xs);
      }
    }
    
    &-link-item {
      flex-shrink: 0;
    }
    
    &-link {
      @include flex-center(row, var(--spacing-xs));
      @include text-style("body-small");
      color: var(--color-primary);
      text-decoration: none;
      @include transition(all, "fast");
      padding: var(--spacing-xs) var(--spacing-sm);
      @include border-radius("sm");
      
      &:hover {
        background: var(--color-primary-container);
        color: var(--color-on-primary-container);
      }
      
      &:focus-visible {
        @include focus-effect;
      }
      
      &--button {
        background: none;
        border: none;
        cursor: pointer;
        font-family: inherit;
        font-size: inherit;
      }
      
      @include mobile-layout {
        width: 100%;
        justify-content: center;
      }
    }
  }
  
  // حالات خاصة
  &--with-actions {
    .empty-state__content {
      margin-bottom: var(--spacing-md);
    }
  }
  
  &--with-help {
    .empty-state__actions {
      margin-bottom: 0;
    }
  }
  
  // تحسينات للموبايل
  @include mobile-layout {
    padding: var(--spacing-lg) var(--spacing-md);
    gap: var(--spacing-md);
    
    &__title {
      @include text-style("title-medium");
    }
    
    &__description {
      @include text-style("body");
    }
    
    &__icon-container {
      @include size(60px);
    }
    
    &__illustration {
      max-width: 150px;
      max-height: 150px;
    }
  }
}
</style> 