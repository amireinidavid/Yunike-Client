import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL, API_ENDPOINTS } from '@/utils/api';

// Refresh token threshold in seconds (5 minutes before expiration)
const REFRESH_THRESHOLD = 5 * 60;

// Local storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// JWT token interface
interface JwtPayload {
  exp: number;
  iat: number;
  userId: string;
}

/**
 * Set a cookie directly
 */
const setCookieDirectly = (name: string, value: string, days: number): void => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

/**
 * Store access and refresh tokens in localStorage
 */
export const storeAccessToken = (token: string, refreshToken?: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

/**
 * Remove tokens from localStorage
 */
export const clearAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Decode a JWT access token
 */
export const decodeAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    return null;
  }
};

/**
 * Check if the access token is about to expire (within threshold seconds)
 */
export const shouldRefreshToken = (threshold: number = 5 * 60): boolean => {
  const accessToken = getAccessToken();
  if (!accessToken) return true;
  try {
    const decoded = jwtDecode<JwtPayload>(accessToken);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp - currentTime < threshold;
  } catch {
    return true;
  }
};

/**
 * Check if user is authenticated (token exists and is not expired)
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

/**
 * Check if we have a refresh token
 */
export const hasRefreshToken = (): boolean => {
  return !!getRefreshToken() || document.cookie.includes('refreshToken');
};

/**
 * Refresh the access token using the refresh token
 * @returns Promise<boolean> - true if refresh was successful
 */
export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    console.log('🔄 Attempting to refresh access token...');
    
    // Check for refresh token in localStorage or cookies
    const storedRefreshToken = getRefreshToken();
    const hasRefreshTokenCookie = document.cookie.includes('refreshToken');
    
    if (!storedRefreshToken && !hasRefreshTokenCookie) {
      console.log('❌ No refresh token available for refresh');
      return false;
    }
    
    console.log('🔄 Sending refresh token request to API...');
    
    // Call the refresh endpoint with cookies or localStorage token
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
      method: 'POST',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
      },
      // If we have a stored refresh token but no cookie, send it in the body
      ...(storedRefreshToken && !hasRefreshTokenCookie ? {
        body: JSON.stringify({ refreshToken: storedRefreshToken })
      } : {})
    });

    if (!response.ok) {
      console.error('❌ Refresh token request failed:', response.status);
      // Clear tokens on critical failures
      clearAccessToken();
      return false;
    }

    const data = await response.json();
    
    // Store the new access token in both cookie and localStorage
    if (data.accessToken) {
      storeAccessToken(data.accessToken, data.refreshToken);
      
      // Also update Zustand store if available
      try {
        const { getState } = require('@/store/useAuthStore').default;
        const state = getState();
        if (state?.setTokenAndUser) {
          state.setTokenAndUser(data.accessToken, state.user);
        }
      } catch (e) {
        console.log('⚠️ Could not update auth store from refreshAccessToken', e);
      }
      
      console.log('✅ Token refreshed successfully');
      return true;
    } else {
      console.error('❌ No access token in refresh response');
      return false;
    }
  } catch (error) {
    console.error('❌ Error refreshing token:', error);
    return false;
  }
};

/**
 * Force a token refresh regardless of token expiration
 * @returns Promise<boolean> - true if refresh was successful
 */
export const forceTokenRefresh = async (): Promise<boolean> => {
  console.log('🔄 Force refreshing token...');
  
  try {
    // Clear the access token from storage but keep refresh token
    Cookies.remove('accessToken');
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    
    if (typeof window !== 'undefined') {
      try {
        const { getState } = require('@/store/useAuthStore').default;
        const state = getState();
        
        // Clear token from store but keep user info
        if (state?.setTokenAndUser) {
          state.setTokenAndUser('', state.user);
        }
      } catch (e) {
        console.error('Failed to update store during force refresh:', e);
      }
    }
    
    // Refresh token
    return await refreshAccessToken();
  } catch (error) {
    console.error('Force token refresh failed:', error);
    return false;
  }
}; 