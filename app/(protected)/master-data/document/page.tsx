import { Suspense } from 'react';

import { DocumentPage } from '@/domains/document-type';
import { ListPageSkeleton } from '@/shared/components/templates';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <DocumentPage />
    </Suspense>
  );
}
