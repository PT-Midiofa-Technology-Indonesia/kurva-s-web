'use client';

import { X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/atoms';
import type { FormFieldConfig } from '@/components/organisms/FormGenerator';
import { FormGenerator } from '@/components/organisms/FormGenerator';
import { useDepartmentsInfinite } from '@/domains/department';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { COMMON_LABELS } from '@/shared/constants';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { COMPANY_LABELS } from '../constants';
import { useCreateCompanyDepartments } from '../hooks/use-create-company-departments';
import type { AddDepartmentInput } from '../schemas';
import { addDepartmentSchema } from '../schemas';
import type { CompanyDepartment } from '../types';

interface AddDepartmentDrawerProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  existingDepartments: CompanyDepartment[];
}

export function AddDepartmentDrawer({
  open,
  onClose,
  companyId,
  companyName,
  existingDepartments,
}: AddDepartmentDrawerProps) {
  const { mutate: createDepartments, isPending } = useCreateCompanyDepartments(companyId);

  const [departmentSearch, setDepartmentSearch] = useState('');
  const debouncedDepartmentSearch = useDebounce(departmentSearch, 300);

  const {
    options: allDepartmentOptions,
    isLoading: isDepartmentsLoading,
    hasMore: hasMoreDepartments,
    isFetchingNextPage: isFetchingMoreDepartments,
    loadMore: loadMoreDepartments,
  } = useDepartmentsInfinite({ search: debouncedDepartmentSearch, isActive: true });

  const existingIds = useMemo(
    () => new Set(existingDepartments.map((d) => d.id)),
    [existingDepartments]
  );

  const departmentOptions = useMemo(
    () => allDepartmentOptions.filter((opt) => !existingIds.has(opt.value)),
    [allDepartmentOptions, existingIds]
  );

  const handleDepartmentSearchChange = useCallback((v: string) => setDepartmentSearch(v), []);
  const handleDepartmentScrollToBottom = useCallback(() => {
    if (hasMoreDepartments && !isFetchingMoreDepartments) loadMoreDepartments();
  }, [hasMoreDepartments, isFetchingMoreDepartments, loadMoreDepartments]);

  const fields: FormFieldConfig<AddDepartmentInput>[] = useMemo(
    () => [
      {
        type: 'custom',
        content: (
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-900">{companyName}</p>
          </div>
        ),
        colSpan: 12,
      },
      {
        name: 'departmentIds',
        label: COMPANY_LABELS.ADD_DEPARTMENT.FIELD_LABEL,
        type: 'select',
        isMulti: true,
        isSearchable: true,
        isClearable: true,
        isLoading: isDepartmentsLoading,
        options: departmentOptions,
        placeholder: COMPANY_LABELS.ADD_DEPARTMENT.PLACEHOLDER,
        required: true,
        colSpan: 12,
        onScrollToBottom: handleDepartmentScrollToBottom,
        onSearchChange: handleDepartmentSearchChange,
      },
    ],
    [
      companyName,
      departmentOptions,
      isDepartmentsLoading,
      handleDepartmentScrollToBottom,
      handleDepartmentSearchChange,
    ]
  );

  const handleSubmit = (data: AddDepartmentInput) => {
    createDepartments(
      { departmentIds: data.departmentIds },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && handleCancel()} direction="right">
      <DrawerContent className="w-lg max-w-lg inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">
              {COMPANY_LABELS.ADD_DEPARTMENT.TITLE}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <FormGenerator
            key={open ? 'open' : 'closed'}
            id="add-dept-form"
            schema={addDepartmentSchema}
            fields={fields}
            onSubmit={handleSubmit}
            defaultValues={{ departmentIds: [] }}
            className="content-start"
          />
        </div>

        <DrawerFooter className="border-t px-4 py-4">
          <Button type="submit" form="add-dept-form" disabled={isPending}>
            {isPending ? COMMON_LABELS.STATE.SAVING : COMPANY_LABELS.ADD_DEPARTMENT.SAVE}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleCancel} disabled={isPending}>
            {COMPANY_LABELS.ADD_DEPARTMENT.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
