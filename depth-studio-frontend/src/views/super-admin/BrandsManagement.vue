<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h2 class="mb-4">إدارة البراندات</h2>
        
        <!-- Search -->
        <v-text-field
          v-model="searchQuery"
          label="البحث عن براند"
          prepend-inner-icon="mdi-magnify"
          clearable
          class="mb-4"
        />
        
        <!-- Brands List -->
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>قائمة البراندات</span>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true">
              إضافة براند
            </v-btn>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="filteredBrands"
            :loading="isLoading"
            item-key="id"
          >
            <template v-slot:item.logo="{ item }">
              <v-avatar size="40">
                <v-img v-if="item.logo_url" :src="item.logo_url" />
                <v-icon v-else>mdi-store</v-icon>
              </v-avatar>
            </template>
            
            <template v-slot:item.status="{ item }">
              <v-chip :color="getStatusColor(item.status)" size="small">
                {{ getStatusText(item.status) }}
              </v-chip>
            </template>
            
            <template v-slot:item.actions="{ item }">
              <v-btn-group variant="outlined" density="compact">
                <v-btn icon="mdi-eye" size="small" @click="viewBrand(item)" />
                <v-btn icon="mdi-pencil" size="small" @click="editBrand(item)" />
                <v-btn 
                  icon="mdi-delete" 
                  size="small" 
                  color="error"
                  @click="deleteBrand(item)" 
                />
              </v-btn-group>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Add Brand Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500">
      <v-card>
        <v-card-title>إضافة براند جديد</v-card-title>
        <v-card-text>
          <v-text-field v-model="newBrand.name" label="اسم البراند" />
          <v-text-field v-model="newBrand.arabic_name" label="الاسم بالعربي" />
          <v-text-field v-model="newBrand.website" label="الموقع الإلكتروني" />
          <v-textarea v-model="newBrand.description" label="الوصف" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showAddDialog = false">إلغاء</v-btn>
          <v-btn color="primary" @click="addBrand">حفظ</v-btn>
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

const brands = ref<any[]>([])

const newBrand = ref({
  name: '',
  arabic_name: '',
  website: '',
  description: ''
})

const headers = [
  { title: 'اللوغو', key: 'logo', sortable: false },
  { title: 'الاسم', key: 'name' },
  { title: 'الاسم بالعربي', key: 'arabic_name' },
  { title: 'الموقع', key: 'website' },
  { title: 'الحالة', key: 'status' },
  { title: 'الإجراءات', key: 'actions', sortable: false }
]

const filteredBrands = computed(() => {
  let filtered = brands.value

  if (searchQuery.value) {
    filtered = filtered.filter(brand =>
      brand.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      brand.arabic_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'inactive': return 'error'
    default: return 'grey'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'نشط'
    case 'inactive': return 'غير نشط'
    default: return 'غير محدد'
  }
}

const viewBrand = (brand: any) => {
  console.log('عرض البراند:', brand)
}

const editBrand = (brand: any) => {
  console.log('تعديل البراند:', brand)
}

const deleteBrand = async (brand: any) => {
  if (confirm('هل أنت متأكد من حذف هذا البراند؟')) {
    try {
      await deleteDoc(doc(db, 'brands', brand.id))
      console.log('تم حذف البراند')
    } catch (error) {
      console.error('خطأ في الحذف:', error)
    }
  }
}

const addBrand = async () => {
  try {
    await addDoc(collection(db, 'brands'), {
      ...newBrand.value,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    })
    
    // Reset form
    newBrand.value = {
      name: '',
      arabic_name: '',
      website: '',
      description: ''
    }
    
    showAddDialog.value = false
    console.log('تم إضافة البراند')
  } catch (error) {
    console.error('خطأ في الإضافة:', error)
  }
}

const loadBrands = () => {
  isLoading.value = true
  
  const unsubscribe = onSnapshot(collection(db, 'brands'), (snapshot) => {
    brands.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    isLoading.value = false
  })
  
  return unsubscribe
}

onMounted(() => {
  loadBrands()
})
</script> 