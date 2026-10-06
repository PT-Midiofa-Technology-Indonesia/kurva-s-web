'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DELIVERY_ORDER_QUERY_KEYS } from '@/domains/logistic/hooks/use-delivery-orders';
import { createGoodsReceipt } from '../api/create-goods-receipt';
import type { CreateGoodsReceiptPayload } from '../types/goods-receipt';
import { GOODS_RECEIPT_QUERY_KEYS } from './use-goods-receipts';

export function useCreateGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      companyId,
    }: {
      payload: CreateGoodsReceiptPayload;
      companyId?: string;
    }) => createGoodsReceipt(payload, companyId),
    onSuccess: (data) => {
      queryClient.setQueryData(GOODS_RECEIPT_QUERY_KEYS.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: GOODS_RECEIPT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: DELIVERY_ORDER_QUERY_KEYS.all });
    },
  });
}
