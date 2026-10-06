import axios from 'axios';

import { useAuthStore } from '@/domains/auth/store';
import type { AuthTokenData } from '@/domains/auth/types';
import { API_ENDPOINTS } from '@/shared/constants';
import { getApiPath } from '@/shared/lib/api-config';
import { throttledToast } from '@/shared/lib/toast';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import type { ApiSuccessResponse } from '@/types/api';

const SLOW_REQUEST_THRESHOLD_MS = 3000;

const BASE_URL = '/api';

// Separate instance with no interceptors — used only for refresh calls
// to avoid triggering the 401 handler recursively
const silentApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null = null) {
  for (const item of failedQueue) {
    if (error) item.reject(error);
    else item.resolve(token!);
  }
  failedQueue = [];
}

function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('refreshToken');
}

function clearAuthAndRedirect() {
  if (typeof window === 'undefined') return;

  // Clear permission and project state so the next session starts clean
  localStorage.removeItem('permission-store');
  localStorage.removeItem('selected-project');

  useAuthStore.getState().logout();

  // Build login URL with returnUrl and current portal so PortalSelectionPage
  // can redirect back after the user picks the same portal
  const returnUrl = window.location.pathname + window.location.search;
  const loginUrl = new URL('/login', window.location.origin);
  loginUrl.searchParams.set('returnUrl', returnUrl);

  // Read portal from cookie to pass as query param
  const portalCookie = getCookieValue('portal-selection');
  if (portalCookie) {
    try {
      const { portal } = JSON.parse(portalCookie);
      if (portal === 'company' || portal === 'project') {
        loginUrl.searchParams.set('portal', portal);
      }
    } catch {
      // ignore malformed cookie
    }
  }

  window.location.href = loginUrl.toString();
}

function getCookieValue(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

api.interceptors.request.use((config) => {
  (config as any).metadata = { startTime: Date.now() };

  if (typeof window !== 'undefined') {
    // Read token from cookies (set by server-side setAuthState)
    // Fallback to sessionStorage for backward compatibility
    let token = getCookieValue('accessToken');
    if (!token) {
      token = sessionStorage.getItem('accessToken');
    }
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const selectedProjectId = useSelectedProjectStore.getState().selectedProjectId;
    if (selectedProjectId) {
      config.headers['x-project-id'] = selectedProjectId;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const shouldForce401 = typeof window !== 'undefined' && (window as any).__DEBUG_FORCE_401__;
    if (shouldForce401 && !(response.config as any)._retry) {
      (response.config as any)._retry = true;
      const error: any = new Error('DEBUG: Forcing 401');
      error.response = { status: 401, data: response.data };
      error.config = response.config;
      return Promise.reject(error);
    }

    const startTime = (response.config as any).metadata?.startTime;
    if (startTime) {
      const duration = Date.now() - startTime;
      if (duration > SLOW_REQUEST_THRESHOLD_MS) {
        throttledToast.warning('The server is responding slowly. Please check your connection.');
      }
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const shouldForce401 = typeof window !== 'undefined' && (window as any).__DEBUG_FORCE_401__;

    // Detect timeout / network instability
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throttledToast.error('Request timed out. Your network may be unstable.');
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      throttledToast.error('Network error. Please check your internet connection.');
    }

    // Debug: Force 401 on next request (set via console: window.__DEBUG_FORCE_401__ = true)
    if (shouldForce401 && !originalRequest._retry) {
      error.response = error.response || {};
      error.response.status = 401;
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't attempt refresh when the refresh endpoint itself returns 401
    if (originalRequest.url?.includes(getApiPath(API_ENDPOINTS.AUTH.REFRESH))) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // Don't attempt refresh or redirect for login endpoint on 401
    if (originalRequest.url?.includes(getApiPath(API_ENDPOINTS.AUTH.LOGIN))) {
      return Promise.reject(error);
    }

    // Queue concurrent requests while a refresh is already in-flight
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const storedRefreshToken = getStoredRefreshToken();
    if (!storedRefreshToken) {
      console.warn(
        '[axios] 401 error: no refresh token in sessionStorage',
        'sessionStorage keys:',
        typeof window !== 'undefined' ? Object.keys(window.sessionStorage) : 'N/A'
      );
      isRefreshing = false;
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    try {
      const response = await silentApi.post<ApiSuccessResponse<AuthTokenData>>(
        getApiPath(API_ENDPOINTS.AUTH.REFRESH),
        {
          refreshToken: storedRefreshToken,
        }
      );

      const tokenData = response.data.data;
      useAuthStore.getState().setAuthState(tokenData);

      processQueue(null, tokenData.accessToken);
      originalRequest.headers.Authorization = `Bearer ${tokenData.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
