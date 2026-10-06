'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Button } from '@/shared/components/atoms';
import { PageHeader } from '@/shared/components/molecules';
import { type FormFieldConfig, FormGenerator } from '@/shared/components/organisms/FormGenerator';
import { LeaveTypeSettingsSection } from '../components/LeaveTypeSettingsSection';
import { LEAVE_LABELS } from '../constants';
import { useLeaveSettings } from '../hooks/use-leave-settings';
import { useUpdateLeaveSettings } from '../hooks/use-update-leave-settings';
import { type LeaveSettingsFormValues, leaveSettingsSchema } from '../schemas';
import type { UpdateLeaveSettingsPayload } from '../types';

const FORM_ID = 'leave-settings-form';

export function LeaveSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const { data: settingsResponse, isLoading: settingsLoading } = useLeaveSettings(companyId);
  const { mutate: updateSettings, isPending: saving } = useUpdateLeaveSettings(companyId);

  const settings = settingsResponse?.success ? settingsResponse.data : null;

  const defaultValues: LeaveSettingsFormValues = {
    leaveTypes: settings?.leaveTypes ?? [],
  };

  const fields = useMemo<FormFieldConfig<LeaveSettingsFormValues>[]>(
    () => [
      {
        type: 'custom',
        content: <LeaveTypeSettingsSection />,
        colSpan: 12,
      },
    ],
    []
  );

  const handleSubmit = useCallback(
    (values: LeaveSettingsFormValues) => {
      const payload: UpdateLeaveSettingsPayload = {
        leaveTypes: values.leaveTypes,
      };

      updateSettings(payload, {
        onSuccess: () => {
          router.push(`/human-resource/leave${companyId ? `?companyId=${companyId}` : ''}`);
        },
      });
    },
    [companyId, router, updateSettings]
  );

  const handleBack = useCallback(() => {
    router.push(`/human-resource/leave${companyId ? `?companyId=${companyId}` : ''}`);
  }, [companyId, router]);

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 ">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <PageHeader title={LEAVE_LABELS.SETTINGS.TITLE} onBack={handleBack} />

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <FormGenerator<LeaveSettingsFormValues>
            id={FORM_ID}
            schema={leaveSettingsSchema}
            fields={fields}
            onSubmit={handleSubmit}
            defaultValues={defaultValues}
            className="gap-y-4"
            actions={
              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={handleBack}>
                  {LEAVE_LABELS.SETTINGS.CANCEL}
                </Button>
                <Button variant="default" type="submit" disabled={saving}>
                  {saving ? 'Menyimpan...' : LEAVE_LABELS.SETTINGS.SAVE}
                </Button>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
