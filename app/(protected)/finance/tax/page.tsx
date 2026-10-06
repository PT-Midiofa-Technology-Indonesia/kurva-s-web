import { Suspense } from 'react';
import { TaxFilingListPage } from '@/domains/finance/tax-filing/pages/TaxFilingListPage';
import { TaxManagementTabs } from '@/domains/finance/tax-report/components/TaxManagementTabs';
import { TaxReportListPage } from '@/domains/finance/tax-report/pages/TaxReportListPage';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <TaxManagementTabs>
        <TaxReportListPage />
        <TaxFilingListPage />
      </TaxManagementTabs>
    </Suspense>
  );
}
