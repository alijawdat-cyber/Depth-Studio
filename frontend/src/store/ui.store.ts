/**
 * 🎨 UI Store - Depth Studio Frontend
 * ==================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إدارة حالة واجهة المستخدم والإعدادات العامة
 * 
 * 🏗️ المكونات:
 * - Sidebar state
 * - Theme management
 * - Language settings
 * - Loading states
 * - Modal management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ======================================
// 🎨 UI State Types
// ======================================

/** موضوع الواجهة */
export type Theme = 'light' | 'dark' | 'system';

/** اللغة */
export type Language = 'ar' | 'en';

/** حالة الـ Sidebar */
export type SidebarState = 'open' | 'closed' | 'collapsed';

/** أنواع الـ Modal */
export type ModalType = 
  | 'user-form'
  | 'campaign-form'
  | 'brand-form'
  | 'image-viewer'
  | 'confirmation'
  | 'settings'
  | null;

/** بيانات الـ Modal */
export interface ModalData {
  id?: string;
  title?: string;
  message?: string;
  data?: unknown;
  onConfirm?: () => void;
  onCancel?: () => void;
}

/** حالة الـ UI */
export interface UIState {
  // 🎨 Theme & Language
  theme: Theme;
  language: Language;
  
  // 📱 Layout
  sidebarState: SidebarState;
  isMobile: boolean;
  
  // 🔄 Loading States
  isLoading: boolean;
  loadingMessage: string;
  globalLoading: Record<string, boolean>;
  
  // 🪟 Modal Management
  activeModal: ModalType;
  modalData: ModalData;
  
  // 🔔 Notifications
  showNotifications: boolean;
  notificationCount: number;
  
  // 📊 Dashboard
  dashboardLayout: 'grid' | 'list';
  compactMode: boolean;
}

/** أفعال الـ UI */
export interface UIActions {
  // 🎨 Theme & Language Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleTheme: () => void;
  
  // 📱 Layout Actions
  setSidebarState: (state: SidebarState) => void;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  setMobile: (isMobile: boolean) => void;
  
  // 🔄 Loading Actions
  setLoading: (loading: boolean, message?: string) => void;
  setGlobalLoading: (key: string, loading: boolean) => void;
  clearAllLoading: () => void;
  
  // 🪟 Modal Actions
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
  
  // 🔔 Notification Actions
  setNotifications: (show: boolean) => void;
  setNotificationCount: (count: number) => void;
  
  // 📊 Dashboard Actions
  setDashboardLayout: (layout: 'grid' | 'list') => void;
  toggleCompactMode: () => void;
  
  // 🔄 Reset Actions
  resetUI: () => void;
}

/** حالة الـ UI الافتراضية */
const defaultUIState: UIState = {
  // Theme & Language
  theme: 'system',
  language: 'ar',
  
  // Layout
  sidebarState: 'open',
  isMobile: false,
  
  // Loading
  isLoading: false,
  loadingMessage: '',
  globalLoading: {},
  
  // Modal
  activeModal: null,
  modalData: {},
  
  // Notifications
  showNotifications: false,
  notificationCount: 0,
  
  // Dashboard
  dashboardLayout: 'grid',
  compactMode: false,
};

