<template>
  <div class="h-screen flex items-center justify-center" style="background: linear-gradient(135deg, #eff6ff, #dbeafe);">
    <div class="w-full max-w-md p-6">
      <div class="card">
        <div class="text-center mb-6">
          <h1 class="text-2xl font-semibold mb-2 text-blue-600">Depth Studio</h1>
          <p class="text-gray-600">نظام إدارة المحتوى الذكي</p>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">جاري التحميل...</p>
        </div>
        
        <!-- Auth Content -->
        <router-view v-else />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoading = computed(() => authStore.isLoading)
</script> 