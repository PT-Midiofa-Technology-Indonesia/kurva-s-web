'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWarehousesInfinite } from '@/domains/warehouse';
import { Button } from '@/shared/components/atoms';
import { AsyncSelect } from '@/shared/components/atoms/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { useCompanyId } from '../hooks/use-company-id';

interface WarehousePickerModalProps {
  open: boolean;
  onClose: () => void;
  initialWarehouseId?: string | null;
  initialWarehouseName?: string | null;
  initialWarehouseAddress?: string | null;
  onSave: (warehouseId: string, warehouseName: string, warehouseAddress: string) => void;
}

export function WarehousePickerModal({
  open,
  onClose,
  initialWarehouseId,
  initialWarehouseName,
  initialWarehouseAddress,
  onSave,
}: WarehousePickerModalProps) {
  const companyId = useCompanyId();
  const [selectedId, setSelectedId] = useState<string | null>(initialWarehouseId ?? null);

  const {
    options: warehouseOptions,
    warehouses,
    isLoading: warehousesLoading,
    hasMore: warehousesHasMore,
    loadMore: warehousesLoadMore,
  } = useWarehousesInfinite({ perPage: 20, companyId, enabled: open });

  useEffect(() => {
    if (open) setSelectedId(initialWarehouseId ?? null);
  }, [open, initialWarehouseId]);

  const options = useMemo(() => {
    if (!initialWarehouseId || !initialWarehouseName) return warehouseOptions;
    if (warehouseOptions.some((o) => o.value === initialWarehouseId)) return warehouseOptions;
    return [{ value: initialWarehouseId, label: initialWarehouseName }, ...warehouseOptions];
  }, [warehouseOptions, initialWarehouseId, initialWarehouseName]);

  const handleSave = useCallback(() => {
    if (!selectedId) return;
    const found = warehouses.find((w) => w.id === selectedId);
    if (found) {
      onSave(selectedId, found.name, found.addressDetail ?? '');
    } else if (selectedId === initialWarehouseId && initialWarehouseName) {
      onSave(selectedId, initialWarehouseName, initialWarehouseAddress ?? '');
    }
    onClose();
  }, [
    selectedId,
    warehouses,
    initialWarehouseId,
    initialWarehouseName,
    initialWarehouseAddress,
    onSave,
    onClose,
  ]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Pilih Warehouse</DialogTitle>
          <p className="text-sm text-slate-500">Pilih warehouse yang ingin anda gunakan</p>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <label className="text-sm font-medium text-slate-700">Warehouse</label>
          <AsyncSelect
            value={selectedId}
            options={options}
            onChange={(v) => setSelectedId(v as string)}
            placeholder="Pilih warehouse"
            isSearchable
            isLoading={warehousesLoading}
            onScrollToBottom={warehousesHasMore ? () => warehousesLoadMore() : undefined}
          />
        </div>

        <div className="flex gap-3 pt-2 border-t">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Batal
          </Button>
          <Button type="button" className="flex-1" disabled={!selectedId} onClick={handleSave}>
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
