'use client';

import type { SortingState } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { GetPayrollDraftsParams } from '../api/get-payroll-drafts';
import type { CreatePayrollDraftFormValues } from '../schemas';
import { useCreatePayrollDraft } from './use-create-payroll-draft';
import { usePayrollDrafts } from './use-payroll-drafts';

interface UsePayrollDraftPageOptions {
  params: GetPayrollDraftsParams;
  companyId?: string;
  setQueryParams: (params: Record<string, string | undefined>) => void;
}

export function usePayrollDraftPage({
  params,
  companyId,
  setQueryParams,
}: UsePayrollDraftPageOptions) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = usePayrollDrafts(params, companyId);
  const { mutateAsync: createDraft, isPending: isCreating } = useCreatePayrollDraft();

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      setQueryParams({ search: value, page: '1' });
    },
    [setQueryParams]
  );

  const handleSort = useCallback(
    (sorting: SortingState) => {
      if (sorting.length > 0) {
        const { id, desc } = sorting[0];
        setQueryParams({
          sortBy: id,
          sortOrder: desc ? 'desc' : 'asc',
        });
      }
    },
    [setQueryParams]
  );

  const handlePaginationChange = useCallback(
    (newPage: number, newPerPage: number) => {
      setQueryParams({
        page: newPage.toString(),
        perPage: newPerPage.toString(),
      });
    },
    [setQueryParams]
  );

  const handleCreateDraft = useCallback(
    async (data: CreatePayrollDraftFormValues) => {
      if (!companyId) return null;

      const createdDraft = await createDraft({ ...data, companyId });
      router.push(
        `/human-resource/payroll/draft/${encodeURIComponent(createdDraft.id)}?companyId=${encodeURIComponent(companyId)}`
      );
      return createdDraft;
    },
    [companyId, createDraft, router]
  );

  const handleOpenDraft = useCallback(
    (draftId: string) => {
      if (!companyId) return;

      router.push(
        `/human-resource/payroll/draft/${encodeURIComponent(draftId)}?companyId=${encodeURIComponent(companyId)}`
      );
    },
    [companyId, router]
  );

  return {
    drafts: data?.data ?? [],
    totalItems: data?.meta?.total ?? 0,
    totalPages: data?.meta?.lastPage ?? 0,
    isLoading,
    isError,
    refetchDrafts: refetch,
    isCreating,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    handleCreateDraft,
    handleOpenDraft,
  };
}
