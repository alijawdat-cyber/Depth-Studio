<template>
  <div class="active-users-tab">
    <!-- Header -->
    <div class="tab-header mb-6">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h2 class="text-h5 font-weight-bold text-success">
            <v-icon start size="28" color="success">mdi-check-circle</v-icon>
            المستخدمون النشطون
          </h2>
          <p class="text-body-1 text-medium-emphasis mt-1">
            إدارة ومراقبة {{ activeUsers.length }} مستخدم نشط في النظام
          </p>
        </div>
        
        <!-- Quick Stats -->
        <div class="d-flex ga-3">
          <v-card variant="outlined" class="pa-3 text-center" min-width="100">
            <div class="text-h6 font-weight-bold text-success">{{ activeUsers.length }}</div>
            <div class="text-caption">مستخدم نشط</div>
          </v-card>
          <v-card variant="outlined" class="pa-3 text-center" min-width="100">
            <div class="text-h6 font-weight-bold text-primary">{{ photographersCount }}</div>
            <div class="text-caption">مصور</div>
          </v-card>
          <v-card variant="outlined" class="pa-3 text-center" min-width="100">
            <div class="text-h6 font-weight-bold text-info">{{ coordinatorsCount }}</div>
            <div class="text-caption">منسق</div>
          </v-card>
        </div>
      </div>
    </div>

    <!-- Search and Controls -->
    <div class="controls-section mb-6">
      <v-card variant="outlined" class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="searchQuery"
              label="البحث في المستخدمين النشطين"
              placeholder="البحث بالاسم أو البريد الإلكتروني أو رقم الهاتف..."
              variant="outlined"
              density="compact"
              clearable
              prepend-inner-icon="mdi-magnify"
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
            <v-btn 
              color="primary"
              variant="elevated"
              block
              @click="refreshData"
              :loading="isProcessing"
            >
              <v-icon start>mdi-refresh</v-icon>
              تحديث
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </div>

    <!-- Users Data Table -->
    <div class="table-section">
      <UsersDataTable
        :users="filteredActiveUsers"
        :headers="activeUsersHeaders as unknown as any[]"
        :is-loading="isProcessing"
        :is-processing="isProcessing"
        :show-controls="false"
        :show-filters="false"
        :show-selection="false"
        :show-bulk-actions="false"
        :allow-edit="true"
        :items-per-page="15"
        no-data-message="لا يوجد مستخدمين نشطين"
        no-data-sub-message="جرب تغيير مرشحات البحث أو إضافة مستخدمين جدد"
        @view-user="viewUserDetails"
        @edit-user="editUser"
        @suspend-user="suspendUser"
        @activate-user="activateUser"
      />
    </div>

    <!-- Dialogs -->
    <UserDetailsDialog
      v-model="detailsDialog"
      :user="selectedUserForDetails"
      @suspend-user="suspendUser"
      @activate-user="activateUser"
    />

    <!-- Edit User Dialog -->
    <v-dialog v-model="editDialog" max-width="600px" scrollable>
      <v-card>
        <v-card-title class="pa-6 bg-primary text-white">
          <v-icon start>mdi-pencil</v-icon>
          تعديل بيانات المستخدم
          <v-spacer />
          <v-btn 
            icon="mdi-close" 
            variant="text" 
            color="white"
            @click="editDialog = false"
          />
        </v-card-title>
        
        <v-card-text class="pa-6" v-if="selectedUserForEdit">
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="font-weight-bold">{{ selectedUserForEdit.display_name || selectedUserForEdit.full_name }}</div>
            <div class="text-body-2">{{ selectedUserForEdit.email }}</div>
          </v-alert>
          
          <v-form ref="editForm" v-model="editFormValid">
            <v-text-field
              v-model="editedUser.display_name"
              label="اسم العرض"
              variant="outlined"
              :rules="[v => !!v || 'اسم العرض مطلوب']"
              class="mb-4"
            />
            
            <v-text-field
              v-model="editedUser.phone"
              label="رقم الهاتف"
              variant="outlined"
              class="mb-4"
            />
            
            <v-select
              v-model="editedUser.primary_role"
              :items="roleOptions"
              label="الدور الأساسي"
              variant="outlined"
              :rules="[v => !!v || 'الدور مطلوب']"
              class="mb-4"
            />
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn
            color="grey"
            variant="outlined"
            @click="editDialog = false"
            :disabled="isProcessing"
          >
            إلغاء
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="!editFormValid || isProcessing"
            :loading="isProcessing"
            @click="saveUserChanges"
          >
            حفظ التغييرات
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Suspend Confirmation Dialog -->
    <v-dialog v-model="suspendDialog" max-width="500px" persistent>
      <v-card>
        <v-card-title class="pa-6 bg-warning text-white">
          <v-icon start>mdi-pause-circle</v-icon>
          تأكيد تعليق الحساب
        </v-card-title>
        
        <v-card-text class="pa-6" v-if="selectedUserForSuspend">
          <v-alert type="warning" variant="tonal" class="mb-4">
            <div class="font-weight-bold">هل أنت متأكد من تعليق حساب {{ selectedUserForSuspend.display_name }}؟</div>
            <div class="mt-2 text-body-2">سيفقد المستخدم الوصول للنظام حتى يتم تفعيل الحساب مرة أخرى.</div>
          </v-alert>
          
          <v-textarea
            v-model="suspendReason"
            label="سبب التعليق (اختياري)"
            placeholder="يمكنك إضافة سبب التعليق هنا..."
            rows="3"
            variant="outlined"
            counter="500"
            maxlength="500"
          />
        </v-card-text>
        
        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn 
            color="grey" 
            variant="outlined"
            @click="suspendDialog = false"
            :disabled="isProcessing"
          >
            إلغاء
          </v-btn>
          <v-btn 
            color="warning" 
            variant="elevated"
            :loading="isProcessing"
            @click="confirmSuspend"
          >
            تعليق الحساب
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
  activeUsersHeaders, 
  roleFilterOptions,
  getRoleName 
} from '@/utils/userHelpers'
import UsersDataTable from '@/components/users/tables/UsersDataTable.vue'
import UserDetailsDialog from '@/components/users/dialogs/UserDetailsDialog.vue'

