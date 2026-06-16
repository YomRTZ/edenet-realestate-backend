import { api } from './axios.js';

/**
 * Silently refresh the session token.
 * Note: refresh/session tokens are stored as httpOnly cookies by the backend,
 * so the frontend does NOT read/write tokens from localStorage.
 */
const silentRefresh = async () => {
  console.log('🔄 Attempting silent refresh...');

  try {
    await api.post('/auth/refresh');
    console.log('✅ Silent refresh successful');
    return true;
  } catch (err) {
    console.error('❌ Silent refresh failed:', err.response?.data?.error || err.message);
    window.dispatchEvent(
      new CustomEvent('auth:logout', { detail: { reason: 'refresh_failed' } })
    );
    return false;
  }
};

/**
 * Setup axios interceptor for automatic token refresh on 401.
 * Uses cookie-based auth; does not set Authorization header.
 */
const setupAxiosInterceptor = () => {
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error) => {
    failedQueue.forEach((prom) => {
      if (error) prom.reject(error);
      else prom.resolve();
    });
    failedQueue = [];
  };

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => api(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshed = await silentRefresh();
          if (refreshed) {
            processQueue(null);
            return api(originalRequest);
          }

          processQueue(new Error('Silent refresh failed'));
          return Promise.reject(error);
        } catch (err) {
          processQueue(err);
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

export const authService = {
  silentRefresh,
  setupAxiosInterceptor,

  /**
   * Initialize auth service - call this once on app startup.
   */
  init() {
    setupAxiosInterceptor();
    console.log('Auth service initialized (cookie-based tokens)');
  },

  /**
   * Handle login.
   * Backend sets httpOnly cookies; frontend does not persist tokens.
   */
  handleLogin() {
    console.log('Login successful (cookie-based).');
  },

  /**
   * Handle logout.
   */
  handleLogout() {
    console.log('Logged out (cookies cleared server-side).');
  },
};

