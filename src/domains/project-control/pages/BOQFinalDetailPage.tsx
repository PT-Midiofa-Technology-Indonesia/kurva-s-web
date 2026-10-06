'use client';

import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useItemCatalogsInfinite } from '@/domains/item-master';
import { useJobItemTypesInfinite } from '@/domains/job-item-type/hooks/use-job-item-types-infinite';
import { useSkillCatalogsInfinite } from '@/domains/skill-master';
import { useUomsInfinite } from '@/domains/uom/hooks/use-uoms-infinite';
import { Button } from '@/shared/components/atoms/Button';
import { ItemNotFound } from '@/shared/components/molecules';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { FormPageSkeleton } from '@/shared/components/templates';
import { BOQFinalResume } from '@/shared/components/templates/BOQ/BOQFinal/BOQFinalResume';
import { BOQPlanningCostDialog } from '@/shared/components/templates/BOQ/BOQPlanning/BOQPlanningCostDialog';
import { BOQPlanningDetail } from '@/shared/components/templates/BOQ/BOQPlanning/BOQPlanningDetail';
import type {
  BOQPlanningCostRow,
  BOQPlanningCostSection,
} from '@/shared/components/templates/BOQ/BOQPlanning/boq-planning-cost.types';
import type {
  BOQResumeEquipmentRow,
  BOQResumeMaterialRow,
} from '@/shared/components/templates/BOQ/BOQPlanning/boq-resume.types';
import type { BOQPlanningNode } from '@/shared/components/templates/BOQ/types/boq-planning.types';
import { DEFAULT_MAX_DEPTH } from '@/shared/components/templates/BOQ/types/boq-tree.types';
import { ProjectBOQInfoCard } from '../components/ProjectBOQInfoCard';
import { BOQ_PLANNING_PAGE_LABELS } from '../constants';
import { useProjectBOQ, useProjectBOQCatalogPrices, useProjectBOQItemCosts } from '../hooks';

interface BOQFinalPageProps {
  projectId: string;
  initialTab?: string;
}

interface ApiItem {
  id: string;
  name: string;
  jobItemTypeId?: string;
  jobItemType?: { id: string; name: string };
  weight?: string | number | null;
  isFinalLevel?: boolean;
  volumeRab?: string | number | null;
  volumeCco?: string | number | null;
  volumeActual?: string | number | null;
  uomId?: string | null;
  uom?: { id: string; code: string; name: string } | null;
  unitPriceMaterialRab?: string | number | null;
  unitPriceWorkRab?: string | number | null;
  totalPriceMaterialRab?: string | number | null;
  totalPriceWorkRab?: string | number | null;
  totalAmountRab?: string | number | null;
  remarks?: string | null;
  sortOrder?: number;
  limitBudgetPercentage?: string | number | null;
  isActive?: boolean;
  children?: ApiItem[];
}

function mapApiItemsToNodes(items: ApiItem[]): BOQPlanningNode[] {
  return items.map((item) => {
    const isLeaf = item.isFinalLevel;
    const volumeRab = item.volumeRab ? Number(item.volumeRab) : undefined;
    const unitPriceMaterialRab = item.unitPriceMaterialRab
      ? Number(item.unitPriceMaterialRab)
      : undefined;
    const unitPriceWorkRab = item.unitPriceWorkRab ? Number(item.unitPriceWorkRab) : undefined;
    const computedTotalPriceMaterialRab =
      isLeaf && volumeRab != null && unitPriceMaterialRab != null
        ? volumeRab * unitPriceMaterialRab
        : undefined;
    const computedTotalPriceWorkRab =
      isLeaf && volumeRab != null && unitPriceWorkRab != null
        ? volumeRab * unitPriceWorkRab
        : undefined;
    return {
      id: item.id,
      name: item.name,
      jenis: item.jobItemType?.name ?? '',
      jobItemTypeId: item.jobItemType?.id ?? item.jobItemTypeId ?? '',
      bobot: item.weight ? Number(item.weight) : null,
      isFinalLevel: item.isFinalLevel,
      volume: { rab: volumeRab, uom: undefined },
      uomId: item.uomId ?? undefined,
      uomLabel: item.uom?.name ?? undefined,
      unitPrices: {
        material: {
          materialRab: unitPriceMaterialRab,
          workRab: unitPriceWorkRab,
        },
        work: {
          materialRab: item.totalPriceMaterialRab
            ? Number(item.totalPriceMaterialRab)
            : computedTotalPriceMaterialRab,
          workRab: item.totalPriceWorkRab
            ? Number(item.totalPriceWorkRab)
            : computedTotalPriceWorkRab,
        },
      },
      amount: { rab: item.totalAmountRab ? Number(item.totalAmountRab) : undefined },
      remarks: item.remarks ?? undefined,
      children: mapApiItemsToNodes(item.children ?? []),
    };
  });
}

