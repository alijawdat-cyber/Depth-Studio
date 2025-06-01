<!--
==============================================
DEPTH STUDIO - مكون حدود الأخطاء
Error Boundary Component
==============================================
-->

<template>
  <div class="error-boundary">
    <template v-if="hasError">
      <!-- عرض الخطأ -->
      <div 
        class="error-boundary__container"
        :class="errorClasses"
        role="alert"
        :aria-live="'assertive'"
      >
        <!-- الصورة أو الأيقونة -->
        <div class="error-boundary__visual">
          <slot name="error-visual">
            <div class="error-boundary__icon-container">
              <BaseIcon 
                :name="errorIcon" 
                size="xl"
                class="error-boundary__icon"
              />
            </div>
          </slot>
        </div>

        <!-- محتوى الخطأ -->
        <div class="error-boundary__content">
          <!-- العنوان -->
          <h2 class="error-boundary__title">
            <slot name="error-title">
              {{ errorTitle }}
            </slot>
          </h2>

          <!-- الوصف -->
          <p class="error-boundary__description">
            <slot name="error-description">
              {{ errorDescription }}
            </slot>
          </p>

          <!-- تفاصيل فنية (في وضع التطوير فقط) -->
          <details 
            v-if="showDetails && errorDetails"
            class="error-boundary__details"
          >
            <summary class="error-boundary__details-toggle">
              <BaseIcon name="code-tags" size="sm" />
              عرض التفاصيل الفنية
            </summary>
            <div class="error-boundary__details-content">
              <pre class="error-boundary__stack-trace">{{ errorDetails }}</pre>
            </div>
          </details>

          <!-- معلومات إضافية -->
          <div 
            v-if="errorCode || errorId"
            class="error-boundary__meta"
          >
            <div v-if="errorCode" class="error-boundary__meta-item">
              <strong>كود الخطأ:</strong> {{ errorCode }}
            </div>
            <div v-if="errorId" class="error-boundary__meta-item">
              <strong>معرف الخطأ:</strong> {{ errorId }}
            </div>
            <div class="error-boundary__meta-item">
              <strong>الوقت:</strong> {{ errorTime }}
            </div>
          </div>
        </div>

        <!-- إجراءات الاستجابة -->
        <div class="error-boundary__actions">
          <slot name="error-actions">
            <!-- إعادة المحاولة -->
            <BaseButton
              v-if="retryable"
              variant="filled"
              :loading="retrying"
              @click="handleRetry"
            >
              <BaseIcon name="refresh" size="sm" />
              إعادة المحاولة
            </BaseButton>

            <!-- العودة للصفحة الرئيسية -->
            <BaseButton
              v-if="showHomeButton"
              variant="outlined"
              @click="goHome"
            >
              <BaseIcon name="home" size="sm" />
              العودة للرئيسية
            </BaseButton>

            <!-- إبلاغ عن المشكلة -->
            <BaseButton
              v-if="reportable"
              variant="text"
              @click="reportError"
            >
              <BaseIcon name="bug" size="sm" />
              إبلاغ عن المشكلة
            </BaseButton>

            <!-- إعادة تحميل الصفحة -->
            <BaseButton
              v-if="reloadable"
              variant="text"
              @click="reloadPage"
            >
              <BaseIcon name="reload" size="sm" />
              إعادة تحميل الصفحة
            </BaseButton>
          </slot>
        </div>

        <!-- معلومات المساعدة -->
        <div 
          v-if="helpText || helpLinks.length > 0"
          class="error-boundary__help"
        >
          <p v-if="helpText" class="error-boundary__help-text">
            {{ helpText }}
          </p>
          
          <div 
            v-if="helpLinks.length > 0"
            class="error-boundary__help-links"
          >
            <span class="error-boundary__help-label">روابط مفيدة:</span>
            <a
              v-for="(link, index) in helpLinks"
              :key="index"
              :href="link.url"
              class="error-boundary__help-link"
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
          </div>
        </div>
      </div>
    </template>

    <!-- المحتوى العادي -->
    <template v-else>
      <slot></slot>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onErrorCaptured, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import BaseIcon from '../ui/BaseIcon.vue'
