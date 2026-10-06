import { Suspense } from 'react';
import { ProspectPage } from '@/domains/prospect';

export default function Page() {
  return (
    <Suspense>
      <ProspectPage />
    </Suspense>
  );
}
