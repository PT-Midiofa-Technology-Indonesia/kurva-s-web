import { Suspense } from 'react';
import { BillingListPage } from '@/domains/finance/billing/pages';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <BillingListPage />
    </Suspense>
  );
}