import BaseButton from '../ui/BaseButton.vue'

// ===============================
// 🏷️ COMPONENT INTERFACES
// ===============================

interface ErrorInfo {
  message: string
  stack?: string
  code?: string
  id?: string
  componentStack?: string
}

interface HelpLink {
  label: string
  url: string
  icon?: string
}

// ===============================
// 🎛️ COMPONENT PROPS
// ===============================

interface ErrorBoundaryProps {
  // المظهر والسلوك
  variant?: 'default' | 'compact' | 'fullscreen' | 'inline'
  retryable?: boolean
  reportable?: boolean
  reloadable?: boolean
  showHomeButton?: boolean
  showDetails?: boolean
  
  // المحتوى المخصص
  errorTitle?: string
  errorDescription?: string
  errorIcon?: string
  helpText?: string
  helpLinks?: HelpLink[]
  
  // معلومات الخطأ
  fallbackErrorTitle?: string
  fallbackErrorDescription?: string
  
  // التحكم في العرض
  autoRetry?: boolean
  autoRetryDelay?: number
  maxRetries?: number
}

const props = withDefaults(defineProps<ErrorBoundaryProps>(), {
  variant: 'default',
  retryable: true,
  reportable: true,
  reloadable: false,
  showHomeButton: true,
  showDetails: import.meta.env.DEV || false,
  errorIcon: 'alert-circle',
  helpLinks: () => [],
  fallbackErrorTitle: 'حدث خطأ غير متوقع',
  fallbackErrorDescription: 'نعتذر عن الإزعاج. حدث خطأ أثناء تحميل هذا المحتوى.',
  autoRetry: false,
  autoRetryDelay: 3000,
  maxRetries: 3
})

// ===============================
// 🎯 COMPONENT EVENTS
// ===============================

interface ErrorBoundaryEmits {
  'error-captured': [error: Error, errorInfo: ErrorInfo]
  'retry': []
  'report-error': [error: Error, errorInfo: ErrorInfo]
  'reload': []
}

const emit = defineEmits<ErrorBoundaryEmits>()

// ===============================
// 💾 COMPONENT STATE
// ===============================

const router = useRouter()

// حالة الخطأ
const hasError = ref(false)
const error = ref<Error | null>(null)
const errorInfo = ref<ErrorInfo | null>(null)
const retrying = ref(false)
const retryCount = ref(0)

// ===============================
// 💻 COMPUTED PROPERTIES
// ===============================

// فئات CSS
const errorClasses = computed(() => [
  `error-boundary--${props.variant}`,
  {
    'error-boundary--retrying': retrying.value
  }
])

// عنوان الخطأ
const errorTitle = computed(() => {
  return props.errorTitle || errorInfo.value?.message || props.fallbackErrorTitle
})

// وصف الخطأ
const errorDescription = computed(() => {
  return props.errorDescription || props.fallbackErrorDescription
})

// تفاصيل الخطأ
const errorDetails = computed(() => {
  if (!errorInfo.value) return null
  
  let details = ''
  if (errorInfo.value.stack) {
    details += `Stack Trace:\n${errorInfo.value.stack}\n\n`
  }
  if (errorInfo.value.componentStack) {
    details += `Component Stack:\n${errorInfo.value.componentStack}`
  }
  return details || null
})

// كود الخطأ
const errorCode = computed(() => errorInfo.value?.code)

// معرف الخطأ
const errorId = computed(() => errorInfo.value?.id)

