<template>
  <div class="brands-management">
    <!-- Header Section -->
    <BaseCard class="mb-6 header-card">
      <template #title>
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-3">
            <v-icon size="32" color="primary">mdi-domain</v-icon>
            <div>
              <h1 class="text-h4 font-weight-bold">إدارة البراندات</h1>
              <p class="text-body-2 mt-1" style="color: var(--color-text-medium-emphasis)">إدارة شاملة لبراندات العملاء والهوية البصرية</p>
            </div>
          </div>
          <BaseButton
            variant="elevated"
            color="primary"
            prepend-icon="mdi-plus"
            size="large"
            @click="openAddBrandDialog"
          >
            إضافة براند جديد
          </BaseButton>
        </div>
      </template>
    </BaseCard>

    <!-- Stats Cards -->
    <div class="d-flex gap-4 mb-6">
      <BaseCard class="flex-1 stats-card active-brands">
        <template #title>
          <div class="d-flex align-center gap-3">
            <v-icon size="40" color="success">mdi-check-circle</v-icon>
            <div>
              <h3 class="text-h6">البراندات النشطة</h3>
              <p class="text-h4 font-weight-bold text-success">{{ stats.activeBrands }}</p>
            </div>
          </div>
        </template>
      </BaseCard>

      <BaseCard class="flex-1 stats-card pending-brands">
        <template #title>
          <div class="d-flex align-center gap-3">
            <v-icon size="40" color="warning">mdi-clock-outline</v-icon>
            <div>
              <h3 class="text-h6">قيد المراجعة</h3>
              <p class="text-h4 font-weight-bold text-warning">{{ stats.pendingBrands }}</p>
            </div>
          </div>
        </template>
      </BaseCard>

      <BaseCard class="flex-1 stats-card total-projects">
        <template #title>
          <div class="d-flex align-center gap-3">
            <v-icon size="40" color="info">mdi-briefcase-outline</v-icon>
            <div>
              <h3 class="text-h6">إجمالي المشاريع</h3>
              <p class="text-h4 font-weight-bold text-info">{{ stats.totalProjects }}</p>
            </div>
          </div>
        </template>
      </BaseCard>
    </div>

    <!-- Filters and Search -->
    <BaseCard class="mb-6 filters-card">
      <template #title>
        <h3 class="text-h6">البحث والتصفية</h3>
      </template>
      <template #default>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.search"
              prepend-inner-icon="mdi-magnify"
              label="البحث في البراندات"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="حالة البراند"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="filters.industry"
              :items="industryOptions"
              label="المجال"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <BaseButton
              variant="outlined"
              color="primary"
              block
              @click="resetFilters"
            >
              إعادة تعيين
            </BaseButton>
          </v-col>
        </v-row>
      </template>
    </BaseCard>

    <!-- Brands List -->
    <BaseCard class="brands-table-card">
      <template #title>
        <div class="d-flex align-center justify-space-between">
          <h3 class="text-h6">قائمة البراندات ({{ filteredBrands.length }})</h3>
          <div class="d-flex gap-2">
            <v-btn-toggle v-model="viewMode" variant="outlined" divided>
              <v-btn value="grid" icon="mdi-view-grid" />
              <v-btn value="list" icon="mdi-view-list" />
            </v-btn-toggle>
          </div>
        </div>
      </template>
      <template #default>
        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="brands-grid">
          <v-row>
            <v-col
              v-for="brand in filteredBrands"
              :key="brand.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <BaseCard class="brand-card" hover>
                <template #default>
                  <div class="text-center pa-4">
                    <!-- Brand Logo -->
                    <v-avatar size="80" class="mb-4">
                      <v-img
                        v-if="brand.logo"
                        :src="brand.logo"
                        :alt="brand.name"
                      />
                      <v-icon v-else size="40" color="grey">mdi-domain</v-icon>
                    </v-avatar>
                    
                    <!-- Brand Info -->
                    <h4 class="text-h6 mb-2">{{ brand.name }}</h4>
                    <p class="text-body-2 mb-3" style="color: var(--color-text-medium-emphasis)">{{ brand.industry }}</p>
                    
                    <!-- Status Chip -->
                    <v-chip
                      :color="getStatusColor(brand.status)"
                      size="small"
                      class="mb-4"
                    >
                      {{ getStatusText(brand.status) }}
                    </v-chip>
                    
                    <!-- Actions -->
                    <div class="d-flex gap-2 justify-center">
                      <v-btn
                        size="small"
                        color="primary"
                        variant="outlined"
                        @click="editBrand(brand)"
                      >
                        تعديل
                      </v-btn>
                      <v-btn
                        size="small"
                        color="info"
                        variant="outlined"
                        @click="viewBrandDetails(brand)"
                      >
                        عرض
                      </v-btn>
                    </div>
                  </div>
                </template>
              </BaseCard>
            </v-col>
          </v-row>
        </div>

        <!-- List View -->
        <v-data-table
          v-else
          :headers="tableHeaders"
          :items="filteredBrands"
          :loading="loading"
          item-key="id"
          class="brands-table"
        >
          <template #item.logo="{ item }">
            <v-avatar size="48" class="my-2">
              <v-img
                v-if="item.logo"
                :src="item.logo"
                :alt="item.name"
              />
              <v-icon v-else color="grey">mdi-domain</v-icon>
            </v-avatar>
          </template>

          <template #item.name="{ item }">
            <div>
              <h4 class="text-subtitle-1 font-weight-medium">{{ item.name }}</h4>
              <p class="text-body-2" style="color: var(--color-text-medium-emphasis)">{{ item.industry }}</p>
            </div>
          </template>

          <template #item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
            >
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <template #item.coordinator="{ item }">
            <div v-if="item.coordinator">
              <p class="text-subtitle-2">{{ item.coordinator.name }}</p>
              <p class="text-body-2" style="color: var(--color-text-medium-emphasis)">{{ item.coordinator.email }}</p>
            </div>
            <span v-else style="color: var(--color-text-muted)">غير محدد</span>
          </template>

          <template #item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex gap-1">
              <v-btn
                size="small"
                color="primary"
                variant="text"
                icon="mdi-pencil"
                @click="editBrand(item)"
              />
              <v-btn
                size="small"
                color="info"
                variant="text"
                icon="mdi-eye"
                @click="viewBrandDetails(item)"
              />
              <v-btn
                size="small"
                color="error"
                variant="text"
                icon="mdi-delete"
                @click="deleteBrand(item)"
              />
            </div>
          </template>
        </v-data-table>
      </template>
    </BaseCard>

    <!-- Add/Edit Brand Dialog -->
    <v-dialog
      v-model="brandDialog.show"
      max-width="800"
      persistent
    >
      <BaseCard>
        <template #title>
          <h3 class="text-h6">
            {{ brandDialog.isEdit ? 'تعديل براند' : 'إضافة براند جديد' }}
          </h3>
        </template>
        <template #default>
          <v-form ref="brandForm" v-model="brandDialog.valid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="brandDialog.form.name"
                  label="اسم البراند *"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="brandDialog.form.industry"
                  :items="industryOptions"
                  label="المجال *"
                  variant="outlined"
                  :rules="[rules.required]"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="brandDialog.form.description"
                  label="وصف البراند"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="brandDialog.form.website"
                  label="الموقع الإلكتروني"
                  variant="outlined"
                  type="url"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="brandDialog.form.coordinatorId"
                  :items="coordinators"
                  item-title="name"
                  item-value="id"
                  label="منسق البراند"
                  variant="outlined"
                  clearable
                />
              </v-col>
            </v-row>
          </v-form>
        </template>
        <template #actions>
          <v-spacer />
          <BaseButton
            variant="text"
            @click="closeBrandDialog"
          >
            إلغاء
          </BaseButton>
          <BaseButton
            color="primary"
            :loading="brandDialog.loading"
            :disabled="!brandDialog.valid"
            @click="saveBrand"
          >
            {{ brandDialog.isEdit ? 'تحديث' : 'إضافة' }}
          </BaseButton>
        </template>
      </BaseCard>
    </v-dialog>

    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center align-center pa-8">
      <LoadingSpinner size="large" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// التحقق من الصلاحيات
