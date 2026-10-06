import type { ProjectBOQItem } from '../api/get-project-boq';

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'QC Passed':
      return 'bg-green-100 text-green-600 border-0';
    case 'Done - Pending QC':
      return 'bg-orange-100 text-orange-600 border-0';
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-600 border-0';
    case 'QC Failed':
      return 'bg-red-100 text-red-600 border-0';
    case 'Not Started':
      return 'bg-gray-100 text-gray-500 border-0';
    default:
      return '';
  }
}

export function getBOQSubRows(row: ProjectBOQItem): ProjectBOQItem[] | undefined {
  const children = row.children ?? [];
  return children.length > 0 ? children : undefined;
}

export function getBOQRowId(originalRow: ProjectBOQItem): string {
  return originalRow.id;
}
