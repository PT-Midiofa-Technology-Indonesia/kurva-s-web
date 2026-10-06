import { Suspense } from 'react';

import { GoodsReceiptDetailPage } from '@/domains/procurement';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <GoodsReceiptDetailPage />
    </Suspense>
  );
}
