<template>
  <v-container fluid class="pa-0">
    <v-row no-gutters justify="center" align="center" style="min-height: 100vh;">
      <v-col cols="12" sm="10" md="8" lg="8" xl="7">
        <v-card 
          class="mx-auto role-setup-card" 
          :max-width="850"
          elevation="24"
          rounded="xl"
        >
          <div class="card-header">
            <v-img
              src="/logo-depth-studio.png"
              alt="Depth Studio"
              height="50"
              width="180"
              contain
              class="mx-auto mb-4"
            />
            <h1 class="text-h4 font-weight-bold text-center mb-2">
              إعداد دورك في النظام
            </h1>
            <p class="text-center text-medium-emphasis mb-6">
              اختر الدور المناسب لك واكمل البيانات المطلوبة
            </p>
          </div>

          <v-card-text class="pa-8">
            <!-- مرحلة اختيار الدور -->
            <div v-if="currentStep === 'role-selection'">
              <h2 class="text-h5 mb-6 text-center">اختر دورك المطلوب</h2>
              
              <v-row>
                <!-- مصور -->
                <v-col cols="12" md="4">
                  <v-card 
                    class="role-card" 
                    :class="{ 'selected': selectedRole === 'photographer' }"
                    @click="selectRole('photographer')"
                    variant="outlined"
                    hover
                  >
                    <v-card-text class="text-center pa-6">
                      <v-icon size="64" color="primary" class="mb-4">
                        mdi-camera
                      </v-icon>
                      <h3 class="text-h6 mb-3">مصور</h3>
                      <p class="text-body-2 mb-4">
                        متخصص في التصوير الفوتوغرافي وإنتاج الفيديو
                      </p>
                      <v-chip color="success" variant="outlined" size="small">
                        تفعيل فوري
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- منسق براند -->
                <v-col cols="12" md="4">
                  <v-card 
                    class="role-card" 
                    :class="{ 'selected': selectedRole === 'brand_coordinator' }"
                    @click="selectRole('brand_coordinator')"
                    variant="outlined"
                    hover
                  >
                    <v-card-text class="text-center pa-6">
                      <v-icon size="64" color="warning" class="mb-4">
                        mdi-domain
                      </v-icon>
                      <h3 class="text-h6 mb-3">منسق براند</h3>
                      <p class="text-body-2 mb-4">
                        إدارة براند محدد والتنسيق مع الفريق
                      </p>
                      <v-chip color="warning" variant="outlined" size="small">
                        يحتاج موافقة
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- منسق تسويق -->
                <v-col cols="12" md="4">
                  <v-card 
                    class="role-card" 
                    :class="{ 'selected': selectedRole === 'marketing_coordinator' }"
                    @click="selectRole('marketing_coordinator')"
                    variant="outlined"
                    hover
                  >
                    <v-card-text class="text-center pa-6">
                      <v-icon size="64" color="error" class="mb-4">
                        mdi-bullhorn
                      </v-icon>
                      <h3 class="text-h6 mb-3">منسق تسويق</h3>
                      <p class="text-body-2 mb-4">
                        إدارة الحملات التسويقية والمحتوى
                      </p>
                      <v-chip color="error" variant="outlined" size="small">
                        موافقة خاصة
                      </v-chip>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <div class="text-center mt-8">
                <v-btn
                  color="primary"
                  size="large"
                  :disabled="!selectedRole"
                  @click="proceedToDetails"
                  rounded="lg"
                >
                  <v-icon start>mdi-arrow-left</v-icon>
                  متابعة
                </v-btn>
              </div>
            </div>

            <!-- مرحلة تفاصيل المصور -->
            <div v-if="currentStep === 'photographer-details'">
              <v-form ref="photographerForm" v-model="isPhotographerFormValid">
                <h2 class="text-h5 mb-6 text-center">
                  <v-icon start>mdi-camera</v-icon>
                  إعداد ملف المصور
                </h2>

                <!-- نوع العقد -->
                <v-card variant="outlined" class="mb-6">
                  <v-card-title>نوع العقد</v-card-title>
                  <v-card-text>
                    <v-radio-group v-model="photographerData.contractType" :rules="contractRules">
                      <v-radio value="freelancer">
                        <template #label>
                          <div>
                            <strong>فريلانسر (بالقطعة)</strong>
                            <br>
                            <span class="text-caption text-medium-emphasis">
                              أجر متغير حسب نوع وعدد المهام المنجزة
                            </span>
                          </div>
                        </template>
                      </v-radio>
                      <v-radio value="salary">
                        <template #label>
                          <div>
                            <strong>راتب ثابت</strong>
                            <br>
                            <span class="text-caption text-medium-emphasis">
                              راتب شهري ثابت مع مكافآت الأداء
                            </span>
                          </div>
                        </template>
                      </v-radio>
                    </v-radio-group>
                  </v-card-text>
                </v-card>

                <!-- التخصصات -->
                <v-card variant="outlined" class="mb-6">
                  <v-card-title>التخصصات المفضلة</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col v-for="specialization in availableSpecializations" :key="specialization.id" cols="6" md="4">
                        <v-checkbox
                          v-model="photographerData.specializations"
                          :value="specialization.id"
                          :label="specialization.name"
                          color="primary"
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>

                <!-- أوقات التوفر -->
                <v-card variant="outlined" class="mb-6">
                  <v-card-title>أوقات التوفر المفضلة</v-card-title>
                  <v-card-text>
                    <v-checkbox
                      v-model="photographerData.availability"
                      value="morning"
                      label="الفترة الصباحية (8ص - 12ظ)"
                    />
                    <v-checkbox
                      v-model="photographerData.availability"
                      value="afternoon"
                      label="فترة بعد الظهر (12ظ - 6م)"
                    />
                    <v-checkbox
                      v-model="photographerData.availability"
                      value="evening"
                      label="الفترة المسائية (6م - 10م)"
                    />
                    <v-checkbox
                      v-model="photographerData.availability"
                      value="weekend"
                      label="عطلة نهاية الأسبوع"
                    />
                  </v-card-text>
                </v-card>

                <!-- ملاحظات إضافية -->
                <v-textarea
                  v-model="photographerData.notes"
                  label="ملاحظات إضافية أو خبرات سابقة"
                  variant="outlined"
                  rows="3"
                  class="mb-6"
                />

                <!-- رسالة الخطأ -->
                <v-alert
                  v-if="error"
                  type="error"
                  variant="outlined"
                  class="mb-4"
                  @click:close="clearError"
                  closable
                >
                  {{ error }}
                </v-alert>

                <div class="d-flex justify-space-between">
                  <v-btn variant="outlined" @click="goBack">
                    <v-icon start>mdi-arrow-right</v-icon>
                    رجوع
                  </v-btn>
                  <v-btn
                    color="primary"
                    :loading="isLoading"
                    :disabled="!isPhotographerFormValid || isLoading"
                    @click="handleSubmitPhotographer"
                  >
                    <v-icon start>mdi-check</v-icon>
                    إكمال التسجيل
                  </v-btn>
                </div>
              </v-form>
            </div>

            <!-- مرحلة تفاصيل منسق البراند -->
            <div v-if="currentStep === 'brand-coordinator-details'">
              <v-form ref="brandCoordinatorForm" v-model="isBrandFormValid">
                <h2 class="text-h5 mb-6 text-center">
                  <v-icon start>mdi-domain</v-icon>
                  إعداد منسق البراند
                </h2>

                <!-- البحث عن البراند -->
                <v-autocomplete
                  v-model="brandCoordinatorData.selectedBrand"
                  :items="availableBrands"
                  :rules="brandRules"
                  item-title="name"
                  item-value="id"
                  label="ابحث عن البراند المطلوب"
                  variant="outlined"
                  clearable
                  class="mb-6"
                >
                  <template #item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-avatar size="40" class="ms-3">
                          <v-img :src="item.raw.logo" :alt="item.raw.name" />
                        </v-avatar>
                      </template>
                      <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                    </v-list-item>
                  </template>
                </v-autocomplete>

                <!-- معلومات البراند المختار -->
                <v-card v-if="selectedBrandInfo" variant="outlined" class="mb-6">
                  <v-card-title>معلومات البراند المختار</v-card-title>
                  <v-card-text>
                    <div class="d-flex align-center mb-4">
                      <v-avatar size="60" class="ms-4">
                        <v-img :src="selectedBrandInfo.logo" :alt="selectedBrandInfo.name" />
                      </v-avatar>
                      <div>
                        <h3>{{ selectedBrandInfo.name }}</h3>
                        <p class="text-medium-emphasis">{{ selectedBrandInfo.description }}</p>
                      </div>
                    </div>
                    <v-chip-group>
                      <v-chip v-for="color in selectedBrandInfo.colors" :key="color" :color="color" size="small">
                        {{ color }}
                      </v-chip>
                    </v-chip-group>
                  </v-card-text>
                </v-card>

                <!-- الخبرة مع البراند -->
                <v-textarea
                  v-model="brandCoordinatorData.experience"
                  :rules="experienceRules"
                  label="اكتب عن خبرتك مع هذا البراند أو الأسباب التي تجعلك مناسب لتنسيقه"
                  variant="outlined"
                  rows="4"
                  class="mb-6"
                />

                <!-- الخبرة السابقة -->
                <v-text-field
                  v-model="brandCoordinatorData.previousExperience"
                  label="سنوات الخبرة في التنسيق أو المبيعات"
                  variant="outlined"
                  type="number"
                  min="0"
                  class="mb-6"
                />

                <!-- رسالة الخطأ -->
                <v-alert
                  v-if="error"
                  type="error"
                  variant="outlined"
                  class="mb-4"
                  @click:close="clearError"
                  closable
                >
                  {{ error }}
                </v-alert>

                <div class="d-flex justify-space-between">
                  <v-btn variant="outlined" @click="goBack">
                    <v-icon start>mdi-arrow-right</v-icon>
                    رجوع
                  </v-btn>
                  <v-btn
                    color="primary"
                    :loading="isLoading"
                    :disabled="!isBrandFormValid || isLoading"
                    @click="handleSubmitBrandCoordinator"
                  >
                    <v-icon start>mdi-send</v-icon>
                    إرسال طلب الموافقة
                  </v-btn>
                </div>
              </v-form>
            </div>

            <!-- مرحلة تفاصيل منسق التسويق -->
            <div v-if="currentStep === 'marketing-coordinator-details'">
              <v-form ref="marketingForm" v-model="isMarketingFormValid">
                <h2 class="text-h5 mb-6 text-center">
                  <v-icon start>mdi-bullhorn</v-icon>
                  طلب دور منسق التسويق
                </h2>

                <v-alert type="warning" variant="outlined" class="mb-6">
                  <strong>تنويه مهم:</strong>
                  دور منسق التسويق يتطلب موافقة خاصة من الإدارة وله صلاحيات واسعة في النظام.
                </v-alert>

                <!-- سبب الطلب -->
                <v-textarea
                  v-model="marketingData.reason"
                  :rules="reasonRules"
                  label="لماذا تريد أن تصبح منسق تسويق؟ اشرح خبرتك ومؤهلاتك"
                  variant="outlined"
                  rows="5"
                  class="mb-6"
                />

                <!-- الخبرة في التسويق -->
                <v-text-field
                  v-model="marketingData.marketingExperience"
                  :rules="experienceMarketingRules"
                  label="سنوات الخبرة في التسويق الرقمي"
                  variant="outlined"
                  type="number"
                  min="0"
                  class="mb-6"
                />

                <!-- التخصصات التسويقية -->
                <v-card variant="outlined" class="mb-6">
                  <v-card-title>التخصصات التسويقية</v-card-title>
                  <v-card-text>
                    <v-checkbox
                      v-model="marketingData.marketingSpecializations"
                      value="social_media"
                      label="إدارة وسائل التواصل الاجتماعي"
                    />
                    <v-checkbox
                      v-model="marketingData.marketingSpecializations"
                      value="content_creation"
                      label="إنشاء المحتوى التسويقي"
                    />
                    <v-checkbox
                      v-model="marketingData.marketingSpecializations"
                      value="campaign_management"
                      label="إدارة الحملات الإعلانية"
                    />
                    <v-checkbox
                      v-model="marketingData.marketingSpecializations"
                      value="analytics"
                      label="تحليل البيانات والأداء"
                    />
                    <v-checkbox
                      v-model="marketingData.marketingSpecializations"
                      value="brand_management"
                      label="إدارة العلامات التجارية"
                    />
                  </v-card-text>
                </v-card>

                <!-- رسالة الخطأ -->
                <v-alert
                  v-if="error"
                  type="error"
                  variant="outlined"
                  class="mb-4"
                  @click:close="clearError"
                  closable
                >
                  {{ error }}
                </v-alert>

                <div class="d-flex justify-space-between">
                  <v-btn variant="outlined" @click="goBack">
                    <v-icon start>mdi-arrow-right</v-icon>
                    رجوع
                  </v-btn>
                  <v-btn
                    color="primary"
                    :loading="isLoading"
                    :disabled="!isMarketingFormValid || isLoading"
                    @click="handleSubmitMarketingCoordinator"
                  >
                    <v-icon start>mdi-send</v-icon>
                    إرسال طلب الموافقة
                  </v-btn>
                </div>
              </v-form>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { db } from '@/firebase/config'
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore'

