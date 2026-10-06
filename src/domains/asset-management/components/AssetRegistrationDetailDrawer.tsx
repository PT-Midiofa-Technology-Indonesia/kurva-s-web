'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/atoms';
import { DetailDrawerTemplate } from '@/components/templates';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/shared/components/ui/textarea';
import { COMMON_LABELS } from '@/shared/constants';
import {
  formatCurrencyIDR,
  formatDateLong,
  formatDateTimeLong,
  formatNumber,
} from '@/shared/utils/format';
import { ASSET_CATALOG_LABELS, ASSET_REGISTRATION_STATUS_META } from '../constants';
import { useAssetRegistration } from '../hooks/use-asset-registration';
import { useUpdateAssetRegistrationNotes } from '../hooks/use-update-asset-registration-notes';

interface AssetRegistrationDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  id: string | null;
  companyId: string | null;
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export function AssetRegistrationDetailDrawer({
  open,
  onClose,
  id,
  companyId,
}: AssetRegistrationDetailDrawerProps) {
  const { data: response, isLoading } = useAssetRegistration(id, companyId);
  const assetRegistration = response?.data ?? null;
  const labels = ASSET_CATALOG_LABELS.DETAIL;
  const [notes, setNotes] = useState('');
  const initialNotesRef = useRef<string | null>(null);

  const { mutate: updateNotes, isPending: isSavingNotes } = useUpdateAssetRegistrationNotes(
    id ?? '',
    companyId
  );

  useEffect(() => {
    if (open && !isLoading && assetRegistration && initialNotesRef.current === null) {
      const initialNotes = assetRegistration.registration.notes ?? '';
      initialNotesRef.current = initialNotes;
      setNotes(initialNotes);
    }
    if (!open) {
      initialNotesRef.current = null;
    }
  }, [open, isLoading, assetRegistration]);

  const unitWarehouseLabel = useMemo(() => {
    if (!assetRegistration?.unit) return '-';
    if (assetRegistration.unit.inProject) {
      return 'In Project';
    }
    return assetRegistration.unit.warehouse?.name ?? '-';
  }, [assetRegistration?.unit]);

  const notesDirty = notes !== (assetRegistration?.registration.notes ?? '');

  if (isLoading) {
    return (
      <DetailDrawerTemplate
        open={open}
        onClose={onClose}
        title={labels.TITLE}
        closeLabel={labels.BUTTONS.CLOSE}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </DetailDrawerTemplate>
    );
  }

  const handleSaveNotes = () => {
    if (!id || !companyId || !assetRegistration) return;

    updateNotes(
      { companyId, payload: { notes: notes || null } },
      {
        onSuccess: (result) => {
          initialNotesRef.current = result.registration.notes ?? '';
          setNotes(result.registration.notes ?? '');
        },
      }
    );
  };

  const schedule = assetRegistration?.depreciation.schedule ?? [];

  return (
    <DetailDrawerTemplate
      open={open}
      onClose={onClose}
      title={labels.TITLE}
      closeLabel={labels.BUTTONS.CLOSE}
      customFooter={
        <Button
          type="button"
          className="w-full"
          disabled={!notesDirty || isSavingNotes || !companyId}
          onClick={handleSaveNotes}
        >
          {isSavingNotes ? COMMON_LABELS.STATE.SAVING : labels.BUTTONS.SAVE_NOTES}
        </Button>
      }
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-normal text-slate-500">{labels.FIELDS.UNIT_CODE}</p>
        <p className="text-sm font-medium text-slate-950">
          {assetRegistration?.unit.unitCode ?? '-'}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-normal text-slate-500">{labels.FIELDS.ITEM_NAME}</p>
        <p className="text-sm font-medium text-slate-950">
          {assetRegistration?.unit.itemName ?? '-'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-normal text-slate-500">{labels.FIELDS.SERIAL_NUMBER}</p>
          <p className="text-sm font-medium text-slate-950">
            {assetRegistration?.unit.serialNumber ?? '-'}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-normal text-slate-500">{labels.FIELDS.WAREHOUSE}</p>
          <p className="text-sm font-medium text-slate-950">{unitWarehouseLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-normal text-slate-500">{labels.FIELDS.CATEGORY}</p>
          <p className="text-sm font-medium text-slate-950">
            {assetRegistration?.registration.category.name ?? '-'}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-normal text-slate-500">{labels.FIELDS.STATUS}</p>
          <Badge
            variant={
              ASSET_REGISTRATION_STATUS_META[assetRegistration?.status ?? 'active']?.variant ??
              'secondary'
            }
          >
            {ASSET_REGISTRATION_STATUS_META[assetRegistration?.status ?? 'active']?.label ??
              assetRegistration?.status ??
              '-'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-normal text-slate-500">{labels.FIELDS.ACQUISITION_DATE}</p>
          <p className="text-sm font-medium text-slate-950">
            {assetRegistration?.unit.acquisitionDate
              ? formatDateLong(assetRegistration.unit.acquisitionDate)
              : '-'}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-normal text-slate-500">{labels.FIELDS.ACQUISITION_COST}</p>
          <p className="text-sm font-medium text-slate-950">
            {assetRegistration?.unit.acquisitionCost
              ? formatCurrencyIDR(Number(assetRegistration.unit.acquisitionCost))
              : '-'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-normal text-slate-500">
            {labels.FIELDS.DEPRECIATION_START_DATE}
          </p>
          <p className="text-sm font-medium text-slate-950">
            {assetRegistration?.registration.depreciationStartDate
              ? formatDateLong(assetRegistration.registration.depreciationStartDate)
              : '-'}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-normal text-slate-500">{labels.FIELDS.SALVAGE_VALUE}</p>
          <p className="text-sm font-medium text-slate-950">
            {assetRegistration?.registration.salvageValue
              ? formatCurrencyIDR(Number(assetRegistration.registration.salvageValue))
              : '-'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-normal text-slate-500">
            {labels.FIELDS.BOOK_VALUE_AT_REGISTER}
          </p>
          <p className="text-sm font-medium text-slate-950">
            {assetRegistration?.registration.bookValueAtRegister !== null &&
            assetRegistration?.registration.bookValueAtRegister !== undefined
              ? formatCurrencyIDR(assetRegistration.registration.bookValueAtRegister)
              : '-'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-normal text-slate-500">{labels.FIELDS.REGISTERED_BY}</p>
          <p className="text-sm font-medium text-slate-950">
            {assetRegistration?.registration.registeredBy ?? '-'}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-normal text-slate-500">{labels.FIELDS.REGISTERED_AT}</p>
          <p className="text-sm font-medium text-slate-950">
            {assetRegistration?.registration.registeredAt
              ? formatDateTimeLong(assetRegistration.registration.registeredAt)
              : '-'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryTile
          label={labels.KPIS.BOOK_VALUE}
          value={formatCurrencyIDR(assetRegistration?.depreciation.summary.bookValue) ?? '-'}
        />
        <SummaryTile
          label={labels.KPIS.ACCUMULATED_DEPRECIATION}
          value={
            formatCurrencyIDR(assetRegistration?.depreciation.summary.accumulatedDepreciation) ??
            '-'
          }
        />
        <SummaryTile
          label={labels.KPIS.MONTHS_ELAPSED}
          value={
            assetRegistration
              ? `${formatNumber(assetRegistration.depreciation.summary.monthsElapsed)} bulan`
              : '-'
          }
        />
        <SummaryTile
          label={labels.KPIS.REMAINING_MONTHS}
          value={
            assetRegistration
              ? `${formatNumber(assetRegistration.depreciation.summary.remainingMonths)} bulan`
              : '-'
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-normal text-slate-500">{labels.FIELDS.NOTES}</p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Masukkan catatan asset"
          rows={4}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-950">{labels.SCHEDULE.TITLE}</p>
            <p className="text-xs text-slate-500">
              {assetRegistration?.registration.category.depreciationMethod ?? '-'}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left font-medium">{labels.SCHEDULE.COLUMNS.YEAR}</th>
                <th className="px-3 py-2 text-right font-medium">
                  {labels.SCHEDULE.COLUMNS.BEGINNING}
                </th>
                <th className="px-3 py-2 text-right font-medium">
                  {labels.SCHEDULE.COLUMNS.EXPENSE}
                </th>
                <th className="px-3 py-2 text-right font-medium">
                  {labels.SCHEDULE.COLUMNS.ENDING}
                </th>
                <th className="px-3 py-2 text-right font-medium">
                  {labels.SCHEDULE.COLUMNS.ACCUMULATED}
                </th>
              </tr>
            </thead>
            <tbody>
              {schedule.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                    Belum ada schedule depresiasi.
                  </td>
                </tr>
              ) : (
                schedule.map((row) => (
                  <tr
                    key={`${row.year}-${row.isCurrentYear ? 'current' : 'past'}`}
                    className={row.isCurrentYear ? 'bg-amber-50/70' : 'bg-white'}
                  >
                    <td className="px-3 py-2 font-medium text-slate-950">{row.year}</td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrencyIDR(row.beginningBookValue)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrencyIDR(row.depreciationExpense)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {formatCurrencyIDR(row.endingBookValue)}
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrencyIDR(row.accumulated)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DetailDrawerTemplate>
  );
}
