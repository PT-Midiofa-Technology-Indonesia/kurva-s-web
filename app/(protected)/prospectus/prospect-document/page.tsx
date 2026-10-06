import { Suspense } from 'react';
import { ListPageSkeleton } from '@/components/templates';
import { ProspectDocumentPage } from '@/domains/prospect-document';

export default function Page() {
  return (
    <Suspense fallback={<ListPageSkeleton />}>
      <ProspectDocumentPage />
    </Suspense>
  );
}
