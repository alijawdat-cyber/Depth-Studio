<template>
  <div class="pending-users-tab">
    <!-- Header with bulk actions -->
    <div class="tab-header mb-6">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h5 font-weight-bold text-warning">
            <v-icon start size="28" color="warning">mdi-clock-alert</v-icon>
            طلبات التسجيل المعلقة
          </h2>
          <p class="text-body-1 text-medium-emphasis mt-1">
            مراجعة والموافقة على {{ pendingUsers.length }} طلب تسجيل جديد
          </p>
        </div>
        
        <!-- Quick Stats -->
        <div class="d-flex ga-3">
          <v-card variant="outlined" class="pa-3 text-center" min-width="100">
            <div class="text-h6 font-weight-bold text-warning">{{ pendingUsers.length }}</div>
            <div class="text-caption">طلب معلق</div>
          </v-card>
          <v-card variant="outlined" class="pa-3 text-center" min-width="100">
            <div class="text-h6 font-weight-bold text-primary">{{ selectedUsers.length }}</div>
            <div class="text-caption">محدد</div>
          </v-card>
        </div>
      </div>
    </div>

    <!-- Bulk Actions Bar -->
    <div v-if="pendingUsers.length > 0" class="bulk-actions-bar mb-6">
      <v-card variant="outlined" class="pa-4">
        <div class="d-flex align-center justify-space-between">
          <!-- Selection Controls -->
          <div class="d-flex align-center ga-4">
            <v-checkbox
              :model-value="allSelected"
              @update:model-value="toggleSelectAll"
              :indeterminate="someSelected && !allSelected"
              label="تحديد الكل"
              density="compact"
              hide-details
              :disabled="isProcessing"
            />
            
            <v-chip 
              v-if="selectedUsers.length > 0"
              color="primary" 
              variant="outlined"
              size="small"
            >
              {{ selectedUsers.length }} من {{ pendingUsers.length }} محدد
            </v-chip>
          </div>

          <!-- Bulk Action Buttons -->
          <div class="d-flex ga-2">
            <v-btn
              v-if="selectedUsers.length > 0"
              color="success"
              variant="elevated"
              :disabled="isProcessing"
              :loading="isProcessing"
              @click="handleBulkApprove"
            >
              <v-icon start>mdi-check-all</v-icon>
              موافقة المحدد ({{ selectedUsers.length }})
            </v-btn>
            
            <v-btn
              v-if="selectedUsers.length > 0"
              color="error"
              variant="outlined"
              :disabled="isProcessing"
              @click="handleBulkReject"
            >
              <v-icon start>mdi-close-circle</v-icon>
              رفض المحدد
            </v-btn>
            
            <v-btn
              color="grey"
              variant="text"
              @click="refreshData"
              :loading="isProcessing"
            >
              <v-icon start>mdi-refresh</v-icon>
              تحديث
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>

    <!-- Users Grid -->
    <div v-if="pendingUsers.length === 0" class="empty-state">
      <v-card variant="outlined" class="pa-8 text-center">
        <v-icon size="80" color="success" class="mb-4">mdi-check-all</v-icon>
        <h3 class="text-h5 mb-3 text-success">ممتاز! لا توجد طلبات معلقة</h3>
        <p class="text-body-1 text-medium-emphasis mb-4">
          جميع طلبات التسجيل تمت مراجعتها بنجاح.
        </p>
        <v-btn 
          color="primary" 
          variant="outlined"
          @click="refreshData"
          :loading="isProcessing"
        >
          <v-icon start>mdi-refresh</v-icon>
          التحقق من طلبات جديدة
        </v-btn>
      </v-card>
    </div>

    <div v-else class="users-grid">
      <v-row>
        <v-col 
          v-for="user in pendingUsers" 
          :key="user.id" 
          cols="12" 
          md="6" 
          lg="4"
        >
          <PendingUserCard
            :user="user"
            :is-selected="selectedUsers.includes(user.id)"
            :is-processing="processingUsers.includes(user.id)"
            @toggle-selection="toggleUserSelection(user.id)"
            @view-details="viewUserDetails(user)"
            @approve-user="approveUser(user)"
            @reject-user="rejectUser(user)"
          />
        </v-col>
      </v-row>
    </div>

    <!-- Dialogs -->
    <UserDetailsDialog
      v-model="detailsDialog"
      :user="selectedUserForDetails"
      @approve-user="approveUser"
      @reject-user="rejectUser"
    />

    <UserRejectDialog
      v-model="rejectDialog"
      :user="selectedUserForReject"
      :is-processing="isProcessing"
      @confirm-reject="confirmReject"
    />

    <!-- Bulk Reject Confirmation -->
    <v-dialog v-model="bulkRejectDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="pa-6 bg-error text-white">
          <v-icon start>mdi-alert-circle</v-icon>
          تأكيد الرفض الجماعي
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-alert type="warning" variant="tonal" class="mb-4">
            <div class="font-weight-bold">هل أنت متأكد من رفض {{ selectedUsers.length }} طلب؟</div>
            <div class="mt-2 text-body-2">هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع البيانات نهائياً.</div>
          </v-alert>
          
          <v-checkbox
            v-model="confirmBulkRejectState"
            label="أؤكد أنني أريد رفض جميع الطلبات المحددة"
            color="error"
            hide-details
          />
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn 
            color="grey" 
            variant="outlined"
            @click="bulkRejectDialog = false"
            :disabled="isProcessing"
          >
            إلغاء
          </v-btn>
          <v-btn 
            color="error" 
            variant="elevated"
            :disabled="!confirmBulkRejectState || isProcessing"
            :loading="isProcessing"
            @click="executeBulkReject"
          >
            رفض نهائياً
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserManagement } from '@/composables/useUserManagement'
import { type User } from '@/utils/userHelpers'
import PendingUserCard from '@/components/users/cards/PendingUserCard.vue'
import UserDetailsDialog from '@/components/users/dialogs/UserDetailsDialog.vue'
import UserRejectDialog from '@/components/users/dialogs/UserRejectDialog.vue'

