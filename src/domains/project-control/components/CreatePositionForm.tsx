'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { usePositionsInfinite } from '@/domains/position';
import { usePosition } from '@/domains/position/hooks/use-position';
import { usePermissionGroups } from '@/domains/role-permissions/hooks/use-permission-groups';
import { transformPermissionGroups } from '@/domains/role-permissions/services/transform-permissions';
import { Button } from '@/shared/components/atoms';
import { FormGenerator } from '@/shared/components/organisms/FormGenerator';
import { PermissionsManager } from '@/shared/components/organisms/PermissionsManager';
import { Separator } from '@/shared/components/ui';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useDebounce } from '@/shared/hooks/use-debounce';
import type { Permission } from '@/types/permissions';
import { CREATE_POSITION_FORM_FIELDS, CREATE_POSITION_PAGE_LABELS } from '../constants';
import { useProjectHierarchyTemplateNodesInfinite } from '../hooks/use-project-hierarchy-template-nodes-infinite';
import { createPositionSchema } from '../schemas/create-position.schema';
import type { CreateProjectHierarchyTemplateNodePayload } from '../types';

interface CreatePositionFormProps {
  templateId: string;
  presetParentId?: string | null;
  presetParentName?: string;
  onSubmit?: (payload: CreateProjectHierarchyTemplateNodePayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
  initialValues?: {
    positionId: string;
    parentId: string | null;
    status: string;
  };
  initialPermissions?: Permission[];
  submitLabel?: string;
}

interface FormValues {
  positionId: string;
  parentId: string | null;
  status: string;
}

function FormActions({
  isSubmitting,
  onCancel,
  submitLabel,
}: {
  isSubmitting?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const { formState } = useFormContext<FormValues>();
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {CREATE_POSITION_PAGE_LABELS.BUTTONS.CANCEL}
      </Button>
      <Button
        type="submit"
        form="create-position-form"
        disabled={!formState.isValid || isSubmitting}
      >
        {isSubmitting
          ? CREATE_POSITION_PAGE_LABELS.BUTTONS.SAVING
          : (submitLabel ?? CREATE_POSITION_PAGE_LABELS.BUTTONS.SAVE)}
      </Button>
    </div>
  );
}

function KodeField() {
  const positionId = useWatch<FormValues>({ name: 'positionId' });
  const { data: position, isLoading } = usePosition(positionId ?? '');

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-slate-700">
        {CREATE_POSITION_PAGE_LABELS.FIELDS.KODE_JOB_POSITION}
      </Label>
      <Input
        value={isLoading ? 'Memuat...' : (position?.code ?? '')}
        placeholder={
          positionId ? CREATE_POSITION_PAGE_LABELS.FIELDS.KODE_JOB_POSITION_PLACEHOLDER : ''
        }
        disabled
        readOnly
        className="bg-slate-50 text-slate-500 cursor-not-allowed"
      />
    </div>
  );
}

function PresetParentField({ presetParentName }: { presetParentName: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-slate-700">
        {CREATE_POSITION_PAGE_LABELS.FIELDS.PARENT_POSITION}
      </Label>
      <Input
        value={presetParentName}
        disabled
        readOnly
        className="bg-slate-50 text-slate-500 cursor-not-allowed"
      />
    </div>
  );
}

