import { useCallback, useState } from 'react';
import { Permission } from '@/types/permissions';

interface UsePermissionsOptions {
  initialPermissions: Permission[];
}

export function usePermissions({ initialPermissions }: UsePermissionsOptions) {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions);

  const handlePermissionsChange = useCallback((updatedPermissions: Permission[]) => {
    setPermissions(updatedPermissions);
  }, []);

  const getSelectedPermissions = useCallback(() => {
    return permissions.flatMap((perm) =>
      perm.groups.flatMap((group) =>
        group.subPermissions
          .filter((subPerm) => subPerm.checked)
          .map((subPerm) => ({
            permissionId: perm.id,
            groupId: group.id,
            subPermissionId: subPerm.id,
            subPermissionName: subPerm.name,
          }))
      )
    );
  }, [permissions]);

  const resetPermissions = useCallback(() => {
    setPermissions(initialPermissions);
  }, [initialPermissions]);

  const selectAllPermissions = useCallback(() => {
    const allSelected = permissions.map((perm) => ({
      ...perm,
      selectAll: true,
      groups: perm.groups.map((group) => ({
        ...group,
        subPermissions: group.subPermissions.map((subPerm) => ({
          ...subPerm,
          checked: true,
        })),
      })),
    }));
    setPermissions(allSelected);
  }, [permissions]);

  const deselectAllPermissions = useCallback(() => {
    const allDeselected = permissions.map((perm) => ({
      ...perm,
      selectAll: false,
      groups: perm.groups.map((group) => ({
        ...group,
        subPermissions: group.subPermissions.map((subPerm) => ({
          ...subPerm,
          checked: false,
        })),
      })),
    }));
    setPermissions(allDeselected);
  }, [permissions]);

  return {
    permissions,
    handlePermissionsChange,
    getSelectedPermissions,
    resetPermissions,
    selectAllPermissions,
    deselectAllPermissions,
  };
}
