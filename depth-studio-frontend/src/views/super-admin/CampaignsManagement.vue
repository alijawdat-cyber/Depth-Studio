<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h2 class="mb-4">إدارة الحملات الذكية</h2>
        
        <!-- Search -->
        <v-text-field
          v-model="searchQuery"
          label="البحث عن حملة"
          prepend-inner-icon="mdi-magnify"
          clearable
          class="mb-4"
        />
        
        <!-- Campaigns List -->
        <v-card>
          <v-card-title class="d-flex justify-space-between">
            <span>قائمة الحملات</span>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true">
              إنشاء حملة جديدة
            </v-btn>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="filteredCampaigns"
            :loading="isLoading"
            item-key="id"
          >
            <template v-slot:item.status="{ item }">
              <v-chip :color="getStatusColor(item.status)" size="small">
                {{ getStatusText(item.status) }}
              </v-chip>
            </template>
            
            <template v-slot:item.budget="{ item }">
              {{ formatCurrency(item.budget) }}
            </template>
            
            <template v-slot:item.actions="{ item }">
              <v-btn-group variant="outlined" density="compact">
                <v-btn icon="mdi-eye" size="small" @click="viewCampaign(item)" />
                <v-btn icon="mdi-pencil" size="small" @click="editCampaign(item)" />
                <v-btn 
                  icon="mdi-play" 
                  size="small" 
                  color="success"
                  v-if="item.status === 'draft'"
                  @click="startCampaign(item)" 
                />
                <v-btn 
                  icon="mdi-delete" 
                  size="small" 
                  color="error"
                  @click="deleteCampaign(item)" 
                />
              </v-btn-group>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Add Campaign Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600">
      <v-card>
        <v-card-title>إنشاء حملة جديدة</v-card-title>
        <v-card-text>
          <v-text-field v-model="newCampaign.title" label="عنوان الحملة" class="mb-3" />
          <v-textarea v-model="newCampaign.description" label="الوصف" rows="3" class="mb-3" />
          <v-select
            v-model="newCampaign.brand_id"
            :items="brands"
            item-title="name"
            item-value="id"
            label="البراند"
            class="mb-3"
          />
          <v-text-field
            v-model="newCampaign.budget"
            label="الميزانية"
            type="number"
            prefix="$"
            class="mb-3"
          />
          <v-select
            v-model="newCampaign.priority"
            :items="priorityOptions"
            label="الأولوية"
            class="mb-3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showAddDialog = false">إلغاء</v-btn>
          <v-btn color="primary" @click="addCampaign">إنشاء</v-btn>
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

const campaigns = ref<any[]>([])
const brands = ref<any[]>([])

const newCampaign = ref({
  title: '',
  description: '',
  brand_id: '',
  budget: 0,
  priority: 'medium'
})

const headers = [
  { title: 'العنوان', key: 'title' },
  { title: 'البراند', key: 'brand_name' },
  { title: 'الميزانية', key: 'budget' },
  { title: 'الأولوية', key: 'priority' },
  { title: 'الحالة', key: 'status' },
  { title: 'الإجراءات', key: 'actions', sortable: false }
]

const priorityOptions = [
  { title: 'عالية', value: 'high' },
  { title: 'متوسطة', value: 'medium' },
  { title: 'منخفضة', value: 'low' }
]

const filteredCampaigns = computed(() => {
  let filtered = campaigns.value

  if (searchQuery.value) {
    filtered = filtered.filter(campaign =>
      campaign.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      campaign.brand_name?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return filtered
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'draft': return 'warning'
    case 'completed': return 'info'
    case 'cancelled': return 'error'
    default: return 'grey'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'نشطة'
    case 'draft': return 'مسودة'
    case 'completed': return 'مكتملة'
    case 'cancelled': return 'ملغية'
    default: return 'غير محدد'
  }
}

const formatCurrency = (amount: number) => {
  return `$${amount.toLocaleString()}`
}

const viewCampaign = (campaign: any) => {
  console.log('عرض الحملة:', campaign)
}

const editCampaign = (campaign: any) => {
  console.log('تعديل الحملة:', campaign)
}

const startCampaign = async (campaign: any) => {
  try {
    await updateDoc(doc(db, 'campaigns', campaign.id), {
      status: 'active',
      started_at: new Date()
    })
    console.log('تم تشغيل الحملة')
  } catch (error) {
    console.error('خطأ في تشغيل الحملة:', error)
  }
}

const deleteCampaign = async (campaign: any) => {
  if (confirm('هل أنت متأكد من حذف هذه الحملة؟')) {
    try {
      await deleteDoc(doc(db, 'campaigns', campaign.id))
      console.log('تم حذف الحملة')
    } catch (error) {
      console.error('خطأ في الحذف:', error)
    }
  }
}

const addCampaign = async () => {
  try {
    const brandName = brands.value.find(b => b.id === newCampaign.value.brand_id)?.name || ''
    
    await addDoc(collection(db, 'campaigns'), {
      ...newCampaign.value,
      brand_name: brandName,
      status: 'draft',
      created_at: new Date(),
      updated_at: new Date()
    })
    
    // Reset form
    newCampaign.value = {
      title: '',
      description: '',
      brand_id: '',
      budget: 0,
      priority: 'medium'
    }
    
    showAddDialog.value = false
    console.log('تم إنشاء الحملة')
  } catch (error) {
    console.error('خطأ في الإنشاء:', error)
  }
}

const loadCampaigns = () => {
  isLoading.value = true
  
  const unsubscribe = onSnapshot(collection(db, 'campaigns'), (snapshot) => {
    campaigns.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    isLoading.value = false
  })
  
  return unsubscribe
}

const loadBrands = () => {
  const unsubscribe = onSnapshot(collection(db, 'brands'), (snapshot) => {
    brands.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  })
  
  return unsubscribe
}

onMounted(() => {
  loadCampaigns()
  loadBrands()
})
</script> 