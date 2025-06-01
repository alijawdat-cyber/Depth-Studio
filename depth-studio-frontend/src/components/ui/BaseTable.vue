<!--
  ==============================================
  DEPTH STUDIO - مكون الجدول الأساسي
  Base Table Component
  ==============================================
-->

<template>
  <div :class="tableWrapperClasses">
    <!-- شريط الأدوات العلوي -->
    <div
      v-if="showToolbar"
      class="table__toolbar"
    >
      <div class="table__toolbar-start">
        <slot name="toolbar-start">
          <!-- البحث -->
          <BaseInput
            v-if="searchable"
            v-model="searchQuery"
            :placeholder="searchPlaceholder"
            prepend-icon="search"
            clearable
            :size="toolbarSize"
            class="table__search"
            @update:model-value="handleSearch"
          />
        </slot>
      </div>
      
      <div class="table__toolbar-end">
        <slot name="toolbar-end">
          <!-- عدد العناصر -->
          <div v-if="showItemCount" class="table__item-count">
            {{ totalItems }} عنصر
          </div>
        </slot>
      </div>
    </div>

    <!-- حاوي الجدول -->
    <div :class="tableContainerClasses">
      <table :class="tableClasses">
        <!-- رأس الجدول -->
        <thead class="table__head">
          <tr class="table__row table__row--header">
            <!-- عمود التحديد -->
            <th
              v-if="selectable"
              class="table__cell table__cell--select"
              :style="{ width: '48px' }"
            >
              <BaseInput
                v-if="multiple"
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected"
                @change="toggleSelectAll"
                aria-label="تحديد الكل"
              />
            </th>
            
            <!-- أعمدة البيانات -->
            <th
              v-for="header in computedHeaders"
              :key="header.key"
              :class="getHeaderClasses(header)"
              :style="getHeaderStyles(header)"
              @click="header.sortable ? handleSort(header.key) : undefined"
            >
              <div class="table__header-content">
                <span class="table__header-text">{{ header.text }}</span>
                <Icon
                  v-if="header.sortable && sortBy === header.key"
                  :name="sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'"
                  size="16"
                  class="table__sort-icon"
                />
              </div>
            </th>
          </tr>
        </thead>

        <!-- جسم الجدول -->
        <tbody class="table__body">
          <!-- حالة التحميل -->
          <tr v-if="loading" class="table__row table__row--loading">
            <td :colspan="totalColumns" class="table__cell table__cell--loading">
              <div class="table__loading">
                <Icon name="loading" size="24" class="table__loading-icon" />
                <span>{{ loadingText }}</span>
              </div>
            </td>
          </tr>

          <!-- حالة عدم وجود بيانات -->
          <tr v-else-if="computedItems.length === 0" class="table__row table__row--empty">
            <td :colspan="totalColumns" class="table__cell table__cell--empty">
              <div class="table__empty">
                <Icon name="database" size="48" class="table__empty-icon" />
                <h3 class="table__empty-title">{{ emptyTitle }}</h3>
                <p class="table__empty-text">{{ emptyText }}</p>
                <slot name="empty-action"></slot>
              </div>
            </td>
          </tr>

          <!-- صفوف البيانات -->
          <tr
            v-else
            v-for="(item, index) in paginatedItems"
            :key="getItemKey(item, index)"
            :class="getRowClasses(item, index)"
            @click="handleRowClick(item, $event)"
            @dblclick="handleRowDblClick(item, $event)"
          >
            <!-- عمود التحديد -->
            <td
              v-if="selectable"
              class="table__cell table__cell--select"
              @click.stop
            >
              <BaseInput
                type="checkbox"
                :checked="isSelected(item)"
                @change="toggleSelect(item)"
                :aria-label="`تحديد العنصر ${index + 1}`"
              />
            </td>

            <!-- أعمدة البيانات -->
            <td
              v-for="header in computedHeaders"
              :key="header.key"
              :class="getCellClasses(header, item)"
              :style="getCellStyles(header)"
            >
              <div class="table__cell-content">
                <slot
                  :name="`item.${header.key}`"
                  :item="item"
                  :header="header"
                  :value="getItemValue(item, header.key)"
                  :index="index"
                >
                  {{ formatCellValue(item, header) }}
                </slot>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- شريط الأدوات السفلي -->
    <div
      v-if="showPagination && !loading"
      class="table__footer"
    >
      <div class="table__footer-info">
        عرض {{ startItem }}-{{ endItem }} من {{ totalItems }}
      </div>
      
      <div class="table__pagination">
        <BaseButton
          :disabled="currentPage === 1"
          variant="outlined"
          size="sm"
          icon
          @click="goToPage(currentPage - 1)"
          aria-label="الصفحة السابقة"
        >
          <Icon name="chevron-right" size="16" />
        </BaseButton>
        
        <span class="table__page-info">
          صفحة {{ currentPage }} من {{ totalPages }}
        </span>
        
        <BaseButton
          :disabled="currentPage === totalPages"
          variant="outlined"
          size="sm"
          icon
          @click="goToPage(currentPage + 1)"
          aria-label="الصفحة التالية"
        >
          <Icon name="chevron-left" size="16" />
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseInput from './BaseInput.vue'
import BaseButton from './BaseButton.vue'
import Icon from './BaseIcon.vue'

