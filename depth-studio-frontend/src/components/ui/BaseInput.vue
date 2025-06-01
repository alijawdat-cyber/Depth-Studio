<!--
  ==============================================
  DEPTH STUDIO - مكون حقل الإدخال الأساسي
  Base Input Component
  ==============================================
-->

<template>
  <div
    :class="containerClasses"
    :data-input-state="currentState"
  >
    <!-- تسمية الحقل -->
    <label
      v-if="label || $slots.label"
      :for="inputId"
      class="input__label"
    >
      <slot name="label">
        {{ label }}
        <span
          v-if="required"
          class="input__required"
          aria-label="مطلوب"
        >*</span>
      </slot>
    </label>
    
    <!-- حاوي الحقل -->
    <div class="input__container">
      <!-- أيقونة البداية -->
      <div
        v-if="prependIcon || $slots.prepend"
        class="input__prepend"
      >
        <slot name="prepend">
          <Icon
            v-if="prependIcon"
            :name="prependIcon"
            :size="iconSize"
            class="input__icon"
          />
        </slot>
      </div>
      
      <!-- حقل الإدخال -->
      <input
        :id="inputId"
        ref="inputRef"
        :class="inputClasses"
        :type="currentType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :minlength="minlength"
        :min="min"
        :max="max"
        :step="step"
        :pattern="pattern"
        :inputmode="inputmode"
        :aria-invalid="isInvalid"
        :aria-describedby="ariaDescribedBy"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @paste="handlePaste"
        v-bind="$attrs"
      />
      
      <!-- أيقونة النهاية -->
      <div
        v-if="appendIcon || showPasswordToggle || showClearButton || $slots.append"
        class="input__append"
      >
        <slot name="append">
          <!-- زر مسح المحتوى -->
          <button
            v-if="showClearButton"
            type="button"
            class="input__clear"
            @click="clearInput"
            aria-label="مسح"
          >
            <Icon name="close" :size="iconSize" />
          </button>
          
          <!-- زر إظهار/إخفاء كلمة المرور -->
          <button
            v-if="showPasswordToggle"
            type="button"
            class="input__password-toggle"
            @click="togglePasswordVisibility"
            :aria-label="showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
          >
            <Icon
              :name="showPassword ? 'eye-off' : 'eye'"
              :size="iconSize"
            />
          </button>
          
          <!-- أيقونة عامة -->
          <Icon
            v-if="appendIcon"
            :name="appendIcon"
            :size="iconSize"
            class="input__icon"
          />
        </slot>
      </div>
      
      <!-- مؤشر التحميل -->
      <div
        v-if="loading"
        class="input__loading"
      >
        <Icon
          name="loading"
          :size="iconSize"
          class="input__loading-icon"
        />
      </div>
    </div>
    
    <!-- نص المساعدة والأخطاء -->
    <div
      v-if="showHelpText"
      class="input__help"
    >
      <!-- رسالة الخطأ -->
      <div
        v-if="isInvalid && errorMessage"
        class="input__error"
        role="alert"
        :id="`${inputId}-error`"
      >
        <Icon name="alert-circle" size="16" />
        <span>{{ errorMessage }}</span>
      </div>
      
      <!-- نص المساعدة -->
      <div
        v-else-if="hint"
        class="input__hint"
        :id="`${inputId}-hint`"
      >
        {{ hint }}
      </div>
      
      <!-- عداد الأحرف -->
      <div
        v-if="showCounter"
        class="input__counter"
        :class="{ 'input__counter--error': isOverLimit }"
      >
        {{ characterCount }}/{{ maxlength }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch, useId } from 'vue'
import Icon from './BaseIcon.vue'

export interface InputProps {
  // القيمة
  modelValue?: string | number | boolean
  // نوع الحقل
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'checkbox'
  // التسمية والمساعدة
  label?: string
  placeholder?: string
  hint?: string
  // الحجم والشكل
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outlined' | 'filled' | 'underlined'
  rounded?: boolean
  // الحالة
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  loading?: boolean
  // التحقق
  errorMessage?: string
  rules?: Function[]
  // الأيقونات
  prependIcon?: string
  appendIcon?: string
  clearable?: boolean
  // خصائص HTML
  autocomplete?: string
  maxlength?: number
  minlength?: number
  min?: number | string
  max?: number | string
  step?: number | string
  pattern?: string
  inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
  // عداد الأحرف
  counter?: boolean
  // خاص بكلمة المرور
  showPassword?: boolean
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  size: 'md',
  variant: 'outlined',
  rounded: false,
  disabled: false,
  readonly: false,
  required: false,
  loading: false,
  clearable: false,
  counter: false,
  showPassword: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'input': [event: Event]
  'change': [event: Event]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'clear': []
  'keydown': [event: KeyboardEvent]
  'paste': [event: ClipboardEvent]
}>()

// المراجع
const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)
const showPasswordState = ref(false)

// معرف فريد للحقل
const inputId = useId()

// حالة إظهار كلمة المرور
const currentType = computed(() => {
  if (props.type === 'password' && showPasswordState.value) {
    return 'text'
  }
  return props.type
})

