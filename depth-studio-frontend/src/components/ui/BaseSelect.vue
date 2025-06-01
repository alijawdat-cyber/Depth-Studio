<!--
  ==============================================
  DEPTH STUDIO - مكون القائمة المنسدلة الأساسي
  Base Select Component
  ==============================================
-->

<template>
  <div
    :class="containerClasses"
    :data-select-state="currentState"
  >
    <!-- تسمية الحقل -->
    <label
      v-if="label || $slots.label"
      :for="selectId"
      class="select__label"
    >
      <slot name="label">
        {{ label }}
        <span
          v-if="required"
          class="select__required"
          aria-label="مطلوب"
        >*</span>
      </slot>
    </label>
    
    <!-- حاوي القائمة -->
    <div
      class="select__container"
      @click="toggleDropdown"
    >
      <!-- أيقونة البداية -->
      <div
        v-if="prependIcon || $slots.prepend"
        class="select__prepend"
      >
        <slot name="prepend">
          <Icon
            v-if="prependIcon"
            :name="prependIcon"
            :size="iconSize"
            class="select__icon"
          />
        </slot>
      </div>
      
      <!-- حقل العرض -->
      <div
        :id="selectId"
        ref="selectRef"
        :class="selectClasses"
        :tabindex="disabled ? -1 : 0"
        :aria-expanded="isOpen"
        :aria-haspopup="'listbox'"
        :aria-labelledby="label ? `${selectId}-label` : undefined"
        :aria-describedby="ariaDescribedBy"
        :aria-required="required"
        :aria-invalid="isInvalid"
        :aria-disabled="disabled"
        role="combobox"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <!-- النص المحدد -->
        <div
          v-if="displayText"
          class="select__text"
        >
          {{ displayText }}
        </div>
        
        <!-- Placeholder -->
        <div
          v-else
          class="select__placeholder"
        >
          {{ placeholder }}
        </div>
        
        <!-- شارات التحديد المتعدد -->
        <div
          v-if="multiple && selectedItems.length > 0"
          class="select__chips"
        >
          <div
            v-for="(item, index) in selectedItems.slice(0, maxChips)"
            :key="getItemValue(item)"
            class="select__chip"
          >
            <span class="chip__text">{{ getItemText(item) }}</span>
            <button
              v-if="!disabled && !readonly"
              type="button"
              class="chip__remove"
              @click.stop="removeItem(item)"
              :aria-label="`إزالة ${getItemText(item)}`"
            >
              <Icon name="close" size="12" />
            </button>
          </div>
          
          <!-- عداد العناصر الإضافية -->
          <div
            v-if="selectedItems.length > maxChips"
            class="select__chip select__chip--count"
          >
            +{{ selectedItems.length - maxChips }}
          </div>
        </div>
      </div>
      
      <!-- أيقونة النهاية -->
      <div class="select__append">
        <!-- زر مسح التحديد -->
        <button
          v-if="showClearButton"
          type="button"
          class="select__clear"
          @click.stop="clearSelection"
          :aria-label="clearText"
        >
          <Icon name="close" :size="iconSize" />
        </button>
        
        <!-- أيقونة السهم -->
        <div
          class="select__arrow"
          :class="{ 'select__arrow--open': isOpen }"
        >
          <Icon name="expand-more" :size="iconSize" />
        </div>
        
        <!-- أيقونة مخصصة -->
        <Icon
          v-if="appendIcon"
          :name="appendIcon"
          :size="iconSize"
          class="select__icon"
        />
      </div>
      
      <!-- مؤشر التحميل -->
      <div
        v-if="loading"
        class="select__loading"
      >
        <Icon
          name="loading"
          :size="iconSize"
          class="select__loading-icon"
        />
      </div>
    </div>
    
    <!-- القائمة المنسدلة -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="select__dropdown"
        :class="dropdownClasses"
        :style="dropdownStyles"
        role="listbox"
        :aria-multiselectable="multiple"
      >
        <!-- حقل البحث -->
        <div
          v-if="searchable"
          class="select__search"
        >
          <input
            ref="searchRef"
            v-model="searchQuery"
            type="text"
            class="select__search-input"
            :placeholder="searchPlaceholder"
            @keydown="handleSearchKeydown"
          />
          <Icon name="search" size="16" class="select__search-icon" />
        </div>
        
        <!-- قائمة الخيارات -->
        <div
          class="select__options"
          :style="{ maxHeight: `${maxHeight}px` }"
        >
          <!-- خيار فارغ -->
          <div
            v-if="allowEmpty && !multiple"
            class="select__option select__option--empty"
            :class="{ 'select__option--selected': !modelValue }"
            @click="selectOption(null)"
            role="option"
            :aria-selected="!modelValue"
          >
            {{ emptyText }}
          </div>
          
          <!-- الخيارات المفلترة -->
          <div
            v-for="(item, index) in filteredOptions"
            :key="getItemValue(item)"
            :class="optionClasses(item, index)"
            @click="selectOption(item)"
            @mouseenter="highlightedIndex = index"
            role="option"
            :aria-selected="isSelected(item)"
          >
            <!-- محتوى الخيار المخصص -->
            <slot
              name="option"
              :item="item"
              :index="index"
              :selected="isSelected(item)"
            >
              <div class="option__content">
                <!-- أيقونة التحديد -->
                <div
                  v-if="multiple"
                  class="option__checkbox"
                >
                  <Icon
                    :name="isSelected(item) ? 'check' : ''"
                    size="16"
                    class="option__check-icon"
                  />
                </div>
                
                <!-- نص الخيار -->
                <span class="option__text">{{ getItemText(item) }}</span>
                
                <!-- وصف إضافي -->
                <span
                  v-if="getItemDescription && getItemDescription(item)"
                  class="option__description"
                >
                  {{ getItemDescription(item) }}
                </span>
              </div>
            </slot>
          </div>
          
          <!-- رسالة لا توجد نتائج -->
          <div
            v-if="filteredOptions.length === 0"
            class="select__no-results"
          >
            {{ noResultsText }}
          </div>
          
          <!-- تحميل المزيد -->
          <div
            v-if="hasMore && filteredOptions.length > 0"
            class="select__load-more"
            @click="loadMore"
          >
            {{ loadMoreText }}
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- نص المساعدة والأخطاء -->
    <div
      v-if="showHelpText"
      class="select__help"
    >
      <!-- رسالة الخطأ -->
      <div
        v-if="isInvalid && errorMessage"
        class="select__error"
        role="alert"
        :id="`${selectId}-error`"
      >
        <Icon name="alert-circle" size="16" />
        <span>{{ errorMessage }}</span>
      </div>
      
      <!-- نص المساعدة -->
      <div
        v-else-if="hint"
        class="select__hint"
        :id="`${selectId}-hint`"
      >
        {{ hint }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch, useId, onMounted, onUnmounted } from 'vue'