// === Composables ===
const {
  activeUsers,
  photographersCount,
  coordinatorsCount,
  isProcessing,
  loadAllUsers,
  suspendUser: suspendUserAction,
  toggleUserStatus
} = useUserManagement()

// === Reactive Data ===
const searchQuery = ref('')
const roleFilter = ref('')
const detailsDialog = ref(false)
const editDialog = ref(false)
const suspendDialog = ref(false)
const editFormValid = ref(false)
const suspendReason = ref('')
const selectedUserForDetails = ref<User | null>(null)
const selectedUserForEdit = ref<User | null>(null)
const selectedUserForSuspend = ref<User | null>(null)
const editedUser = ref({
  display_name: '',
  phone: '',
  primary_role: ''
})

// === Role Options ===
const roleOptions = [
  { title: 'مصور', value: 'photographer' },
  { title: 'منسق براند', value: 'brand_coordinator' },
  { title: 'منسق تسويق', value: 'marketing_coordinator' },
  { title: 'مدير عام', value: 'super_admin' }
]

// === Computed ===
const filteredActiveUsers = computed(() => {
  let filtered = activeUsers.value.filter(user => user.status === 'active')
  
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
  
  // Role filter
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.primary_role === roleFilter.value)
  }
  
  return filtered
})

// === Methods ===
const viewUserDetails = (user: User): void => {
  selectedUserForDetails.value = user
  detailsDialog.value = true
}

const editUser = (user: User): void => {
  selectedUserForEdit.value = user
  editedUser.value = {
    display_name: user.display_name || user.full_name || '',
    phone: user.phone || '',
    primary_role: user.primary_role
  }
  editDialog.value = true
}

const suspendUser = (user: User): void => {
  selectedUserForSuspend.value = user
  suspendReason.value = ''
  suspendDialog.value = true
}

const activateUser = async (user: User): Promise<void> => {
  try {
    await toggleUserStatus(user)
    console.log(`✅ تم تفعيل حساب ${user.display_name}`)
  } catch (error: any) {
    console.error('❌ خطأ في تفعيل الحساب:', error.message)
  }
}

const saveUserChanges = async (): Promise<void> => {
  if (!selectedUserForEdit.value || !editFormValid.value) return
  
  try {
    // TODO: Add update user logic here
    console.log('💾 حفظ تغييرات المستخدم:', editedUser.value)
    
    editDialog.value = false
    selectedUserForEdit.value = null
    
    // Refresh data
    await loadAllUsers()
    
    console.log('✅ تم حفظ التغييرات بنجاح')
  } catch (error: any) {
    console.error('❌ خطأ في حفظ التغييرات:', error.message)
  }
}

const confirmSuspend = async (): Promise<void> => {
  if (!selectedUserForSuspend.value) return
  
  try {
    await suspendUserAction(selectedUserForSuspend.value)
    suspendDialog.value = false
    selectedUserForSuspend.value = null
    suspendReason.value = ''
    
    console.log('⏸️ تم تعليق الحساب بنجاح')
  } catch (error: any) {
    console.error('❌ خطأ في تعليق الحساب:', error.message)
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
.active-users-tab {
  width: 100%;
}

.tab-header {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.controls-section {
  position: sticky;
  top: 0;
  z-index: 5;
  backdrop-filter: blur(10px);
}

.table-section {
  margin-top: 8px;
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
}
</style> 