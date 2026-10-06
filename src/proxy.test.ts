import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from '../proxy';

function buildRequest(pathname: string, cookies: Record<string, string> = {}): NextRequest {
  const cookieHeader = Object.entries(cookies)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('; ');
  return new NextRequest(new URL(`http://localhost${pathname}`), {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });
}

describe('proxy portal guard', () => {
  it('redirects a project-portal session away from a company-only route', () => {
    const request = buildRequest('/organization/company', {
      accessToken: 'token',
      'portal-selection': JSON.stringify({ portal: 'project', workspaceId: 'w1' }),
    });

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/dashboard');
  });

  it('redirects a company-portal session away from /project-management', () => {
    const request = buildRequest('/project-management/schedule', {
      accessToken: 'token',
      'portal-selection': JSON.stringify({ portal: 'company', workspaceId: 'w1' }),
    });

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/dashboard');
  });

  it('lets a project-portal session reach /dashboard and /project-management', () => {
    const dashboardRequest = buildRequest('/dashboard', {
      accessToken: 'token',
      'portal-selection': JSON.stringify({ portal: 'project', workspaceId: 'w1' }),
    });
    const projectManagementRequest = buildRequest('/project-management/schedule', {
      accessToken: 'token',
      'portal-selection': JSON.stringify({ portal: 'project', workspaceId: 'w1' }),
    });

    expect(proxy(dashboardRequest).status).toBe(200);
    expect(proxy(projectManagementRequest).status).toBe(200);
  });

  it('lets a company-portal session reach non-project-management routes', () => {
    const request = buildRequest('/organization/company', {
      accessToken: 'token',
      'portal-selection': JSON.stringify({ portal: 'company', workspaceId: 'w1' }),
    });

    expect(proxy(request).status).toBe(200);
  });

  it('does not apply the portal guard to public paths regardless of cookie state', () => {
    const request = buildRequest('/login', {
      'portal-selection': JSON.stringify({ portal: 'project', workspaceId: 'w1' }),
    });

    expect(proxy(request).status).toBe(200);
  });

  it('lets an unauthenticated visitor reach / (page.tsx handles the login redirect)', () => {
    const request = buildRequest('/');

    expect(proxy(request).status).toBe(200);
  });

  it('redirects an authenticated user away from / to /dashboard when a portal is already selected', () => {
    const request = buildRequest('/', {
      accessToken: 'token',
      'portal-selection': JSON.stringify({ portal: 'company', workspaceId: 'w1' }),
    });

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/dashboard');
  });

  it('redirects an authenticated user away from / to /portal-selection when no portal is selected yet', () => {
    const request = buildRequest('/', { accessToken: 'token' });

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/portal-selection');
  });

  it('treats a tampered portal cookie as unselected', () => {
    const request = buildRequest('/organization/company', {
      accessToken: 'token',
      'portal-selection': JSON.stringify({ portal: 'superadmin', workspaceId: 'w1' }),
    });

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/portal-selection');
  });

  it('redirects an authenticated user away from /login', () => {
    const request = buildRequest('/login', {
      accessToken: 'token',
      'portal-selection': JSON.stringify({ portal: 'company', workspaceId: 'w1' }),
    });

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/dashboard');
  });
});

describe('proxy always-public paths', () => {
  const alwaysPublicPaths = ['/privacy-policy', '/delete-account'];

  for (const pathname of alwaysPublicPaths) {
    it(`lets an unauthenticated visitor reach ${pathname}`, () => {
      expect(proxy(buildRequest(pathname)).status).toBe(200);
    });

    it(`lets a company-portal session reach ${pathname}`, () => {
      const request = buildRequest(pathname, {
        accessToken: 'token',
        'portal-selection': JSON.stringify({ portal: 'company', workspaceId: 'w1' }),
      });

      expect(proxy(request).status).toBe(200);
    });

    it(`lets a project-portal session reach ${pathname}`, () => {
      const request = buildRequest(pathname, {
        accessToken: 'token',
        'portal-selection': JSON.stringify({ portal: 'project', workspaceId: 'w1' }),
      });

      expect(proxy(request).status).toBe(200);
    });

    it(`does not send an authenticated user away from ${pathname} the way guest-only paths do`, () => {
      const request = buildRequest(pathname, {
        accessToken: 'token',
        'portal-selection': JSON.stringify({ portal: 'company', workspaceId: 'w1' }),
      });

      expect(proxy(request).headers.get('location')).toBeNull();
    });

    it(`ignores a tampered portal cookie on ${pathname}`, () => {
      const request = buildRequest(pathname, {
        accessToken: 'token',
        'portal-selection': JSON.stringify({ portal: 'superadmin', workspaceId: 'w1' }),
      });

      expect(proxy(request).status).toBe(200);
    });
  }

  it('matches nested paths under an always-public path but not lookalike prefixes', () => {
    expect(proxy(buildRequest('/privacy-policy/detail')).status).toBe(200);

    const lookalike = buildRequest('/privacy-policyxyz');
    expect(lookalike.nextUrl.pathname).toBe('/privacy-policyxyz');
    expect(proxy(lookalike).status).toBe(307);
  });
});
