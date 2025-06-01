<template>
  <div>
    <v-card class="ma-4">
      <v-card-title>
        <h1>الصفحة غير موجودة - 404</h1>
      </v-card-title>
      <v-card-text>
        <p>عذراً، الصفحة التي تبحث عنها غير موجودة</p>
        <v-alert type="error" class="mt-4">
          تأكد من صحة الرابط أو عد للصفحة الرئيسية
        </v-alert>
        <v-btn color="primary" class="mt-4" @click="$router.push('/')">
          العودة للصفحة الرئيسية
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
// صفحة 404
</script> 