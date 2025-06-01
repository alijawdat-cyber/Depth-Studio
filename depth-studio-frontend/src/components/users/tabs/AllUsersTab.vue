<template>
  <div class="all-users-tab">
    <!-- Header with Stats -->
    <div class="tab-header mb-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h2 class="text-h5 font-weight-bold text-primary">
            <v-icon start size="28" color="primary">mdi-account-multiple</v-icon>
            جميع المستخدمين
          </h2>
          <p class="text-body-1 text-medium-emphasis mt-1">
            عرض شامل وإدارة متقدمة لجميع مستخدمي النظام ({{ stats.total }} مستخدم)
          </p>
        </div>
        
        <v-btn 
          color="primary"
          variant="elevated"
          @click="refreshData"
          :loading="isProcessing"
        >
          <v-icon start>mdi-refresh</v-icon>
          تحديث البيانات
        </v-btn>
      </div>

      <!-- Detailed Stats Cards -->
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="pa-3 text-center stats-card">
            <v-icon size="32" color="success" class="mb-2">mdi-check-circle</v-icon>
            <div class="text-h5 font-weight-bold text-success">{{ stats.active }}</div>
            <div class="text-caption">مستخدم نشط</div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="pa-3 text-center stats-card">
            <v-icon size="32" color="warning" class="mb-2">mdi-clock-alert</v-icon>
            <div class="text-h5 font-weight-bold text-warning">{{ stats.pending }}</div>
            <div class="text-caption">في انتظار الموافقة</div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="pa-3 text-center stats-card">
            <v-icon size="32" color="primary" class="mb-2">mdi-camera</v-icon>
            <div class="text-h5 font-weight-bold text-primary">{{ photographersCount }}</div>
            <div class="text-caption">مصور</div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="pa-3 text-center stats-card">
            <v-icon size="32" color="info" class="mb-2">mdi-account-tie</v-icon>
            <div class="text-h5 font-weight-bold text-info">{{ coordinatorsCount }}</div>
            <div class="text-caption">منسق</div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Advanced Filters -->
    <div class="filters-section mb-6">
      <v-card variant="outlined" class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="البحث الشامل"
              placeholder="البحث بالاسم أو البريد أو الهاتف..."
              variant="outlined"
              density="compact"
              clearable
              prepend-inner-icon="mdi-magnify"
              hide-details
            />
          </v-col>
          
          <v-col cols="12" md="2">
            <v-select
              v-model="statusFilter"
              :items="statusFilterOptions"
              label="الحالة"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          
          <v-col cols="12" md="2">
            <v-select
              v-model="roleFilter"
              :items="roleFilterOptions"
              label="الدور"
              variant="outlined"
              density="compact"
              clearable
              hide-details
            />
          </v-col>
          
          <v-col cols="12" md="2">
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="ترتيب حسب"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          
          <v-col cols="12" md="2">
            <v-btn
              color="grey"
              variant="outlined"
              block
              @click="clearAllFilters"
            >
              <v-icon start>mdi-filter-off</v-icon>
              مسح الفلاتر
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="active-filters mb-4">
      <div class="d-flex align-center flex-wrap ga-2">
        <span class="text-body-2 font-weight-medium me-2">المرشحات النشطة:</span>
        
        <v-chip
          v-if="searchQuery"
          size="small"
          closable
          @click:close="searchQuery = ''"
        >
          البحث: {{ searchQuery }}
        </v-chip>
        
        <v-chip
          v-if="statusFilter"
          size="small"
          closable
          @click:close="statusFilter = ''"
        >
          الحالة: {{ getStatusFilterName(statusFilter) }}
        </v-chip>
        
        <v-chip
          v-if="roleFilter"
          size="small"
          closable
          @click:close="roleFilter = ''"
        >
          الدور: {{ getRoleFilterName(roleFilter) }}
        </v-chip>
        
        <v-chip
          v-if="sortBy"
          size="small"
          closable
          @click:close="sortBy = ''"
        >
          ترتيب: {{ getSortName(sortBy) }}
        </v-chip>
      </div>
    </div>

    <!-- Results Summary -->
    <div class="results-summary mb-4">
      <v-alert type="info" variant="tonal" density="compact">
        <v-icon start>mdi-information</v-icon>
        <span class="font-weight-medium">
          عرض {{ filteredAndSortedUsers.length }} من أصل {{ allUsers.length }} مستخدم
        </span>
        <span v-if="hasActiveFilters" class="ms-2">
          (مع الفلاتر المطبقة)
        </span>
      </v-alert>
    </div>

    <!-- Users Data Table -->
    <div class="table-section">
      <UsersDataTable
        :users="filteredAndSortedUsers"
        :headers="allUsersHeaders as unknown as any[]"
        :selected-users="selectedAllUsers"
        :is-loading="isProcessing"
        :is-processing="isProcessing"
        :show-controls="false"
        :show-filters="false"
        :show-selection="true"
        :show-bulk-actions="true"
        :allow-bulk-suspend="true"
        :allow-bulk-activate="true"
        :allow-edit="true"
        :items-per-page="20"
        no-data-message="لا يوجد مستخدمين مطابقين للمرشحات"
        no-data-sub-message="جرب تغيير المرشحات أو مسحها للعرض الشامل"
        @update:selected-users="selectedAllUsers = $event"
        @view-user="viewUserDetails"
        @edit-user="editUser"
        @approve-user="approveUser"
        @reject-user="rejectUser"
        @suspend-user="suspendUser"
        @activate-user="activateUser"
        @bulk-suspend="handleBulkSuspend"
        @bulk-activate="handleBulkActivate"
      />
    </div>

    <!-- Dialogs -->
    <UserDetailsDialog
      v-model="detailsDialog"
      :user="selectedUserForDetails"
      @approve-user="approveUser"
      @reject-user="rejectUser"
      @suspend-user="suspendUser"
      @activate-user="activateUser"
    />

    <UserRejectDialog
      v-model="rejectDialog"
      :user="selectedUserForReject"
      :is-processing="isProcessing"
      @confirm-reject="confirmReject"
    />

    <!-- Bulk Actions Confirmation -->
    <v-dialog v-model="bulkActionDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title :class="[
          'pa-6', 
          'text-white',
          bulkActionType === 'suspend' ? 'bg-warning' : 'bg-success'
        ]">
          <v-icon start>{{ bulkActionType === 'suspend' ? 'mdi-pause-circle' : 'mdi-play-circle' }}</v-icon>
          {{ bulkActionType === 'suspend' ? 'تأكيد التعليق الجماعي' : 'تأكيد التفعيل الجماعي' }}
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-alert 
            :type="bulkActionType === 'suspend' ? 'warning' : 'success'" 
            variant="tonal" 
            class="mb-4"
          >
            <div class="font-weight-bold">
              هل أنت متأكد من {{ bulkActionType === 'suspend' ? 'تعليق' : 'تفعيل' }} {{ selectedAllUsers.length }} مستخدم؟
            </div>
            <div class="mt-2 text-body-2">
              {{ bulkActionType === 'suspend' 
                  ? 'سيفقد المستخدمون المحددون الوصول للنظام حتى يتم تفعيلهم مرة أخرى.' 
                  : 'سيتمكن المستخدمون المحددون من الوصول للنظام مرة أخرى.' 
              }}
            </div>
          </v-alert>
          
          <v-textarea
            v-if="bulkActionType === 'suspend'"
            v-model="bulkActionReason"
            label="سبب التعليق الجماعي (اختياري)"
            placeholder="يمكنك إضافة سبب التعليق هنا..."
            rows="3"
            variant="outlined"
            counter="500"
            maxlength="500"
          />
          
          <v-checkbox
            v-model="confirmBulkActionState"
            :label="`أؤكد أنني أريد ${bulkActionType === 'suspend' ? 'تعليق' : 'تفعيل'} جميع المستخدمين المحددين`"
            :color="bulkActionType === 'suspend' ? 'warning' : 'success'"
            hide-details
          />
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn 
            color="grey" 
            variant="outlined"
            @click="bulkActionDialog = false"
            :disabled="isProcessing"
          >
            إلغاء
          </v-btn>
          <v-btn 
            :color="bulkActionType === 'suspend' ? 'warning' : 'success'" 
            variant="elevated"
            :disabled="!confirmBulkActionState || isProcessing"
            :loading="isProcessing"
            @click="executeBulkAction"
          >
            {{ bulkActionType === 'suspend' ? 'تعليق الحسابات' : 'تفعيل الحسابات' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserManagement } from '@/composables/useUserManagement'
import { 
  type User, 
  allUsersHeaders, 
  statusFilterOptions,
  roleFilterOptions,
  getRoleName,
  getStatusName
} from '@/utils/userHelpers'
import UsersDataTable from '@/components/users/tables/UsersDataTable.vue'
import UserDetailsDialog from '@/components/users/dialogs/UserDetailsDialog.vue'
import UserRejectDialog from '@/components/users/dialogs/UserRejectDialog.vue'

// === Composables ===
const {
  allUsers,
  selectedAllUsers,
  stats,
  photographersCount,
  coordinatorsCount,
  isProcessing,
  loadAllUsers,
  approveUser: approveUserAction,
  rejectUser: rejectUserAction,
  suspendUser: suspendUserAction,
  toggleUserStatus,
  bulkSuspendUsers,
  bulkActivateUsers
} = useUserManagement()

// === Reactive Data ===
const searchQuery = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const sortBy = ref('')
const detailsDialog = ref(false)
const rejectDialog = ref(false)
const bulkActionDialog = ref(false)
const bulkActionType = ref<'suspend' | 'activate'>('suspend')
const bulkActionReason = ref('')
const confirmBulkActionState = ref(false)
const selectedUserForDetails = ref<User | null>(null)
const selectedUserForReject = ref<User | null>(null)

// === Sort Options ===
const sortOptions = [
  { title: 'تاريخ التسجيل (الأحدث)', value: 'created_at_desc' },
  { title: 'تاريخ التسجيل (الأقدم)', value: 'created_at_asc' },
  { title: 'الاسم (أ-ي)', value: 'name_asc' },
  { title: 'الاسم (ي-أ)', value: 'name_desc' },
  { title: 'الدور', value: 'role' },
  { title: 'الحالة', value: 'status' }
]

// === Computed ===
const hasActiveFilters = computed(() => {
  return !!(searchQuery.value || statusFilter.value || roleFilter.value || sortBy.value)
})

const filteredAndSortedUsers = computed(() => {
  let filtered = [...allUsers.value]
  
  // Search filter
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      (user.display_name?.toLowerCase() || '').includes(search) ||
      (user.full_name?.toLowerCase() || '').includes(search) ||
      user.email.toLowerCase().includes(search) ||
      (user.phone?.includes(search) || false)
    )
  }
  
  // Status filter
  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }
  
  // Role filter
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.primary_role === roleFilter.value)
  }
  
  // Sorting
  if (sortBy.value) {
    filtered.sort((a, b) => {
      switch (sortBy.value) {
        case 'created_at_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'created_at_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name_asc':
          const nameA = (a.display_name || a.full_name || '').toLowerCase()
          const nameB = (b.display_name || b.full_name || '').toLowerCase()
          return nameA.localeCompare(nameB, 'ar')
        case 'name_desc':
          const nameA2 = (a.display_name || a.full_name || '').toLowerCase()
          const nameB2 = (b.display_name || b.full_name || '').toLowerCase()
          return nameB2.localeCompare(nameA2, 'ar')
        case 'role':
          return a.primary_role.localeCompare(b.primary_role)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })
  }
  
  return filtered
})

