import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { axiosInstance, api, authApi } from '../utils/api';

// User type definition
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN';
  isVerified: boolean;
  profileImageUrl?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  vendor?: {
    id: string;
    storeName: string;
    slug: string;
    logo?: string;
    banner?: string;
    description?: string;
    isActive: boolean;
    verificationStatus: string;
  };
  admin?: {
    id: string;
    permissions: string[];
    isSuper: boolean;
  };
}

// Session type definition
export interface Session {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

// Registration data type
export interface RegistrationData {
  registrationId: string;
  email: string;
  requireOTP: boolean;
  expiresIn: number;
  expiresAt: number; // Calculated timestamp when OTP will expire
}

// Login data type
export interface LoginData {
  userId: string;
  email: string;
  requireOTP: boolean;
  expiresIn: number;
  expiresAt: number; // Calculated timestamp when OTP will expire
  requiresTwoFactor?: boolean; // For admin login
}

// Authentication state interface
interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  error: string | null;
  
  // Registration state
  registrationData: RegistrationData | null;
  
  // Login state
  loginData: LoginData | null;
  
  // Session management
  sessions: Session[];
  
  // Actions for authentication
  register: (email: string, password: string, name?: string, phone?: string) => Promise<RegistrationData | null>;
  verifyRegistration: (registrationId: string, email: string, otp: string) => Promise<User | null>;
  resendRegistrationOTP: (registrationId: string, email: string) => Promise<boolean>;
  
  login: (email: string, password: string) => Promise<LoginData | null>;
  verifyLogin: (email: string, otp: string, rememberMe?: boolean) => Promise<User | null>;
  resendLoginOTP: (email: string) => Promise<boolean>;
  
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  
  // Profile actions
  getProfile: () => Promise<User | null>;
  updateProfile: (profileData: Partial<User>) => Promise<User | null>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  
  // Email verification
  verifyEmail: (userId: string, verificationCode: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  
  // Password recovery
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (userId: string, token: string, newPassword: string) => Promise<boolean>;
  
  // Session management
  loadSessions: () => Promise<Session[]>;
  revokeSession: (sessionId: string) => Promise<boolean>;
  revokeAllSessions: () => Promise<boolean>;
  
  // Social login
  loginWithGoogle: (idToken: string) => Promise<User | null>;
  
  // State management utilities
  setTokenAndUser: (token: string, user: User | null) => void;
  setError: (error: string | null) => void;
  clearState: () => void;
  
  // Add this new property
  createCustomerProfile: (profileData: {
    firstName: string;
    lastName: string;
    name?: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
    dateOfBirth?: string;
    biography?: string;
    timezone?: string;
    preferredLanguage?: string;
    preferredCurrency?: string;
    marketingConsent?: boolean;
    notificationPreferences?: Record<string, boolean>;
    communicationChannels?: string[];
  }) => Promise<User | null>;
}

// Create the auth store with persistence
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
      error: null,
      registrationData: null,
      loginData: null,
      sessions: [],
      
