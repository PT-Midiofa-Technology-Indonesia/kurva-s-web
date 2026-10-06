'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import type { BOQDetailRow } from '../types/boq-detail';
import { mapToBOQDetailRows } from '../types/boq-detail';
import { useProjectBOQ } from './use-project-boq';
import { useProjectManagementBOQ } from './use-project-management-boq';

/**
 * Which endpoint backs the BOQ detail:
 * - `project-control` — `/projects/{projectId}/boq` (project-control routes)
 * - `project-management` — `/project-management/boq`, scoped by the `x-project-id` header
 */
export type BOQDetailSource = 'project-control' | 'project-management';

interface UseBOQDetailPageOptions {
  projectId: string | null | undefined;
  source?: BOQDetailSource;
}

interface PRDialogState {
  open: boolean;
  boqItemId: string | null;
  itemName: string | null;
}

const CLOSED_DIALOG: PRDialogState = { open: false, boqItemId: null, itemName: null };

export function useBOQDetailPage({
  projectId,
  source = 'project-control',
}: UseBOQDetailPageOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  // Both queries are declared (hooks can't be conditional); only the active source fetches.
  const isProjectManagementSource = source === 'project-management';
  const projectControlQuery = useProjectBOQ(isProjectManagementSource ? undefined : projectId);
  const projectManagementQuery = useProjectManagementBOQ(projectId, undefined, {
    enabled: isProjectManagementSource,
  });

  const { data, isLoading, error, refetch } = isProjectManagementSource
    ? projectManagementQuery
    : projectControlQuery;

  const project = data?.project ?? null;
  const boq = data?.boq ?? null;

  const treeData = useMemo<BOQDetailRow[]>(() => {
    if (!boq?.items) return [];
    return mapToBOQDetailRows(boq.items as any[]);
  }, [boq?.items]);

  const handleBack = useCallback(() => {
    router.push(`/project-control/project${currentTab ? `?tab=${currentTab}` : '?tab=project'}`);
  }, [router, currentTab]);

  const [manualPrDialog, setManualPrDialog] = useState<PRDialogState>(CLOSED_DIALOG);
  const [bundlePrDialog, setBundlePrDialog] = useState<PRDialogState>(CLOSED_DIALOG);

  const handleCreatePR = useCallback((row: BOQDetailRow) => {
    setManualPrDialog({ open: true, boqItemId: row.id, itemName: row.name });
  }, []);

  const handleCreatePRBundle = useCallback((row: BOQDetailRow) => {
    setBundlePrDialog({ open: true, boqItemId: row.id, itemName: row.name });
  }, []);

  const closeManualPrDialog = useCallback(() => setManualPrDialog(CLOSED_DIALOG), []);
  const closeBundlePrDialog = useCallback(() => setBundlePrDialog(CLOSED_DIALOG), []);

  const refetchBOQ = useCallback(() => {
    refetch();
  }, [refetch]);

  const isError = !!error;

  return {
    project,
    boq,
    treeData,
    isLoading,
    isError,
    handleBack,
    handleCreatePR,
    handleCreatePRBundle,
    manualPrDialog,
    bundlePrDialog,
    closeManualPrDialog,
    closeBundlePrDialog,
    refetchBOQ,
  };
}
