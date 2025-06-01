<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h2 class="mb-4">مهامي</h2>
        
        <v-card>
          <v-card-title>قائمة المهام</v-card-title>
          <v-card-text>
            <v-alert type="info" class="mb-4">
              لا توجد مهام جديدة حالياً
            </v-alert>
            
            <v-list>
              <v-list-item>
                <v-list-item-title>جلسة تصوير - براند ABC</v-list-item-title>
                <v-list-item-subtitle>غداً الساعة 10 صباحاً</v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip color="warning" size="small">قريباً</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// صفحة مهام المصور
</script> 