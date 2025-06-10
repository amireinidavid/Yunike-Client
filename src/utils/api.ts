import axios from 'axios';
import useAuthStore from '@/store/useAuthStore';

// Define BASE_URL without the /api since we'll include that in the endpoints
export const API_BASE_URL = "http://localhost:5001/api";

// Define API endpoints here including the /api prefix
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
    CREATE_PROFILE: '/auth/customer/create-profile',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_LOGIN_OTP: '/auth/login/verify-otp',
    RESEND_LOGIN_OTP: '/auth/login/resend-otp',
    VERIFY_REGISTRATION_OTP: '/auth/register/verify-otp',
    RESEND_REGISTRATION_OTP: '/auth/register/resend-otp'
  },
  CART: {
    INITIALIZE: '/cart/initialize',
    GET_CART: (cartId: string): string => `/cart/${cartId}`,
    GET_USER_CART: '/cart/user',
    GET_GUEST_CART: (guestId: string): string => `/cart/guest/${guestId}`,
    ADD_ITEM: (cartId: string): string => `/cart/${cartId}/items`,
    UPDATE_ITEM: (cartId: string, itemId: string): string => `/cart/${cartId}/items/${itemId}`,
    REMOVE_ITEM: (cartId: string, itemId: string): string => `/cart/${cartId}/items/${itemId}`,
    CLEAR_CART: (cartId: string): string => `/cart/${cartId}/clear`,
    VALIDATE_CART: (cartId: string): string => `/cart/${cartId}/validate`,
    APPLY_COUPON: (cartId: string): string => `/cart/${cartId}/promo`,
    REMOVE_COUPON: (cartId: string): string => `/cart/${cartId}/promo`
  },
  CHECKOUT: {
    CREATE_SESSION: (cartId: string): string => `/checkout/${cartId}`,
    GET_STATUS: (sessionId: string): string => `/checkout/status/${sessionId}`,
    WEBHOOK: '/checkout/webhook'
  }
};

