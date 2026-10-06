import { Suspense } from 'react';
import { PaymentSchedulePage } from '@/domains/finance/payment-request/pages/PaymentSchedulePage';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PaymentSchedulePage />
    </Suspense>
  );
}