export interface TableHeader {
  key: string
  text: string
  value?: string | ((item: any) => any)
  sortable?: boolean
  align?: 'start' | 'center' | 'end'
  width?: string | number
  minWidth?: string | number
  maxWidth?: string | number
  fixed?: 'left' | 'right'
  class?: string | string[]
  cellClass?: string | string[]
}

export interface TableProps {
  // البيانات
  items?: any[]
  headers?: TableHeader[]
  // المفتاح الفريد
  itemKey?: string | ((item: any) => string | number)
  // الحجم والشكل
  size?: 'sm' | 'md' | 'lg'
  variant?: 'outlined' | 'elevated' | 'flat'
  density?: 'compact' | 'comfortable' | 'spacious'
  // التحديد
  selectable?: boolean
  multiple?: boolean
  modelValue?: any[]
  // الترتيب
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  multiSort?: boolean
  // البحث والتصفية
  searchable?: boolean
  searchQuery?: string
  searchPlaceholder?: string
  // التقسيم
  pagination?: boolean
  itemsPerPage?: number
  page?: number
  // الحالة
  loading?: boolean
  disabled?: boolean
  // النصوص
  loadingText?: string
  emptyTitle?: string
  emptyText?: string
  // الأدوات
  showToolbar?: boolean
  showPagination?: boolean
  showItemCount?: boolean
  toolbarSize?: 'sm' | 'md' | 'lg'
  // التفاعل
  clickable?: boolean
  hoverable?: boolean
  // التخطيط
  sticky?: boolean
  responsive?: boolean
  maxHeight?: string | number
  // إعدادات متقدمة
  virtualized?: boolean
  expandable?: boolean
  groupBy?: string
}

const props = withDefaults(defineProps<TableProps>(), {
  size: 'md',
  variant: 'outlined',
  density: 'comfortable',
  selectable: false,
  multiple: false,
  sortOrder: 'asc',
  multiSort: false,
  searchable: false,
  searchPlaceholder: 'البحث...',
  pagination: true,
  itemsPerPage: 10,
  page: 1,
  loading: false,
  disabled: false,
  loadingText: 'جاري التحميل...',
  emptyTitle: 'لا توجد بيانات',
  emptyText: 'لم يتم العثور على أي عناصر',
  showToolbar: true,
  showPagination: true,
  showItemCount: true,
  toolbarSize: 'md',
  clickable: false,
  hoverable: true,
  sticky: false,
  responsive: true,
  virtualized: false,
  expandable: false,
  itemKey: 'id'
})

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
  'update:page': [page: number]
  'update:sortBy': [sortBy: string]
  'update:sortOrder': [sortOrder: 'asc' | 'desc']
  'update:searchQuery': [query: string]
  'row-click': [item: any, event: MouseEvent]
  'row-dblclick': [item: any, event: MouseEvent]
  'sort': [sortBy: string, sortOrder: 'asc' | 'desc']
  'search': [query: string]
}>()

// الحالة المحلية
const searchQuery = ref(props.searchQuery || '')
const currentPage = ref(props.page)
const sortBy = ref(props.sortBy || '')
const sortOrder = ref(props.sortOrder)
const selectedItems = ref<any[]>(props.modelValue || [])

// الحسابات
const computedHeaders = computed(() => props.headers || [])

const computedItems = computed(() => {
  if (!props.items) return []
  
  let filtered = [...props.items]
  
  // البحث
  if (searchQuery.value && props.searchable) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      computedHeaders.value.some(header =>
        String(getItemValue(item, header.key)).toLowerCase().includes(query)
      )
    )
  }
  
  // الترتيب
  if (sortBy.value) {
    filtered.sort((a, b) => {
      const aVal = getItemValue(a, sortBy.value)
      const bVal = getItemValue(b, sortBy.value)
      
      if (aVal === bVal) return 0
      
      const result = aVal > bVal ? 1 : -1
      return sortOrder.value === 'desc' ? -result : result
    })
  }
  
  return filtered
})

const paginatedItems = computed(() => {
  if (!props.pagination) return computedItems.value
  
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return computedItems.value.slice(start, end)
})

const totalItems = computed(() => computedItems.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / props.itemsPerPage))
const startItem = computed(() => (currentPage.value - 1) * props.itemsPerPage + 1)
const endItem = computed(() => Math.min(currentPage.value * props.itemsPerPage, totalItems.value))

const totalColumns = computed(() => {
  let count = computedHeaders.value.length
  if (props.selectable) count++
  return count
})