// === Methods ===
const clearAllFilters = (): void => {
  searchQuery.value = ''
  statusFilter.value = ''
  roleFilter.value = ''
  sortBy.value = ''
}

const getStatusFilterName = (status: string): string => {
  const option = statusFilterOptions.find(opt => opt.value === status)
  return option?.title || status
}

const getRoleFilterName = (role: string): string => {
  const option = roleFilterOptions.find(opt => opt.value === role)
  return option?.title || role
}

const getSortName = (sort: string): string => {
  const option = sortOptions.find(opt => opt.value === sort)
  return option?.title || sort
}

const viewUserDetails = (user: User): void => {
  selectedUserForDetails.value = user
  detailsDialog.value = true
}

const editUser = (user: User): void => {
  // TODO: Implement edit functionality
  console.log('🔧 تعديل المستخدم:', user.display_name)
}

const approveUser = async (user: User): Promise<void> => {
  try {
    await approveUserAction(user)
    console.log(`✅ تم تفعيل ${user.display_name} بنجاح`)
  } catch (error: any) {
    console.error('❌ خطأ في الموافقة:', error.message)
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

const suspendUser = async (user: User): Promise<void> => {
  try {
    await suspendUserAction(user)
    console.log(`⏸️ تم تعليق حساب ${user.display_name}`)
  } catch (error: any) {
    console.error('❌ خطأ في التعليق:', error.message)
  }
}

const activateUser = async (user: User): Promise<void> => {
  try {
    await toggleUserStatus(user)
    console.log(`✅ تم تفعيل حساب ${user.display_name}`)
  } catch (error: any) {
    console.error('❌ خطأ في التفعيل:', error.message)
  }
}

const handleBulkSuspend = (): void => {
  bulkActionType.value = 'suspend'
  bulkActionReason.value = ''
  confirmBulkActionState.value = false
  bulkActionDialog.value = true
}

const handleBulkActivate = (): void => {
  bulkActionType.value = 'activate'
  bulkActionReason.value = ''
  confirmBulkActionState.value = false
  bulkActionDialog.value = true
}

const executeBulkAction = async (): Promise<void> => {
  try {
    if (bulkActionType.value === 'suspend') {
      await bulkSuspendUsers()
      console.log(`⏸️ تم تعليق ${selectedAllUsers.value.length} حساب`)
    } else {
      await bulkActivateUsers()
      console.log(`✅ تم تفعيل ${selectedAllUsers.value.length} حساب`)
    }
    
    bulkActionDialog.value = false
    confirmBulkActionState.value = false
  } catch (error: any) {
    console.error('❌ خطأ في العملية الجماعية:', error.message)
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
.all-users-tab {
  width: 100%;
}

.tab-header {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.stats-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  height: 100%;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.filters-section {
  position: sticky;
  top: 0;
  z-index: 5;
  backdrop-filter: blur(10px);
}

.active-filters {
  background: rgba(var(--v-theme-surface), 0.8);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.results-summary {
  position: sticky;
  top: 120px;
  z-index: 4;
}

.table-section {
  margin-top: 8px;
}

/* Responsive */
@media (max-width: 960px) {
  .tab-header {
    padding: 16px;
  }
  
  .results-summary {
    position: static;
  }
}

@media (max-width: 600px) {
  .active-filters {
    padding: 8px;
  }
  
  .active-filters .d-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style> 