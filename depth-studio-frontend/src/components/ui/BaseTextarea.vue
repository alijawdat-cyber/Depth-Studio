<!--
  ==============================================
  DEPTH STUDIO - مكون منطقة النص الأساسي
  Base Textarea Component
  ==============================================
-->

<template>
  <div
    :class="containerClasses"
    :data-textarea-state="currentState"
  >
    <!-- تسمية الحقل -->
    <label
      v-if="label || $slots.label"
      :for="textareaId"
      class="textarea__label"
    >
      <slot name="label">
        {{ label }}
        <span
          v-if="required"
          class="textarea__required"
          aria-label="مطلوب"
        >*</span>
      </slot>
    </label>
    
    <!-- حاوي منطقة النص -->
    <div class="textarea__container">
      <!-- منطقة النص -->
      <textarea
        :id="textareaId"
        ref="textareaRef"
        :class="textareaClasses"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :minlength="minlength"
        :rows="computedRows"
        :cols="cols"
        :wrap="wrap"
        :spellcheck="spellcheck"
        :autocomplete="autocomplete"
        :aria-invalid="isInvalid"
        :aria-describedby="ariaDescribedBy"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @paste="handlePaste"
        @scroll="handleScroll"
        v-bind="$attrs"
      />
      
      <!-- مؤشر التحميل -->
      <div
        v-if="loading"
        class="textarea__loading"
      >
        <Icon
          name="loading"
          size="18"
          class="textarea__loading-icon"
        />
      </div>
      
      <!-- زر تغيير الحجم (اختياري) -->
      <div
        v-if="showResizer"
        class="textarea__resizer"
        @mousedown="startResize"
        @touchstart="startResize"
      >
        <Icon name="resize" size="14" />
      </div>
    </div>
    
    <!-- نص المساعدة والأخطاء -->
    <div
      v-if="showHelpText"
      class="textarea__help"
    >
      <!-- رسالة الخطأ -->
      <div
        v-if="isInvalid && errorMessage"
        class="textarea__error"
        role="alert"
        :id="`${textareaId}-error`"
      >
        <Icon name="alert-circle" size="16" />
        <span>{{ errorMessage }}</span>
      </div>
      
      <!-- نص المساعدة -->
      <div
        v-else-if="hint"
        class="textarea__hint"
        :id="`${textareaId}-hint`"
      >
        {{ hint }}
      </div>
      
      <!-- عداد الأحرف والكلمات -->
      <div
        v-if="showCounter"
        class="textarea__counter"
      >
        <div
          v-if="showCharacterCount"
          class="counter__characters"
          :class="{ 'counter--error': isOverCharLimit }"
        >
          {{ characterCount }}
          <span v-if="maxlength">/{{ maxlength }}</span>
          حرف
        </div>
        
        <div
          v-if="showWordCount"
          class="counter__words"
        >
          {{ wordCount }} كلمة
        </div>
        
        <div
          v-if="showLineCount"
          class="counter__lines"
        >
          {{ lineCount }} سطر
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch, useId, onMounted, onUnmounted } from 'vue'
import Icon from './BaseIcon.vue'

export interface TextareaProps {
  // القيمة
  modelValue?: string
  // التسمية والمساعدة
  label?: string
  placeholder?: string
  hint?: string
  // الحجم والشكل
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outlined' | 'filled' | 'underlined'
  rounded?: boolean
  // صفوف النص
  rows?: number
  minRows?: number
  maxRows?: number
  autoResize?: boolean
  cols?: number
  // الحالة
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  loading?: boolean
  // التحقق
  errorMessage?: string
  rules?: Function[]
  // خصائص HTML
  maxlength?: number
  minlength?: number
  wrap?: 'soft' | 'hard' | 'off'
  spellcheck?: boolean
  autocomplete?: string
  // العدادات
  counter?: boolean
  showCharacterCount?: boolean
  showWordCount?: boolean
  showLineCount?: boolean
  // إعدادات إضافية
  resizable?: boolean
  showResizer?: boolean
}

