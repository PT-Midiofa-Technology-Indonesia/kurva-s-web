'use client';

import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DetailHierarchySection } from '../components/DetailHierarchySection';
import { DETAIL_PAGE_LABELS } from '../constants';
import { useDeleteProjectHierarchyTemplateNode } from '../hooks/use-project-hierarchy-template-nodes';
import { useProjectHierarchyTemplate } from '../hooks/use-project-hierarchy-templates';
import type { ProjectHierarchyTemplateNode } from '../types';

export function DetailProjectHierarchyTemplatePage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const templateId = decodeURIComponent(params.id ?? '');
  const handleBack = useCallback(() => {
    const path = '/project-control/project';
    router.push(path);
  }, [router]);

  const { data: templateData, isLoading: isLoadingTemplate } =
    useProjectHierarchyTemplate(templateId);

  const { mutate: deleteNode, isPending: isDeletingNode } = useDeleteProjectHierarchyTemplateNode();

  const template = templateData?.data;
  const nodes: ProjectHierarchyTemplateNode[] = template?.nodes ?? [];

  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!template) {
    return <div className="text-red-500 py-10 text-center">{DETAIL_PAGE_LABELS.GAGAL_MEMUAT}</div>;
  }

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
        <h1 className="flex-1 text-lg font-semibold text-slate-950">
          {DETAIL_PAGE_LABELS.PAGE_TITLE(template.name)}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              router.push(`/project-control/project/${templateId}/detail/position/create`)
            }
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {DETAIL_PAGE_LABELS.TAMBAH_POSITION}
          </Button>
        </div>
      </div>

      {/* Template Info */}
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm flex flex-col py-6 px-6 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm font-medium text-slate-500">
              {DETAIL_PAGE_LABELS.PROJECT_CAPABILITY}:
            </span>
            <p className="mt-0.5 text-sm text-slate-900 font-semibold">
              {template.projectCapability
                ? `${template.projectCapability.code} - ${template.projectCapability.name}`
                : '-'}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-slate-500">{DETAIL_PAGE_LABELS.STATUS}:</span>
            <div className="mt-0.5">
              <Badge
                variant={template.isActive ? 'default' : 'secondary'}
                className={
                  template.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }
              >
                {template.isActive ? DETAIL_PAGE_LABELS.AKTIF : DETAIL_PAGE_LABELS.TIDAK_AKTIF}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <DetailHierarchySection
        basePath={`/project-control/project/${templateId}/detail`}
        nodes={nodes}
        onDeleteNode={deleteNode}
        isDeletingNode={isDeletingNode}
      />
    </div>
  );
}