// ======================================
// 🏪 UI Store
// ======================================

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      ...defaultUIState,

      // 🎨 Theme & Language Actions
      // eslint-disable-next-line no-unused-vars
      setTheme: (theme: Theme) => {
        console.log('🎨 تغيير الموضوع إلى:', theme);
        set({ theme });
        
        // تطبيق الموضوع على الـ HTML
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          if (theme === 'dark') {
            root.classList.add('dark');
          } else if (theme === 'light') {
            root.classList.remove('dark');
          } else {
            // System theme detection
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.classList.toggle('dark', isDark);
          }
        }
      },

      // eslint-disable-next-line no-unused-vars
      setLanguage: (language: Language) => {
        console.log('🌍 تغيير اللغة إلى:', language);
        set({ language });
        
        // تطبيق اتجاه النص
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.dir = language === 'ar' ? 'rtl' : 'ltr';
          root.lang = language;
        }
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      // 📱 Layout Actions
      // eslint-disable-next-line no-unused-vars
      setSidebarState: (state: SidebarState) => {
        console.log('📱 تغيير حالة الـ Sidebar إلى:', state);
        set({ sidebarState: state });
      },

      toggleSidebar: () => {
        const { sidebarState } = get();
        const newState: SidebarState = sidebarState === 'open' ? 'closed' : 'open';
        get().setSidebarState(newState);
      },

      collapseSidebar: () => {
        get().setSidebarState('collapsed');
      },

      // eslint-disable-next-line no-unused-vars
      setMobile: (isMobile: boolean) => {
        set({ isMobile });
        
        // إذا أصبحت الشاشة صغيرة، أغلق الـ Sidebar
        if (isMobile && get().sidebarState === 'open') {
          get().setSidebarState('closed');
        }
      },

      // 🔄 Loading Actions
      // eslint-disable-next-line no-unused-vars
      setLoading: (loading: boolean, message = '') => {
        console.log('🔄 تغيير حالة التحميل:', loading, message);
        set({ 
          isLoading: loading,
          loadingMessage: loading ? message : ''
        });
      },

      // eslint-disable-next-line no-unused-vars
      setGlobalLoading: (key: string, loading: boolean) => {
        const { globalLoading } = get();
        const newGlobalLoading = { ...globalLoading };
        
        if (loading) {
          newGlobalLoading[key] = true;
        } else {
          delete newGlobalLoading[key];
        }
        
        set({ globalLoading: newGlobalLoading });
      },

      clearAllLoading: () => {
        console.log('🧹 مسح جميع حالات التحميل');
        set({ 
          isLoading: false,
          loadingMessage: '',
          globalLoading: {}
        });
      },

      // 🪟 Modal Actions
      // eslint-disable-next-line no-unused-vars
      openModal: (type: ModalType, data: ModalData = {}) => {
        console.log('🪟 فتح Modal:', type, data);
        set({ 
          activeModal: type,
          modalData: data
        });
      },

      closeModal: () => {
        console.log('🪟 إغلاق Modal');
        set({ 
          activeModal: null,
          modalData: {}
        });
      },

      // 🔔 Notification Actions
      // eslint-disable-next-line no-unused-vars
      setNotifications: (show: boolean) => {
        set({ showNotifications: show });
      },

      // eslint-disable-next-line no-unused-vars
      setNotificationCount: (count: number) => {
        set({ notificationCount: count });
      },

      // 📊 Dashboard Actions
      // eslint-disable-next-line no-unused-vars
      setDashboardLayout: (layout: 'grid' | 'list') => {
        console.log('📊 تغيير تخطيط الـ Dashboard إلى:', layout);
        set({ dashboardLayout: layout });
      },

      toggleCompactMode: () => {
        const { compactMode } = get();
        console.log('📦 تبديل الوضع المضغوط:', !compactMode);
        set({ compactMode: !compactMode });
      },

      // 🔄 Reset Actions
      resetUI: () => {
        console.log('🔄 إعادة تعيين حالة الـ UI');
        set(defaultUIState);
      },
    }),
    {
      name: 'depth-studio-ui',
      partialize: (state) => ({
        // حفظ الإعدادات المهمة فقط
        theme: state.theme,
        language: state.language,
        sidebarState: state.sidebarState,
        dashboardLayout: state.dashboardLayout,
        compactMode: state.compactMode,
      }),
    }
  )
);

// ======================================
// 🎯 Helper Hooks
// ======================================

/** خطاف للحصول على إعدادات الموضوع واللغة */
export const useThemeAndLanguage = () => {
  const theme = useUIStore((state) => state.theme);
  const language = useUIStore((state) => state.language);
  const setTheme = useUIStore((state) => state.setTheme);
  const setLanguage = useUIStore((state) => state.setLanguage);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  return {
    theme,
    language,
    setTheme,
    setLanguage,
    toggleTheme,
  };
};

/** خطاف لإدارة الـ Sidebar */
export const useSidebar = () => {
  const sidebarState = useUIStore((state) => state.sidebarState);
  const isMobile = useUIStore((state) => state.isMobile);
  const setSidebarState = useUIStore((state) => state.setSidebarState);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const collapseSidebar = useUIStore((state) => state.collapseSidebar);

  return {
    sidebarState,
    isMobile,
    isOpen: sidebarState === 'open',
    isCollapsed: sidebarState === 'collapsed',
    isClosed: sidebarState === 'closed',
    setSidebarState,
    toggleSidebar,
    collapseSidebar,
  };
};

/** خطاف لإدارة حالات التحميل */
export const useLoading = () => {
  const isLoading = useUIStore((state) => state.isLoading);
  const loadingMessage = useUIStore((state) => state.loadingMessage);
  const globalLoading = useUIStore((state) => state.globalLoading);
  const setLoading = useUIStore((state) => state.setLoading);
  const setGlobalLoading = useUIStore((state) => state.setGlobalLoading);
  const clearAllLoading = useUIStore((state) => state.clearAllLoading);

  const isAnyLoading = isLoading || Object.keys(globalLoading).length > 0;

  return {
    isLoading,
    loadingMessage,
    globalLoading,
    isAnyLoading,
    setLoading,
    setGlobalLoading,
    clearAllLoading,
  };
};

/** خطاف لإدارة الـ Modals */
export const useModal = () => {
  const activeModal = useUIStore((state) => state.activeModal);
  const modalData = useUIStore((state) => state.modalData);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);

  return {
    activeModal,
    modalData,
    isModalOpen: activeModal !== null,
    openModal,
    closeModal,
  };
};

export default useUIStore; 