<template>
  <div class="mb-4">
    <label v-if="label" class="block mb-2 text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    <div class="relative">
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClass"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      />
      <!-- Loading Spinner -->
      <div v-if="loading" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </div>
    </div>
    <!-- Error Message -->
    <div v-if="error" class="mt-1 text-sm text-red-600 flex items-center gap-1">
      <span>⚠️</span>
      <span>{{ error }}</span>
    </div>
    <!-- Hint Message -->
    <div v-if="hint && !error" class="mt-1 text-sm text-gray-500">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string
  type?: string
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  loading?: boolean
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  loading: false
})

defineEmits<{
  'update:modelValue': [value: string]
  'blur': []
  'focus': []
}>()

const inputClass = computed(() => [
  'input',
  'w-full px-3 py-2 border rounded-md shadow-sm transition-colors',
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  {
    'border-red-500 focus:ring-red-500 focus:border-red-500': props.error,
    'border-gray-300': !props.error,
    'bg-gray-50 cursor-not-allowed': props.disabled,
    'pl-10': props.loading
  }
])
</script> 