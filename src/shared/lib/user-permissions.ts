'use client';

import Cookies from 'js-cookie';

export const PERMISSION_COOKIE_NAME = 'user-permissions';

/**
 * Save user permissions to cookie for server-side access
 * Called client-side after permissions are fetched
 */
export function saveUserPermissionsToCookie(permissions: string[]): void {
  if (typeof window === 'undefined') return;
  const secure = window.location.protocol === 'https:';
  Cookies.set(PERMISSION_COOKIE_NAME, JSON.stringify(permissions), {
    expires: 1,
    sameSite: 'lax',
    path: '/',
    secure,
  });
}

/**
 * Clear the permissions cookie
 * Called on logout
 */
export function clearUserPermissionsCookie(): void {
  if (typeof window === 'undefined') return;
  Cookies.remove(PERMISSION_COOKIE_NAME, { path: '/' });
}