const props = withDefaults(defineProps<TextareaProps>(), {
  size: 'md',
  variant: 'outlined',
  rounded: false,
  rows: 4,
  minRows: 2,
  maxRows: 20,
  autoResize: false,
  disabled: false,
  readonly: false,
  required: false,
  loading: false,
  wrap: 'soft',
  spellcheck: true,
  counter: false,
  showCharacterCount: true,
  showWordCount: false,
  showLineCount: false,
  resizable: false,
  showResizer: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'input': [event: Event]
  'change': [event: Event]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'keydown': [event: KeyboardEvent]
  'paste': [event: ClipboardEvent]
  'resize': [dimensions: { width: number; height: number }]
}>()

// المراجع
const textareaRef = ref<HTMLTextAreaElement>()
const isFocused = ref(false)
const isResizing = ref(false)

// معرف فريد للحقل
const textareaId = useId()

// حساب الصفوف
const computedRows = computed(() => {
  if (props.autoResize) {
    const lines = String(props.modelValue || '').split('\n').length
    return Math.min(Math.max(lines, props.minRows), props.maxRows)
  }
  return props.rows
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

// عدادات النص
const characterCount = computed(() => {
  return String(props.modelValue || '').length
})

const wordCount = computed(() => {
  const text = String(props.modelValue || '').trim()
  if (!text) return 0
  return text.split(/\s+/).filter(word => word.length > 0).length
})

const lineCount = computed(() => {
  return String(props.modelValue || '').split('\n').length
})

const isOverCharLimit = computed(() => {
  return props.maxlength && characterCount.value > props.maxlength
})

// عرض العدادات
const showCounter = computed(() => {
  return props.counter && (props.showCharacterCount || props.showWordCount || props.showLineCount)
})

// نص المساعدة
const showHelpText = computed(() => {
  return props.errorMessage || props.hint || showCounter.value
})

// الوصف للـ Accessibility
const ariaDescribedBy = computed(() => {
  const descriptions = []
  if (props.errorMessage) descriptions.push(`${textareaId}-error`)
  if (props.hint) descriptions.push(`${textareaId}-hint`)
  return descriptions.length > 0 ? descriptions.join(' ') : undefined
})

// فئات CSS
const containerClasses = computed(() => [
  'textarea',
  `textarea--${props.size}`,
  `textarea--${props.variant}`,
  {
    'textarea--rounded': props.rounded,
    'textarea--disabled': props.disabled,
    'textarea--readonly': props.readonly,
    'textarea--loading': props.loading,
    'textarea--error': isInvalid.value,
    'textarea--focused': isFocused.value,
    'textarea--filled': !!props.modelValue,
    'textarea--auto-resize': props.autoResize,
    'textarea--resizable': props.resizable,
    'textarea--resizing': isResizing.value
  }
])

const textareaClasses = computed(() => [
  'textarea__field'
])

// معالجات الأحداث
const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const value = target.value
  
  emit('update:modelValue', value)
  emit('input', event)
  
  // تحديث الحجم التلقائي
  if (props.autoResize) {
    nextTick(() => {
      adjustHeight()
    })
  }
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
  
  // اختصارات لوحة المفاتيح
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'Enter':
        // Ctrl+Enter للحفظ أو الإرسال
        event.preventDefault()
        // يمكن إضافة منطق مخصص هنا
        break
    }
  }
}

const handlePaste = (event: ClipboardEvent) => {
  emit('paste', event)
}

const handleScroll = (event: Event) => {
  // يمكن استخدامها لمزامنة التمرير مع عناصر أخرى
}

// تعديل الارتفاع التلقائي
const adjustHeight = () => {
  if (!textareaRef.value || !props.autoResize) return
  
  const textarea = textareaRef.value
  textarea.style.height = 'auto'
  
  const minHeight = props.minRows * 24 // تقدير ارتفاع السطر
  const maxHeight = props.maxRows * 24
  const scrollHeight = textarea.scrollHeight
  
  const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
  textarea.style.height = `${newHeight}px`
}

