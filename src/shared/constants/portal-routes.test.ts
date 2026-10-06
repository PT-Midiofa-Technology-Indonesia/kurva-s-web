import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { PortalAwareSectionGroup } from './navigation';
import { SIDEBAR_SECTION_GROUPS } from './navigation';
import {
  filterSectionGroupsByPortal,
  getPortalSectionGroups,
  PORTAL_ALLOWED_PATH_PREFIXES,
  resolveItemPortals,
} from './portal-routes';

/**
 * Protected routes that are knowingly switched off: the page still exists but
 * its menu entry is commented out, so no portal owns it and the fail-closed
 * guard blocks it. Listing a route here is an acknowledgment, nothing more —
 * it grants no access, and the guard never reads this list.
 *
 * If a route you just built shows up in the coverage failure below, you
 * probably forgot its menu entry. Add the menu entry rather than adding it
 * here.
 */
const KNOWINGLY_DISABLED_ROUTES: string[] = [
  '/403',
  '/human-resource/performance',
  '/human-resource/performance/[id]',
  '/master-data/asset-management',
  '/master-data/asset-management/create',
  '/master-data/asset-management/[id]/edit',
];

const PROTECTED_DIR = join(process.cwd(), 'app', '(protected)');

/** Every route rendered by a `page.tsx` under `app/(protected)`. */
function collectRoutes(dir: string, base = ''): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      // Route groups like `(protected)` contribute no path segment.
      const segment = entry.startsWith('(') && entry.endsWith(')') ? '' : `/${entry}`;
      routes.push(...collectRoutes(full, base + segment));
    } else if (entry === 'page.tsx') {
      routes.push(base || '/');
    }
  }
  return routes;
}

function isCovered(route: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => route === prefix || route.startsWith(`${prefix}/`));
}

const allSections = SIDEBAR_SECTION_GROUPS.flatMap((group) => group.sections);

describe('portal route coverage', () => {
  it('assigns every protected route to at least one portal', () => {
    const allPrefixes = [
      ...PORTAL_ALLOWED_PATH_PREFIXES.company,
      ...PORTAL_ALLOWED_PATH_PREFIXES.project,
    ];

    const orphans = collectRoutes(PROTECTED_DIR)
      .filter((route) => !isCovered(route, allPrefixes))
      .filter((route) => !KNOWINGLY_DISABLED_ROUTES.includes(route));

    // A route reachable by nobody is usually a bug: the guard is fail-closed,
    // so an undeclared page silently redirects to /dashboard in production.
    // Give it a sidebar entry with `portals`, or — if it is meant to be off —
    // add it to KNOWINGLY_DISABLED_ROUTES above.
    expect(orphans).toEqual([]);
  });

  it('keeps the knowingly-disabled list free of routes that are actually reachable', () => {
    const allPrefixes = [
      ...PORTAL_ALLOWED_PATH_PREFIXES.company,
      ...PORTAL_ALLOWED_PATH_PREFIXES.project,
    ];

    // A route that gained a menu entry should be removed from the list, so it
    // never masks a real coverage gap later.
    const stale = KNOWINGLY_DISABLED_ROUTES.filter((route) => isCovered(route, allPrefixes));

    expect(stale).toEqual([]);
  });

  // Access policy, asserted deliberately: these fail when a menu moves between
  // portals. That is the point — changing who can reach what should be a
  // conscious edit here, not a side effect of touching navigation.tsx.
  it('grants the project portal dashboard plus project-management paths', () => {
    expect(PORTAL_ALLOWED_PATH_PREFIXES.project).toEqual([
      '/dashboard',
      '/project-management/project',
      '/project-management/manpower-planning',
      '/project-management/quality-control',
      '/project-management/schedule',
      '/project-management/project-monitoring',
    ]);
  });

  it('grants the company portal everything except project-management', () => {
    const company = PORTAL_ALLOWED_PATH_PREFIXES.company;

    expect(company).toContain('/dashboard');
    expect(company).toContain('/organization/company');
    expect(company.some((p) => p.startsWith('/project-management'))).toBe(false);
  });

  it('exposes Asset Management as company-only child routes', () => {
    const assetManagement = getPortalSectionGroups('company')
      .flatMap((group) => group.sections)
      .find((section) => section.id === 'asset-management');

    expect(assetManagement?.href).toBe('/asset-management');
    expect(assetManagement?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'asset-catalog',
          label: 'Asset Catalog',
          href: '/asset-management/asset-catalog',
        }),
        expect.objectContaining({
          id: 'asset-category',
          label: 'Asset Category',
          href: '/asset-management/asset-category',
        }),
      ])
    );
    expect(PORTAL_ALLOWED_PATH_PREFIXES.company).toContain('/asset-management');
    expect(PORTAL_ALLOWED_PATH_PREFIXES.company).toContain('/asset-management/asset-catalog');
    expect(PORTAL_ALLOWED_PATH_PREFIXES.company).toContain('/asset-management/asset-category');
    expect(PORTAL_ALLOWED_PATH_PREFIXES.company).not.toContain('/master-data/asset-management');
    expect(PORTAL_ALLOWED_PATH_PREFIXES.project).not.toContain('/asset-management/asset-catalog');
    expect(PORTAL_ALLOWED_PATH_PREFIXES.project).not.toContain('/asset-management/asset-category');
  });

  it('keeps every knowingly-disabled entry pointing at a real route', () => {
    const routes = collectRoutes(PROTECTED_DIR);

    for (const path of KNOWINGLY_DISABLED_ROUTES) {
      expect(routes).toContain(path);
    }
  });
});

