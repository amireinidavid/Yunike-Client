import { getAccessToken } from './auth';
import useAuthStore from '@/store/useAuthStore';

/**
 * Check if token is expired
 * @param token JWT token string
 * @returns boolean True if token is expired
 */
function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(atob(payload));
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Sync auth state between localStorage, cookies, and Zustand store
 * Call this whenever there might be inconsistency between storage mechanisms
 */
export function syncAuthState(): void {
  // Skip if running on server
  if (typeof window === 'undefined') return;
  
  try {
    console.log('🔄 Syncing auth state between storage and store...');
    const authStore = useAuthStore.getState();
    
    // Get tokens from different sources
    const storeToken = authStore.accessToken;
    const localToken = localStorage.getItem('accessToken');
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1];
    
    // Check if localStorage token is expired before using it
    const localTokenValid = localToken && !isTokenExpired(localToken);
    
    if (localToken && !localTokenValid) {
      // Clean up expired token from localStorage
      console.log('🧹 Cleaning up expired token from localStorage during sync');
      localStorage.removeItem('accessToken');
    }
    
    // Get the best available token (preferring cookies over localStorage for security)
    let bestToken: string | null = cookieToken || (localTokenValid ? localToken : null) || storeToken || null;
    
    // Log current state
    console.log('🔄 Auth sync - Current state:', {
      storeToken: !!storeToken,
      localToken: !!localToken,
      localTokenValid,
      cookieToken: !!cookieToken,
      bestToken: !!bestToken
    });
    
    // If we have a best token, ensure it's everywhere
    if (bestToken) {
      // Ensure token is in localStorage
      if (!localToken || localToken !== bestToken) {
        localStorage.setItem('accessToken', bestToken);
        console.log('✅ Updated localStorage with best token');
      }
      
      // Ensure token is in store
      if (!storeToken || storeToken !== bestToken) {
        authStore.setTokenAndUser(bestToken, authStore.user);
        console.log('✅ Updated auth store with best token');
      }
      
      console.log('✅ Auth state synchronized');
    } else {
      // Clear everything if no valid token found
      if (localToken) {
        localStorage.removeItem('accessToken');
        console.log('🧹 Removed invalid token from localStorage during sync');
      }
      
      if (storeToken) {
        authStore.setTokenAndUser('', authStore.user);
        console.log('🧹 Cleared token from auth store during sync');
      }
      
      console.log('ℹ️ No valid token found during sync, cleared invalid tokens');
    }
  } catch (error) {
    console.error('❌ Error syncing auth state:', error);
  }
}

/**
 * Monitor localStorage for external changes to access token
 * (e.g., from another tab)
 */
export function setupStorageSync(): void {
  // Skip if running on server
  if (typeof window === 'undefined') return;
  
  console.log('🔧 Setting up storage sync listener...');
  
  // Handle storage events from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'accessToken') {
      console.log('🔄 Access token changed in another tab, syncing...');
      
      const newToken = event.newValue;
      const authStore = useAuthStore.getState();
      
      if (newToken && newToken !== authStore.accessToken) {
        console.log('✅ Updating auth store with token from another tab');
        authStore.setTokenAndUser(newToken, authStore.user);
      } else if (!newToken && authStore.accessToken) {
        console.log('🔄 Token removed in another tab, clearing auth state');
        authStore.clearState();
      }
    }
  });
  
  // Initial sync
  syncAuthState();
  
  console.log('✅ Storage sync listener setup complete');
}