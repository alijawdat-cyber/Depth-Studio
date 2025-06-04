<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app" dir="rtl">
    <RouterView />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  direction: rtl;
  text-align: right;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #f5f5f5;
  direction: rtl;
}

/* تحسين النصوص العربية */
.arabic {
  font-family: 'Cairo', 'Noto Sans Arabic', sans-serif;
  direction: rtl;
  text-align: right;
}

/* إصلاح الحقول النصية للعربية */
input[type="email"],
input[type="password"],
input[type="text"],
input[type="tel"] {
  direction: ltr !important;
  text-align: left !important;
}

/* إصلاح الـ placeholders */
input::placeholder {
  direction: ltr;
  text-align: left;
}
</style>