// التحديد
const allSelected = computed(() => 
  selectedItems.value.length === computedItems.value.length && computedItems.value.length > 0
)

const someSelected = computed(() => 
  selectedItems.value.length > 0 && selectedItems.value.length < computedItems.value.length
)

// فئات CSS
const tableWrapperClasses = computed(() => [
  'table-wrapper',
  `table-wrapper--${props.size}`,
  `table-wrapper--${props.variant}`,
  `table-wrapper--${props.density}`,
  {
    'table-wrapper--loading': props.loading,
    'table-wrapper--disabled': props.disabled,
    'table-wrapper--responsive': props.responsive,
    'table-wrapper--sticky': props.sticky
  }
])

const tableContainerClasses = computed(() => [
  'table__container',
  {
    'table__container--scrollable': props.maxHeight
  }
])

const tableClasses = computed(() => [
  'table',
  {
    'table--clickable': props.clickable,
    'table--hoverable': props.hoverable,
    'table--selectable': props.selectable
  }
])

// الدوال المساعدة
const getItemKey = (item: any, index: number): string | number => {
  if (typeof props.itemKey === 'function') {
    return props.itemKey(item)
  }
  return item[props.itemKey] || index
}

const getItemValue = (item: any, key: string): any => {
  return key.split('.').reduce((obj, k) => obj?.[k], item)
}

const formatCellValue = (item: any, header: TableHeader): string => {
  const value = getItemValue(item, header.key)
  
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا'
  if (value instanceof Date) return value.toLocaleDateString('ar-IQ')
  
  return String(value)
}

const isSelected = (item: any): boolean => {
  const key = getItemKey(item, 0)
  return selectedItems.value.some(selected => getItemKey(selected, 0) === key)
}

// معالجات الأحداث
const handleSearch = (query: string | number) => {
  const searchString = String(query)
  searchQuery.value = searchString
  currentPage.value = 1
  emit('search', searchString)
  emit('update:searchQuery', searchString)
}

const handleSort = (key: string) => {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortOrder.value = 'asc'
  }
  
  emit('update:sortBy', sortBy.value)
  emit('update:sortOrder', sortOrder.value)
  emit('sort', sortBy.value, sortOrder.value)
}

const toggleSelect = (item: any) => {
  const key = getItemKey(item, 0)
  const index = selectedItems.value.findIndex(selected => getItemKey(selected, 0) === key)
  
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    if (props.multiple) {
      selectedItems.value.push(item)
    } else {
      selectedItems.value = [item]
    }
  }
  
  emit('update:modelValue', [...selectedItems.value])
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = [...computedItems.value]
  }
  
  emit('update:modelValue', [...selectedItems.value])
}

const handleRowClick = (item: any, event: MouseEvent) => {
  if (props.clickable) {
    emit('row-click', item, event)
  }
}

const handleRowDblClick = (item: any, event: MouseEvent) => {
  emit('row-dblclick', item, event)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emit('update:page', page)
  }
}

// إضافة الدالة المفقودة
const getRowClasses = (item: any, index: number) => [
  'table__row',
  {
    'table__row--selected': isSelected(item),
    'table__row--clickable': props.clickable,
    'table__row--odd': index % 2 === 1,
    'table__row--even': index % 2 === 0
  }
]

// فئات الأعمدة والخلايا
const getHeaderClasses = (header: TableHeader) => [
  'table__cell',
  'table__cell--header',
  `table__cell--align-${header.align || 'start'}`,
  {
    'table__cell--sortable': header.sortable,
    'table__cell--sorted': sortBy.value === header.key
  },
  header.class
]

const getCellClasses = (header: TableHeader, item: any) => [
  'table__cell',
  `table__cell--align-${header.align || 'start'}`,
  header.cellClass
]

const getHeaderStyles = (header: TableHeader) => ({
  width: header.width ? `${header.width}px` : undefined,
  minWidth: header.minWidth ? `${header.minWidth}px` : undefined,
  maxWidth: header.maxWidth ? `${header.maxWidth}px` : undefined
})

const getCellStyles = (header: TableHeader) => ({
  width: header.width ? `${header.width}px` : undefined,
  minWidth: header.minWidth ? `${header.minWidth}px` : undefined,
  maxWidth: header.maxWidth ? `${header.maxWidth}px` : undefined
})

// مراقبة التغييرات
watch(() => props.modelValue, (newValue) => {
  selectedItems.value = newValue || []
}, { immediate: true })

watch(() => props.page, (newValue) => {
  currentPage.value = newValue
}, { immediate: true })

watch(() => props.searchQuery, (newValue) => {
  searchQuery.value = newValue || ''
}, { immediate: true })

// تصدير الطرق
defineExpose({
  selectedItems,
  searchQuery,
  currentPage,
  sortBy,
  sortOrder
})
</script> 