// حساب حجم الأيقونة
const iconSize = computed(() => {
  const sizeMap = {
    sm: '16',
    md: '18',
    lg: '20'
  }
  return sizeMap[props.size]
})

// حالة الحقل
const currentState = computed(() => {
  if (props.disabled) return 'disabled'
  if (props.readonly) return 'readonly'
  if (props.loading) return 'loading'
  if (isInvalid.value) return 'error'
  if (isFocused.value) return 'focused'
  if (props.modelValue) return 'filled'
  return 'default'
})

// التحقق من صحة البيانات
const isInvalid = computed(() => {
  return !!props.errorMessage
})

// عرض زر المسح
const showClearButton = computed(() => {
  return props.clearable && 
         !props.disabled && 
         !props.readonly && 
         props.modelValue && 
         String(props.modelValue).length > 0
})

// عرض زر إظهار كلمة المرور
const showPasswordToggle = computed(() => {
  return props.type === 'password' && 
         !props.disabled && 
         !props.readonly
})

// عداد الأحرف
const characterCount = computed(() => {
  return String(props.modelValue || '').length
})

const isOverLimit = computed(() => {
  return props.maxlength && characterCount.value > props.maxlength
})

const showCounter = computed(() => {
  return props.counter && props.maxlength
})

// نص المساعدة
const showHelpText = computed(() => {
  return props.errorMessage || props.hint || showCounter.value
})

// الوصف للـ Accessibility
const ariaDescribedBy = computed(() => {
  const descriptions = []
  if (props.errorMessage) descriptions.push(`${inputId}-error`)
  if (props.hint) descriptions.push(`${inputId}-hint`)
  return descriptions.length > 0 ? descriptions.join(' ') : undefined
})

// فئات CSS
const containerClasses = computed(() => [
  'input',
  `input--${props.size}`,
  `input--${props.variant}`,
  {
    'input--rounded': props.rounded,
    'input--disabled': props.disabled,
    'input--readonly': props.readonly,
    'input--loading': props.loading,
    'input--error': isInvalid.value,
    'input--focused': isFocused.value,
    'input--filled': !!props.modelValue
  }
])

const inputClasses = computed(() => [
  'input__field'
])

// معالجات الأحداث
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  // تحويل الرقم إذا كان النوع رقمي
  if (props.type === 'number' && value !== '') {
    value = Number(value)
  }
  
  emit('update:modelValue', value)
  emit('input', event)
}

