const getBaseUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  // Use same host on port 5000 for API
  return `${window.location.protocol}//${hostname}:5000/api`;
};

class ApiClient {
  constructor() {
    this.accessToken = localStorage.getItem('trimtime_token') || null;
    this.refreshInProgress = null;
  }

  setToken(token) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('trimtime_token', token);
    } else {
      localStorage.removeItem('trimtime_token');
    }
  }

  getToken() {
    return this.accessToken;
  }

  async request(endpoint, options = {}) {
    const url = `${getBaseUrl()}${endpoint}`;
    
    // Setup headers
    options.headers = options.headers || {};
    if (this.accessToken) {
      options.headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    // Default to JSON body if not multipart
    if (!(options.body instanceof FormData) && !options.headers['Content-Type']) {
      options.headers['Content-Type'] = 'application/json';
    }

    // Send credentials (cookies) for refresh token cookies
    options.credentials = 'include';

    try {
      let response = await fetch(url, options);

      // Handle token expiration
      if (response.status === 401) {
        const data = await response.clone().json().catch(() => ({}));
        
        if (data.code === 'TOKEN_EXPIRED') {
          // Token expired, attempt refresh
          const success = await this.refreshToken();
          if (success) {
            // Retry request with new token
            options.headers['Authorization'] = `Bearer ${this.accessToken}`;
            response = await fetch(url, options);
          } else {
            // Refresh failed, clear session
            this.setToken(null);
            localStorage.removeItem('trimtime_user');
            window.dispatchEvent(new Event('auth_session_expired'));
          }
        }
      }

      return response;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  async refreshToken() {
    if (this.refreshInProgress) {
      return this.refreshInProgress;
    }

    this.refreshInProgress = (async () => {
      try {
        const response = await fetch(`${getBaseUrl()}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include' // Send refresh cookie
        });

        if (response.ok) {
          const data = await response.json();
          this.setToken(data.accessToken);
          this.refreshInProgress = null;
          return true;
        }
        
        this.refreshInProgress = null;
        return false;
      } catch (err) {
        console.error("Failed to refresh token:", err);
        this.refreshInProgress = null;
        return false;
      }
    })();

    return this.refreshInProgress;
  }

  // HTTP helper wrappers
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
