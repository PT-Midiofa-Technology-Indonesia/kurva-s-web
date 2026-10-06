import { Suspense } from 'react';

import { VendorDirectoryPage } from '@/domains/vendor-directory';
import { ListPageSkeleton } from '@/shared/components/templates/ListPageSkeleton';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <VendorDirectoryPage />
    </Suspense>
  );
}
