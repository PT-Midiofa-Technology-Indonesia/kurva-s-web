import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { checkRoutePermission } from '@/shared/lib/permission-guard';
import { resolvePortalGuardRedirect } from '@/shared/lib/portal-guard';
import type { PortalType } from '@/shared/lib/portal';

const publicPaths = ['/login', '/register', '/forgot-password'];
const accessiblePaths = ['/portal-selection', '/403'];
const alwaysPublicPaths = ['/privacy-policy', '/delete-account'];
const authTokenKey = 'accessToken';
const refreshTokenKey = 'refreshToken';
const portalCookieKey = 'portal-selection';
const permissionCookieKey = 'user-permissions';

// Server-safe permission cookie parser — no 'use client' deps
function parsePermissionsCookie(value: string | undefined): string[] | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((p) => typeof p === 'string') ? parsed : null;
  } catch {
    return null;
  }
}

function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true;
  return publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAccessiblePath(pathname: string): boolean {
  return accessiblePaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAlwaysPublicPath(pathname: string): boolean {
  return alwaysPublicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function getTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(authTokenKey)?.value ?? null;
}

function hasRefreshToken(request: NextRequest): boolean {
  return !!request.cookies.get(refreshTokenKey)?.value;
}

function getPortalFromRequest(request: NextRequest): PortalType | null {
  const cookie = request.cookies.get(portalCookieKey)?.value;
  if (!cookie) return null;

  try {
    const { portal } = JSON.parse(cookie);
    // The cookie is user-editable: anything but a known portal counts as
    // unselected, so a tampered value can't slip past the fail-closed guard.
    return portal === 'company' || portal === 'project' ? portal : null;
  } catch {
    return null;
  }
}

function hasPortalSelected(request: NextRequest): boolean {
  return getPortalFromRequest(request) !== null;
}

function getUserPermissionsFromRequest(request: NextRequest): string[] | null {
  const cookieValue = request.cookies.get(permissionCookieKey)?.value;
  return parsePermissionsCookie(cookieValue);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes bypass auth guards — they're handled by Next.js rewrites to the backend
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Checked before any auth logic so neither the guest-only redirect nor the
  // fail-closed portal guard applies
  if (isAlwaysPublicPath(pathname)) {
    return NextResponse.next();
  }

   const token = getTokenFromRequest(request);

  // Guest-only paths (login, register, forgot-password, root) aren't reachable
  // once authenticated — send the user to where they already belong instead.
  if (token && isPublicPath(pathname)) {
    const destination = hasPortalSelected(request) ? '/dashboard' : '/portal-selection';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Accessible paths are always reachable — no proxy redirects apply
  if (isAccessiblePath(pathname) && token) {
    return NextResponse.next();
  }

  // If user has token but hasn't selected portal yet, redirect to portal selection
  // This handles page refreshes where client-side store might not be hydrated yet
  if (token && !isPublicPath(pathname) && !hasPortalSelected(request)) {
    return NextResponse.redirect(new URL('/portal-selection', request.url));
  }

  // Allow through if access token OR refresh token exists — client will handle refresh
  if (!token && !hasRefreshToken(request) && !isPublicPath(pathname)) {
    const returnUrl = pathname + request.nextUrl.search;
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', returnUrl);

    // Pass current portal so PortalSelectionPage can redirect back to returnUrl
    const portal = getPortalFromRequest(request);
    if (portal) {
      loginUrl.searchParams.set('portal', portal);
    }

    return NextResponse.redirect(loginUrl);
  }

  if (!isPublicPath(pathname) && !isAccessiblePath(pathname)) {
    const portal = getPortalFromRequest(request);
    const portalRedirectPath = resolvePortalGuardRedirect(pathname, portal);
    if (portalRedirectPath && portalRedirectPath !== pathname) {
      return NextResponse.redirect(new URL(portalRedirectPath, request.url));
    }
  }

  // Server-side permission guard
  // IMPORTANT: Only block if permissions cookie exists (user has synced permissions).
  // If cookie is absent, allow through - permissions haven't synced yet from client.
  // This prevents blocking users on first page load before cookie is set.
  if (token && !isPublicPath(pathname) && !isAccessiblePath(pathname)) {
    const userPermissions = getUserPermissionsFromRequest(request);
    if (userPermissions !== null) {
      const portal = getPortalFromRequest(request);
      const permissionRedirect = checkRoutePermission(pathname, userPermissions, portal);
      if (permissionRedirect) {
        return NextResponse.redirect(new URL(permissionRedirect, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};