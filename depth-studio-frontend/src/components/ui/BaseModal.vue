<!--
  ==============================================
  DEPTH STUDIO - مكون النافذة المنبثقة الأساسي
  Base Modal Component
  ==============================================
-->

<template>
  <!-- الخلفية المعتمة -->
  <Teleport to="body">
    <Transition
      name="modal-backdrop"
      appear
    >
      <div
        v-if="isOpen"
        :class="backdropClasses"
        @click="handleBackdropClick"
        @keydown.esc="handleEscapeKey"
        tabindex="-1"
      >
        <!-- النافذة المنبثقة -->
        <Transition
          name="modal-content"
          appear
        >
          <div
            v-if="isOpen"
            ref="modalRef"
            :class="modalClasses"
            :style="modalStyles"
            role="dialog"
            :aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="contentId"
            @click.stop
          >
            <!-- رأس النافذة -->
            <div
              v-if="showHeader"
              class="modal__header"
            >
              <div class="modal__header-content">
                <!-- العنوان -->
                <div class="modal__title-section">
                  <slot name="header">
                    <h2
                      v-if="title"
                      :id="titleId"
                      class="modal__title"
                    >
                      {{ title }}
                    </h2>
                    <p
                      v-if="subtitle"
                      class="modal__subtitle"
                    >
                      {{ subtitle }}
                    </p>
                  </slot>
                </div>
                
                <!-- الأدوات -->
                <div class="modal__header-actions">
                  <slot name="header-actions">
                    <!-- زر الإغلاق -->
                    <BaseButton
                      v-if="closable"
                      variant="text"
                      size="sm"
                      icon
                      @click="handleClose"
                      :aria-label="closeAriaLabel"
                      class="modal__close-btn"
                    >
                      <Icon name="close" size="20" />
                    </BaseButton>
                  </slot>
                </div>
              </div>
              
              <!-- فاصل -->
              <div
                v-if="showDivider"
                class="modal__divider"
              ></div>
            </div>

            <!-- محتوى النافذة -->
            <div
              :id="contentId"
              :class="contentClasses"
            >
              <!-- حالة التحميل -->
              <div
                v-if="loading"
                class="modal__loading"
              >
                <Icon name="loading" size="32" class="modal__loading-icon" />
                <span class="modal__loading-text">{{ loadingText }}</span>
              </div>
              
              <!-- المحتوى الأساسي -->
              <div
                v-else
                class="modal__body"
              >
                <slot :close="handleClose" />
              </div>
            </div>

            <!-- ذيل النافذة -->
            <div
              v-if="showFooter"
              class="modal__footer"
            >
              <slot name="footer" :close="handleClose">
                <div class="modal__footer-actions">
                  <BaseButton
                    v-if="showCancelButton"
                    :variant="cancelButtonVariant"
                    :color="cancelButtonColor"
                    :size="buttonSize"
                    :disabled="processing"
                    @click="handleCancel"
                  >
                    {{ cancelButtonText }}
                  </BaseButton>
                  
                  <BaseButton
                    v-if="showConfirmButton"
                    :variant="confirmButtonVariant"
                    :color="confirmButtonColor"
                    :size="buttonSize"
                    :loading="processing"
                    :disabled="!canConfirm"
                    @click="handleConfirm"
                  >
                    {{ confirmButtonText }}
                  </BaseButton>
                </div>
              </slot>
            </div>

            <!-- مؤشر الحجم -->
            <div
              v-if="resizable"
              class="modal__resize-handle"
              @mousedown="startResize"
            >
              <Icon name="resize" size="16" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted, useId } from 'vue'
import BaseButton from './BaseButton.vue'
import Icon from './BaseIcon.vue'

export interface ModalProps {
  // التحكم في الظهور
  modelValue?: boolean
  // المحتوى
  title?: string
  subtitle?: string
  // الحجم والشكل
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  maxWidth?: string | number
  maxHeight?: string | number
  width?: string | number
  height?: string | number
  // السلوك
  persistent?: boolean
  closable?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  // التخطيط
  centered?: boolean
  fullscreen?: boolean
  scrollable?: boolean
  // الحالة
  loading?: boolean
  processing?: boolean
  disabled?: boolean
  // النصوص
  loadingText?: string
  closeAriaLabel?: string
  // الأزرار
  showCancelButton?: boolean
  showConfirmButton?: boolean
  cancelButtonText?: string
  confirmButtonText?: string
  cancelButtonVariant?: 'filled' | 'outlined' | 'text'
  confirmButtonVariant?: 'filled' | 'outlined' | 'text'
  cancelButtonColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'surface'
  confirmButtonColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'surface'
  buttonSize?: 'sm' | 'md' | 'lg'
  canConfirm?: boolean
  // العرض
  showHeader?: boolean
  showFooter?: boolean
  showDivider?: boolean
  backdrop?: boolean
  backdropBlur?: boolean
  // متقدم
  zIndex?: number
  transition?: string
  resizable?: boolean
  draggable?: boolean
  // إمكانية الوصول
  returnFocus?: boolean
  trapFocus?: boolean
}

