import { Suspense } from 'react';
import { CreateAssetCategoryPage } from '@/domains/asset-management';
import { FormPageSkeleton } from '@/shared/components/templates/FormPageSkeleton';

export default function Page() {
  return (
    <Suspense fallback={<FormPageSkeleton fields={4} />}>
      <CreateAssetCategoryPage />
    </Suspense>
  );
}
