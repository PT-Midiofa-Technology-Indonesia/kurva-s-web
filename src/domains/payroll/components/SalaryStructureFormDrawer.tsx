'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import type { TabItem } from '@/shared/components/molecules/Tabs';
import { Tabs } from '@/shared/components/molecules/Tabs';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import { Label } from '@/shared/components/ui/label';
import { getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { CATEGORY_BADGE, PAYROLL_LABELS } from '../constants';
import { useSalaryStructureDetail } from '../hooks/use-salary-structure-detail';
import { useUpdateSalaryStructure } from '../hooks/use-update-salary-structure';
import { getPayrollValueBasis } from '../services/format-payroll-value';
import {
  type PayrollItemErrors,
  parsePayrollItemErrors,
} from '../services/parse-payroll-item-errors';
import {
  collectStructureErrors,
  findFirstTypeWithErrors,
  type StructureFieldErrors,
  type StructureFormData,
  type StructureFormItem,
} from '../services/salary-structure-form';
import type { SalaryStructureDetailItem, SalaryType, UpdateSalaryStructurePayload } from '../types';
import { PayrollValueInput } from './PayrollValueInput';

interface SalaryStructureFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  gradeId: string | null;
  gradeCode: string;
}

type FormDataByType = Partial<Record<SalaryType, StructureFormData>>;

type ServerErrorsByType = Partial<Record<SalaryType, PayrollItemErrors>>;

const CATEGORY_ORDER = ['pokok', 'tunjangan', 'variable', 'lembur', 'potongan'] as const;

const SALARY_TABS: { value: SalaryType; label: string }[] = [
  { value: 'monthly', label: 'Bulanan' },
  { value: 'daily', label: 'Harian' },
  { value: 'hourly', label: 'Hourly' },
];

function groupByCategory(items: StructureFormItem[]): StructureFormData {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category]?.push(item);
    return acc;
  }, {} as StructureFormData);
}

