import { format } from 'date-fns';
import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker } from '@/shared/components/molecules/DatePicker/DatePicker';
import { Button, Label, Textarea } from '@/shared/components/ui';
import { BILLING_LABELS } from '../../constants';
import type { CreateBillingFormValues } from '../../schemas';
import type { Billing, BillingProjectDetail } from '../../types';
import { GeneralInformationCard, ProgressSummaryCard } from '../index';

function ProjectStatusBadge({ hasActiveBilling }: { hasActiveBilling: boolean }) {
  return (
    <span
      className={
        hasActiveBilling
          ? 'inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700'
          : 'inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white'
      }
    >
      {hasActiveBilling
        ? BILLING_LABELS.LIST.STATUS.HAS_BILLING
        : BILLING_LABELS.LIST.STATUS.NO_BILLING}
    </span>
  );
}

type Step1InfoProps = {
  projectDetail?: BillingProjectDetail;
  billingRecord?: Billing | null;
  handleNext: () => void;
  handleCancel: () => void;
};

function formatYmd(value: Date) {
  return format(value, 'yyyy-MM-dd');
}

export function Step1Info({
  projectDetail,
  billingRecord,
  handleNext,
  handleCancel,
}: Step1InfoProps) {
  const form = useFormContext<CreateBillingFormValues>();
  const hasActiveBilling = (projectDetail?.billing?.active?.length ?? 0) > 0;
  const billingNextCode = billingRecord?.code ?? projectDetail?.billing?.billingNextCode ?? '-';
  const nextTerm = billingRecord?.termNumber ?? projectDetail?.billing?.nextTerm;
  const billingTermLabel = nextTerm ? `Termin ${nextTerm}` : '-';

  return (
    <div className="mt-6 flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="w-full shrink-0 xl:w-[320px]">
        <GeneralInformationCard
          detail={projectDetail ?? {}}
          statusContent={
            projectDetail ? <ProjectStatusBadge hasActiveBilling={hasActiveBilling} /> : undefined
          }
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {projectDetail ? (
          <ProgressSummaryCard detail={projectDetail} />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            {BILLING_LABELS.CREATE.NO_PROJECT_SELECTED}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-950">
              {BILLING_LABELS.CREATE.BILLING_INFORMATION}
            </h3>
          </div>

          <div className="flex flex-col gap-6 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-500">
                  {BILLING_LABELS.CREATE.AUTO_GENERATED_BILLING_NUMBER}
                </p>
                <p className="text-base font-semibold text-slate-950">{billingNextCode}</p>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-500">
                  {BILLING_LABELS.CREATE.BILLING_TERM}
                </p>
                <p className="text-base font-semibold text-slate-950">{billingTermLabel}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="billedAt">
                  {BILLING_LABELS.CREATE.BILLED_AT} <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="billedAt"
                  control={form.control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(value) => {
                        if (value instanceof Date) {
                          field.onChange(formatYmd(value));
                        }
                      }}
                      className="h-11 w-full justify-start rounded-xl border-slate-200 text-left font-normal"
                      placeholder="Pilih tanggal"
                    />
                  )}
                />
                {form.formState.errors.billedAt && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.billedAt.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="dueDate">
                  {BILLING_LABELS.CREATE.DUE_DATE} <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="dueDate"
                  control={form.control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(value) => {
                        if (value instanceof Date) {
                          field.onChange(formatYmd(value));
                        }
                      }}
                      className="h-11 w-full justify-start rounded-xl border-slate-200 text-left font-normal"
                      placeholder="Pilih tanggal"
                    />
                  )}
                />
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.dueDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">{BILLING_LABELS.CREATE.NOTES}</Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder={BILLING_LABELS.CREATE.NOTES_PLACEHOLDER}
                {...form.register('notes')}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {BILLING_LABELS.CREATE.CANCEL}
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            {BILLING_LABELS.CREATE.SAVE_CONTINUE}
          </Button>
        </div>
      </div>
    </div>
  );
}
