import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PrivacyPolicyPage } from '@/domains/legal';
import { LoadingSkeleton } from '@/shared/components/molecules';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Curva-S',
  description:
    'Kebijakan privasi Curva-S: data yang kami kumpulkan, cara penggunaannya, dan hak Anda atas data tersebut.',
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="card" />}>
      <PrivacyPolicyPage />
    </Suspense>
  );
}
