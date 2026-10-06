'use client';

import { useEffect } from 'react';

import { ServerErrorPage } from '@/domains/error';

interface ErrorProps {
  error: globalThis.Error & { digest?: string };
}

export default function ErrorPage({ error }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ServerErrorPage />;
}
