'use client';

import { AlertCircle, ArrowLeft, Loader2, Plus } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DetailHierarchySection } from '../components/DetailHierarchySection';
import { DETAIL_PAGE_LABELS } from '../constants';
import { useDeleteProjectHierarchyNode } from '../hooks/use-delete-project-hierarchy-node';
import { useProjectBOQ } from '../hooks/use-project-boq';
import { useProjectHierarchyNodes } from '../hooks/use-project-hierarchy-nodes';

export function DetailProjectHierarchyPage() {
  const params = useParams<{ id?: string }>();
  const projectId = params.id ?? '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId');
  const { data: projectData } = useProjectBOQ(projectId);
  const isSideInstruction = projectData?.project.isSideInstruction;
  const { data: nodesData, isLoading } = useProjectHierarchyNodes(projectId);
  const { mutate: deleteNode, isPending: isDeletingNode } = useDeleteProjectHierarchyNode();

  const handleBack = useCallback(() => {
    router.push('/project-control/project?tab=project');
  }, [router]);

  const handleTambahPosition = useCallback(() => {
    const base = `/project-control/project/${projectId}/project-hierarchy/position/create`;
    const params = new URLSearchParams();
    if (companyId) params.set('companyId', companyId);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    router.push(`${base}${suffix}`);
  }, [router, projectId, companyId]);

  const nodes = nodesData?.data ?? [];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
          aria-label={DETAIL_PAGE_LABELS.BUTTONS.BACK}
          className="h-9 px-4 text-sm font-medium text-slate-950 border-slate-200 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="flex-1 text-lg font-semibold text-slate-950">Hierarki Project</h1>
        <div className="flex items-center gap-2">
          {!isSideInstruction && (
            <Button onClick={handleTambahPosition}>
              <Plus className="mr-1.5 h-4 w-4" />
              {DETAIL_PAGE_LABELS.TAMBAH_POSITION}
            </Button>
          )}
        </div>
      </div>

      {isSideInstruction && (
        <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <AlertCircle className="h-4 w-4" />
          <span>{DETAIL_PAGE_LABELS.SIDE_INSTRUCTION_READONLY_NOTICE}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <DetailHierarchySection
          basePath={`/project-control/project/${projectId}/project-hierarchy`}
          nodes={nodes}
          onDeleteNode={deleteNode}
          isDeletingNode={isDeletingNode}
          readonly={isSideInstruction}
          showPic
        />
      )}
    </div>
  );
}