      // REGISTRATION
      register: async (email, password, name, phone) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.register, {
            email,
            password,
            name,
            phone,
            role: 'CUSTOMER', // Default role for regular users
          });
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return null;
          }
          
          // Calculate OTP expiration timestamp
          const expiresAt = Date.now() + (response.expiresIn * 1000);
          
          const registrationData = {
            registrationId: response.registrationId,
            email,
            requireOTP: response.requireOTP,
            expiresIn: response.expiresIn,
            expiresAt
          };
          
          set({
            registrationData,
            isLoading: false
          });
          
          return registrationData;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Registration failed';
          set({ error: errorMsg, isLoading: false });
          return null;
        }
      },
      
      verifyRegistration: async (registrationId, email, otp) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.verifyRegistrationOTP, {
            registrationId,
            email,
            otp
          });
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return null;
          }
          
          // Save token to localStorage for API interceptors
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
          }
          
          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
            registrationData: null // Clear registration data
          });
          
          return response.user;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'OTP verification failed';
          set({ error: errorMsg, isLoading: false });
          return null;
        }
      },
      
      resendRegistrationOTP: async (registrationId, email) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.resendRegistrationOTP, {
            registrationId,
            email
          });
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return false;
          }
          
          // Update expiration time
          const registrationData = get().registrationData;
          if (registrationData) {
            set({
              registrationData: {
                ...registrationData,
                expiresIn: response.expiresIn,
                expiresAt: Date.now() + (response.expiresIn * 1000)
              }
            });
          }
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to resend OTP';
          set({ error: errorMsg, isLoading: false });
          return false;
        }
      },
      
      // LOGIN
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.login, {
            email,
            password
          });
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return null;
          }
          
          // Handle direct login (if no OTP required)
          if (response.accessToken) {
            // Save token to localStorage for API interceptors
            localStorage.setItem('accessToken', response.accessToken);
            
            set({
              user: response.user,
              accessToken: response.accessToken,
              isAuthenticated: true,
              isLoading: false
            });
            
            return null; // No OTP required, return null for loginData
          }
          
          // Handle OTP required
          const expiresAt = Date.now() + (response.expiresIn * 1000);
          
          const loginData = {
            userId: response.userId,
            email,
            requireOTP: response.requireOTP,
            expiresIn: response.expiresIn,
            expiresAt
          };
          
          set({
            loginData,
            isLoading: false
          });
          
          return loginData;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Login failed';
          set({ error: errorMsg, isLoading: false });
          return null;
        }
      },
      
      verifyLogin: async (email, otp, rememberMe = false) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.verifyLoginOTP, {
            email,
            otp,
            rememberMe
          });
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return null;
          }
          
          // Save token to localStorage for API interceptors
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
          }
          
          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
            loginData: null // Clear login data
          });
          
          return response.user;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'OTP verification failed';
          set({ error: errorMsg, isLoading: false });
          return null;
        }
      },
      
      resendLoginOTP: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.resendLoginOTP, { email });
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return false;
          }
          
          // Update expiration time
          const loginData = get().loginData;
          if (loginData) {
            set({
              loginData: {
                ...loginData,
                expiresIn: response.expiresIn,
                expiresAt: Date.now() + (response.expiresIn * 1000)
              }
            });
          }
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to resend OTP';
          set({ error: errorMsg, isLoading: false });
          return false;
        }
      },
      
      // LOGOUT
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await api.post(authApi.logout);
          
          // Remove tokens from localStorage
          localStorage.removeItem('accessToken');
          
          // Clear auth state
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            isLoading: false
          });
        } catch (error) {
          console.error('Logout error:', error);
          
          // Clear state anyway to prevent the user from being stuck in a logged-in state
          localStorage.removeItem('accessToken');
          
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            isLoading: false
          });
        }
      },
      
      refreshToken: async () => {
        try {
          const response = await api.post(authApi.refreshToken);
          
          if (response.error || !response.accessToken) {
            set({ isAuthenticated: false, user: null, accessToken: null });
            return false;
          }
          
          // Save token to localStorage for API interceptors
          localStorage.setItem('accessToken', response.accessToken);
          
          set({
            accessToken: response.accessToken,
            isAuthenticated: true
          });
          
          return true;
        } catch (error) {
          console.error('Token refresh error:', error);
          set({ isAuthenticated: false, user: null, accessToken: null });
          return false;
        }
      },
      
      // PROFILE MANAGEMENT
      getProfile: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get(authApi.getProfile);
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return null;
          }
          
          set({
            user: response.user,
            isLoading: false
          });
          
          return response.user;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to fetch profile';
          set({ error: errorMsg, isLoading: false });
          return null;
        }
      },
      
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.put(authApi.updateProfile, profileData);
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return null;
          }
          
          const updatedUser = { ...get().user, ...response.user };
          
          set({
            user: updatedUser,
            isLoading: false
          });
          
          return updatedUser;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to update profile';
          set({ error: errorMsg, isLoading: false });
          return null;
        }
      },
      
      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.changePassword, {
            currentPassword,
            newPassword
          });
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return false;
          }
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Password change failed';
          set({ error: errorMsg, isLoading: false });
          return false;
        }
      },
      
      // EMAIL VERIFICATION
      verifyEmail: async (userId, verificationCode) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.verifyEmail, {
            userId,
            code: verificationCode
          });
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return false;
          }
          
          // If the current user is the one being verified, update their status
          const currentUser = get().user;
          if (currentUser && currentUser.id === userId) {
            set({
              user: {
                ...currentUser,
                isVerified: true
              }
            });
          }
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Email verification failed';
          set({ error: errorMsg, isLoading: false });
          return false;
        }
      },
      
      resendVerification: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.resendVerification, { email });
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return false;
          }
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to resend verification';
          set({ error: errorMsg, isLoading: false });
          return false;
        }
      },
      
      // PASSWORD RECOVERY
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.forgotPassword, { email });
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return false;
          }
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Password reset request failed';
          set({ error: errorMsg, isLoading: false });
          return false;
        }
      },
      
      resetPassword: async (userId, token, newPassword) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.resetPassword, {
            userId,
            token,
            password: newPassword
          });
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return false;
          }
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Password reset failed';
          set({ error: errorMsg, isLoading: false });
          return false;
        }
      },
      
      // SESSION MANAGEMENT
      loadSessions: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.get(authApi.getSessions);
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return [];
          }
          
          set({
            sessions: response.sessions || [],
            isLoading: false
          });
          
          return response.sessions || [];
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to load sessions';
          set({ error: errorMsg, isLoading: false });
          return [];
        }
      },
      
      revokeSession: async (sessionId) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.delete(authApi.revokeSession(sessionId));
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return false;
          }
          
          // Remove the revoked session from the list
          set({ 
            sessions: get().sessions.filter(session => session.id !== sessionId),
            isLoading: false
          });
          
          return true;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to revoke session';
          set({ error: errorMsg, isLoading: false });
          return false;
        }
      },
      
      revokeAllSessions: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.delete(authApi.revokeAllSessions);
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return false;
          }
          
          // Reload sessions to get the current one
          await get().loadSessions();
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to revoke all sessions';
          set({ error: errorMsg, isLoading: false });
          return false;
        }
      },
      
      // SOCIAL LOGIN
      loginWithGoogle: async (idToken) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.googleAuth, { idToken });
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return null;
          }
          
          // Save token to localStorage for API interceptors
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
          }
          
          set({
            user: response.user,
            accessToken: response.accessToken,
            isAuthenticated: true,
            isLoading: false
          });
          
          return response.user;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Google login failed';
          set({ error: errorMsg, isLoading: false });
          return null;
        }
      },
      
      // UTILS
      setTokenAndUser: (token, user) => {
        set({
          accessToken: token,
          user,
          isAuthenticated: !!token
        });
      },
      
      setError: (error) => {
        set({ error });
      },
      
      clearState: () => {
        localStorage.removeItem('accessToken');
        
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          error: null,
          registrationData: null,
          loginData: null,
          sessions: []
        });
      },
      
      // Add the new method
      createCustomerProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.createCustomerProfile, profileData);
          
          if (response.error) {
            set({ error: response.error, isLoading: false });
            return null;
          }
          
          // Update user data in state with the returned profile
          const user = { ...get().user, ...response.user };
          
          set({
            user,
            isLoading: false
          });
          
          return user;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to create customer profile';
          set({ error: errorMsg, isLoading: false });
          return null;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields to storage
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken
      })
    }
  )
);

export default useAuthStore;
