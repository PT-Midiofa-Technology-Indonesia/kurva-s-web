import type { Permission as UIPermission } from '@/types/permissions';

import type { PermissionGroup } from '../types';

export function transformPermissionGroups(
  groups: PermissionGroup[],
  selectedPermissionIds: number[] = []
): UIPermission[] {
  return groups
    .filter((g) => g.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((group) => ({
      id: group.groupId,
      name: group.groupName,
      description: group.description,
      selectAll: false,
      groups: [
        {
          id: 'web',
          name: 'Website',
          icon: 'web',
          subPermissions: (group.permissions.web ?? [])
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((perm) => ({
              id: perm.id.toString(),
              name: perm.description,
              checked: selectedPermissionIds.includes(perm.id),
            })),
        },
        {
          id: 'mobile',
          name: 'Mobile',
          icon: 'mobile',
          subPermissions: (group.permissions.mobile ?? [])
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((perm) => ({
              id: perm.id.toString(),
              name: perm.description,
              checked: selectedPermissionIds.includes(perm.id),
            })),
        },
      ],
    }));
}