const props = withDefaults(defineProps<ModalProps>(), {
  modelValue: false,
  size: 'md',
  persistent: false,
  closable: true,
  closeOnBackdrop: true,
  closeOnEscape: true,
  centered: true,
  fullscreen: false,
  scrollable: false,
  loading: false,
  processing: false,
  disabled: false,
  loadingText: 'جاري التحميل...',
  closeAriaLabel: 'إغلاق النافذة',
  showCancelButton: false,
  showConfirmButton: false,
  cancelButtonText: 'إلغاء',
  confirmButtonText: 'تأكيد',
  cancelButtonVariant: 'outlined',
  confirmButtonVariant: 'filled',
  cancelButtonColor: 'secondary',
  confirmButtonColor: 'primary',
  buttonSize: 'md',
  canConfirm: true,
  showHeader: true,
  showFooter: false,
  showDivider: true,
  backdrop: true,
  backdropBlur: false,
  zIndex: 1000,
  resizable: false,
  draggable: false,
  returnFocus: true,
  trapFocus: true
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'open': []
  'close': []
  'cancel': []
  'confirm': []
  'backdrop-click': []
  'escape-key': []
}>()

// المراجع والحالة
const modalRef = ref<HTMLDivElement>()
const isOpen = ref(props.modelValue)
const previousActiveElement = ref<HTMLElement | null>(null)

// المعرفات الفريدة
const titleId = useId()
const contentId = useId()

// حساب الفئات والأنماط
const backdropClasses = computed(() => [
  'modal-backdrop',
  {
    'modal-backdrop--blur': props.backdropBlur,
    'modal-backdrop--no-backdrop': !props.backdrop
  }
])

const modalClasses = computed(() => [
  'modal',
  `modal--${props.size}`,
  {
    'modal--centered': props.centered,
    'modal--fullscreen': props.fullscreen,
    'modal--scrollable': props.scrollable,
    'modal--loading': props.loading,
    'modal--processing': props.processing,
    'modal--disabled': props.disabled,
    'modal--resizable': props.resizable,
    'modal--draggable': props.draggable
  }
])

const contentClasses = computed(() => [
  'modal__content',
  {
    'modal__content--scrollable': props.scrollable
  }
])

const modalStyles = computed(() => {
  const styles: any = {}
  
  if (props.maxWidth) styles.maxWidth = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
  if (props.maxHeight) styles.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  if (props.width) styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  if (props.height) styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  if (props.zIndex) styles.zIndex = props.zIndex
  
  return styles
})

// معالجات الأحداث
const handleBackdropClick = () => {
  emit('backdrop-click')
  
  if (props.closeOnBackdrop && !props.persistent) {
    handleClose()
  }
}

const handleEscapeKey = () => {
  emit('escape-key')
  
  if (props.closeOnEscape && !props.persistent) {
    handleClose()
  }
}

const handleClose = () => {
  if (props.processing || props.disabled) return
  
  isOpen.value = false
  emit('update:modelValue', false)
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  handleClose()
}

const handleConfirm = () => {
  emit('confirm')
}

// إدارة التركيز
const trapTabKey = (event: KeyboardEvent) => {
  if (!props.trapFocus || !modalRef.value) return
  
  const focusableElements = modalRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  if (event.shiftKey) {
    if (document.activeElement === firstElement) {
      lastElement?.focus()
      event.preventDefault()
    }
  } else {
    if (document.activeElement === lastElement) {
      firstElement?.focus()
      event.preventDefault()
    }
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Tab') {
    trapTabKey(event)
  } else if (event.key === 'Escape') {
    handleEscapeKey()
  }
}

// معالجة تغيير الحجم
const startResize = (event: MouseEvent) => {
  if (!props.resizable || !modalRef.value) return
  
  event.preventDefault()
  
  const modal = modalRef.value
  const startX = event.clientX
  const startY = event.clientY
  const startWidth = parseInt(getComputedStyle(modal, null).getPropertyValue('width'))
  const startHeight = parseInt(getComputedStyle(modal, null).getPropertyValue('height'))
  
  const doResize = (e: MouseEvent) => {
    const newWidth = startWidth + e.clientX - startX
    const newHeight = startHeight + e.clientY - startY
    
    modal.style.width = `${Math.max(300, newWidth)}px`
    modal.style.height = `${Math.max(200, newHeight)}px`
  }
  
  const stopResize = () => {
    document.removeEventListener('mousemove', doResize)
    document.removeEventListener('mouseup', stopResize)
  }
  
  document.addEventListener('mousemove', doResize)
  document.addEventListener('mouseup', stopResize)
}

// مراقبة التغييرات
watch(() => props.modelValue, (newValue) => {
  if (newValue !== isOpen.value) {
    isOpen.value = newValue
    
    if (newValue) {
      emit('open')
      nextTick(() => {
        // حفظ العنصر النشط الحالي
        if (props.returnFocus) {
          previousActiveElement.value = document.activeElement as HTMLElement
        }
        
        // التركيز على النافذة
        if (props.trapFocus && modalRef.value) {
          const firstFocusable = modalRef.value.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement
          
          if (firstFocusable) {
            firstFocusable.focus()
          } else {
            modalRef.value.focus()
          }
        }
      })
    } else {
      // إرجاع التركيز
      if (props.returnFocus && previousActiveElement.value) {
        previousActiveElement.value.focus()
        previousActiveElement.value = null
      }
    }
  }
})

// إدارة الأحداث العامة
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  
  // منع التمرير في الخلفية
  if (isOpen.value) {
    document.body.style.overflow = 'hidden'
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
  
  // إرجاع التركيز عند الإزالة
  if (props.returnFocus && previousActiveElement.value) {
    previousActiveElement.value.focus()
  }
})

