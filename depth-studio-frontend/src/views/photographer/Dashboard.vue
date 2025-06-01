<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-6 mb-6">
          <h2>مرحباً بك أيها المصور</h2>
          <p class="text-body-2">لوحة تحكم المصور - Depth Studio</p>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card class="text-center pa-4">
          <v-icon size="48" color="primary">mdi-camera</v-icon>
          <h3>المهام الحالية</h3>
          <h2 class="text-primary">5</h2>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card class="text-center pa-4">
          <v-icon size="48" color="success">mdi-check</v-icon>
          <h3>المشاريع المكتملة</h3>
          <h2 class="text-success">12</h2>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card class="text-center pa-4">
          <v-icon size="48" color="warning">mdi-star</v-icon>
          <h3>التقييم</h3>
          <h2 class="text-warning">4.8</h2>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// لوحة تحكم المصور
</script> 