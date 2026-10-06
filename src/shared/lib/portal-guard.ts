import { PORTAL_ALLOWED_PATH_PREFIXES } from '@/shared/constants/portal-routes';
import type { PortalType } from '@/shared/lib/portal';

export const PORTAL_MISMATCH_REDIRECT_PATH = '/dashboard';

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Where a request must be sent because the selected portal may not reach it,
 * or `null` to let it through.
 *
 * Fail-closed: a path is allowed only when it sits under a prefix the portal
 * owns, derived from the `portals` declared on each section in
 * `navigation.tsx`. Hiding a menu therefore also blocks its page — a route
 * with no live menu entry belongs to no portal and is reachable by nobody.
 *
 * A `null` portal is not this guard's concern; `proxy.ts` sends those to
 * `/portal-selection` before reaching here.
 */
export function resolvePortalGuardRedirect(
  pathname: string,
  portal: PortalType | null
): string | null {
  if (!portal) return null;

  const allowedPrefixes = PORTAL_ALLOWED_PATH_PREFIXES[portal];
  if (!allowedPrefixes) return null;

  return matchesPrefix(pathname, allowedPrefixes) ? null : PORTAL_MISMATCH_REDIRECT_PATH;
}
