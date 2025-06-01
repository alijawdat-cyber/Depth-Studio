<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h2 class="mb-4">إدارة المستخدمين</h2>
        
        <!-- Tabs -->
        <v-tabs v-model="activeTab" class="mb-4">
          <v-tab value="all">جميع المستخدمين</v-tab>
          <v-tab value="pending">طلبات الموافقة</v-tab>
        </v-tabs>
        
        <!-- Search -->
        <v-text-field
          v-model="searchQuery"
          label="البحث عن مستخدم"
          prepend-inner-icon="mdi-magnify"
          clearable
          class="mb-4"
        />
        
        <!-- Users List -->
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>قائمة المستخدمين</span>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true">
              إضافة مستخدم
            </v-btn>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="filteredUsers"
            :loading="isLoading"
            item-key="id"
          >
            <template v-slot:item.status="{ item }">
              <v-chip :color="getStatusColor(item.status)" size="small">
                {{ getStatusText(item.status) }}
              </v-chip>
            </template>
            
            <template v-slot:item.actions="{ item }">
              <v-btn-group variant="outlined" density="compact">
                <v-btn icon="mdi-eye" size="small" @click="viewUser(item)" />
                <v-btn icon="mdi-pencil" size="small" @click="editUser(item)" />
                <v-btn 
                  v-if="item.status === 'pending'" 
                  icon="mdi-check" 
                  size="small" 
                  color="success"
                  @click="approveUser(item)" 
                />
                <v-btn 
                  icon="mdi-delete" 
                  size="small" 
                  color="error"
                  @click="deleteUser(item)" 
                />
              </v-btn-group>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Add User Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500">
      <v-card>
        <v-card-title>إضافة مستخدم جديد</v-card-title>
        <v-card-text>
          <v-text-field v-model="newUser.displayName" label="الاسم" />
          <v-text-field v-model="newUser.email" label="البريد الإلكتروني" />
          <v-select
            v-model="newUser.role"
            :items="roleOptions"
            label="الدور"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showAddDialog = false">إلغاء</v-btn>
          <v-btn color="primary" @click="addUser">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

const activeTab = ref('all')
const searchQuery = ref('')
const isLoading = ref(false)
const showAddDialog = ref(false)

const users = ref<any[]>([])

const newUser = ref({
  displayName: '',
  email: '',
  role: ''
})

const headers = [
  { title: 'الاسم', key: 'display_name' },
  { title: 'البريد الإلكتروني', key: 'email' },
  { title: 'الدور', key: 'primary_role' },
  { title: 'الحالة', key: 'status' },
  { title: 'الإجراءات', key: 'actions', sortable: false }
]

const roleOptions = [
  { title: 'مصور', value: 'photographer' },
  { title: 'منسق براند', value: 'brand_coordinator' },
  { title: 'منسق تسويق', value: 'marketing_coordinator' }
]

const filteredUsers = computed(() => {
  let filtered = users.value

  if (activeTab.value === 'pending') {
    filtered = filtered.filter(user => user.approval_status === 'pending')
  }

  if (searchQuery.value) {
    filtered = filtered.filter(user =>
      user.display_name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'pending': return 'warning'
    case 'disabled': return 'error'
    default: return 'grey'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'نشط'
    case 'pending': return 'في انتظار الموافقة'
    case 'disabled': return 'معطل'
    default: return 'غير محدد'
  }
}

const viewUser = (user: any) => {
  console.log('عرض المستخدم:', user)
}

const editUser = (user: any) => {
  console.log('تعديل المستخدم:', user)
}

const approveUser = async (user: any) => {
  try {
    await updateDoc(doc(db, 'users', user.id), {
      approval_status: 'approved',
      status: 'active',
      approved_at: new Date()
    })
    console.log('تم قبول المستخدم')
  } catch (error) {
    console.error('خطأ في الموافقة:', error)
  }
}

const deleteUser = async (user: any) => {
  if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
    try {
      await deleteDoc(doc(db, 'users', user.id))
      console.log('تم حذف المستخدم')
    } catch (error) {
      console.error('خطأ في الحذف:', error)
    }
  }
}

const addUser = () => {
  console.log('إضافة مستخدم جديد:', newUser.value)
  showAddDialog.value = false
}

const loadUsers = () => {
  isLoading.value = true
  
  const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
    users.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    isLoading.value = false
  })
  
  return unsubscribe
}

onMounted(() => {
  loadUsers()
})
</script> 