// تغيير الحجم اليدوي
const startResize = (event: MouseEvent | TouchEvent) => {
  if (!props.resizable || !textareaRef.value) return
  
  event.preventDefault()
  isResizing.value = true
  
  const textarea = textareaRef.value
  const startX = 'clientX' in event ? event.clientX : event.touches[0].clientX
  const startY = 'clientY' in event ? event.clientY : event.touches[0].clientY
  const startWidth = textarea.offsetWidth
  const startHeight = textarea.offsetHeight
  
  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY
    
    const newWidth = startWidth + (clientX - startX)
    const newHeight = startHeight + (clientY - startY)
    
    textarea.style.width = `${Math.max(newWidth, 200)}px`
    textarea.style.height = `${Math.max(newHeight, 60)}px`
    
    emit('resize', { width: newWidth, height: newHeight })
  }
  
  const handleMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('touchmove', handleMouseMove)
    document.removeEventListener('touchend', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('touchmove', handleMouseMove)
  document.addEventListener('touchend', handleMouseUp)
}

// مراقبة التغييرات للحجم التلقائي
watch(() => props.modelValue, () => {
  if (props.autoResize) {
    nextTick(() => {
      adjustHeight()
    })
  }
})

// التهيئة
onMounted(() => {
  if (props.autoResize) {
    adjustHeight()
  }
})

// طرق عامة
const focus = () => {
  textareaRef.value?.focus()
}

const blur = () => {
  textareaRef.value?.blur()
}

const select = () => {
  textareaRef.value?.select()
}

const insertText = (text: string, position?: number) => {
  if (!textareaRef.value) return
  
  const textarea = textareaRef.value
  const start = position !== undefined ? position : textarea.selectionStart
  const end = textarea.selectionEnd
  const currentValue = String(props.modelValue || '')
  
  const newValue = currentValue.substring(0, start) + text + currentValue.substring(end)
  emit('update:modelValue', newValue)
  
  nextTick(() => {
    textarea.setSelectionRange(start + text.length, start + text.length)
  })
}

// تصدير الطرق للاستخدام الخارجي
defineExpose({
  focus,
  blur,
  select,
  insertText,
  textareaRef
})
</script>

<style lang="scss" scoped>
@import '@/styles/foundation/variables';
@import '@/styles/utilities/mixins';