// === Router وComposables ===
const router = useRouter()
const { userProfile, updateUserRole, error, clearError } = useAuth()

// === Reactive Data ===
const currentStep = ref('role-selection')
const selectedRole = ref('')
const isLoading = ref(false)

// Form validity refs
const isPhotographerFormValid = ref(false)
const isBrandFormValid = ref(false)
const isMarketingFormValid = ref(false)

// Form refs
const photographerForm = ref()
const brandCoordinatorForm = ref()
const marketingForm = ref()

// === بيانات المصور ===
const photographerData = ref({
  contractType: '',
  specializations: [],
  availability: [],
  notes: ''
})

// === بيانات منسق البراند ===
const brandCoordinatorData = ref({
  selectedBrand: '' as string,
  experience: '',
  previousExperience: 0
})

// === بيانات منسق التسويق ===
const marketingData = ref({
  reason: '',
  marketingExperience: 0,
  marketingSpecializations: []
})

// === بيانات البراندات والتخصصات ===
const availableBrands = ref<any[]>([])
const availableSpecializations = ref([
  { id: 'product_photography', name: 'تصوير المنتجات' },
  { id: 'portrait_photography', name: 'تصوير الأشخاص' },
  { id: 'video_production', name: 'إنتاج الفيديو' },
  { id: 'graphic_design', name: 'التصميم الجرافيكي' },
  { id: 'social_media_content', name: 'محتوى السوشال ميديا' },
  { id: 'commercial_photography', name: 'التصوير التجاري' }
])

