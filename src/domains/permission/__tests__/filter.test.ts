/**
 * Integration tests for the Permission Filter utility
 * Tests: filterSectionGroupsByPermissions functionality
 */

import { describe, expect, it } from 'vitest';
import type { PortalAwareSectionGroup } from '@/shared/constants/navigation';
import { filterSectionGroupsByPermissions } from '@/shared/lib/permission-filter';

// Simplified test data matching the actual navigation structure
const TEST_NAVIGATION: PortalAwareSectionGroup[] = [
  {
    id: 'menu',
    label: 'Menu',
    sections: [
      {
        id: 'dashboard',
        portals: ['company', 'project'],
        label: 'Dashboard',
        icon: null as any,
        href: '/dashboard',
      },
      {
        id: 'user-management',
        portals: ['company'],
        label: 'User Management',
        icon: null as any,
        items: [
          {
            id: 'role-permission',
            label: 'Role Permission',
            href: '/user-management/role-permission',
            requiredPermission: 'usman.rpm',
          },
          {
            id: 'user',
            label: 'User',
            href: '/user-management/user',
            requiredPermission: 'usman.user',
          },
          {
            id: 'no-permission-item',
            label: 'No Permission Item',
            href: '/no-perm',
          },
        ],
      },
      {
        id: 'master-data',
        portals: ['company'],
        label: 'Master Data',
        icon: null as any,
        items: [
          {
            id: 'position',
            label: 'Position',
            href: '/master-data/position',
            requiredPermission: 'master.pos',
          },
          {
            id: 'no-permission-md',
            label: 'No Permission Master Data',
            href: '/master-data/no-perm',
          },
        ],
      },
      {
        id: 'empty-section',
        portals: ['company'],
        label: 'Empty Section',
        icon: null as any,
        items: [
          {
            id: 'perm-only-item',
            label: 'Permission Only',
            href: '/empty-section/only-perm',
            requiredPermission: 'nonexistent.perm',
          },
        ],
      },
      {
        id: 'array-permission-section',
        portals: ['company'],
        label: 'Array Permission Section',
        icon: null as any,
        items: [
          {
            id: 'array-item',
            label: 'Array Item',
            href: '/array/item',
            requiredPermission: ['arr.read', 'arr.write'],
          },
          {
            id: 'array-item-approve',
            label: 'Array Item Approve',
            href: '/array/item-approve',
            requiredPermission: ['arr.approve'],
          },
        ],
      },
      {
        id: 'array-section-level',
        portals: ['company'],
        label: 'Array Section Level',
        icon: null as any,
        href: '/array/section-level',
        requiredPermission: ['arrsec.view', 'arrsec.manage'],
      },
    ],
  },
  {
    id: 'project-menu',
    label: 'Project Menu',
    sections: [
      {
        id: 'project-portal',
        portals: ['company'],
        label: 'Project Portal',
        icon: null as any,
        items: [
          {
            id: 'project',
            label: 'Project',
            href: '/project-control/project',
            requiredPermission: 'projc.proj',
          },
        ],
      },
      {
        id: 'empty-project-section',
        portals: ['company'],
        label: 'Empty Project Section',
        icon: null as any,
        items: [
          {
            id: 'perm-only-p',
            label: 'Project Perm Only',
            href: '/empty-project/only-perm',
            requiredPermission: 'nonexistent.project.perm',
          },
        ],
      },
    ],
  },
];

