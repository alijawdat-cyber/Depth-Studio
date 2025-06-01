<template>
  <v-card
    class="pending-user-card"
    :class="{ 'selected': isSelected, 'processing': isProcessing }"
    elevation="2"
    rounded="lg"
  >
    <!-- Selection Overlay -->
    <div v-if="isSelected" class="selection-overlay">
      <v-icon color="white" size="24">mdi-check-circle</v-icon>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isProcessing" class="processing-overlay">
      <v-progress-circular
        color="primary"
        indeterminate
        size="32"
      />
    </div>

    <!-- Card Header -->
    <v-card-title class="pa-4 d-flex align-center">
      <!-- Selection Checkbox -->
      <v-checkbox
        :model-value="isSelected"
        @update:model-value="$emit('toggle-selection')"
        density="compact"
        hide-details
        class="me-3"
        :disabled="isProcessing"
      />

      <!-- User Avatar -->
      <v-avatar size="48" class="me-3">
        <img 
          v-if="user.profile_photo_url" 
          :src="user.profile_photo_url" 
          :alt="displayName"
        >
        <v-icon v-else size="24" color="grey">mdi-account</v-icon>
      </v-avatar>

      <!-- User Basic Info -->
      <div class="flex-grow-1">
        <h3 class="text-subtitle-1 font-weight-bold mb-1">
          {{ displayName }}
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ user.email }}
        </p>
      </div>

      <!-- Role Chip -->
      <v-chip
        :color="getRoleColor(user.primary_role)"
        size="small"
        class="ms-2"
      >
        <v-icon start size="16">{{ getRoleIcon(user.primary_role) }}</v-icon>
        {{ getRoleName(user.primary_role) }}
      </v-chip>
    </v-card-title>

    <!-- Card Content -->
    <v-card-text class="pa-4 pt-0">
      <!-- Basic Details -->
      <div class="basic-details mb-3">
        <div v-if="user.phone" class="detail-row">
          <v-icon size="16" class="me-2 text-medium-emphasis">mdi-phone</v-icon>
          <span class="text-body-2">{{ user.phone }}</span>
        </div>
        
        <div class="detail-row">
          <v-icon size="16" class="me-2 text-medium-emphasis">mdi-calendar</v-icon>
          <span class="text-body-2">{{ getTimeDifference(user.created_at) }}</span>
        </div>
      </div>

      <!-- Role-Specific Information -->
      <div v-if="user.primary_role === 'photographer'" class="role-specific-info">
        <div class="info-section">
          <h4 class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center">
            <v-icon size="16" class="me-1" color="primary">mdi-camera</v-icon>
            معلومات المصور
          </h4>
          
          <!-- Contract Type -->
          <div v-if="photographerContractType" class="mb-2">
            <span class="text-body-2 font-weight-medium">نوع العقد:</span>
            <v-chip size="x-small" color="info" class="ms-2">
              {{ photographerContractType }}
            </v-chip>
          </div>

          <!-- Specializations -->
          <div v-if="photographerSpecializations.length" class="mb-2">
            <span class="text-body-2 font-weight-medium">التخصصات:</span>
            <div class="d-flex flex-wrap ga-1 mt-1">
              <v-chip
                v-for="spec in photographerSpecializations.slice(0, 3)"
                :key="spec"
                size="x-small"
                color="primary"
                variant="outlined"
              >
                {{ getPhotographerSpecialization(spec) }}
              </v-chip>
              <v-chip
                v-if="photographerSpecializations.length > 3"
                size="x-small"
                color="grey"
                variant="outlined"
              >
                +{{ photographerSpecializations.length - 3 }}
              </v-chip>
            </div>
          </div>

          <!-- Availability -->
          <div v-if="photographerAvailability.length" class="mb-2">
            <span class="text-body-2 font-weight-medium">أوقات التوفر:</span>
            <div class="d-flex flex-wrap ga-1 mt-1">
              <v-chip
                v-for="time in photographerAvailability.slice(0, 2)"
                :key="time"
                size="x-small"
                color="success"
                variant="outlined"
              >
                {{ getAvailabilityTime(time) }}
              </v-chip>
              <v-chip
                v-if="photographerAvailability.length > 2"
                size="x-small"
                color="grey"
                variant="outlined"
              >
                +{{ photographerAvailability.length - 2 }}
              </v-chip>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="photographerNotes" class="notes-section">
            <span class="text-body-2 font-weight-medium">ملاحظات:</span>
            <p class="text-caption text-medium-emphasis mt-1 mb-0">
              {{ truncatedNotes }}
              <v-btn
                v-if="photographerNotes.length > 100"
                variant="text"
                size="x-small"
                class="ms-1"
                @click="showFullNotes = !showFullNotes"
              >
                {{ showFullNotes ? 'أقل' : 'المزيد' }}
              </v-btn>
            </p>
          </div>
        </div>
      </div>

      <!-- Brand Coordinator Info -->
      <div v-else-if="user.primary_role === 'brand_coordinator'" class="role-specific-info">
        <div class="info-section">
          <h4 class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center">
            <v-icon size="16" class="me-1" color="warning">mdi-domain</v-icon>
            معلومات منسق البراند
          </h4>
          
          <div v-if="requestedBrandId" class="mb-2">
            <span class="text-body-2 font-weight-medium">البراند المطلوب:</span>
            <v-chip size="x-small" color="warning" class="ms-2">
              {{ getBrandName(requestedBrandId) }}
            </v-chip>
          </div>

          <div v-if="brandExperience" class="mb-2">
            <span class="text-body-2 font-weight-medium">الخبرة:</span>
            <p class="text-caption text-medium-emphasis mt-1 mb-0">
              {{ brandExperience.substring(0, 100) }}{{ brandExperience.length > 100 ? '...' : '' }}
            </p>
          </div>

          <div v-if="previousExperienceYears" class="mb-2">
            <span class="text-body-2 font-weight-medium">سنوات الخبرة:</span>
            <v-chip size="x-small" color="info" class="ms-2">
              {{ previousExperienceYears }} سنة
            </v-chip>
          </div>
        </div>
      </div>

      <!-- Marketing Coordinator Info -->
      <div v-else-if="user.primary_role === 'marketing_coordinator'" class="role-specific-info">
        <div class="info-section">
          <h4 class="text-subtitle-2 font-weight-bold mb-2 d-flex align-center">
            <v-icon size="16" class="me-1" color="error">mdi-bullhorn</v-icon>
            معلومات منسق التسويق
          </h4>
          
          <div v-if="marketingSpecializations.length" class="mb-2">
            <span class="text-body-2 font-weight-medium">التخصصات:</span>
            <div class="d-flex flex-wrap ga-1 mt-1">
              <v-chip
                v-for="spec in marketingSpecializations.slice(0, 3)"
                :key="spec"
                size="x-small"
                color="error"
                variant="outlined"
              >
                {{ getSpecializationName(spec) }}
              </v-chip>
              <v-chip
                v-if="marketingSpecializations.length > 3"
                size="x-small"
                color="grey"
                variant="outlined"
              >
                +{{ marketingSpecializations.length - 3 }}
              </v-chip>
            </div>
          </div>

          <div v-if="previousExperienceYears" class="mb-2">
            <span class="text-body-2 font-weight-medium">سنوات الخبرة:</span>
            <v-chip size="x-small" color="info" class="ms-2">
              {{ previousExperienceYears }} سنة
            </v-chip>
          </div>
        </div>
      </div>
    </v-card-text>

    <!-- Card Actions -->
    <v-card-actions class="pa-4 pt-0">
      <v-spacer />
      
      <v-btn
        color="grey"
        variant="outlined"
        size="small"
        @click="$emit('view-details')"
        :disabled="isProcessing"
      >
        <v-icon start size="16">mdi-eye</v-icon>
        التفاصيل
      </v-btn>

      <v-btn
        color="error"
        variant="outlined"
        size="small"
        @click="$emit('reject-user')"
        :disabled="isProcessing"
        class="ms-2"
      >
        <v-icon start size="16">mdi-close</v-icon>
        رفض
      </v-btn>

      <v-btn
        color="success"
        variant="elevated"
        size="small"
        @click="$emit('approve-user')"
        :disabled="isProcessing"
        :loading="isProcessing"
        class="ms-2"
      >
        <v-icon start size="16">mdi-check</v-icon>
        {{ isProcessing ? 'جارٍ...' : 'موافقة' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import {
  getRoleColor,
  getRoleIcon,
  getRoleName,
  getTimeDifference,
  getPhotographerSpecialization,
  getAvailabilityTime,
  getSpecializationName,
  getBrandName,
  type User
} from '@/utils/userHelpers'

// === Props ===
const props = defineProps({
  user: {
    type: Object as PropType<User>,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

// === Emits ===
defineEmits<{
  'toggle-selection': []
  'view-details': []
  'approve-user': []
  'reject-user': []
}>()

// === Reactive Data ===
const showFullNotes = ref(false)

// === Computed ===
const displayName = computed(() => {
  return props.user.display_name || props.user.full_name || 'مستخدم بدون اسم'
})

// Role-specific computed
const photographerContractType = computed(() => {
  const contractType = (props.user as any).photographer_contract_type
  return contractType === 'freelancer' ? 'مستقل' : contractType === 'salary' ? 'راتب شهري' : contractType
})

const photographerSpecializations = computed(() => {
  return (props.user as any).photographer_specializations || []
})

const photographerAvailability = computed(() => {
  return (props.user as any).photographer_availability || []
})

const photographerNotes = computed(() => {
  return (props.user as any).photographer_notes || ''
})

const truncatedNotes = computed(() => {
  if (!photographerNotes.value) return ''
  if (showFullNotes.value || photographerNotes.value.length <= 100) {
    return photographerNotes.value
  }
  return photographerNotes.value.substring(0, 100) + '...'
})

const requestedBrandId = computed(() => {
  return (props.user as any).requested_brand_id || ''
})

const brandExperience = computed(() => {
  return (props.user as any).brand_experience || ''
})

const marketingSpecializations = computed(() => {
  return (props.user as any).marketing_specializations || []
})

const previousExperienceYears = computed(() => {
  return (props.user as any).previous_experience_years || 0
})
</script>

<style scoped>
.pending-user-card {
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.pending-user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12) !important;
}

.pending-user-card.selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.pending-user-card.processing {
  pointer-events: none;
  opacity: 0.8;
}

.selection-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  background: rgb(var(--v-theme-primary));
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  border-radius: inherit;
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.info-section {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.role-specific-info {
  margin-top: 8px;
}

.notes-section {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.12);
}

/* Animation for better UX */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.pending-user-card.processing .v-card-title,
.pending-user-card.processing .v-card-text {
  animation: pulse 2s infinite;
}

@media (max-width: 600px) {
  .pending-user-card {
    margin-bottom: 12px;
  }
  
  .info-section {
    padding: 8px;
  }
  
  .selection-overlay {
    width: 28px;
    height: 28px;
  }
}
</style> 