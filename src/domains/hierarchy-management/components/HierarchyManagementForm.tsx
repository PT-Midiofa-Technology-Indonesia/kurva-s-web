'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, type SelectOption } from '@/components/atoms';
import { FormCard } from '@/components/molecules';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import { useDepartmentsInfinite } from '@/domains/department';
import { usePosition, usePositionsInfinite } from '@/domains/position';
import type { FormFieldConfig } from '@/shared/components/organisms/FormGenerator';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import type { CreateHierarchyManagementPayload } from '../api/create-hierarchy-management';
import type { UpdateHierarchyManagementPayload } from '../api/update-hierarchy-management';
import { HIERARCHY_MANAGEMENT_LABELS, PLACEHOLDERS, STATUS_OPTIONS } from '../constants';
import { useHierarchyManagementsInfinite } from '../hooks/use-hierarchy-managements-infinite';
import { createHierarchyManagementSchema } from '../schemas';
import type { HierarchyManagement } from '../types';

interface HierarchyManagementFormInput {
  departmentId: string;
  positionId: string;
  parentId: string;
  isActive: string;
}

function PositionReadOnlyRow() {
  const { watch } = useFormContext<HierarchyManagementFormInput>();
  const positionId = watch('positionId');
  const { data: position } = usePosition(positionId ?? '');

  return (
    <div className="col-span-12 grid grid-cols-2 gap-x-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-slate-700">
          {HIERARCHY_MANAGEMENT_LABELS.CREATE.FIELDS.POSITION_CODE}
        </Label>
        <Input
          value={position?.code ?? ''}
          placeholder={PLACEHOLDERS.POSITION_CODE}
          disabled
          readOnly
          className="bg-slate-50 text-slate-500 cursor-not-allowed"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-medium text-slate-700">
          {HIERARCHY_MANAGEMENT_LABELS.CREATE.FIELDS.LEVEL}
        </Label>
        <Input
          value={position?.level != null ? String(position.level) : ''}
          placeholder={PLACEHOLDERS.LEVEL}
          disabled
          readOnly
          className="bg-slate-50 text-slate-500 cursor-not-allowed"
        />
      </div>
    </div>
  );
}

interface BuildFormFieldsOptions {
  departmentOptions: SelectOption[];
  positionOptions: SelectOption[];
  parentOptions: SelectOption[];
  isDepartmentsLoading: boolean;
  isPositionsLoading: boolean;
  isParentsLoading: boolean;
  onDepartmentScrollToBottom: () => void;
  onDepartmentSearchChange: (value: string) => void;
  onPositionScrollToBottom: () => void;
  onPositionSearchChange: (value: string) => void;
  onParentScrollToBottom: () => void;
  onParentSearchChange: (value: string) => void;
}

function buildFormFields(
  opts: BuildFormFieldsOptions
): FormFieldConfig<HierarchyManagementFormInput>[] {
  const {
    departmentOptions,
    positionOptions,
    parentOptions,
    isDepartmentsLoading,
    isPositionsLoading,
    isParentsLoading,
    onDepartmentScrollToBottom,
    onDepartmentSearchChange,
    onPositionScrollToBottom,
    onPositionSearchChange,
    onParentScrollToBottom,
    onParentSearchChange,
  } = opts;

  return [
    {
      name: 'departmentId',
      type: 'select',
      label: HIERARCHY_MANAGEMENT_LABELS.CREATE.FIELDS.DEPARTMENT,
      placeholder: PLACEHOLDERS.DEPARTMENT,
      required: true,
      options: departmentOptions,
      isSearchable: true,
      isClearable: true,
      isLoading: isDepartmentsLoading,
      colSpan: 6,
      onScrollToBottom: onDepartmentScrollToBottom,
      onSearchChange: onDepartmentSearchChange,
    },
    {
      name: 'positionId',
      type: 'select',
      label: HIERARCHY_MANAGEMENT_LABELS.CREATE.FIELDS.POSITION,
      placeholder: PLACEHOLDERS.POSITION,
      required: true,
      options: positionOptions,
      isSearchable: true,
      isClearable: true,
      isLoading: isPositionsLoading,
      colSpan: 6,
      onScrollToBottom: onPositionScrollToBottom,
      onSearchChange: onPositionSearchChange,
    },
    {
      type: 'custom',
      colSpan: 12,
      content: <PositionReadOnlyRow />,
    },
    {
      name: 'parentId',
      type: 'select',
      label: HIERARCHY_MANAGEMENT_LABELS.CREATE.FIELDS.PARENT,
      placeholder: PLACEHOLDERS.PARENT,
      required: false,
      options: parentOptions,
      isSearchable: true,
      isClearable: true,
      isLoading: isParentsLoading,
      colSpan: 6,
      onScrollToBottom: onParentScrollToBottom,
      onSearchChange: onParentSearchChange,
    },
    {
      name: 'isActive',
      type: 'select',
      label: HIERARCHY_MANAGEMENT_LABELS.CREATE.FIELDS.STATUS,
      required: true,
      options: STATUS_OPTIONS,
      placeholder: PLACEHOLDERS.STATUS,
      colSpan: 6,
      isSearchable: false,
      isClearable: false,
    },
  ];
}

