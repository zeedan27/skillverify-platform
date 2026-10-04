import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skillverify_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// SOP-005: Automatic token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('skillverify_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          if (res.data.success) {
            const { accessToken, refreshToken: newRefresh } = res.data.data;
            localStorage.setItem('skillverify_token', accessToken);
            if (newRefresh) localStorage.setItem('skillverify_refresh_token', newRefresh);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch {
          localStorage.removeItem('skillverify_token');
          localStorage.removeItem('skillverify_refresh_token');
          localStorage.removeItem('skillverify_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
