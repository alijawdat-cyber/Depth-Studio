<template>
  <div class="system-settings">
    <!-- Header Section -->
    <BaseCard class="mb-6 header-card">
      <template #title>
        <div class="d-flex align-center gap-3">
          <v-icon size="32" color="primary">mdi-cog</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">إعدادات النظام</h1>
            <p class="text-body-2 mt-1" style="color: var(--color-text-medium-emphasis)">التحكم الشامل في إعدادات النظام والأمان</p>
          </div>
        </div>
      </template>
    </BaseCard>

    <!-- Quick Actions -->
    <div class="d-flex gap-4 mb-6">
      <BaseCard class="flex-1 quick-action-card security">
        <template #title>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-3">
              <v-icon size="32" color="error">mdi-shield-check</v-icon>
              <div>
                <h4 class="text-h6">الأمان</h4>
                <p class="text-body-2" style="color: var(--color-text-medium-emphasis)">آخر فحص: اليوم</p>
              </div>
            </div>
            <v-chip color="success" size="small">آمن</v-chip>
          </div>
        </template>
      </BaseCard>

      <BaseCard class="flex-1 quick-action-card backup">
        <template #title>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-3">
              <v-icon size="32" color="info">mdi-backup-restore</v-icon>
              <div>
                <h4 class="text-h6">النسخ الاحتياطي</h4>
                <p class="text-body-2" style="color: var(--color-text-medium-emphasis)">آخر نسخة: أمس</p>
              </div>
            </div>
            <v-chip color="success" size="small">مفعل</v-chip>
          </div>
        </template>
      </BaseCard>

      <BaseCard class="flex-1 quick-action-card performance">
        <template #title>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-3">
              <v-icon size="32" color="warning">mdi-speedometer</v-icon>
              <div>
                <h4 class="text-h6">الأداء</h4>
                <p class="text-body-2" style="color: var(--color-text-medium-emphasis)">استهلاك: متوسط</p>
              </div>
            </div>
            <v-chip color="warning" size="small">مراقبة</v-chip>
          </div>
        </template>
      </BaseCard>
    </div>

    <!-- Settings Categories -->
    <v-row>
      <!-- Security Settings -->
      <v-col cols="12" md="6">
        <BaseCard class="settings-category-card">
          <template #title>
            <div class="d-flex align-center gap-3">
              <v-icon size="24" color="error">mdi-security</v-icon>
              <h3 class="text-h6">إعدادات الأمان</h3>
            </div>
          </template>
          <template #default>
            <v-list class="bg-transparent">
              <v-list-item
                v-for="setting in securitySettings"
                :key="setting.key"
                @click="openSecurityDialog(setting)"
              >
                <template #prepend>
                  <v-icon :color="setting.color">{{ setting.icon }}</v-icon>
                </template>
                <v-list-item-title>{{ setting.title }}</v-list-item-title>
                <v-list-item-subtitle style="color: var(--color-text-medium-emphasis)">
                  {{ setting.description }}
                </v-list-item-subtitle>
                <template #append>
                  <v-switch
                    v-model="setting.enabled"
                    color="primary"
                    hide-details
                    @change="updateSetting(setting)"
                  />
                </template>
              </v-list-item>
            </v-list>
          </template>
        </BaseCard>
      </v-col>

      <!-- System Settings -->
      <v-col cols="12" md="6">
        <BaseCard class="settings-category-card">
          <template #title>
            <div class="d-flex align-center gap-3">
              <v-icon size="24" color="primary">mdi-cog-outline</v-icon>
              <h3 class="text-h6">إعدادات عامة</h3>
            </div>
          </template>
          <template #default>
            <v-form>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="systemConfig.siteName"
                    label="اسم الموقع"
                    variant="outlined"
                    prepend-inner-icon="mdi-web"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="systemConfig.adminEmail"
                    label="بريد المدير الإلكتروني"
                    variant="outlined"
                    prepend-inner-icon="mdi-email"
                    type="email"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="systemConfig.timezone"
                    :items="timezoneOptions"
                    label="المنطقة الزمنية"
                    variant="outlined"
                    prepend-inner-icon="mdi-clock"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="systemConfig.language"
                    :items="languageOptions"
                    label="اللغة الافتراضية"
                    variant="outlined"
                    prepend-inner-icon="mdi-translate"
                  />
                </v-col>
              </v-row>
            </v-form>
          </template>
          <template #actions>
            <v-spacer />
            <BaseButton
              color="primary"
              @click="saveSystemConfig"
              :loading="saveLoading"
            >
              حفظ الإعدادات
            </BaseButton>
          </template>
        </BaseCard>
      </v-col>

      <!-- Email Settings -->
      <v-col cols="12" md="6">
        <BaseCard class="settings-category-card">
          <template #title>
            <div class="d-flex align-center gap-3">
              <v-icon size="24" color="info">mdi-email-settings</v-icon>
              <h3 class="text-h6">إعدادات البريد الإلكتروني</h3>
            </div>
          </template>
          <template #default>
            <v-form>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="emailConfig.smtpHost"
                    label="خادم SMTP"
                    variant="outlined"
                    prepend-inner-icon="mdi-server"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="emailConfig.smtpPort"
                    label="منفذ SMTP"
                    variant="outlined"
                    prepend-inner-icon="mdi-network"
                    type="number"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="emailConfig.encryption"
                    :items="encryptionOptions"
                    label="نوع التشفير"
                    variant="outlined"
                    prepend-inner-icon="mdi-lock"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="emailConfig.username"
                    label="اسم المستخدم"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="emailConfig.password"
                    label="كلمة المرور"
                    variant="outlined"
                    prepend-inner-icon="mdi-key"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showPassword = !showPassword"
                  />
                </v-col>
              </v-row>
            </v-form>
          </template>
          <template #actions>
            <v-spacer />
            <BaseButton
              variant="outlined"
              color="info"
              @click="testEmailConnection"
              :loading="testEmailLoading"
              class="mr-2"
            >
              اختبار الاتصال
            </BaseButton>
            <BaseButton
              color="primary"
              @click="saveEmailConfig"
              :loading="saveEmailLoading"
            >
              حفظ
            </BaseButton>
          </template>
        </BaseCard>
      </v-col>

      <!-- Payment Settings -->
      <v-col cols="12" md="6">
        <BaseCard class="settings-category-card">
          <template #title>
            <div class="d-flex align-center gap-3">
              <v-icon size="24" color="success">mdi-credit-card-settings</v-icon>
              <h3 class="text-h6">إعدادات الدفع</h3>
            </div>
          </template>
          <template #default>
            <v-form>
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="paymentConfig.provider"
                    :items="paymentProviders"
                    label="مزود الدفع"
                    variant="outlined"
                    prepend-inner-icon="mdi-credit-card"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="paymentConfig.apiKey"
                    label="مفتاح API"
                    variant="outlined"
                    prepend-inner-icon="mdi-key-variant"
                    :type="showApiKey ? 'text' : 'password'"
                    :append-inner-icon="showApiKey ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showApiKey = !showApiKey"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="paymentConfig.webhookUrl"
                    label="رابط Webhook"
                    variant="outlined"
                    prepend-inner-icon="mdi-webhook"
                  />
                </v-col>
                <v-col cols="12">
                  <v-switch
                    v-model="paymentConfig.testMode"
                    label="وضع الاختبار"
                    color="warning"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-form>
          </template>
          <template #actions>
            <v-spacer />
            <BaseButton
              color="primary"
              @click="savePaymentConfig"
              :loading="savePaymentLoading"
            >
              حفظ
            </BaseButton>
          </template>
        </BaseCard>
      </v-col>
    </v-row>

    <!-- Security Dialog -->
    <v-dialog
      v-model="securityDialog.show"
      max-width="600"
      persistent
    >
      <BaseCard>
        <template #title>
          <h3 class="text-h6">{{ securityDialog.setting?.title }}</h3>
        </template>
        <template #default>
          <div v-if="securityDialog.setting">
            <p class="text-body-1 mb-4">{{ securityDialog.setting.fullDescription }}</p>
            
            <v-form v-if="securityDialog.setting.key === 'twoFactor'">
              <v-text-field
                v-model="securityDialog.phoneNumber"
                label="رقم الهاتف للمصادقة الثنائية"
                variant="outlined"
                prepend-inner-icon="mdi-phone"
                dir="ltr"
              />
            </v-form>

            <v-form v-else-if="securityDialog.setting.key === 'sessionTimeout'">
              <v-select
                v-model="securityDialog.timeoutValue"
                :items="timeoutOptions"
                label="مدة انتهاء الجلسة"
                variant="outlined"
                prepend-inner-icon="mdi-timer"
              />
            </v-form>
          </div>
        </template>
        <template #actions>
          <v-spacer />
          <BaseButton
            variant="text"
            @click="securityDialog.show = false"
          >
            إلغاء
          </BaseButton>
          <BaseButton
            color="primary"
            @click="saveSecuritySetting"
            :loading="securityDialog.loading"
          >
            حفظ
          </BaseButton>
        </template>
      </BaseCard>
    </v-dialog>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <LoadingSpinner size="large" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// التحقق من الصلاحيات
