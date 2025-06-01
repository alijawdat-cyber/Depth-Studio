<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h2 class="mb-4">إدارة المعدات</h2>
        
        <!-- Search -->
        <v-text-field
          v-model="searchQuery"
          label="البحث عن معدة"
          prepend-inner-icon="mdi-magnify"
          clearable
          class="mb-4"
        />
        
        <!-- Equipment List -->
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>قائمة المعدات</span>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true">
              إضافة معدة
            </v-btn>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="filteredEquipment"
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
                <v-btn icon="mdi-eye" size="small" @click="viewEquipment(item)" />
                <v-btn icon="mdi-pencil" size="small" @click="editEquipment(item)" />
                <v-btn 
                  icon="mdi-delete" 
                  size="small" 
                  color="error"
                  @click="deleteEquipment(item)" 
                />
              </v-btn-group>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Add Equipment Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500">
      <v-card>
        <v-card-title>إضافة معدة جديدة</v-card-title>
        <v-card-text>
          <v-text-field v-model="newEquipment.name" label="اسم المعدة" class="mb-3" />
          <v-select
            v-model="newEquipment.type"
            :items="typeOptions"
            label="نوع المعدة"
            class="mb-3"
          />
          <v-text-field v-model="newEquipment.brand" label="الماركة" class="mb-3" />
          <v-text-field v-model="newEquipment.model" label="الموديل" class="mb-3" />
          <v-textarea v-model="newEquipment.description" label="الوصف" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showAddDialog = false">إلغاء</v-btn>
          <v-btn color="primary" @click="addEquipment">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

const searchQuery = ref('')
const isLoading = ref(false)
const showAddDialog = ref(false)

const equipment = ref<any[]>([])

const newEquipment = ref({
  name: '',
  type: '',
  brand: '',
  model: '',
  description: ''
})

const headers = [
  { title: 'الاسم', key: 'name' },
  { title: 'النوع', key: 'type' },
  { title: 'الماركة', key: 'brand' },
  { title: 'الموديل', key: 'model' },
  { title: 'الحالة', key: 'status' },
  { title: 'الإجراءات', key: 'actions', sortable: false }
]

const typeOptions = [
  { title: 'كاميرا', value: 'camera' },
  { title: 'عدسة', value: 'lens' },
  { title: 'إضاءة', value: 'lighting' },
  { title: 'ستاند', value: 'tripod' },
  { title: 'اكسسوارات', value: 'accessories' }
]

const filteredEquipment = computed(() => {
  let filtered = equipment.value

  if (searchQuery.value) {
    filtered = filtered.filter(item =>
      item.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return 'success'
    case 'in_use': return 'warning'
    case 'maintenance': return 'error'
    default: return 'grey'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'available': return 'متاح'
    case 'in_use': return 'قيد الاستخدام'
    case 'maintenance': return 'تحت الصيانة'
    default: return 'غير محدد'
  }
}

const viewEquipment = (item: any) => {
  console.log('عرض المعدة:', item)
}

const editEquipment = (item: any) => {
  console.log('تعديل المعدة:', item)
}

const deleteEquipment = async (item: any) => {
  if (confirm('هل أنت متأكد من حذف هذه المعدة؟')) {
    try {
      await deleteDoc(doc(db, 'equipment', item.id))
      console.log('تم حذف المعدة')
    } catch (error) {
      console.error('خطأ في الحذف:', error)
    }
  }
}

const addEquipment = async () => {
  try {
    await addDoc(collection(db, 'equipment'), {
      ...newEquipment.value,
      status: 'available',
      created_at: new Date(),
      updated_at: new Date()
    })
    
    // Reset form
    newEquipment.value = {
      name: '',
      type: '',
      brand: '',
      model: '',
      description: ''
    }
    
    showAddDialog.value = false
    console.log('تم إضافة المعدة')
  } catch (error) {
    console.error('خطأ في الإضافة:', error)
  }
}

const loadEquipment = () => {
  isLoading.value = true
  
  const unsubscribe = onSnapshot(collection(db, 'equipment'), (snapshot) => {
    equipment.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    isLoading.value = false
  })
  
  return unsubscribe
}

onMounted(() => {
  loadEquipment()
})
</script> 