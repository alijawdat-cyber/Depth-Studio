<template>
  <v-dialog 
    v-model="isOpen" 
    max-width="800px" 
    scrollable 
    persistent
  >
    <v-card v-if="user" class="user-details-dialog">
      <!-- Header -->
      <v-card-title class="pa-6 bg-gradient-primary text-white">
        <div class="d-flex align-center">
          <v-avatar size="56" class="me-4">
            <img 
              v-if="user.profile_photo_url" 
              :src="user.profile_photo_url" 
              :alt="user.display_name || user.full_name"
            >
            <v-icon v-else size="32" color="white">mdi-account</v-icon>
          </v-avatar>
          
          <div class="flex-grow-1">
            <h2 class="text-h5 font-weight-bold mb-1">
              {{ user.display_name || user.full_name || 'مستخدم بدون اسم' }}
            </h2>
            <div class="d-flex align-center">
              <v-chip 
                :color="getRoleColor(user.primary_role)" 
                size="small" 
                class="me-2"
              >
                <v-icon start>{{ getRoleIcon(user.primary_role) }}</v-icon>
                {{ getRoleName(user.primary_role) }}
              </v-chip>
              
              <v-chip 
                :color="getStatusColor(user.status)" 
                size="small"
              >
                <v-icon start>{{ getStatusIcon(user.status) }}</v-icon>
                {{ getStatusName(user.status) }}
              </v-chip>
            </div>
          </div>
          
          <v-btn 
            icon="mdi-close" 
            variant="text" 
            color="white" 
            @click="closeDialog"
          />
        </div>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-6">
        <v-row>
          <!-- Basic Information -->
          <v-col cols="12" md="6">
            <div class="info-section">
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="me-2" color="primary">mdi-account-details</v-icon>
                المعلومات الأساسية
              </h3>
              
              <div class="info-grid">
                <div class="info-item">
                  <label>البريد الإلكتروني:</label>
                  <span>{{ user.email }}</span>
                </div>
                
                <div class="info-item" v-if="user.phone">
                  <label>رقم الهاتف:</label>
                  <span>{{ user.phone }}</span>
                </div>
                
                <div class="info-item" v-if="user.firebase_uid">
                  <label>معرف Firebase:</label>
                  <span class="font-mono">{{ user.firebase_uid }}</span>
                </div>
                
                <div class="info-item" v-if="user.auth_provider">
                  <label>مزود المصادقة:</label>
                  <span>{{ user.auth_provider }}</span>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Dates Information -->
          <v-col cols="12" md="6">
            <div class="info-section">
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="me-2" color="success">mdi-calendar</v-icon>
                التواريخ المهمة
              </h3>
              
              <div class="info-grid">
                <div class="info-item">
                  <label>تاريخ التسجيل:</label>
                  <span>{{ formatDate(user.created_at) }}</span>
                </div>
                
                <div class="info-item" v-if="user.approved_at">
                  <label>تاريخ الموافقة:</label>
                  <span>{{ formatDate(user.approved_at) }}</span>
                </div>
                
                <div class="info-item" v-if="user.suspended_at">
                  <label>تاريخ التعليق:</label>
                  <span>{{ formatDate(user.suspended_at) }}</span>
                </div>
                
                <div class="info-item" v-if="user.updated_at">
                  <label>آخر تحديث:</label>
                  <span>{{ formatDate(user.updated_at) }}</span>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Role-Specific Information -->
          <v-col cols="12" v-if="user.primary_role === 'photographer'">
            <div class="info-section">
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="me-2" color="primary">mdi-camera</v-icon>
                معلومات المصور
              </h3>
              
              <div class="info-grid">
                <div class="info-item" v-if="photographerContractType">
                  <label>نوع العقد:</label>
                  <span>{{ photographerContractType }}</span>
                </div>
                
                <div class="info-item" v-if="photographerSpecializations.length">
                  <label>التخصصات:</label>
                  <div class="d-flex flex-wrap ga-2 mt-1">
                    <v-chip 
                      v-for="spec in photographerSpecializations" 
                      :key="spec"
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    >
                      {{ getPhotographerSpecialization(spec) }}
                    </v-chip>
                  </div>
                </div>
                
                <div class="info-item" v-if="photographerAvailability.length">
                  <label>أوقات التوفر:</label>
                  <div class="d-flex flex-wrap ga-2 mt-1">
                    <v-chip 
                      v-for="time in photographerAvailability" 
                      :key="time"
                      size="small" 
                      color="success" 
                      variant="outlined"
                    >
                      {{ getAvailabilityTime(time) }}
                    </v-chip>
                  </div>
                </div>
                
                <div class="info-item" v-if="photographerNotes">
                  <label>ملاحظات:</label>
                  <p class="mt-1">{{ photographerNotes }}</p>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Brand Coordinator Information -->
          <v-col cols="12" v-if="user.primary_role === 'brand_coordinator'">
            <div class="info-section">
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="me-2" color="warning">mdi-domain</v-icon>
                معلومات منسق البراند
              </h3>
              
              <div class="info-grid">
                <div class="info-item" v-if="requestedBrandId">
                  <label>البراند المطلوب:</label>
                  <span>{{ getBrandName(requestedBrandId) }}</span>
                </div>
                
                <div class="info-item" v-if="brandExperience">
                  <label>وصف الخبرة:</label>
                  <p class="mt-1">{{ brandExperience }}</p>
                </div>
                
                <div class="info-item" v-if="previousExperienceYears">
                  <label>سنوات الخبرة السابقة:</label>
                  <span>{{ previousExperienceYears }} سنة</span>
                </div>
              </div>
            </div>
          </v-col>

          <!-- Marketing Coordinator Information -->
          <v-col cols="12" v-if="user.primary_role === 'marketing_coordinator'">
            <div class="info-section">
              <h3 class="text-h6 mb-4 d-flex align-center">
                <v-icon class="me-2" color="error">mdi-bullhorn</v-icon>
                معلومات منسق التسويق
              </h3>
              
              <div class="info-grid">
                <div class="info-item" v-if="marketingSpecializations.length">
                  <label>التخصصات:</label>
                  <div class="d-flex flex-wrap ga-2 mt-1">
                    <v-chip 
                      v-for="spec in marketingSpecializations" 
                      :key="spec"
                      size="small" 
                      color="error" 
                      variant="outlined"
                    >
                      {{ getSpecializationName(spec) }}
                    </v-chip>
                  </div>
                </div>
                
                <div class="info-item" v-if="previousExperienceYears">
                  <label>سنوات الخبرة:</label>
                  <span>{{ previousExperienceYears }} سنة</span>
                </div>
                
                <div class="info-item" v-if="marketingExperience">
                  <label>وصف الخبرة:</label>
                  <p class="mt-1">{{ marketingExperience }}</p>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 bg-grey-lighten-5">
        <v-spacer />
        
        <v-btn
          color="grey"
          variant="outlined"
          @click="closeDialog"
        >
          <v-icon start>mdi-close</v-icon>
          إغلاق
        </v-btn>
        
        <v-btn
          v-if="user.status === 'active'"
          color="warning"
          variant="elevated"
          @click="$emit('suspend-user', user)"
        >
          <v-icon start>mdi-pause</v-icon>
          تعليق الحساب
        </v-btn>
        
        <v-btn
          v-else-if="user.status === 'suspended'"
          color="success"
          variant="elevated"
          @click="$emit('activate-user', user)"
        >
          <v-icon start>mdi-play</v-icon>
          تفعيل الحساب
        </v-btn>
        
        <v-btn
          v-if="user.status === 'pending_approval'"
          color="success"
          variant="elevated"
          @click="$emit('approve-user', user)"
        >
          <v-icon start>mdi-check</v-icon>
          موافقة
        </v-btn>
        
        <v-btn
          v-if="user.status === 'pending_approval'"
          color="error"
          variant="elevated"
          @click="$emit('reject-user', user)"
        >
          <v-icon start>mdi-close</v-icon>
          رفض
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { 
  getRoleColor, 
  getRoleIcon, 
  getRoleName,
  getStatusColor,
  getStatusIcon,
  getStatusName,
  formatDate,
  getPhotographerSpecialization,
  getAvailabilityTime,
  getSpecializationName,
  getBrandName,
  type User
} from '@/utils/userHelpers'

