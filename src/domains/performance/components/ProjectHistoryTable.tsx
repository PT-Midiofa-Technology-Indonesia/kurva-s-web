'use client';

import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { PERFORMANCE_LABELS, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '../constants';
import type { ProjectHistory } from '../types';
import { GradeScoreBadge } from './GradeScoreBadge';

interface ProjectHistoryTableProps {
  data: ProjectHistory[];
  isLoading?: boolean;
  className?: string;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, idx) => (
        <TableRow key={idx}>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-12" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-8" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function ProjectHistoryTable({
  data,
  isLoading = false,
  className,
}: ProjectHistoryTableProps) {
  const labels = PERFORMANCE_LABELS.DETAIL.PROJECTS;

  return (
    <div className={className}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{labels.PROJECT_NAME}</TableHead>
            <TableHead>{labels.STATUS}</TableHead>
            <TableHead>{labels.PERIOD}</TableHead>
            <TableHead className="text-center">{labels.WORKER_COUNT}</TableHead>
            <TableHead className="text-center">{labels.SCORE}</TableHead>
            <TableHead className="text-center">{PERFORMANCE_LABELS.LIST.COLUMNS.GRADE}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableSkeleton />
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-sm text-slate-500">
                {labels.EMPTY}
              </TableCell>
            </TableRow>
          ) : (
            data.map((project) => {
              const statusColor =
                PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS] ??
                'bg-slate-100 text-slate-700';
              const statusLabel =
                PROJECT_STATUS_LABELS[project.status as keyof typeof PROJECT_STATUS_LABELS] ??
                project.status;

              return (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="font-medium text-slate-900">
                        {project.name ?? project.projectName}
                      </p>
                      <p className="text-xs text-slate-500">{project.projectCode}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 ${statusColor}`}>
                      {statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {project.periodStart ?? project.startDate}
                    {(project.periodEnd || project.endDate) &&
                      ` - ${project.periodEnd ?? project.endDate}`}
                  </TableCell>
                  <TableCell className="text-center text-sm text-slate-600">
                    {project.workerCount != null ? `${project.workerCount} Workers` : project.role}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {(project.score ?? project.performanceScore)?.toFixed(1) ?? '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {project.performanceGrade ? (
                      <GradeScoreBadge grade={project.performanceGrade} />
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
