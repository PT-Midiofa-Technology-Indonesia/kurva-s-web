'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import type { ItemCatalogListItem } from '@/domains/item-master';
import { useItemCatalogsInfinite } from '@/domains/item-master';
import { getErrorMessage, getFieldErrors } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { createVendorItemCatalog } from '../api/create-vendor-item-catalog';
import { deleteVendorItemCatalog } from '../api/delete-vendor-item-catalog';
import { updateVendorItemCatalog } from '../api/update-vendor-item-catalog';
import { VENDOR_CATALOG_LABELS } from '../constants';
import { vendorItemCatalogSchema } from '../schemas';
import type { VendorItemCatalog, VendorItemCatalogDraftRow } from '../types';
import { useVendorItemCatalogsInfinite } from './use-vendor-item-catalogs';

function buildErrorToast(error: unknown): string {
  const message = getErrorMessage(error);
  const fieldErrors = getFieldErrors(error);
  if (!fieldErrors) return message;
  const details = Object.values(fieldErrors).flat().join(', ');
  return details ? `${message} ${details}` : message;
}

const DRAFT_ID_PREFIX = '__draft_';

import { VENDOR_ITEM_CATALOG_QUERY_KEYS } from './use-vendor-item-catalogs';

let draftCounter = 0;
const nextDraftId = () => `${DRAFT_ID_PREFIX}${++draftCounter}_${Date.now()}`;

function serverToDraft(item: VendorItemCatalog): VendorItemCatalogDraftRow {
  return {
    __draftId: item.id,
    id: item.id,
    itemCatalogId: item.itemCatalogId,
    price: typeof item.price === 'string' ? Number(item.price) : item.price,
    isActive: item.isActive,
    code: item.itemCatalog?.code ?? '',
    name: item.itemCatalog?.name ?? '',
    uomName: item.itemCatalog?.uom?.name ?? null,
    isNew: false,
    isDirty: false,
    isDeleted: false,
  };
}

function emptyDraftRow(): VendorItemCatalogDraftRow {
  return {
    __draftId: nextDraftId(),
    itemCatalogId: null,
    price: null,
    isActive: true,
    code: '',
    name: '',
    uomName: null,
    isNew: true,
    isDirty: false,
    isDeleted: false,
  };
}

export interface UseVendorItemCatalogPageOptions {
  vendorId: string;
}

export interface UseVendorItemCatalogPageReturn {
  rows: VendorItemCatalogDraftRow[];
  isLoading: boolean;
  isError: boolean;
  isDirty: boolean;
  isSaving: boolean;
  hasMore: boolean;
  isFetchingMore: boolean;
  loadMore: () => void;
  itemCatalogOptions: Array<{ value: string; label: string }>;
  itemCatalogHasMore: boolean;
  loadMoreItemCatalogs: () => void;
  setItemCatalogSearch: (search: string) => void;
  hasInvalidRows: boolean;
  addRow: () => void;
  handleCellEdit: (rowIndex: number, columnId: string, value: unknown) => void;
  handleDeleteRow: (row: VendorItemCatalogDraftRow) => void;
  handleRestoreRow: (row: VendorItemCatalogDraftRow) => void;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
  refetch: () => void;
}