import { createPopper } from '@popperjs/core'
import type { Instance as PopperInstance } from '@popperjs/core'
import Icon from './BaseIcon.vue'

export interface SelectOption {
  value: any
  text: string
  description?: string
  disabled?: boolean
  group?: string
}

export interface SelectProps {
  // القيمة
  modelValue?: any
  // الخيارات
  options?: SelectOption[]
  // التحديد المتعدد
  multiple?: boolean
  maxSelections?: number
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
  // البحث
  searchable?: boolean
  searchPlaceholder?: string
  // الأيقونات
  prependIcon?: string
  appendIcon?: string
  clearable?: boolean
  // النصوص
  emptyText?: string
  noResultsText?: string
  loadMoreText?: string
  clearText?: string
  // إعدادات القائمة
  maxHeight?: number
  allowEmpty?: boolean
  closeOnSelect?: boolean
  // دوال مخصصة
  itemValue?: string | ((item: any) => any)
  itemText?: string | ((item: any) => string)
  itemDescription?: string | ((item: any) => string)
  // التحميل المتقدم
  hasMore?: boolean
  // عرض الشارات
  maxChips?: number
}

const props = withDefaults(defineProps<SelectProps>(), {
  size: 'md',
  variant: 'outlined',
  rounded: false,
  multiple: false,
  disabled: false,
  readonly: false,
  required: false,
  loading: false,
  searchable: false,
  clearable: false,
  searchPlaceholder: 'البحث...',
  emptyText: 'لا يوجد تحديد',
  noResultsText: 'لا توجد نتائج',
  loadMoreText: 'تحميل المزيد...',
  clearText: 'مسح التحديد',
  maxHeight: 300,
  allowEmpty: true,
  closeOnSelect: true,
  itemValue: 'value',
  itemText: 'text',
  maxChips: 3,
  hasMore: false
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'change': [value: any, option: SelectOption | SelectOption[] | null]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'search': [query: string]
  'load-more': []
  'open': []
  'close': []
}>()

// المراجع
const selectRef = ref<HTMLDivElement>()
const dropdownRef = ref<HTMLDivElement>()
const searchRef = ref<HTMLInputElement>()

// الحالة
const isOpen = ref(false)
const isFocused = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const popperInstance = ref<PopperInstance | null>(null)

// معرف فريد
const selectId = useId()

// حساب حجم الأيقونة
const iconSize = computed(() => {
  const sizeMap = {
    sm: '16',
    md: '18',
    lg: '20'
  }
  return sizeMap[props.size]
})

// دوال معالجة العناصر
const getItemValue = (item: any): any => {
  if (typeof props.itemValue === 'function') {
    return props.itemValue(item)
  }
  return item[props.itemValue as string] ?? item
}

const getItemText = (item: any): string => {
  if (typeof props.itemText === 'function') {
    return props.itemText(item)
  }
  return item[props.itemText as string] ?? String(item)
}

const getItemDescription = computed(() => {
  if (typeof props.itemDescription === 'function') {
    return props.itemDescription
  }
  return props.itemDescription ? (item: any) => item[props.itemDescription as string] : null
})

// العناصر المحددة
const selectedItems = computed(() => {
  if (!props.multiple) return []
  return Array.isArray(props.modelValue) ? 
    props.options?.filter(item => props.modelValue.includes(getItemValue(item))) || [] :
    []
})

// النص المعروض
const displayText = computed(() => {
  if (props.multiple) {
    return selectedItems.value.length > 0 ? 
      `${selectedItems.value.length} عنصر محدد` : 
      ''
  }
  
  if (props.modelValue != null) {
    const selected = props.options?.find(item => getItemValue(item) === props.modelValue)
    return selected ? getItemText(selected) : String(props.modelValue)
  }
  
  return ''
})

// الخيارات المفلترة
const filteredOptions = computed(() => {
  if (!props.options) return []
  
  let filtered = props.options
  
  if (props.searchable && searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      getItemText(item).toLowerCase().includes(query) ||
      (getItemDescription.value && getItemDescription.value(item)?.toLowerCase().includes(query))
    )
  }
  
  return filtered
})

