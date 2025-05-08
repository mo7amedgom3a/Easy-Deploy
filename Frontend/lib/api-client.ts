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
    const tokenResponse = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include'
    }).then(res => res.json())
      .catch(() => ({ token: null }));
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(tokenResponse.token ? { 'Authorization': `Bearer ${tokenResponse.token}` } : {})
      }
    });
    
    if (!response.ok) {
      await handleResponseError(response);
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
 */
async function handleResponseError(response: Response) {
  let errorMessage = 'An error occurred';
  
  try {
    const errorData = await response.json();
    errorMessage = errorData.message || errorData.detail || errorMessage;
  } catch (e) {
    // If we can't parse the JSON, use status text
    errorMessage = response.statusText || errorMessage;
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