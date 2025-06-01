<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h2 class="mb-4">إعدادات النظام</h2>
        
        <!-- Tabs -->
        <v-tabs v-model="activeTab" class="mb-4">
          <v-tab value="general">الإعدادات العامة</v-tab>
          <v-tab value="security">الأمان</v-tab>
          <v-tab value="backup">النسخ الاحتياطي</v-tab>
        </v-tabs>
        
        <v-window v-model="activeTab">
          <!-- General Settings -->
          <v-window-item value="general">
            <v-card class="pa-6">
              <h3 class="mb-4">الإعدادات العامة</h3>
              
              <v-text-field
                v-model="settings.siteName"
                label="اسم الموقع"
                class="mb-4"
              />
              
              <v-textarea
                v-model="settings.siteDescription"
                label="وصف الموقع"
                rows="3"
                class="mb-4"
              />
              
              <v-switch
                v-model="settings.maintenanceMode"
                label="وضع الصيانة"
                color="warning"
                class="mb-4"
              />
              
              <v-btn color="primary" @click="saveSettings">
                حفظ التغييرات
              </v-btn>
            </v-card>
          </v-window-item>
          
          <!-- Security Settings -->
          <v-window-item value="security">
            <v-card class="pa-6">
              <h3 class="mb-4">إعدادات الأمان</h3>
              
              <v-switch
                v-model="settings.twoFactorAuth"
                label="المصادقة الثنائية"
                color="success"
                class="mb-4"
              />
              
              <v-switch
                v-model="settings.emailVerification"
                label="التحقق من البريد الإلكتروني"
                color="info"
                class="mb-4"
              />
              
              <v-text-field
                v-model="settings.sessionTimeout"
                label="انتهاء الجلسة (بالدقائق)"
                type="number"
                class="mb-4"
              />
              
              <v-btn color="primary" @click="saveSettings">
                حفظ التغييرات
              </v-btn>
            </v-card>
          </v-window-item>
          
          <!-- Backup Settings -->
          <v-window-item value="backup">
            <v-card class="pa-6">
              <h3 class="mb-4">النسخ الاحتياطي</h3>
              
              <v-switch
                v-model="settings.autoBackup"
                label="النسخ الاحتياطي التلقائي"
                color="success"
                class="mb-4"
              />
              
              <v-select
                v-model="settings.backupFrequency"
                :items="backupOptions"
                label="تكرار النسخ الاحتياطي"
                class="mb-4"
              />
              
              <div class="d-flex gap-2 mb-4">
                <v-btn color="primary" @click="createBackup">
                  إنشاء نسخة احتياطية الآن
                </v-btn>
                <v-btn color="secondary" @click="restoreBackup">
                  استعادة من نسخة احتياطية
                </v-btn>
              </div>
              
              <v-btn color="primary" @click="saveSettings">
                حفظ التغييرات
              </v-btn>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const activeTab = ref('general')

const settings = ref({
  siteName: 'Depth Studio',
  siteDescription: 'منصة احترافية لإدارة المشاريع الإبداعية',
  maintenanceMode: false,
  twoFactorAuth: true,
  emailVerification: true,
  sessionTimeout: 30,
  autoBackup: true,
  backupFrequency: 'daily'
})

const backupOptions = [
  { title: 'يومياً', value: 'daily' },
  { title: 'أسبوعياً', value: 'weekly' },
  { title: 'شهرياً', value: 'monthly' }
]

const saveSettings = () => {
  console.log('حفظ الإعدادات:', settings.value)
  // TODO: Implement save to Firestore
}

const createBackup = () => {
  console.log('إنشاء نسخة احتياطية')
  // TODO: Implement backup creation
}

const restoreBackup = () => {
  console.log('استعادة من نسخة احتياطية')
  // TODO: Implement backup restoration
}

onMounted(() => {
  // Load settings from Firestore
  console.log('تحميل الإعدادات')
})
</script> 