describe('portal declarations', () => {
  it('never lets an item declare a portal its section does not belong to', () => {
    const stray: string[] = [];

    for (const section of allSections) {
      for (const item of section.items ?? []) {
        const outside = (item.portals ?? []).filter((p) => !section.portals.includes(p));
        if (outside.length > 0) {
          stray.push(`${section.id}/${item.id} declares ${outside.join(', ')}`);
        }
      }
    }

    expect(stray).toEqual([]);
  });
});

describe('resolveItemPortals', () => {
  const section = { id: 's', label: 'S', icon: null, portals: ['company', 'project'] as const };

  it('inherits the section portals when the item declares none', () => {
    expect(
      resolveItemPortals({ ...section, portals: ['company'] }, { id: 'i', label: 'I' })
    ).toEqual(['company']);
  });

  it('narrows to the item portals when declared', () => {
    expect(
      resolveItemPortals(
        { ...section, portals: ['company', 'project'] },
        {
          id: 'i',
          label: 'I',
          portals: ['project'],
        }
      )
    ).toEqual(['project']);
  });

  it('never widens beyond the section portals', () => {
    expect(
      resolveItemPortals(
        { ...section, portals: ['company'] },
        {
          id: 'i',
          label: 'I',
          portals: ['project'],
        }
      )
    ).toEqual([]);
  });
});

describe('filterSectionGroupsByPortal — one section shared by both portals', () => {
  // A section living in both portals whose children differ: item A is
  // company-only, item B is project-only, item C inherits both.
  const groups: PortalAwareSectionGroup[] = [
    {
      id: 'menu',
      label: 'Menu',
      sections: [
        {
          id: 'project-management',
          label: 'Project Management',
          icon: null,
          portals: ['company', 'project'],
          items: [
            { id: 'a', label: 'A', href: '/project-management/a', portals: ['company'] },
            { id: 'b', label: 'B', href: '/project-management/b', portals: ['project'] },
            { id: 'c', label: 'C', href: '/project-management/c' },
          ],
        },
        {
          id: 'company-only',
          label: 'Company Only',
          icon: null,
          portals: ['company'],
          items: [{ id: 'd', label: 'D', href: '/company-only/d' }],
        },
      ],
    },
  ];

  const itemIdsFor = (portal: 'company' | 'project') =>
    filterSectionGroupsByPortal(groups, portal)
      .flatMap((g) => g.sections)
      .filter((s) => s.id === 'project-management')
      .flatMap((s) => s.items ?? [])
      .map((i) => i.id);

  it('keeps the section in both portals but shows only that portal’s children', () => {
    expect(itemIdsFor('company')).toEqual(['a', 'c']);
    expect(itemIdsFor('project')).toEqual(['b', 'c']);
  });

  it('still hides a section that does not belong to the portal at all', () => {
    const projectSectionIds = filterSectionGroupsByPortal(groups, 'project')
      .flatMap((g) => g.sections)
      .map((s) => s.id);

    expect(projectSectionIds).toEqual(['project-management']);
  });

  it('drops a section whose every child is filtered out', () => {
    const projectOnlyChildren: PortalAwareSectionGroup[] = [
      {
        id: 'menu',
        label: 'Menu',
        sections: [
          {
            id: 'mixed',
            label: 'Mixed',
            icon: null,
            portals: ['company', 'project'],
            items: [{ id: 'x', label: 'X', href: '/mixed/x', portals: ['project'] }],
          },
        ],
      },
    ];

    expect(filterSectionGroupsByPortal(projectOnlyChildren, 'company')).toEqual([]);
    expect(filterSectionGroupsByPortal(projectOnlyChildren, 'project')).toHaveLength(1);
  });
});

describe('getPortalSectionGroups', () => {
  it('shows project-management only in the project portal', () => {
    const projectIds = getPortalSectionGroups('project')
      .flatMap((g) => g.sections)
      .map((s) => s.id);
    const companyIds = getPortalSectionGroups('company')
      .flatMap((g) => g.sections)
      .map((s) => s.id);

    expect(projectIds).toContain('project-management');
    expect(companyIds).not.toContain('project-management');
  });

  it('shows dashboard only in the company portal', () => {
    const companyIds = getPortalSectionGroups('company')
      .flatMap((g) => g.sections)
      .map((s) => s.id);
    const projectIds = getPortalSectionGroups('project')
      .flatMap((g) => g.sections)
      .map((s) => s.id);

    expect(companyIds).toContain('dashboard-company');
    expect(projectIds).not.toContain('dashboard-company');
  });

  it('drops groups left with no visible section', () => {
    for (const portal of ['company', 'project'] as const) {
      expect(getPortalSectionGroups(portal).every((g) => g.sections.length > 0)).toBe(true);
    }
  });
});
