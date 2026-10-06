'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ItemNotFound } from '@/shared/components/molecules';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { FormPageSkeleton, type ScheduleNode, SetSchedule } from '@/shared/components/templates';
import { getPortal } from '@/shared/lib/portal';
import type { ProjectBOQItem } from '../api/get-project-boq';
import { InformasiProjectCard } from '../components/InformasiProjectCard';
import { SCHEDULE_PAGE_LABELS } from '../constants';
import { useProjectBOQ, useSyncProjectBOQSchedule } from '../hooks';
import {
  collectScheduleIds,
  flattenScheduleTree,
  mapBoqItemsToScheduleNodes,
} from '../services/schedule-tree.service';

interface SchedulePageProps {
  projectId?: string;
}

export function SchedulePage({ projectId: projectIdProp }: SchedulePageProps = {}) {
  const params = useParams<{ id?: string }>();
  const projectId = projectIdProp ?? params.id ?? '';
  const router = useRouter();
  const { data, isLoading, error } = useProjectBOQ(projectId);
  const { mutateAsync: syncSchedule, isPending: isSaving } = useSyncProjectBOQSchedule(projectId);

  const project = data?.project;

  const initialTree = useMemo(() => {
    if (!data?.boq?.items) return [];
    return mapBoqItemsToScheduleNodes(data.boq.items as ProjectBOQItem[]);
  }, [data]);

  const originalIdsRef = useRef<Set<string>>(new Set());
  const [treeData, setTreeData] = useState<ScheduleNode[] | null>(null);
  const hasSavedRef = useRef(false);
  const [isCompanyPortal, setIsCompanyPortal] = useState(false);

  useEffect(() => {
    setIsCompanyPortal(getPortal() === 'company');
  }, []);

  useEffect(() => {
    if (initialTree.length === 0) return;
    originalIdsRef.current = collectScheduleIds(initialTree);
    if (hasSavedRef.current) {
      hasSavedRef.current = false;
      setTreeData(null);
    }
  }, [initialTree]);

  const currentTree = treeData ?? initialTree;

  const handleSave = useCallback(async () => {
    const items = flattenScheduleTree(currentTree, originalIdsRef.current);
    const currentIds = collectScheduleIds(currentTree);
    const deletedIds = Array.from(originalIdsRef.current).filter((id) => !currentIds.has(id));
    await syncSchedule({ items, deletedIds });
    hasSavedRef.current = true;
  }, [currentTree, syncSchedule]);

  const handleBack = useCallback(() => {
    router.push('/project-control/project?tab=project');
  }, [router]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <FormPageSkeleton />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <ItemNotFound message="Data project tidak ditemukan." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader title={project.name} onBack={handleBack} />

      <InformasiProjectCard project={project} labels={SCHEDULE_PAGE_LABELS.INFORMATION_CARD} />

      <SetSchedule
        value={currentTree}
        onChange={setTreeData}
        onSave={handleSave}
        isSaving={isSaving}
        hideAddButton={isCompanyPortal}
      />
    </div>
  );
}
