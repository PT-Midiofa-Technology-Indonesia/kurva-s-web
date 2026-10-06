import { useMemo, useState } from 'react';
import { useQueryParams } from '@/shared/hooks/use-query-params';
import type { BaseQueryParams } from '@/types/query-params';
import type { DocumentModule } from '../types/document-module';
import { useDocumentModules } from './use-document-modules';

export interface DocumentModulePageUrlParams extends BaseQueryParams {
  search?: string;
}

export function useDocumentModulePage() {
  const { queryParams, updateQueryParam } = useQueryParams<DocumentModulePageUrlParams>();
  const { data: modules = [], isLoading, isError, refetch } = useDocumentModules();

  const [selectedModule, setSelectedModule] = useState<DocumentModule | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const filteredModules = useMemo(() => {
    if (!queryParams.search) return modules;
    const searchLower = queryParams.search.toLowerCase();
    return modules.filter((mod) => mod.module.toLowerCase().includes(searchLower));
  }, [modules, queryParams.search]);

  const handleSearchChange = (value: string | undefined) => {
    updateQueryParam('search', value);
  };

  const handleSettingsOpen = (module: DocumentModule) => {
    setSelectedModule(module);
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
    setSelectedModule(null);
  };

  const handleSuccess = () => {
    refetch();
  };

  return {
    modules: filteredModules,
    totalItems: filteredModules.length,
    isLoading,
    isError,
    search: queryParams.search,
    handleSearchChange,
    selectedModule,
    settingsOpen,
    handleSettingsOpen,
    handleSettingsClose,
    handleSuccess,
  };
}
