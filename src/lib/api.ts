import { getAccessToken, refreshAccessToken, shouldRefreshToken } from './auth';
import { API_BASE_URL } from '@/config/apiConfig';
import useAuthStore from '@/store/useAuthStore';

/**
 * Make an authenticated API request
 * @param path API endpoint path
 * @param options fetch options
 * @returns Promise with response data
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Check if token needs refresh before making any API call
  if (shouldRefreshToken()) {
    await refreshAccessToken();
  }

  // Get the access token
  const accessToken = getAccessToken();

  // Prepare headers
  const headers = new Headers(options.headers || {});
  
  // Set content type if not provided
  if (!headers.has('Content-Type') && !options.body?.toString().includes('FormData')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Set authorization header if token exists
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  // Prepare the request
  const requestOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Include cookies for authentication
  };

  // Ensure path starts with / if not already
  const formattedPath = path.startsWith('/') ? path : `/${path}`;

  // Full API URL
  const url = `${API_BASE_URL}${formattedPath}`;

  try {
    // Make the request
    const response = await fetch(url, requestOptions);

    // Handle 401 Unauthorized - attempt to refresh token and retry
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      
      // If refresh successful, update authorization header and retry request
      if (refreshed) {
        const newAccessToken = getAccessToken();
        if (newAccessToken) {
          headers.set('Authorization', `Bearer ${newAccessToken}`);
          const retryResponse = await fetch(url, {
            ...requestOptions,
            headers,
          });
          
          if (retryResponse.ok) {
            return await retryResponse.json() as T;
          }
          
          throw new Error(`API request failed with status: ${retryResponse.status}`);
        }
      }
      
      // If refresh failed or retry failed, throw error
      throw new Error('Authentication failed');
    }

    // Handle regular error responses
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    // Return the data
    return await response.json() as T;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Make a GET request
 */
export const apiGet = <T>(path: string, options: RequestInit = {}): Promise<T> => {
  return apiRequest<T>(path, { ...options, method: 'GET' });
};

/**
 * Make a POST request
 */
export const apiPost = <T>(path: string, data?: any, options: RequestInit = {}): Promise<T> => {
  return apiRequest<T>(path, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Make a PUT request
 */
export const apiPut = <T>(path: string, data?: any, options: RequestInit = {}): Promise<T> => {
  return apiRequest<T>(path, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Make a PATCH request
 */
export const apiPatch = <T>(path: string, data?: any, options: RequestInit = {}): Promise<T> => {
  return apiRequest<T>(path, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
};

/**
 * Make a DELETE request
 */
export const apiDelete = <T>(path: string, options: RequestInit = {}): Promise<T> => {
  return apiRequest<T>(path, { ...options, method: 'DELETE' });
};

/**
 * Handle client auth state from store or token
 */
export function getAuthFromStore() {
  // Get state directly from store
  const store = useAuthStore.getState();
  
  return {
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    token: store.accessToken || getAccessToken()
  };
} 