import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, authApi, API_BASE_URL, API_ENDPOINTS } from '../utils/api';

// User type definition
export interface User {
  id: string;
  email: string;
  name: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role: "CUSTOMER" | "VENDOR" | "ADMIN";
  isVerified: boolean;
  profileImageUrl?: string | null;
  phone?: string | null;
  preferredLanguage?: string;
  preferredCurrency?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  dateOfBirth?: string;
}

// Customer profile data for creation/update
export interface CustomerProfileData {
  firstName: string;
  lastName: string;
  name?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  dateOfBirth?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
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

// Login data returned when OTP is required
export interface LoginData {
  userId: string;
  email: string;
  requireOTP: boolean;
  expiresIn: number;
  expiresAt: number; // Calculated timestamp when OTP will expire
}

// Authentication state interface
interface AuthState {
  accessToken: string | null;
  user: User | null;
  error: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginData: LoginData | null; // Added to store login data for OTP verification

  // Set error message
  setError: (error: string | null) => void;
  
  // Set user and token
  setTokenAndUser: (token: string, user: User | null) => void;
  
  // Clear auth state
  clearState: () => void;
  
  // Initialize auth from localStorage/cookies
  initializeAuth: () => Promise<boolean>;
  
  // Refresh token
  refreshToken: () => Promise<boolean>;
  
  // Load user profile
  loadUserProfile: () => Promise<boolean>;

  // Login methods
  login: (email: string, password: string) => Promise<LoginData | null>;
  verifyLogin: (email: string, otp: string, rememberMe: boolean) => Promise<User | null>;
  resendLoginOTP: (email: string) => Promise<LoginData | null>;
  
  // New methods for profile management
  updateProfile: (profileData: any) => Promise<boolean>;
  createCustomerProfile: (profileData: CustomerProfileData) => Promise<boolean>;
  logout: () => void; // Alias for clearState
}

// Create the auth store with persistence
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      error: null,
      isAuthenticated: false,
      isLoading: false,
      loginData: null,

      setError: (error: string | null) => {
        set({ error });
      },
      
