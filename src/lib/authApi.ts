import { API_BASE_URL, API_ENDPOINTS } from '@/config/apiConfig';
import { storeAccessToken } from './auth';
import { User } from '@/context/AuthContext';
import useAuthStore from '@/store/useAuthStore';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  requireOTP?: boolean;
  userId?: string;
  expiresIn?: number;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

interface RegisterResponse {
  message: string;
  registrationId: string;
  requireOTP: boolean;
  expiresIn: number;
}

/**
 * Login with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies in request
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }

  const data = await response.json();

  // If login requires OTP verification, return data without storing token
  if (data.requireOTP) {
    return data;
  }

  // Store the access token in both cookies and localStorage if we received it
  if (data.accessToken) {
    // Store in localStorage and cookies
    storeAccessToken(data.accessToken, data.refreshToken);
    
    // Also update the auth store directly
    try {
      const authStore = useAuthStore.getState();
      authStore.setTokenAndUser(data.accessToken, data.user);
      console.log('✅ Login: Updated auth store with token and user');
    } catch (e) {
      console.error('❌ Login: Failed to update auth store', e);
    }
  }

  return data;
};

/**
 * Verify login OTP
 */
export const verifyLoginOTP = async (email: string, otp: string, rememberMe = false): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.VERIFY_LOGIN_OTP}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies in request
    body: JSON.stringify({ email, otp, rememberMe }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'OTP verification failed');
  }

  const data = await response.json();

  // Store the access token in both cookies and localStorage
  if (data.accessToken) {
    // Store in localStorage and cookies
    storeAccessToken(data.accessToken, data.refreshToken);
    
    // Also update the auth store directly
    try {
      const authStore = useAuthStore.getState();
      authStore.setTokenAndUser(data.accessToken, data.user);
      console.log('✅ OTP Verification: Updated auth store with token and user');
    } catch (e) {
      console.error('❌ OTP Verification: Failed to update auth store', e);
    }
  }

  return data;
};

/**
 * Resend login OTP
 */
export const resendLoginOTP = async (email: string): Promise<{ message: string; expiresIn: number }> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.RESEND_LOGIN_OTP}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to resend verification code');
  }

  return await response.json();
};

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<RegisterResponse> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies in request
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Registration failed');
  }

  return await response.json();
};

/**
 * Verify registration OTP
 */
export const verifyRegistrationOTP = async (registrationId: string, email: string, otp: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.VERIFY_REGISTRATION_OTP}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies in request
    body: JSON.stringify({ registrationId, email, otp }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'OTP verification failed');
  }

  const data = await response.json();

  // Store the access token in both cookies and localStorage
  if (data.accessToken) {
    // Store in localStorage and cookies
    storeAccessToken(data.accessToken, data.refreshToken);
    
    // Also update the auth store directly
    try {
      const authStore = useAuthStore.getState();
      authStore.setTokenAndUser(data.accessToken, data.user);
      console.log('✅ Registration Verification: Updated auth store with token and user');
    } catch (e) {
      console.error('❌ Registration Verification: Failed to update auth store', e);
    }
  }

  return data;
}; 