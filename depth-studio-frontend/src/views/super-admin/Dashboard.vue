<template>
  <v-container fluid>
    <!-- Welcome Section -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-6 mb-6">
          <h2>مرحباً بك يا علي جودت</h2>
          <p class="text-body-2 text-medium-emphasis">المدير العام - Depth Studio</p>
          <v-chip color="success" size="small">
            <v-icon start>mdi-check-circle</v-icon>
            متصل الآن
          </v-chip>
        </v-card>
      </v-col>
    </v-row>

    <!-- Notifications -->
    <v-row v-if="pendingApprovals.length > 0">
      <v-col cols="12">
        <v-alert type="warning" prominent>
          <v-alert-title>طلبات تسجيل جديدة تحتاج موافقتك</v-alert-title>
          <p>هناك {{ pendingApprovals.length }} طلب تسجيل جديد في انتظار موافقتك</p>
          <v-btn color="primary" @click="goToApprovals">
            مراجعة الطلبات
          </v-btn>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row>
      <v-col cols="12">
        <h3 class="mb-4">الإحصائيات الرئيسية</h3>
      </v-col>
      
      <v-col cols="12" md="3">
        <v-card class="text-center pa-4" @click="goToUsers">
          <v-icon size="48" color="primary">mdi-account-group</v-icon>
          <h2 class="text-primary">5</h2>
          <p>المستخدمون</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-4" @click="goToBrands">
          <v-icon size="48" color="success">mdi-store</v-icon>
          <h2 class="text-success">2</h2>
          <p>البراندات</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-4" @click="goToCampaigns">
          <v-icon size="48" color="warning">mdi-rocket</v-icon>
          <h2 class="text-warning">12</h2>
          <p>الحملات النشطة</p>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="text-center pa-4" @click="goToEquipment">
          <v-icon size="48" color="info">mdi-camera</v-icon>
          <h2 class="text-info">8</h2>
          <p>المعدات</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row class="mt-6">
      <v-col cols="12">
        <h3 class="mb-4">إجراءات سريعة</h3>
      </v-col>
      
      <v-col cols="12" md="6">
        <v-card title="إضافة جديد" class="pa-4">
          <v-btn-group divided>
            <v-btn prepend-icon="mdi-account-plus" @click="addUser">
              مستخدم جديد
            </v-btn>
            <v-btn prepend-icon="mdi-store-plus" @click="addBrand">
              براند جديد
            </v-btn>
            <v-btn prepend-icon="mdi-rocket-launch" @click="addCampaign">
              حملة جديدة
            </v-btn>
          </v-btn-group>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card title="إدارة سريعة" class="pa-4">
          <v-btn-group divided>
            <v-btn prepend-icon="mdi-cog" @click="goToSettings">
              الإعدادات
            </v-btn>
            <v-btn prepend-icon="mdi-backup-restore" @click="goToBackups">
              النسخ الاحتياطي
            </v-btn>
            <v-btn prepend-icon="mdi-chart-box" @click="goToReports">
              التقارير
            </v-btn>
          </v-btn-group>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc 
} from 'firebase/firestore'
import { db } from '@/firebase/config'

const router = useRouter()
const { userProfile } = useAuth()

// State
const pendingApprovals = ref<any[]>([])
const isProcessingBulk = ref(false)

// Computed
const approvalStats = computed(() => ({
  photographers: pendingApprovals.value.filter((u: any) => u.primary_role === 'photographer').length,
  brandCoordinators: pendingApprovals.value.filter((u: any) => u.primary_role === 'brand_coordinator').length,
  marketingCoordinators: pendingApprovals.value.filter((u: any) => u.primary_role === 'marketing_coordinator').length
}))

// Methods
const goToUsers = () => router.push('/super-admin/users')
const goToBrands = () => router.push('/super-admin/brands')
const goToCampaigns = () => router.push('/super-admin/campaigns')
const goToEquipment = () => router.push('/super-admin/equipment')
const goToSettings = () => router.push('/super-admin/settings')
const goToApprovals = () => router.push('/super-admin/users?tab=pending')

const addUser = () => router.push('/super-admin/users?action=add')
const addBrand = () => router.push('/super-admin/brands?action=add')
const addCampaign = () => router.push('/super-admin/campaigns?action=add')
const goToBackups = () => router.push('/super-admin/settings?tab=backup')
const goToReports = () => router.push('/super-admin/reports')

// Load pending approvals
const loadPendingApprovals = () => {
  const q = query(
    collection(db, 'users'),
    where('approval_status', '==', 'pending')
  )
  
  onSnapshot(q, (snapshot) => {
    pendingApprovals.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  })
}

onMounted(() => {
  loadPendingApprovals()
})
</script> 