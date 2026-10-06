import { Suspense } from 'react';
import { BillingCalendarPage } from '@/domains/finance/billing/pages';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <BillingCalendarPage />
    </Suspense>
  );
}
