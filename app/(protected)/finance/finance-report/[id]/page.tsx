import { Suspense } from 'react';

import { FinanceReportDetailPage } from '@/domains/finance-report/pages/FinanceReportDetailPage';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <FinanceReportDetailPage />
    </Suspense>
  );
}
