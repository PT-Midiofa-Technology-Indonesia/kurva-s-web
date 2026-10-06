import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { GoodsReceiptCreatePage } from '@/domains/procurement';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <GoodsReceiptCreatePage />
    </Suspense>
  );
}
