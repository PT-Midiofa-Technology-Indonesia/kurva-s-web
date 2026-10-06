'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import type { UseLoginError } from './use-login';
import { useLogin } from './use-login';

export function useLoginPage() {
  const searchParams = useSearchParams();
  // returnUrl and portal from query params — forwarded to /portal-selection
  // so PortalSelectionPage can redirect back after the user re-selects their portal
  const returnUrl = searchParams.get('returnUrl');
  const portal = searchParams.get('portal');
  const [error, setError] = useState<UseLoginError | null>(null);

  const { mutateAsync, isPending } = useLogin({
    onSuccess: () => {
      // Always go through /portal-selection after login.
      // Pass returnUrl + portal so PortalSelectionPage can redirect back.
      const destination = new URL('/portal-selection', window.location.origin);
      if (returnUrl) destination.searchParams.set('returnUrl', returnUrl);
      if (portal) destination.searchParams.set('portal', portal);
      window.location.href = destination.toString();
    },
    onError: (err) => {
      setError(err);
    },
  });

  const handleSubmit = async (values: unknown) => {
    setError(null);
    try {
      await mutateAsync(values as Parameters<typeof mutateAsync>[0]);
    } catch (err) {
      console.error(err);
      // Error is already handled by onError in useLogin
    }
  };

  return { error, isPending, handleSubmit };
}
