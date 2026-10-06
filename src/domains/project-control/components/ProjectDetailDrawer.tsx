'use client';

import { DetailDrawerTemplate } from '@/shared/components/templates/DetailDrawerTemplate/DetailDrawerTemplate';
import type { Project } from '../types';

interface ProjectDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
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

export function ProjectDetailDrawer({ open, onClose, project }: ProjectDetailDrawerProps) {
  return (
    <DetailDrawerTemplate open={open} onClose={onClose} title="Detail Project" closeLabel="Tutup">
      {project ? (
        <div className="flex flex-col gap-6 px-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">Project</p>
            <p className="text-sm font-medium text-slate-950">{project.projectName}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">Project Owner</p>
            <p className="text-sm font-medium text-slate-950">{project.projectOwner}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">Client</p>
            <p className="text-sm font-medium text-slate-950">{project.clientName ?? '-'}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">Estimasi Nilai Project</p>
            <p className="text-sm font-medium text-slate-950">
              {project.estimatedValue != null ? formatCurrency(project.estimatedValue) : '-'}
            </p>
          </div>
          {project.projectStartDate && project.projectEndDate && (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-normal text-slate-500">Periode Project</p>
              <p className="text-sm font-medium text-slate-950">
                {formatDate(project.projectStartDate)} - {formatDate(project.projectEndDate)}
              </p>
            </div>
          )}
          {project.projectStartDate && (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-normal text-slate-500">Tanggal Mulai</p>
              <p className="text-sm font-medium text-slate-950">
                {formatDate(project.projectStartDate)}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">Deskripsi</p>
            <p className="text-sm font-medium text-slate-950">{project.description ?? '-'}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">Status</p>
            <span
              className={`inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-md w-fit ${
                project.status === 'Aktif'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {project.status}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-normal text-slate-500">Warehouse</p>
            <p className="text-sm font-medium text-slate-950">
              {project.warehouse ? `${project.warehouse.code} - ${project.warehouse.name}` : '-'}
            </p>
          </div>
        </div>
      ) : null}
    </DetailDrawerTemplate>
  );
}
