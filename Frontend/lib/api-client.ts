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
    
    // First get the token from our auth API
    let token = null;
    try {
      const tokenResponse = await fetch('/api/auth/token', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (tokenResponse.ok) {
        const data = await tokenResponse.json();
        token = data.token;
      } else {
        console.warn(`Token retrieval failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
      }
    } catch (tokenError) {
      console.error('Error retrieving auth token:', tokenError);
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log request details for debugging (only for specific endpoints)
    if (endpoint.includes('/git/repository/') || endpoint.includes('/github/')) {
      console.log(`Making API request to: ${url.toString()}`);
      console.log('With headers:', headers);
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    
    if (!response.ok) {
      return await handleResponseError(response, endpoint);
    }
    
    return await response.json();
  },
  
  /**
   * Make a POST request to the API
   * @param endpoint API endpoint path
   * @param data Request body data
   */
  async post(endpoint: string, data?: any) {
    // First get the token from our auth API
    const tokenResponse = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include'
    }).then(res => res.json())
      .catch(() => ({ token: null }));
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(tokenResponse.token ? { 'Authorization': `Bearer ${tokenResponse.token}` } : {})
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      await handleResponseError(response);
    }
    
    return await response.json();
  },
  
  /**
   * Make a PUT request to the API
   * @param endpoint API endpoint path
   * @param data Request body data
   */
  async put(endpoint: string, data?: any) {
    // First get the token from our auth API
    const tokenResponse = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include'
    }).then(res => res.json())
      .catch(() => ({ token: null }));
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(tokenResponse.token ? { 'Authorization': `Bearer ${tokenResponse.token}` } : {})
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      await handleResponseError(response);
    }
    
    return await response.json();
  },
  
  /**
   * Make a DELETE request to the API
   * @param endpoint API endpoint path
   */
  async delete(endpoint: string) {
    // First get the token from our auth API
    const tokenResponse = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include'
    }).then(res => res.json())
      .catch(() => ({ token: null }));
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(tokenResponse.token ? { 'Authorization': `Bearer ${tokenResponse.token}` } : {})
      },
    });
    
    if (!response.ok) {
      await handleResponseError(response);
    }
    
    return await response.json();
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
  }
};

/**
 * Handle API response errors
 * @param response Fetch Response object
 * @param endpoint The endpoint that was requested (for logging)
 */
async function handleResponseError(response: Response, endpoint?: string) {
  let errorMessage = 'An error occurred';
  let errorData = {};
  
  try {
    errorData = await response.json();
    errorMessage = errorData?.message || errorData?.detail || errorData?.error || errorMessage;
  } catch (e) {
    // If we can't parse the JSON, use status text
    errorMessage = response.statusText || errorMessage;
  }
  
  console.error(`API Error (${response.status}): ${endpoint || 'unknown endpoint'}`, errorMessage, errorData);
  
  // Special handling for GitHub repository endpoints - return the error instead of throwing
  if (endpoint && (endpoint.includes('/git/repository/') || endpoint.includes('/github/'))) {
    return { error: errorMessage, status: response.status, ...errorData };
  }
  
  // Special handling for authentication errors
  if (response.status === 401) {
    // Redirect to login on authentication errors
    // Use client-side navigation if available, otherwise fallback
    if (typeof window !== 'undefined') {
      window.location.href = `/login?redirectTo=${encodeURIComponent(window.location.pathname)}`;
    }
  }
  
  throw new Error(errorMessage);
}