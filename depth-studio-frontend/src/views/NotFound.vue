<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <v-icon size="120" color="grey">mdi-alert-circle-outline</v-icon>
        <h1 class="text-h3 mt-4">صفحة غير موجودة</h1>
        <p class="text-h6 mt-2 text-medium-emphasis">
          عذراً، الصفحة التي تبحث عنها غير موجودة
        </p>
        <v-btn 
          color="primary" 
          size="large"
          class="mt-4"
          @click="$router.push('/')"
        >
          العودة للرئيسية
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// صفحة 404
</script> 