// TODO: إضافة التحقق من صلاحيات super-admin

// State
const loading = ref(true)
const saveLoading = ref(false)
const saveEmailLoading = ref(false)
const savePaymentLoading = ref(false)
const testEmailLoading = ref(false)
const showPassword = ref(false)
const showApiKey = ref(false)

// Security Settings
const securitySettings = ref([
  {
    key: 'twoFactor',
    title: 'المصادقة الثنائية',
    description: 'تفعيل المصادقة بالهاتف',
    fullDescription: 'تفعيل المصادقة الثنائية يضيف طبقة أمان إضافية لحسابات المستخدمين',
    icon: 'mdi-two-factor-authentication',
    color: 'success',
    enabled: false
  },
  {
    key: 'bruteForce',
    title: 'حماية من الهجمات',
    description: 'منع محاولات تسجيل الدخول المتكررة',
    fullDescription: 'حماية النظام من محاولات القوة الغاشمة والهجمات الآلية',
    icon: 'mdi-shield-alert',
    color: 'error',
    enabled: true
  },
  {
    key: 'sessionTimeout',
    title: 'انتهاء صلاحية الجلسة',
    description: 'إنهاء الجلسات غير النشطة',
    fullDescription: 'تحديد المدة التي يبقى فيها المستخدم مسجل الدخول قبل انتهاء الجلسة',
    icon: 'mdi-timer-sand',
    color: 'warning',
    enabled: true
  },
  {
    key: 'ipWhitelist',
    title: 'قائمة IP المسموحة',
    description: 'السماح لعناوين IP محددة فقط',
    fullDescription: 'تقييد الوصول للنظام من عناوين IP محددة مسبقاً',
    icon: 'mdi-ip-network',
    color: 'info',
    enabled: false
  }
])

