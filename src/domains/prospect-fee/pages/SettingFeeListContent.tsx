'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useProjectCapabilitiesInfinite } from '@/domains/project-capability';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { SettingFeeList } from '../components/SettingFeeList';
import { PROSPECT_FEE_LABELS } from '../constants';
import {
  useCreateProspectFeeSetting,
  useProspectFeeSettings,
  useUpdateProspectFeeSettingStatus,
} from '../hooks';
import type { CompanyOption, SettingFeeRow } from '../types';

export interface SettingFeeListContentProps {
  companies: CompanyOption[];
  selectedCompanyId: string;
}

export function SettingFeeListContent({
  companies,
  selectedCompanyId,
}: SettingFeeListContentProps) {
  const router = useRouter();
  const { options: projectCapabilityOptions } = useProjectCapabilitiesInfinite({ perPage: 50 });
  const { data } = useProspectFeeSettings({
    companyId: selectedCompanyId || undefined,
    perPage: 100,
  });
  const { mutateAsync: createSettingFee, isPending: isCreatingSetting } =
    useCreateProspectFeeSetting(selectedCompanyId);
  const { mutate: updateSettingFeeStatus } = useUpdateProspectFeeSettingStatus(selectedCompanyId);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const settingFeeRows = data?.data ?? [];

  const handleAddRow = useCallback(() => {
    if (!selectedCompany || projectCapabilityOptions.length === 0) return;

    const usedIds = new Set(settingFeeRows.map((r) => r.projectCapabilityId));
    const nextCapability =
      projectCapabilityOptions.find((o) => !usedIds.has(o.value as string)) ??
      projectCapabilityOptions[0];

    createSettingFee({
      projectCapabilityId: nextCapability.value as string,
      isActive: true,
    }).catch((error: unknown) => {
      toast.error({ title: getErrorMessage(error) });
    });
  }, [createSettingFee, projectCapabilityOptions, selectedCompany, settingFeeRows]);

  const handleUpdateRow = useCallback(
    (id: string, patch: Partial<SettingFeeRow>) => {
      if (patch.status === 'active' || patch.status === 'inactive') {
        updateSettingFeeStatus({ settingId: id, isActive: patch.status === 'active' });
      }
    },
    [updateSettingFeeStatus]
  );

  const handleView = useCallback(
    (row: SettingFeeRow) =>
      router.push(`/prospectus/prospect-fee/${row.id}?companyId=${selectedCompanyId}`),
    [router, selectedCompanyId]
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-950">
          {PROSPECT_FEE_LABELS.SETTING_FEE_LIST.TITLE}
        </h1>
      </div>
      <SettingFeeList
        rows={settingFeeRows}
        isAdding={isCreatingSetting}
        onAddRow={handleAddRow}
        onUpdateRow={handleUpdateRow}
        onView={handleView}
      />
    </div>
  );
}
