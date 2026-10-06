'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { usePositionsInfinite } from '@/domains/position';
import { usePosition } from '@/domains/position/hooks/use-position';
import { usePermissionGroups } from '@/domains/role-permissions/hooks/use-permission-groups';
import { transformPermissionGroups } from '@/domains/role-permissions/services/transform-permissions';
import type { SelectGroup, SelectOption } from '@/shared/components/atoms';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { FormGenerator } from '@/shared/components/organisms/FormGenerator';
import { PermissionsManager } from '@/shared/components/organisms/PermissionsManager';
import { Separator } from '@/shared/components/ui';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useDebounce } from '@/shared/hooks/use-debounce';
import type { Permission } from '@/types/permissions';
import { CREATE_POSITION_PAGE_LABELS, CREATE_PROJECT_POSITION_FORM_FIELDS } from '../constants';
import { useEmployeesByPosition } from '../hooks/use-employees-by-position';
import { useProjectHierarchyNodesInfinite } from '../hooks/use-project-hierarchy-nodes-infinite';
import { createProjectPositionSchema } from '../schemas/create-project-position.schema';

interface ProjectPositionFormValues {
  positionId: string;
  parentId: string | null;
  status: string;
  employeeIds: string[];
}

interface ProjectPositionInitialValues extends ProjectPositionFormValues {
  positionOption?: SelectOption;
  employeeOptions?: SelectOption[];
}

interface CreateProjectPositionFormProps {
  projectId: string;
  nodeId?: string;
  presetParentId?: string | null;
  presetParentName?: string;
  onSubmit?: (payload: any) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
  initialValues?: ProjectPositionInitialValues;
  initialPermissions?: Permission[];
  submitLabel?: string;
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
  const { formState } = useFormContext<ProjectPositionFormValues>();
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {CREATE_POSITION_PAGE_LABELS.BUTTONS.CANCEL}
      </Button>
      <Button
        type="submit"
        form="create-project-position-form"
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
  const rawPositionId = useWatch<ProjectPositionFormValues>({ name: 'positionId' });
  const positionId = typeof rawPositionId === 'string' ? rawPositionId : '';
  const { data: position, isLoading } = usePosition(positionId);

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

function PICField({
  projectId,
  initialEmployeeOptions = [],
}: {
  projectId?: string;
  initialEmployeeOptions?: SelectOption[];
}) {
  const rawPositionId = useWatch<ProjectPositionFormValues>({ name: 'positionId' });
  const rawEmployeeIds = useWatch<ProjectPositionFormValues>({ name: 'employeeIds' });
  const positionId = typeof rawPositionId === 'string' ? rawPositionId : null;
  const selectedEmployeeIds = useMemo(
    () => (Array.isArray(rawEmployeeIds) ? rawEmployeeIds : []),
    [rawEmployeeIds]
  );
  const {
    control,
    formState: { errors },
  } = useFormContext<ProjectPositionFormValues>();
  const { groupOptions, isLoading: isEmployeesLoading } = useEmployeesByPosition(
    positionId,
    projectId
  );

  // Employee yang sudah terpilih tidak muncul lagi di grup Match/Unmatch,
  // tapi tetap muncul di grup "Terpilih" supaya badge-nya terlihat.
  // (Tanpa ini, pilihan baru hilang dari flatOptions → badge tidak render →
  // terlihat seperti gagal masuk, padahal value sudah tersimpan.)
  const mergedGroupOptions = useMemo<SelectGroup[]>(() => {
    const selectedIds = new Set(selectedEmployeeIds);

    const unselectedGroups = selectedIds.size
      ? groupOptions
          .map((group) => ({
            ...group,
            options: group.options.filter((opt) => !selectedIds.has(opt.value)),
          }))
          .filter((group) => group.options.length > 0)
      : groupOptions;

    // Kumpulkan SEMUA opsi terpilih (dari assignments + yang baru dipilih
    // dari groupOptions) agar badge tetap render untuk keduanya.
    const selectedOptionsById = new Map<string, SelectOption>();
    for (const opt of initialEmployeeOptions) {
      if (selectedIds.has(opt.value)) selectedOptionsById.set(opt.value, opt);
    }
    for (const group of groupOptions) {
      for (const opt of group.options) {
        if (selectedIds.has(opt.value)) selectedOptionsById.set(opt.value, opt);
      }
    }

    if (selectedOptionsById.size === 0) return unselectedGroups;

    return [
      { heading: 'Terpilih', options: [...selectedOptionsById.values()] },
      ...unselectedGroups,
    ];
  }, [groupOptions, initialEmployeeOptions, selectedEmployeeIds]);

  const error = errors.employeeIds?.message as string | undefined;

  return (
    <div className="flex w-full flex-col gap-2">
      <Label className="after:content-['*'] after:ml-0.5 after:text-primary">
        {CREATE_POSITION_PAGE_LABELS.FIELDS.PIC}
      </Label>
      <Controller
        name="employeeIds"
        control={control}
        render={({ field: { value, onChange } }) => (
          <AsyncSelect
            isMulti
            groups={mergedGroupOptions}
            value={value as string[]}
            onChange={(val) => {
              if (Array.isArray(val)) {
                onChange(val);
              }
            }}
            isLoading={isEmployeesLoading}
            placeholder="Pilih PIC"
            isSearchable
            isClearable
          />
        )}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function CreateProjectPositionForm({
  projectId,
  nodeId,
  presetParentId,
  presetParentName,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
  initialValues,
  initialPermissions,
  submitLabel,
}: CreateProjectPositionFormProps) {
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions ?? []);
  const didSeedPermissions = useRef(false);
  const [positionSearch, setPositionSearch] = useState('');
  const [parentSearch, setParentSearch] = useState('');
  const debouncedPositionSearch = useDebounce(positionSearch, 300);
  const debouncedParentSearch = useDebounce(parentSearch, 300);

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
    projectId,
  });

