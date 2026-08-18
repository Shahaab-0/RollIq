import axios from 'axios';
import { API_BASE_URL } from '@env';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './tokenStorage';
import { store } from '../redux/store';
import { sessionChanged } from '../redux/authSlice';

export const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use(async config => {
  const token = await getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Refresh calls go through a bare axios instance -- routing them through
// apiClient would re-enter this same response interceptor and risk a loop.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    await saveTokens({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_at,
    });
    return data.access_token as string;
  } catch {
    return null;
  }
}

// A 401 from these means "credentials/token rejected", not "access token
// expired" -- retrying them after a refresh would be pointless (or, for
// /auth/refresh itself, recursive). Every other endpoint -- including
// /auth/me -- is a normal protected endpoint that legitimately 401s when
// the access token expires and should go through refresh-and-retry.
const CREDENTIAL_PATHS = ['/auth/signin', '/auth/signup', '/auth/refresh', '/auth/signout'];

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const isCredentialEndpoint = CREDENTIAL_PATHS.some(path => originalRequest?.url?.startsWith(path));

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried && !isCredentialEndpoint) {
      originalRequest._retried = true;
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newAccessToken = await refreshPromise;
      refreshPromise = null;

      if (newAccessToken) {
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return apiClient(originalRequest);
      }

      await clearTokens();
      store.dispatch(sessionChanged(null));
    }

    return Promise.reject(error);
  },
);
