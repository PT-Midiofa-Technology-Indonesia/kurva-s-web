'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { usePermissionStore } from '@/domains/permission';
import { checkRoutePermission } from '@/shared/lib/permission-guard';
import { getPortal } from '@/shared/lib/portal';

export function ForbiddenPage() {
  const router = useRouter();
  const permissions = usePermissionStore((s) => s.permissions);
  const previousPath = useRef<string | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!previousPath.current && document.referrer) {
      try {
        previousPath.current = new URL(document.referrer).pathname;
      } catch {
        previousPath.current = null;
      }
    }

    isMounted.current = true;
  }, []);

  useEffect(() => {
    if (!isMounted.current || permissions.length === 0) return;

    const portal = getPortal();
    const pathToCheck = previousPath.current ?? '/dashboard';
    const redirect = checkRoutePermission(pathToCheck, permissions, portal);

    if (!redirect) {
      router.push(pathToCheck);
      return;
    }

    const dashboardRedirect = checkRoutePermission('/dashboard', permissions, portal);

    if (!dashboardRedirect) {
      router.push('/dashboard');
    }
  }, [permissions, router]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <h2 className="text-2xl font-semibold">Akses Ditolak</h2>
        <p className="text-muted-foreground max-w-md">
          Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika
          Anda merasa ini adalah kesalahan.
        </p>
        <div className="pt-4">
          <Link href="/dashboard">
            <Button>Kembali ke Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
