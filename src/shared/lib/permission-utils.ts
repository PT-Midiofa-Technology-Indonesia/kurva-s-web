import type { PermissionRequirement } from '@/shared/types/permissions';

/**
 * Whether the user's permissions satisfy a permission requirement.
 * A string is satisfied by an exact match. A list is satisfied when any of
 * its codes is present (OR semantics); an empty list is never satisfied.
 */
export function hasRequiredPermission(
  requirement: PermissionRequirement,
  userPermissions: string[] | null | undefined
): boolean {
  const permissions = userPermissions ?? [];
  if (Array.isArray(requirement)) {
    return requirement.some((permission) => permissions.includes(permission));
  }
  return permissions.includes(requirement);
}