// وقت حدوث الخطأ
const errorTime = computed(() => {
  return new Date().toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// ===============================
// 🎯 ERROR HANDLING
// ===============================

// التقاط الأخطاء
onErrorCaptured((err: Error, instance, info: string) => {
  console.error('Error caught by boundary:', err)
  
  hasError.value = true
  error.value = err
  errorInfo.value = {
    message: err.message,
    stack: err.stack,
    code: (err as any).code,
    id: (err as any).id || generateErrorId(),
    componentStack: info
  }
  
  emit('error-captured', err, errorInfo.value)
  
  // إعادة المحاولة التلقائية
  if (props.autoRetry && retryCount.value < props.maxRetries) {
    setTimeout(() => {
      handleRetry()
    }, props.autoRetryDelay)
  }
  
  return false // منع انتشار الخطأ
})

// ===============================
// 🎯 METHODS
// ===============================

// إعادة المحاولة
const handleRetry = async () => {
  if (retrying.value) return
  
  retrying.value = true
  retryCount.value++
  
  try {
    // انتظار قليل قبل إعادة المحاولة
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // إعادة تعيين حالة الخطأ
    hasError.value = false
    error.value = null
    errorInfo.value = null
    
    emit('retry')
    
    // إجبار إعادة الرسم
    await nextTick()
    
  } catch (err) {
    console.error('Retry failed:', err)
  } finally {
    retrying.value = false
  }
}

// الانتقال للصفحة الرئيسية
const goHome = () => {
  router.push('/')
}

// إبلاغ عن الخطأ
const reportError = () => {
  if (error.value && errorInfo.value) {
    emit('report-error', error.value, errorInfo.value)
    
    // يمكن هنا إرسال الخطأ لخدمة مراقبة الأخطاء
    console.log('Reporting error:', {
      error: error.value,
      errorInfo: errorInfo.value,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    })
  }
}

// إعادة تحميل الصفحة
const reloadPage = () => {
  emit('reload')
  window.location.reload()
}

// توليد معرف خطأ فريد
const generateErrorId = (): string => {
  return Math.random().toString(36).substr(2, 9).toUpperCase()
}

// إعادة تعيين حالة الخطأ (للاستخدام الخارجي)
const reset = () => {
  hasError.value = false
  error.value = null
  errorInfo.value = null
  retryCount.value = 0
}

// تعريض الطرق للاستخدام الخارجي
defineExpose({
  reset,
  retry: handleRetry,
  hasError: () => hasError.value
})
</script>

<style lang="scss" scoped>
/**
 * ==============================================
 * ERROR BOUNDARY COMPONENT STYLES
 * ==============================================
 */

@use '../../styles/foundation/variables' as *;
@use '../../styles/foundation/colors' as *;
@use '../../styles/foundation/spacing' as *;
@use '../../styles/foundation/typography' as *;
@use '../../styles/foundation/breakpoints' as *;
@use '../../styles/utilities/mixins' as *;

.error-boundary {
  &__container {
    @include flex-center(column, var(--spacing-lg));
    text-align: center;
    padding: var(--spacing-xl);
    
    // المتغيرات
    &.error-boundary--compact {
      padding: var(--spacing-lg);
      gap: var(--spacing-md);
    }
    
    &.error-boundary--fullscreen {
      min-height: 100vh;
      justify-content: center;
      padding: var(--spacing-2xl);
    }
    
    &.error-boundary--inline {
      padding: var(--spacing-md);
      gap: var(--spacing-sm);
      text-align: right;
      
      [dir="ltr"] & {
        text-align: left;
      }
      
      .error-boundary__visual {
        align-self: flex-start;
      }
    }
    
    &.error-boundary--retrying {
      opacity: 0.7;
      pointer-events: none;
    }
  }
  
  // العناصر المرئية
  &__visual {
    flex-shrink: 0;
  }
  
  &__icon-container {
    @include flex-center;
    @include size(80px);
    @include border-radius("full");
    background: var(--color-error-container);
    color: var(--color-on-error-container);
    margin: 0 auto var(--spacing-md);
    
    .error-boundary--compact & {
      @include size(60px);
    }
    
    .error-boundary--inline & {
      @include size(40px);
      margin: 0 var(--spacing-sm) 0 0;
      
      [dir="ltr"] & {
        margin: 0 0 0 var(--spacing-sm);
      }
    }
  }
  
  &__icon {
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
  
  // المحتوى
  &__content {
    flex: 1;
    min-width: 0;
  }
  
  &__title {
    @include text-style("title-large");
    color: var(--color-error);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--spacing-sm);
    
    .error-boundary--compact & {
      @include text-style("title-medium");
    }
    
    .error-boundary--inline & {
      @include text-style("title-small");
      margin-bottom: var(--spacing-xs);
    }
  }
  
  &__description {
    @include text-style("body-large");
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    max-width: 500px;
    margin: 0 auto var(--spacing-md);
    
    .error-boundary--compact & {
      @include text-style("body");
    }
    
    .error-boundary--inline & {
      @include text-style("body-small");
      margin: 0 0 var(--spacing-sm);
    }
  }
  
  // التفاصيل الفنية
  &__details {
    margin: var(--spacing-md) 0;
    text-align: right;
    
    [dir="ltr"] & {
      text-align: left;
    }
    
    &-toggle {
      @include flex-start(row, var(--spacing-xs));
      @include text-style("label-medium");
      color: var(--color-text-secondary);
      cursor: pointer;
      @include transition(color, "fast");
      
      &:hover {
        color: var(--color-text-primary);
      }
    }
    
    &-content {
      margin-top: var(--spacing-sm);
      padding: var(--spacing-md);
      background: var(--color-surface-variant);
      @include border-radius("md");
      border: 1px solid var(--color-divider);
    }
  }
  
  &__stack-trace {
    @include text-style("code");
    color: var(--color-text-primary);
    white-space: pre-wrap;
    overflow-x: auto;
    max-height: 200px;
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    line-height: 1.4;
  }
  
  // المعلومات الإضافية
  &__meta {
    margin: var(--spacing-md) 0;
    padding: var(--spacing-md);
    background: var(--color-surface-variant);
    @include border-radius("md");
    text-align: right;
    
    [dir="ltr"] & {
      text-align: left;
    }
    
    &-item {
      @include text-style("body-small");
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xs);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      strong {
        color: var(--color-text-primary);
        font-weight: var(--font-weight-medium);
      }
    }
  }
  
  // الإجراءات
  &__actions {
    @include flex-center(row, var(--spacing-md));
    flex-wrap: wrap;
    
    .error-boundary--inline & {
      @include flex-start(row, var(--spacing-sm));
    }
    
    @include mobile-layout {
      flex-direction: column;
      width: 100%;
      gap: var(--spacing-sm);
      
      :deep(.btn) {
        width: 100%;
      }
    }
  }
  
  // المساعدة
  &__help {
    margin-top: var(--spacing-lg);
    padding-top: var(--spacing-lg);
    border-top: 1px solid var(--color-divider);
    
    &-text {
      @include text-style("body-small");
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-md);
    }
    
    &-label {
      @include text-style("label-medium");
      color: var(--color-text-secondary);
      display: block;
      margin-bottom: var(--spacing-sm);
    }
    
    &-links {
      @include flex-center(row, var(--spacing-md));
      flex-wrap: wrap;
      
      @include mobile-layout {
        flex-direction: column;
        gap: var(--spacing-xs);
      }
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
      
      @include mobile-layout {
        width: 100%;
        justify-content: center;
      }
    }
  }
  
  // تحسينات للموبايل
  @include mobile-layout {
    &__container {
      padding: var(--spacing-lg) var(--spacing-md);
      gap: var(--spacing-md);
    }
    
    &__title {
      @include text-style("title-medium");
    }
    
    &__description {
      @include text-style("body");
    }
    
    &__icon-container {
      @include size(60px);
    }
  }
}
</style> 