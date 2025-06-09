import { setupApiInterceptors } from './api';
import useAuthStore from '../store/useAuthStore';
import { isJwtExpired } from './jwt';

/**
 * Check if token exists in cookies 
 * @returns {boolean} True if accessToken cookie exists
 */
function hasAccessTokenCookie(): boolean {
  return document.cookie.split(';').some(cookie => 
    cookie.trim().startsWith('accessToken=')
  );
}

/**
 * Initialize the authentication system
 * This function should be called early in your app initialization
 * Now enhanced to work across all routes in the application
 * 
 * @returns {Promise<boolean>} True if successfully authenticated
 */
export async function initializeAuth() {
  console.log('🔐 Initializing authentication system globally...');
  
  // Set up API interceptors to handle token refresh
  setupApiInterceptors();
  
  // Initialize auth state from tokens
  const authStore = useAuthStore.getState();
  
  try {
    // Check for tokens in localStorage
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Check for tokens in cookies
    const hasCookieToken = hasAccessTokenCookie();
    
    console.log('🔐 Auth tokens status:', { 
      localStorage: { 
        accessToken: !!accessToken, 
        refreshToken: !!refreshToken 
      },
      cookies: {
        accessToken: hasCookieToken
      }
    });
    
    // Determine if we need to refresh the token
    let needsRefresh = false;
    
    // If we have an access token, check if it's expired
    if (accessToken) {
      if (isJwtExpired(accessToken)) {
        console.log('🔄 Access token expired, needs refresh');
        // Remove expired token from localStorage to maintain consistency with cookies
        localStorage.removeItem('accessToken');
        console.log('🧹 Removed expired token from localStorage');
        needsRefresh = true;
      } else if (!hasCookieToken) {
        // Valid token in localStorage but missing from cookies - sync needed
        console.log('🔄 Valid localStorage token but missing cookie token, needs sync');
        needsRefresh = true;
      } else {
        // Token is valid and exists in both places
        console.log('✅ Auth initialization: Found valid access token');
        if (!authStore.accessToken) {
          authStore.setTokenAndUser(accessToken, null);
        }
        return true;
      }
    } else {
      // No localStorage token
      needsRefresh = true;
    }
    
    // Try to refresh if needed
    if (needsRefresh && refreshToken) {
      console.log('🔄 Attempting to refresh token...');
      const refreshed = await refreshAccessTokenManually();
      if (refreshed) {
        console.log('✅ Auth initialization: Successfully refreshed token');
        return true;
      } else {
        console.log('❌ Auth initialization: Token refresh failed');
        // Clean up any remaining invalid tokens
        localStorage.removeItem('accessToken');
        console.log('🧹 Cleaned up invalid tokens from localStorage');
      }
    }
    
    // Otherwise try to restore from store
    console.log('🔄 Trying to initialize auth state from store...');
    const authInitialized = await authStore.initializeAuth();
    
    console.log('🔐 Auth initialization completed, authenticated:', authInitialized);
    return authInitialized;
  } catch (error) {
    console.error('❌ Auth initialization failed:', error);
    return false;
  }
}

/**
 * Check if the user is currently authenticated
 * Synchronous version for quick checks
 * 
 * @returns {boolean} Whether the user is authenticated
 */
export function isAuthenticated() {
  const authStore = useAuthStore.getState();
  const authenticated = authStore.isAuthenticated && !!authStore.accessToken;
  console.log('🔐 Auth check:', authenticated);
  return authenticated;
}

/**
 * Attempt to refresh the access token if needed
 * 
 * @returns {Promise<boolean>} Whether the refresh was successful
 */
export async function refreshTokenIfNeeded() {
  const authStore = useAuthStore.getState();
  
  // If we have an access token, check if it's expired
  if (authStore.accessToken && !isJwtExpired(authStore.accessToken)) {
    console.log('✅ Token check: Access token exists and is valid, no refresh needed');
    return true;
  }
  
  // Token is expired or missing, so remove it from localStorage for consistency
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    localStorage.removeItem('accessToken');
    console.log('🧹 Removed expired token from localStorage during refresh check');
  }
  
  // Check if we have a refresh token
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    console.log('❌ Token check: No refresh token available');
    return false;
  }
  
  // Otherwise try to refresh
  console.log('🔄 Attempting to refresh token for route access');
  try {
    const refreshed = await refreshAccessTokenManually();
    console.log('🔄 Token refresh result:', refreshed);
    return refreshed;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return false;
  }
}

/**
 * Direct method for any component to refresh the access token
 * This is a helper that can be imported and used anywhere
 */
export async function refreshAccessTokenManually() {
  console.log('🔄 Direct access token refresh requested');

  // Always attempt refresh; browser will send cookie if present
  try {
    const API_URL = 'http://localhost:5001/api';
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // No body: backend expects refresh token in cookie
      credentials: 'include'
    });

    if (!response.ok) {
      console.error('❌ Manual refresh failed:', response.status);
      return false;
    }

    const data = await response.json();

    if (data && data.accessToken) {
      console.log('✅ Manual token refresh successful');
      
      // Update localStorage
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      
      // Ensure cookie is also set (this is a fallback, ideally backend sets httpOnly cookies)
      // If the server already set an httpOnly cookie, this won't interfere
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=3600;`;
      
      // Update auth store
      const authStore = useAuthStore.getState();
      authStore.setTokenAndUser(data.accessToken, data.user || null);
      
      console.log('✅ Tokens synced between localStorage and cookies');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Manual token refresh error:', error);
    return false;
  }
} 