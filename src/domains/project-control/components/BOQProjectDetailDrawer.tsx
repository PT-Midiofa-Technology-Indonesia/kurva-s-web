'use client';

import { Button } from '@/components/atoms';
import type { BOQProjectListItem } from '@/shared/components/templates/BOQ/types/boq-project-list.types';
import { DetailDrawerTemplate } from '@/shared/components/templates/DetailDrawerTemplate/DetailDrawerTemplate';
import { Badge } from '@/shared/components/ui/badge';
import { BOQ_PROJECT_DETAIL_LABELS } from '../constants';

interface BOQProjectDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  project: BOQProjectListItem | null;
  onSetBoQ: (projectId: string) => void;
  title?: string;
  actionLabel?: string;
  settingLabel?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function BOQProjectDetailDrawer({
  open,
  onClose,
  project,
  onSetBoQ,
  title = 'Detail BoQ Planning',
  actionLabel = 'Set BoQ',
  settingLabel = BOQ_PROJECT_DETAIL_LABELS.settingBoQ,
}: BOQProjectDetailDrawerProps) {
  return (
    <DetailDrawerTemplate
      open={open}
      onClose={onClose}
      title={title}
      closeLabel="Batal"
      customFooter={
        <Button type="button" onClick={() => project && onSetBoQ(project.id)} className="w-full">
          {actionLabel}
        </Button>
      }
    >
      {project ? (
        <div className="flex flex-col gap-6 px-4">
          {project.statusBoqPlanning && project.statusBoqFinal && project.statusBoqExecution && (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-normal text-slate-500">All Statuses</p>
              <div className="flex gap-2">
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-md w-fit ${project.statusBoqPlanning ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                >
                  Planning: {project.statusBoqPlanning ? 'Complete' : 'Incomplete'}
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-md w-fit ${project.statusBoqFinal ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                >
                  Final: {project.statusBoqFinal ? 'Complete' : 'Incomplete'}
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-md w-fit ${project.statusBoqExecution ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                >
                  Execution: {project.statusBoqExecution ? 'Complete' : 'Incomplete'}
                </span>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">
              {BOQ_PROJECT_DETAIL_LABELS.project}
            </p>
            <p className="text-sm font-medium text-slate-950">{project.projectName}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">
              {BOQ_PROJECT_DETAIL_LABELS.projectOwner}
            </p>
            <p className="text-sm font-medium text-slate-950">{project.projectOwner}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">{BOQ_PROJECT_DETAIL_LABELS.client}</p>
            <p className="text-sm font-medium text-slate-950">{project.clientName}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">
              {BOQ_PROJECT_DETAIL_LABELS.rabValue}
            </p>
            <p className="text-sm font-medium text-slate-950">
              {formatCurrency(project.totalValue)}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">
              {BOQ_PROJECT_DETAIL_LABELS.projectPeriod}
            </p>
            <p className="text-sm font-medium text-slate-950">
              {formatDate(project.projectStartDate)} - {formatDate(project.projectEndDate)}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">
              {BOQ_PROJECT_DETAIL_LABELS.description}
            </p>
            <p className="text-sm font-medium text-slate-950">{project.description}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">{settingLabel}</p>
            <Badge variant={project.settingStatus === 'complete' ? 'success' : 'destructive'}>
              {project.settingStatus === 'complete' ? 'Complete' : 'Incomplete'}
            </Badge>
          </div>
        </div>
      ) : null}
    </DetailDrawerTemplate>
  );
}
