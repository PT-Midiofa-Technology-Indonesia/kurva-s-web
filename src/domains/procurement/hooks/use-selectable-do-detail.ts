'use client';

import { useQuery } from '@tanstack/react-query';
import { getSelectableDoDetail } from '../api/get-selectable-do-detail';
import { GOODS_RECEIPT_QUERY_KEYS } from './use-goods-receipts';

export function useSelectableDoDetail(doId?: string, companyId?: string) {
  return useQuery({
    queryKey: GOODS_RECEIPT_QUERY_KEYS.selectableDo(doId ?? ''),
    queryFn: () => getSelectableDoDetail(doId as string, companyId),
    // Backend rejects requests without X-Company-Id.
    enabled: !!doId && !!companyId,
  });
}
