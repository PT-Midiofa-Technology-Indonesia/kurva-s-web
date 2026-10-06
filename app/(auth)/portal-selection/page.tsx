import { Suspense } from 'react';
import { PortalSelectionPage } from '@/domains/auth';

export default function Page() {
  return (
    <Suspense>
      <PortalSelectionPage />
    </Suspense>
  );
}