// System Configuration
const systemConfig = ref({
  siteName: 'Depth Studio',
  adminEmail: 'admin@depth-studio.com',
  timezone: 'Asia/Baghdad',
  language: 'ar'
})

// Email Configuration
const emailConfig = ref({
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  encryption: 'tls',
  username: '',
  password: ''
})

// Payment Configuration
const paymentConfig = ref({
  provider: 'stripe',
  apiKey: '',
  webhookUrl: '',
  testMode: true
})

// Security Dialog
const securityDialog = ref({
  show: false,
  setting: null as any,
  loading: false,
  phoneNumber: '',
  timeoutValue: 30
})

// Options
const timezoneOptions = [
  { title: 'بغداد (GMT+3)', value: 'Asia/Baghdad' },
  { title: 'الرياض (GMT+3)', value: 'Asia/Riyadh' },
  { title: 'القاهرة (GMT+2)', value: 'Africa/Cairo' },
  { title: 'دبي (GMT+4)', value: 'Asia/Dubai' }
]

const languageOptions = [
  { title: 'العربية', value: 'ar' },
  { title: 'English', value: 'en' }
]

const encryptionOptions = [
  { title: 'TLS', value: 'tls' },
  { title: 'SSL', value: 'ssl' },
  { title: 'بدون تشفير', value: 'none' }
]

