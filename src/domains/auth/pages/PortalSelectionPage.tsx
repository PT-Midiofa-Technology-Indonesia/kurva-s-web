'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getMe } from '@/domains/auth/api/get-me';
import { AUTH_QUERY_KEYS } from '@/domains/auth/hooks/use-me';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { setPortal } from '@/shared/lib/portal';
import { saveUserPermissionsToCookie } from '@/shared/lib/user-permissions';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import { PortalSelectionCard } from '../components/PortalSelectionCard';
import { type PortalCardData, toPortalCards } from '../constants/portal';
import { useSetWorkspace } from '../hooks/use-set-workspace';
import { useWorkspaces } from '../hooks/use-workspaces';

export function PortalSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: workspaces, isLoading, isError } = useWorkspaces();
  const { mutate: setWorkspace, isPending } = useSetWorkspace();

  // Query params passed from login redirect (set by proxy.ts or clearAuthAndRedirect)
  const returnUrl = searchParams.get('returnUrl');
  const expectedPortal = searchParams.get('portal'); // 'company' | 'project' | null

  const cards = useMemo(() => toPortalCards(workspaces ?? []), [workspaces]);

  const handleSelect = useCallback(
    (card: PortalCardData) => {
      if (isPending) return;

      setWorkspace(
        { workspaceId: card.id },
        {
          onSuccess: async (workspace) => {
            setPortal(workspace.code, workspace.id);

            // Seed RQ cache + sync permissions cookie before navigating.
            // Auto-select first project first so the single getMe() call
            // already carries x-project-id via the axios interceptor.
            try {
              const initial = await getMe();
              if (initial.projects?.length > 0) {
                useSelectedProjectStore.getState().setSelectedProjectId(initial.projects[0].id);
              }
              const user = await getMe();
              queryClient.setQueryData(AUTH_QUERY_KEYS.me(), user);
              saveUserPermissionsToCookie(user.permissions ?? []);
            } catch {
              // Non-blocking — permissions sync on first dashboard render
            }

            // If user selected the same portal they were on, go back to returnUrl
            // Otherwise go to /dashboard (portal changed, returnUrl may be inaccessible)
            if (returnUrl && expectedPortal && workspace.code === expectedPortal) {
              window.location.href = returnUrl;
            } else {
              router.push('/dashboard');
            }
          },
          onError: (error) => {
            toast.error({
              title: getErrorMessage(error, 'Gagal masuk ke portal. Silakan coba lagi.'),
            });
          },
        }
      );
    },
    [isPending, router, setWorkspace, queryClient, returnUrl, expectedPortal]
  );

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Cards */}
      <div className={cn('flex flex-col gap-4', isPending && 'pointer-events-none opacity-60')}>
        {isLoading &&
          Array.from({ length: 2 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-lg rounded-2xl" />
          ))}

        {isError && (
          <Alert variant="destructive" className="w-lg">
            <AlertDescription>Gagal memuat daftar portal. Silakan coba lagi.</AlertDescription>
          </Alert>
        )}

        {!isLoading &&
          !isError &&
          cards.map((card) => (
            <PortalSelectionCard key={card.id} card={card} onSelect={handleSelect} />
          ))}
      </div>
    </div>
  );
}
