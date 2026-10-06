'use client';

import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AsyncSelect, Button, type SelectValue } from '@/shared/components/atoms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { PROJECT_LIST_PAGE_LABELS } from '../constants';
import { useSetProjectWarehouse } from '../hooks/use-set-project-warehouse';
import { useWarehouseInfinite } from '../hooks/use-warehouse-infinite';

interface SelectWarehouseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  defaultWarehouse?: { id: string; code: string; name: string } | null;
  companyId?: string;
  readonly?: boolean;
}

export function SelectWarehouseModal({
  open,
  onOpenChange,
  projectId,
  defaultWarehouse,
  companyId,
  readonly = false,
}: SelectWarehouseModalProps) {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(
    defaultWarehouse?.id ?? null
  );

  useEffect(() => {
    setSelectedWarehouseId(defaultWarehouse?.id ?? null);
  }, [defaultWarehouse]);

  const {
    options: warehouseOptions,
    isLoading: warehousesLoading,
    hasMore: warehousesHasMore,
    loadMore: warehousesLoadMore,
  } = useWarehouseInfinite({ perPage: 20, companyId });

  const mutation = useSetProjectWarehouse();

  const handleSave = () => {
    if (!selectedWarehouseId) return;
    mutation.mutate(
      { projectId, payload: { warehouseId: selectedWarehouseId } },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedWarehouseId(null);
        },
      }
    );
  };

  return (
    <Dialog key={projectId} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {PROJECT_LIST_PAGE_LABELS.WAREHOUSE_MODAL?.TITLE ?? 'Pilih Warehouse'}
          </DialogTitle>
          <DialogDescription>
            {PROJECT_LIST_PAGE_LABELS.WAREHOUSE_MODAL?.DESCRIPTION ??
              'Pilih warehouse yang ingin anda gunakan'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {readonly && (
            <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
              <AlertCircle className="h-4 w-4" />
              <span>{PROJECT_LIST_PAGE_LABELS.WAREHOUSE_MODAL.INFO_READONLY}</span>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-900">Warehouse</label>
            <AsyncSelect
              options={warehouseOptions}
              value={selectedWarehouseId}
              placeholder="Pilih warehouse"
              isLoading={warehousesLoading}
              isSearchable
              isClearable
              onChange={(value: SelectValue) => {
                if (readonly) return;
                const id = Array.isArray(value) ? value[0] : value;
                setSelectedWarehouseId(typeof id === 'string' ? id : null);
              }}
              onScrollToBottom={warehousesHasMore ? () => warehousesLoadMore() : undefined}
              isDisabled={readonly}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Batal
          </Button>
          {!readonly && (
            <Button
              onClick={handleSave}
              disabled={!selectedWarehouseId || mutation.isPending}
              className="flex-1"
            >
              {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