// TODO: إضافة التحقق من صلاحيات super-admin

// State
const loading = ref(true)
const viewMode = ref('grid')

// Filters
const filters = ref({
  search: '',
  status: null,
  industry: null
})

// Stats
const stats = ref({
  activeBrands: 12,
  pendingBrands: 3,
  totalProjects: 47
})

// Brands data (mock data for now)
const brands = ref([
  {
    id: 1,
    name: 'شركة الابتكار التقني',
    logo: null,
    industry: 'التكنولوجيا',
    description: 'شركة رائدة في حلول التكنولوجيا المالية',
    website: 'https://innovation-tech.com',
    status: 'active',
    coordinator: {
      id: 1,
      name: 'أحمد محمد',
      email: 'ahmed@example.com'
    },
    createdAt: '2024-01-15',
    projectsCount: 12
  },
  {
    id: 2,
    name: 'مجموعة الرؤية الذهبية',
    logo: null,
    industry: 'العقارات',
    description: 'تطوير وإدارة المشاريع العقارية الفاخرة',
    website: 'https://golden-vision.com',
    status: 'pending',
    coordinator: null,
    createdAt: '2024-02-20',
    projectsCount: 5
  }
])

// Dialog state
const brandDialog = ref({
  show: false,
  isEdit: false,
  valid: false,
  loading: false,
  form: {
    name: '',
    industry: '',
    description: '',
    website: '',
    coordinatorId: null
  }
})