// === Props ===
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object as PropType<User | null>,
    default: null
  }
})

// === Emits ===
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'approve-user': [user: User]
  'reject-user': [user: User]
  'suspend-user': [user: User]
  'activate-user': [user: User]
}>()

// === Computed ===
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Role-specific data
const photographerContractType = computed(() => {
  if (!props.user) return ''
  const contractType = (props.user as any).photographer_contract_type
  return contractType === 'freelancer' ? 'مستقل' : contractType === 'salary' ? 'راتب شهري' : contractType
})

const photographerSpecializations = computed(() => {
  if (!props.user) return []
  return (props.user as any).photographer_specializations || []
})

const photographerAvailability = computed(() => {
  if (!props.user) return []
  return (props.user as any).photographer_availability || []
})

const photographerNotes = computed(() => {
  if (!props.user) return ''
  return (props.user as any).photographer_notes || ''
})

const requestedBrandId = computed(() => {
  if (!props.user) return ''
  return (props.user as any).requested_brand_id || ''
})

const brandExperience = computed(() => {
  if (!props.user) return ''
  return (props.user as any).brand_experience || ''
})

const marketingSpecializations = computed(() => {
  if (!props.user) return []
  return (props.user as any).marketing_specializations || []
})

const marketingExperience = computed(() => {
  if (!props.user) return ''
  return (props.user as any).marketing_experience || ''
})