export function useVendorItemCatalogPage(
  options: UseVendorItemCatalogPageOptions
): UseVendorItemCatalogPageReturn {
  const { vendorId } = options;

  const { data, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useVendorItemCatalogsInfinite({ vendorId, sortBy: 'createdAt', sortOrder: 'desc' });

  const [itemCatalogSearch, setItemCatalogSearch] = useState('');

  const {
    items: itemCatalogItems,
    options: itemCatalogOptions,
    hasMore: itemCatalogHasMore,
    loadMore: loadMoreItemCatalogsFn,
  } = useItemCatalogsInfinite({ isActive: true, search: itemCatalogSearch });

  const loadMoreItemCatalogs = useCallback(() => {
    loadMoreItemCatalogsFn();
  }, [loadMoreItemCatalogsFn]);

  const itemCatalogById = useMemo(() => {
    const map = new Map<string, ItemCatalogListItem>();
    for (const item of itemCatalogItems) {
      map.set(item.id, item);
    }
    return map;
  }, [itemCatalogItems]);

  // Local draft state
  const [newRows, setNewRows] = useState<VendorItemCatalogDraftRow[]>([]);
  const [dirtyMap, setDirtyMap] = useState<Map<string, VendorItemCatalogDraftRow>>(new Map());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const serverRows = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data.map(serverToDraft));
  }, [data?.pages]);

  const rows = useMemo<VendorItemCatalogDraftRow[]>(() => {
    const liveServer = serverRows
      .filter((r) => !deletedIds.has(r.id ?? ''))
      .map((r) => dirtyMap.get(r.id ?? '') ?? r);
    return [...liveServer, ...newRows.filter((r) => !r.isDeleted)];
  }, [serverRows, deletedIds, dirtyMap, newRows]);

  const isDirty = newRows.length > 0 || dirtyMap.size > 0 || deletedIds.size > 0;

  // ── Validation ─────────────────────────────────────────────────────────────
  const validatedRowIds = useMemo(() => {
    const ids = new Set<string>();
    for (const row of rows) {
      const result = vendorItemCatalogSchema.safeParse({
        itemCatalogId: row.itemCatalogId ?? '',
        price: row.price ?? 0,
        isActive: row.isActive,
      });
      if (result.success) ids.add(row.__draftId);
    }
    return ids;
  }, [rows]);

  const hasInvalidRows = rows.some((r) => !validatedRowIds.has(r.__draftId));

  // ── Mutations (silenced global toasts; we report a single summary at the end) ─
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createVendorItemCatalog,
  });
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateVendorItemCatalog>[1];
    }) => updateVendorItemCatalog(id, payload),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteVendorItemCatalog,
  });

  const isSaving = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const addRow = useCallback(() => {
    setNewRows((prev) => [...prev, emptyDraftRow()]);
  }, []);

  const applyRowEdit = useCallback((next: VendorItemCatalogDraftRow) => {
    if (next.isNew) {
      setNewRows((prev) => prev.map((r) => (r.__draftId === next.__draftId ? next : r)));
      return;
    }
    if (!next.id) return;
    setDirtyMap((prev) => {
      const updated = new Map(prev);
      updated.set(next.id!, next);
      return updated;
    });
  }, []);

  const handleCellEdit = useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      // The DataTable passes the visible row index. Map it to the current `rows` array.
      const target = rows[rowIndex];
      if (!target) return;

      if (columnId === 'itemCatalogId') {
        const itemCatalogId = typeof value === 'string' && value.length > 0 ? value : null;
        const master = itemCatalogId ? itemCatalogById.get(itemCatalogId) : undefined;

        applyRowEdit({
          ...target,
          itemCatalogId,
          code: master?.code ?? '',
          name: master?.name ?? '',
          uomName: master?.uom?.name ?? null,
        });
        return;
      }

      if (columnId === 'price') {
        const numeric =
          typeof value === 'number'
            ? value
            : value === '' || value === null || value === undefined
              ? null
              : Number(value);
        const safePrice = Number.isFinite(numeric) ? (numeric as number) : null;
        applyRowEdit({ ...target, price: safePrice });
        return;
      }

      if (columnId === 'isActive') {
        const next = value === true || value === 'true';
        applyRowEdit({ ...target, isActive: next });
        return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, itemCatalogById, applyRowEdit]
  );

  const handleDeleteRow = useCallback((row: VendorItemCatalogDraftRow) => {
    if (row.isNew) {
      setNewRows((prev) => prev.filter((r) => r.__draftId !== row.__draftId));
      return;
    }
    if (!row.id) return;
    setDeletedIds((prev) => {
      const updated = new Set(prev);
      updated.add(row.id!);
      return updated;
    });
    setDirtyMap((prev) => {
      if (!prev.has(row.id!)) return prev;
      const updated = new Map(prev);
      updated.delete(row.id!);
      return updated;
    });
  }, []);

  const handleRestoreRow = useCallback((row: VendorItemCatalogDraftRow) => {
    if (!row.id) return;
    setDeletedIds((prev) => {
      if (!prev.has(row.id!)) return prev;
      const updated = new Set(prev);
      updated.delete(row.id!);
      return updated;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!isDirty) return;

    const tasks: Array<Promise<unknown>> = [];

    for (const newRow of newRows) {
      tasks.push(
        createMutation
          .mutateAsync({
            vendorId,
            itemCatalogId: newRow.itemCatalogId ?? '',
            price: newRow.price ?? 0,
            isActive: newRow.isActive,
          })
          .catch((error) => {
            toast.error({ title: buildErrorToast(error) });
            throw error;
          })
      );
    }

    for (const dirtyRow of dirtyMap.values()) {
      if (!dirtyRow.id) continue;
      tasks.push(
        updateMutation
          .mutateAsync({
            id: dirtyRow.id,
            payload: {
              itemCatalogId: dirtyRow.itemCatalogId ?? undefined,
              price: dirtyRow.price ?? undefined,
              isActive: dirtyRow.isActive,
            },
          })
          .catch((error) => {
            toast.error({ title: buildErrorToast(error) });
            throw error;
          })
      );
    }

    for (const id of deletedIds) {
      tasks.push(
        deleteMutation.mutateAsync(id).catch((error) => {
          toast.error({ title: buildErrorToast(error) });
          throw error;
        })
      );
    }

    if (tasks.length === 0) {
      setNewRows([]);
      setDirtyMap(new Map());
      setDeletedIds(new Set());
      return;
    }

    const results = await Promise.allSettled(tasks);
    const rejected = results.filter((r) => r.status === 'rejected');
    const fulfilled = results.filter((r) => r.status === 'fulfilled');

    if (rejected.length > 0 && fulfilled.length > 0) {
      toast.error({ title: VENDOR_CATALOG_LABELS.ITEM_CATALOG.MESSAGES.SAVE_ERROR });
    } else if (rejected.length === 0 && fulfilled.length > 0) {
      toast.success({ title: 'Perubahan berhasil disimpan' });
    }

    // Reconcile server state (refetch + clear local state on full success)
    await queryClient.invalidateQueries({ queryKey: VENDOR_ITEM_CATALOG_QUERY_KEYS.all });
    await queryClient.invalidateQueries({ queryKey: VENDOR_ITEM_CATALOG_QUERY_KEYS.infinite() });
    if (rejected.length === 0) {
      setNewRows([]);
      setDirtyMap(new Map());
      setDeletedIds(new Set());
    }
    await refetch();
  }, [
    isDirty,
    newRows,
    dirtyMap,
    deletedIds,
    vendorId,
    createMutation,
    updateMutation,
    deleteMutation,
    queryClient,
    refetch,
  ]);

  const handleCancel = useCallback(() => {
    setNewRows([]);
    setDirtyMap(new Map());
    setDeletedIds(new Set());
  }, []);

  return {
    rows,
    isLoading,
    isError,
    isDirty,
    isSaving,
    hasMore: hasNextPage ?? false,
    isFetchingMore: isFetchingNextPage,
    loadMore,
    itemCatalogOptions,
    itemCatalogHasMore,
    loadMoreItemCatalogs,
    setItemCatalogSearch,
    hasInvalidRows,
    addRow,
    handleCellEdit,
    handleDeleteRow,
    handleRestoreRow,
    handleSave,
    handleCancel,
    refetch,
  };
}