// === Computed Properties ===
const selectedBrandInfo = computed(() => {
  if (!brandCoordinatorData.value.selectedBrand) return null
  return availableBrands.value.find((brand: any) => brand.id === brandCoordinatorData.value.selectedBrand)
})

// === Validation Rules ===
const contractRules = [
  (v: string) => !!v || 'يجب اختيار نوع العقد'
]

const brandRules = [
  (v: string) => !!v || 'يجب اختيار البراند'
]

const experienceRules = [
  (v: string) => !!v || 'يجب كتابة معلومات عن خبرتك',
  (v: string) => (v && v.length >= 50) || 'يجب كتابة 50 حرف على الأقل'
]

const reasonRules = [
  (v: string) => !!v || 'يجب شرح سبب الطلب',
  (v: string) => (v && v.length >= 100) || 'يجب كتابة 100 حرف على الأقل'
]

const experienceMarketingRules = [
  (v: number) => v >= 1 || 'يجب أن تكون لديك خبرة سنة واحدة على الأقل'
]

// === Methods ===
const selectRole = (role: string) => {
  selectedRole.value = role
}

const proceedToDetails = () => {
  switch (selectedRole.value) {
    case 'photographer':
      currentStep.value = 'photographer-details'
      break
    case 'brand_coordinator':
      currentStep.value = 'brand-coordinator-details'
      break
    case 'marketing_coordinator':
      currentStep.value = 'marketing-coordinator-details'
      break
  }
}

