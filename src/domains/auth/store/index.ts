import { create } from 'zustand';
import type { AuthTokenData, User } from '../types';

const SESSION_COOKIE_MAX_AGE = 60 * 60; // 1 hour — fallback max-age

function getCookieMaxAge(expiresAt: string | null | undefined): number {
  if (!expiresAt) return SESSION_COOKIE_MAX_AGE;

  // Try parsing as numeric timestamp (seconds or milliseconds)
  const numeric = Number(expiresAt);
  if (!Number.isNaN(numeric)) {
    const timestampMs = numeric > 1e12 ? numeric : numeric * 1000;
    const seconds = Math.floor((timestampMs - Date.now()) / 1000);
    return seconds > 0 ? seconds : SESSION_COOKIE_MAX_AGE;
  }

  // Try parsing as ISO 8601 string
  const date = new Date(expiresAt);
  if (!Number.isNaN(date.getTime())) {
    const seconds = Math.floor((date.getTime() - Date.now()) / 1000);
    return seconds > 0 ? seconds : SESSION_COOKIE_MAX_AGE;
  }

  return SESSION_COOKIE_MAX_AGE;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  isAuthenticated: boolean;

  setUser: (user: User) => void;
  setToken: (token: string) => void;
  // rememberMe (localStorage) path is not wired up yet — everything uses sessionStorage.
  // When the "remember me" checkbox is added to the login form, restore the
  // localStorage branch here and in axios.ts.
  setAuthState: (data: AuthTokenData) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => set({ token }),

  setAuthState: (data: AuthTokenData) => {
    sessionStorage.setItem('accessToken', data.accessToken);
    sessionStorage.setItem('refreshToken', data.refreshToken);
    sessionStorage.setItem('accessTokenExpiresAt', data.accessTokenExpiresAt);
    sessionStorage.setItem('refreshTokenExpiresAt', data.refreshTokenExpiresAt);

    // Set cookies with proper values (avoid storing literal "null")
    // Access token uses session max-age; refresh token uses its actual expiry
    // so the proxy can still see it when the access token cookie expires.
    if (data.accessToken) {
      // biome-ignore lint/suspicious/noDocumentCookie: Needed for middleware compatibility
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${SESSION_COOKIE_MAX_AGE}; SameSite=Lax`;
    }
    if (data.refreshToken) {
      const refreshMaxAge = getCookieMaxAge(data.refreshTokenExpiresAt);
      // biome-ignore lint/suspicious/noDocumentCookie: Needed for middleware compatibility
      document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${refreshMaxAge}; SameSite=Lax`;
    }
    if (data.accessTokenExpiresAt) {
      // biome-ignore lint/suspicious/noDocumentCookie: Needed for middleware compatibility
      document.cookie = `accessTokenExpiresAt=${data.accessTokenExpiresAt}; path=/; max-age=${SESSION_COOKIE_MAX_AGE}; SameSite=Lax`;
    }
    if (data.refreshTokenExpiresAt) {
      const refreshMaxAge = getCookieMaxAge(data.refreshTokenExpiresAt);
      // biome-ignore lint/suspicious/noDocumentCookie: Needed for middleware compatibility
      document.cookie = `refreshTokenExpiresAt=${data.refreshTokenExpiresAt}; path=/; max-age=${refreshMaxAge}; SameSite=Lax`;
    }

    set({
      token: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpiresAt: data.accessTokenExpiresAt,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt,
      isAuthenticated: true,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessTokenExpiresAt');
      sessionStorage.removeItem('refreshTokenExpiresAt');

      const cookieNames = [
        'accessToken',
        'refreshToken',
        'accessTokenExpiresAt',
        'refreshTokenExpiresAt',
      ];
      cookieNames.forEach((name) => {
        // biome-ignore lint/suspicious/noDocumentCookie: Needed for middleware compatibility
        document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
      });
    }
    set({
      user: null,
      token: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      isAuthenticated: false,
    });
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;

    const token = sessionStorage.getItem('accessToken');
    const refreshToken = sessionStorage.getItem('refreshToken');
    const accessTokenExpiresAt = sessionStorage.getItem('accessTokenExpiresAt');
    const refreshTokenExpiresAt = sessionStorage.getItem('refreshTokenExpiresAt');

    if (token) {
      // Re-sync cookies if they expired while sessionStorage still has tokens.
      // Middleware and SSR server components rely on these cookies.
      const hasCookie = document.cookie.split(';').some((c) => c.trim().startsWith('accessToken='));
      if (!hasCookie) {
        // biome-ignore lint/suspicious/noDocumentCookie: Needed for middleware compatibility
        document.cookie = `accessToken=${token}; path=/; max-age=${SESSION_COOKIE_MAX_AGE}; SameSite=Lax`;
        if (refreshToken) {
          const refreshMaxAge = getCookieMaxAge(refreshTokenExpiresAt);
          // biome-ignore lint/suspicious/noDocumentCookie: Needed for middleware compatibility
          document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${refreshMaxAge}; SameSite=Lax`;
        }
      }

      set({
        token,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        isAuthenticated: true,
      });
    }
  },
}));