export function SalaryStructureFormDrawer({
  open,
  onClose,
  onSuccess,
  gradeId,
  gradeCode,
}: SalaryStructureFormDrawerProps) {
  const [salaryType, setSalaryType] = useState<SalaryType>('monthly');
  const [formDataByType, setFormDataByType] = useState<FormDataByType>({});
  const [serverErrors, setServerErrors] = useState<ServerErrorsByType>({});
  const [dirtyTypes, setDirtyTypes] = useState<SalaryType[]>([]);
  const dirtyTypesRef = useRef<SalaryType[]>([]);
  dirtyTypesRef.current = dirtyTypes;
  const formDataByTypeRef = useRef<FormDataByType>({});
  formDataByTypeRef.current = formDataByType;

  const { data: detailData, isLoading: detailLoading } = useSalaryStructureDetail(
    gradeId,
    salaryType
  );

  const { mutateAsync: updateMutate, isPending: isSaving } = useUpdateSalaryStructure();

  useEffect(() => {
    if (!open) {
      setSalaryType('monthly');
      setFormDataByType({});
      setServerErrors({});
      setDirtyTypes([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // a refetch (or coming back to this tab) must not wipe what is still unsaved here
    if (dirtyTypesRef.current.includes(salaryType)) return;

    if (detailData?.items && detailData.items.length > 0) {
      const items: StructureFormItem[] = detailData.items.map(
        (item: SalaryStructureDetailItem) => ({
          payroll_component_id: item.payroll_component_id,
          component_name: item.component_name,
          category: item.category,
          is_deduction: item.is_deduction ?? item.category === 'potongan',
          value_type: item.value_type,
          base_scope: item.base_scope,
          base_component_name: item.base_component_name,
          is_applicable: item.is_applicable,
          is_mandatory: item.is_mandatory,
          default_amount:
            item.is_applicable && item.default_amount ? Number(item.default_amount) : null,
          min_amount: item.is_applicable && item.min_amount ? Number(item.min_amount) : null,
          max_amount: item.is_applicable && item.max_amount ? Number(item.max_amount) : null,
          is_active: item.is_active,
        })
      );
      setFormDataByType((prev) => ({ ...prev, [salaryType]: groupByCategory(items) }));
    } else {
      setFormDataByType((prev) => ({ ...prev, [salaryType]: {} }));
    }
  }, [open, salaryType, detailData]);

  const clearServerError = useCallback((type: SalaryType, componentId: string) => {
    setServerErrors((prev) => {
      if (!prev[type]?.[componentId]) return prev;
      const forType = { ...prev[type] };
      delete forType[componentId];
      return { ...prev, [type]: forType };
    });
  }, []);

  const markDirty = useCallback((type: SalaryType) => {
    setDirtyTypes((prev) => (prev.includes(type) ? prev : [...prev, type]));
  }, []);

  const setItemField = useCallback(
    (
      type: SalaryType,
      category: string,
      index: number,
      field: 'default_amount' | 'min_amount' | 'max_amount',
      value: number | undefined
    ) => {
      const componentId =
        formDataByTypeRef.current[type]?.[category]?.[index]?.payroll_component_id;
      if (!componentId) return;

      setFormDataByType((prev) => {
        const current = prev[type] ?? {};
        const items = [...(current[category] ?? [])];
        const item = items[index];
        if (!item) return prev;
        items[index] = { ...item, [field]: value ?? null };
        return { ...prev, [type]: { ...current, [category]: items } };
      });

      clearServerError(type, componentId);
      markDirty(type);
    },
    [clearServerError, markDirty]
  );

  const setItemApplicable = useCallback(
    (type: SalaryType, category: string, index: number, applicable: boolean) => {
      const componentId =
        formDataByTypeRef.current[type]?.[category]?.[index]?.payroll_component_id;
      if (!componentId) return;

      setFormDataByType((prev) => {
        const current = prev[type] ?? {};
        const items = [...(current[category] ?? [])];
        const item = items[index];
        if (!item) return prev;
        items[index] = applicable
          ? { ...item, is_applicable: true }
          : {
              ...item,
              is_applicable: false,
              default_amount: null,
              min_amount: null,
              max_amount: null,
            };
        return { ...prev, [type]: { ...current, [category]: items } };
      });

      clearServerError(type, componentId);
      markDirty(type);
    },
    [clearServerError, markDirty]
  );

  const errorsByType = useMemo(() => {
    const map: Partial<Record<SalaryType, Record<string, StructureFieldErrors>>> = {};
    for (const type of SALARY_TABS) {
      const data = formDataByType[type.value];
      if (data) map[type.value] = collectStructureErrors(data);
    }
    return map;
  }, [formDataByType]);

  const rowErrorsByType = useMemo(() => {
    const map: Partial<Record<SalaryType, Record<string, StructureFieldErrors>>> = {};
    for (const type of SALARY_TABS) {
      const merged: Record<string, StructureFieldErrors> = { ...errorsByType[type.value] };
      for (const [componentId, fields] of Object.entries(serverErrors[type.value] ?? {})) {
        merged[componentId] = { ...merged[componentId], ...fields };
      }
      map[type.value] = merged;
    }
    return map;
  }, [errorsByType, serverErrors]);

  const buildItems = useCallback(
    (data: StructureFormData): UpdateSalaryStructurePayload['items'] =>
      Object.values(data).flatMap((categoryItems) =>
        categoryItems.map((item) => ({
          payroll_component_id: item.payroll_component_id,
          is_applicable: item.is_applicable,
          default_amount: item.default_amount,
          min_amount: item.min_amount,
          max_amount: item.max_amount,
          is_active: item.is_active,
        }))
      ),
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!gradeId) return;

    setServerErrors({});

    const pendingTypes = SALARY_TABS.map((tab) => tab.value).filter((type) =>
      dirtyTypes.includes(type)
    );

    if (pendingTypes.length === 0) {
      onClose();
      return;
    }

    // a bad value on a tab that is not on screen would otherwise reach the server unseen
    const offendingType = findFirstTypeWithErrors(errorsByType, pendingTypes);
    if (offendingType) {
      setSalaryType(offendingType);
      const tabLabel = SALARY_TABS.find((tab) => tab.value === offendingType)?.label;
      toast.error({ title: `Periksa kembali nominal di tab ${tabLabel}` });
      return;
    }

    // one request per salary type; a later failure must not undo an earlier success
    for (const type of pendingTypes) {
      const items = buildItems(formDataByType[type] ?? {});

      try {
        await updateMutate({ employeeGradeId: gradeId, salaryType: type, items });
        setDirtyTypes((prev) => prev.filter((pending) => pending !== type));
      } catch (error) {
        setSalaryType(type);
        setServerErrors({
          [type]: parsePayrollItemErrors(
            getFieldErrors(error),
            items.map((item) => item.payroll_component_id)
          ),
        });
        return;
      }
    }

    toast.success({ title: 'Salary structure berhasil disimpan' });
    onClose();
    onSuccess?.();
  }, [
    gradeId,
    dirtyTypes,
    errorsByType,
    formDataByType,
    buildItems,
    updateMutate,
    onClose,
    onSuccess,
  ]);

  const showLoader = detailLoading && !formDataByType[salaryType];

  const renderGrid = useCallback(
    (type: SalaryType) => {
      const typeFormData = formDataByType[type] ?? {};
      const sortedCategories = CATEGORY_ORDER.filter(
        (cat) => typeFormData[cat] && typeFormData[cat].length > 0
      );

      if (sortedCategories.length === 0) {
        return <p className="text-slate-500 text-center py-8">No data available</p>;
      }

      return (
        <div data-vaul-no-drag className="h-full min-h-0 overflow-y-auto pr-1 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 px-3 text-xs font-medium text-slate-500">
            <span className="flex-1 min-w-0" />
            <span className="w-28 shrink-0 text-right">
              {PAYROLL_LABELS.SALARY_STRUCTURE.COLUMNS.MIN}
            </span>
            <span className="w-28 shrink-0 text-right">
              {PAYROLL_LABELS.SALARY_STRUCTURE.COLUMNS.MAX}
            </span>
            <span className="w-28 shrink-0 text-right">
              {PAYROLL_LABELS.SALARY_STRUCTURE.COLUMNS.AMOUNT}
            </span>
          </div>
          {sortedCategories.map((cat) => {
            const badge = CATEGORY_BADGE[cat];
            const items = typeFormData[cat] ?? [];
            return (
              <div key={cat} className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {badge?.label ?? cat}
                </p>
                {items.map((item, idx) => {
                  const errors = rowErrorsByType[type]?.[item.payroll_component_id];
                  const basis = getPayrollValueBasis(
                    item.value_type,
                    item.base_scope,
                    item.base_component_name
                  );
                  return (
                    <div
                      key={item.payroll_component_id}
                      className="flex items-center gap-2.5 rounded-lg border border-slate-200 p-3"
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-2.5">
                        <Checkbox
                          size="sm"
                          checked={item.is_applicable}
                          disabled={item.is_mandatory}
                          onCheckedChange={(next) =>
                            setItemApplicable(type, cat, idx, next === true)
                          }
                          aria-label={`${item.component_name} berlaku untuk golongan ini`}
                        />
                        <div className="min-w-0 flex flex-col">
                          <Label className="text-sm font-medium text-slate-800">
                            {item.component_name}
                          </Label>
                          {basis && <span className="text-xs text-slate-500">{basis}</span>}
                          {errors?.is_applicable && (
                            <span className="text-xs text-destructive">{errors.is_applicable}</span>
                          )}
                        </div>
                      </div>
                      <div className="w-28 shrink-0">
                        <PayrollValueInput
                          valueType={item.value_type}
                          value={item.min_amount ?? undefined}
                          onChange={(v) => setItemField(type, cat, idx, 'min_amount', v)}
                          error={errors?.min_amount}
                          disabled={!item.is_applicable}
                          className="text-right"
                        />
                      </div>
                      <div className="w-28 shrink-0">
                        <PayrollValueInput
                          valueType={item.value_type}
                          value={item.max_amount ?? undefined}
                          onChange={(v) => setItemField(type, cat, idx, 'max_amount', v)}
                          error={errors?.max_amount}
                          disabled={!item.is_applicable}
                          className="text-right"
                        />
                      </div>
                      <div className="w-28 shrink-0">
                        <PayrollValueInput
                          valueType={item.value_type}
                          value={item.default_amount ?? undefined}
                          onChange={(v) => setItemField(type, cat, idx, 'default_amount', v)}
                          error={errors?.default_amount}
                          disabled={!item.is_applicable}
                          className="text-right"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      );
    },
    [formDataByType, rowErrorsByType, setItemApplicable, setItemField]
  );

  const salaryTabItems = useMemo<TabItem[]>(
    () =>
      SALARY_TABS.map((tab) => ({
        key: tab.value,
        label: tab.label,
        content: renderGrid(tab.value),
        isLoading: tab.value === salaryType && detailLoading && !formDataByType[tab.value],
      })),
    [renderGrid, salaryType, detailLoading, formDataByType]
  );

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent className="w-180 max-w-180! h-full! inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
              {PAYROLL_LABELS.SALARY_STRUCTURE.FORM.TITLE}
              {gradeCode ? ` - ${gradeCode}` : ''}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                <span className="text-lg leading-none">&times;</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 min-h-0 overflow-hidden px-4 py-6 flex flex-col">
          {showLoader ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col [&>div]:h-full [&>div]:min-h-0">
              <Tabs
                items={salaryTabItems}
                activeKey={salaryType}
                onChange={(key) => setSalaryType(key as SalaryType)}
                className="px-0"
                contentClassName="pt-4 flex-1 min-h-0 overflow-hidden"
              />
            </div>
          )}
        </div>

        <DrawerFooter className="px-4 py-4 border-t flex flex-col gap-3">
          <Button
            onClick={handleSubmit}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isSaving || showLoader}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Batal
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
