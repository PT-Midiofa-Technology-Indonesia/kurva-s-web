import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { GoodsReceiptListPage } from '@/domains/procurement';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <GoodsReceiptListPage />
    </Suspense>
  );
}
