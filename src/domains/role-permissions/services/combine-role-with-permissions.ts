import type { PermissionGroup, Role } from '../types';

export interface RoleWithPermissions extends Role {
  permissions: Array<{ id: string; name: string; description: string }>;
}

export function combineRoleWithPermissions(
  role: Role,
  permissionGroups: PermissionGroup[]
): RoleWithPermissions {
  // Get all available permission items from groups
  const allPermissions = new Map<number, { id: string; name: string; description: string }>();

  permissionGroups.forEach((group) => {
    [...group.permissions.web, ...(group.permissions.mobile ?? [])].forEach((perm) => {
      if (!allPermissions.has(perm.id)) {
        allPermissions.set(perm.id, {
          id: perm.id.toString(),
          name: perm.name,
          description: perm.description,
        });
      }
    });
  });

  // Map permissionIds to permission objects
  const permissions = role.permissionIds
    .map((id) => allPermissions.get(id))
    .filter(
      (p): p is typeof allPermissions extends Map<number, infer V> ? V : never => p !== undefined
    );

  return {
    ...role,
    permissions,
  };
}
