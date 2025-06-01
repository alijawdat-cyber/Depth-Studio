/**
 * ==============================================
 * نظام الثيم البسيط - DEPTH STUDIO
 * ==============================================
 */

import { ref, computed, onMounted } from 'vue'
import { useTheme as useVuetifyTheme } from 'vuetify'

export type ThemeMode = 'light' | 'dark'

export function useTheme() {
  const vuetifyTheme = useVuetifyTheme()
  
  const currentMode = ref<ThemeMode>('light')
  
  const isDark = computed(() => currentMode.value === 'dark')
  
  const setThemeMode = (mode: ThemeMode) => {
    currentMode.value = mode
    applyTheme()
    localStorage.setItem('theme-mode', mode)
  }
  
  const toggleTheme = () => {
    setThemeMode(isDark.value ? 'light' : 'dark')
  }
  
  const applyTheme = () => {
    const html = document.documentElement
    
    // Apply theme mode
    html.setAttribute('data-theme', currentMode.value)
    vuetifyTheme.global.name.value = currentMode.value
  }
  
  const initialize = () => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode
    
    if (savedMode && ['light', 'dark'].includes(savedMode)) {
      currentMode.value = savedMode
    }
    
    applyTheme()
  }
  
  onMounted(initialize)
  
  return {
    currentMode,
    isDark,
    setThemeMode,
    toggleTheme
  }
} 