const paymentProviders = [
  { title: 'Stripe', value: 'stripe' },
  { title: 'PayPal', value: 'paypal' },
  { title: 'Square', value: 'square' }
]

const timeoutOptions = [
  { title: '15 دقيقة', value: 15 },
  { title: '30 دقيقة', value: 30 },
  { title: '1 ساعة', value: 60 },
  { title: '4 ساعات', value: 240 },
  { title: '8 ساعات', value: 480 }
]

// Methods
const openSecurityDialog = (setting: any) => {
  securityDialog.value.setting = setting
  securityDialog.value.show = true
  
  // Reset form values
  securityDialog.value.phoneNumber = ''
  securityDialog.value.timeoutValue = 30
}

const updateSetting = async (setting: any) => {
  try {
    // TODO: Implement API call
    console.log('Updating setting:', setting.key, setting.enabled)
  } catch (error) {
    console.error('Error updating setting:', error)
    // Revert the change
    setting.enabled = !setting.enabled
  }
}

const saveSecuritySetting = async () => {
  securityDialog.value.loading = true
  
  try {
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Saving security setting:', securityDialog.value.setting.key)
    securityDialog.value.show = false
  } catch (error) {
    console.error('Error saving security setting:', error)
  } finally {
    securityDialog.value.loading = false
  }
}

const saveSystemConfig = async () => {
  saveLoading.value = true
  
  try {
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Saving system config:', systemConfig.value)
  } catch (error) {
    console.error('Error saving system config:', error)
  } finally {
    saveLoading.value = false
  }
}

const saveEmailConfig = async () => {
  saveEmailLoading.value = true
  
  try {
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Saving email config:', emailConfig.value)
  } catch (error) {
    console.error('Error saving email config:', error)
  } finally {
    saveEmailLoading.value = false
  }
}

const testEmailConnection = async () => {
  testEmailLoading.value = true
  
  try {
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('Testing email connection...')
    alert('تم اختبار الاتصال بنجاح!')
  } catch (error) {
    console.error('Error testing email connection:', error)
    alert('فشل في اختبار الاتصال!')
  } finally {
    testEmailLoading.value = false
  }
}

const savePaymentConfig = async () => {
  savePaymentLoading.value = true
  
  try {
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Saving payment config:', paymentConfig.value)
  } catch (error) {
    console.error('Error saving payment config:', error)
  } finally {
    savePaymentLoading.value = false
  }
}

const loadSettings = async () => {
  loading.value = true
  
  try {
    // TODO: Implement API calls to load settings
    await new Promise(resolve => setTimeout(resolve, 800))
    
    console.log('Settings loaded successfully')
  } catch (error) {
    console.error('Error loading settings:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadSettings()
})
</script>

<style scoped lang="scss">
@import '@/styles/design-system/index';

.system-settings {
  .header-card {
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-surface), 1));
  }

  .quick-action-card {
    transition: transform var(--transition-normal) var(--easing-ease-out);
    
    &:hover {
      transform: translateY(-2px);
    }
    
    &.security {
      border-left: 4px solid var(--color-error-500);
    }
    
    &.backup {
      border-left: 4px solid var(--color-info-500);
    }
    
    &.performance {
      border-left: 4px solid var(--color-warning-500);
    }
  }

  .settings-category-card {
    height: 100%;
    
    .v-list-item {
      transition: background-color var(--transition-normal) var(--easing-ease-out);
      
      &:hover {
        background-color: rgba(var(--v-theme-primary), 0.05);
      }
    }
  }
}
</style> 