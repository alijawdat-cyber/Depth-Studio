<template>
  <v-btn
    :icon="isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
    @click="toggleTheme"
    size="small"
    variant="text"
    :title="isDark ? 'تبديل للوضع الفاتح' : 'تبديل للوضع المظلم'"
  />
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-switcher {
  display: flex;
  gap: 8px;
}
</style> 