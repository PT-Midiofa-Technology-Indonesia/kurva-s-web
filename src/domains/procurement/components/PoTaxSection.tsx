'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AsyncSelect, Button, Input, Switch } from '@/shared/components/atoms';
import { Label } from '@/shared/components/ui';
import { formatIDR } from '@/shared/utils/currency';
import { PROCUREMENT_LABELS } from '../constants';
import { useProcurementTaxTypes } from '../hooks/use-tax-types';
import { roundTaxAmount } from '../services/tax-rounding';
import type { PoCostBreakdown } from '../types/api';
import type { PoTax } from '../types/po-finalize';

type TaxDraft = {
  taxTypeId: string;
  taxTypeName: string;
  rate: string;
  effect?: 'ADDITION' | 'DEDUCTION' | string;
};

interface PoTaxSectionProps {
  taxes: PoTax[];
  baseAmount: number;
  costBreakdown?: PoCostBreakdown | null;
  onAddTax: (tax: PoTax) => void;
  onRemoveTax: (taxTypeId: string) => void;
  isReadOnly?: boolean;
}

function isDeduction(item: { effect?: string }) {
  return item.effect === 'DEDUCTION';
}

export function PoTaxSection({
  taxes,
  baseAmount,
  costBreakdown,
  onAddTax,
  onRemoveTax,
  isReadOnly = false,
}: PoTaxSectionProps) {
  const labels = PROCUREMENT_LABELS.PURCHASE_PLANNING.FINALIZE.TAX;
  const [isTaxApplied, setIsTaxApplied] = useState(
    taxes.length > 0 || (costBreakdown?.rows && costBreakdown.rows.length > 0)
  );
  const [showTaxForm, setShowTaxForm] = useState(false);
  const [taxDraft, setTaxDraft] = useState<TaxDraft>({ taxTypeId: '', taxTypeName: '', rate: '' });
  const { data: taxTypesResponse, isLoading } = useProcurementTaxTypes();

  const taxOptions = useMemo(
    () =>
      (taxTypesResponse?.data ?? []).map((taxType) => ({
        value: taxType.id,
        label: taxType.name,
        defaultRate: taxType.defaultRate ?? 0,
        effect: taxType.effect ?? (taxType.category === 'WITHHOLDING' ? 'DEDUCTION' : 'ADDITION'),
      })),
    [taxTypesResponse?.data]
  );

  useEffect(() => {
    if (taxes.length > 0 || (costBreakdown?.rows && costBreakdown.rows.length > 0)) {
      setIsTaxApplied(true);
    }
  }, [taxes.length, costBreakdown]);

  const resetDraft = () => setTaxDraft({ taxTypeId: '', taxTypeName: '', rate: '' });

  const handleApplyTaxChange = (checked: boolean) => {
    if (isReadOnly) return;
    setIsTaxApplied(checked);
    if (!checked) {
      setShowTaxForm(false);
      resetDraft();
      taxes.forEach((tax) => {
        onRemoveTax(tax.taxTypeId);
      });
    }
  };

  const handleSaveTax = () => {
    if (!taxDraft.taxTypeId) return;
    onAddTax({
      taxTypeId: taxDraft.taxTypeId,
      taxTypeName: taxDraft.taxTypeName,
      rate: Number(taxDraft.rate || 0),
      effect: taxDraft.effect ?? 'ADDITION',
    });
    resetDraft();
    setShowTaxForm(false);
  };

  const taxAmounts = useMemo(() => {
    return taxes.map((tax) => {
      if (typeof tax.amount === 'number') {
        return roundTaxAmount(tax.amount);
      }
      return roundTaxAmount((baseAmount * tax.rate) / 100);
    });
  }, [taxes, baseAmount]);

  const totalTaxAddition = useMemo(() => {
    return taxes.reduce((acc, tax, idx) => {
      return !isDeduction(tax) ? acc + (taxAmounts[idx] ?? 0) : acc;
    }, 0);
  }, [taxes, taxAmounts]);

  const totalTaxDeduction = useMemo(() => {
    return taxes.reduce((acc, tax, idx) => {
      return isDeduction(tax) ? acc + (taxAmounts[idx] ?? 0) : acc;
    }, 0);
  }, [taxes, taxAmounts]);

  const localTotalAfterTax = baseAmount + totalTaxAddition - totalTaxDeduction;

  const hasCostBreakdown =
    !!costBreakdown && Array.isArray(costBreakdown.rows) && costBreakdown.rows.length > 0;

  const summaryTitle =
    hasCostBreakdown && costBreakdown?.title ? costBreakdown.title : labels.SUMMARY.TITLE;

  const summaryRows = useMemo(() => {
    if (hasCostBreakdown && costBreakdown?.rows) {
      return costBreakdown.rows;
    }
    return [
      {
        label: labels.SUMMARY.BASE_AMOUNT,
        amount: baseAmount,
        effect: 'BASE',
      },
      ...taxes.map((tax, idx) => ({
        label: `${tax.taxTypeName} (${tax.rate}%)`,
        amount: taxAmounts[idx] ?? 0,
        effect: tax.effect ?? 'ADDITION',
      })),
    ];
  }, [hasCostBreakdown, costBreakdown, labels.SUMMARY.BASE_AMOUNT, baseAmount, taxes, taxAmounts]);

  const finalTotal =
    hasCostBreakdown && typeof costBreakdown?.totalPayable === 'number'
      ? costBreakdown.totalPayable
      : localTotalAfterTax;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <Switch
            checked={isTaxApplied}
            onCheckedChange={(checked) => handleApplyTaxChange(checked === true)}
            disabled={isReadOnly}
          />
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold text-slate-950">{labels.TITLE}</span>
            <span className="text-sm text-slate-500">{labels.DESCRIPTION}</span>
          </div>
        </div>

        {isTaxApplied ? (
          <div className="mt-6 flex flex-col gap-4">
            {taxes.length === 0 && !showTaxForm ? (
              <div className="rounded-2xl bg-slate-100 px-4 py-4 text-sm text-slate-500">
                {labels.EMPTY}
              </div>
            ) : null}

            {taxes.map((tax) => (
              <div key={tax.taxTypeId} className="grid grid-cols-[1fr_200px_40px] items-end gap-4">
                <div className="flex flex-col gap-2">
                  <Label>{labels.SELECT_TAX_LABEL}</Label>
                  <Input
                    value={tax.taxTypeName}
                    readOnly
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 font-medium text-slate-900"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>{labels.RATE_LABEL}</Label>
                  <div className="relative">
                    <Input
                      value={String(tax.rate)}
                      readOnly
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 pr-10 font-medium text-slate-900"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                      %
                    </span>
                  </div>
                </div>

                {!isReadOnly ? (
                  <button
                    type="button"
                    className="flex h-11 w-10 items-center justify-center text-red-500 transition hover:text-red-600"
                    onClick={() => onRemoveTax(tax.taxTypeId)}
                    aria-label={`${labels.REMOVE_TAX} ${tax.taxTypeName}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))}

            {showTaxForm ? (
              <div className="grid grid-cols-[1fr_200px_40px] items-end gap-4">
                <div className="flex flex-col gap-2">
                  <Label>{labels.SELECT_TAX_LABEL}</Label>
                  <AsyncSelect
                    options={taxOptions.filter(
                      (option) => !taxes.some((tax) => tax.taxTypeId === option.value)
                    )}
                    value={taxDraft.taxTypeId || null}
                    placeholder={labels.SELECT_TAX_PLACEHOLDER}
                    isSearchable={false}
                    isLoading={isLoading}
                    className="h-11 rounded-xl border-slate-200"
                    onChange={(value) => {
                      const selectedValue = typeof value === 'string' ? value : '';
                      const selected = taxOptions.find((item) => item.value === selectedValue);
                      setTaxDraft({
                        taxTypeId: selectedValue,
                        taxTypeName: selected?.label ?? '',
                        rate: selected != null ? String(selected.defaultRate) : '',
                        effect: selected?.effect ?? 'ADDITION',
                      });
                    }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label>{labels.RATE_LABEL}</Label>
                  <div className="relative">
                    <Input
                      value={taxDraft.rate}
                      readOnly
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 pr-10 font-medium text-slate-900"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-11 w-10 items-center justify-center text-red-500 transition hover:text-red-600"
                    onClick={() => {
                      setShowTaxForm(false);
                      resetDraft();
                    }}
                    aria-label={labels.REMOVE_TAX}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : null}

            {showTaxForm && taxDraft.taxTypeId ? (
              <div className="flex justify-end">
                <Button
                  type="button"
                  className="h-10 rounded-xl bg-teal-600 px-5 text-white hover:bg-teal-700"
                  onClick={handleSaveTax}
                >
                  {labels.ADD_SELECTED_TAX}
                </Button>
              </div>
            ) : null}

            {!isReadOnly && !showTaxForm ? (
              <Button
                type="button"
                variant="outline"
                className="h-11 w-fit rounded-xl border-dashed text-slate-700 hover:bg-slate-50"
                onClick={() => setShowTaxForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                {labels.ADD_TAX_COMPONENT}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {isTaxApplied ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {summaryTitle}
          </h3>
          <div className="mt-4 flex flex-col gap-3">
            {summaryRows.map((row, idx) => {
              const isDed = row.effect === 'DEDUCTION';
              return (
                <div
                  key={`${row.label}-${idx}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-medium text-slate-900">
                    {isDed ? `- ${formatIDR(Math.abs(row.amount))}` : formatIDR(row.amount)}
                  </span>
                </div>
              );
            })}

            <div className="my-1 border-t border-slate-100" />

            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-950">{labels.SUMMARY.TOTAL_AFTER_TAX}</span>
              <span className="font-bold text-slate-950">{formatIDR(finalTotal)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
