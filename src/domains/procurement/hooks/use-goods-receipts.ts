'use client';

import { useQuery } from '@tanstack/react-query';
import { getGoodsReceiptDetail } from '../api/get-goods-receipt-detail';
import type { GetGoodsReceiptsParams } from '../api/get-goods-receipts';
import { getGoodsReceipts } from '../api/get-goods-receipts';

export const GOODS_RECEIPT_QUERY_KEYS = {
  all: ['procurement', 'goods-receipts'] as const,
  lists: () => [...GOODS_RECEIPT_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...GOODS_RECEIPT_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...GOODS_RECEIPT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...GOODS_RECEIPT_QUERY_KEYS.details(), id] as const,
  selectableDos: () => [...GOODS_RECEIPT_QUERY_KEYS.all, 'selectable-dos'] as const,
  selectableDo: (doId: string) => [...GOODS_RECEIPT_QUERY_KEYS.all, 'selectable-do', doId] as const,
};

export function useGoodsReceipts(params?: GetGoodsReceiptsParams) {
  return useQuery({
    queryKey: GOODS_RECEIPT_QUERY_KEYS.list(JSON.stringify(params)),
    queryFn: () => getGoodsReceipts(params),
    placeholderData: (previousData) => previousData,
    // Backend rejects requests without X-Company-Id — don't fire before a
    // company is selected (e.g. the brief window before the list page's
    // company auto-select effect resolves).
    enabled: !!params?.companyId,
  });
}

export function useGoodsReceiptDetail(id: string, companyId?: string) {
  return useQuery({
    queryKey: GOODS_RECEIPT_QUERY_KEYS.detail(id),
    queryFn: () => getGoodsReceiptDetail(id, companyId),
    enabled: !!id && !!companyId,
    // A GR is immutable once created (BR-GR11) — safe to treat as never stale.
    staleTime: Infinity,
  });
}
