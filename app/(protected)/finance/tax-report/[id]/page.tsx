import { Suspense } from 'react';

import { TaxReportDetailPage } from '@/domains/finance/tax-report/pages/TaxReportDetailPage';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <TaxReportDetailPage />
    </Suspense>
  );
}