// حالة التحديد
const isSelected = (item: any): boolean => {
  const value = getItemValue(item)
  
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(value)
  }
  
  return props.modelValue === value
}

// حالة الحقل
const currentState = computed(() => {
  if (props.disabled) return 'disabled'
  if (props.readonly) return 'readonly'
  if (props.loading) return 'loading'
  if (isInvalid.value) return 'error'
  if (isFocused.value) return 'focused'
  if (props.modelValue != null) return 'filled'
  return 'default'
})

// التحقق من الصحة
const isInvalid = computed(() => {
  return !!props.errorMessage
})

// زر المسح
const showClearButton = computed(() => {
  return props.clearable && 
         !props.disabled && 
         !props.readonly && 
         props.modelValue != null
})

// نص المساعدة
const showHelpText = computed(() => {
  return props.errorMessage || props.hint
})

// الوصف للـ Accessibility
const ariaDescribedBy = computed(() => {
  const descriptions = []
  if (props.errorMessage) descriptions.push(`${selectId}-error`)
  if (props.hint) descriptions.push(`${selectId}-hint`)
  return descriptions.length > 0 ? descriptions.join(' ') : undefined
})

// فئات CSS
const containerClasses = computed(() => [
  'select',
  `select--${props.size}`,
  `select--${props.variant}`,
  {
    'select--rounded': props.rounded,
    'select--disabled': props.disabled,
    'select--readonly': props.readonly,
    'select--loading': props.loading,
    'select--error': isInvalid.value,
    'select--focused': isFocused.value,
    'select--filled': !!props.modelValue,
    'select--multiple': props.multiple,
    'select--open': isOpen.value
  }
])

const selectClasses = computed(() => [
  'select__field'
])

const dropdownClasses = computed(() => [
  'select__dropdown--visible',
  `select__dropdown--${props.size}`
])

const optionClasses = (item: any, index: number) => [
  'select__option',
  {
    'select__option--selected': isSelected(item),
    'select__option--highlighted': highlightedIndex.value === index,
    'select__option--disabled': item.disabled
  }
]

// أنماط القائمة المنسدلة
const dropdownStyles = ref<any>({})

