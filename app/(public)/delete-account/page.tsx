import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountDeletionPage } from '@/domains/legal';
import { LoadingSkeleton } from '@/shared/components/molecules';

export const metadata: Metadata = {
  title: 'Hapus Akun | Curva-S',
  description:
    'Ajukan penghapusan akun Curva-S beserta data pribadi Anda. Tidak perlu login untuk mengirim permintaan.',
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="card" />}>
      <AccountDeletionPage />
    </Suspense>
  );
}
