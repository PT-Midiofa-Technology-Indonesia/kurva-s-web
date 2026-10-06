'use client';

import type { Row } from '@tanstack/react-table';
import { Boxes, FileText } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ContextMenuItem } from '@/components/ui/context-menu';
import { PurchaseRequestBundleDialog, PurchaseRequestManualDialog } from '@/domains/procurement';
import { ItemNotFound, PageHeader } from '@/shared/components/molecules';
import { FormPageSkeleton } from '@/shared/components/templates';
import { BOQDetail } from '@/shared/components/templates/BOQ/BOQDetail';
import { BOQExecutionCostDialog } from '@/shared/components/templates/BOQ/BOQExecution/BOQExecutionCostDialog';
import type {
  BOQExecutionCostRow,
  BOQExecutionCostSection,
} from '@/shared/components/templates/BOQ/BOQExecution/boq-execution-cost-columns';
import { useSelectedProjectStore } from '@/shared/store/selected-project';
import {
  InformasiProjectCard,
  type InformasiProjectCardLabels,
} from '../components/InformasiProjectCard';
import { ProjectManpowerRatingSection } from '../components/ProjectManpowerRatingSection';
import { BOQ_DETAIL_PAGE_LABELS } from '../constants/boq-detail';
import { useProjectBOQItemCosts } from '../hooks';
import { type BOQDetailSource, useBOQDetailPage } from '../hooks/use-boq-detail-page';
import type { BOQDetailRow } from '../types/boq-detail';

interface BOQDetailPageProps {
  /** Explicit project id (e.g. from a route param). Falls back to the globally selected project when omitted. */
  projectId?: string;
  /** Whether to show the PageHeader back button. Defaults to true. */
  showBackButton?: boolean;
  /** Which endpoint serves the BOQ. Defaults to the project-scoped one. */
  source?: BOQDetailSource;
}

