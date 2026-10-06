'use client';

import { useCallback, useMemo, useState } from 'react';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { mapProspectsToKanbanColumns } from '../services/prospect-service';
import { useProspects } from './use-prospects';
import { useUpdateProspectStage } from './use-update-prospect-stage';

export function useProspectPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const companies = useMemo(
    () => companyOptions.map((c) => ({ id: c.value, name: c.label })),
    [companyOptions]
  );

  const isLoadingCompanies = false;
  const companiesHasMore = false;
  const companiesLoadMore = () => undefined;

  const { data: stages, isLoading: isLoadingProspects } = useProspects(companyId);

  const kanbanColumns = useMemo(
    () => (stages ? mapProspectsToKanbanColumns(stages) : []),
    [stages]
  );

  const selectedCompanyName = useMemo(
    () => companies.find((c) => c.id === companyId)?.name,
    [companies, companyId]
  );

  const handleOpenDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const handleCloseDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const handleCardClick = useCallback((projectId: string) => setSelectedProjectId(projectId), []);
  const handleCloseModal = useCallback(() => setSelectedProjectId(null), []);

  const { mutate: updateStage } = useUpdateProspectStage(companyId ?? '');

  const handleCardMove = useCallback(
    (projectId: string, fromStage: string, toStage: string, revert: () => void) => {
      if (toStage !== fromStage) {
        updateStage({ projectId, stage: toStage }, { onError: revert });
      }
    },
    [updateStage]
  );

  return {
    companyId,
    selectedCompanyName,
    companyOptions,
    isLoadingCompanies,
    companiesHasMore,
    companiesLoadMore,
    handleCompanyChange,
    kanbanColumns,
    isLoading: isLoadingProspects,
    isDrawerOpen,
    handleOpenDrawer,
    handleCloseDrawer,
    handleCardMove,
    selectedProjectId,
    handleCardClick,
    handleCloseModal,
  };
}
