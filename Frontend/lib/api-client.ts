// Add token caching to reduce repeated API calls
let cachedToken: { token: string | null; expiresAt: number } = { token: null, expiresAt: 0 };

/**
 * Get the auth token, using cached token if available and not expired
 */
async function getAuthToken() {
  const now = Date.now();
  
  // Use cached token if available and not expired (expire after 5 minutes)
  if (cachedToken.token && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }
  
  // Otherwise, fetch a new token
  try {
    const tokenResponse = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (tokenResponse.ok) {
      const data = await tokenResponse.json();
      // Cache the token for 5 minutes
      cachedToken = {
        token: data.token,
        expiresAt: now + 5 * 60 * 1000 // 5 minutes in milliseconds
      };
      return data.token;
    } else {
      console.warn(`Token retrieval failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
      cachedToken = { token: null, expiresAt: 0 };
      return null;
    }
  } catch (tokenError) {
    console.error('Error retrieving auth token:', tokenError);
    cachedToken = { token: null, expiresAt: 0 };
    return null;
  }
}

import { API_URL } from "./constants";

/**
 * Secure API client for making authenticated requests
 * Uses HTTP-only cookies for authentication
 */
export const apiClient = {
  /**
   * Make a GET request to the API
   * @param endpoint API endpoint path
   * @param params Optional query parameters
   */
  async get(endpoint: string, params?: Record<string, string>) {
    const url = new URL(`${API_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    // Get token using the cached function instead of fetching each time
    const token = await getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // If no token is available and the endpoint requires authentication, handle this gracefully
      if (endpoint.startsWith('/projects') || endpoint.includes('/git/') || endpoint.includes('/users/')) {
        console.warn(`No auth token available for authenticated endpoint: ${endpoint}`);
        throw new Error('Authentication required. Please login again.');
      }
    }
    
    // Log request details for debugging (only for specific endpoints)
    if (endpoint.includes('/git/repository/') || endpoint.includes('/github/') || endpoint === '/projects/') {
      console.log(`Making API request to: ${url.toString()}`);
      console.log('With headers:', headers);
    }
    
    try {
      // Set a reasonable timeout for fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        credentials: 'include',
        signal: controller.signal
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return await handleResponseError(response, endpoint);
      }
      
      // If the response is 204 No Content, return an empty object
      if (response.status === 204) {
        return {};
      }
      
      // Handle empty responses
      const text = await response.text();
      if (!text) {
        console.warn(`Empty response from ${endpoint}`);
        return {};
      }
      
      try {
        return JSON.parse(text);
      } catch (jsonError) {
        console.error(`Failed to parse JSON response from ${endpoint}:`, jsonError, 'Response text:', text);
        throw new Error(`Invalid JSON response from ${endpoint}`);
      }
    } catch (fetchError) {
      console.error(`Fetch error for ${endpoint}:`, fetchError);
      
      // Handle network errors like "Failed to fetch" more gracefully
      let errorMessage = 'Network error';
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again later.';
        } else {
          errorMessage = fetchError.message;
        }
      }
      
      // For debugging - show the actual API URL that failed
      console.error(`API URL that failed: ${url.toString()}`);
      
      // For project endpoints, we want to return a useful error to allow fallback to GitHub data
      if (endpoint === '/projects/' || endpoint.startsWith('/projects')) {
        return { 
          error: errorMessage || 'Failed to fetch projects', 
          status: 'error',
          apiUrl: url.toString() // Include the URL for debugging
        };
      }
      
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Make a POST request to the API
   * @param endpoint API endpoint path
   * @param data Request body data
   */
  async post(endpoint: string, data?: any) {
    // Get token using the cached function instead of fetching each time
    const token = await getAuthToken();
    
    if (!token && (endpoint.startsWith('/projects') || endpoint.includes('/git/') || endpoint.includes('/users/'))) {
      console.warn(`No auth token available for authenticated endpoint: ${endpoint}`);
      throw new Error('Authentication required. Please login again.');
    }
    
    try {
      // Set a reasonable timeout for fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        await handleResponseError(response, endpoint);
      }
      
      // If the response is 204 No Content, return an empty object
      if (response.status === 204) {
        return {};
      }
      
      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return {};
      }
      
      return JSON.parse(text);
    } catch (fetchError) {
      console.error(`Fetch error for ${endpoint}:`, fetchError);
      
      // Handle network errors like "Failed to fetch" more gracefully
      let errorMessage = 'Network error';
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again later.';
        } else {
          errorMessage = fetchError.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Make a PUT request to the API
   * @param endpoint API endpoint path
   * @param data Request body data
   */
  async put(endpoint: string, data?: any) {
    // Get token using the cached function instead of fetching each time
    const token = await getAuthToken();
    
    if (!token && (endpoint.startsWith('/projects') || endpoint.includes('/git/') || endpoint.includes('/users/'))) {
      console.warn(`No auth token available for authenticated endpoint: ${endpoint}`);
      throw new Error('Authentication required. Please login again.');
    }
    
    try {
      // Set a reasonable timeout for fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        await handleResponseError(response, endpoint);
      }
      
      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return {};
      }
      
      return JSON.parse(text);
    } catch (fetchError) {
      console.error(`Fetch error for ${endpoint}:`, fetchError);
      
      // Handle network errors like "Failed to fetch" more gracefully
      let errorMessage = 'Network error';
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again later.';
        } else {
          errorMessage = fetchError.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Make a DELETE request to the API
   * @param endpoint API endpoint path
   */
  async delete(endpoint: string) {
    // Get token using the cached function instead of fetching each time
    const token = await getAuthToken();
    
    if (!token && (endpoint.startsWith('/projects') || endpoint.includes('/git/') || endpoint.includes('/users/'))) {
      console.warn(`No auth token available for authenticated endpoint: ${endpoint}`);
      throw new Error('Authentication required. Please login again.');
    }
    
    try {
      // Set a reasonable timeout for fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        signal: controller.signal
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        await handleResponseError(response, endpoint);
      }
      
      // Handle empty responses
      const text = await response.text();
      if (!text) {
        return {};
      }
      
      return JSON.parse(text);
    } catch (fetchError) {
      console.error(`Fetch error for ${endpoint}:`, fetchError);
      
      // Handle network errors like "Failed to fetch" more gracefully
      let errorMessage = 'Network error';
      
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again later.';
        } else {
          errorMessage = fetchError.message;
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      await this.get('/users/me');
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get GitHub user information
   */
  async getGithubUserInfo() {
    try {
      return await this.get('/users/github/me');
    } catch (error) {
      console.error('Failed to get GitHub user info:', error);
      return null;
    }
  },

  /**
   * Manually invalidate the token cache (useful after logout)
   */
  invalidateTokenCache() {
    cachedToken = { token: null, expiresAt: 0 };
  }
};

/**
 * Handle API response errors
 * @param response Fetch Response object
 * @param endpoint The endpoint that was requested (for logging)
 */
async function handleResponseError(response: Response, endpoint?: string) {
  let errorMessage = 'An error occurred';
  let errorData: Record<string, any> = {};
  
  try {
    const text = await response.text();
    if (text) {
      try {
        errorData = JSON.parse(text);
        errorMessage = errorData?.message || errorData?.detail || errorData?.error || errorMessage;
      } catch (e) {
        // If we can't parse the JSON, use the text as the error message
        errorMessage = text;
      }
    } else {
      errorMessage = response.statusText || errorMessage;
    }
  } catch (e) {
    // If we can't read the response text, use status text
    errorMessage = response.statusText || errorMessage;
  }
  
  console.error(`API Error (${response.status}): ${endpoint || 'unknown endpoint'}`, errorMessage, errorData);
  
  // Special handling for project endpoints
  if (endpoint === '/projects/') {
    return { error: errorMessage, status: response.status, ...errorData };
  }
  
  // Special handling for GitHub repository endpoints - return the error instead of throwing
  if (endpoint && (endpoint.includes('/git/repository/') || endpoint.includes('/github/'))) {
    return { error: errorMessage, status: response.status, ...errorData };
  }
  
  // Special handling for authentication errors
  if (response.status === 401) {
    // Invalidate the token cache on auth errors
    cachedToken = { token: null, expiresAt: 0 };
    
    // Redirect to login on authentication errors
    // Use client-side navigation if available, otherwise fallback
    if (typeof window !== 'undefined') {
      window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
      return { error: 'Authentication required', status: 401 };
    }
  }
  
  throw new Error(errorMessage);
}