// Options
const statusOptions = [
  { title: 'نشط', value: 'active' },
  { title: 'قيد المراجعة', value: 'pending' },
  { title: 'موقوف', value: 'suspended' }
]

const industryOptions = [
  'التكنولوجيا',
  'العقارات',
  'الطعام والمشروبات',
  'الأزياء والجمال',
  'السيارات',
  'الصحة والعافية',
  'التعليم',
  'المالية والمصرفية'
]

const coordinators = ref([
  { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com' },
  { id: 2, name: 'فاطمة علي', email: 'fatima@example.com' }
])

// Validation rules
const rules = {
  required: (value: any) => !!value || 'هذا الحقل مطلوب'
}

// Table headers
const tableHeaders = [
  { title: 'الشعار', key: 'logo', sortable: false },
  { title: 'اسم البراند', key: 'name' },
  { title: 'الحالة', key: 'status' },
  { title: 'منسق البراند', key: 'coordinator', sortable: false },
  { title: 'تاريخ الإنشاء', key: 'createdAt' },
  { title: 'الإجراءات', key: 'actions', sortable: false }
]

// Computed
const filteredBrands = computed(() => {
  let filtered = brands.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(brand =>
      brand.name.toLowerCase().includes(search) ||
      brand.industry.toLowerCase().includes(search)
    )
  }

  if (filters.value.status) {
    filtered = filtered.filter(brand => brand.status === filters.value.status)
  }

  if (filters.value.industry) {
    filtered = filtered.filter(brand => brand.industry === filters.value.industry)
  }

  return filtered
})

// Methods
const openAddBrandDialog = () => {
  brandDialog.value.show = true
  brandDialog.value.isEdit = false
  resetBrandForm()
}

const editBrand = (brand: any) => {
  brandDialog.value.show = true
  brandDialog.value.isEdit = true
  brandDialog.value.form = { ...brand }
}

const closeBrandDialog = () => {
  brandDialog.value.show = false
  resetBrandForm()
}

const resetBrandForm = () => {
  brandDialog.value.form = {
    name: '',
    industry: '',
    description: '',
    website: '',
    coordinatorId: null
  }
  brandDialog.value.valid = false
}

const saveBrand = async () => {
  brandDialog.value.loading = true
  
  try {
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Saving brand:', brandDialog.value.form)
    closeBrandDialog()
    
    // Refresh data
    loadBrands()
  } catch (error) {
    console.error('Error saving brand:', error)
  } finally {
    brandDialog.value.loading = false
  }
}

const deleteBrand = async (brand: any) => {
  if (confirm(`هل أنت متأكد من حذف براند "${brand.name}"؟`)) {
    try {
      // TODO: Implement API call
      console.log('Deleting brand:', brand.id)
      loadBrands()
    } catch (error) {
      console.error('Error deleting brand:', error)
    }
  }
}

const viewBrandDetails = (brand: any) => {
  // TODO: Navigate to brand details page
  console.log('Viewing brand details:', brand.id)
}

const resetFilters = () => {
  filters.value = {
    search: '',
    status: null,
    industry: null
  }
}

const loadBrands = async () => {
  loading.value = true
  
  try {
    // TODO: Implement API call to load brands
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Mock data is already in brands.value
    console.log('Brands loaded successfully')
  } catch (error) {
    console.error('Error loading brands:', error)
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'pending': return 'warning'
    case 'suspended': return 'error'
    default: return 'grey'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'نشط'
    case 'pending': return 'قيد المراجعة'
    case 'suspended': return 'موقوف'
    default: return 'غير محدد'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ar-SA')
}

// Lifecycle
onMounted(() => {
  loadBrands()
})
</script>

<style scoped lang="scss">
@import '@/styles/design-system/index';

.brands-management {
  .header-card {
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-surface), 1));
  }

  .stats-card {
    transition: transform var(--transition-normal) var(--easing-ease-out);
    
    &:hover {
      transform: translateY(-2px);
    }
  }

  .brands-grid {
    .brand-card {
      height: 100%;
      transition: all var(--transition-normal) var(--easing-ease-out);
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .brands-table {
    .v-data-table__th {
      background: rgba(var(--v-theme-primary), 0.05);
      font-weight: 600;
    }
  }
}
</style> 