export function BOQFinalPage({ projectId, initialTab }: BOQFinalPageProps) {
  const router = useRouter();
  const { data: response, isLoading, error } = useProjectBOQ(projectId);

  const [uomSearch, setUomSearch] = useState('');
  const [jenisSearch, setJenisSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [manpowerSearch, setManpowerSearch] = useState('');

  const {
    options: uomOptions,
    hasMore: uomHasMore,
    loadMore: loadMoreUom,
  } = useUomsInfinite({ isActive: true, search: uomSearch });

  const {
    options: jenisOptions,
    hasMore: jenisHasMore,
    loadMore: loadMoreJenis,
  } = useJobItemTypesInfinite({ isActive: true, search: jenisSearch });

  const {
    items: materialItems,
    options: materialOptions,
    hasMore: materialHasMore,
    loadMore: loadMoreMaterial,
  } = useItemCatalogsInfinite({ isActive: true, search: materialSearch });

  const {
    items: equipmentItems,
    options: equipmentOptions,
    hasMore: equipmentHasMore,
    loadMore: loadMoreEquipment,
  } = useItemCatalogsInfinite({ isActive: true, search: equipmentSearch });

  const {
    items: manpowerItems,
    options: manpowerOptions,
    hasMore: manpowerHasMore,
    loadMore: loadMoreManpower,
  } = useSkillCatalogsInfinite({ isActive: true, search: manpowerSearch });

  const getUomItemById = useMemo(() => {
    const map = new Map(uomOptions.map((o) => [o.value, o]));
    return (id: string) => map.get(id);
  }, [uomOptions]);

  const getMaterialItemById = useMemo(() => {
    const map = new Map(materialItems.map((i) => [i.id, i]));
    return (id: string) => {
      const item = map.get(id);
      return item ? { code: item.code, name: item.name, uom: item.uom ?? undefined } : undefined;
    };
  }, [materialItems]);

  const getEquipmentItemById = useMemo(() => {
    const map = new Map(equipmentItems.map((i) => [i.id, i]));
    return (id: string) => {
      const item = map.get(id);
      return item ? { code: item.code, name: item.name, uom: item.uom ?? undefined } : undefined;
    };
  }, [equipmentItems]);

  const getManpowerItemById = useMemo(() => {
    const map = new Map(manpowerItems.map((i) => [i.id, i]));
    return (id: string) => {
      const item = map.get(id);
      return item ? { code: item.code, name: item.name } : undefined;
    };
  }, [manpowerItems]);

  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [costSectionRows, setCostSectionRows] = useState<Record<string, BOQPlanningCostRow[]>>({});
  const originalCostItemsRef = useRef<Record<string, any[]>>({});

  const { data: costData, isLoading: isCostLoading } = useProjectBOQItemCosts(
    projectId,
    detailNodeId ?? '',
    { enabled: !!detailNodeId && detailDialogOpen }
  );

  useEffect(() => {
    if (!costData?.data) return;
    setCostSectionRows((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      const initial: Record<string, BOQPlanningCostRow[]> = {};
      const originals: Record<string, any[]> = {};
      for (const category of costData.data.costs) {
        initial[category.category] = category.items.map((item) => ({
          id: item.id,
          catalogId: item.catalogId ?? undefined,
          code: item.code,
          name: item.name,
          vol: item.volumeRab ? Number(item.volumeRab) : undefined,
          satuan: item.uom?.name ?? undefined,
          uomId: item.uomId ?? undefined,
          durasiSewa: item.durationRab ? Number(item.durationRab) : undefined,
          durationUoM: item.durationUom?.name ?? undefined,
          durationUomId: item.durationUomId ?? undefined,
          hargaSatuan: item.unitPriceRab ? Number(item.unitPriceRab) : undefined,
        }));
        originals[category.category] = category.items;
      }
      originalCostItemsRef.current = originals;
      return initial;
    });
  }, [costData]);

  const data = response;
  const project = data?.project;

  const initialTreeData = useMemo(() => {
    if (!data?.boq?.items) return [];
    return mapApiItemsToNodes(data.boq.items as ApiItem[]);
  }, [data]);

  const [treeData, setTreeData] = useState<BOQPlanningNode[]>([]);

  useEffect(() => {
    if (initialTreeData.length > 0 && treeData.length === 0) {
      setTreeData(initialTreeData);
    }
  }, [initialTreeData, treeData.length]);

  const currentTree = treeData.length > 0 ? treeData : initialTreeData;

  const handleOpenDetail = useCallback((node: BOQPlanningNode) => {
    setDetailNodeId(node.id);
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

  const handleCostSectionRowsChange = useCallback(
    (sectionValue: string, rows: BOQPlanningCostRow[]) => {
      setCostSectionRows((prev) => ({ ...prev, [sectionValue]: rows }));
    },
    []
  );

  const detailNode = useMemo(() => {
    if (!detailNodeId) return null;
    const findNodeById = (nodes: BOQPlanningNode[], id: string): BOQPlanningNode | null => {
      for (const n of nodes) {
        if (n.id === id) return n;
        const found = findNodeById(n.children, id);
        if (found) return found;
      }
      return null;
    };
    return findNodeById(currentTree, detailNodeId);
  }, [detailNodeId, currentTree]);

  const [resumeOpen, setResumeOpen] = useState(false);

  const { data: catalogPricesData } = useProjectBOQCatalogPrices(projectId, {
    enabled: resumeOpen,
  });

  const resumeMaterialRows = useMemo<BOQResumeMaterialRow[]>(() => {
    if (!catalogPricesData) return [];
    const rows: BOQResumeMaterialRow[] = [];
    for (const m of catalogPricesData.resumeMaterialCost) {
      if (!m.materialCost || !m.transportCost) continue;
      rows.push({
        id: m.materialCost.id,
        code: m.code,
        name: m.name,
        vol: m.volumeRab != null ? Number(m.volumeRab) : undefined,
        satuan: m.uom?.name ?? undefined,
        materialOriginal:
          m.materialCost.originalPriceRab != null
            ? Number(m.materialCost.originalPriceRab)
            : undefined,
        materialMarkup:
          m.materialCost.markupPercentageRab != null
            ? Number(m.materialCost.markupPercentageRab)
            : undefined,
        materialUnitPriceOverride:
          m.materialCost.unitPriceRab != null ? Number(m.materialCost.unitPriceRab) : undefined,
        totalMaterialOverride:
          m.totalCostMaterial != null ? Number(m.totalCostMaterial) : undefined,
        transportOriginal:
          m.transportCost.originalPriceRab != null
            ? Number(m.transportCost.originalPriceRab)
            : undefined,
        transportMarkup:
          m.transportCost.markupPercentageRab != null
            ? Number(m.transportCost.markupPercentageRab)
            : undefined,
        transportUnitPriceOverride:
          m.transportCost.unitPriceRab != null ? Number(m.transportCost.unitPriceRab) : undefined,
        totalTransportOverride:
          m.totalCostTransport != null ? Number(m.totalCostTransport) : undefined,
        amountOverride: m.amount != null ? Number(m.amount) : undefined,
      });
    }
    return rows;
  }, [catalogPricesData]);

  const resumeEquipmentRows = useMemo<BOQResumeEquipmentRow[]>(() => {
    if (!catalogPricesData) return [];
    const rows: BOQResumeEquipmentRow[] = [];
    for (const e of catalogPricesData.resumeEquipmentCost) {
      if (!e.equipmentCost || !e.transportCost) continue;
      rows.push({
        id: e.equipmentCost.id,
        code: e.code,
        name: e.name,
        vol: e.volumeRab != null ? Number(e.volumeRab) : undefined,
        satuan: e.uom?.name ?? undefined,
        duration: e.durationRab != null ? Number(e.durationRab) : undefined,
        durationUoM: e.durationUom?.name ?? undefined,
        equipmentOriginal:
          e.equipmentCost.originalPriceRab != null
            ? Number(e.equipmentCost.originalPriceRab)
            : undefined,
        equipmentMarkup:
          e.equipmentCost.markupPercentageRab != null
            ? Number(e.equipmentCost.markupPercentageRab)
            : undefined,
        equipmentUnitPriceOverride:
          e.equipmentCost.unitPriceRab != null ? Number(e.equipmentCost.unitPriceRab) : undefined,
        totalEquipmentOverride:
          e.totalCostEquipment != null ? Number(e.totalCostEquipment) : undefined,
        transportOriginal:
          e.transportCost.originalPriceRab != null
            ? Number(e.transportCost.originalPriceRab)
            : undefined,
        transportMarkup:
          e.transportCost.markupPercentageRab != null
            ? Number(e.transportCost.markupPercentageRab)
            : undefined,
        transportUnitPriceOverride:
          e.transportCost.unitPriceRab != null ? Number(e.transportCost.unitPriceRab) : undefined,
        totalTransportOverride:
          e.totalCostTransport != null ? Number(e.totalCostTransport) : undefined,
        amountOverride: e.amount != null ? Number(e.amount) : undefined,
      });
    }
    return rows;
  }, [catalogPricesData]);

  const costSections = useMemo<BOQPlanningCostSection[]>(() => {
    const categories = costData?.data?.costs ?? [];

    const uomAsyncSelect = {
      options: uomOptions,
      hasNextPage: uomHasMore,
      onSearch: setUomSearch,
      onScrollEnd: loadMoreUom,
      getItemById: getUomItemById,
    };

    const materialAsyncSelect = {
      options: materialOptions,
      hasNextPage: materialHasMore,
      onSearch: setMaterialSearch,
      onScrollEnd: loadMoreMaterial,
      getItemById: getMaterialItemById,
    };

    const equipmentAsyncSelect = {
      options: equipmentOptions,
      hasNextPage: equipmentHasMore,
      onSearch: setEquipmentSearch,
      onScrollEnd: loadMoreEquipment,
      getItemById: getEquipmentItemById,
    };

    const manpowerAsyncSelect = {
      options: manpowerOptions,
      hasNextPage: manpowerHasMore,
      onSearch: setManpowerSearch,
      onScrollEnd: loadMoreManpower,
      getItemById: getManpowerItemById,
    };

    const defaultSections: BOQPlanningCostSection[] = [
      {
        value: 'material_cost',
        label: 'Material Cost',
        rows: costSectionRows.material_cost ?? [],
        nameAsyncSelect: materialAsyncSelect,
        uomAsyncSelect,
        disabled: true,
      },
      {
        value: 'equipment_cost',
        label: 'Equipment Cost',
        rows: costSectionRows.equipment_cost ?? [],
        nameAsyncSelect: equipmentAsyncSelect,
        uomAsyncSelect,
        disabled: true,
      },
      {
        value: 'man_power_cost',
        label: 'Man Power Cost',
        rows: costSectionRows.man_power_cost ?? [],
        nameAsyncSelect: manpowerAsyncSelect,
        uomAsyncSelect,
        disabled: true,
      },
      {
        value: 'transport_cost',
        label: 'Transport Cost',
        rows: costSectionRows.transport_cost ?? [],
        disabled: true,
        infoBadge: { message: 'Data transport otomatis dibuat setelah menyimpan' },
      },
      {
        value: 'preliminery_cost',
        label: 'Preliminery Cost',
        rows: costSectionRows.preliminery_cost ?? [],
        disabled: true,
      },
    ];

    if (categories.length === 0) return defaultSections;

    return categories.map((cat) => {
      const rows = costSectionRows[cat.category] ?? [];
      if (cat.category === 'material_cost') {
        return {
          value: cat.category,
          label: cat.categoryName,
          rows,
          nameAsyncSelect: materialAsyncSelect,
          uomAsyncSelect,
          disabled: true,
        };
      }
      if (cat.category === 'equipment_cost') {
        return {
          value: cat.category,
          label: cat.categoryName,
          rows,
          nameAsyncSelect: equipmentAsyncSelect,
          uomAsyncSelect,
          disabled: true,
        };
      }
      if (cat.category === 'man_power_cost') {
        return {
          value: cat.category,
          label: cat.categoryName,
          rows,
          nameAsyncSelect: manpowerAsyncSelect,
          uomAsyncSelect,
          disabled: true,
        };
      }
      if (cat.category === 'transport_cost') {
        return {
          value: cat.category,
          label: cat.categoryName,
          rows,
          disabled: true,
          infoBadge: { message: 'Data transport otomatis dibuat setelah menyimpan' },
          uomAsyncSelect,
        };
      }
      return { value: cat.category, label: cat.categoryName, rows, uomAsyncSelect, disabled: true };
    });
  }, [
    costData,
    costSectionRows,
    uomOptions,
    uomHasMore,
    loadMoreUom,
    getUomItemById,
    materialOptions,
    materialHasMore,
    loadMoreMaterial,
    getMaterialItemById,
    equipmentOptions,
    equipmentHasMore,
    loadMoreEquipment,
    getEquipmentItemById,
    manpowerOptions,
    manpowerHasMore,
    loadMoreManpower,
    getManpowerItemById,
  ]);

  const handleBack = useCallback(() => {
    router.push(`/project-control/boq-management${initialTab ? `?tab=${initialTab}` : ''}`);
  }, [router, initialTab]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <FormPageSkeleton />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <ItemNotFound message="Data BOQ Final tidak ditemukan." />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="BOQ Final"
        onBack={handleBack}
        actions={
          <Button
            variant="default"
            size="md"
            leftIcon={<FileText className="w-4 h-4" />}
            onClick={() => setResumeOpen(true)}
          >
            {BOQ_PLANNING_PAGE_LABELS.lihatResume}
          </Button>
        }
      />
      <ProjectBOQInfoCard project={project} />
      <BOQPlanningDetail
        value={currentTree}
        onChange={setTreeData}
        readOnly={true}
        showComplete={false}
        title="BoQ Final"
        jenisOptions={[]}
        maxDepth={DEFAULT_MAX_DEPTH}
        onOpenDetail={handleOpenDetail}
        nonEditableTooltip="Data tidak dapat diubah!"
        jenisAsyncSelect={{
          options: jenisOptions,
          hasNextPage: jenisHasMore,
          onSearch: setJenisSearch,
          onScrollEnd: loadMoreJenis,
        }}
        uomAsyncSelect={{
          options: uomOptions,
          hasNextPage: uomHasMore,
          onSearch: setUomSearch,
          onScrollEnd: loadMoreUom,
          getItemById: getUomItemById,
        }}
      />
      <BOQPlanningCostDialog
        node={detailNode}
        open={detailDialogOpen}
        onOpenChange={handleDetailDialogOpenChange}
        sections={costSections}
        onSectionRowsChange={handleCostSectionRowsChange}
        readOnly={true}
        isLoading={isCostLoading}
      />
      <BOQFinalResume
        node={null}
        open={resumeOpen}
        onOpenChange={setResumeOpen}
        materialSection={{
          value: 'material_transport',
          label: 'Resume Material & Transportation Cost',
          rows: resumeMaterialRows,
        }}
        equipmentSection={{
          value: 'equipment',
          label: 'Resume Equipment Cost',
          rows: resumeEquipmentRows,
        }}
      />
    </div>
  );
}
