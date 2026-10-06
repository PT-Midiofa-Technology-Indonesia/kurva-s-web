'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/shared/components/atoms';
import { PageHeader } from '@/shared/components/molecules';
import { type FormFieldConfig, FormGenerator } from '@/shared/components/organisms/FormGenerator';
import { OVERTIME_LABELS } from '../constants';
import { useOvertimeSettings } from '../hooks/use-overtime-settings';
import { useUpdateOvertimeSettings } from '../hooks/use-update-overtime-settings';
import { type OvertimeSettingsFormValues, overtimeSettingsSchema } from '../schemas';
import type { UpdateOvertimeSettingsPayload } from '../types';

const FORM_ID = 'overtime-settings-form';

export function OvertimeSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const { data: settingsData, isLoading: settingsLoading } = useOvertimeSettings(companyId);
  const { mutate: updateSettings, isPending: saving } = useUpdateOvertimeSettings(companyId);

  const defaultValues: OvertimeSettingsFormValues = {
    overtimeRatePerHour: settingsData?.data?.overtimeRatePerHour ?? 0,
    overtimeRoundingMethod: settingsData?.data?.overtimeRoundingMethod ?? '',
    overtimeRoundingThresholdMinutes:
      settingsData?.data?.overtimeRoundingThresholdMinutes ?? undefined,
  };

  const handleSubmit = useCallback(
    (values: OvertimeSettingsFormValues) => {
      const payload: UpdateOvertimeSettingsPayload = {
        overtimeRatePerHour: values.overtimeRatePerHour,
        overtimeRoundingMethod: values.overtimeRoundingMethod,
      };
      if (
        values.overtimeRoundingMethod === 'threshold' &&
        values.overtimeRoundingThresholdMinutes != null
      ) {
        payload.overtimeRoundingThresholdMinutes = values.overtimeRoundingThresholdMinutes;
      }
      updateSettings(payload, {
        onSuccess: () => {
          router.push('/human-resource/overtime');
        },
      });
    },
    [updateSettings, router]
  );

  const fields: FormFieldConfig<OvertimeSettingsFormValues>[] = [
    {
      name: 'overtimeRatePerHour',
      type: 'input-currency',
      label: OVERTIME_LABELS.SETTINGS.RATE_PER_HOUR,
      required: true,
      placeholder: 'Rp 0',
      colSpan: { base: 12, md: 6 },
    },
    {
      name: 'overtimeRoundingMethod',
      type: 'select',
      label: OVERTIME_LABELS.SETTINGS.ROUNDING_METHOD,
      required: true,
      options: [
        { value: 'floor', label: 'Floor (Selalu ke bawah)' },
        { value: 'ceil', label: 'Ceil (Selalu ke atas)' },
        { value: 'threshold', label: 'Threshold (Berdasarkan ambang batas)' },
      ],
      placeholder: 'Pilih metode pembulatan',
      colSpan: { base: 12, md: 6 },
    },
    {
      name: 'overtimeRoundingThresholdMinutes',
      type: 'number',
      label: OVERTIME_LABELS.SETTINGS.THRESHOLD_MINUTES,
      hint: OVERTIME_LABELS.SETTINGS.THRESHOLD_HINT,
      placeholder: '65 menit',
      colSpan: { base: 12, md: 6 },
      enableRules: [
        {
          conditions: [{ field: 'overtimeRoundingMethod', value: 'threshold' }],
        },
      ],
    },
  ];

  const handleBack = useCallback(() => {
    router.push('/human-resource/overtime');
  }, [router]);

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <PageHeader title={`${OVERTIME_LABELS.SETTINGS.TITLE}`} onBack={handleBack} />

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <FormGenerator<OvertimeSettingsFormValues>
          id={FORM_ID}
          schema={overtimeSettingsSchema}
          fields={fields}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          actions={
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push('/human-resource/overtime')}
              >
                {OVERTIME_LABELS.SETTINGS.CANCEL}
              </Button>
              <Button variant="default" type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : OVERTIME_LABELS.SETTINGS.SAVE}
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
