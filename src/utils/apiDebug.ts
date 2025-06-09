// API Debug Utilities
export function debugApiUrl() {
  // Import API_BASE_URL and API_ENDPOINTS directly from api.ts
  const { API_BASE_URL, API_ENDPOINTS } = require('./api');
  
  // Log out all endpoint URLs
  console.log('API_BASE_URL:', API_BASE_URL);
  
  // Log login endpoint
  const loginUrl = `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`;
  console.log('Login URL:', loginUrl);
  
  // Check if we're missing /api in the URLs
  const hasApiPrefix = API_BASE_URL.includes('/api');
  console.log('API_BASE_URL includes /api:', hasApiPrefix);
  
  // Check if endpoints start with /api
  const loginHasApiPrefix = API_ENDPOINTS.AUTH.LOGIN.startsWith('/api');
  console.log('LOGIN endpoint starts with /api:', loginHasApiPrefix);
  
  return {
    API_BASE_URL,
    LOGIN_URL: loginUrl,
    hasApiPrefix,
    loginHasApiPrefix
  };
} 