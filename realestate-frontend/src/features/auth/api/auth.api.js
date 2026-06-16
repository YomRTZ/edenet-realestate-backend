import { api } from '../../../lib/axios';

export const authApi = {
  getNonce: async (walletAddress) => {
    try {
      const { data } = await api.post('/auth/nonce', { walletAddress });
      return data.nonce;
    } catch (err) {
      // fallback to dev nonce endpoint when available (local development)
      try {
        const { data } = await api.post('/auth/dev-nonce');
        return data.nonce;
      } catch {
        try {
          const { data } = await api.post('/auth/dev-nonce', { walletAddress });
          return data.nonce;
        } catch {
          throw err; // rethrow original error
        }
      }
    }
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  login: async (walletAddress, signature) => {
    const { data } = await api.post('/auth/login', { walletAddress, signature });
    // Backend sets httpOnly cookies; frontend does not persist tokens.
    return data;
  },

  updateStatus: async (action) => {
    const { data } = await api.post('/auth/citizen/update-status', { action });
    return data;
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout');
    // Backend clears cookies.
    return data;
  },

  /**
   * Manually refresh tokens (if needed). Cookies are refreshed server-side.
   */
  refresh: async () => {
    const { data } = await api.post('/auth/refresh');
    return data;
  },
};

