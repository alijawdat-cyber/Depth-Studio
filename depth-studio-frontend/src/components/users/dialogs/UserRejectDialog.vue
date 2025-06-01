<template>
  <v-dialog 
    v-model="isOpen" 
    max-width="500px" 
    persistent
  >
    <v-card class="reject-dialog">
      <!-- Header -->
      <v-card-title class="pa-6 bg-error text-white">
        <div class="d-flex align-center">
          <v-icon class="me-3" size="28">mdi-alert-circle</v-icon>
          <div class="flex-grow-1">
            <h2 class="text-h5 font-weight-bold">تأكيد رفض الطلب</h2>
            <p class="text-body-2 mb-0 mt-1 text-red-lighten-4">
              هذا الإجراء لا يمكن التراجع عنه
            </p>
          </div>
        </div>
      </v-card-title>

      <!-- Content -->
      <v-card-text class="pa-6">
        <!-- User Info -->
        <div v-if="user" class="user-info-section mb-4">
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            <template #prepend>
              <v-icon>mdi-account-alert</v-icon>
            </template>
            <div>
              <div class="font-weight-bold">المستخدم المراد رفضه:</div>
              <div class="mt-1">
                <strong>الاسم:</strong> {{ user.display_name || user.full_name || 'غير محدد' }}
              </div>
              <div>
                <strong>البريد:</strong> {{ user.email }}
              </div>
              <div>
                <strong>الدور:</strong> {{ getRoleName(user.primary_role) }}
              </div>
            </div>
          </v-alert>
        </div>

        <!-- Reason Input -->
        <div class="reason-section">
          <v-textarea
            v-model="rejectReason"
            label="سبب الرفض (اختياري)"
            placeholder="يمكنك إضافة سبب الرفض هنا..."
            rows="3"
            variant="outlined"
            counter="500"
            maxlength="500"
            class="mb-4"
          />

          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <template #prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            عند الرفض، سيتم حذف المستخدم نهائياً من قاعدة البيانات ولن يتمكن من إعادة التسجيل بنفس البريد الإلكتروني.
          </v-alert>
        </div>

        <!-- Confirmation -->
        <div class="confirmation-section">
          <v-checkbox
            v-model="confirmReject"
            color="error"
            class="mt-2"
          >
            <template #label>
              <span class="text-body-2">
                أؤكد أنني أريد رفض هذا الطلب وحذف المستخدم نهائياً
              </span>
            </template>
          </v-checkbox>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-6 bg-grey-lighten-5">
        <v-spacer />
        
        <v-btn
          color="grey"
          variant="outlined"
          @click="closeDialog"
          :disabled="isProcessing"
        >
          <v-icon start>mdi-close</v-icon>
          إلغاء
        </v-btn>
        
        <v-btn
          color="error"
          variant="elevated"
          :disabled="!confirmReject || isProcessing"
          :loading="isProcessing"
          @click="confirmRejection"
        >
          <v-icon start>mdi-delete</v-icon>
          {{ isProcessing ? 'جارٍ الرفض...' : 'رفض نهائياً' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue'
import { getRoleName, type User } from '@/utils/userHelpers'

// === Props ===
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object as PropType<User | null>,
    default: null
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

// === Emits ===
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm-reject': [user: User, reason: string]
}>()

// === Reactive Data ===
const rejectReason = ref('')
const confirmReject = ref(false)

// === Computed ===
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// === Watchers ===
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // Reset form when dialog opens
    rejectReason.value = ''
    confirmReject.value = false
  }
})

// === Methods ===
const closeDialog = (): void => {
  if (!props.isProcessing) {
    isOpen.value = false
  }
}

const confirmRejection = (): void => {
  if (!props.user || !confirmReject.value || props.isProcessing) return
  
  emit('confirm-reject', props.user, rejectReason.value.trim())
}
</script>

<style scoped lang="scss">

.user-reject-dialog {
  .reject-header {
    text-align: center;
    margin-bottom: var(--spacing-6);
    
    .reject-icon {
      background: var(--color-error-100);
      border-radius: 50%;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--spacing-4);
    }
    
    .reject-title {
      color: var(--color-text-primary);
      font-weight: 600;
      margin-bottom: var(--spacing-2);
    }
    
    .reject-subtitle {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }
  }
  
  .reject-reason-field {
    margin-bottom: var(--spacing-6);
    
    .v-textarea {
      border: 1px solid var(--color-border-medium);
      border-radius: var(--border-radius-md);
      
      &:focus-within {
        border-color: var(--color-error-500);
      }
    }
  }
  
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-2);
    padding-top: var(--spacing-4);
    border-top: 1px solid var(--color-border-light);
    margin-top: var(--spacing-4);
    
    .cancel-button {
      color: var(--color-text-secondary) !important;
    }
    
    .reject-button {
      background-color: var(--color-error-500) !important;
      color: white !important;
      
      &:hover {
        background-color: var(--color-error-600) !important;
      }
      
      &:disabled {
        background-color: var(--color-text-disabled) !important;
        color: var(--color-text-inverse) !important;
      }
    }
  }
}

// Responsive design
@media (max-width: 600px) {
  .user-reject-dialog {
    .reject-header {
      .reject-icon {
        width: 60px;
        height: 60px;
      }
    }
    
    .dialog-actions {
      flex-direction: column-reverse;
      gap: var(--spacing-2);
      
      .v-btn {
        width: 100%;
      }
    }
  }
}
</style> 