.textarea {
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
    
    .textarea__required {
      color: var(--color-error);
      margin-right: 2px;
    }
    
    // حالة التركيز
    .textarea--focused & {
      color: var(--color-primary);
    }
    
    // حالة الخطأ
    .textarea--error & {
      color: var(--color-error);
    }
  }
  
  // ===============================
  // 📦 CONTAINER - الحاوي
  // ===============================
  
  &__container {
    position: relative;
    @include transition(all, "fast");
    
    // تحسينات RTL
    direction: rtl;
  }
  
  // ===============================
  // 📝 TEXTAREA FIELD - منطقة النص
  // ===============================
  
  &__field {
    // الأساسيات
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    resize: none;
    
    // النص والخط
    font-family: var(--font-family-primary);
    color: var(--color-text-primary);
    line-height: var(--line-height-relaxed);
    
    // إزالة التنسيق الافتراضي
    appearance: none;
    -webkit-appearance: none;
    
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
    
    // التمرير المخصص
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: var(--color-surface-variant);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--color-outline);
      border-radius: 3px;
      
      &:hover {
        background: var(--color-outline-variant);
      }
    }
  }
  
  // ===============================
  // 🎨 VARIANTS - الأنواع
  // ===============================
  
  // النوع المحاط
  &--outlined {
    .textarea__container {
      border: 2px solid var(--color-border);
      @include border-radius("md");
      background-color: var(--color-surface);
    }
    
    .textarea__field {
      padding: var(--spacing-sm) var(--spacing-md);
    }
    
    &.textarea--focused .textarea__container {
      border-color: var(--color-primary);
      @include elevation(1);
    }
    
    &.textarea--error .textarea__container {
      border-color: var(--color-error);
    }
  }
  
  // النوع المملوء
  &--filled {
    .textarea__container {
      background-color: var(--color-surface-variant);
      border: 2px solid transparent;
      @include border-radius("md", "md", 0, 0);
      border-bottom: 2px solid var(--color-border);
    }
    
    .textarea__field {
      padding: var(--spacing-md);
    }
    
    &.textarea--focused .textarea__container {
      border-bottom-color: var(--color-primary);
      background-color: var(--color-surface);
    }
    
    &.textarea--error .textarea__container {
      border-bottom-color: var(--color-error);
    }
  }
  
  // النوع السفلي
  &--underlined {
    .textarea__container {
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--color-border);
      border-radius: 0;
    }
    
    .textarea__field {
      padding: var(--spacing-sm) 0;
    }
    
    &.textarea--focused .textarea__container {
      border-bottom: 2px solid var(--color-primary);
    }
    
    &.textarea--error .textarea__container {
      border-bottom: 2px solid var(--color-error);
    }
  }
  
  // ===============================
  // 📏 SIZES - الأحجام
  // ===============================
  
  &--sm {
    .textarea__field {
      @include text-style("body-small");
    }
  }
  
  &--md {
    .textarea__field {
      @include text-style("body");
    }
  }
  
  &--lg {
    .textarea__field {
      @include text-style("body-large");
    }
  }
  
  // ===============================
  // 🔘 SHAPES - الأشكال
  // ===============================
  
  &--rounded {
    .textarea__container {
      @include border-radius("lg");
    }
  }
  
  // ===============================
  // 🔧 SPECIAL FEATURES
  // ===============================
  
  &--auto-resize {
    .textarea__field {
      overflow: hidden;
      resize: none;
    }
  }
  
  &--resizable {
    .textarea__field {
      resize: both;
      min-width: 200px;
      min-height: 60px;
    }
  }
  
  &--resizing {
    user-select: none;
    
    .textarea__field {
      pointer-events: none;
    }
  }
  
  // ===============================
  // 🎯 LOADING & RESIZER
  // ===============================
  
  &__loading {
    position: absolute;
    top: var(--spacing-sm);
    left: var(--spacing-sm);
    
    .textarea__loading-icon {
      animation: textarea-spin 1s linear infinite;
    }
  }
  
  &__resizer {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 16px;
    height: 16px;
    cursor: se-resize;
    background: var(--color-surface-variant);
    @include border-radius("sm", 0, 0, 0);
    @include flex-center;
    opacity: 0;
    @include transition(opacity, "fast");
    
    .textarea:hover & {
      opacity: 1;
    }
    
    &:hover {
      background: var(--color-primary);
      color: var(--color-on-primary);
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
    flex-wrap: wrap;
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
    display: flex;
    gap: var(--spacing-sm);
    @include text-style("caption");
    color: var(--color-text-secondary);
    white-space: nowrap;
    
    .counter__characters {
      &.counter--error {
        color: var(--color-error);
      }
    }
  }
  
  // ===============================
  // 🔄 STATES - الحالات
  // ===============================
  
  &--disabled {
    opacity: map-get($opacity, "60");
    pointer-events: none;
    
    .textarea__container {
      background-color: var(--color-surface-disabled);
      border-color: var(--color-border-disabled);
    }
  }
  
  &--readonly {
    .textarea__container {
      background-color: var(--color-surface-variant);
    }
    
    .textarea__field {
      cursor: default;
    }
  }
  
  &--loading {
    pointer-events: none;
  }
  
  &--error {
    .textarea__container {
      border-color: var(--color-error);
    }
  }
}

// ===============================
// 🎬 ANIMATIONS
// ===============================

@keyframes textarea-spin {
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
  .textarea {
    &--lg {
      .textarea__field {
        @include text-style("body");
      }
    }
    
    &__counter {
      flex-direction: column;
      gap: var(--spacing-xs);
    }
  }
}

// ===============================
// 🌙 THEME VARIATIONS
// ===============================

[data-theme="dark"] {
  .textarea {
    &--filled {
      .textarea__container {
        background-color: var(--color-surface-container);
      }
    }
    
    &__field {
      &::-webkit-scrollbar-track {
        background: var(--color-surface-container);
      }
      
      &::-webkit-scrollbar-thumb {
        background: var(--color-outline-variant);
      }
    }
  }
}

// ===============================
// 🎯 ACCESSIBILITY
// ===============================

@media (prefers-reduced-motion: reduce) {
  .textarea {
    .textarea__container,
    .textarea__loading-icon {
      transition: none !important;
      animation: none !important;
    }
  }
}

// ===============================
// 📄 PRINT STYLES
// ===============================

@media print {
  .textarea {
    .textarea__container {
      border: 1px solid #000 !important;
      background: #fff !important;
    }
    
    .textarea__loading,
    .textarea__resizer {
      display: none !important;
    }
    
    .textarea__field {
      resize: none !important;
    }
  }
}
</style> 