<template>
  <div class="users-data-table">
    <!-- Search and Controls -->
    <div v-if="showControls" class="table-controls mb-4">
      <v-row align="center">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchQuery"
            label="البحث في المستخدمين"
            placeholder="البحث بالاسم أو البريد الإلكتروني..."
            variant="outlined"
            density="compact"
            clearable
            prepend-inner-icon="mdi-magnify"
            hide-details
          />
        </v-col>
        
        <v-col v-if="showFilters" cols="12" md="3">
          <v-select
            v-model="statusFilter"
            :items="statusFilterOptions"
            label="حالة المستخدم"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
        
        <v-col v-if="showFilters" cols="12" md="3">
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
      </v-row>
    </div>

    <!-- Bulk Actions -->
    <div v-if="showBulkActions && selectedUsers.length > 0" class="bulk-actions mb-4">
      <v-alert
        type="info"
        variant="tonal"
        class="d-flex align-center"
      >
        <template #prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        
        <div class="flex-grow-1">
          <span class="font-weight-bold">تم تحديد {{ selectedUsers.length }} مستخدم</span>
        </div>
        
        <div class="bulk-action-buttons">
          <v-btn
            v-if="allowBulkSuspend"
            color="warning"
            variant="outlined"
            size="small"
            @click="$emit('bulk-suspend')"
            :disabled="isProcessing"
            class="me-2"
          >
            <v-icon start size="16">mdi-pause</v-icon>
            تعليق المحدد
          </v-btn>
          
          <v-btn
            v-if="allowBulkActivate"
            color="success"
            variant="outlined"
            size="small"
            @click="$emit('bulk-activate')"
            :disabled="isProcessing"
            class="me-2"
          >
            <v-icon start size="16">mdi-play</v-icon>
            تفعيل المحدد
          </v-btn>
          
          <v-btn
            color="grey"
            variant="text"
            size="small"
            @click="clearSelection"
          >
            إلغاء التحديد
          </v-btn>
        </div>
      </v-alert>
    </div>

    <!-- Data Table -->
    <v-data-table
      v-model:selected="internalSelectedUsers"
      :headers="tableHeaders"
      :items="filteredUsers"
      :loading="isLoading"
      :items-per-page="itemsPerPage"
      :show-select="showSelection"
      class="users-table elevation-2"
      item-value="id"
    >
      <!-- Loading -->
      <template #loading>
        <v-skeleton-loader type="table-row@5" />
      </template>

      <!-- User Info Column -->
      <template #item.user_info="{ item }">
        <div class="d-flex align-center py-2">
          <v-avatar size="40" class="me-3">
            <img 
              v-if="item.profile_photo_url" 
              :src="item.profile_photo_url" 
              :alt="getDisplayName(item)"
            >
            <v-icon v-else size="20" color="grey">mdi-account</v-icon>
          </v-avatar>
          
          <div class="user-details">
            <div class="user-name font-weight-bold text-body-1">
              {{ getDisplayName(item) }}
            </div>
            <div class="user-email text-body-2 text-medium-emphasis">
              {{ item.email }}
            </div>
          </div>
        </div>
      </template>

      <!-- Role Column -->
      <template #item.primary_role="{ item }">
        <v-chip
          :color="getRoleColor(item.primary_role)"
          size="small"
          class="font-weight-bold"
        >
          <v-icon start size="14">{{ getRoleIcon(item.primary_role) }}</v-icon>
          {{ getRoleName(item.primary_role) }}
        </v-chip>
      </template>

      <!-- Status Column -->
      <template #item.status="{ item }">
        <v-chip
          :color="getStatusColor(item.status)"
          size="small"
          class="font-weight-bold"
        >
          <v-icon start size="14">{{ getStatusIcon(item.status) }}</v-icon>
          {{ getStatusName(item.status) }}
        </v-chip>
      </template>

      <!-- Phone Column -->
      <template #item.phone="{ item }">
        <span v-if="item.phone" class="text-body-2">{{ item.phone }}</span>
        <span v-else class="text-caption text-medium-emphasis">غير متوفر</span>
      </template>

      <!-- Date Columns -->
      <template #item.created_at="{ item }">
        <div class="date-cell">
          <div class="date-primary text-body-2">{{ formatDate(item.created_at) }}</div>
          <div class="date-secondary text-caption text-medium-emphasis">
            {{ getTimeDifference(item.created_at) }}
          </div>
        </div>
      </template>

      <template #item.approved_at="{ item }">
        <div v-if="item.approved_at" class="date-cell">
          <div class="date-primary text-body-2">{{ formatDate(item.approved_at) }}</div>
          <div class="date-secondary text-caption text-medium-emphasis">
            {{ getTimeDifference(item.approved_at) }}
          </div>
        </div>
        <span v-else class="text-caption text-medium-emphasis">لم يتم بعد</span>
      </template>

      <!-- Actions Column -->
      <template #item.actions="{ item }">
        <div class="action-buttons">
          <v-btn
            color="grey"
            variant="text"
            size="small"
            icon="mdi-eye"
            @click="emit('view-user', item)"
            :disabled="isProcessing"
          />
          
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                color="grey"
                variant="text"
                size="small"
                icon="mdi-dots-vertical"
                v-bind="props"
                :disabled="isProcessing"
              />
            </template>
            
            <v-list density="compact">
              <v-list-item
                v-if="item.status === 'active'"
                @click="emit('suspend-user', item)"
                prepend-icon="mdi-pause"
                title="تعليق الحساب"
              />
              
              <v-list-item
                v-else-if="item.status === 'suspended'"
                @click="emit('activate-user', item)"
                prepend-icon="mdi-play"
                title="تفعيل الحساب"
              />
              
              <v-list-item
                v-if="item.status === 'pending_approval'"
                @click="emit('approve-user', item)"
                prepend-icon="mdi-check"
                title="موافقة"
              />
              
              <v-list-item
                v-if="item.status === 'pending_approval'"
                @click="emit('reject-user', item)"
                prepend-icon="mdi-close"
                title="رفض"
              />
              
              <v-divider v-if="allowEdit" />
              
              <v-list-item
                v-if="allowEdit"
                @click="emit('edit-user', item)"
                prepend-icon="mdi-pencil"
                title="تعديل"
              />
            </v-list>
          </v-menu>
        </div>
      </template>

      <!-- No Data -->
      <template #no-data>
        <div class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">
            mdi-account-search
          </v-icon>
          <div class="text-h6 text-medium-emphasis mb-2">
            {{ noDataMessage }}
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ noDataSubMessage }}
          </div>
        </div>
      </template>

      <!-- Bottom -->
      <template #bottom>
        <div class="text-center pt-4">
          <v-pagination
            v-if="users.length > itemsPerPage"
            v-model="currentPage"
            :length="totalPages"
            :total-visible="7"
            size="small"
          />
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue'
import {
  getRoleColor,
  getRoleIcon,
  getRoleName,
  getStatusColor,
  getStatusIcon,
  getStatusName,
  formatDate,
  getTimeDifference,
  statusFilterOptions,
  roleFilterOptions,
  type User
} from '@/utils/userHelpers'

