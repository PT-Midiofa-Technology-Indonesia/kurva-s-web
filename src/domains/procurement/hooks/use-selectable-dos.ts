'use client';

import { useQuery } from '@tanstack/react-query';
import type { GetSelectableDosParams } from '../api/get-selectable-dos';
import { getSelectableDos } from '../api/get-selectable-dos';
import { GOODS_RECEIPT_QUERY_KEYS } from './use-goods-receipts';

export function useSelectableDos(params?: GetSelectableDosParams) {
  return useQuery({
    queryKey: [...GOODS_RECEIPT_QUERY_KEYS.selectableDos(), params],
    queryFn: () => getSelectableDos(params),
    enabled: !!params?.companyId,
  });
}
