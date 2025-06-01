<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(async () => {
  console.log('🚀 تهيئة التطبيق...')
  console.log('✅ تم تهيئة التطبيق بنجاح')
})
</script>

<template>
  <v-app dir="rtl">
    <router-view />
  </v-app>
</template>

<style>
/* Global styles if needed */
</style>