// === Props ===
const props = defineProps({
  users: {
    type: Array as PropType<User[]>,
    required: true
  },
  headers: {
    type: Array as PropType<any[]>,
    required: true
  },
  selectedUsers: {
    type: Array as PropType<string[]>,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isProcessing: {
    type: Boolean,
    default: false
  },
  showControls: {
    type: Boolean,
    default: true
  },
  showFilters: {
    type: Boolean,
    default: true
  },
  showSelection: {
    type: Boolean,
    default: false
  },
  showBulkActions: {
    type: Boolean,
    default: false
  },
  allowBulkSuspend: {
    type: Boolean,
    default: false
  },
  allowBulkActivate: {
    type: Boolean,
    default: false
  },
  allowEdit: {
    type: Boolean,
    default: false
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  noDataMessage: {
    type: String,
    default: 'لا توجد مستخدمين'
  },
  noDataSubMessage: {
    type: String,
    default: 'جرب تغيير المرشحات أو البحث'
  }
})

// === Emits ===
const emit = defineEmits<{
  'update:selected-users': [users: string[]]
  'view-user': [user: User]
  'edit-user': [user: User]
  'approve-user': [user: User]
  'reject-user': [user: User]
  'suspend-user': [user: User]
  'activate-user': [user: User]
  'bulk-suspend': []
  'bulk-activate': []
}>()

// === Reactive Data ===
const searchQuery = ref('')
const statusFilter = ref('')
const roleFilter = ref('')
const currentPage = ref(1)
const internalSelectedUsers = ref<string[]>([...props.selectedUsers])

// === Computed ===
const tableHeaders = computed(() => props.headers)

const filteredUsers = computed(() => {
  let filtered = [...props.users]
  
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
  
  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / props.itemsPerPage)
})

// === Watchers ===
watch(() => props.selectedUsers, (newValue) => {
  internalSelectedUsers.value = [...newValue]
}, { deep: true })

watch(internalSelectedUsers, (newValue) => {
  emit('update:selected-users', newValue)
}, { deep: true })

watch([searchQuery, statusFilter, roleFilter], () => {
  currentPage.value = 1
})

// === Methods ===
const getDisplayName = (user: User): string => {
  return user.display_name || user.full_name || 'مستخدم بدون اسم'
}

const clearSelection = (): void => {
  // This will be handled by the parent component
  // when the update:selected-users event is emitted with an empty array
}
</script>

<style scoped>
.users-data-table {
  width: 100%;
}

.table-controls {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.bulk-actions {
  border-radius: 8px;
}

.bulk-action-buttons {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.users-table {
  border-radius: 12px;
  overflow: hidden;
}

.user-details {
  min-width: 0;
  flex: 1;
}

.user-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.date-cell {
  min-width: 120px;
}

.date-primary {
  font-weight: 500;
}

.date-secondary {
  margin-top: 2px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Table Customizations */
:deep(.v-data-table) {
  background: white;
}

:deep(.v-data-table__wrapper) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-data-table-header) {
  background: rgba(var(--v-theme-primary), 0.05);
}

:deep(.v-data-table-header th) {
  font-weight: 600 !important;
  color: rgb(var(--v-theme-primary)) !important;
  border-bottom: 2px solid rgba(var(--v-theme-primary), 0.1) !important;
}

:deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.02) !important;
}

:deep(.v-selection-control) {
  display: flex;
  align-items: center;
}

/* Responsive */
@media (max-width: 900px) {
  .user-email {
    max-width: 150px;
  }
  
  .bulk-action-buttons {
    margin-top: 8px;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .table-controls {
    padding: 12px;
  }
  
  .user-details {
    max-width: 140px;
  }
  
  .user-email {
    max-width: 120px;
  }
  
  .date-cell {
    min-width: 100px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
}

/* Loading and Empty States */
:deep(.v-skeleton-loader) {
  background: transparent;
}

:deep(.v-skeleton-loader__bone) {
  background: rgba(var(--v-theme-on-surface), 0.06);
}

/* Selection Styling */
:deep(.v-data-table__tr.v-data-table__tr--selected) {
  background: rgba(var(--v-theme-primary), 0.08) !important;
}

:deep(.v-data-table__tr.v-data-table__tr--selected:hover) {
  background: rgba(var(--v-theme-primary), 0.12) !important;
}
</style> 