export function BOQDetailPage({
  projectId: projectIdProp,
  showBackButton = true,
  source = 'project-control',
}: BOQDetailPageProps) {
  const params = useParams<{ id?: string }>();
  const selectedProjectId = useSelectedProjectStore((s) => s.selectedProjectId);
  const projectId =
    projectIdProp ?? params.id ?? (source === 'project-management' ? selectedProjectId : undefined);

  const {
    project,
    treeData,
    isLoading,
    isError,
    handleBack,
    handleCreatePR,
    handleCreatePRBundle,
    manualPrDialog,
    bundlePrDialog,
    closeManualPrDialog,
    closeBundlePrDialog,
    refetchBOQ,
  } = useBOQDetailPage({ projectId, source });

  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [costSectionRows, setCostSectionRows] = useState<Record<string, BOQExecutionCostRow[]>>({});
  const originalCostItemsRef = useRef<Record<string, unknown[]>>({});

  const { data: costData, isLoading: isCostLoading } = useProjectBOQItemCosts(
    projectId,
    detailNodeId ?? '',
    { enabled: !!detailNodeId && detailDialogOpen }
  );

  useEffect(() => {
    if (!costData?.data) return;
    setCostSectionRows((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      const initial: Record<string, BOQExecutionCostRow[]> = {};
      const originals: Record<string, unknown[]> = {};
      for (const category of costData.data.costs) {
        initial[category.category] = category.items.map((item) => ({
          id: item.id,
          catalogId: item.catalogId ?? undefined,
          code: item.code,
          name: item.name,
          vol_rab: item.volumeRab ? Number(item.volumeRab) : undefined,
          vol_cco: item.volumeCco ? Number(item.volumeCco) : undefined,
          vol_actual: item.volumeActual ? Number(item.volumeActual) : undefined,
          satuan: item.uom?.name ?? undefined,
          durasiSewa_rab: item.durationRab ? Number(item.durationRab) : undefined,
          durasiSewa_cco: item.durationCco ? Number(item.durationCco) : undefined,
          durasiSewa_actual: item.durationActual ? Number(item.durationActual) : undefined,
          durationUoM: item.durationUom?.name ?? undefined,
          hargaSatuan_rab: item.unitPriceRab ? Number(item.unitPriceRab) : undefined,
          hargaSatuan_cco: item.unitPriceCco ? Number(item.unitPriceCco) : undefined,
          hargaSatuan_actual: item.unitPriceActual ? Number(item.unitPriceActual) : undefined,
        }));
        originals[category.category] = category.items;
      }
      originalCostItemsRef.current = originals;
      return initial;
    });
  }, [costData]);

  const detailNode = useMemo(() => {
    if (!detailNodeId) return null;
    function findById(nodes: BOQDetailRow[]): BOQDetailRow | null {
      for (const n of nodes) {
        if (n.id === detailNodeId) return n;
        if (n.children) {
          const found = findById(n.children);
          if (found) return found;
        }
      }
      return null;
    }
    return findById(treeData);
  }, [detailNodeId, treeData]);

  const costSections = useMemo<BOQExecutionCostSection[]>(() => {
    const categories = costData?.data?.costs ?? [];
    if (categories.length === 0) return [];
    return categories.map((cat) => ({
      value: cat.category,
      label: cat.categoryName,
      rows: costSectionRows[cat.category] ?? [],
    }));
  }, [costData, costSectionRows]);

  const handleViewCost = useCallback((row: BOQDetailRow) => {
    if (!row.isFinalLevel) return;
    setDetailNodeId(row.id);
    setCostSectionRows({});
    originalCostItemsRef.current = {};
    setDetailDialogOpen(true);
  }, []);

  const handleDetailDialogOpenChange = useCallback((open: boolean) => {
    setDetailDialogOpen(open);
    if (!open) {
      setDetailNodeId(null);
      setCostSectionRows({});
      originalCostItemsRef.current = {};
    }
  }, []);

  // PR actions (Create PR / Create PR Bundle) only exist once the project has started.
  const isProjectStarted = project?.startedAt != null;

  const informasiLabels: InformasiProjectCardLabels = {
    TITLE: BOQ_DETAIL_PAGE_LABELS.INFORMATION_CARD.TITLE,
    LABELS: BOQ_DETAIL_PAGE_LABELS.INFORMATION_CARD.LABELS,
  };

  const contextMenu = useCallback(
    (row: Row<BOQDetailRow>) => {
      const isLastLevel = row.original.isFinalLevel;
      return isLastLevel ? (
        <ContextMenuItem onClick={() => handleCreatePR(row.original)}>
          <FileText /> {BOQ_DETAIL_PAGE_LABELS.CONTEXT_MENU.CREATE_PR}
        </ContextMenuItem>
      ) : (
        <ContextMenuItem onClick={() => handleCreatePRBundle(row.original)}>
          <Boxes /> {BOQ_DETAIL_PAGE_LABELS.CONTEXT_MENU.CREATE_PR_BUNDLE}
        </ContextMenuItem>
      );
    },
    [handleCreatePR, handleCreatePRBundle]
  );

  const boqDetailLabels = useMemo(
    () => ({
      title: BOQ_DETAIL_PAGE_LABELS.TABLE.TITLE,
      searchPlaceholder: BOQ_DETAIL_PAGE_LABELS.TABLE.SEARCH_PLACEHOLDER,
      emptyMessage: BOQ_DETAIL_PAGE_LABELS.TABLE.EMPTY,
      kode: BOQ_DETAIL_PAGE_LABELS.TABLE.KODE,
      viewCost: BOQ_DETAIL_PAGE_LABELS.TABLE.VIEW_COST,
      jobItem: BOQ_DETAIL_PAGE_LABELS.TABLE.JOB_ITEM,
      jenis: BOQ_DETAIL_PAGE_LABELS.TABLE.JENIS,
      volume: BOQ_DETAIL_PAGE_LABELS.TABLE.VOLUME,
      rab: BOQ_DETAIL_PAGE_LABELS.TABLE.RAB,
      cco: BOQ_DETAIL_PAGE_LABELS.TABLE.CCO,
      act: BOQ_DETAIL_PAGE_LABELS.TABLE.ACT,
      uom: BOQ_DETAIL_PAGE_LABELS.TABLE.UOM,
      amount: BOQ_DETAIL_PAGE_LABELS.TABLE.AMOUNT,
      amountRab: BOQ_DETAIL_PAGE_LABELS.TABLE.AMOUNT_RAB,
    }),
    []
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <FormPageSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <ItemNotFound
          message="Gagal memuat data BOQ."
          onBack={showBackButton ? handleBack : undefined}
        />
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="p-6">
        <ItemNotFound message="Project belum dipilih." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={project?.name ?? BOQ_DETAIL_PAGE_LABELS.PAGE_TITLE}
        onBack={showBackButton ? handleBack : undefined}
      />

      {/* Informasi Project */}
      {project && (
        <InformasiProjectCard
          financials={{
            totalValue: project.totalValue,
            limitBudgetPercentage: project.limitBudgetPercentage,
            totalValueCco: project.totalValueCco,
          }}
          labels={informasiLabels}
          project={project}
        />
      )}

      {/* Detail Project / Tree Table */}
      <BOQDetail
        value={treeData}
        labels={boqDetailLabels}
        contextMenu={isProjectStarted ? contextMenu : undefined}
        onViewCost={handleViewCost}
        showSingleAmount={false}
      />

      {/* Rating Manpower Project */}
      {project && <ProjectManpowerRatingSection key={projectId} projectId={projectId} />}

      {project && (
        <>
          <PurchaseRequestManualDialog
            boqItemId={manualPrDialog.boqItemId}
            itemName={manualPrDialog.itemName}
            projectId={projectId}
            companyId={project.company.id}
            open={manualPrDialog.open}
            onOpenChange={(open) => !open && closeManualPrDialog()}
            onCreated={refetchBOQ}
          />
          <PurchaseRequestBundleDialog
            boqItemId={bundlePrDialog.boqItemId}
            projectId={projectId}
            companyId={project.company.id}
            open={bundlePrDialog.open}
            onOpenChange={(open) => !open && closeBundlePrDialog()}
            onCreated={refetchBOQ}
          />
          <BOQExecutionCostDialog
            node={detailNode ? ({ id: detailNode.id, name: detailNode.name } as any) : null}
            open={detailDialogOpen}
            onOpenChange={handleDetailDialogOpenChange}
            sections={costSections}
            isLoading={isCostLoading}
          />
        </>
      )}
    </div>
  );
}
