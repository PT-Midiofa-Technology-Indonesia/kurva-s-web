'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Read X-Company-Id from URL search params.
 * Usage: navigate to /procurement/purchase-planning/create?companyId=<uuid>
 */
export function useCompanyId(): string | undefined {
  const searchParams = useSearchParams();
  return searchParams.get('companyId') ?? undefined;
}
