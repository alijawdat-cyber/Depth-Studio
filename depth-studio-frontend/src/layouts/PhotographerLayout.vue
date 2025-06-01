<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item>
          <v-list-item-title class="text-h6">
            Depth Studio - مصور
          </v-list-item-title>
        </v-list-item>
        <v-divider></v-divider>
        
        <v-list-item to="/photographer/dashboard">
          <v-list-item-title>لوحة التحكم</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/photographer/tasks">
          <v-list-item-title>مهامي</v-list-item-title>
        </v-list-item>
        
        <v-list-item to="/photographer/upload">
          <v-list-item-title>رفع المحتوى</v-list-item-title>
        </v-list-item>
        
        <v-divider></v-divider>
        
        <v-list-item @click="handleSignOut">
          <v-list-item-title>تسجيل الخروج</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Depth Studio</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const drawer = ref(true)
const { signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
}
</script> 