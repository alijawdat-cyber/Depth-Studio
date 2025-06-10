/**
 * 📊 Data Store - Depth Studio Frontend
 * ====================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: إدارة بيانات التطبيق مع ربط الخدمات
 * 
 * 🏗️ المكونات:
 * - Users data management
 * - Caching mechanism
 * - Sync with services
 * - Pagination handling
 */

import { create } from 'zustand';
import { User, UserRole, UserStatus } from '@depth-studio/types';
import { userService, UserSearchFilters, UserListResponse, UserStats } from '../services/user.service';

// ======================================
// 📊 Data State Types
// ======================================

/** حالة قائمة المستخدمين - موسعة من UserListResponse */
export interface UsersListState extends UserListResponse {
  limit: number;
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

/** إحصائيات المستخدمين */
export interface UsersStatsState {
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

/** البحث في المستخدمين */
export interface UsersSearchState {
  filters: UserSearchFilters;
  results: User[];
  isSearching: boolean;
  error: string | null;
}

/** حالة البيانات */
export interface DataState {
  // 👥 Users Management
  usersList: UsersListState;
  usersStats: UsersStatsState;
  usersSearch: UsersSearchState;
  
  // 📋 Selected Items
  selectedUsers: string[];
  
  // 🔄 Cache Management
  lastGlobalRefresh: Date | null;
  cacheExpiry: number; // بالدقائق
}

/** أفعال البيانات */
export interface DataActions {
  // 🔍 Filter Actions
  filterUsersByRole: (role: UserRole) => User[];
  filterUsersByStatus: (status: UserStatus) => User[];
  
  // 👥 Users Actions
  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  refreshUsers: () => Promise<void>;
  searchUsers: (filters: UserSearchFilters) => Promise<void>;
  clearSearch: () => void;
  
  // 📊 Stats Actions
  fetchUsersStats: () => Promise<void>;
  refreshUsersStats: () => Promise<void>;
  
  // 📋 Selection Actions
  selectUser: (userId: string) => void;
  selectUsers: (userIds: string[]) => void;
  deselectUser: (userId: string) => void;
  clearSelection: () => void;
  toggleUserSelection: (userId: string) => void;
  selectAllUsers: () => void;
  
  // 👤 Individual User Actions
  addUser: (user: User) => void;
  updateUser: (userId: string, updatedUser: Partial<User>) => void;
  removeUser: (userId: string) => void;
  
  // 🔄 Cache Actions
  clearCache: () => void;
  isDataStale: (lastFetch: Date | null) => boolean;
  refreshAllData: () => Promise<void>;
  