const handleChange = (event: Event) => {
  emit('change', event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const handlePaste = (event: ClipboardEvent) => {
  emit('paste', event)
}

// مسح المحتوى
const clearInput = () => {
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// تبديل إظهار كلمة المرور
const togglePasswordVisibility = () => {
  showPasswordState.value = !showPasswordState.value
}

// طرق عامة
const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

const select = () => {
  inputRef.value?.select()
}

// تصدير الطرق للاستخدام الخارجي
defineExpose({
  focus,
  blur,
  select,
  inputRef
})
</script>

<style lang="scss" scoped>
@import '@/styles/foundation/variables';
@import '@/styles/utilities/mixins';

.input {
  // الأساسيات
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  
  // ===============================
  // 🏷️ LABEL - التسمية
  // ===============================
  
  &__label {
    @include text-style("body-small");
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-medium);
    
    .input__required {
      color: var(--color-error);
      margin-right: 2px;
    }
    
    // حالة التركيز
    .input--focused & {
      color: var(--color-primary);
    }
    
    // حالة الخطأ
    .input--error & {
      color: var(--color-error);
    }
  }
  
  // ===============================
  // 📦 CONTAINER - الحاوي
  // ===============================
  
  &__container {
    position: relative;
    display: flex;
    align-items: center;
    @include transition(all, "fast");
    
    // تحسينات RTL
    direction: rtl;
  }
  
  // ===============================
  // 📝 INPUT FIELD - الحقل
  // ===============================
  
  &__field {
    // الأساسيات
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    
    // النص والخط
    font-family: var(--font-family-primary);
    color: var(--color-text-primary);
    
    // إزالة التنسيق الافتراضي
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: textfield;
    
    // إخفاء أزرار الرقم في Chrome
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    // placeholder
    &::placeholder {
      color: var(--color-text-disabled);
      opacity: 1;
    }
    
    // حالات التفاعل
    &:focus {
      outline: none;
    }
    
    &:disabled {
      color: var(--color-text-disabled);
      cursor: not-allowed;
    }
    
    &:readonly {
      cursor: default;
    }
  }
  
  // ===============================
  // 🎨 VARIANTS - الأنواع
  // ===============================
  
  // النوع المحاط
  &--outlined {
    .input__container {
      border: 2px solid var(--color-border);
      @include border-radius("md");
      background-color: var(--color-surface);
    }
    
    &.input--focused .input__container {
      border-color: var(--color-primary);
      @include elevation(1);
    }
    
    &.input--error .input__container {
      border-color: var(--color-error);
    }
  }
  
  // النوع المملوء
  &--filled {
    .input__container {
      background-color: var(--color-surface-variant);
      border: 2px solid transparent;
      @include border-radius("md", "md", 0, 0);
      border-bottom: 2px solid var(--color-border);
    }
    
    &.input--focused .input__container {
      border-bottom-color: var(--color-primary);
      background-color: var(--color-surface);
    }
    
    &.input--error .input__container {
      border-bottom-color: var(--color-error);
    }
  }
  
  // النوع السفلي
  &--underlined {
    .input__container {
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--color-border);
      border-radius: 0;
      padding: var(--spacing-sm) 0;
    }
    
    &.input--focused .input__container {
      border-bottom: 2px solid var(--color-primary);
    }
    
    &.input--error .input__container {
      border-bottom: 2px solid var(--color-error);
    }
  }
  
  // ===============================
  // 📏 SIZES - الأحجام
  // ===============================
  
  &--sm {
    .input__container {
      min-height: 2rem;
      padding: 0 var(--spacing-sm);
    }
    
    .input__field {
      @include text-style("body-small");
    }
    
    .input__prepend,
    .input__append {
      padding: 0 var(--spacing-xs);
    }
  }
  
  &--md {
    .input__container {
      min-height: 2.5rem;
      padding: 0 var(--spacing-md);
    }
    
    .input__field {
      @include text-style("body");
    }
    
    .input__prepend,
    .input__append {
      padding: 0 var(--spacing-sm);
    }
  }
  
  &--lg {
    .input__container {
      min-height: 3rem;
      padding: 0 var(--spacing-lg);
    }
    
    .input__field {
      @include text-style("body-large");
    }
    
    .input__prepend,
    .input__append {
      padding: 0 var(--spacing-md);
    }
  }
  
  // ===============================
  // 🔘 SHAPES - الأشكال
  // ===============================
  
  &--rounded {
    .input__container {
      @include border-radius("full");
    }
  }
  
  // ===============================
  // 🎯 ICONS & ACTIONS
  // ===============================
  
  &__prepend,
  &__append {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--color-text-secondary);
    
    .input--focused & {
      color: var(--color-primary);
    }
    
    .input--error & {
      color: var(--color-error);
    }
  }
  
  &__prepend {
    margin-left: calc(var(--spacing-sm) * -0.5);
  }
  
  &__append {
    margin-right: calc(var(--spacing-sm) * -0.5);
  }
  
  &__icon {
    flex-shrink: 0;
  }
  
  &__clear,
  &__password-toggle {
    @include size(1.5rem);
    @include flex-center;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-secondary);
    @include border-radius("sm");
    @include transition(all, "fast");
    
    &:hover {
      background-color: var(--color-hover);
      color: var(--color-text-primary);
    }
    
    &:focus-visible {
      @include focus-effect;
    }
  }
  
  &__loading {
    position: absolute;
    left: var(--spacing-md);
    
    .input__loading-icon {
      animation: input-spin 1s linear infinite;
    }
  }
  
  // ===============================
  // 📝 HELP TEXT - النص المساعد
  // ===============================
  
  &__help {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-sm);
  }
  
  &__error {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    @include text-style("caption");
    color: var(--color-error);
    flex: 1;
  }
  
  &__hint {
    @include text-style("caption");
    color: var(--color-text-secondary);
    flex: 1;
  }
  
  &__counter {
    @include text-style("caption");
    color: var(--color-text-secondary);
    white-space: nowrap;
    
    &--error {
      color: var(--color-error);
    }
  }
  
  // ===============================
  // 🔄 STATES - الحالات
  // ===============================
  
  &--disabled {
    opacity: map-get($opacity, "60");
    pointer-events: none;
    
    .input__container {
      background-color: var(--color-surface-disabled);
      border-color: var(--color-border-disabled);
    }
  }
  
  &--readonly {
    .input__container {
      background-color: var(--color-surface-variant);
    }
  }
  
  &--loading {
    pointer-events: none;
  }
  
  &--error {
    .input__container {
      border-color: var(--color-error);
    }
  }
}

// ===============================
// 🎬 ANIMATIONS
// ===============================

@keyframes input-spin {
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
  .input {
    &--lg {
      .input__container {
        min-height: 2.75rem;
      }
    }
  }
}

// ===============================
// 🌙 THEME VARIATIONS
// ===============================

[data-theme="dark"] {
  .input {
    &--filled {
      .input__container {
        background-color: var(--color-surface-container);
      }
    }
  }
}

// ===============================
// 🎯 ACCESSIBILITY
// ===============================

@media (prefers-reduced-motion: reduce) {
  .input {
    .input__container,
    .input__loading-icon {
      transition: none !important;
      animation: none !important;
    }
  }
}

// ===============================
// 📄 PRINT STYLES
// ===============================

@media print {
  .input {
    .input__container {
      border: 1px solid #000 !important;
      background: #fff !important;
    }
    
    .input__clear,
    .input__password-toggle,
    .input__loading {
      display: none !important;
    }
  }
}
</style> 