const goBack = () => {
  currentStep.value = 'role-selection'
  selectedRole.value = ''
}

const goToLogin = () => {
  router.push('/auth/login')
}

// === تحميل البراندات ===
const loadBrands = async () => {
  try {
    const brandsSnapshot = await getDocs(collection(db, 'brands'))
    availableBrands.value = brandsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('خطأ في تحميل البراندات:', error)
  }
}

const handleSubmitPhotographer = async () => {
  try {
    isLoading.value = true
    clearError()
    
    console.log('📸 إرسال بيانات المصور...')
    
    if (!userProfile.value?.uid) {
      throw new Error('معرف المستخدم غير متوفر')
    }
    
    await updateUserRole(userProfile.value.uid, 'photographer', {
      photographer_contract_type: photographerData.value.contractType,
      photographer_specializations: photographerData.value.specializations,
      photographer_availability: photographerData.value.availability,
      photographer_notes: photographerData.value.notes
    })
    
    console.log('✅ تم حفظ بيانات المصور بنجاح')
    
    // 🔄 تحديث: توجيه جميع الأدوار لصفحة انتظار الموافقة
    router.push('/auth/pending-approval')
    
  } catch (err: any) {
    console.error('❌ خطأ في حفظ بيانات المصور:', err)
    // الخطأ سيظهر من خلال error ref
  } finally {
    isLoading.value = false
  }
}

