import { Suspense } from 'react';

import { PaymentRequestDetailPage } from '@/domains/finance/payment-request/pages/PaymentRequestDetailPage';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <PaymentRequestDetailPage />
    </Suspense>
  );
}
