'use client';

import { Loader2 } from 'lucide-react';
import { DetailDrawerTemplate } from '@/components/templates';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { RESOURCE_UNIT_LABELS } from '../constants';
import { useResourceUnit } from '../hooks/use-resource-unit';

interface ResourceUnitDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  id: string | null;
  companyId?: string | null;
}

export function ResourceUnitDetailDrawer({
  open,
  onClose,
  onEdit,
  id,
  companyId,
}: ResourceUnitDetailDrawerProps) {
  const { data: unit, isLoading } = useResourceUnit(id ?? '', companyId ?? undefined);
  const labels = RESOURCE_UNIT_LABELS.DETAIL;

  if (isLoading) {
    return (
      <DetailDrawerTemplate
        open={open}
        onClose={onClose}
        onEdit={onEdit}
        title={labels.PAGE_TITLE}
        editLabel={labels.BUTTONS.EDIT}
        closeLabel={labels.BUTTONS.CLOSE}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </DetailDrawerTemplate>
    );
  }

  if (!unit) {
    return null;
  }

  const statusVariant =
    unit.status === 'available'
      ? 'success'
      : unit.status === 'allocated'
        ? 'info'
        : unit.status === 'maintenance'
          ? 'warning'
          : 'secondary';

  return (
    <DetailDrawerTemplate
      open={open}
      onClose={onClose}
      onEdit={onEdit}
      title={labels.PAGE_TITLE}
      editLabel={labels.BUTTONS.EDIT}
      closeLabel={labels.BUTTONS.CLOSE}
    >
      <div className="flex flex-col gap-4">
        {/* Code */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.CODE}</Label>
          <p className="text-sm font-medium text-slate-950">{unit.code}</p>
        </div>

        {/* Item Catalog */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.ITEM_CATALOG}</Label>
          <p className="text-sm font-medium text-slate-950">{unit.itemCatalog?.name ?? '-'}</p>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.COMPANY}</Label>
          <p className="text-sm font-medium text-slate-950">{unit.company?.name ?? '-'}</p>
        </div>

        {/* Warehouse */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.WAREHOUSE}</Label>
          <p className="text-sm font-medium text-slate-950">{unit.warehouse?.name ?? '-'}</p>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.STATUS}</Label>
          <div>
            <Badge variant={statusVariant as any}>{unit.status}</Badge>
          </div>
        </div>

        {/* Acquisition Date */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {labels.FIELDS.ACQUISITION_DATE}
          </Label>
          <p className="text-sm font-medium text-slate-950">{unit.acquisitionDate ?? '-'}</p>
        </div>

        {/* Acquisition Cost */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {labels.FIELDS.ACQUISITION_COST}
          </Label>
          <p className="text-sm font-medium text-slate-950">
            {unit.acquisitionCost
              ? `Rp ${parseFloat(unit.acquisitionCost).toLocaleString('id-ID')}`
              : '-'}
          </p>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.NOTES}</Label>
          <p className="text-sm font-medium text-slate-950">{unit.notes || '-'}</p>
        </div>
      </div>
    </DetailDrawerTemplate>
  );
}