const handleSubmitBrandCoordinator = async () => {
  try {
    isLoading.value = true
    clearError()
    
    console.log('🏢 إرسال بيانات منسق البراند...')
    
    if (!userProfile.value?.uid) {
      throw new Error('معرف المستخدم غير متوفر')
    }
    
    await updateUserRole(userProfile.value.uid, 'brand_coordinator', {
      requested_brand_id: brandCoordinatorData.value.selectedBrand,
      brand_experience: brandCoordinatorData.value.experience,
      previous_experience_years: brandCoordinatorData.value.previousExperience
    })
    
    console.log('✅ تم حفظ بيانات منسق البراند بنجاح')
    router.push('/auth/pending-approval')
    
  } catch (err: any) {
    console.error('❌ خطأ في حفظ بيانات منسق البراند:', err)
  } finally {
    isLoading.value = false
  }
}

const handleSubmitMarketingCoordinator = async () => {
  try {
    isLoading.value = true
    clearError()
    
    console.log('📈 إرسال بيانات منسق التسويق...')
    
    if (!userProfile.value?.uid) {
      throw new Error('معرف المستخدم غير متوفر')
    }
    
    await updateUserRole(userProfile.value.uid, 'marketing_coordinator', {
      marketing_reason: marketingData.value.reason,
      marketing_experience_years: marketingData.value.marketingExperience,
      marketing_specializations: marketingData.value.marketingSpecializations
    })
    
    console.log('✅ تم حفظ بيانات منسق التسويق بنجاح')
    router.push('/auth/pending-approval')
    
  } catch (err: any) {
    console.error('❌ خطأ في حفظ بيانات منسق التسويق:', err)
  } finally {
    isLoading.value = false
  }
}

// === Lifecycle ===
onMounted(() => {
  loadBrands()
})
</script>

<style scoped lang="scss">
@import '@/styles/design-system/index';

.role-setup-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-info-400) 0%, var(--color-info-600) 100%);
  
  .role-setup-container {
    padding: var(--spacing-6);
  }
  
  .role-setup-card {
    max-width: 500px;
    width: 100%;
    margin: 0 auto;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--elevation-high);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    
    .v-card__text {
      padding: var(--spacing-8);
    }
  }
  
  .role-setup-title {
    margin-bottom: var(--spacing-6);
    text-align: center;
    color: var(--color-text-primary);
  }
  
  .role-option {
    transition: all var(--transition-normal) var(--easing-ease-out);
    border: 2px solid var(--color-border-light);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-4);
    margin-bottom: var(--spacing-3);
    cursor: pointer;
    
    &:hover {
      border-color: var(--color-primary-500);
      transform: translateY(-2px);
      box-shadow: var(--elevation-medium);
    }
    
    &.selected {
      border-color: var(--color-primary-500);
      background-color: var(--color-primary-50);
    }
  }
  
  .role-title {
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: var(--spacing-1);
  }
  
  .role-description {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }
  
  .continue-button {
    margin-top: var(--spacing-6);
    height: 48px;
    font-weight: 600;
    text-transform: none;
  }
  
  .back-link {
    margin-top: var(--spacing-4);
    text-align: center;
    color: var(--color-text-secondary);
  }
  
  // Specific role styling
  .photographer-option {
    .role-icon {
      color: var(--color-primary-500);
    }
  }
  
  .coordinator-option {
    .role-icon {
      color: var(--color-info-500);
    }
  }
  
  .client-option {
    .role-icon {
      color: var(--color-success-500);
    }
  }
}

// Responsive design
@media (max-width: 600px) {
  .role-setup-page {
    .role-setup-container {
      padding: var(--spacing-4);
    }
    
    .role-setup-card {
      .v-card__text {
        padding: var(--spacing-6);
      }
    }
    
    .role-option {
      padding: var(--spacing-3);
    }
  }
}
</style> 