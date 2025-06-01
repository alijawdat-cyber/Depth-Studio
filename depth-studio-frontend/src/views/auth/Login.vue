<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6">
          <v-card-title class="text-center mb-4">
            <h2>تسجيل الدخول</h2>
            <p>Depth Studio</p>
          </v-card-title>

          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="البريد الإلكتروني"
              type="email"
              prepend-inner-icon="mdi-email"
              :error-messages="errors.email"
              required
            />

            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="كلمة المرور"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              :error-messages="errors.password"
              required
            />

            <v-btn
              type="submit"
              color="primary"
              block
              :loading="isLoading"
              class="mt-4"
            >
              دخول
            </v-btn>
          </v-form>

          <div class="text-center mt-4">
            <v-btn
              variant="text"
              color="primary"
              @click="$router.push('/auth/register')"
            >
              ليس لديك حساب؟ سجل الآن
            </v-btn>
          </div>

          <div class="text-center mt-2">
            <ThemeSwitcher />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'

const { signInWithEmail } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errors = ref({ email: '', password: '' })

const handleLogin = async () => {
  errors.value = { email: '', password: '' }
  
  if (!email.value) {
    errors.value.email = 'البريد الإلكتروني مطلوب'
    return
  }
  
  if (!password.value) {
    errors.value.password = 'كلمة المرور مطلوبة'
    return
  }

  try {
    isLoading.value = true
    await signInWithEmail(email.value, password.value)
    router.push('/super-admin/dashboard')
  } catch (error: any) {
    errors.value.email = error.message || 'خطأ في تسجيل الدخول'
  } finally {
    isLoading.value = false
  }
}
</script> 