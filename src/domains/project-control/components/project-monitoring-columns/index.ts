import type { ColumnDef } from '@tanstack/react-table';
import type { ProjectBOQItem } from '@/domains/project-control/api/get-project-boq';
import type { ProjectMonitoringViewMode } from '../../types';
import {
  type CreateProjectMonitoringColumnsOptions,
  createAllViewColumns,
} from './all-view-columns';
import { createDetailViewColumns } from './detail-view-columns';

export type { ProjectMonitoringViewMode } from '../../types';
export type { CreateProjectMonitoringColumnsOptions } from './all-view-columns';
export { createAllViewColumns } from './all-view-columns';
export { createDetailViewColumns } from './detail-view-columns';

export function getProjectMonitoringColumns(
  viewMode: ProjectMonitoringViewMode,
  options: CreateProjectMonitoringColumnsOptions
): ColumnDef<ProjectBOQItem>[] {
  switch (viewMode) {
    case 'day':
    case 'week':
    case 'month':
      return createDetailViewColumns(options);
    default:
      return createAllViewColumns(options);
  }
}
