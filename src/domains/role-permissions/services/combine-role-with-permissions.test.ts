import { describe, expect, it } from 'vitest';
import type { PermissionGroup, Role } from '../types';
import { combineRoleWithPermissions } from './combine-role-with-permissions';

const role: Role = {
  id: '1',
  name: 'Admin',
  isActive: true,
  permissionIds: [1, 2],
};

describe('combineRoleWithPermissions', () => {
  it('handles permission groups without mobile permissions', () => {
    const permissionGroups = [
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

    expect(() => combineRoleWithPermissions(role, permissionGroups)).not.toThrow();
    expect(combineRoleWithPermissions(role, permissionGroups).permissions).toEqual([
      {
        id: '1',
        name: 'dashboard.view',
        description: 'View dashboard',
      },
    ]);
  });

  it('deduplicates permissions across web and mobile', () => {
    const permissionGroups: PermissionGroup[] = [
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
          mobile: [
            {
              id: 1,
              name: 'dashboard.view.mobile',
              description: 'View dashboard mobile',
              sortOrder: 1,
            },
            {
              id: 2,
              name: 'dashboard.edit.mobile',
              description: 'Edit dashboard mobile',
              sortOrder: 2,
            },
          ],
        },
      },
    ];

    expect(combineRoleWithPermissions(role, permissionGroups).permissions).toEqual([
      {
        id: '1',
        name: 'dashboard.view',
        description: 'View dashboard',
      },
      {
        id: '2',
        name: 'dashboard.edit.mobile',
        description: 'Edit dashboard mobile',
      },
    ]);
  });
});
