/**
 * 🧪 User Service Tests - Depth Studio Frontend
 * =============================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: اختبار شامل لخدمات إدارة المستخدمين
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userService, UserSearchFilters } from '../user.service';
import { apiClient } from '../api/api-client';
import { User, UserRole, UserStatus } from '@depth-studio/types';
import { Timestamp } from 'firebase/firestore';

// Mock الـ API Client
vi.mock('../api/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

// Mock Console methods
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('👥 UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Mock User للاختبارات
  const mockUser: User = {
    id: 'user123',
    email: 'test@depth-studio.com',
    full_name: 'أحمد محمد',
    role: 'photographer' as UserRole,
    status: 'active' as UserStatus,
    is_verified: true,
    auth_methods: [],
    registration_method: 'email',
    phone_verified: false,
    role_selected: true,
    role_selection_history: [],
    google_linked: false,
    permissions: [],
    preferences: {
      language: 'ar',
      notifications_enabled: true,
      email_notifications: true,
      sms_notifications: false,
      theme: 'light'
    },
    profile: {
      bio: '',
      avatar_url: '',
      social_links: {}
    },
    created_at: Timestamp.fromDate(new Date()),
    updated_at: Timestamp.fromDate(new Date()),
    is_active: true
  };

  describe('📋 getUsers', () => {
    it('should fetch users successfully with default pagination', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: {
          users: [mockUser],
          total: 1,
          page: 1,
          totalPages: 1
        },
        message: 'تم جلب المستخدمين بنجاح',
        timestamp: new Date().toISOString()
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      // Act
      const result = await userService.getUsers();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/users/search', {
        params: { page: 1, limit: 10 }
      });
      expect(result).toEqual(mockResponse);
      expect(result.data!.users).toHaveLength(1);
      expect(result.data!.users[0].email).toBe('test@depth-studio.com');
    });

    it('should handle pagination parameters correctly', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        data: {
          users: [],
          total: 0,
          page: 2,
          totalPages: 0
        },
        message: 'تم جلب المستخدمين بنجاح',
        timestamp: new Date().toISOString()
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      // Act
      await userService.getUsers(2, 20);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/users/search', {
        params: { page: 2, limit: 20 }
      });
    });
  });

  describe('➕ createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const userData = {
        email: 'new@depth-studio.com',
        full_name: 'سارة أحمد',
        role: 'brand_manager' as UserRole
      };

      const mockResponse = {
        success: true,
        data: { user: { ...mockUser, ...userData, id: 'user456' } },
        message: 'تم إنشاء المستخدم بنجاح',
        timestamp: new Date().toISOString()
      };

      (apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/users', userData);
      expect(result).toEqual(mockResponse);
      expect(result.data!.user.email).toBe('new@depth-studio.com');
    });

    it('should handle creation error correctly', async () => {
      // Arrange
      const userData = { email: 'invalid-email' };
      const errorMessage = 'البريد الإلكتروني غير صحيح';

      (apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(errorMessage);
      expect(apiClient.post).toHaveBeenCalledWith('/users', userData);
    });
  });

  describe('✏️ updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 'user123';
      const updateData = {
        full_name: 'أحمد محمد المحدث',
        status: 'inactive' as UserStatus
      };

      const mockResponse = {
        success: true,
        data: { user: { ...mockUser, ...updateData } },
        message: 'تم تحديث المستخدم بنجاح',
        timestamp: new Date().toISOString()
      };

      (apiClient.patch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      // Act
      const result = await userService.updateUser(userId, updateData);

      // Assert
      expect(apiClient.patch).toHaveBeenCalledWith(`/users/${userId}`, updateData);
      expect(result).toEqual(mockResponse);
      expect(result.data!.user.full_name).toBe('أحمد محمد المحدث');
    });
  });

  describe('🔍 searchUsers', () => {
    it('should search users with filters successfully', async () => {
      // Arrange
      const filters: UserSearchFilters = {
        searchTerm: 'أحمد',
        role: 'photographer' as UserRole,
        status: 'active' as UserStatus,
        page: 1,
        limit: 5
      };

      const mockResponse = {
        success: true,
        data: {
          users: [mockUser],
          total: 1,
          page: 1,
          totalPages: 1
        },
        message: 'تم البحث في المستخدمين بنجاح',
        timestamp: new Date().toISOString()
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      // Act
      const result = await userService.searchUsers(filters);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/users/search', {
        params: filters
      });
      expect(result).toEqual(mockResponse);
      expect(result.data!.users[0].role).toBe('photographer');
    });

    it('should handle empty search results', async () => {
      // Arrange
      const filters: UserSearchFilters = {
        searchTerm: 'nonexistent'
      };

      const mockResponse = {
        success: true,
        data: {
          users: [],
          total: 0,
          page: 1,
          totalPages: 0
        },
        message: 'لا توجد نتائج',
        timestamp: new Date().toISOString()
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      // Act
      const result = await userService.searchUsers(filters);

      // Assert
      expect(result.data!.users).toHaveLength(0);
      expect(result.data!.total).toBe(0);
    });
  });

  describe('📊 getUserStats', () => {
    it('should fetch user statistics successfully', async () => {
      // Arrange
      const mockStats = {
        total: 150,
        byRole: {
          photographer: 100,
          brand_manager: 30,
          admin: 20
        },
        byStatus: {
          active: 120,
          inactive: 20,
          pending_approval: 10
        },
        activeCount: 120,
        pendingApproval: 10
      };

      const mockResponse = {
        success: true,
        data: { stats: mockStats },
        message: 'تم جلب الإحصائيات بنجاح',
        timestamp: new Date().toISOString()
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      // Act
      const result = await userService.getUserStats();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/users/stats');
      expect(result).toEqual(mockResponse);
      expect(result.data!.stats.total).toBe(150);
      expect(result.data!.stats.activeCount).toBe(120);
      expect(result.data!.stats.byRole.photographer).toBe(100);
    });

    it('should handle stats fetching error', async () => {
      // Arrange
      const errorMessage = 'خطأ في جلب الإحصائيات';
      (apiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(userService.getUserStats()).rejects.toThrow(errorMessage);
    });
  });

  describe('👤 getUserById', () => {
    it('should fetch single user by ID successfully', async () => {
      // Arrange
      const userId = 'user123';
      const mockResponse = {
        success: true,
        data: { user: mockUser },
        message: 'تم جلب المستخدم بنجاح',
        timestamp: new Date().toISOString()
      };

      (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith(`/users/${userId}`);
      expect(result).toEqual(mockResponse);
      expect(result.data!.user.id).toBe('user123');
    });
  });
}); 