// مراقبة حالة الفتح لإدارة التمرير
watch(isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// تصدير المراجع والطرق
defineExpose({
  modalRef,
  close: handleClose,
  isOpen
})
</script>

<style lang="scss" scoped>
@import '@/styles/foundation/variables';
@import '@/styles/utilities/mixins';

// ===============================
// 🌫️ MODAL BACKDROP
// ===============================

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--z-index-modal);
  
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  
  background-color: rgba(0, 0, 0, 0.5);
  @include transition(all, "base");
  
  &--blur {
    @include backdrop-blur;
  }
  
  &--no-backdrop {
    background-color: transparent;
    pointer-events: none;
    
    .modal {
      pointer-events: auto;
    }
  }
}

// ===============================
// 🪟 MODAL WINDOW
// ===============================

.modal {
  // الأساسيات
  position: relative;
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  @include border-radius("lg");
  @include elevation(8);
  overflow: hidden;
  max-height: 90vh;
  max-width: 90vw;
  @include transition(all, "base");
  
  // التركيز
  outline: none;
  
  &:focus-visible {
    @include focus-effect;
  }
  
  // ===============================
  // 📏 SIZES - الأحجام
  // ===============================
  
  &--xs {
    width: 320px;
    max-width: 320px;
  }
  
  &--sm {
    width: 400px;
    max-width: 400px;
  }
  
  &--md {
    width: 500px;
    max-width: 500px;
  }
  
  &--lg {
    width: 700px;
    max-width: 700px;
  }
  
  &--xl {
    width: 900px;
    max-width: 900px;
  }
  
  &--full {
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }
  
  // ===============================
  // 🎯 LAYOUT OPTIONS
  // ===============================
  
  &--centered {
    // موضع في المنتصف افتراضياً
  }
  
  &--fullscreen {
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }
  
  &--scrollable {
    .modal__content {
      overflow-y: auto;
      flex: 1;
    }
  }
  
  &--resizable {
    resize: both;
    min-width: 300px;
    min-height: 200px;
  }
  
  &--draggable {
    .modal__header {
      cursor: move;
    }
  }
  
  // ===============================
  // 🔄 STATES - الحالات
  // ===============================
  
  &--loading {
    pointer-events: none;
  }
  
  &--processing {
    .modal__footer {
      pointer-events: none;
    }
  }
  
  &--disabled {
    @include disabled-effect;
  }
}

