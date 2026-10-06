'use client';

import { Badge } from '@/shared/components/ui';
import { Label } from '@/shared/components/ui/label';
import { formatIDR } from '@/shared/utils/currency';
import type { ProjectBODetail } from '../api/get-project-boq';

interface ProjectBOQInfoCardProps {
  project: ProjectBODetail;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function ProjectBOQInfoCard({ project }: ProjectBOQInfoCardProps) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-[18px]">
      {project.isSideInstruction && (
        <div className="mb-4">
          <Badge variant="warning" className="text-xs">
            Site Instruction
          </Badge>
        </div>
      )}
      <div className="grid grid-cols-3 gap-x-8 gap-y-4">
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">Project</Label>
          <p className="text-sm font-medium text-slate-950">{project.name}</p>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">Project Owner</Label>
          <p className="text-sm font-medium text-slate-950">{project.company?.name}</p>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">Client</Label>
          <p className="text-sm font-medium text-slate-950">{project.client?.name}</p>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">RAB Value</Label>
          <p className="text-sm font-medium text-slate-950">{formatIDR(project.totalValue)}</p>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">Periode Project</Label>
          <p className="text-sm font-medium text-slate-950">
            {formatDate(project.projectStartDate)} - {formatDate(project.projectEndDate)}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">Status</Label>
          <Badge variant={project.currentStageName === 'Won' ? 'success' : 'destructive'}>
            {project.currentStageName}
          </Badge>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-sm font-normal text-slate-500">Project Type</Label>
          <p className="text-sm font-medium text-slate-950">{project.projectType?.name ?? '-'}</p>
        </div>
        <div className="flex flex-col gap-1 col-span-2">
          <Label className="text-sm font-normal text-slate-500">Deskripsi</Label>
          <p className="text-sm font-medium text-slate-950 leading-relaxed">
            {project.description ?? '-'}
          </p>
        </div>
      </div>
    </div>
  );
}
