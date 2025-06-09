'use client';

import { useEffect, useState, createContext, useContext, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useAuthStore from '@/store/useAuthStore';
import { setupApiInterceptors } from '@/utils/api';
import { refreshAccessTokenManually } from '@/utils/authInitializer';

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

// Create auth context for child components
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  refreshTokenManually: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  refreshTokenManually: async () => false
});

// Track if interceptors have been set up globally to avoid multiple setups
let interceptorsInitialized = false;

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    isAuthenticated, 
    user, 
    initializeAuth, 
    accessToken, 
    refreshToken,
    setError,
    setTokenAndUser 
  } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Use refs to prevent multiple initializations and infinite loops
  const initRef = useRef(false);
  const authCheckRef = useRef(false);
  const periodicRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced manual token refresh function that can be called from anywhere
  const refreshTokenManually = useCallback(async (): Promise<boolean> => {
    try {
      // Avoid concurrent refresh attempts
      if (refreshing) {
        console.log('🔄 Token refresh already in progress, skipping duplicate request');
        return true;
      }
      
      // If we already have a token, no need to refresh
      if (accessToken && isAuthenticated) {
        console.log('✅ Token already valid, no refresh needed');
        return true;
      }
      
      setRefreshing(true);
      console.log('🔄 Manually refreshing token...');
      
      // Use direct refreshAccessTokenManually first which handles localStorage updates
      const refreshed = await refreshAccessTokenManually();
      
      if (!refreshed) {
        // Fall back to auth store refresh if direct method fails
        console.log('🔄 Direct refresh failed, trying through auth store...');
        const storeRefreshed = await refreshToken();
        
        if (storeRefreshed) {
          console.log('✅ Token refresh successful via auth store');
          return true;
        } else {
          console.log('❌ All token refresh attempts failed');
          return false;
        }
      }
      
      console.log('✅ Token refresh successful');
      return true;
    } catch (err) {
      console.error('❌ Manual token refresh failed:', err);
      return false;
    } finally {
      setRefreshing(false);
    }
  }, [refreshToken, refreshing, accessToken, isAuthenticated]);

  // Set up API interceptors and initialize auth - once only
  useEffect(() => {
    // Skip if already initialized
    if (initRef.current) return;
    initRef.current = true;
    
    // Initialize API interceptors - only once globally
    if (!interceptorsInitialized) {
      setupApiInterceptors();
      interceptorsInitialized = true;
      console.log('🔐 Auth Provider: API interceptors initialized');
    }
      
    // Initialize auth from stored tokens, checking for expiration and refreshing if needed
    const init = async () => {
      try {
        console.log('🔐 Auth Provider: Initializing auth state...');
        // Use improved initializeAuth which checks expiration and refreshes if needed
        const restored = await initializeAuth();
        console.log('🔐 Auth Provider: Auth initialized, authenticated:', restored);
        setInitialized(true);
      } catch (error) {
        console.error('❌ Auth Provider: Error initializing auth:', error);
        setInitialized(true);
      }
    };
    
    init();
    
    // Cleanup function
    return () => {
      if (periodicRefreshRef.current) {
        clearInterval(periodicRefreshRef.current);
      }
    };
  }, []); // Empty dependency array - run once only
  
  // Set up periodic token refresh - once only when initialized changes
  useEffect(() => {
    // Skip if not initialized or already set up
    if (!initialized || periodicRefreshRef.current) return;
    
    // If user is authenticated, set up a periodic refresh
    if (isAuthenticated && accessToken) {
      console.log('🔄 Setting up periodic token refresh check');
      
      // Check token refresh every 5 minutes to ensure we maintain the session
      periodicRefreshRef.current = setInterval(() => {
        const currentToken = localStorage.getItem('accessToken');
        if (!currentToken) {
          // No token found, try to refresh
          console.log('🔄 Periodic token check - no token found, attempting refresh');
          refreshTokenManually().catch(err => {
            console.error('❌ Periodic token refresh failed:', err);
          });
          return;
        }
        
        // Check if token is expired
        try {
          const [, payload] = currentToken.split('.');
          const decoded = JSON.parse(atob(payload));
          
          if (decoded && decoded.exp) {
            const now = Math.floor(Date.now() / 1000);
            if (now >= decoded.exp) {
              // Token is expired, clean it up from localStorage
              console.log('🧹 Periodic check found expired token, removing from localStorage');
              localStorage.removeItem('accessToken');
              
              // Try to refresh
              refreshTokenManually().catch(err => {
                console.error('❌ Periodic token refresh failed after expiration cleanup:', err);
              });
            }
          }
        } catch (err) {
          console.error('❌ Error checking token expiration during periodic check:', err);
          // If token can't be decoded, it's likely invalid - remove it
          localStorage.removeItem('accessToken');
        }
      }, 5 * 60 * 1000); // 5 minutes
    }
    
    // Cleanup function
    return () => {
      if (periodicRefreshRef.current) {
        clearInterval(periodicRefreshRef.current);
        periodicRefreshRef.current = null;
      }
    };
  }, [initialized, isAuthenticated, accessToken, refreshTokenManually]);
  
  // Handle auth checks for navigation - once per path change
  useEffect(() => {
    // Skip auth check until initialization is complete
    if (!initialized) return;
    
    // Skip if auth check already run for this path
    if (authCheckRef.current) return;
    authCheckRef.current = true;
    
    const checkAuth = async () => {
      // Skip auth check for public routes
      if (publicRoutes.includes(pathname)) {
        setIsLoading(false);
        return;
      }
      
      console.log('🔐 Checking auth for path:', pathname);
      console.log('🔐 Auth state:', { isAuthenticated, hasUser: !!user, hasToken: !!accessToken });
      
      // If already authenticated with valid tokens, we're good
      if (isAuthenticated && user && accessToken) {
        console.log('✅ Auth Provider: User is already authenticated');
        setIsLoading(false);
        return;
      }
      
      // If we don't have an access token, try to refresh
      if (!accessToken) {
        console.log('🔄 Auth Provider: No access token, attempting to refresh');
        try {
          const refreshed = await refreshTokenManually();
          if (!refreshed) {
            console.log('❌ Auth Provider: Token refresh failed, redirecting to login');
            // Set error message for user
            setError('Your session has expired. Please log in again.');
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
          } else {
            console.log('✅ Auth Provider: Token refresh successful');
          }
        } catch (err) {
          console.error('❌ Auth Provider: Error refreshing token:', err);
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [pathname, initialized, isAuthenticated, user, accessToken, refreshTokenManually, router, setError]); // Include all dependencies
  
  // Reset auth check ref when path changes
  useEffect(() => {
    authCheckRef.current = false;
  }, [pathname]);
  
  // Show loading state while checking auth
  if ((isLoading || !initialized) && !publicRoutes.includes(pathname)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Provide auth context to all child components
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user,
      refreshTokenManually
    }}>
      {children}
    </AuthContext.Provider>
  );
} 