// معالجات الأحداث
const toggleDropdown = () => {
  if (props.disabled || props.readonly) return
  
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

const openDropdown = async () => {
  if (props.disabled || props.readonly) return
  
  isOpen.value = true
  emit('open')
  
  await nextTick()
  
  // إعداد موضع القائمة
  if (selectRef.value && dropdownRef.value) {
    popperInstance.value = createPopper(selectRef.value, dropdownRef.value, {
      placement: 'bottom-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 4]
          }
        },
        {
          name: 'sameWidth',
          enabled: true,
          fn: ({ state }) => {
            state.styles.popper.width = `${state.rects.reference.width}px`
          },
          phase: 'beforeWrite',
          requires: ['computeStyles']
        }
      ]
    })
  }
  
  // تركيز حقل البحث
  if (props.searchable && searchRef.value) {
    searchRef.value.focus()
  }
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
  highlightedIndex.value = -1
  
  if (popperInstance.value) {
    popperInstance.value.destroy()
    popperInstance.value = null
  }
  
  emit('close')
}

const selectOption = (item: SelectOption | null) => {
  if (item?.disabled) return
  
  let newValue: any
  
  if (props.multiple) {
    const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const itemValue = item ? getItemValue(item) : null
    
    if (itemValue !== null) {
      const index = currentValues.indexOf(itemValue)
      if (index > -1) {
        currentValues.splice(index, 1)
      } else {
        if (!props.maxSelections || currentValues.length < props.maxSelections) {
          currentValues.push(itemValue)
        }
      }
    }
    
    newValue = currentValues
  } else {
    newValue = item ? getItemValue(item) : null
    if (props.closeOnSelect) {
      closeDropdown()
    }
  }
  
  emit('update:modelValue', newValue)
  emit('change', newValue, item)
}

const removeItem = (item: SelectOption) => {
  if (props.disabled || props.readonly) return
  
  const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const itemValue = getItemValue(item)
  const index = currentValues.indexOf(itemValue)
  
  if (index > -1) {
    currentValues.splice(index, 1)
    emit('update:modelValue', currentValues)
    emit('change', currentValues, null)
  }
}

const clearSelection = () => {
  const newValue = props.multiple ? [] : null
  emit('update:modelValue', newValue)
  emit('change', newValue, null)
}

const loadMore = () => {
  emit('load-more')
}

// معالجة لوحة المفاتيح
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (isOpen.value) {
        if (highlightedIndex.value >= 0) {
          selectOption(filteredOptions.value[highlightedIndex.value])
        }
      } else {
        toggleDropdown()
      }
      break
      
    case 'Escape':
      if (isOpen.value) {
        closeDropdown()
        selectRef.value?.focus()
      }
      break
      
    case 'ArrowDown':
      event.preventDefault()
      if (!isOpen.value) {
        openDropdown()
      } else {
        highlightedIndex.value = Math.min(
          highlightedIndex.value + 1,
          filteredOptions.value.length - 1
        )
      }
      break
      
    case 'ArrowUp':
      event.preventDefault()
      if (isOpen.value) {
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      }
      break
  }
}

const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDropdown()
    selectRef.value?.focus()
  }
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

// إغلاق عند النقر خارج القائمة
const handleClickOutside = (event: Event) => {
  if (isOpen.value && 
      !selectRef.value?.contains(event.target as Node) &&
      !dropdownRef.value?.contains(event.target as Node)) {
    closeDropdown()
  }
}

// مراقبة البحث
watch(searchQuery, (newQuery) => {
  highlightedIndex.value = -1
  emit('search', newQuery)
})

// التهيئة والتنظيف
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (popperInstance.value) {
    popperInstance.value.destroy()
  }
})

// طرق عامة
const focus = () => {
  selectRef.value?.focus()
}

const blur = () => {
  selectRef.value?.blur()
}

const open = () => {
  openDropdown()
}

const close = () => {
  closeDropdown()
}

// تصدير الطرق
defineExpose({
  focus,
  blur,
  open,
  close,
  selectRef
})
</script>

<style lang="scss" scoped>
@import '@/styles/foundation/variables';
@import '@/styles/utilities/mixins';

