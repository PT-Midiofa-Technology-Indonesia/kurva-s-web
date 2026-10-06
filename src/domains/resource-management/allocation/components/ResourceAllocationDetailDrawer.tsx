'use client';

import { Loader2 } from 'lucide-react';
import { DetailDrawerTemplate } from '@/components/templates';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { RESOURCE_ALLOCATION_LABELS } from '../constants';
import { useResourceAllocation } from '../hooks/use-resource-allocation';

interface ResourceAllocationDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  id: string | null;
  projectId: string;
}

export function ResourceAllocationDetailDrawer({
  open,
  onClose,
  onEdit,
  id,
  projectId,
}: ResourceAllocationDetailDrawerProps) {
  const { data: allocation, isLoading } = useResourceAllocation(id ?? '', projectId);
  const labels = RESOURCE_ALLOCATION_LABELS.DETAIL;

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

  if (!allocation) {
    return null;
  }

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
          <p className="text-sm font-medium text-slate-950">{allocation.code}</p>
        </div>

        {/* Project */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.PROJECT}</Label>
          <p className="text-sm font-medium text-slate-950">{allocation.project?.name ?? '-'}</p>
        </div>

        {/* Company */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.COMPANY}</Label>
          <p className="text-sm font-medium text-slate-950">{allocation.company?.name ?? '-'}</p>
        </div>

        {/* Type */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.TYPE}</Label>
          <p className="text-sm font-medium text-slate-950">{allocation.allocationType ?? '-'}</p>
        </div>

        {/* Resource Unit / Item Catalog */}
        {allocation.allocationType === 'unit' ? (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">
              {labels.FIELDS.RESOURCE_UNIT}
            </Label>
            <p className="text-sm font-medium text-slate-950">
              {allocation.resourceUnit
                ? `${allocation.resourceUnit.code} - ${allocation.resourceUnit.itemCatalog?.name}`
                : '-'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">
              {labels.FIELDS.ITEM_CATALOG}
            </Label>
            <p className="text-sm font-medium text-slate-950">
              {allocation.itemCatalog?.name ?? '-'}
            </p>
          </div>
        )}

        {/* Warehouse */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.WAREHOUSE}</Label>
          <p className="text-sm font-medium text-slate-950">
            {allocation.sourceWarehouse?.name ?? '-'}
          </p>
        </div>

        {/* Quantity (if applicable) */}
        {allocation.allocationType === 'quantity' && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.QUANTITY}</Label>
            <p className="text-sm font-medium text-slate-950">{allocation.quantity ?? '-'}</p>
          </div>
        )}

        {/* Allocation Date Range */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">
            {labels.FIELDS.ALLOCATION_FROM_DATE} - {labels.FIELDS.ALLOCATION_TO_DATE}
          </Label>
          <p className="text-sm font-medium text-slate-950">
            {allocation.allocatedFromDate} s/d {allocation.allocatedToDate}
          </p>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.STATUS}</Label>
          <div>
            <Badge variant={allocation.status === 'allocated' ? 'default' : 'success'}>
              {allocation.status}
            </Badge>
          </div>
        </div>

        {/* Allocated By */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.ALLOCATED_BY}</Label>
          <p className="text-sm font-medium text-slate-950">
            {allocation.allocatedBy?.name ?? '-'}
          </p>
        </div>

        {/* Returned At (if exists) */}
        {allocation.returnedAt && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">
              {labels.FIELDS.RETURNED_AT}
            </Label>
            <p className="text-sm font-medium text-slate-950">{allocation.returnedAt}</p>
          </div>
        )}

        {/* Returned By (if exists) */}
        {allocation.returnedBy && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-normal text-slate-500">
              {labels.FIELDS.RETURNED_BY}
            </Label>
            <p className="text-sm font-medium text-slate-950">{allocation.returnedBy.name}</p>
          </div>
        )}

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-normal text-slate-500">{labels.FIELDS.NOTES}</Label>
          <p className="text-sm font-medium text-slate-950">{allocation.notes || '-'}</p>
        </div>
      </div>
    </DetailDrawerTemplate>
  );
}
