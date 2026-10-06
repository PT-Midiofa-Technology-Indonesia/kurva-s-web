'use client';

import { ArrowLeft, ArrowRight, Building2, ChevronDown, Edit, Trash2, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import {
  type ContextMenuItem,
  OrgChart,
  type OrgChartNode,
} from '@/shared/components/organisms/OrgChart/OrgChart';
import { DETAIL_PAGE_LABELS } from '../constants';
import type { ProjectHierarchyTemplateNode } from '../types';
import type { ProjectHierarchyNode } from '../types/project-hierarchy-node';

type HierarchyNode = ProjectHierarchyTemplateNode | ProjectHierarchyNode;

function extractPicInfo(
  item: HierarchyNode,
  showPic: boolean
): { picCount?: number; picNames?: string[] } {
  if (!showPic || !('assignments' in item)) return {};
  return {
    picCount: item.assignments.length,
    picNames: item.assignments.map((a) => a.name),
  };
}

function getPositionIcon(level?: number) {
  if (level === 1) return <User className="h-4 w-4 text-teal-500" />;
  return <User className="h-4 w-4 text-slate-500" />;
}

function mapToOrgChartNode(
  item: HierarchyNode,
  showPic: boolean,
  parentId?: string | null
): OrgChartNode {
  const effectiveParentId = parentId ?? '_company_root';
  const nodeLevel = (item.position as any)?.level;
  return {
    id: item.id,
    name: item.position?.name ?? '-',
    type: `${item.position?.code ?? '-'}`,
    icon: getPositionIcon(nodeLevel),
    iconBgColor: nodeLevel === 1 ? '#C8FFF7' : '#F1F5F9',
    parentId: effectiveParentId,
    status: item.isActive ? 'active' : 'inactive',
    statusLabel: item.isActive ? DETAIL_PAGE_LABELS.AKTIF : DETAIL_PAGE_LABELS.TIDAK_AKTIF,
    ...extractPicInfo(item, showPic),
    children: (item.children ?? []).map((child: any) => mapToOrgChartNode(child, showPic, item.id)),
  };
}

interface DetailHierarchySectionProps {
  basePath: string;
  nodes: HierarchyNode[];
  onDeleteNode: (nodeId: string, options: { onSuccess: () => void }) => void;
  isDeletingNode?: boolean;
  /** Disable add/edit/delete actions (view-only) */
  readonly?: boolean;
  showPic?: boolean;
}

export function DetailHierarchySection({
  basePath,
  nodes,
  onDeleteNode,
  isDeletingNode,
  readonly = false,
  showPic = false,
}: DetailHierarchySectionProps) {
  const router = useRouter();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OrgChartNode | null>(null);

  // Helper: find parent node by child ID
  const findParentNode = useCallback(
    (nodeList: HierarchyNode[], childId: string): HierarchyNode | null => {
      for (const node of nodeList) {
        if ((node.children ?? []).some((c: any) => c.id === childId)) return node;
        const found = findParentNode(node.children ?? [], childId);
        if (found) return found;
      }
      return null;
    },
    []
  );

  const handleNodeClick = useCallback((node: OrgChartNode) => {
    if (node.id === '_company_root') {
      setSelectedNodeId(null);
      return;
    }
    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
  }, []);

  const navigateToCreate = useCallback(
    (parentId: string | null, parentName?: string) => {
      const params = new URLSearchParams();
      if (parentId) params.set('parentId', parentId);
      if (parentName) params.set('parentName', parentName);
      const suffix = params.toString() ? `?${params.toString()}` : '';
      router.push(`${basePath}/position/create${suffix}`);
    },
    [router, basePath]
  );

  const contextMenuItems: ContextMenuItem[] = useMemo(() => {
    if (readonly) return [];
    return [
      {
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        variant: 'default' as const,
        disabled: (node) => node.id === '_company_root' || !node.parentId,
        onClick: (node) => {
          router.push(`${basePath}/position/${node.id}/edit`);
        },
      },
      {
        label: 'Hapus',
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'danger' as const,
        disabled: (node) => node.id === '_company_root' || !node.parentId,
        onClick: (node) => {
          setDeleteTarget(node);
        },
      },
    ];
  }, [readonly, router, basePath]);

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    onDeleteNode(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        setSelectedNodeId(null);
      },
    });
  }, [deleteTarget, onDeleteNode]);

  const orgChartNodes = useMemo(() => {
    const childNodes = nodes.map((n) => mapToOrgChartNode(n, showPic));
    if (childNodes.length === 0) return [];
    return [
      {
        id: '_company_root',
        name: 'Company1',
        type: 'Company',
        icon: <Building2 className="h-4 w-4 text-green-600" />,
        iconBgColor: '#DBEAFE',
        parentId: null,
        status: 'active' as const,
        statusLabel: 'Aktif',
        children: childNodes,
      },
    ];
  }, [nodes, showPic]);

  return (
    <>
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm flex flex-col py-6 gap-6">
        {orgChartNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-sm text-slate-500">{DETAIL_PAGE_LABELS.BELUM_ADA_POSITION}</p>
          </div>
        ) : (
          <OrgChart
            nodes={orgChartNodes}
            className="h-[600px]"
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNodeId}
            contextMenuItems={contextMenuItems}
            onCanvasContextMenu={readonly ? 'block' : undefined}
            renderArrowActions={(node, left, top, w, h) => {
              if (readonly) return null;
              if (node.id === '_company_root') return null;
              return (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                  key={`arrows-${node.id}`}
                >
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      left: left - 16,
                      top: top + h / 2 - 14,
                      width: 28,
                      height: 28,
                      pointerEvents: 'auto',
                    }}
                    className="flex items-center justify-center rounded-full bg-teal-500 text-white shadow-md hover:bg-teal-600 transition-colors"
                    title={DETAIL_PAGE_LABELS.TAMBAH_POSITION}
                    onClick={(e) => {
                      e.stopPropagation();
                      const parentNode = findParentNode(nodes, node.id);
                      const parentId = parentNode?.id ?? null;
                      const parentName = (parentNode?.position?.name ?? node.parentId) as
                        | string
                        | undefined;
                      navigateToCreate(parentId, parentName);
                    }}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      left: left + w + 4,
                      top: top + h / 2 - 14,
                      width: 28,
                      height: 28,
                      pointerEvents: 'auto',
                    }}
                    className="flex items-center justify-center rounded-full bg-teal-500 text-white shadow-md hover:bg-teal-600 transition-colors"
                    title={DETAIL_PAGE_LABELS.TAMBAH_POSITION}
                    onClick={(e) => {
                      e.stopPropagation();
                      const parentNode = findParentNode(nodes, node.id);
                      const parentId = parentNode?.id ?? null;
                      const parentName = (parentNode?.position?.name ?? node.parentId) as
                        | string
                        | undefined;
                      navigateToCreate(parentId, parentName);
                    }}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      left: left + w / 2 - 14,
                      top: top + h + 4,
                      width: 28,
                      height: 28,
                      pointerEvents: 'auto',
                    }}
                    className="flex items-center justify-center rounded-full bg-teal-500 text-white shadow-md hover:bg-teal-600 transition-colors"
                    title={`${DETAIL_PAGE_LABELS.TAMBAH_POSITION} anak`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToCreate(node.id === '_company_root' ? null : node.id, node.name);
                    }}
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            }}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        variant="danger"
        title="Hapus Position"
        description={
          deleteTarget ? `Yakin hapus "${deleteTarget.name}"? Data akan dihapus permanen.` : ''
        }
        cancelText="Batal"
        confirmText="Hapus"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeletingNode}
      />
    </>
  );
}
