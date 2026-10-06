'use client';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import { Badge } from '@/shared/components/ui/badge';
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
import { ADJUSTMENT_LABELS, CATEGORY_BADGE } from '../constants';
import { useCreateEmployeeSalaryAdjustment } from '../hooks/use-create-employee-salary-adjustment';
import { useEmployeeSalaryAdjustmentDetail } from '../hooks/use-employee-salary-adjustment-detail';
import { useUpdateEmployeeSalaryAdjustment } from '../hooks/use-update-employee-salary-adjustment';
import {
  formatPayrollValue,
  getPayrollValueBasis,
  validatePayrollValue,
} from '../services/format-payroll-value';
import { isAdjustableRow } from '../services/is-adjustable-row';
import {
  type PayrollItemErrors,
  parsePayrollItemErrors,
} from '../services/parse-payroll-item-errors';
import type { EmployeeSalaryAdjustment, EmployeeSalaryAdjustmentGridRow } from '../types';
import { PayrollValueInput } from './PayrollValueInput';

interface EmployeeSalaryAdjustmentDrawerProps {
  open: boolean;
  onClose: () => void;
  employee: EmployeeSalaryAdjustment | null;
  companyId?: string;
}

type RowState = {
  adjustedAmount: number | null;
  reason: string;
};

type FormState = Record<string, RowState>;

type FieldErrors = {
  adjustedAmount?: string;
};

const CATEGORY_ORDER = ['pokok', 'tunjangan', 'variable', 'lembur', 'potongan'];

function NoticeBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
      {children}
    </div>
  );
}

function validateRow(row: RowState, gridRow: EmployeeSalaryAdjustmentGridRow): FieldErrors {
  const errors: FieldErrors = {};
  const { adjustedAmount } = row;
  if (adjustedAmount === null) return errors;

  const valueError = validatePayrollValue(adjustedAmount, gridRow.valueType);
  if (valueError) {
    errors.adjustedAmount = valueError;
    return errors;
  }

  const minAmount = gridRow.minAmount !== null ? Number(gridRow.minAmount) : null;
  const maxAmount = gridRow.maxAmount !== null ? Number(gridRow.maxAmount) : null;

  if (
    (minAmount !== null && adjustedAmount < minAmount) ||
    (maxAmount !== null && adjustedAmount > maxAmount)
  ) {
    errors.adjustedAmount = 'Nilai harus dalam range Min - Max golongan';
  }

  return errors;
}

