import { describe, expect, it } from 'vitest';
import type { PermissionGroup } from '../types';
import { transformPermissionGroups } from './transform-permissions';

describe('transformPermissionGroups', () => {
  it('handles permission groups without mobile permissions', () => {
    const groups = [
      {
        groupId: 'dashboard',
        groupCode: 'dashboard',
        groupName: 'Dashboard',
        description: 'Dashboard permissions',
        sortOrder: 1,
        isActive: true,
        permissions: {
          web: [
            {
              id: 1,
              name: 'dashboard.view',
              description: 'View dashboard',
              sortOrder: 1,
            },
          ],
        },
      },
    ] as unknown as PermissionGroup[];

    expect(() => transformPermissionGroups(groups)).not.toThrow();
    expect(transformPermissionGroups(groups)[0].groups[1].subPermissions).toEqual([]);
  });
});
