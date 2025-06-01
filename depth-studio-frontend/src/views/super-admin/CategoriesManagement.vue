<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h2 class="mb-4">إدارة فئات المشاريع</h2>
        
        <!-- Search -->
        <v-text-field
          v-model="searchQuery"
          label="البحث عن فئة"
          prepend-inner-icon="mdi-magnify"
          clearable
          class="mb-4"
        />
        
        <!-- Categories List -->
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>قائمة الفئات</span>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true">
              إضافة فئة
            </v-btn>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="filteredCategories"
            :loading="isLoading"
            item-key="id"
          >
            <template v-slot:item.color="{ item }">
              <v-chip :style="{ backgroundColor: item.color }" size="small" dark>
                {{ item.color }}
              </v-chip>
            </template>
            
            <template v-slot:item.projects_count="{ item }">
              <v-chip color="info" size="small">
                {{ item.projects_count || 0 }}
              </v-chip>
            </template>
            
            <template v-slot:item.actions="{ item }">
              <v-btn-group variant="outlined" density="compact">
                <v-btn icon="mdi-eye" size="small" @click="viewCategory(item)" />
                <v-btn icon="mdi-pencil" size="small" @click="editCategory(item)" />
                <v-btn 
                  icon="mdi-delete" 
                  size="small" 
                  color="error"
                  @click="deleteCategory(item)" 
                />
              </v-btn-group>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Add Category Dialog -->
    <v-dialog v-model="showAddDialog" max-width="500">
      <v-card>
        <v-card-title>إضافة فئة جديدة</v-card-title>
        <v-card-text>
          <v-text-field v-model="newCategory.name" label="اسم الفئة" class="mb-3" />
          <v-text-field v-model="newCategory.name_en" label="الاسم بالإنجليزية" class="mb-3" />
          <v-textarea v-model="newCategory.description" label="الوصف" rows="3" class="mb-3" />
          <v-text-field
            v-model="newCategory.color"
            label="اللون"
            type="color"
            class="mb-3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showAddDialog = false">إلغاء</v-btn>
          <v-btn color="primary" @click="addCategory">حفظ</v-btn>
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

const categories = ref<any[]>([])

const newCategory = ref({
  name: '',
  name_en: '',
  description: '',
  color: '#1976D2'
})

const headers = [
  { title: 'الاسم', key: 'name' },
  { title: 'الاسم بالإنجليزية', key: 'name_en' },
  { title: 'اللون', key: 'color' },
  { title: 'عدد المشاريع', key: 'projects_count' },
  { title: 'الإجراءات', key: 'actions', sortable: false }
]

const filteredCategories = computed(() => {
  let filtered = categories.value

  if (searchQuery.value) {
    filtered = filtered.filter(category =>
      category.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      category.name_en?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

const viewCategory = (category: any) => {
  console.log('عرض الفئة:', category)
}

const editCategory = (category: any) => {
  console.log('تعديل الفئة:', category)
}

const deleteCategory = async (category: any) => {
  if (confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
    try {
      await deleteDoc(doc(db, 'categories', category.id))
      console.log('تم حذف الفئة')
    } catch (error) {
      console.error('خطأ في الحذف:', error)
    }
  }
}

const addCategory = async () => {
  try {
    await addDoc(collection(db, 'categories'), {
      ...newCategory.value,
      projects_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    })
    
    // Reset form
    newCategory.value = {
      name: '',
      name_en: '',
      description: '',
      color: '#1976D2'
    }
    
    showAddDialog.value = false
    console.log('تم إضافة الفئة')
  } catch (error) {
    console.error('خطأ في الإضافة:', error)
  }
}

const loadCategories = () => {
  isLoading.value = true
  
  const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
    categories.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    isLoading.value = false
  })
  
  return unsubscribe
}

onMounted(() => {
  loadCategories()
})
</script> 