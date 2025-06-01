<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="pa-6">
          <v-card-title class="text-center mb-4">
            <h2>إنشاء حساب جديد</h2>
            <p>Depth Studio</p>
          </v-card-title>

          <v-form @submit.prevent="handleRegister">
            <v-text-field
              v-model="formData.displayName"
              label="الاسم الكامل"
              prepend-inner-icon="mdi-account"
              :error-messages="errors.displayName"
              required
            />

            <v-text-field
              v-model="formData.email"
              label="البريد الإلكتروني"
              type="email"
              prepend-inner-icon="mdi-email"
              :error-messages="errors.email"
              required
            />

            <v-text-field
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              label="كلمة المرور"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              :error-messages="errors.password"
              required
            />

            <v-select
              v-model="formData.primaryRole"
              :items="roleOptions"
              label="نوع الحساب"
              prepend-inner-icon="mdi-briefcase"
              :error-messages="errors.primaryRole"
              required
            />

            <v-btn
              type="submit"
              color="primary"
              block
              :loading="isLoading"
              class="mt-4"
            >
              إنشاء الحساب
            </v-btn>
          </v-form>

          <div class="text-center mt-4">
            <v-btn
              variant="text"
              color="primary"
              @click="$router.push('/auth/login')"
            >
              لديك حساب؟ سجل الدخول
            </v-btn>
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

const { registerWithEmail } = useAuth()
const router = useRouter()

const showPassword = ref(false)
const isLoading = ref(false)

const formData = ref({
  displayName: '',
  email: '',
  password: '',
  primaryRole: ''
})

const errors = ref({
  displayName: '',
  email: '',
  password: '',
  primaryRole: ''
})

const roleOptions = [
  { title: 'مصور', value: 'photographer' },
  { title: 'منسق براند', value: 'brand_coordinator' },
  { title: 'منسق تسويق', value: 'marketing_coordinator' }
]

const handleRegister = async () => {
  // Reset errors
  errors.value = {
    displayName: '',
    email: '',
    password: '',
    primaryRole: ''
  }

  // Validation
  if (!formData.value.displayName) {
    errors.value.displayName = 'الاسم مطلوب'
    return
  }
  
  if (!formData.value.email) {
    errors.value.email = 'البريد الإلكتروني مطلوب'
    return
  }
  
  if (!formData.value.password) {
    errors.value.password = 'كلمة المرور مطلوبة'
    return
  }
  
  if (!formData.value.primaryRole) {
    errors.value.primaryRole = 'نوع الحساب مطلوب'
    return
  }

  try {
    isLoading.value = true
    await registerWithEmail(
      formData.value.email,
      formData.value.password,
      formData.value.displayName
    )
    // سيتم التوجيه للدور setup تلقائياً
  } catch (error: any) {
    errors.value.email = error.message || 'خطأ في إنشاء الحساب'
  } finally {
    isLoading.value = false
  }
}
</script> 