'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import { PermissionsManager } from '@/components/organisms/PermissionsManager';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/shared/components/atoms';
import { Separator } from '@/shared/components/ui';
import type { Permission } from '@/types/permissions';
import type { CreateRolePayload } from '../api/create-role';
import { ROLE_FORM_FIELDS, ROLE_LABELS } from '../constants';
import { usePermissionGroups } from '../hooks/use-permission-groups';
import { roleFormSchema } from '../schemas/role.schema';
import { transformPermissionGroups } from '../services/transform-permissions';
import type { Role } from '../types';

type FormMode = 'create' | 'edit' | 'detail';

interface RoleFormProps {
  mode?: FormMode;
  role?: Role & { permissions?: Array<{ id: string; name: string; description: string }> };
  onSubmit?: (payload: CreateRolePayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
  workspace?: string;
}

interface RoleFormValues {
  name: string;
  status: 'active' | 'inactive';
}

function RoleFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: 'create' | 'edit' | 'detail';
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<RoleFormValues>();
  const isEdit = mode === 'edit';
  const labels =
    mode === 'detail' ? ROLE_LABELS.DETAIL : isEdit ? ROLE_LABELS.EDIT : ROLE_LABELS.CREATE;

  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {(labels.BUTTONS as typeof ROLE_LABELS.EDIT.BUTTONS).CANCEL}
      </Button>

      <Button type="submit" form="role-form" disabled={!formState.isValid || isSubmitting}>
        {isSubmitting
          ? (labels.BUTTONS as typeof ROLE_LABELS.EDIT.BUTTONS).SAVING
          : (labels.BUTTONS as typeof ROLE_LABELS.EDIT.BUTTONS).SAVE}
      </Button>
    </div>
  );
}

export function RoleForm({
  mode = 'create',
  role,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
  workspace = 'company',
}: RoleFormProps) {
  const isEdit = mode === 'edit';
  const isDetail = mode === 'detail';

  const [permissions, setPermissions] = useState<Permission[]>([]);

  const { data: permissionGroups, isLoading: isLoadingGroups } = usePermissionGroups(
    workspace ? { workspace } : undefined
  );

  useEffect(() => {
    if (!permissionGroups) return;

    const selectedIds =
      (isEdit || isDetail) && role
        ? (role.permissions || [])
            .map((p) => parseInt(p.id as string, 10))
            .filter((n) => !Number.isNaN(n))
        : [];

    setPermissions(transformPermissionGroups(permissionGroups, selectedIds));
  }, [permissionGroups, isEdit, isDetail, role]);

  const handlePermissionsChange = (updatedPermissions: Permission[]) => {
    setPermissions(updatedPermissions);
  };

  const getSelectedPermissionIds = (): number[] => {
    const ids: number[] = [];
    permissions.forEach((perm) => {
      perm.groups.forEach((group) => {
        group.subPermissions.forEach((subPerm) => {
          if (subPerm.checked) {
            ids.push(parseInt(subPerm.id, 10));
          }
        });
      });
    });
    return ids;
  };

  const handleFormSubmit = (formData: RoleFormValues) => {
    if (!onSubmit) {
      return;
    }

    const payload: CreateRolePayload = {
      name: formData.name.trim(),
      guard: role?.guardName ?? 'web',
      isActive: formData.status === 'active',
      permissions: getSelectedPermissionIds(),
    };

    onSubmit(payload);
  };

  const labels = isDetail ? ROLE_LABELS.DETAIL : isEdit ? ROLE_LABELS.EDIT : ROLE_LABELS.CREATE;
  const { FIELDS } = labels;

  // Detail view - read-only display
  if (isDetail) {
    return (
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm flex flex-col py-6 gap-6">
        <div className="px-6 flex-col flex gap-6">
          {/* Role Info Summary */}
          <div className="flex gap-6 items-center">
            {/* Role Name */}
            <div className="flex-1 flex flex-col gap-1">
              <Label className="text-sm font-medium text-slate-950 px-1">{FIELDS.NAME_LABEL}</Label>
              <p className="text-md font-semibold text-slate-950 px-1">{role?.name}</p>
            </div>

            {/* Status */}
            <div className="flex-1 flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-slate-950 px-1">
                {FIELDS.STATUS_LABEL}
              </Label>
              <Badge
                variant={role?.isActive ? 'default' : 'secondary'}
                className={
                  role?.isActive
                    ? 'w-fit bg-green-100 text-green-700'
                    : 'w-fit bg-gray-100 text-gray-700'
                }
              >
                {role?.isActive
                  ? ROLE_LABELS.DETAIL.FIELDS.STATUS_ACTIVE
                  : ROLE_LABELS.DETAIL.FIELDS.STATUS_INACTIVE}
              </Badge>
            </div>

            {/* User Count */}
            <div className="flex-1 flex flex-col gap-1">
              <p className="text-sm font-normal text-slate-600 space-x-2">
                <span className="text-sm font-medium text-slate-950">{role?.usersCount || 0}</span>
                <span>{ROLE_LABELS.DETAIL.FIELDS.USERS_COUNT}</span>
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* Permissions Manager */}
          {isLoadingGroups ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <PermissionsManager
              permissions={permissions}
              onPermissionsChange={handlePermissionsChange}
              disabled={isDetail}
            />
          )}
        </div>
      </div>
    );
  }

  // Create/Edit view - with FormGenerator
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm flex flex-col py-6 gap-6">
      <div className="px-6 flex-col flex gap-6">
        {/* Form Fields */}
        <FormGenerator<RoleFormValues>
          id="role-form"
          schema={roleFormSchema as any}
          fields={ROLE_FORM_FIELDS}
          onSubmit={handleFormSubmit}
          defaultValues={{
            name: role?.name ?? '',
            status: role?.isActive ? 'active' : 'inactive',
          }}
          externalErrors={serverErrors}
          className="gap-y-3"
          actions={
            <>
              {/* Divider */}
              <Separator className="flex-1 h-[0.05rem] mb-6 mt-4" />

              {/* Permissions Manager */}
              <div className="col-span-12">
                {isLoadingGroups ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <PermissionsManager
                    permissions={permissions}
                    onPermissionsChange={handlePermissionsChange}
                    disabled={isDetail}
                  />
                )}
              </div>

              {/* Bottom buttons */}
              <div className="col-span-12 mt-6">
                <RoleFormActions
                  mode={isEdit ? 'edit' : 'create'}
                  isSubmitting={isSubmitting}
                  onCancel={onCancel}
                />
              </div>
            </>
          }
        />
      </div>
    </div>
  );
}