// ===============================
// 🎯 MODAL HEADER
// ===============================

.modal__header {
  flex-shrink: 0;
  
  &-content {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }
}

.modal__title-section {
  flex: 1;
  min-width: 0;
}

.modal__title {
  @include text-style("heading-5");
  color: var(--color-text-primary);
  margin: 0;
  word-wrap: break-word;
}

.modal__subtitle {
  @include text-style("body-small");
  color: var(--color-text-secondary);
  margin: var(--spacing-xs) 0 0 0;
}

.modal__header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.modal__close-btn {
  color: var(--color-text-secondary);
  
  &:hover {
    color: var(--color-text-primary);
    background-color: var(--color-hover);
  }
}

.modal__divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 0 var(--spacing-lg);
}

// ===============================
// 📄 MODAL CONTENT
// ===============================

.modal__content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  
  &--scrollable {
    overflow-y: auto;
    
    // تحسين التمرير
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;
    
    &::-webkit-scrollbar {
      width: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: var(--color-border);
      @include border-radius("sm");
      
      &:hover {
        background-color: var(--color-text-secondary);
      }
    }
  }
}

.modal__loading {
  @include flex-center;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl);
  color: var(--color-text-secondary);
  
  &-icon {
    animation: modal-spin 1s linear infinite;
  }
  
  &-text {
    @include text-style("body-small");
  }
}

.modal__body {
  padding: var(--spacing-lg);
}

// ===============================
// 🦶 MODAL FOOTER
// ===============================

.modal__footer {
  flex-shrink: 0;
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-surface-variant);
}

.modal__footer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

// ===============================
// 🔧 RESIZE HANDLE
// ===============================

.modal__resize-handle {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 20px;
  height: 20px;
  cursor: se-resize;
  @include flex-center;
  color: var(--color-text-disabled);
  background-color: var(--color-surface-variant);
  border-top: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  @include border-radius(0, "sm", 0, 0);
  
  &:hover {
    color: var(--color-text-secondary);
    background-color: var(--color-hover);
  }
}

// ===============================
// 🎬 ANIMATIONS
// ===============================

@keyframes modal-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// انتقالات الخلفية
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity var(--transition-duration-base) var(--transition-easing-standard);
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

// انتقالات المحتوى
.modal-content-enter-active,
.modal-content-leave-active {
  transition: all var(--transition-duration-base) var(--transition-easing-standard);
}

.modal-content-enter-from,
.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

// ===============================
// 📱 RESPONSIVE
// ===============================

@include tablet-layout {
  .modal-backdrop {
    padding: var(--spacing-md);
  }
  
  .modal {
    max-width: 95vw;
    max-height: 95vh;
    
    &--lg,
    &--xl {
      width: 90vw;
      max-width: 90vw;
    }
  }
  
  .modal__header-content {
    padding: var(--spacing-md);
  }
  
  .modal__body {
    padding: var(--spacing-md);
  }
  
  .modal__footer {
    padding: var(--spacing-md);
  }
}

@include mobile-layout {
  .modal-backdrop {
    padding: var(--spacing-sm);
  }
  
  .modal {
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    margin: 0;
    
    &--xs,
    &--sm,
    &--md,
    &--lg,
    &--xl {
      width: 100%;
      max-width: 100%;
    }
  }
  
  .modal__header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .modal__header-actions {
    align-self: flex-end;
  }
  
  .modal__footer-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

// ===============================
// 🌙 THEME VARIATIONS
// ===============================

[data-theme="dark"] {
  .modal-backdrop {
    background-color: rgba(0, 0, 0, 0.7);
  }
  
  .modal__footer {
    background-color: var(--color-surface-container);
  }
}

// ===============================
// 🎯 ACCESSIBILITY
// ===============================

@media (prefers-reduced-motion: reduce) {
  .modal,
  .modal-backdrop,
  .modal-content-enter-active,
  .modal-content-leave-active,
  .modal-backdrop-enter-active,
  .modal-backdrop-leave-active {
    transition: none !important;
    animation: none !important;
  }
}

// ===============================
// 📄 PRINT STYLES
// ===============================

@media print {
  .modal-backdrop {
    position: static !important;
    background: none !important;
    box-shadow: none !important;
  }
  
  .modal {
    position: static !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    max-height: none !important;
    box-shadow: none !important;
    border: 1px solid #000 !important;
  }
  
  .modal__close-btn {
    display: none !important;
  }
}
</style> 