const previousExperienceYears = computed(() => {
  if (!props.user) return 0
  return (props.user as any).previous_experience_years || 0
})

// === Methods ===
const closeDialog = (): void => {
  isOpen.value = false
}
</script>

<style scoped lang="scss">
@import '@/styles/design-system/index';

.user-details-dialog {
  .user-header {
    background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-700) 100%);
    color: white;
    padding: var(--spacing-6);
    border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
    margin: calc(-1 * var(--spacing-4));
    margin-bottom: var(--spacing-6);
  }
  
  .user-avatar-large {
    width: 80px;
    height: 80px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    box-shadow: var(--elevation-medium);
  }
  
  .user-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: var(--spacing-1);
  }
  
  .user-email {
    font-size: 0.95rem;
    opacity: 0.9;
  }
  
  .info-section {
    margin-bottom: var(--spacing-6);
    
    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-3);
      border-bottom: 1px solid var(--color-border-light);
      padding-bottom: var(--spacing-2);
    }
  }
  
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-2) 0;
    border-bottom: 1px solid var(--color-border-light);
    
    &:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-weight: 500;
      color: var(--color-text-secondary);
      min-width: 120px;
    }
    
    .info-value {
      flex: 1;
      text-align: right;
      color: var(--color-text-primary);
      
      &.arabic-text {
        direction: rtl;
      }
    }
  }
  
  .status-indicator {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-1);
    
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      
      &.pending { background: var(--color-warning-500); }
      &.active { background: var(--color-success-500); }
      &.suspended { background: var(--color-error-500); }
      &.rejected { background: var(--color-text-disabled); }
    }
  }
  
  .profile-image-section {
    text-align: center;
    padding: var(--spacing-4);
    background: var(--color-background-secondary);
    border-radius: var(--border-radius-md);
    margin-bottom: var(--spacing-4);
    
    .profile-image {
      max-width: 200px;
      max-height: 200px;
      border-radius: var(--border-radius-md);
      box-shadow: var(--elevation-low);
    }
  }
  
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-2);
    margin-top: var(--spacing-6);
    padding-top: var(--spacing-4);
    border-top: 1px solid var(--color-border-light);
  }
}

// Responsive design
@media (max-width: 600px) {
  .user-details-dialog {
    .user-header {
      padding: var(--spacing-4);
    }
    
    .user-avatar-large {
      width: 60px;
      height: 60px;
    }
    
    .user-name {
      font-size: 1.25rem;
    }
    
    .info-row {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-1);
      
      .info-label {
        min-width: auto;
      }
      
      .info-value {
        text-align: right;
        width: 100%;
      }
    }
  }
}
</style> 