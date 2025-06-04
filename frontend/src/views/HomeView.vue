<template>
  <div class="welcome-page">
    <!-- Hero Section -->
    <div class="hero-container">
      <div class="hero-content">
        <div class="logo-section">
          <div class="logo-icon">📸</div>
          <h1 class="logo-title">Depth Studio</h1>
          <p class="logo-subtitle">نظام إدارة المحتوى الذكي المدعوم بالذكاء الاصطناعي</p>
        </div>
        
        <div class="action-buttons">
          <button @click="goToLogin" class="btn-primary">
            <span>تسجيل الدخول</span>
            <span>→</span>
          </button>
          
          <button @click="goToRegister" class="btn-secondary">
            <span>إنشاء حساب جديد</span>
            <span>+</span>
          </button>
        </div>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h3>ذكاء اصطناعي</h3>
            <p>تخصيص المهام التلقائي للمصورين</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>تحليلات متقدمة</h3>
            <p>تقارير شاملة وتحليل الأداء</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>سرعة وكفاءة</h3>
            <p>تسريع إنتاج المحتوى</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goToLogin() {
  router.push('/auth/login')
}

function goToRegister() {
  router.push('/auth/register')
}
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.hero-container {
  max-width: 1200px;
  width: 100%;
  text-align: center;
}

.hero-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

.logo-section {
  margin-bottom: 3rem;
}

.logo-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.logo-title {
  font-size: 3.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.logo-subtitle {
  font-size: 1.25rem;
  color: #718096;
  max-width: 500px;
  margin: 0 auto;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;
}

.btn-primary, .btn-secondary {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #718096;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-content {
    padding: 2rem;
  }
  
  .logo-title {
    font-size: 2.5rem;
  }
}
</style>
