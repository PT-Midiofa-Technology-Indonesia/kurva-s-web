'use client';

import { useCallback } from 'react';
import { PermissionsAccordion } from '@/components/organisms/PermissionsAccordion';
import { Permission, PermissionsChangedCallback } from '@/types/permissions';
import { cn } from '@/utils/cn';

interface PermissionsManagerProps {
  permissions: Permission[];
  onPermissionsChange: PermissionsChangedCallback;
  selectAllLabel?: string;
  emptyLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function PermissionsManager({
  permissions,
  onPermissionsChange,
  selectAllLabel,
  emptyLabel = 'No permissions available',
  className,
  disabled = false,
}: PermissionsManagerProps) {
  const handlePermissionChange = useCallback(
    (updatedPermission: Permission) => {
      const updatedPermissions = permissions.map((perm) =>
        perm.id === updatedPermission.id ? updatedPermission : perm
      );
      onPermissionsChange(updatedPermissions);
    },
    [permissions, onPermissionsChange]
  );

  if (permissions.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {permissions.map((permission) => (
        <PermissionsAccordion
          key={permission.id}
          permission={permission}
          onPermissionChange={handlePermissionChange}
          selectAllLabel={selectAllLabel}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
