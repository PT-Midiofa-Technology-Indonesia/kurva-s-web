import { Suspense } from 'react';

import { BillingDetailPage } from '@/domains/finance/billing/pages';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <BillingDetailPage />
    </Suspense>
  );
}
