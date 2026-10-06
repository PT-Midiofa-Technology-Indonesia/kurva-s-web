'use client';

import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { CollapsibleFormCard } from '@/components/molecules/CollapsibleFormCard';
import { Badge } from '@/components/ui/badge';
import { useCompaniesInfinite } from '@/domains/company';
import { useQueryParams } from '@/hooks/use-query-params';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { BaseQueryParams } from '@/types/query-params';
import { FeeRangeList } from '../components/FeeRangeList';
import { PROSPECT_FEE_LABELS } from '../constants';
import {
  useCreateProspectFeeSettingTier,
  useProspectFeeSetting,
  useUpdateProspectFeeSettingTier,
  useUpdateProspectFeeSettingTierStatus,
} from '../hooks';
import { getNextTierOrder } from '../services/mappers';
import type { FeeRange } from '../types';

const labels = PROSPECT_FEE_LABELS.SETTING_DETAIL;
const settingFeeLabels = PROSPECT_FEE_LABELS.SETTING_FEE_LIST;

interface ProspectFeeDetailUrlParams extends BaseQueryParams {
  companyId?: string;
}

export function ProspectFeeSettingDetailPage() {
  const params = useParams<{ id?: string }>();
  const resolvedId = params.id ?? '';
  const router = useRouter();
  const { queryParams } = useQueryParams<ProspectFeeDetailUrlParams>();
  const { options: companyOptions, isLoading: isLoadingCompanies } = useCompaniesInfinite();

  const companyId =
    typeof queryParams.companyId === 'string'
      ? queryParams.companyId
      : companyOptions[0]?.value?.toString();

  const { data, isLoading } = useProspectFeeSetting(resolvedId, companyId);
  const row = data?.data;
  const { mutateAsync: createTier, isPending: isCreatingTier } = useCreateProspectFeeSettingTier(
    resolvedId,
    companyId
  );
  const { mutateAsync: updateTier } = useUpdateProspectFeeSettingTier(resolvedId, companyId);
  const { mutate: updateTierStatus } = useUpdateProspectFeeSettingTierStatus(resolvedId, companyId);

  const pendingPatchesRef = useRef<Map<string, Partial<FeeRange>>>(new Map());
  const [pendingPatches, setPendingPatches] = useState<Record<string, Partial<FeeRange>>>({});

  const handleAddRange = useCallback(() => {
    if (!row || !companyId) return;

    createTier({
      order: getNextTierOrder(row.ranges),
      minValue: 0,
      maxValue: 0,
      feeType: 'Nominal',
      feeValue: 0,
      isActive: true,
    });
  }, [companyId, createTier, row]);

  const handleUpdateRange = useCallback(
    (rangeId: string, patch: Partial<FeeRange>) => {
      if (!row || !companyId) return;

      const currentRange = row.ranges.find((range) => range.id === rangeId);
      if (!currentRange) return;

      if (patch.status) {
        updateTierStatus({ tierId: rangeId, isActive: patch.status === 'active' });
        return;
      }

      const previousPatch = pendingPatchesRef.current.get(rangeId) ?? {};
      const mergedPatch = { ...previousPatch, ...patch };
      pendingPatchesRef.current.set(rangeId, mergedPatch);
      setPendingPatches((current) => ({ ...current, [rangeId]: mergedPatch }));

      const minValue = mergedPatch.min ?? currentRange.min;
      const maxValue = mergedPatch.max ?? currentRange.max;

      // A new tier starts with both values at zero. Wait for Max before sending
      // the full update because the API rejects this incomplete range.
      if (minValue > 0 && maxValue === 0) return;

      const update = updateTier({
        tierId: rangeId,
        order: currentRange.order,
        minValue,
        maxValue,
        feeType:
          (mergedPatch.type ?? currentRange.type) === 'percentage' ? 'Percentage' : 'Nominal',
        feeValue: mergedPatch.fee ?? currentRange.fee,
        isActive: currentRange.status === 'active',
      });

      void update
        .then(() => {
          if (pendingPatchesRef.current.get(rangeId) !== mergedPatch) return;
          pendingPatchesRef.current.delete(rangeId);
          setPendingPatches((current) => {
            const next = { ...current };
            delete next[rangeId];
            return next;
          });
        })
        .catch((error: unknown) => {
          toast.error({ title: getErrorMessage(error) });
        });
    },
    [companyId, row, updateTier, updateTierStatus]
  );

  const displayRanges = useMemo(
    () =>
      row?.ranges.map((range) => ({
        ...range,
        ...(pendingPatches[range.id] ?? {}),
      })) ?? [],
    [pendingPatches, row?.ranges]
  );

  const info = useMemo(() => {
    if (!row) return null;

    return {
      projectCapability: row.projectCapability,
      companyName: row.companyName,
      settingFeeCount: row.ranges.length > 0 ? String(row.ranges.length) : '-',
      feeSetting:
        row.ranges.length > 0
          ? settingFeeLabels.FEE_SETTING_BADGE.SET
          : settingFeeLabels.FEE_SETTING_BADGE.UNSET,
      isActive: row.status === 'active',
    };
  }, [row]);

  if (isLoading || (!companyId && isLoadingCompanies)) {
    return <div className="flex flex-col gap-4 p-6 text-sm text-slate-500">Memuat data...</div>;
  }

  if (!row || !info) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-sm text-slate-500">{labels.NOT_FOUND}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-slate-950">{labels.TITLE}</h1>
      </div>

      <CollapsibleFormCard title={labels.INFO_CARD_TITLE}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 px-6 py-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">{labels.LABELS.PROJECT_CAPABILITY}</p>
            <p className="text-sm font-medium text-slate-900">{info.projectCapability || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">{labels.LABELS.COMPANY}</p>
            <p className="text-sm font-medium text-slate-900">{info.companyName || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">{labels.LABELS.SETTING_FEE}</p>
            <p className="text-sm font-medium text-slate-900">{info.settingFeeCount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">{labels.LABELS.FEE_SETTING}</p>
            <Badge variant={row.ranges.length > 0 ? 'success' : 'destructive'}>
              {info.feeSetting}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">{labels.LABELS.STATUS}</p>
            <Badge variant={info.isActive ? 'success' : 'destructive'}>
              {info.isActive
                ? settingFeeLabels.STATUS_BADGE.ACTIVE
                : settingFeeLabels.STATUS_BADGE.INACTIVE}
            </Badge>
          </div>
        </div>
      </CollapsibleFormCard>

      <FeeRangeList
        ranges={displayRanges}
        isAdding={isCreatingTier}
        onAddRange={handleAddRange}
        onUpdateRange={handleUpdateRange}
      />
    </div>
  );
}