.select {
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
    
    .select__required {
      color: var(--color-error);
      margin-right: 2px;
    }
    
    // حالة التركيز
    .select--focused & {
      color: var(--color-primary);
    }
    
    // حالة الخطأ
    .select--error & {
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
    cursor: pointer;
    @include transition(all, "fast");
    
    // تحسينات RTL
    direction: rtl;
    
    .select--disabled & {
      cursor: not-allowed;
    }
    
    .select--readonly & {
      cursor: default;
    }
  }
  
  // ===============================
  // 📝 SELECT FIELD - الحقل
  // ===============================
  
  &__field {
    // الأساسيات
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    min-height: 1.5rem;
    outline: none;
    
    // النص والخط
    font-family: var(--font-family-primary);
    color: var(--color-text-primary);
    
    &:focus-visible {
      @include focus-effect;
    }
  }
  
  &__text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  &__placeholder {
    flex: 1;
    color: var(--color-text-disabled);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  // ===============================
  // 🏷️ CHIPS - الشارات المتعددة
  // ===============================
  
  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-2xs);
    flex: 1;
  }
  
  &__chip {
    display: flex;
    align-items: center;
    gap: var(--spacing-2xs);
    padding: var(--spacing-2xs) var(--spacing-xs);
    background-color: var(--color-primary-container);
    color: var(--color-primary);
    @include border-radius("sm");
    @include text-style("caption");
    
    &--count {
      background-color: var(--color-surface-variant);
      color: var(--color-text-secondary);
    }
    
    .chip__text {
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .chip__remove {
      @include size(1rem);
      @include flex-center;
      background: none;
      border: none;
      cursor: pointer;
      color: inherit;
      @include border-radius("full");
      @include transition(background-color, "fast");
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  // ===============================
  // 🎨 VARIANTS - الأنواع
  // ===============================
  
  // النوع المحاط
  &--outlined {
    .select__container {
      border: 2px solid var(--color-border);
      @include border-radius("md");
      background-color: var(--color-surface);
    }
    
    .select__field {
      padding: 0 var(--spacing-md);
    }
    
    &.select--focused .select__container {
      border-color: var(--color-primary);
      @include elevation(1);
    }
    
    &.select--error .select__container {
      border-color: var(--color-error);
    }
  }
  
  // النوع المملوء
  &--filled {
    .select__container {
      background-color: var(--color-surface-variant);
      border: 2px solid transparent;
      @include border-radius("md", "md", 0, 0);
      border-bottom: 2px solid var(--color-border);
    }
    
    .select__field {
      padding: 0 var(--spacing-md);
    }
    
    &.select--focused .select__container {
      border-bottom-color: var(--color-primary);
      background-color: var(--color-surface);
    }
    
    &.select--error .select__container {
      border-bottom-color: var(--color-error);
    }
  }
  
  // النوع السفلي
  &--underlined {
    .select__container {
      background: transparent;
      border: none;
      border-bottom: 1px solid var(--color-border);
      border-radius: 0;
    }
    
    .select__field {
      padding: var(--spacing-sm) 0;
    }
    
    &.select--focused .select__container {
      border-bottom: 2px solid var(--color-primary);
    }
    
    &.select--error .select__container {
      border-bottom: 2px solid var(--color-error);
    }
  }
  
  // ===============================
  // 📏 SIZES - الأحجام
  // ===============================
  
  &--sm {
    .select__container {
      min-height: 2rem;
    }
    
    .select__field {
      @include text-style("body-small");
    }
  }
  
  &--md {
    .select__container {
      min-height: 2.5rem;
    }
    
    .select__field {
      @include text-style("body");
    }
  }
  
  &--lg {
    .select__container {
      min-height: 3rem;
    }
    
    .select__field {
      @include text-style("body-large");
    }
  }
  
  // ===============================
  // 🔘 SHAPES - الأشكال
  // ===============================
  
  &--rounded {
    .select__container {
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
    
    .select--focused & {
      color: var(--color-primary);
    }
    
    .select--error & {
      color: var(--color-error);
    }
  }
  
  &__prepend {
    margin-left: calc(var(--spacing-sm) * -0.5);
    padding-right: var(--spacing-xs);
  }
  
  &__append {
    margin-right: calc(var(--spacing-sm) * -0.5);
    padding-left: var(--spacing-xs);
  }
  
  &__icon {
    flex-shrink: 0;
  }
  
  &__clear {
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
  }
  
  &__arrow {
    @include transition(transform, "fast");
    
    &--open {
      transform: rotate(180deg);
    }
  }
  
  &__loading {
    position: absolute;
    left: var(--spacing-md);
    
    .select__loading-icon {
      animation: select-spin 1s linear infinite;
    }
  }
  
  // ===============================
  // 🔄 STATES - الحالات
  // ===============================
  
  &--disabled {
    opacity: map-get($opacity, "60");
    pointer-events: none;
    
    .select__container {
      background-color: var(--color-surface-disabled);
      border-color: var(--color-border-disabled);
    }
  }
  
  &--readonly {
    .select__container {
      background-color: var(--color-surface-variant);
      cursor: default;
    }
  }
  
  &--loading {
    pointer-events: none;
  }
  
  &--error {
    .select__container {
      border-color: var(--color-error);
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
}

// ===============================
// 📋 DROPDOWN - القائمة المنسدلة
// ===============================

.select__dropdown {
  position: absolute;
  z-index: map-get($z-index, "dropdown");
  background-color: var(--color-surface);
  @include elevation(8);
  @include border-radius("md");
  border: 1px solid var(--color-border);
  overflow: hidden;
  
  &--visible {
    opacity: 1;
    transform: translateY(0);
    @include transition(all, "fast");
  }
  
  &--sm {
    @include text-style("body-small");
  }
  
  &--md {
    @include text-style("body");
  }
  
  &--lg {
    @include text-style("body-large");
  }
}

.select__search {
  position: relative;
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-divider);
  
  &-input {
    width: 100%;
    padding: var(--spacing-xs) var(--spacing-lg) var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--color-border);
    @include border-radius("sm");
    background: var(--color-surface);
    color: var(--color-text-primary);
    outline: none;
    
    &:focus {
      border-color: var(--color-primary);
    }
    
    &::placeholder {
      color: var(--color-text-disabled);
    }
  }
  
  &-icon {
    position: absolute;
    left: var(--spacing-sm);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-secondary);
  }
}

.select__options {
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-surface-variant);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-outline);
    border-radius: 3px;
  }
}

