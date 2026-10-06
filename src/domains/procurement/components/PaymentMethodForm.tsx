'use client';

import { Plus, X } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { InputCurrency } from '@/shared/components/atoms/Input/InputCurrency';
import { AsyncSelect } from '@/shared/components/atoms/Select';
import { generateId } from '@/shared/utils/generate-id';
import { usePaymentTypesInfinite } from '../hooks/use-payment-types-infinite';
import { isGiroPayment, type PaymentMethod } from '../types/po-finalize';

export interface PaymentMethodFormProps {
  methods: PaymentMethod[];
  onMethodsChange: (methods: PaymentMethod[]) => void;
  totalAmount: number;
}

export function makeMethod(order: number, totalAmount: number): PaymentMethod {
  return {
    id: generateId(),
    order,
    paymentTypeId: '',
    paymentTypeCode: '',
    paymentTypeLabel: '',
    amount: totalAmount,
    notes: '',
    issueDate: '',
    effectiveDate: '',
    bankName: '',
    checkNumber: '',
  };
}

export function PaymentMethodForm({
  methods,
  onMethodsChange,
  totalAmount,
}: PaymentMethodFormProps) {
  const { data, fetchNextPage, hasNextPage } = usePaymentTypesInfinite();

  const paymentTypeOptions = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) =>
      page.data.map((pt) => ({
        value: pt.id,
        label: pt.name,
        code: pt.code,
      }))
    );
  }, [data]);

  const handleAdd = useCallback(() => {
    onMethodsChange([...methods, makeMethod(methods.length + 1, totalAmount)]);
  }, [methods, totalAmount, onMethodsChange]);

  const handleRemove = useCallback(
    (id: string) => {
      const next = methods.filter((m) => m.id !== id);
      onMethodsChange(next.map((m, i) => ({ ...m, order: i + 1 })));
    },
    [methods, onMethodsChange]
  );

  const handleChange = useCallback(
    <K extends keyof PaymentMethod>(id: string, key: K, value: PaymentMethod[K]) => {
      onMethodsChange(
        methods.map((m) => {
          if (m.id !== id) return m;
          const updated = { ...m, [key]: value };
          if (key === 'paymentTypeId') {
            const selected = paymentTypeOptions.find((o) => o.value === value);
            if (selected) {
              updated.paymentTypeCode = selected.code;
              updated.paymentTypeLabel = selected.label;
              // Clear giro fields if not giro payment type
              if (!isGiroPayment(selected.code)) {
                updated.issueDate = null;
                updated.effectiveDate = null;
                updated.bankName = null;
                updated.checkNumber = null;
              }
            }
          }
          return updated;
        })
      );
    },
    [methods, onMethodsChange, paymentTypeOptions]
  );

  return (
    <div className="space-y-3 pt-2">
      {methods.map((m) => (
        <div key={m.id} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Metode Pembayaran {m.order}</span>
            {methods.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(m.id)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Payment Amount<span className="text-brand-600">*</span>
              </label>
              <InputCurrency
                value={m.amount}
                onChange={(v) => handleChange(m.id, 'amount', v ?? 0)}
                currency="IDR"
                locale="id-ID"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Payment Method<span className="text-brand-600">*</span>
              </label>
              <AsyncSelect
                value={m.paymentTypeId}
                options={paymentTypeOptions as unknown as { value: string; label: string }[]}
                onChange={(v) => handleChange(m.id, 'paymentTypeId', v as string)}
                placeholder="Pilih metode"
                onScrollToBottom={hasNextPage ? fetchNextPage : undefined}
              />
            </div>
          </div>

          {m.paymentTypeCode && !isGiroPayment(m.paymentTypeCode) && (
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Notes</label>
              <textarea
                value={m.notes ?? ''}
                onChange={(e) => handleChange(m.id, 'notes', e.target.value)}
                placeholder="Add notes..."
                rows={3}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm resize-y"
              />
            </div>
          )}

          {isGiroPayment(m.paymentTypeCode) && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Tgl Terbit<span className="text-brand-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={m.issueDate ?? ''}
                    onChange={(e) => handleChange(m.id, 'issueDate', e.target.value || null)}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Tgl Berlaku<span className="text-brand-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={m.effectiveDate ?? ''}
                    onChange={(e) => handleChange(m.id, 'effectiveDate', e.target.value || null)}
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Nama Bank<span className="text-brand-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={m.bankName ?? ''}
                    onChange={(e) => handleChange(m.id, 'bankName', e.target.value || null)}
                    placeholder="Nama bank"
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Check Number<span className="text-brand-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={m.checkNumber ?? ''}
                    onChange={(e) => handleChange(m.id, 'checkNumber', e.target.value || null)}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 font-medium"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Payment Method
      </button>
    </div>
  );
}
