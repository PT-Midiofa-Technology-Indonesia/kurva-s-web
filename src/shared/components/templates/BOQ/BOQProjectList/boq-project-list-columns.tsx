'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import type { BOQProjectListConfig } from '../types/boq-labels.types';
import type { BOQProjectListItem } from '../types/boq-project-list.types';

export function buildBOQProjectListColumns(
  config: BOQProjectListConfig,
  renderAction: (row: BOQProjectListItem) => ReactNode,
  onProjectClick?: (row: BOQProjectListItem) => void
): ColumnDef<BOQProjectListItem>[] {
  return [
    {
      accessorKey: 'projectName',
      header: 'Project',
      cell: ({ row }) => {
        const project = row.original;
        if (project.isClickable && onProjectClick) {
          return (
            <button
              type="button"
              className="text-left underline hover:text-primary transition-colors"
              onClick={() => onProjectClick(project)}
            >
              {project.projectName}
            </button>
          );
        }
        return <span>{project.projectName}</span>;
      },
    },
    {
      accessorKey: 'projectOwner',
      header: 'Project Owner',
    },
    {
      accessorKey: 'settingStatus',
      header: config.settingColumnLabel,
      cell: ({ row }) => {
        const isComplete = row.original.settingStatus === 'complete';
        return (
          <Badge variant={isComplete ? 'success' : 'destructive'}>
            {isComplete ? 'Complete' : 'Incomplete'}
          </Badge>
        );
      },
    },
    {
      id: 'action',
      header: 'Action',
      enableSorting: false,
      size: 32,
      cell: ({ row }) => renderAction(row.original),
    },
  ];
}