// Create axios instance with defaults
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include cart token in headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Add cart token to headers if available
    if (typeof window !== 'undefined') {
      const cartToken = localStorage.getItem('cartToken');
      if (cartToken && config.headers) {
        config.headers['X-Cart-Authorization'] = cartToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API routes
export const authApi = API_ENDPOINTS.AUTH;

// Product API routes for customers
export const productApi = {
  // Browse and search products
  getAllProducts: '/products',
  searchProducts: '/products/search',
  getFeaturedProducts: '/products/featured',
  
  // Single product details
  getProduct: (id: string): string => `/products/${id}`,
  getProductBySlug: (slug: string): string => `/products/slug/${slug}`,
  getRelatedProducts: (productId: string): string => `/products/${productId}/related`,
  
  // Vendor products
  getVendorProducts: (vendorId: string): string => `/products/vendor/${vendorId}`,
  getVendorProductsBySlug: (slug: string): string => `/products/vendor/slug/${slug}`,
};

// Customer Account API routes
export const customerApi = {
  // Profile
  getCustomerProfile: `/customer/profile`,
  updateCustomerProfile: `/customer/profile`,
  uploadProfileImage: `/customer/profile/image`,
  deleteCustomerAccount: `/customer/profile`,
  
  // Orders
  getOrders: `/customer/orders`,
  getOrderDetails: (orderId: string): string => `/customer/orders/${orderId}`,
  
  // Addresses
  getAddresses: `/customer/addresses`,
  addAddress: `/customer/addresses`,
  updateAddress: (addressId: string): string => `/customer/addresses/${addressId}`,
  deleteAddress: (addressId: string): string => `/customer/addresses/${addressId}`,
  
  // Wishlist
  getWishlist: `/customer/wishlist`,
  addToWishlist: `/customer/wishlist`,
  removeFromWishlist: (productId: string): string => `/customer/wishlist/${productId}`
};

// Cart API routes
export const cartApi = API_ENDPOINTS.CART;

// Checkout API routes
export const checkoutApi = API_ENDPOINTS.CHECKOUT;

// Helper functions for working with the cart API
export const cartUtils = {
  // Initialize a new cart or get an existing one
  initializeCart: async (sessionId?: string) => {
    return api.post(cartApi.INITIALIZE, { sessionId });
  },

  // Get a cart by ID
  getCart: async (cartId: string) => {
    return api.get(cartApi.GET_CART(cartId));
  },

  // Get the authenticated user's cart
  getUserCart: async () => {
    return api.get(cartApi.GET_USER_CART);
  },

  // Get a guest cart by session ID
  getGuestCart: async (sessionId: string) => {
    return api.get(cartApi.GET_GUEST_CART(sessionId));
  },

  // Add an item to the cart
  addItemToCart: async (cartId: string, productId: string, quantity: number, variantId?: string) => {
    return api.post(cartApi.ADD_ITEM(cartId), { productId, quantity, variantId });
  },

  // Update cart item quantity
  updateCartItem: async (cartId: string, itemId: string, quantity: number) => {
    return api.put(cartApi.UPDATE_ITEM(cartId, itemId), { quantity });
  },

  // Remove an item from the cart
  removeCartItem: async (cartId: string, itemId: string) => {
    return api.delete(cartApi.REMOVE_ITEM(cartId, itemId));
  },

  // Clear all items from the cart
  clearCart: async (cartId: string) => {
    return api.post(cartApi.CLEAR_CART(cartId));
  },

  // Validate cart before checkout
  validateCart: async (cartId: string) => {
    return api.get(cartApi.VALIDATE_CART(cartId));
  },

  // Apply a coupon code to the cart
  applyCoupon: async (cartId: string, couponCode: string) => {
    return api.post(cartApi.APPLY_COUPON(cartId), { couponCode });
  },

  // Remove a coupon from the cart
  removeCoupon: async (cartId: string) => {
    return api.delete(cartApi.REMOVE_COUPON(cartId));
  }
};

// Helper functions for working with the checkout API
export const checkoutUtils = {
  // Create a checkout session
  createCheckoutSession: async (cartId: string, successUrl: string, cancelUrl: string) => {
    return api.post(checkoutApi.CREATE_SESSION(cartId), { successUrl, cancelUrl });
  },

  // Get checkout session status
  getCheckoutStatus: async (sessionId: string) => {
    return api.get(checkoutApi.GET_STATUS(sessionId));
  }
};

// Basic API helper functions
export const api = {
    // Get access token from cookies or localStorage
    getAccessToken: (): string | null => {
      // First try localStorage (most reliable across environments)
      if (typeof window !== 'undefined') {
        const localToken = localStorage.getItem('accessToken');
        if (localToken) {
          console.log('🔐 Using auth token from localStorage');
          return localToken;
        }
      }
      
      // Then try cookies as fallback
      if (typeof document !== 'undefined') {
        // Parse cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key.trim()] = value;
          return acc;
        }, {} as Record<string, string>);
        
        const cookieToken = cookies['accessToken'];
        if (cookieToken) {
          console.log('🔐 Using auth token from cookies');
          return cookieToken;
        }
      }
      
      console.log('⚠️ No auth token found in storage');
      return null;
    },
    
    // Check if refresh token exists in cookies
    hasRefreshToken: (): boolean => {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=').map(part => part.trim());
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);
        
        return !!cookies['refreshToken'];
      }
      return false;
    },
    
    // Refresh the access token using refresh token
    refreshAccessToken: async (): Promise<boolean> => {
      try {
        console.log('Attempting to refresh access token...');
        
        // We shouldn't use the axios instance directly to avoid interceptor loops
        // Instead, we'll make a direct POST request to the refresh token endpoint
      const response = await fetch(`${API_BASE_URL}${authApi.REFRESH_TOKEN}`, {
          method: 'POST',
          credentials: 'include', // Important for including cookies
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to refresh token: ${response.status}`);
        }   
        
        const data = await response.json();
        
        if (data && data.accessToken) {
          console.log('Access token refreshed successfully via api util');
          
          // Access the auth store directly to update the token
          const authStore = (await import('../store/useAuthStore')).default;
          authStore.setState({ 
            accessToken: data.accessToken,
            isAuthenticated: true
          });
          
          // If user data is included, update that too
          if (data.user) {
            authStore.setState({ user: data.user });
          }
          
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to refresh access token:', error);
        return false;
      }
    },
    
    get: async (url: string, token: string | null = null): Promise<any> => {
      try {
        // Get the freshest token available - either passed in or from localStorage
        let accessToken = token;
        if (!accessToken) {
          accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            console.log(`🔐 Using fresh token from localStorage for GET ${url}`);
          }
        }
        
        const headers: Record<string, string> = {};
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        
        console.log(`Making GET request to ${url} with auth:`, !!accessToken);
        const response = await axiosInstance.get(url, { headers });
        return response.data;
      } catch (error: any) {
        console.error(`API Error (GET ${url}):`, error);
        if (error.response) {
          // Server responded with an error
          return error.response.data;
        }
        return { error: error.message || 'Network error occurred' };
      }
    },
    
    post: async (url: string, data: Record<string, any> = {}, token: string | null = null, customHeaders: Record<string, string> = {}): Promise<any> => {
      try {
        // Get the freshest token available - either passed in or from localStorage
        let accessToken = token;
      if (!accessToken && url !== authApi.REFRESH_TOKEN) {
          accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            console.log(`🔐 Using fresh token from localStorage for POST ${url}`);
          }
        }
        
        // Merge any custom headers with the default headers
        const headers: Record<string, string> = { ...customHeaders };
        
        // Add authorization header if token exists
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
          console.log('🔐 [api.ts] Sending Authorization header:', accessToken.slice(0, 12) + '...');
        } else {
          console.warn('⚠️ [api.ts] No access token found for POST', url);
        }
        
        // Add cart token header if available in localStorage
        const cartToken = localStorage.getItem('cartToken');
        if (cartToken && !headers['X-Cart-Authorization']) {
          headers['X-Cart-Authorization'] = cartToken;
          console.log('🛒 [api.ts] Adding cart token header');
        }
        
        console.log(`Making POST request to ${url} with auth:`, !!accessToken);
        const response = await axiosInstance.post(url, data, { headers });
        return response.data;
      } catch (error: any) {
        console.error(`API Error (POST ${url}):`, error);
        if (error.response) {
          // Server responded with an error
          return error.response.data;
        }
        return { error: error.message || 'Network error occurred' };
      }
    },
    
    put: async (url: string, data: Record<string, any> = {}, token: string | null = null): Promise<any> => {
      try {
        // Get the freshest token available - either passed in or from localStorage
        let accessToken = token;
        if (!accessToken) {
          accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            console.log(`🔐 Using fresh token from localStorage for PUT ${url}`);
          }
        }
        
        const headers: Record<string, string> = {};
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        
        console.log(`Making PUT request to ${url} with auth:`, !!accessToken);
        const response = await axiosInstance.put(url, data, { headers });
        return response.data;
      } catch (error: any) {
        console.error(`API Error (PUT ${url}):`, error);
        if (error.response) {
          // Server responded with an error
          return error.response.data;
        }
        return { error: error.message || 'Network error occurred' };
      }
    },
    
    delete: async (url: string, token: string | null = null): Promise<any> => {
      try {
        // Get the freshest token available - either passed in or from localStorage
        let accessToken = token;
        if (!accessToken) {
          accessToken = localStorage.getItem('accessToken');
          if (accessToken) {
            console.log(`🔐 Using fresh token from localStorage for DELETE ${url}`);
          }
        }
        
        const headers: Record<string, string> = {};
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        
        console.log(`Making DELETE request to ${url} with auth:`, !!accessToken);
        const response = await axiosInstance.delete(url, { headers });
        return response.data;
      } catch (error: any) {
        console.error(`API Error (DELETE ${url}):`, error);
        if (error.response) {
          // Server responded with an error
          return error.response.data;
        }
        return { error: error.message || 'Network error occurred' };
      }
    },
    
    // Upload files (FormData) - useful for image uploads
    uploadFile: async (url: string, formData: FormData, token: string | null = null): Promise<any> => {
      try {
        // Debug formData contents
        console.log(`Preparing to upload file to ${url}`);
        const formDataEntries: string[] = [];
        for (const entry of formData.entries()) {
          if (entry[1] instanceof File) {
            const file = entry[1] as File;
            formDataEntries.push(`${entry[0]}: File(${file.name}, ${file.type}, ${file.size} bytes)`);
          } else {
            formDataEntries.push(`${entry[0]}: ${entry[1]}`);
          }
        }
        console.log('FormData contents:', formDataEntries);
        
        // Use provided token or get from cookies/storage
        let accessToken = token || api.getAccessToken();
        
        // If no access token but refresh token exists, try to refresh
        if (!accessToken && api.hasRefreshToken()) {
          await api.refreshAccessToken();
          accessToken = api.getAccessToken();
        }
        
        const headers: Record<string, string> = {
          // Don't set Content-Type for FormData, let the browser set it with boundary
        };
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        
        console.log(`Making upload request to ${url} with auth:`, !!accessToken);
        const response = await axiosInstance.post(url, formData, { 
          headers,
          // Add these options to make sure FormData is properly processed
          transformRequest: [(data) => data]
        });
        
        console.log(`Upload response status: ${response.status}`, response.data);
        return response.data;
      } catch (error: any) {
        console.error(`API Error (Upload ${url}):`, error);
        if (error.response) {
          // Server responded with an error
          console.error('Server response:', error.response.data);
          return error.response.data;
        }
        return { error: error.message || 'Network error occurred' };
      }
    },
    
    // Add this to the api object
    manualRefreshToken: async (): Promise<boolean> => {
      console.log('🔄 Manual API token refresh requested');
      
      // Check for refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('❌ No refresh token available for manual refresh');
        return false;
      }
      
      try {
        // Make a direct fetch call to avoid interceptor issues
      const response = await fetch(`${API_BASE_URL}${authApi.REFRESH_TOKEN}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.error('❌ Manual refresh failed:', response.status);
          return false;
        }
        
        const data = await response.json();
        
        if (data && data.accessToken) {
          console.log('✅ Manual token refresh successful');
          
          // Save to localStorage
          localStorage.setItem('accessToken', data.accessToken);
          
          // Update auth store if available
          try {
            const authStore = (await import('../store/useAuthStore')).default;
            authStore.setState({ 
              accessToken: data.accessToken,
              isAuthenticated: true,
              ...(data.user ? { user: data.user } : {})
            });
            console.log('✅ Auth store updated with new token');
          } catch (error) {
            console.error('Failed to update auth store, but token saved to localStorage');
          }
          
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('❌ Manual token refresh error:', error);
        return false;
      }
    },
};

// Type-safe API helper for GET requests
export const apiGet = async <T = any>(endpoint: string): Promise<T> => {
  const response = await api.get(endpoint);
  if (response.error) {
    throw new Error(response.error);
  }
  return response as T;
};

// Type-safe API helper for POST requests
export const apiPost = async <T = any>(endpoint: string, data: Record<string, any> = {}): Promise<T> => {
  const response = await api.post(endpoint, data);
  if (response.error) {
    throw new Error(response.error);
  }
  return response as T;
};

// Setup API interceptors
export function setupApiInterceptors() {
  console.log('🔧 Setting up API interceptors...');
  
  // Variable to track if token refresh is in progress
  let isRefreshing = false;
  
  // Queue of requests waiting for token refresh
  let refreshQueue: Array<(token: string | null) => void> = [];
  
  // Helper to process queued requests with new token
  const processQueue = (newToken: string | null) => {
    console.log(`🔄 Processing queued requests (${refreshQueue.length}), token:`, !!newToken);
      refreshQueue.forEach(callback => callback(newToken));
    refreshQueue = [];
  };
  
  // Update the request interceptor to check localStorage for tokens
  axiosInstance.interceptors.request.use(
    config => {
      // Always check localStorage first for the freshest token
      const localToken = localStorage.getItem('accessToken');
      if (localToken) {
        console.log('🔐 Request interceptor: Using token from localStorage');
        config.headers.Authorization = `Bearer ${localToken}`;
      } else {
        // Fall back to auth store if needed
      const token = api.getAccessToken();
      if (token) {
          console.log('🔐 Request interceptor: Using token from api.getAccessToken');
        config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    error => Promise.reject(error)
  );
  
  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Handle 401 Unauthorized errors (token expired)
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        // Debug info about the 401 error
        console.log('🔐 API 401 error intercepted:', originalRequest.url);
        
        // Avoid infinite loops
        if (originalRequest.url.includes('/auth/refresh-token')) {
          console.log('❌ Refresh token request failed, user needs to log in');
          
          // Clear tokens from localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Reset auth state and clear queue
          const authStore = (await import('../store/useAuthStore')).default;
          authStore.getState().clearState();
          processQueue(null);
          
          return Promise.reject(error);
        }
        
        // Set retry flag to prevent duplicate refresh attempts
        originalRequest._retry = true;
        
        // If refresh is already in progress, queue this request
        if (isRefreshing) {
          console.log('🔄 Token refresh in progress, queueing request...');
          
          return new Promise((resolve, reject) => {
            refreshQueue.push(newToken => {
              if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(axiosInstance(originalRequest));
              } else {
                reject(error);
              }
            });
          });
        }
        
        // Start refresh process
        isRefreshing = true;
        console.log('🔄 Token expired, attempting to refresh...');
        
        try {
          // Use direct fetch to avoid interceptor loops
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          // Make direct fetch call to the refresh endpoint
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken }),
            credentials: 'include'
          });
          
          if (!refreshResponse.ok) {
            throw new Error(`Refresh failed with status: ${refreshResponse.status}`);
          }
          
          const data = await refreshResponse.json();
          
          if (data && data.accessToken) {
            // Save new token to localStorage
            localStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken);
            }
            
            // Update auth store
            const authStore = (await import('../store/useAuthStore')).default;
            authStore.getState().setTokenAndUser(data.accessToken, data.user || null);
            
            console.log('✅ Token refreshed, updating requests and continuing');
            
              // Update original request with new token
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            
              // Process any queued requests with the new token
            processQueue(data.accessToken);
            
              // Continue with original request
            isRefreshing = false;
              return axiosInstance(originalRequest);
          } else {
            throw new Error('Refresh response did not contain access token');
          }
        } catch (refreshError) {
          console.error('❌ Error refreshing token:', refreshError);
          
          // Clear tokens from localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Reset auth state and clear queue
          const authStore = (await import('../store/useAuthStore')).default;
          authStore.getState().clearState();
          processQueue(null);
          isRefreshing = false;
          
          return Promise.reject(error);
        }
      }
      
      // For other errors, log and reject
      if (error.response) {
        // Log API errors for debugging
        console.error(`API Error: ${error.response.status}`, error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('API Error: No response received', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('API Error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );
}

export default api;
  