  // 🧹 Reset Actions
  resetDataStore: () => void;
}

/** حالة البيانات الافتراضية */
const defaultDataState: DataState = {
  // Users List
  usersList: {
    users: [],
    total: 0,
    page: 1,
    totalPages: 0,
    limit: 10,
    isLoading: false,
    error: null,
    lastFetch: null,
  },
  
  // Users Stats
  usersStats: {
    stats: null,
    isLoading: false,
    error: null,
    lastFetch: null,
  },
  
  // Users Search
  usersSearch: {
    filters: {},
    results: [],
    isSearching: false,
    error: null,
  },
  
  // Selection
  selectedUsers: [],
  
  // Cache
  lastGlobalRefresh: null,
  cacheExpiry: 5, // 5 دقائق
};

// ======================================
// 🏪 Data Store
// ======================================

export const useDataStore = create<DataState & DataActions>()((set, get) => ({
  ...defaultDataState,

  // 🔍 Filter helpers using enums
  // eslint-disable-next-line no-unused-vars
  filterUsersByRole: (role: UserRole) => {
    const { usersList } = get();
    return usersList.users.filter(user => user.role === role);
  },

  // eslint-disable-next-line no-unused-vars
  filterUsersByStatus: (status: UserStatus) => {
    const { usersList } = get();
    return usersList.users.filter(user => user.status === status);
  },

  // 👥 Users Actions
  // eslint-disable-next-line no-unused-vars
  fetchUsers: async (page = 1, limit = 10) => {
    const state = get();
    
    // تحقق من الـ Cache
    if (state.usersList.lastFetch && !state.isDataStale(state.usersList.lastFetch)) {
      console.log('📋 استخدام البيانات المحفوظة للمستخدمين');
      return;
    }

    set((state) => ({
      usersList: { ...state.usersList, isLoading: true, error: null }
    }));

    try {
      console.log('📋 جاري جلب قائمة المستخدمين...', { page, limit });
      
      const response = await userService.getUsers(page, limit);
      
      if (response.success && response.data) {
        set((state) => ({
          usersList: {
            ...state.usersList,
            ...response.data!, // استخدام UserListResponse مباشرة - type-safe
            limit,
            isLoading: false,
            error: null,
            lastFetch: new Date(),
          }
        }));
        
        console.log('✅ تم جلب المستخدمين بنجاح:', response.data.users.length);
      } else {
        throw new Error(response.message || 'فشل في جلب المستخدمين');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير متوقع';
      
      set((state) => ({
        usersList: {
          ...state.usersList,
          isLoading: false,
          error: errorMessage,
        }
      }));
      
      console.error('🚨 خطأ في جلب المستخدمين:', errorMessage);
    }
  },

  refreshUsers: async () => {
    const { usersList } = get();
    
    // فرض التحديث بتجاهل الـ Cache
    set((state) => ({
      usersList: { ...state.usersList, lastFetch: null }
    }));
    
    await get().fetchUsers(usersList.page, usersList.limit);
  },

  // eslint-disable-next-line no-unused-vars
  searchUsers: async (filters: UserSearchFilters) => {
    set((state) => ({
      usersSearch: { 
        ...state.usersSearch, 
        filters,
        isSearching: true, 
        error: null 
      }
    }));

    try {
      console.log('🔍 جاري البحث في المستخدمين...', filters);
      
      const response = await userService.searchUsers(filters);
      
      if (response.success && response.data) {
        set((state) => ({
          usersSearch: {
            ...state.usersSearch,
            results: response.data!.users,
            isSearching: false,
            error: null,
          }
        }));
        
        console.log('✅ تم البحث بنجاح:', response.data.users.length, 'نتيجة');
      } else {
        throw new Error(response.message || 'فشل في البحث');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ في البحث';
      
      set((state) => ({
        usersSearch: {
          ...state.usersSearch,
          isSearching: false,
          error: errorMessage,
        }
      }));
      
      console.error('🚨 خطأ في البحث:', errorMessage);
    }
  },

  clearSearch: () => {
    set((state) => ({
      usersSearch: {
        filters: {},
        results: [],
        isSearching: false,
        error: null,
      }
    }));
  },

  // 📊 Stats Actions
  fetchUsersStats: async () => {
    const state = get();
    
    // تحقق من الـ Cache
    if (state.usersStats.lastFetch && !state.isDataStale(state.usersStats.lastFetch)) {
      console.log('📊 استخدام الإحصائيات المحفوظة');
      return;
    }

    set((state) => ({
      usersStats: { ...state.usersStats, isLoading: true, error: null }
    }));

    try {
      console.log('📊 جاري جلب إحصائيات المستخدمين...');
      
      const response = await userService.getUserStats();
      
      if (response.success && response.data) {
        set((state) => ({
          usersStats: {
            ...state.usersStats,
            stats: response.data!.stats,
            isLoading: false,
            error: null,
            lastFetch: new Date(),
          }
        }));
        
        console.log('✅ تم جلب الإحصائيات بنجاح');
      } else {
        throw new Error(response.message || 'فشل في جلب الإحصائيات');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ في جلب الإحصائيات';
      
      set((state) => ({
        usersStats: {
          ...state.usersStats,
          isLoading: false,
          error: errorMessage,
        }
      }));
      
      console.error('🚨 خطأ في جلب الإحصائيات:', errorMessage);
    }
  },

  refreshUsersStats: async () => {
    // فرض التحديث بتجاهل الـ Cache
    set((state) => ({
      usersStats: { ...state.usersStats, lastFetch: null }
    }));
    
    await get().fetchUsersStats();
  },

  // 📋 Selection Actions
  // eslint-disable-next-line no-unused-vars
  selectUser: (userId: string) => {
    set((state) => ({
      selectedUsers: [...state.selectedUsers.filter(id => id !== userId), userId]
    }));
  },

  // eslint-disable-next-line no-unused-vars
  selectUsers: (userIds: string[]) => {
    set({ selectedUsers: userIds });
  },

  // eslint-disable-next-line no-unused-vars
  deselectUser: (userId: string) => {
    set((state) => ({
      selectedUsers: state.selectedUsers.filter(id => id !== userId)
    }));
  },

  clearSelection: () => {
    set({ selectedUsers: [] });
  },

  // eslint-disable-next-line no-unused-vars
  toggleUserSelection: (userId: string) => {
    const { selectedUsers } = get();
    
    if (selectedUsers.includes(userId)) {
      get().deselectUser(userId);
    } else {
      get().selectUser(userId);
    }
  },

  selectAllUsers: () => {
    const { usersList } = get();
    const allUserIds = usersList.users.map(user => user.id);
    set({ selectedUsers: allUserIds });
  },

  // 👤 Individual User Actions
  // eslint-disable-next-line no-unused-vars
  addUser: (user: User) => {
    set((state) => ({
      usersList: {
        ...state.usersList,
        users: [user, ...state.usersList.users],
        total: state.usersList.total + 1,
      }
    }));
    
    console.log('➕ تم إضافة مستخدم جديد:', user.full_name);
  },

  // eslint-disable-next-line no-unused-vars
  updateUser: (userId: string, updatedUser: Partial<User>) => {
    set((state) => ({
      usersList: {
        ...state.usersList,
        users: state.usersList.users.map(user =>
          user.id === userId ? { ...user, ...updatedUser } : user
        )
      }
    }));
    
    console.log('✏️ تم تحديث بيانات المستخدم:', userId);
  },

  // eslint-disable-next-line no-unused-vars
  removeUser: (userId: string) => {
    set((state) => ({
      usersList: {
        ...state.usersList,
        users: state.usersList.users.filter(user => user.id !== userId),
        total: Math.max(0, state.usersList.total - 1),
      },
      selectedUsers: state.selectedUsers.filter(id => id !== userId)
    }));
    
    console.log('❌ تم حذف المستخدم:', userId);
  },

  // 🔄 Cache Actions
  clearCache: () => {
    set((state) => ({
      usersList: { ...state.usersList, lastFetch: null },
      usersStats: { ...state.usersStats, lastFetch: null },
      lastGlobalRefresh: null,
    }));
    
    console.log('🧹 تم مسح الـ Cache');
  },

  // eslint-disable-next-line no-unused-vars
  isDataStale: (lastFetch: Date | null) => {
    if (!lastFetch) return true;
    
    const { cacheExpiry } = get();
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastFetch.getTime()) / (1000 * 60);
    
    return diffInMinutes > cacheExpiry;
  },

  refreshAllData: async () => {
    console.log('🔄 تحديث جميع البيانات...');
    
    get().clearCache();
    
    const promises = [
      get().fetchUsers(),
      get().fetchUsersStats(),
    ];
    
    try {
      await Promise.all(promises);
      
      set({ lastGlobalRefresh: new Date() });
      console.log('✅ تم تحديث جميع البيانات بنجاح');
    } catch (error) {
      console.error('🚨 خطأ في تحديث البيانات:', error);
    }
  },

  // 🧹 Reset Actions
  resetDataStore: () => {
    console.log('🔄 إعادة تعيين متجر البيانات');
    set(defaultDataState);
  },
}));

// ======================================
// 🎯 Helper Hooks
// ======================================

/** خطاف لإدارة قائمة المستخدمين */
export const useUsersList = () => {
  const usersList = useDataStore((state) => state.usersList);
  const selectedUsers = useDataStore((state) => state.selectedUsers);
  const fetchUsers = useDataStore((state) => state.fetchUsers);
  const refreshUsers = useDataStore((state) => state.refreshUsers);
  const isDataStale = useDataStore((state) => state.isDataStale);
  
  // Filter actions
  const filterUsersByRole = useDataStore((state) => state.filterUsersByRole);
  const filterUsersByStatus = useDataStore((state) => state.filterUsersByStatus);
  
  // Selection actions
  const selectUser = useDataStore((state) => state.selectUser);
  const selectUsers = useDataStore((state) => state.selectUsers);
  const deselectUser = useDataStore((state) => state.deselectUser);
  const clearSelection = useDataStore((state) => state.clearSelection);
  const toggleUserSelection = useDataStore((state) => state.toggleUserSelection);
  const selectAllUsers = useDataStore((state) => state.selectAllUsers);

  // Calculate pagination info
  const { page, limit, total } = usersList;
  const hasNextPage = page * limit < total;
  const hasPrevPage = page > 1;

  return {
    ...usersList,
    selectedUsers,
    selectedCount: selectedUsers.length,
    hasSelection: selectedUsers.length > 0,
    isAllSelected: selectedUsers.length === usersList.users.length && usersList.users.length > 0,
    isStale: isDataStale(usersList.lastFetch),
    hasNextPage,
    hasPrevPage,
    
    // Actions
    fetchUsers,
    refreshUsers,
    selectUser,
    selectUsers,
    deselectUser,
    clearSelection,
    toggleUserSelection,
    selectAllUsers,
    filterUsersByRole,
    filterUsersByStatus,
  };
};

/** خطاف لإدارة البحث في المستخدمين */
export const useUsersSearch = () => {
  const usersSearch = useDataStore((state) => state.usersSearch);
  const searchUsers = useDataStore((state) => state.searchUsers);
  const clearSearch = useDataStore((state) => state.clearSearch);

  return {
    ...usersSearch,
    hasResults: usersSearch.results.length > 0,
    hasFilters: Object.keys(usersSearch.filters).length > 0,
    
    // Actions
    searchUsers,
    clearSearch,
  };
};

/** خطاف لإدارة إحصائيات المستخدمين */
export const useUsersStats = () => {
  const usersStats = useDataStore((state) => state.usersStats);
  const fetchUsersStats = useDataStore((state) => state.fetchUsersStats);
  const refreshUsersStats = useDataStore((state) => state.refreshUsersStats);

  return {
    ...usersStats,
    hasStats: usersStats.stats !== null,
    
    // Actions
    fetchUsersStats,
    refreshUsersStats,
  };
};

export default useDataStore; 