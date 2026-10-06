'use client';

import { Briefcase, Eye, Loader2, Pencil, Trash2, User } from 'lucide-react';
import { OrgTree, type OrgTreeNode } from '@/components/organisms/OrgTree';
import { DataTablePagination } from '@/shared/components/molecules/DataTablePagination';
import { DropdownMenuItem } from '@/shared/components/ui/dropdown-menu';
import { HIERARCHY_MANAGEMENT_LABELS } from '../constants';
import { useHierarchyManagementsTree } from '../hooks/use-hierarchy-managements-tree';
import type { CompanyPositionNode, HierarchyManagementListItem } from '../types';

function getPositionIcon(level?: number) {
  if (level === 1) {
    return <User className="h-4 w-4 text-teal-500" />;
  }
  return <User className="h-4 w-4 text-slate-500" />;
}

function flattenNodes(items: CompanyPositionNode[], map: Map<string, CompanyPositionNode>): void {
  for (const item of items) {
    map.set(item.id, item);
    flattenNodes(item.children ?? [], map);
  }
}

function mapToOrgTreeNode(item: CompanyPositionNode): OrgTreeNode {
  return {
    id: item.id,
    name: item.position?.name ?? '-',
    type: `${item.position?.code ?? '-'} | Lv ${item.position?.level ?? '-'}`,
    icon: getPositionIcon(item.position?.level),
    iconBgColor: item.position?.level === 1 ? '#C8FFF7' : '#F1F5F9',
    status: item.isActive ? 'active' : 'inactive',
    statusLabel: item.isActive ? 'Aktif' : 'Tidak Aktif',
    children: (item.children ?? []).map(mapToOrgTreeNode),
  };
}

function toListItem(node: CompanyPositionNode): HierarchyManagementListItem {
  return {
    id: node.id,
    isActive: node.isActive,
    position: node.position,
    department: node.department,
  };
}

interface HierarchyManagementTreeViewProps {
  companyId?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  perPage?: number;
  onPaginationChange?: (page: number, perPage: number) => void;
  onEdit?: (item: HierarchyManagementListItem) => void;
  onDetail?: (item: HierarchyManagementListItem) => void;
  onDeleteClick?: (item: HierarchyManagementListItem) => void;
}

export function HierarchyManagementTreeView({
  companyId,
  search,
  isActive,
  page = 1,
  perPage = 10,
  onPaginationChange,
  onEdit,
  onDetail,
  onDeleteClick,
}: HierarchyManagementTreeViewProps) {
  const { data, isLoading, isError } = useHierarchyManagementsTree({
    companyId,
    search,
    isActive,
    page,
    perPage,
  });

  const nodeMap = new Map<string, CompanyPositionNode>();

  const renderActions = (node: OrgTreeNode) => {
    const original = nodeMap.get(node.id);
    if (!original) return null;

    return (
      <>
        <DropdownMenuItem onClick={() => onEdit?.(toListItem(original))}>
          <Pencil className="mr-2 h-4 w-4" />
          {HIERARCHY_MANAGEMENT_LABELS.LIST.ACTIONS.EDIT}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDetail?.(toListItem(original))}>
          <Eye className="mr-2 h-4 w-4" />
          {HIERARCHY_MANAGEMENT_LABELS.LIST.ACTIONS.DETAIL}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDeleteClick?.(toListItem(original))}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {HIERARCHY_MANAGEMENT_LABELS.LIST.ACTIONS.DELETE}
        </DropdownMenuItem>
      </>
    );
  };

  if (!companyId || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Briefcase className="h-10 w-10 text-slate-300" />
        <p className="text-sm text-muted-foreground">{HIERARCHY_MANAGEMENT_LABELS.LIST.EMPTY}</p>
      </div>
    );
  }

  if (data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Briefcase className="h-10 w-10 text-slate-300" />
        <p className="text-sm text-muted-foreground">{HIERARCHY_MANAGEMENT_LABELS.LIST.EMPTY}</p>
      </div>
    );
  }

  flattenNodes(data.data, nodeMap);

  const hasActions = onEdit || onDetail || onDeleteClick;

  return (
    <div className="flex flex-col">
      <div className="p-4">
        <OrgTree
          title=""
          nodes={data.data.map(mapToOrgTreeNode)}
          defaultExpanded={true}
          renderActions={hasActions ? renderActions : undefined}
          alwaysShowActions
        />
      </div>
      {onPaginationChange && (
        <DataTablePagination
          currentPage={data.meta.currentPage}
          totalPages={data.meta.lastPage}
          pageSize={perPage}
          totalItems={data.meta.total}
          onPageChange={(p) => onPaginationChange(p, perPage)}
          onPageSizeChange={(size) => onPaginationChange(1, size)}
        />
      )}
    </div>
  );
}