// === Composables ===
const {
  pendingUsers,
  selectedUsers,
  isProcessing,
  processingUsers,
  loadAllUsers,
  approveUser: approveUserAction,
  approveBulk,
  rejectUser: rejectUserAction,
  rejectBulk
} = useUserManagement()

// === Reactive Data ===
const detailsDialog = ref(false)
const rejectDialog = ref(false)
const bulkRejectDialog = ref(false)
const confirmBulkRejectState = ref(false)
const selectedUserForDetails = ref<User | null>(null)
const selectedUserForReject = ref<User | null>(null)

// === Computed ===
const allSelected = computed(() => {
  return pendingUsers.value.length > 0 && selectedUsers.value.length === pendingUsers.value.length
})

const someSelected = computed(() => {
  return selectedUsers.value.length > 0 && selectedUsers.value.length < pendingUsers.value.length
})

// === Methods ===
const toggleSelectAll = (selected: boolean | null): void => {
  if (selected) {
    selectedUsers.value = pendingUsers.value.map(user => user.id)
  } else {
    selectedUsers.value = []
  }
}

const toggleUserSelection = (userId: string): void => {
  const index = selectedUsers.value.indexOf(userId)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(userId)
  }
}

const viewUserDetails = (user: User): void => {
  selectedUserForDetails.value = user
  detailsDialog.value = true
}

const approveUser = async (user: User): Promise<void> => {
  try {
    await approveUserAction(user)
    console.log(`✅ تم تفعيل ${user.display_name} بنجاح`)
  } catch (error: any) {
    console.error('❌ خطأ في الموافقة:', error.message)
    // يمكن إضافة Toast notification هنا
  }
}

const rejectUser = (user: User): void => {
  selectedUserForReject.value = user
  rejectDialog.value = true
}

const confirmReject = async (user: User, reason: string): Promise<void> => {
  try {
    await rejectUserAction(user, reason)
    rejectDialog.value = false
    selectedUserForReject.value = null
    console.log(`❌ تم رفض طلب ${user.display_name}`)
  } catch (error: any) {
    console.error('❌ خطأ في الرفض:', error.message)
  }
}

const handleBulkApprove = async (): Promise<void> => {
  if (selectedUsers.value.length === 0) return
  
  try {
    await approveBulk()
    console.log(`🎉 تم تفعيل ${selectedUsers.value.length} مستخدم بنجاح`)
  } catch (error: any) {
    console.error('❌ خطأ في الموافقة الجماعية:', error.message)
  }
}

const handleBulkReject = (): void => {
  if (selectedUsers.value.length === 0) return
  
  confirmBulkRejectState.value = false
  bulkRejectDialog.value = true
}

const executeBulkReject = async (): Promise<void> => {
  try {
    await rejectBulk()
    bulkRejectDialog.value = false
    confirmBulkRejectState.value = false
    console.log(`❌ تم رفض ${selectedUsers.value.length} طلب`)
  } catch (error: any) {
    console.error('❌ خطأ في الرفض الجماعي:', error.message)
  }
}

const refreshData = async (): Promise<void> => {
  try {
    await loadAllUsers()
    console.log('🔄 تم تحديث البيانات')
  } catch (error: any) {
    console.error('❌ خطأ في تحديث البيانات:', error.message)
  }
}
</script>

<style scoped>
.pending-users-tab {
  width: 100%;
}

.tab-header {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.bulk-actions-bar {
  position: sticky;
  top: 0;
  z-index: 5;
  backdrop-filter: blur(10px);
}

.empty-state {
  margin-top: 40px;
}

.users-grid {
  margin-top: 16px;
}

/* Animations */
.pending-users-tab .v-col {
  transition: all 0.3s ease;
}

.pending-users-tab .v-col:hover {
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 960px) {
  .tab-header {
    padding: 16px;
  }
  
  .tab-header .d-flex {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 16px;
  }
  
  .bulk-actions-bar .d-flex {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 600px) {
  .users-grid .v-col {
    padding: 6px;
  }
}
</style> 