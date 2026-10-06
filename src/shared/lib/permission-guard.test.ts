import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PERMISSION_ROUTES } from '@/shared/constants/permission-routes';
import { checkRoutePermission } from './permission-guard';

const ARRAY_ROUTE = '/test/array-route';
const PORTAL_ARRAY_ROUTE = '/test/portal-array-route';

beforeEach(() => {
  PERMISSION_ROUTES[ARRAY_ROUTE] = {
    requiredPermission: ['arr.read', 'arr.write'],
  };
  PERMISSION_ROUTES[PORTAL_ARRAY_ROUTE] = {
    portalPermission: { company: ['dash.company', 'dash.admin'], project: 'dash.project' },
  };
});

afterEach(() => {
  delete PERMISSION_ROUTES[ARRAY_ROUTE];
  delete PERMISSION_ROUTES[PORTAL_ARRAY_ROUTE];
});

describe('checkRoutePermission', () => {
  it('allows access to routes without permission requirements', () => {
    expect(checkRoutePermission('/settings', [])).toBeNull();
    expect(checkRoutePermission('/settings/general', [])).toBeNull();
  });

  it('blocks /dashboard when user has no portal permissions (no portal context)', () => {
    expect(checkRoutePermission('/dashboard', [])).toBe('/403');
  });

  it('blocks /dashboard when user has no portal permissions (with portal context)', () => {
    expect(checkRoutePermission('/dashboard', [], 'company')).toBe('/403');
    expect(checkRoutePermission('/dashboard', [], 'project')).toBe('/403');
  });

  it('allows /dashboard with matching portal permission', () => {
    expect(checkRoutePermission('/dashboard', ['dashboard.company'], 'company')).toBeNull();
    expect(checkRoutePermission('/dashboard', ['dashboard.project'], 'project')).toBeNull();
  });

  it('blocks /dashboard when user lacks the correct portal-specific permission', () => {
    expect(checkRoutePermission('/dashboard', ['dashboard.company'], 'project')).toBe('/403');
    expect(checkRoutePermission('/dashboard', ['dashboard.project'], 'company')).toBe('/403');
  });

  it('allows /dashboard without portal context when user has any portal permission', () => {
    expect(checkRoutePermission('/dashboard', ['dashboard.company'])).toBeNull();
    expect(checkRoutePermission('/dashboard', ['dashboard.project'])).toBeNull();
  });

  it('/dashboard/profile inherits dashboard permission check via prefix match', () => {
    expect(checkRoutePermission('/dashboard/profile', [], 'company')).toBe('/403');
    expect(checkRoutePermission('/dashboard/profile', ['dashboard.company'], 'company')).toBeNull();
  });

  it('blocks access to protected routes when user has no permissions', () => {
    expect(checkRoutePermission('/user-management/role-permission', [])).toBe('/403');
    expect(checkRoutePermission('/user-management/user', [])).toBe('/403');
  });

  it('allows access to protected routes when user has required permission', () => {
    expect(checkRoutePermission('/user-management/role-permission', ['usman.rpm'])).toBeNull();
    expect(checkRoutePermission('/user-management/user', ['usman.user'])).toBeNull();
  });

  it('blocks access when user has wrong permission', () => {
    expect(checkRoutePermission('/user-management/role-permission', ['usman.user'])).toBe('/403');
  });

  it('blocks access to nested routes under protected paths', () => {
    expect(checkRoutePermission('/user-management/role-permission/create', [])).toBe('/403');
    expect(checkRoutePermission('/user-management/user/edit/123', [])).toBe('/403');
  });

  it('allows access to nested routes when user has permission', () => {
    expect(
      checkRoutePermission('/user-management/role-permission/create', ['usman.rpm'])
    ).toBeNull();
    expect(checkRoutePermission('/user-management/user/edit/123', ['usman.user'])).toBeNull();
  });

  it('/403 itself is not permission-gated to prevent infinite loops', () => {
    expect(checkRoutePermission('/403', [])).toBeNull();
    expect(checkRoutePermission('/403/', [])).toBeNull();
  });

  it('handles routes not in permission config', () => {
    expect(checkRoutePermission('/settings', [])).toBeNull();
    expect(checkRoutePermission('/settings/general', [])).toBeNull();
  });

  it('allows a route with an array requirement when user has any listed permission', () => {
    expect(checkRoutePermission(ARRAY_ROUTE, ['arr.read'])).toBeNull();
    expect(checkRoutePermission(ARRAY_ROUTE, ['arr.write'])).toBeNull();
  });

  it('blocks a route with an array requirement when user has no matching permission', () => {
    expect(checkRoutePermission(ARRAY_ROUTE, ['other.perm'])).toBe('/403');
    expect(checkRoutePermission(ARRAY_ROUTE, [])).toBe('/403');
  });

  it('applies OR semantics to portal-specific array requirements with a known portal', () => {
    expect(checkRoutePermission(PORTAL_ARRAY_ROUTE, ['dash.company'], 'company')).toBeNull();
    expect(checkRoutePermission(PORTAL_ARRAY_ROUTE, ['dash.admin'], 'company')).toBeNull();
    expect(checkRoutePermission(PORTAL_ARRAY_ROUTE, ['dash.project'], 'company')).toBe('/403');
  });

  it('allows portal-specific array requirements via the no-portal fallback', () => {
    expect(checkRoutePermission(PORTAL_ARRAY_ROUTE, ['dash.project'])).toBeNull();
    expect(checkRoutePermission(PORTAL_ARRAY_ROUTE, ['other.perm'])).toBe('/403');
  });
});