describe('Permission Filter', () => {
  describe('filterSectionGroupsByPermissions', () => {
    it('should keep items without requiredPermission', () => {
      const userPermissions = ['any.perm'];
      const result = filterSectionGroupsByPermissions(TEST_NAVIGATION, userPermissions);

      const umSection = result[0]?.sections.find((s) => s.id === 'user-management');
      const noPermItem = umSection?.items?.find((i) => i.id === 'no-permission-item');

      expect(noPermItem).toBeDefined();
      expect(noPermItem?.label).toBe('No Permission Item');
    });

    it('should remove items without permission when requiredPermission is set', () => {
      const userPermissions: string[] = [];
      const result = filterSectionGroupsByPermissions(TEST_NAVIGATION, userPermissions);

      const umSection = result[0]?.sections.find((s) => s.id === 'user-management');
      const rolePermItem = umSection?.items?.find((i) => i.id === 'role-permission');

      expect(rolePermItem).toBeUndefined();
    });

    it('should keep items with permission when requiredPermission is set', () => {
      const userPermissions = ['usman.rpm', 'other.perm'];
      const result = filterSectionGroupsByPermissions(TEST_NAVIGATION, userPermissions);

      const umSection = result[0]?.sections.find((s) => s.id === 'user-management');
      const rolePermItem = umSection?.items?.find((i) => i.id === 'role-permission');

      expect(rolePermItem).toBeDefined();
      expect(rolePermItem?.label).toBe('Role Permission');
    });

    it('should remove sections with only hidden items (empty after filtering)', () => {
      const userPermissions: string[] = [];
      const result = filterSectionGroupsByPermissions(TEST_NAVIGATION, userPermissions);

      const emptySection = result[0]?.sections.find((s) => s.id === 'empty-section');

      expect(emptySection).toBeUndefined();
    });

    it('should remove section groups with only empty sections', () => {
      const userPermissions: string[] = [];
      const result = filterSectionGroupsByPermissions(TEST_NAVIGATION, userPermissions);

      // Project menu section should be removed (only has empty sections)
      const projectMenu = result.find((g) => g.id === 'project-menu');

      expect(projectMenu).toBeUndefined();
    });

    it('should filter based on user permissions array', () => {
      // User has usman.rpm but not usman.user
      const userPermissions = ['usman.rpm'];
      const result = filterSectionGroupsByPermissions(TEST_NAVIGATION, userPermissions);

      const umSection = result[0]?.sections.find((s) => s.id === 'user-management');
      const rolePermItem = umSection?.items?.find((i) => i.id === 'role-permission');
      const userItem = umSection?.items?.find((i) => i.id === 'user');

      expect(rolePermItem).toBeDefined();
      expect(userItem).toBeUndefined();
    });

    it('should handle empty permissions array', () => {
      const userPermissions: string[] = [];
      const result = filterSectionGroupsByPermissions(TEST_NAVIGATION, userPermissions);

      // All items with requiredPermission should be removed
      const umSection = result[0]?.sections.find((s) => s.id === 'user-management');
      expect(umSection?.items?.length).toBe(1); // Only no-perm item
    });

    it('should handle empty navigation array', () => {
      const result = filterSectionGroupsByPermissions([], ['any.perm']);
      expect(result).toEqual([]);
    });

    it('should handle null/undefined permissions array', () => {
      const result1 = filterSectionGroupsByPermissions(TEST_NAVIGATION, null as any);
      const result2 = filterSectionGroupsByPermissions(TEST_NAVIGATION, undefined as any);

      expect(result1.length).toBeGreaterThan(0);
      expect(result2.length).toBeGreaterThan(0);
    });

    it('should keep items with array requirement when user has the first permission', () => {
      const result = filterSectionGroupsByPermissions(TEST_NAVIGATION, ['arr.read']);

      const section = result[0]?.sections.find((s) => s.id === 'array-permission-section');
      const item = section?.items?.find((i) => i.id === 'array-item');

      expect(item).toBeDefined();
    });

    it('should keep items with array requirement when user has only the second permission', () => {
      const result = filterSectionGroupsByPermissions(TEST_NAVIGATION, ['arr.write']);

      const section = result[0]?.sections.find((s) => s.id === 'array-permission-section');
      const item = section?.items?.find((i) => i.id === 'array-item');

      expect(item).toBeDefined();
    });

    it('should hide items with array requirement when user has no matching permission', () => {
      const result = filterSectionGroupsByPermissions(TEST_NAVIGATION, ['other.perm']);

      const section = result[0]?.sections.find((s) => s.id === 'array-permission-section');
      const item = section?.items?.find((i) => i.id === 'array-item');

      expect(item).toBeUndefined();
    });

    it('should keep section-level array requirement when user has any listed permission', () => {
      const result = filterSectionGroupsByPermissions(TEST_NAVIGATION, ['arrsec.manage']);

      const section = result[0]?.sections.find((s) => s.id === 'array-section-level');

      expect(section).toBeDefined();
    });

    it('should remove section-level array requirement when user has no listed permission', () => {
      const result = filterSectionGroupsByPermissions(TEST_NAVIGATION, []);

      const section = result[0]?.sections.find((s) => s.id === 'array-section-level');

      expect(section).toBeUndefined();
    });
  });
});
