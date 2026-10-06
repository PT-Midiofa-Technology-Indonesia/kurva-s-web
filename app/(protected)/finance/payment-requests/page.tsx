import { Suspense } from 'react';
import { PaymentRequestListPage } from '@/domains/finance/payment-request/pages/PaymentRequestListPage';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PaymentRequestListPage />
    </Suspense>
  );
}