type FormMode = 'create' | 'edit';

function HierarchyManagementFormActions({
  mode = 'create',
  isSubmitting,
  onCancel,
}: {
  mode: FormMode;
  isSubmitting?: boolean;
  onCancel?: () => void;
}) {
  const { formState } = useFormContext<HierarchyManagementFormInput>();
  const labels =
    mode === 'edit' ? HIERARCHY_MANAGEMENT_LABELS.EDIT : HIERARCHY_MANAGEMENT_LABELS.CREATE;

  return (
    <div className="flex gap-2 justify-end">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        {labels.BUTTONS.CANCEL}
      </Button>
      <Button
        type="submit"
        form="hierarchy-management-form"
        disabled={!formState.isValid || isSubmitting}
      >
        {isSubmitting ? labels.BUTTONS.SAVING : labels.BUTTONS.SAVE}
      </Button>
    </div>
  );
}

interface HierarchyManagementFormProps {
  mode?: FormMode;
  hierarchyManagement?: HierarchyManagement | null;
  onSubmit?: (payload: CreateHierarchyManagementPayload | UpdateHierarchyManagementPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverErrors?: Record<string, string[]>;
}

export function HierarchyManagementForm({
  mode = 'create',
  hierarchyManagement,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors,
}: HierarchyManagementFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = mode === 'edit';
  const selectedCompanyId = useSelectedCompanyStore((s) => s.selectedCompanyId);
  const effectiveCompanyId = searchParams.get('companyId') ?? selectedCompanyId;

  useEffect(() => {
    if (!effectiveCompanyId) router.push('/hierarchy-management');
  }, [router, effectiveCompanyId]);

  const [departmentSearch, setDepartmentSearch] = useState('');
  const [positionSearch, setPositionSearch] = useState('');
  const [parentSearch, setParentSearch] = useState('');
  const debouncedDepartmentSearch = useDebounce(departmentSearch, 300);
  const debouncedPositionSearch = useDebounce(positionSearch, 300);
  const debouncedParentSearch = useDebounce(parentSearch, 300);

  const {
    options: departmentOptions,
    isLoading: isDepartmentsLoading,
    hasMore: hasMoreDepartments,
    isFetchingNextPage: isFetchingMoreDepartments,
    loadMore: loadMoreDepartments,
  } = useDepartmentsInfinite({
    search: debouncedDepartmentSearch,
    companyId: effectiveCompanyId ?? undefined,
  });

  const {
    options: positionOptions,
    isLoading: isPositionsLoading,
    hasMore: hasMorePositions,
    isFetchingNextPage: isFetchingMorePositions,
    loadMore: loadMorePositions,
  } = usePositionsInfinite({ search: debouncedPositionSearch, isActive: true });

  const {
    options: allParentOptions,
    isLoading: isParentsLoading,
    hasMore: hasMoreParents,
    isFetchingNextPage: isFetchingMoreParents,
    loadMore: loadMoreParents,
  } = useHierarchyManagementsInfinite({
    search: debouncedParentSearch,
    isActive: true,
    companyId: effectiveCompanyId ?? undefined,
  });

  const parentOptions = useMemo<SelectOption[]>(
    () => allParentOptions.filter((p) => p.value !== hierarchyManagement?.id),
    [allParentOptions, hierarchyManagement?.id]
  );

  const handleDepartmentSearchChange = useCallback((v: string) => setDepartmentSearch(v), []);
  const handleDepartmentScrollToBottom = useCallback(() => {
    if (hasMoreDepartments && !isFetchingMoreDepartments) loadMoreDepartments();
  }, [hasMoreDepartments, isFetchingMoreDepartments, loadMoreDepartments]);

  const handlePositionSearchChange = useCallback((v: string) => setPositionSearch(v), []);
  const handlePositionScrollToBottom = useCallback(() => {
    if (hasMorePositions && !isFetchingMorePositions) loadMorePositions();
  }, [hasMorePositions, isFetchingMorePositions, loadMorePositions]);

  const handleParentSearchChange = useCallback((v: string) => setParentSearch(v), []);
  const handleParentScrollToBottom = useCallback(() => {
    if (hasMoreParents && !isFetchingMoreParents) loadMoreParents();
  }, [hasMoreParents, isFetchingMoreParents, loadMoreParents]);

  const fields = useMemo(
    () =>
      buildFormFields({
        departmentOptions,
        positionOptions,
        parentOptions,
        isDepartmentsLoading,
        isPositionsLoading,
        isParentsLoading,
        onDepartmentScrollToBottom: handleDepartmentScrollToBottom,
        onDepartmentSearchChange: handleDepartmentSearchChange,
        onPositionScrollToBottom: handlePositionScrollToBottom,
        onPositionSearchChange: handlePositionSearchChange,
        onParentScrollToBottom: handleParentScrollToBottom,
        onParentSearchChange: handleParentSearchChange,
      }),
    [
      departmentOptions,
      positionOptions,
      parentOptions,
      isDepartmentsLoading,
      isPositionsLoading,
      isParentsLoading,
      handleDepartmentScrollToBottom,
      handleDepartmentSearchChange,
      handlePositionScrollToBottom,
      handlePositionSearchChange,
      handleParentScrollToBottom,
      handleParentSearchChange,
    ]
  );

  const defaultValues = useMemo((): HierarchyManagementFormInput => {
    if (!hierarchyManagement) {
      return {
        departmentId: '',
        positionId: '',
        parentId: '',
        isActive: 'true',
      };
    }
    return {
      departmentId: hierarchyManagement.department?.id ?? '',
      positionId: hierarchyManagement.position?.id ?? '',
      parentId: hierarchyManagement.parent?.id ?? '',
      isActive: hierarchyManagement.isActive ? 'true' : 'false',
    };
  }, [hierarchyManagement]);

  const handleFormSubmit = (formData: HierarchyManagementFormInput) => {
    if (!onSubmit) return;

    const payload = {
      departmentId: formData.departmentId,
      positionId: formData.positionId,
      parentId: formData.parentId || null,
      isActive: formData.isActive === 'true',
    };

    onSubmit(payload);
  };

  return (
    <FormCard>
      <FormGenerator<HierarchyManagementFormInput>
        id="hierarchy-management-form"
        fields={fields}
        onSubmit={handleFormSubmit}
        schema={createHierarchyManagementSchema as any}
        defaultValues={defaultValues}
        externalErrors={serverErrors}
        actions={
          <div className="flex gap-2 justify-end px-0 pb-0">
            <HierarchyManagementFormActions
              mode={isEdit ? 'edit' : 'create'}
              isSubmitting={isSubmitting}
              onCancel={onCancel}
            />
          </div>
        }
      />
    </FormCard>
  );
}
