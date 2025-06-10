/**
 * 🧪 اختبارات خدمة المصادقة - Depth Studio
 * =========================================
 * 
 * اختبارات وحدات أساسية للتأكد من:
 * - استدعاء الـ endpoints الصحيحة
 * - معالجة البيانات بشكل صحيح
 * - إدارة token المصادقة
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../auth.service';
import { apiClient } from '../api/api-client';

// Mock apiClient
vi.mock('../api/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    setAuthToken: vi.fn(),
    clearAuthToken: vi.fn(),
  },
}));

// Mock localStorage for browser environment
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('🔐 AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('📧 signInWithEmail', () => {
    it('should call correct endpoint with email credentials', async () => {
      // Arrange
      const credentials = {
        email: 'test@depth-studio.com',
        password: 'password123',
      };

      const mockResponse = {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          success: true,
          user: { uid: '123', email: 'test@depth-studio.com' },
          token: 'mock-jwt-token',
          needs_role_selection: false,
          needs_phone_verification: false,
          needs_email_verification: false,
          message: 'تم تسجيل الدخول بنجاح',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      // Act
      const result = await authService.signInWithEmail(credentials);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login/email', credentials);
      expect(apiClient.setAuthToken).toHaveBeenCalledWith('mock-jwt-token');
      expect(result.success).toBe(true);
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should handle authentication error correctly', async () => {
      // Arrange
      const credentials = {
        email: 'invalid@test.com',
        password: 'wrong-password',
      };

      const error = new Error('البيانات المدخلة غير صحيحة');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      // Act & Assert
      await expect(authService.signInWithEmail(credentials)).rejects.toThrow(
        'البيانات المدخلة غير صحيحة'
      );
      expect(apiClient.setAuthToken).not.toHaveBeenCalled();
    });
  });

  describe('📱 signInWithPhone', () => {
    it('should send OTP request with correct phone data', async () => {
      // Arrange
      const phoneData = {
        phone: '7901234567',
        country_code: '+964',
      };

      const mockResponse = {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          success: true,
          message: 'تم إرسال رمز التحقق بنجاح',
          expires_at: { seconds: Date.now() / 1000 + 300 },
          attempts_remaining: 3,
          can_resend_at: { seconds: Date.now() / 1000 + 60 },
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      // Act
      const result = await authService.signInWithPhone(phoneData);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/auth/otp/send', {
        phone: '7901234567',
        country_code: '+964',
        purpose: 'login',
      });
      expect(result.success).toBe(true);
      expect(result.message).toBe('تم إرسال رمز التحقق بنجاح');
    });
  });

  describe('🔑 verifyOTP', () => {
    it('should verify OTP and set auth token on success', async () => {
      // Arrange
      const verifyData = {
        phone: '7901234567',
        country_code: '+964',
        otp_code: '123456',
      };

      const mockResponse = {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          success: true,
          user: { uid: '123', phone: '+9647901234567' },
          token: 'otp-verified-token',
          message: 'تم التحقق بنجاح',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      // Act
      const result = await authService.verifyOTP(verifyData);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/auth/otp/verify', verifyData);
      expect(apiClient.setAuthToken).toHaveBeenCalledWith('otp-verified-token');
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });
  });

  describe('🚪 signOut', () => {
    it('should clear auth token and local data on successful logout', async () => {
      // Arrange
      const mockResponse = { 
        success: true, 
        timestamp: new Date().toISOString(),
        data: {} 
      };
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      // Act
      await authService.signOut();

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      expect(apiClient.clearAuthToken).toHaveBeenCalled();
    });

    it('should clear local data even if logout request fails', async () => {
      // Arrange
      const error = new Error('Network error');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      // Act & Assert
      await expect(authService.signOut()).rejects.toThrow('Network error');
      expect(apiClient.clearAuthToken).toHaveBeenCalled();
    });
  });

  describe('👤 getCurrentUser', () => {
    it('should return null if no auth token exists', async () => {
      // Arrange
      vi.mocked(localStorageMock.getItem).mockReturnValue(null);

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(result).toBeNull();
      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('should fetch user data when auth token exists', async () => {
      // Arrange
      vi.mocked(localStorageMock.getItem).mockReturnValue('valid-token');
      
      const mockResponse = {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          uid: '123',
          email: 'user@depth-studio.com',
          role: 'marketing_coordinator',
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('🔍 Helper Methods', () => {
    it('should correctly check authentication status', () => {
      // Test authenticated state
      vi.mocked(localStorageMock.getItem).mockReturnValue('token');
      expect(authService.isAuthenticated()).toBe(true);

      // Test unauthenticated state
      vi.mocked(localStorageMock.getItem).mockReturnValue(null);
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return auth token from localStorage', () => {
      const mockToken = 'stored-token';
      vi.mocked(localStorageMock.getItem).mockReturnValue(mockToken);

      const token = authService.getAuthToken();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
      expect(token).toBe(mockToken);
    });
  });
}); 