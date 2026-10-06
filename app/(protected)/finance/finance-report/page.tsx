import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { FinanceReportListPage } from '@/domains/finance-report/pages/FinanceReportListPage';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <FinanceReportListPage />
    </Suspense>
  );
}
