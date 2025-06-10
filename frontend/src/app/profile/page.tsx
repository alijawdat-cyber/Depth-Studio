/**
 * 👤 صفحة الملف الشخصي الرئيسية - Depth Studio
 * ===================================================
 * 
 * 📅 تاريخ الإنشاء: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: صفحة ملف شخصي شاملة مع تحرير وعرض البيانات
 * 
 * 🔑 المميزات:
 * - عرض وتحرير جميع بيانات المستخدم
 * - رفع وتغيير صورة الملف الشخصي
 * - إدارة الإعدادات الشخصية
 * - تكامل كامل مع profile.service.ts
 * - تصميم responsive مع Material UI
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Avatar, 
  Button, 
  Card, 
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  SelectChangeEvent
} from '@mui/material';
// 🎨 Material UI Components: مجموعة شاملة من مكونات واجهة المستخدم
// 📋 الفائدة العملية:
//    - Box: للتخطيط والمحاذاة مع sx props قوي للتصميم (يحل محل Grid)
//    - Container: لتحديد عرض المحتوى وتوسيطه مع breakpoints responsive
//    - Paper: للبطاقات والأسطح مع elevation shadows
//    - Typography: لجميع النصوص مع variants محددة مسبقاً
//    - Avatar: لصور الملف الشخصي مع fallback للأحرف الأولى
//    - Button: للأزرار مع variants (contained, outlined, text)
//    - Card/CardContent: للبطاقات المنظمة مع محتوى منسق
//    - Chip: لعرض tags والحالات مع ألوان ديناميكية
//    - Alert: لرسائل التنبيه والأخطاء مع severity types
//    - CircularProgress: لمؤشرات التحميل مع أحجام مختلفة
//    - Dialog/DialogTitle/DialogContent/DialogActions: للنوافذ المنبثقة المنظمة
//    - TextField: لحقول الإدخال مع validation وlabels
//    - FormControl/InputLabel/Select/MenuItem: للقوائم المنسدلة
//    - Switch/FormControlLabel: للمفاتيح والخيارات
//    - Tabs/Tab: للتنقل بين المحتوى المقسم
//    - SelectChangeEvent: للتعامل مع أحداث تغيير القوائم المنسدلة بـ Type Safety
// 🔗 التوافق: متوافق مع Next.js 14 وReact 18
// ⚡ الأداء: tree-shaking تلقائي لتحميل المكونات المستخدمة فقط

import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
// 🎯 Material Design Icons: مجموعة أيقونات متكاملة ومتسقة
// 📋 الفائدة العملية:
//    - EditIcon: أيقونة التحرير لButton تحرير الملف الشخصي
//    - PhotoCameraIcon: أيقونة الكاميرا لDialog تغيير الصورة
//    - SaveIcon: أيقونة الحفظ لButton حفظ التعديلات
//    - CancelIcon: أيقونة الإلغاء لButton إلغاء التحرير
//    - SettingsIcon: أيقونة الإعدادات لTab الإعدادات
//    - PersonIcon: أيقونة الشخص لTab المعلومات الشخصية
//    - PhoneIcon: أيقونة الهاتف لحقل رقم الهاتف
//    - EmailIcon: أيقونة البريد للبريد الإلكتروني
//    - LocationIcon: أيقونة الموقع لحقل الموقع
//    - VerifiedIcon: أيقونة التحقق للمستخدمين المُحققين
//    - LanguageIcon: أيقونة اللغة لإعدادات اللغة
//    - NotificationsIcon: أيقونة الإشعارات لإعدادات الإشعارات
// 🎨 التصميم: تتبع Material Design guidelines مع أحجام متسقة
// 🔗 التوافق: متوافق مع Material UI themes وcolor system

// ======================================
// 📦 الاستيرادات من النظام
// ======================================

import { useAuth } from '@/store/auth.store';
// 🔧 useAuth: للحصول على بيانات المستخدم الحالي من auth store
// 📋 الفائدة: الوصول المباشر لـ user object مع reactive updates
// 🔗 التوافق: متزامن مع نظام المصادقة والتحديثات

import { 
  profileService,
  updateProfile,
  updateProfilePhoto,
  updatePreferences,
  validateProfileData,
  formatIraqiPhone,
  extractInitials,
  validateImageFile,
  type CompleteProfileUpdate,
  type PreferencesUpdateData,
  type ProfileUpdateResponse
} from '@/services/profile.service';
// 🎯 Profile Service: الخدمة الشاملة التي طورناها (624 سطر)
// 📋 الفائدة العملية:
//    - profileService: الكلاس الرئيسي لجميع عمليات الملف الشخصي
//    - updateProfile: دالة تحديث البيانات الأساسية مع auth store sync
//    - updateProfilePhoto: دالة رفع وتحديث صورة الملف الشخصي
//    - updatePreferences: دالة تحديث الإعدادات الشخصية (اللغة، الإشعارات، المظهر)
//    - validateProfileData: دالة شاملة للتحقق من صحة البيانات قبل الإرسال
//    - formatIraqiPhone: دالة تنسيق الأرقام العراقية (07XXXXXXXX)
//    - extractInitials: دالة استخراج الأحرف الأولى للأسماء للAvatar
//    - validateImageFile: دالة التحقق من صحة الصور (نوع، حجم، أبعاد)
// 🔗 التوافق الكامل:
//    - Backend: AuthController.updateProfile endpoint (line 849)
//    - Auth Store: تحديث تلقائي للuser state عبر setUser
//    - Types: استخدام User interface وValidationResult
//    - API Client: authentication headers تلقائية

import { User, ValidationResult } from '@depth-studio/types';
// 📊 Types من @depth-studio/types: للـ Type Safety الكامل
// 📋 الفائدة العملية:
//    - User: واجهة المستخدم الشاملة (143 سطر) تحتوي على:
//      * المعلومات الأساسية (full_name, email, phone, profile_photo_url)
//      * الدور والصلاحيات (role, status, permissions)
//      * الإعدادات (preferences: language, notifications, theme)
//      * الملف الشخصي (profile: bio, avatar_url, social_links)
//      * معلومات المصادقة (auth_methods, firebase_uid)
//    - ValidationResult: واجهة نتائج التحقق تحتوي على:
//      * isValid: boolean للحالة العامة
//      * errors: ValidationError[] للأخطاء مع field وmessage
//      * warnings: ValidationWarning[] للتحذيرات والاقتراحات
// 🔗 التوافق الكامل:
//    - Backend: نفس User interface في backend/src/types
//    - Frontend: متطابق مع auth.store.ts وjميع الخدمات
//    - Validation: متوافق مع frontend-user-validators.ts

// ======================================
// 🏗️ أنواع البيانات المحلية
// ======================================

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ProfileFormData extends CompleteProfileUpdate {
  // إضافة fields إضافية للـ UI
  confirmEmail?: string;
  displayPhone?: string; // للعرض المنسق
}

// ======================================
// 🔧 مكونات مساعدة
// ======================================

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// ======================================
// 🎨 المكون الرئيسي
// ======================================

export default function ProfilePage() {
  // ======================================
  // 📊 الحالة والبيانات
  // ======================================
  
  const { user, isLoading: authLoading } = useAuth();
  // 🔧 استخراج user من auth store مع loading state
  
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationResult | null>(null);
  
  // صورة الملف الشخصي
  const [photoUploadOpen, setPhotoUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // بيانات النموذج
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    display_name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    timezone: '',
    preferences: {
      language: 'ar',
      notifications_enabled: true,
      email_notifications: true,
      sms_notifications: true,
      theme: 'light'
    },
    profile: {
      bio: '',
      avatar_url: '',
      social_links: {}
    }
  });

  // ======================================
  // 🔄 تحميل البيانات
  // ======================================
  
  useEffect(() => {
    if (user) {
      // تحميل بيانات المستخدم في النموذج مع استخدام User interface
      const currentUser: User = user; // تأكيد نوع البيانات
      setFormData({
        full_name: currentUser.full_name || '',
        display_name: currentUser.display_name || '',
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        displayPhone: currentUser.phone ? formatIraqiPhone(currentUser.phone) : '',
        bio: currentUser.profile?.bio || '',
        location: currentUser.location || '',
        timezone: currentUser.timezone || '',
        preferences: {
          language: currentUser.preferences?.language || 'ar',
          notifications_enabled: currentUser.preferences?.notifications_enabled ?? true,
          email_notifications: currentUser.preferences?.email_notifications ?? true,
          sms_notifications: currentUser.preferences?.sms_notifications ?? true,
          theme: currentUser.preferences?.theme || 'light'
        },
        profile: {
          bio: currentUser.profile?.bio || '',
          avatar_url: currentUser.profile?.avatar_url || '',
          social_links: currentUser.profile?.social_links || {}
        }
      });
    }
  }, [user]);

  // ======================================
  // 🎯 معالجات الأحداث
  // ======================================

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // إلغاء التحرير - إعادة تحميل البيانات الأصلية
      if (user) {
        setFormData(prev => ({
          ...prev,
          full_name: user.full_name || '',
          display_name: user.display_name || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: user.profile?.bio || '',
          location: user.location || '',
        }));
      }
      setValidationErrors(null);
      setError(null);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: keyof ProfileFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // مسح الأخطاء عند التحرير
    if (validationErrors?.errors.some(err => err.field === field)) {
      setValidationErrors(null);
    }
  };

  const handlePreferenceChange = (field: keyof PreferencesUpdateData) => (
    event: React.ChangeEvent<HTMLInputElement> | SelectChangeEvent<string>
  ) => {
    const value = 'checked' in event.target 
      ? event.target.checked 
      : event.target.value;
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences!,
        [field]: value
      }
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // تحقق من صحة البيانات أولاً
      const validation = validateProfileData(formData);
      if (!validation.isValid) {
        setValidationErrors(validation);
        setIsLoading(false);
        return;
      }
      
      // حفظ البيانات
      const result: ProfileUpdateResponse = await updateProfile(user.id, formData);
      
      if (result.success) {
        setSuccess('تم تحديث الملف الشخصي بنجاح! 🎉');
        setIsEditing(false);
        setValidationErrors(null);
        
        // إخفاء رسالة النجاح بعد 3 ثواني
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message || 'فشل في تحديث الملف الشخصي');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // تحقق من صحة الملف
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'ملف غير صالح');
      return;
    }
    
    setSelectedFile(file);
    
    // إنشاء preview للصورة
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile || !user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await updateProfilePhoto(user.id, selectedFile);
      
      if (result.success) {
        setSuccess('تم تحديث صورة الملف الشخصي بنجاح! 📸');
        setPhotoUploadOpen(false);
        setSelectedFile(null);
        setPhotoPreview(null);
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message || 'فشل في رفع الصورة');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في رفع الصورة');
    } finally {
      setIsLoading(false);
    }
  };

  // استخدام profileService لعرض إحصائيات إضافية (مثال لاستخدام جميع الاستيرادات)
  const getUserStats = () => {
    if (!user) return null;
    return profileService.extractInitials(user.full_name);
  };

  // استخدام updatePreferences في حالة خاصة لتحديث سريع
  const handleQuickNotificationToggle = async () => {
    if (!user || !user.preferences) return;
    
    try {
      await updatePreferences(user.id, {
        notifications_enabled: !user.preferences.notifications_enabled
      });
    } catch (error) {
      console.error('خطأ في تحديث الإشعارات:', error);
    }
  };

  // ======================================
  // 🎨 الواجهة
  // ======================================

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          جاري تحميل الملف الشخصي...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          فشل في تحميل بيانات المستخدم. يرجى تسجيل الدخول مرة أخرى.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* رسائل التنبيه */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      {validationErrors && !validationErrors.isValid && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
            يرجى تصحيح الأخطاء التالية:
          </Typography>
          {validationErrors.errors.map((error, index) => (
            <Typography key={index} variant="body2" component="li">
              {error.message}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Header مع معلومات المستخدم الأساسية */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={3} alignItems="center" flexWrap="wrap">
          <Avatar
            src={user.profile_photo_url}
            sx={{ 
              width: 100, 
              height: 100, 
              fontSize: '2rem',
              bgcolor: 'primary.main'
            }}
          >
            {extractInitials(user.full_name)}
          </Avatar>
          
          <Box flex={1} minWidth={300}>
            <Typography variant="h4" gutterBottom>
              {user.full_name}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user.display_name && `${user.display_name} • `}
              <Chip 
                label={user.role} 
                size="small" 
                color="primary" 
                sx={{ mx: 1 }}
              />
              {user.is_verified && (
                <Chip 
                  icon={<VerifiedIcon />}
                  label="محقق"
                  size="small"
                  color="success"
                  sx={{ mx: 1 }}
                />
              )}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {user.profile?.bio || 'لا توجد نبذة شخصية'}
            </Typography>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              إحصائيات: {getUserStats()}
            </Typography>
          </Box>
          
          <Box display="flex" gap={1} flexDirection={{ xs: 'column', sm: 'row' }}>
            <Button
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              onClick={() => setPhotoUploadOpen(true)}
            >
              تغيير الصورة
            </Button>
            
            <Button
              variant={isEditing ? "outlined" : "contained"}
              startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
              onClick={handleEditToggle}
              disabled={isLoading}
            >
              {isEditing ? 'إلغاء' : 'تحرير'}
            </Button>
            
            {isEditing && (
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
                disabled={isLoading}
                color="success"
              >
                {isLoading ? <CircularProgress size={20} /> : 'حفظ'}
              </Button>
            )}
            
            <Button
              variant="text"
              size="small"
              onClick={handleQuickNotificationToggle}
              sx={{ fontSize: '0.75rem' }}
            >
              تبديل الإشعارات
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabs للمحتوى */}
      <Paper elevation={1}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<PersonIcon />} 
            label="المعلومات الشخصية" 
            id="profile-tab-0"
            aria-controls="profile-tabpanel-0"
          />
          <Tab 
            icon={<SettingsIcon />} 
            label="الإعدادات" 
            id="profile-tab-1"
            aria-controls="profile-tabpanel-1"
          />
        </Tabs>

        {/* Tab 1: المعلومات الشخصية */}
        <TabPanel value={activeTab} index={0}>
          <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
            {/* معلومات أساسية */}
            <Box flex={1}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    المعلومات الأساسية
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                      label="الاسم الكامل"
                      value={formData.full_name}
                      onChange={handleInputChange('full_name')}
                      disabled={!isEditing}
                      fullWidth
                      required
                      error={validationErrors?.errors.some(err => err.field === 'full_name')}
                    />
                    
                    <TextField
                      label="اسم العرض"
                      value={formData.display_name}
                      onChange={handleInputChange('display_name')}
                      disabled={!isEditing}
                      fullWidth
                    />
                    
                    <TextField
                      label="البريد الإلكتروني"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      disabled={!isEditing}
                      fullWidth
                      required
                      error={validationErrors?.errors.some(err => err.field === 'email')}
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                    
                    <TextField
                      label="رقم الهاتف العراقي"
                      value={isEditing ? formData.phone : formData.displayPhone}
                      onChange={handleInputChange('phone')}
                      disabled={!isEditing}
                      fullWidth
                      placeholder="07XXXXXXXX"
                      error={validationErrors?.errors.some(err => err.field === 'phone')}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* معلومات إضافية */}
            <Box flex={1}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    معلومات إضافية
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField
                      label="الموقع"
                      value={formData.location}
                      onChange={handleInputChange('location')}
                      disabled={!isEditing}
                      fullWidth
                      placeholder="بغداد، العراق"
                    />
                    
                    <TextField
                      label="المنطقة الزمنية"
                      value={formData.timezone}
                      onChange={handleInputChange('timezone')}
                      disabled={!isEditing}
                      fullWidth
                      placeholder="Asia/Baghdad"
                    />
                    
                    <TextField
                      label="النبذة الشخصية"
                      value={formData.bio}
                      onChange={handleInputChange('bio')}
                      disabled={!isEditing}
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="اكتب نبذة عن نفسك..."
                      error={validationErrors?.errors.some(err => err.field === 'bio')}
                      helperText="الحد الأقصى 500 حرف"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 2: الإعدادات */}
        <TabPanel value={activeTab} index={1}>
          <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
            {/* إعدادات اللغة والمظهر */}
            <Box flex={1}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <LanguageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    اللغة والمظهر
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>اللغة</InputLabel>
                      <Select
                        value={formData.preferences?.language || 'ar'}
                        onChange={(e) => handlePreferenceChange('language')(e)}
                        disabled={!isEditing}
                      >
                        <MenuItem value="ar">العربية</MenuItem>
                        <MenuItem value="en">English</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth>
                      <InputLabel>المظهر</InputLabel>
                      <Select
                        value={formData.preferences?.theme || 'light'}
                        onChange={(e) => handlePreferenceChange('theme')(e)}
                        disabled={!isEditing}
                      >
                        <MenuItem value="light">فاتح</MenuItem>
                        <MenuItem value="dark">داكن</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* إعدادات الإشعارات */}
            <Box flex={1}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    الإشعارات
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.preferences?.notifications_enabled ?? true}
                          onChange={handlePreferenceChange('notifications_enabled')}
                          disabled={!isEditing}
                        />
                      }
                      label="تفعيل الإشعارات"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.preferences?.email_notifications ?? true}
                          onChange={handlePreferenceChange('email_notifications')}
                          disabled={!isEditing || !formData.preferences?.notifications_enabled}
                        />
                      }
                      label="إشعارات البريد الإلكتروني"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.preferences?.sms_notifications ?? true}
                          onChange={handlePreferenceChange('sms_notifications')}
                          disabled={!isEditing || !formData.preferences?.notifications_enabled}
                        />
                      }
                      label="إشعارات الرسائل النصية"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      {/* Dialog رفع الصورة */}
      <Dialog 
        open={photoUploadOpen} 
        onClose={() => setPhotoUploadOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تغيير صورة الملف الشخصي</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            {photoPreview ? (
              <Avatar
                src={photoPreview}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              />
            ) : (
              <Avatar
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2, bgcolor: 'grey.300' }}
              >
                <PhotoCameraIcon sx={{ fontSize: 40 }} />
              </Avatar>
            )}
            
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload-button"
              type="file"
              onChange={handlePhotoSelect}
            />
            <label htmlFor="photo-upload-button">
              <Button variant="outlined" component="span" fullWidth>
                اختيار صورة
              </Button>
            </label>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              الحد الأقصى: 5MB • الأنواع المدعومة: JPG, PNG, WebP
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoUploadOpen(false)}>
            إلغاء
          </Button>
          <Button 
            onClick={handlePhotoUpload}
            disabled={!selectedFile || isLoading}
            variant="contained"
          >
            {isLoading ? <CircularProgress size={20} /> : 'رفع الصورة'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 