      setTokenAndUser: (token: string, user: User | null) => {
          set({
          accessToken: token,
          user: user || get().user,
          isAuthenticated: !!token,
          error: null
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', token);
          if (user) localStorage.setItem('userData', JSON.stringify(user));
        }
      },
      
      clearState: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
        }
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
          error: null,
          loginData: null
        });
      },
      
      initializeAuth: async () => {
        if (typeof window === 'undefined') return false;
        set({ isLoading: true });
        try {
          const storedAccessToken = localStorage.getItem('accessToken');
          const storedRefreshToken = localStorage.getItem('refreshToken');
          if (storedAccessToken) {
            set({ accessToken: storedAccessToken });
            const userDataString = localStorage.getItem('userData');
            const userData = userDataString ? JSON.parse(userDataString) : null;
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false
            });
            if (!userData) {
              try { await get().loadUserProfile(); } catch {}
            }
            return true;
          }
          if (storedRefreshToken) {
            const refreshed = await get().refreshToken();
            set({ isLoading: false });
            return refreshed;
          }
          set({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            accessToken: null,
            error: null
          });
          return false;
        } catch (error) {
          set({ isLoading: false, isAuthenticated: false, error: 'Failed to authenticate user' });
          return false;
        }
      },
      
      refreshToken: async () => {
        if (typeof window === 'undefined') return false;
        set({ isLoading: true });
        try {
          const refreshed = await api.refreshAccessToken();
          if (refreshed) {
            const token = localStorage.getItem('accessToken');
            if (token) {
              set({ accessToken: token, isAuthenticated: true, isLoading: false });
              try { await get().loadUserProfile(); } catch {}
              return true;
            }
          }
          set({ isLoading: false, isAuthenticated: false });
          return false;
        } catch (error) {
          set({ isLoading: false, isAuthenticated: false, error: 'Failed to refresh authentication' });
          return false;
        }
      },
      
      loadUserProfile: async () => {
        if (typeof window === 'undefined') return false;
        try {
          const token = get().accessToken || api.getAccessToken();
          if (!token) return false;
          const response = await api.get(authApi.PROFILE, token);
          if (response && response.user) {
            set({ user: response.user, isAuthenticated: true });
            if (typeof window !== 'undefined') {
              localStorage.setItem('userData', JSON.stringify(response.user));
            }
            return true;
          }
          return false;
        } catch (error) {
          return false;
        }
      },
      
      // Login with email and password
      login: async (email: string, password: string): Promise<LoginData | null> => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post(authApi.LOGIN, { email, password });
          if (response.requireOTP) {
            const loginData: LoginData = {
              userId: response.userId,
              email,
              requireOTP: true,
              expiresIn: response.expiresIn || 300,
              expiresAt: Date.now() + ((response.expiresIn || 300) * 1000)
            };
            set({ loginData, isLoading: false });
            return loginData;
          }
          if (response.accessToken && response.user) {
            localStorage.setItem('accessToken', response.accessToken);
            if (response.refreshToken) localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('userData', JSON.stringify(response.user));
            set({ accessToken: response.accessToken, user: response.user, isAuthenticated: true, isLoading: false });
            return null;
          }
          set({ isLoading: false, error: 'Login response missing token or user data' });
          return null;
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'An error occurred during login' });
          return null;
        }
      },
      
      // Verify OTP for login
      verifyLogin: async (email: string, otp: string, rememberMe = false) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.VERIFY_LOGIN_OTP, { email, otp, rememberMe });
          
          if (response.accessToken && response.user) {
            localStorage.setItem('accessToken', response.accessToken);
            if (response.refreshToken) localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('userData', JSON.stringify(response.user));
            set({ accessToken: response.accessToken, user: response.user, isAuthenticated: true, loginData: null, isLoading: false });
            return response.user;
          }
          
          set({ isLoading: false, error: 'Verification response missing token or user data' });
          return null;
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'An error occurred during verification' });
          return null;
        }
      },
      
      // Resend OTP
      resendLoginOTP: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post(authApi.RESEND_LOGIN_OTP, { email });
          
          if (response.expiresIn) {
            const loginData: LoginData = {
              userId: get().loginData?.userId || '',
              email,
              requireOTP: true,
              expiresIn: response.expiresIn || 300,
              expiresAt: Date.now() + ((response.expiresIn || 300) * 1000)
            };
            
            set({ loginData, isLoading: false });
            return loginData;
          }
          
          set({ isLoading: false, error: 'Failed to resend OTP' });
          return null;
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'An error occurred while resending OTP' });
          return null;
        }
      },
      
      // Update profile
      updateProfile: async (profileData: any) => {
        set({ isLoading: true, error: null });
        
        try {
          const token = get().accessToken;
          if (!token) {
            set({ isLoading: false, error: 'No authentication token available' });
            return false;
          }
          
          const response = await api.put(authApi.UPDATE_PROFILE || '/api/users/profile', profileData, token);
          
          if (response && response.user) {
            set({ user: response.user, isLoading: false });
            if (typeof window !== 'undefined') {
              localStorage.setItem('userData', JSON.stringify(response.user));
            }
            return true;
          }
          
          set({ isLoading: false, error: 'Failed to update profile' });
          return false;
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'An error occurred while updating profile' });
          return false;
        }
      },
      
      // Create customer profile
      createCustomerProfile: async (profileData: CustomerProfileData) => {
        set({ isLoading: true, error: null });
        
        try {
          const token = get().accessToken;
          if (!token) {
            set({ isLoading: false, error: 'No authentication token available' });
            return false;
          }
          
          const response = await api.post(authApi.CREATE_PROFILE || '/api/users/customer-profile', profileData, token);
          
          if (response && response.user) {
            set({ user: response.user, isLoading: false });
            if (typeof window !== 'undefined') {
              localStorage.setItem('userData', JSON.stringify(response.user));
            }
            return true;
          }
          
          set({ isLoading: false, error: 'Failed to create customer profile' });
          return false;
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'An error occurred while creating customer profile' });
          return false;
        }
      },
      
      // Logout (alias for clearState)
      logout: function() {
        return this.clearState();
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} })),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken
      })
    }
  )
);

export default useAuthStore;