  const {
    options: parentOptions,
    isLoading: isParentLoading,
    hasMore: hasMoreParents,
    isFetchingNextPage: isFetchingMoreParents,
    loadMore: loadMoreParents,
  } = useProjectHierarchyNodesInfinite({
    projectId,
    search: debouncedParentSearch,
    excludeNodeId: nodeId,
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

  const defaultParentId = presetParentId ?? null;
  const mergedPositionOptions = useMemo(() => {
    const initialOption = initialValues?.positionOption;
    if (!initialOption || positionOptions.some((opt) => opt.value === initialOption.value)) {
      return positionOptions;
    }

    return [initialOption, ...positionOptions];
  }, [initialValues?.positionOption, positionOptions]);

  const fields = CREATE_PROJECT_POSITION_FORM_FIELDS.map((f: any) => {
    if (f.type === 'select' && f.name === 'positionId') {
      return {
        ...f,
        options: mergedPositionOptions,
        isLoading: isPositionsLoading,
        onSearchChange: (v: string) => setPositionSearch(v),
        onScrollToBottom: () => {
          if (hasMorePositions && !isFetchingMorePositions) loadMorePositions();
        },
      };
    }
    if (f.type === 'select' && f.name === 'parentId') {
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
    if (f.type === 'custom' && f.name === '_pic') {
      return {
        ...f,
        content: (
          <PICField projectId={projectId} initialEmployeeOptions={initialValues?.employeeOptions} />
        ),
      };
    }
    return f;
  });

  const handleFormSubmit = (formData: ProjectPositionFormValues) => {
    if (!onSubmit) return;

    const payload = {
      projectId,
      parentId: defaultParentId ?? formData.parentId ?? null,
      positionId: formData.positionId,
      isActive: formData.status === 'active',
      permissionIds: getSelectedPermissionIds(),
      employeeIds: formData.employeeIds ?? [],
    };

    onSubmit(payload);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[14px] shadow-sm">
      <div className="px-6 py-6">
        <FormGenerator<ProjectPositionFormValues>
          id="create-project-position-form"
          schema={createProjectPositionSchema as any}
          fields={fields}
          onSubmit={handleFormSubmit}
          defaultValues={{
            positionId: initialValues?.positionId ?? '',
            parentId: initialValues?.parentId ?? defaultParentId,
            status: initialValues?.status ?? 'active',
            employeeIds: initialValues?.employeeIds ?? [],
          }}
          externalErrors={serverErrors}
          className="gap-y-3"
          actions={
            <>
              <Separator className="flex-1 h-[0.05rem] mb-6 mt-4" />

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
