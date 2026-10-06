import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { PaymentTypeListPage } from '@/domains/payment-type';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PaymentTypeListPage />
    </Suspense>
  );
}