export function CreatePositionForm({
  templateId,
  presetParentId,
  presetParentName,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
  initialValues,
  initialPermissions,
  submitLabel,
}: CreatePositionFormProps) {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions ?? []);
  const didSeedPermissions = useRef(false);
  const [positionSearch, setPositionSearch] = useState('');
  const [parentSearch, setParentSearch] = useState('');
  const debouncedPositionSearch = useDebounce(positionSearch, 300);
  const debouncedParentSearch = useDebounce(parentSearch, 300);

  // Job Position — load=child
  const {
    options: positionOptions,
    isLoading: isPositionsLoading,
    hasMore: hasMorePositions,
    isFetchingNextPage: isFetchingMorePositions,
    loadMore: loadMorePositions,
  } = usePositionsInfinite({
    search: debouncedPositionSearch,
    isActive: true,
    load: 'child',
  });

  // Parent Position — from template nodes list, disabled when preset
  const {
    options: parentOptions,
    isLoading: isParentLoading,
    hasMore: hasMoreParents,
    isFetchingNextPage: isFetchingMoreParents,
    loadMore: loadMoreParents,
  } = useProjectHierarchyTemplateNodesInfinite({
    templateId,
    search: debouncedParentSearch,
  });

  const { data: permissionGroups, isLoading: isLoadingGroups } = usePermissionGroups({
    workspace: 'project',
  });

  // initialPermissions bisa datang belakangan (menunggu node detail + permission groups
  // selesai paralel) — useState hanya capture nilai mount pertama, jadi sinkronkan di sini.
  // Seed sekali saja; refetch background tidak boleh menimpa edit user.
  useEffect(() => {
    if (initialPermissions) {
      if (!didSeedPermissions.current) {
        didSeedPermissions.current = true;
        setPermissions(initialPermissions);
      }
      return;
    }
    if (permissionGroups) {
      setPermissions(transformPermissionGroups(permissionGroups, []));
    }
  }, [permissionGroups, initialPermissions]);

  const handlePermissionsChange = (updated: Permission[]) => {
    setPermissions(updated);
  };

  const getSelectedPermissionIds = (): number[] => {
    const ids: number[] = [];
    permissions.forEach((perm) => {
      perm.groups.forEach((group) => {
        group.subPermissions.forEach((sub) => {
          if (sub.checked) ids.push(parseInt(sub.id, 10));
        });
      });
    });
    return ids;
  };

  // Augment fields with dynamic options + custom content
  const fields = CREATE_POSITION_FORM_FIELDS.map((f: any) => {
    if (f.type === 'select' && f.name === 'positionId') {
      return {
        ...f,
        options: positionOptions,
        isLoading: isPositionsLoading,
        onSearchChange: (v: string) => setPositionSearch(v),
        onScrollToBottom: () => {
          if (hasMorePositions && !isFetchingMorePositions) loadMorePositions();
        },
      };
    }
    if (f.type === 'select' && f.name === 'parentId') {
      // When preset parent and NOT edit mode: show disabled input
      if (presetParentId && presetParentName && !initialValues) {
        return {
          ...f,
          type: 'custom' as const,
          content: <PresetParentField presetParentName={presetParentName} />,
        };
      }
      return {
        ...f,
        options: parentOptions,
        isLoading: isParentLoading,
        onSearchChange: (v: string) => setParentSearch(v),
        onScrollToBottom: () => {
          if (hasMoreParents && !isFetchingMoreParents) loadMoreParents();
        },
      };
    }
    if (f.type === 'custom' && f.name === '_kode') {
      return { ...f, content: <KodeField /> };
    }
    return f;
  });

  const defaultParentId = presetParentId ?? null;

  const handleFormSubmit = (formData: FormValues) => {
    if (!onSubmit) return;

    const payload: CreateProjectHierarchyTemplateNodePayload = {
      projectHierarchyTemplateId: templateId,
      parentId: defaultParentId ?? formData.parentId ?? null,
      positionId: formData.positionId,
      isActive: formData.status === 'active',
      permissionIds: getSelectedPermissionIds(),
    };

    onSubmit(payload);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[14px] shadow-sm">
      <div className="px-6 py-6">
        <FormGenerator<FormValues>
          id="create-position-form"
          schema={createPositionSchema as any}
          fields={fields}
          onSubmit={handleFormSubmit}
          defaultValues={{
            positionId: initialValues?.positionId ?? '',
            parentId: initialValues?.parentId ?? defaultParentId,
            status: initialValues?.status ?? 'active',
          }}
          externalErrors={serverErrors}
          className="gap-y-3"
          actions={
            <>
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
                    selectAllLabel={CREATE_POSITION_PAGE_LABELS.PERMISSIONS.SELECT_ALL}
                  />
                )}
              </div>

              {/* Bottom buttons */}
              <div className="col-span-12 mt-6">
                <FormActions
                  isSubmitting={isSubmitting}
                  onCancel={onCancel}
                  submitLabel={submitLabel}
                />
              </div>
            </>
          }
        />
      </div>
    </div>
  );
}
