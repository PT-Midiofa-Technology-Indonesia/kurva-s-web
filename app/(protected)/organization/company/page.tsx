import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { CompanyListPage } from '@/domains/company';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <CompanyListPage />
    </Suspense>
  );
}
