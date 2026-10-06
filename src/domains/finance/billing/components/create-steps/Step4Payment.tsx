'use client';

import { format } from 'date-fns';
import { Plus, Send, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { AsyncSelect } from '@/shared/components/atoms';
import { DatePicker } from '@/shared/components/molecules/DatePicker/DatePicker';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from '@/shared/components/ui';
import { toast } from '@/shared/lib/toast';
import { formatCurrencyIDR } from '@/shared/utils/format';
import { BILLING_LABELS } from '../../constants';
import { useBillingPaymentDetail } from '../../hooks/use-billing-payment-detail';
import { useBillingTaxTypes } from '../../hooks/use-billing-tax-types';
import { useDeleteBillingBankAccount } from '../../hooks/use-delete-billing-bank-account';
import { useDeleteBillingTax } from '../../hooks/use-delete-billing-tax';
import { useSaveBillingBankAccount } from '../../hooks/use-save-billing-bank-account';
import { useSaveBillingTax } from '../../hooks/use-save-billing-tax';
import { useSetBillingPayment } from '../../hooks/use-set-billing-payment';
import type { CreateBillingFormValues } from '../../schemas';
import type {
  BillingPaymentBankAccount,
  BillingPaymentTax,
  BillingProjectDetail,
} from '../../types';

type Step4PaymentProps = {
  billingDetail?: BillingProjectDetail;
  billingId?: string | null;
  companyId?: string;
  handleBack: () => void;
};

type ModalType = 'account' | 'tax' | null;

type AccountDraft = {
  bank: string;
  number: string;
  holder: string;
};

type TaxDraft = {
  taxTypeId: string;
  label: string;
  percentage: string;
};

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={[
        'flex items-center justify-between gap-4',
        strong ? 'text-base font-semibold text-slate-950' : 'text-sm text-slate-600',
      ].join(' ')}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

const PAYMENT_METHODS = [
  { value: 'transfer', label: BILLING_LABELS.CREATE.BANK_TRANSFER },
  { value: 'check', label: BILLING_LABELS.CREATE.BANK_GIRO },
  { value: 'cash', label: BILLING_LABELS.CREATE.CASH },
] as const;

function formatYmd(value: Date) {
  return format(value, 'yyyy-MM-dd');
}

export function Step4Payment({
  billingDetail,
  billingId,
  companyId,
  handleBack,
}: Step4PaymentProps) {
  const router = useRouter();
  const form = useFormContext<CreateBillingFormValues>();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [accountDraft, setAccountDraft] = useState<AccountDraft>({
    bank: 'BCA',
    number: '',
    holder: '',
  });
  const [taxDraft, setTaxDraft] = useState<TaxDraft>({
    taxTypeId: '',
    label: '',
    percentage: '',
  });

  const { data: paymentDetailResponse, isLoading } = useBillingPaymentDetail({
    billingId: billingId ?? '',
    companyId,
  });
  const { data: taxTypesResponse, isLoading: isLoadingTaxTypes } = useBillingTaxTypes();
  const paymentDetail = paymentDetailResponse?.data;

  const { mutate: saveBankAccount, isPending: isSavingBank } = useSaveBillingBankAccount();
  const { mutate: deleteBankAccount, isPending: isDeletingBank } = useDeleteBillingBankAccount();
  const { mutate: saveTax, isPending: isSavingTax } = useSaveBillingTax();
  const { mutate: deleteTax, isPending: isDeletingTax } = useDeleteBillingTax();
  const { mutate: setPayment, isPending: isSavingPayment } = useSetBillingPayment();

  const taxes = paymentDetail?.taxes ?? [];
  const accounts = paymentDetail?.bankAccounts ?? [];
  const paymentMethods = paymentDetail?.paymentMethods ?? [];
  const summary = paymentDetail?.summary;
  const taxTypeOptions = (taxTypesResponse?.data ?? []).map((item) => ({
    value: item.id,
    label: item.name,
    defaultRate: item.defaultRate ?? 0,
  }));

  const selectedPaymentMethods = form.watch('paymentMethods') ?? [];
  const [isTaxApplied, setIsTaxApplied] = useState(taxes.length > 0);
  const isTransferSelected = selectedPaymentMethods.includes('transfer');

  useEffect(() => {
    const currentPaymentMethods = form.getValues('paymentMethods') ?? [];

    if (paymentMethods.length > 0 && currentPaymentMethods.length === 0) {
      form.setValue('paymentMethods', paymentMethods);
    }
  }, [form, paymentMethods]);

  useEffect(() => {
    if (paymentDetail?.dueDate && !form.getValues('dueDate')) {
      form.setValue('dueDate', paymentDetail.dueDate);
    }
    if (paymentDetail?.notes && !form.getValues('reviewNotes')) {
      form.setValue('reviewNotes', paymentDetail.notes);
    }
  }, [form, paymentDetail]);

  useEffect(() => {
    setIsTaxApplied(taxes.length > 0);
  }, [taxes.length]);

  const taxSummaryLabel = useMemo(() => {
    const firstTax = taxes[0];
    return firstTax ? `${firstTax.taxName} ${firstTax.percentage}%` : BILLING_LABELS.CREATE.VAT;
  }, [taxes]);

  const handleAccountSave = () => {
    if (!billingId || !companyId) return;

    saveBankAccount(
      {
        billingId,
        companyId,
        bankName: accountDraft.bank,
        accountNumber: accountDraft.number,
        accountName: accountDraft.holder,
      },
      {
        onSuccess: () => {
          toast.success({ title: 'Rekening berhasil disimpan' });
          setAccountDraft({ bank: 'BCA', number: '', holder: '' });
          setActiveModal(null);
        },
        onError: () => {
          toast.error({ title: 'Gagal menyimpan rekening' });
        },
      }
    );
  };

  const handleDeleteAccount = (bankAccountId: string) => {
    if (!billingId || !companyId) return;

    deleteBankAccount(
      {
        billingId,
        companyId,
        bankAccountId,
      },
      {
        onSuccess: () => {
          toast.success({ title: 'Rekening berhasil dihapus' });
        },
        onError: () => {
          toast.error({ title: 'Gagal menghapus rekening' });
        },
      }
    );
  };

  const handleTaxSave = () => {
    if (!billingId || !companyId) return;
    if (!taxDraft.taxTypeId) return;

    saveTax(
      {
        billingId,
        companyId,
        taxTypeId: taxDraft.taxTypeId,
        value: Number(taxDraft.percentage || 0),
      },
      {
        onSuccess: () => {
          toast.success({ title: 'Pajak berhasil disimpan' });
          setTaxDraft({ taxTypeId: '', label: '', percentage: '' });
          setActiveModal(null);
        },
        onError: () => {
          toast.error({ title: 'Gagal menyimpan pajak' });
        },
      }
    );
  };

  const handleDeleteTax = (taxId: string) => {
    if (!billingId || !companyId) return;

    deleteTax(
      {
        billingId,
        companyId,
        taxId,
      },
      {
        onSuccess: () => {
          toast.success({ title: 'Pajak berhasil dihapus' });
        },
        onError: () => {
          toast.error({ title: 'Gagal menghapus pajak' });
        },
      }
    );
  };

  const handleSave = (action: 'draft' | 'invoiced') => {
    if (!billingId || !companyId) return;

    setPayment(
      {
        billingId,
        companyId,
        paymentMethods: selectedPaymentMethods,
        bankAccounts: isTransferSelected ? accounts : undefined,
        taxes: isTaxApplied ? taxes : undefined,
        dueDate: form.getValues('dueDate'),
        notes: form.getValues('reviewNotes') || undefined,
        action,
      },
      {
        onSuccess: () => {
          toast.success({
            title:
              action === 'invoiced' ? 'Pembayaran berhasil di-invoiced' : 'Draft berhasil disimpan',
          });
          if (targetProjectId) {
            router.push(
              `/finance/billings/${targetProjectId}/records/${billingId}?companyId=${companyId}`
            );
          }
        },
        onError: () => {
          toast.error({ title: 'Gagal menyimpan pembayaran' });
        },
      }
    );
  };

  const handlePaymentMethodToggle = (paymentMethod: string, checked: boolean) => {
    const currentPaymentMethods = form.getValues('paymentMethods') ?? [];
    const nextPaymentMethods = checked
      ? [...new Set([...currentPaymentMethods, paymentMethod])]
      : currentPaymentMethods.filter((item) => item !== paymentMethod);

    form.setValue('paymentMethods', nextPaymentMethods, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const disabled = !billingId || !companyId;
  const targetProjectId = billingDetail?.project?.id ?? form.getValues('projectId');

  return (
    <>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_400px] xl:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              {BILLING_LABELS.CREATE.PAYMENT_INFORMATION}
            </h3>

            <div className="mt-6 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Label>{BILLING_LABELS.CREATE.PAYMENT_METHOD}</Label>
                <div className="flex flex-col gap-3">
                  {PAYMENT_METHODS.map((item) => (
                    <label
                      key={item.value}
                      className="flex items-center gap-3 text-sm text-slate-700"
                    >
                      <Checkbox
                        checked={selectedPaymentMethods.includes(item.value)}
                        onCheckedChange={(checked) =>
                          handlePaymentMethodToggle(item.value, checked === true)
                        }
                        className="data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {isTransferSelected ? (
                <div className="flex flex-col gap-3">
                  <Label>{BILLING_LABELS.CREATE.RECIPIENT_ACCOUNT}</Label>
                  <div className="flex items-start gap-3">
                    <div className="flex min-w-0 flex-auto flex-col gap-3">
                      {isLoading ? (
                        <div className="rounded-2xl bg-slate-100 px-4 py-4 text-sm text-slate-500">
                          Memuat rekening...
                        </div>
                      ) : accounts.length === 0 ? (
                        <div className="rounded-2xl bg-slate-100 px-4 py-4 text-sm text-slate-500">
                          Belum ada rekening.
                        </div>
                      ) : (
                        accounts.map((account: BillingPaymentBankAccount) => (
                          <div
                            key={account.id}
                            className="flex min-w-0 w-auto max-w-fit items-start justify-between gap-6 rounded-2xl bg-slate-100 px-4 py-4"
                          >
                            <div>
                              <p className="text-sm font-semibold text-slate-950">
                                {account.bankName} - {account.accountNumber}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                a.n {account.accountName}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="text-slate-500 transition hover:text-red-600"
                              onClick={() => handleDeleteAccount(account.id)}
                              disabled={isDeletingBank}
                              aria-label={`Hapus rekening ${account.bankName}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label="Tambah rekening"
                      onClick={() => setActiveModal('account')}
                      className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-700"
                      disabled={disabled}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <Label>{BILLING_LABELS.CREATE.DUE_DATE}</Label>
                <Controller
                  name="dueDate"
                  control={form.control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(value) => {
                        if (value instanceof Date) field.onChange(formatYmd(value));
                      }}
                      className="h-11 w-full justify-start rounded-xl border-slate-200 text-left font-normal"
                      placeholder="Pilih tanggal"
                      showChevron={false}
                      footer={null}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="reviewNotes">{BILLING_LABELS.CREATE.NOTES_EN}</Label>
                <Textarea
                  id="reviewNotes"
                  rows={5}
                  placeholder="Tambahkan catatan pembayaran..."
                  {...form.register('reviewNotes')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              {BILLING_LABELS.CREATE.TAX_INFORMATION}
            </h3>

            <div className="mt-6 flex flex-col gap-4">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <Checkbox
                  checked={isTaxApplied}
                  onCheckedChange={(checked) => setIsTaxApplied(checked === true)}
                  className="data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600"
                />
                <span>{BILLING_LABELS.CREATE.APPLY_TAX}</span>
              </label>

              {isTaxApplied ? (
                <div className="flex items-start gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    {isLoading ? (
                      <div className="rounded-2xl bg-slate-100 px-4 py-4 text-sm text-slate-500">
                        Memuat pajak...
                      </div>
                    ) : taxes.length === 0 ? (
                      <div className="rounded-2xl bg-slate-100 px-4 py-4 text-sm text-slate-500">
                        Belum ada pajak.
                      </div>
                    ) : (
                      taxes.map((tax: BillingPaymentTax) => (
                        <div
                          key={tax.id}
                          className="flex min-w-0 items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-900"
                        >
                          <span>
                            {tax.taxName} {tax.percentage}%
                          </span>
                          <button
                            type="button"
                            className="text-slate-500 transition hover:text-red-600"
                            onClick={() => handleDeleteTax(tax.id)}
                            disabled={isDeletingTax}
                            aria-label={`Hapus pajak ${tax.taxName}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      aria-label="Tambah pajak"
                      onClick={() => setActiveModal('tax')}
                      className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-dashed border-slate-300 text-slate-700"
                      disabled={disabled}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-950">
              {BILLING_LABELS.CREATE.PAYMENT_SUMMARY}
            </h3>

            <div className="mt-6 flex flex-col gap-5">
              <SummaryRow
                label={BILLING_LABELS.CREATE.BASE_VALUE}
                value={formatCurrencyIDR(summary?.baseAmount ?? 0)}
              />
              <SummaryRow
                label={BILLING_LABELS.CREATE.BILLING_TERM}
                value={`Termin ${summary?.termNumber ?? paymentDetail?.termNumber ?? '-'}`}
              />
              <SummaryRow
                label={taxSummaryLabel}
                value={formatCurrencyIDR(summary?.taxAmount ?? 0)}
              />
              <SummaryRow
                label={BILLING_LABELS.CREATE.TOTAL_BILLING}
                value={formatCurrencyIDR(summary?.totalAmount ?? 0)}
                strong
              />
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-end gap-3 xl:col-span-2">
          <Button type="button" variant="outline" onClick={handleBack}>
            {BILLING_LABELS.CREATE.CANCEL}
          </Button>
          <Button
            type="button"
            className="bg-teal-600 text-white hover:bg-teal-700"
            onClick={() => handleSave('draft')}
            disabled={disabled || isSavingPayment}
          >
            {BILLING_LABELS.CREATE.SAVE_DRAFT}
          </Button>
          <Button
            type="button"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => handleSave('invoiced')}
            disabled={disabled || isSavingPayment}
          >
            <Send className="mr-2 h-4 w-4" />
            {BILLING_LABELS.CREATE.FINAL_ACTION}
          </Button>
        </div>
      </div>

      <Dialog
        open={activeModal === 'account'}
        onOpenChange={(open) => setActiveModal(open ? 'account' : null)}
      >
        <DialogContent
          className="max-w-[640px] rounded-[24px] p-8 sm:max-w-[640px]"
          showCloseButton
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="text-[28px] font-semibold text-slate-950">
              {BILLING_LABELS.CREATE.MODALS.ADD_ACCOUNT_TITLE}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>{BILLING_LABELS.CREATE.MODALS.SELECT_BANK}</Label>
              <Input
                value={accountDraft.bank}
                onChange={(event) =>
                  setAccountDraft((prev) => ({ ...prev, bank: event.target.value }))
                }
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{BILLING_LABELS.CREATE.MODALS.ACCOUNT_NUMBER}</Label>
              <Input
                value={accountDraft.number}
                onChange={(event) =>
                  setAccountDraft((prev) => ({ ...prev, number: event.target.value }))
                }
                className="h-11 rounded-xl border-slate-200"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{BILLING_LABELS.CREATE.MODALS.ACCOUNT_HOLDER}</Label>
              <Input
                value={accountDraft.holder}
                onChange={(event) =>
                  setAccountDraft((prev) => ({ ...prev, holder: event.target.value }))
                }
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={handleAccountSave}
              disabled={isSavingBank}
            >
              {BILLING_LABELS.CREATE.MODALS.SAVE}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeModal === 'tax'}
        onOpenChange={(open) => setActiveModal(open ? 'tax' : null)}
      >
        <DialogContent
          className="max-w-[640px] rounded-[24px] p-8 sm:max-w-[640px]"
          showCloseButton
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="text-[28px] font-semibold text-slate-950">
              {BILLING_LABELS.CREATE.MODALS.ADD_TAX_TITLE}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>{BILLING_LABELS.CREATE.MODALS.SELECT_TAX}</Label>
              <AsyncSelect
                options={taxTypeOptions}
                value={taxDraft.taxTypeId || null}
                placeholder={BILLING_LABELS.CREATE.MODALS.SELECT_TAX}
                isSearchable={false}
                isLoading={isLoadingTaxTypes}
                onChange={(value) => {
                  const selectedValue = typeof value === 'string' ? value : '';
                  const selected = taxTypeOptions.find((item) => item.value === selectedValue);
                  setTaxDraft((prev) => ({
                    ...prev,
                    taxTypeId: selectedValue,
                    label: selected?.label || '',
                    percentage: selected != null ? String(selected.defaultRate ?? 0) : '',
                  }));
                }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{BILLING_LABELS.CREATE.MODALS.TAX_PERCENTAGE}</Label>
              <div className="relative">
                <Input
                  value={taxDraft.percentage}
                  readOnly
                  className="h-11 rounded-xl border-slate-200 pr-10"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-teal-600 text-white hover:bg-teal-700"
              onClick={handleTaxSave}
              disabled={isSavingTax || !taxDraft.taxTypeId}
            >
              {BILLING_LABELS.CREATE.MODALS.SAVE}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
