'use client';

import { Briefcase, Building2, Loader2, User } from 'lucide-react';
import { OrgChart, type OrgChartNode } from '@/components/organisms/OrgChart';
import { HIERARCHY_MANAGEMENT_LABELS } from '../constants';
import { useCompanyPositions } from '../hooks/use-company-positions';
import type { CompanyPositionNode, CompanyWithPositions } from '../types';

function getPositionIcon(level?: number) {
  if (level === 1) {
    return <User className="h-4 w-4 text-teal-500" />;
  }
  return <User className="h-4 w-4 text-slate-500" />;
}

function mapToOrgChartNode(item: CompanyPositionNode): OrgChartNode {
  return {
    id: item.id,
    name: item.position?.name ?? '-',
    type: `${item.department?.name ?? '-'} · Lv ${item.position?.level ?? '-'}`,
    icon: getPositionIcon(item.position?.level),
    iconBgColor: item.position?.level === 1 ? '#C8FFF7' : '#F1F5F9',
    status: item.isActive ? 'active' : 'inactive',
    statusLabel: item.isActive ? 'Aktif' : 'Tidak Aktif',
    children: (item.children ?? []).map(mapToOrgChartNode),
  };
}

function mapGroupToRootNode(group: CompanyWithPositions): OrgChartNode {
  return {
    id: group.company.id,
    name: group.company.name,
    type: group.company.code,
    icon: <Building2 className="h-4 w-4 text-green-600" />,
    iconBgColor: '#DCFCE7',
    status: group.company.isActive ? 'active' : 'inactive',
    statusLabel: group.company.isActive ? 'Aktif' : 'Tidak Aktif',
    children: (group.companyPositions ?? []).map(mapToOrgChartNode),
  };
}

interface HierarchyManagementDiagramViewProps {
  companyId?: string;
  search?: string;
  isActive?: boolean;
}

export function HierarchyManagementDiagramView({
  companyId,
  search,
  isActive,
}: HierarchyManagementDiagramViewProps) {
  const { data, isLoading, isError } = useCompanyPositions({ companyId, search, isActive });

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

  return (
    <div className="flex flex-col gap-4">
      {data.data.map((companyGroup) => (
        <OrgChart
          key={companyGroup.company.id}
          nodes={[mapGroupToRootNode(companyGroup)]}
          className="h-150"
        />
      ))}
    </div>
  );
}
