'use client';

import { useEffect, useMemo } from 'react';
import { useCompaniesInfinite } from '@/domains/company/hooks/use-companies-infinite';
import type { SelectValue } from '@/shared/components/atoms/Select';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import type { BaseQueryParams } from '@/shared/types/query-params';

interface CompanyQueryParams extends BaseQueryParams {
  companyId?: string;
  tab?: string;
}

export function useCompanyFilter() {
  const { queryParams, updateQueryParam, replaceQueryParams } =
    useQueryParams<CompanyQueryParams>();
  const { selectedCompanyId, setSelectedCompanyId } = useSelectedCompanyStore();
  const { options: companyOptions } = useCompaniesInfinite({ perPage: 20, isActive: true });

  const companyId = queryParams.companyId;

  // A URL or persisted id is only trusted when it belongs to the user's current companies —
  // the persisted one can go stale (data reseeded after a deploy, company deactivated,
  // another user logged in on this browser) and would otherwise be sent to the API as-is.
  const validCompanyIds = useMemo(
    () => new Set(companyOptions.map((option) => option.value as string)),
    [companyOptions]
  );
  const isValidCompanyId = (id: string | null | undefined): id is string =>
    !!id && validCompanyIds.has(id);

  // Priority: valid URL > valid store > first option
  const effectiveCompanyId = isValidCompanyId(companyId)
    ? companyId
    : isValidCompanyId(selectedCompanyId)
      ? selectedCompanyId
      : (companyOptions[0]?.value as string | undefined);

  useEffect(() => {
    if (!effectiveCompanyId) return;

    // Sync URL if empty or stale
    if (!validCompanyIds.has(companyId ?? '')) {
      updateQueryParam('companyId', effectiveCompanyId);
    }

    // Sync store if empty or stale
    if (!validCompanyIds.has(selectedCompanyId ?? '')) {
      setSelectedCompanyId(effectiveCompanyId);
    }
  }, [
    validCompanyIds,
    companyId,
    selectedCompanyId,
    effectiveCompanyId,
    updateQueryParam,
    setSelectedCompanyId,
  ]);

  const handleCompanyChange = (value: SelectValue) => {
    const id = Array.isArray(value) ? value[0] : value;
    if (id) {
      replaceQueryParams({
        companyId: id as string,
        ...(queryParams.tab ? { tab: queryParams.tab } : {}),
      });
      setSelectedCompanyId(id as string);
    }
  };

  return {
    companyId: effectiveCompanyId,
    companyOptions,
    handleCompanyChange,
  };
}
