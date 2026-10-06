import { Suspense } from 'react';
import { BillingRecordDetailPage } from '@/domains/finance/billing/pages';
import { FormPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <BillingRecordDetailPage />
    </Suspense>
  );
}
