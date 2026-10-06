import { PERMISSION_ROUTES } from '@/shared/constants/permission-routes';
import { hasRequiredPermission } from '@/shared/lib/permission-utils';
import type { PortalType } from '@/shared/lib/portal';

/**
 * Check if user has permission to access a route
 * @param pathname - The route being accessed
 * @param userPermissions - Array of permission codes user has
 * @param portal - Current portal context (for portal-aware permissions like /dashboard)
 * @returns null if allowed, redirect path if blocked
 */
export function checkRoutePermission(
  pathname: string,
  userPermissions: string[],
  portal?: PortalType | null
): string | null {
  // Find route config
  const routeConfig = findRouteConfig(pathname);

  // No permission required = public route (within portal)
  if (!routeConfig) {
    return null;
  }

  // Handle portal-aware permissions (e.g., /dashboard)
  if (routeConfig.portalPermission) {
    // If portal context is known, check that portal's specific permission
    if (portal && routeConfig.portalPermission[portal]) {
      const perm = routeConfig.portalPermission[portal];
      return perm && hasRequiredPermission(perm, userPermissions) ? null : '/403';
    }
    // Fallback: no portal context, check any portal permission
    const allPortalPerms = Object.values(routeConfig.portalPermission);
    const hasAny = allPortalPerms.some((p) => hasRequiredPermission(p, userPermissions));
    return hasAny ? null : '/403';
  }

  // Standard permission check
  if (routeConfig.requiredPermission) {
    return hasRequiredPermission(routeConfig.requiredPermission, userPermissions) ? null : '/403';
  }

  return null;
}

/**
 * Find the route config for a given pathname
 * Handles exact match and prefix match with boundary check
 * Pattern similar to portal-guard.ts matchesPrefix
 */
function findRouteConfig(pathname: string) {
  // First try exact match
  if (PERMISSION_ROUTES[pathname]) {
    return PERMISSION_ROUTES[pathname];
  }

  // Then try prefix match with boundary check
  for (const routePath of Object.keys(PERMISSION_ROUTES)) {
    if (pathname === routePath || pathname.startsWith(`${routePath}/`)) {
      return PERMISSION_ROUTES[routePath];
    }
  }

  return null;
}
