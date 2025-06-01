<template>
  <v-app>
    <!-- خلفية متدرجة جميلة -->
    <v-main class="auth-background">
      <div class="fill-height">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// Layout للمصادقة مع تصميم متدرج
</script>

<style scoped lang="scss">

.auth-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  
  .auth-container {
    width: 100%;
    max-width: 600px;
    position: relative;
  }
  
  .auth-content {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--elevation-high);
    border: 1px solid rgba(255, 255, 255, 0.2);
    overflow: hidden;
  }
  
  .auth-header {
    text-align: center;
    padding: var(--spacing-8) var(--spacing-6) var(--spacing-4);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    
    .logo {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-primary-600);
      margin-bottom: var(--spacing-2);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .subtitle {
      color: var(--color-text-secondary);
      font-size: 0.95rem;
    }
  }
  
  .auth-body {
    padding: var(--spacing-6);
  }
}

// Responsive design
@media (max-width: 600px) {
  .auth-layout {
    padding: var(--spacing-2);
    
    .auth-header {
      padding: var(--spacing-6) var(--spacing-4) var(--spacing-3);
      
      .logo {
        font-size: 1.75rem;
      }
      
      .subtitle {
        font-size: 0.875rem;
      }
    }
    
    .auth-body {
      padding: var(--spacing-4);
    }
  }
}
</style> 