.select__option {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  @include transition(background-color, "fast");
  
  &:hover,
  &--highlighted {
    background-color: var(--color-hover);
  }
  
  &--selected {
    background-color: var(--color-primary-container);
    color: var(--color-primary);
    
    &:hover {
      background-color: var(--color-primary-container);
    }
  }
  
  &--disabled {
    opacity: map-get($opacity, "38");
    cursor: not-allowed;
    
    &:hover {
      background-color: transparent;
    }
  }
  
  &--empty {
    font-style: italic;
    color: var(--color-text-secondary);
  }
  
  .option__content {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
  
  .option__checkbox {
    @include size(1rem);
    @include flex-center;
    border: 1px solid var(--color-outline);
    @include border-radius("sm");
    
    .select__option--selected & {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
      color: var(--color-on-primary);
    }
  }
  
  .option__text {
    flex: 1;
  }
  
  .option__description {
    @include text-style("caption");
    color: var(--color-text-secondary);
  }
}

.select__no-results {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}

.select__load-more {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: center;
  color: var(--color-primary);
  cursor: pointer;
  border-top: 1px solid var(--color-divider);
  @include transition(background-color, "fast");
  
  &:hover {
    background-color: var(--color-hover);
  }
}

// ===============================
// 🎬 ANIMATIONS
// ===============================

@keyframes select-spin {
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
  .select {
    &--lg {
      .select__container {
        min-height: 2.75rem;
      }
    }
    
    &__chips {
      flex-wrap: nowrap;
      overflow-x: auto;
      
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
  
  .select__dropdown {
    max-width: 90vw;
  }
}

// ===============================
// 🌙 THEME VARIATIONS
// ===============================

[data-theme="dark"] {
  .select {
    &--filled {
      .select__container {
        background-color: var(--color-surface-container);
      }
    }
    
    &__chip {
      background-color: var(--color-surface-container);
      border: 1px solid var(--color-outline-variant);
    }
  }
  
  .select__dropdown {
    @include elevation(12);
  }
}

// ===============================
// 🎯 ACCESSIBILITY
// ===============================

@media (prefers-reduced-motion: reduce) {
  .select {
    .select__container,
    .select__arrow,
    .select__loading-icon {
      transition: none !important;
      animation: none !important;
    }
  }
  
  .select__dropdown {
    transition: none !important;
  }
}

// ===============================
// 📄 PRINT STYLES
// ===============================

@media print {
  .select {
    .select__container {
      border: 1px solid #000 !important;
      background: #fff !important;
    }
    
    .select__loading,
    .select__arrow {
      display: none !important;
    }
  }
  
  .select__dropdown {
    display: none !important;
  }
}
</style> 