export function EmployeeSalaryAdjustmentDrawer({
  open,
  onClose,
  employee,
  companyId,
}: EmployeeSalaryAdjustmentDrawerProps) {
  const [formState, setFormState] = useState<FormState>({});
  const [serverErrors, setServerErrors] = useState<PayrollItemErrors>({});

  const employeeId = employee?.id ?? null;

  const { data: detail, isLoading: detailLoading } = useEmployeeSalaryAdjustmentDetail(
    employeeId,
    companyId,
    open
  );

  const { mutate: createAdjustment, isPending: isCreating } = useCreateEmployeeSalaryAdjustment();
  const { mutate: updateAdjustment, isPending: isUpdating } = useUpdateEmployeeSalaryAdjustment();
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (!open) {
      setFormState({});
      setServerErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!detail?.grid) return;

    const next: FormState = {};
    for (const row of detail.grid) {
      next[row.payrollComponentId] = {
        adjustedAmount: row.adjustedAmount !== null ? Number(row.adjustedAmount) : null,
        reason: row.reason ?? '',
      };
    }
    setFormState(next);
  }, [open, detail]);

  const setRowField = useCallback(
    (payrollComponentId: string, field: keyof RowState, value: RowState[keyof RowState]) => {
      setFormState((prev) => ({
        ...prev,
        [payrollComponentId]: {
          ...(prev[payrollComponentId] ?? { adjustedAmount: null, reason: '' }),
          [field]: value,
        },
      }));
      setServerErrors((prev) => {
        if (!prev[payrollComponentId]) return prev;
        const next = { ...prev };
        delete next[payrollComponentId];
        return next;
      });
    },
    []
  );

  const rowErrors = useMemo(() => {
    const map: Record<string, FieldErrors> = {};
    for (const row of detail?.grid ?? []) {
      const state = formState[row.payrollComponentId];
      if (!state) continue;
      const errors = validateRow(state, row);
      if (Object.keys(errors).length > 0) {
        map[row.payrollComponentId] = errors;
      }
    }
    return map;
  }, [detail?.grid, formState]);

  const hasErrors = Object.keys(rowErrors).length > 0;

  const mergedRowErrors = useMemo(() => {
    const map: Record<string, FieldErrors> = { ...rowErrors };
    for (const [componentId, fields] of Object.entries(serverErrors)) {
      const message = fields.adjustedAmount ?? fields.payrollComponentId;
      if (message) map[componentId] = { ...map[componentId], adjustedAmount: message };
    }
    return map;
  }, [rowErrors, serverErrors]);

  const adjustableRows = useMemo(
    () => (detail?.grid ?? []).filter(isAdjustableRow),
    [detail?.grid]
  );

  const groupedByCategory = useMemo(() => {
    const grouped: Record<string, EmployeeSalaryAdjustmentGridRow[]> = {};
    for (const row of adjustableRows) {
      if (!grouped[row.category]) grouped[row.category] = [];
      grouped[row.category].push(row);
    }
    return grouped;
  }, [adjustableRows]);

  const sortedCategories = useMemo(() => {
    return CATEGORY_ORDER.filter(
      (cat) => groupedByCategory[cat] && groupedByCategory[cat].length > 0
    );
  }, [groupedByCategory]);

  const isEditMode = detail?.hasAdjustment ?? false;

  const handleSubmit = useCallback(() => {
    if (!employee || !detail) return;

    if (hasErrors) {
      toast.error({ title: 'Periksa kembali nominal yang belum sesuai' });
      return;
    }

    const items = detail.grid.map((row) => {
      const state = formState[row.payrollComponentId];
      return {
        payrollComponentId: row.payrollComponentId,
        adjustedAmount: state?.adjustedAmount ?? null,
        reason: state?.reason?.trim() || null,
      };
    });

    const hasAnyValue = items.some((item) => item.adjustedAmount !== null);
    if (!hasAnyValue) {
      toast.error({ title: ADJUSTMENT_LABELS.FORM.EMPTY });
      return;
    }

    const handleError = (error: unknown) => {
      setServerErrors(
        parsePayrollItemErrors(
          getFieldErrors(error),
          items.map((item) => item.payrollComponentId)
        )
      );
    };

    setServerErrors({});

    if (isEditMode) {
      updateAdjustment(
        { employeeId: employee.id, companyId, items },
        { onSuccess: onClose, onError: handleError }
      );
    } else {
      createAdjustment(
        { employeeId: employee.id, companyId, items },
        { onSuccess: onClose, onError: handleError }
      );
    }
  }, [
    employee,
    detail,
    formState,
    hasErrors,
    isEditMode,
    companyId,
    updateAdjustment,
    createAdjustment,
    onClose,
  ]);

  const showLoader = detailLoading;
  const isPayrollReady = employee?.isPayrollReady ?? true;
  const hasNotice = !isPayrollReady || Boolean(detail?.incomplete);

  return (
    <Drawer open={open} onOpenChange={(v) => !v && onClose()} direction="right">
      <DrawerContent className="w-150 max-w-150! h-full! inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">
              {isEditMode ? ADJUSTMENT_LABELS.FORM.EDIT_TITLE : ADJUSTMENT_LABELS.FORM.CREATE_TITLE}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                <span className="text-lg leading-none">&times;</span>
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 min-h-0 px-4 py-6 flex flex-col gap-6">
          {showLoader ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-200">
                <div className="min-w-0">
                  <Label className="text-xs font-normal text-slate-500">
                    {ADJUSTMENT_LABELS.FORM.NAME}
                  </Label>
                  <p className="text-sm font-medium text-slate-950">{employee?.fullName}</p>
                </div>
                <div>
                  <Label className="text-xs font-normal text-slate-500">
                    {ADJUSTMENT_LABELS.FORM.GOLONGAN}
                  </Label>
                  <p className="text-sm font-medium text-slate-950">
                    {detail?.employee.grade?.code ?? '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-xs font-normal text-slate-500">
                    {ADJUSTMENT_LABELS.FORM.SALARY_TYPE}
                  </Label>
                  <p className="text-sm font-medium text-slate-950 capitalize">
                    {detail?.employee.salaryType ?? '-'}
                  </p>
                </div>
              </div>

              {!isPayrollReady ? (
                <NoticeBanner>{ADJUSTMENT_LABELS.NOT_PAYROLL_READY}</NoticeBanner>
              ) : (
                detail?.incomplete && (
                  <NoticeBanner>{ADJUSTMENT_LABELS.INCOMPLETE_BANNER}</NoticeBanner>
                )
              )}

              {sortedCategories.length === 0 ? (
                hasNotice ? null : (
                  <p className="text-slate-500 text-center py-8">No data available</p>
                )
              ) : (
                <div
                  data-vaul-no-drag
                  className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-5"
                >
                  {sortedCategories.map((cat) => {
                    const badge = CATEGORY_BADGE[cat];
                    const rows = groupedByCategory[cat] ?? [];
                    return (
                      <div key={cat} className="flex flex-col gap-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          {rows[0]?.categoryLabel ?? badge?.label ?? cat}
                        </p>
                        {rows.map((row) => {
                          const state = formState[row.payrollComponentId] ?? {
                            adjustedAmount: null,
                            reason: '',
                          };
                          const errors = mergedRowErrors[row.payrollComponentId];
                          const defaultAmount =
                            row.defaultAmount !== null ? Number(row.defaultAmount) : null;
                          const minAmount = row.minAmount !== null ? Number(row.minAmount) : null;
                          const maxAmount = row.maxAmount !== null ? Number(row.maxAmount) : null;
                          const isUnconfigured = defaultAmount === null;
                          const basis = getPayrollValueBasis(
                            row.valueType,
                            row.baseScope,
                            row.baseComponentName
                          );

                          return (
                            <div
                              key={row.payrollComponentId}
                              className="rounded-lg border border-slate-200 p-3 flex flex-col gap-3"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex flex-col">
                                  <Label className="text-sm font-medium text-slate-800">
                                    {row.componentName}
                                  </Label>
                                  {basis && <span className="text-xs text-slate-500">{basis}</span>}
                                </div>
                                {isUnconfigured ? (
                                  <span className="text-xs text-amber-600 shrink-0">
                                    Belum di-set
                                  </span>
                                ) : (
                                  <Badge variant="secondary" className="rounded-md font-normal">
                                    {ADJUSTMENT_LABELS.FORM.DEFAULT_AMOUNT}:{' '}
                                    {formatPayrollValue(defaultAmount, row.valueType)}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <PayrollValueInput
                                  valueType={row.valueType}
                                  value={state.adjustedAmount ?? undefined}
                                  onChange={(v) =>
                                    setRowField(row.payrollComponentId, 'adjustedAmount', v ?? null)
                                  }
                                  label={ADJUSTMENT_LABELS.FORM.ADJUSTED_AMOUNT}
                                  showLabel={false}
                                  aria-label={ADJUSTMENT_LABELS.FORM.ADJUSTED_AMOUNT}
                                  error={errors?.adjustedAmount}
                                  disabled={isUnconfigured}
                                />
                                {!isUnconfigured && (
                                  <p className="text-xs text-slate-500">
                                    {ADJUSTMENT_LABELS.FORM.RANGE}:{' '}
                                    <span className="font-medium text-slate-700">
                                      {formatPayrollValue(minAmount, row.valueType)} -{' '}
                                      {formatPayrollValue(maxAmount, row.valueType)}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <DrawerFooter className="px-4 py-4 border-t flex flex-col gap-3">
          <Button
            onClick={handleSubmit}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
            disabled={isSaving || showLoader || !isPayrollReady || adjustableRows.length === 0}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : ADJUSTMENT_LABELS.FORM.SAVE}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="w-full">
            {ADJUSTMENT_LABELS.FORM.CANCEL}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
