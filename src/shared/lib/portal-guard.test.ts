import { describe, expect, it } from 'vitest';
import { PORTAL_MISMATCH_REDIRECT_PATH, resolvePortalGuardRedirect } from './portal-guard';

describe('resolvePortalGuardRedirect', () => {
  it('redirects project portal away from company-only routes', () => {
    expect(resolvePortalGuardRedirect('/organization/company', 'project')).toBe('/dashboard');
  });

  it('allows project portal to reach /dashboard', () => {
    expect(resolvePortalGuardRedirect('/dashboard', 'project')).toBeNull();
  });

  it('allows project portal to reach nested /dashboard routes', () => {
    expect(resolvePortalGuardRedirect('/dashboard/profile', 'project')).toBeNull();
  });

  it('allows project portal to reach /project-management routes', () => {
    expect(resolvePortalGuardRedirect('/project-management/schedule', 'project')).toBeNull();
  });

  it('does not treat a similarly-prefixed path as a match', () => {
    expect(resolvePortalGuardRedirect('/dashboardxyz', 'project')).toBe('/dashboard');
  });

  it('allows nested routes under an allowed menu path', () => {
    expect(
      resolvePortalGuardRedirect('/project-management/manpower-planning/create-task', 'project')
    ).toBeNull();
    expect(
      resolvePortalGuardRedirect('/project-control/project/abc/progress-monitoring', 'company')
    ).toBeNull();
  });

  it('blocks a route declared by no portal, for both portals (fail-closed)', () => {
    expect(resolvePortalGuardRedirect('/not-a-declared-route', 'company')).toBe('/dashboard');
    expect(resolvePortalGuardRedirect('/not-a-declared-route', 'project')).toBe('/dashboard');
  });

  it('lets both portals reach the redirect target safely', () => {
    expect(resolvePortalGuardRedirect(PORTAL_MISMATCH_REDIRECT_PATH, 'company')).toBeNull();
    expect(resolvePortalGuardRedirect(PORTAL_MISMATCH_REDIRECT_PATH, 'project')).toBeNull();
  });

  it('blocks a route whose menu entry is commented out, for every portal', () => {
    // Hiding a menu hides its page: with no live menu entry, no portal owns
    // the route, so the fail-closed guard turns it away.
    expect(resolvePortalGuardRedirect('/organization/old-restricted-route', 'company')).toBe(
      '/dashboard'
    );
    expect(resolvePortalGuardRedirect('/organization/old-restricted-route', 'project')).toBe(
      '/dashboard'
    );
  });

  it('redirects company portal away from /project-management routes', () => {
    expect(resolvePortalGuardRedirect('/project-management/schedule', 'company')).toBe(
      '/dashboard'
    );
  });

  it('allows company portal to reach non-project-management routes', () => {
    expect(resolvePortalGuardRedirect('/organization/company', 'company')).toBeNull();
  });

  it('does nothing when portal is null', () => {
    expect(resolvePortalGuardRedirect('/organization/company', null)).toBeNull();
    expect(resolvePortalGuardRedirect('/project-management/schedule', null)).toBeNull();
  });
});
