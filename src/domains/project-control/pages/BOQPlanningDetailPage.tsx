'use client';

import { useQueryClient } from '@tanstack/react-query';
import { FileText, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useItemCatalogsInfinite } from '@/domains/item-master';
import { useJobItemTypesInfinite } from '@/domains/job-item-type/hooks/use-job-item-types-infinite';
import { useSkillCatalogsInfinite } from '@/domains/skill-master';
import { useUomsInfinite } from '@/domains/uom/hooks/use-uoms-infinite';
import { useUomsInfiniteTime } from '@/domains/uom/hooks/use-uoms-infinite-time';
import { Button } from '@/shared/components/atoms/Button';
import { ItemNotFound } from '@/shared/components/molecules';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { FormPageSkeleton } from '@/shared/components/templates';
import { BOQPlanningCostDialog } from '@/shared/components/templates/BOQ/BOQPlanning/BOQPlanningCostDialog';
import { BOQPlanningDetail } from '@/shared/components/templates/BOQ/BOQPlanning/BOQPlanningDetail';
import { BOQPlanningResume } from '@/shared/components/templates/BOQ/BOQPlanning/BOQPlanningResume';
import type {
  BOQPlanningCostRow,
  BOQPlanningCostSection,
  CostSectionError,
} from '@/shared/components/templates/BOQ/BOQPlanning/boq-planning-cost.types';
import type {
  BOQResumeEquipmentRow,
  BOQResumeMaterialRow,
} from '@/shared/components/templates/BOQ/BOQPlanning/boq-resume.types';
import { computeUnitPrice } from '@/shared/components/templates/BOQ/BOQPlanning/boq-resume.utils';
import type { BOQPlanningNode } from '@/shared/components/templates/BOQ/types/boq-planning.types';
import {
  DEFAULT_JENIS_OPTIONS,
  DEFAULT_MAX_DEPTH,
} from '@/shared/components/templates/BOQ/types/boq-tree.types';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { collectAllIds, flattenTree } from '@/shared/utils/boq-tree-helpers';
import { downloadFile } from '@/shared/utils/file-download';
import { generateBOQQuotation } from '../api/generate-boq-quotation';
import type { BOQCatalogPriceEntry } from '../api/get-project-boq-catalog-prices';
import type { ProjectBOQCostItemDetail } from '../api/get-project-boq-item-costs';
import { getProjectBOQItemCosts } from '../api/get-project-boq-item-costs';
import { ProjectBOQInfoCard } from '../components/ProjectBOQInfoCard';
import { BOQ_PLANNING_PAGE_LABELS } from '../constants';
import {
  PROJECT_BOQ_ITEM_COSTS_QUERY_KEYS,
  useBOQItemsSuggestions,
  useProjectBOQ,
  useProjectBOQCatalogPrices,
  useProjectBOQItemCosts,
  useSyncProjectBOQItemCosts,
  useSyncProjectBOQItems,
  useUpdateProjectBOQ,
  useUpdateProjectBOQCatalogPrices,
} from '../hooks';

interface BOQPlanningPageProps {
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
  uomName?: string;
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
  suggestionItemId?: string | null;
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
    const uomName = item.uom?.name ?? item.uomName ?? undefined;
    return {
      id: item.id,
      name: item.name,
      jenis: item.jobItemType?.name ?? '',
      jobItemTypeId: item.jobItemType?.id ?? item.jobItemTypeId ?? '',
      bobot: item.weight ? Number(item.weight) : isLeaf ? 1 : null,
      isFinalLevel: item.isFinalLevel,
      volume: { rab: volumeRab, uom: uomName },
      uomId: item.uom?.id ?? item.uomId ?? undefined,
      uomLabel: uomName,
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
      suggestionItemId: item.suggestionItemId ?? null,
      children: mapApiItemsToNodes(item.children ?? []),
    };
  });
}

function walkOriginalItems(items: ApiItem[], map: Map<string, ApiItem>) {
  for (const item of items) {
    map.set(item.id, item);
    if (item.children && item.children.length > 0) walkOriginalItems(item.children, map);
  }
}

function buildResumeRows(catalogPricesData: BOQCatalogPriceEntry | undefined): {
  mRows: BOQResumeMaterialRow[];
  eRows: BOQResumeEquipmentRow[];
} {
  const mRows: BOQResumeMaterialRow[] = [];
  const eRows: BOQResumeEquipmentRow[] = [];
  if (!catalogPricesData) return { mRows, eRows };
  for (const m of catalogPricesData.resumeMaterialCost) {
    if (!m.materialCost || !m.transportCost) continue;
    mRows.push({
      id: m.materialCost.id,
      catalogId: m.catalogId,
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
      materialBaseUnitPrice:
        m.materialCost.originalPriceRab != null
          ? Number(m.materialCost.originalPriceRab)
          : undefined,
      materialUnitPriceOverride:
        m.materialCost.unitPriceRab != null ? Number(m.materialCost.unitPriceRab) : undefined,
      totalMaterialOverride: m.totalCostMaterial != null ? Number(m.totalCostMaterial) : undefined,
      transportOriginal:
        m.transportCost.originalPriceRab != null
          ? Number(m.transportCost.originalPriceRab)
          : undefined,
      transportMarkup:
        m.transportCost.markupPercentageRab != null
          ? Number(m.transportCost.markupPercentageRab)
          : undefined,
      transportBaseUnitPrice:
        m.transportCost.originalPriceRab != null
          ? Number(m.transportCost.originalPriceRab)
          : undefined,
      transportUnitPriceOverride:
        m.transportCost.unitPriceRab != null ? Number(m.transportCost.unitPriceRab) : undefined,
      totalTransportOverride:
        m.totalCostTransport != null ? Number(m.totalCostTransport) : undefined,
      amountOverride: m.amount != null ? Number(m.amount) : undefined,
    });
  }
  for (const e of catalogPricesData.resumeEquipmentCost) {
    if (!e.equipmentCost || !e.transportCost) continue;
    eRows.push({
      id: e.equipmentCost.id,
      catalogId: e.catalogId,
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
      equipmentBaseUnitPrice:
        e.equipmentCost.originalPriceRab != null
          ? Number(e.equipmentCost.originalPriceRab)
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
      transportBaseUnitPrice:
        e.transportCost.originalPriceRab != null
          ? Number(e.transportCost.originalPriceRab)
          : undefined,
      transportUnitPriceOverride:
        e.transportCost.unitPriceRab != null ? Number(e.transportCost.unitPriceRab) : undefined,
      totalTransportOverride:
        e.totalCostTransport != null ? Number(e.totalCostTransport) : undefined,
      amountOverride: e.amount != null ? Number(e.amount) : undefined,
    });
  }
  return { mRows, eRows };
}

export function BOQPlanningPage({ projectId, initialTab }: BOQPlanningPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: response, isLoading, error } = useProjectBOQ(projectId);
  const { mutateAsync: syncItems, isPending: isSaving } = useSyncProjectBOQItems(projectId);
  const { mutateAsync: updateProjectBOQMutation } = useUpdateProjectBOQ(projectId);

  const [uomSearch, setUomSearch] = useState('');
  const [uomSearchTime, setUomSearchTime] = useState('');

  const [suggestionParams, setSuggestionParams] = useState<{
    search?: string;
    level?: number;
  }>({});

  const {
    data: suggestionItems,
    isFetching: isFetchingSuggestions,
    refetch: refetchSuggestions,
  } = useBOQItemsSuggestions(
    {
      projectId,
      search: suggestionParams.search,
      level: suggestionParams.level,
    },
    Boolean(projectId && suggestionParams.level != null)
  );

  const suggestionTree = useMemo(() => {
    if (isFetchingSuggestions || !suggestionItems || suggestionItems.length === 0) return undefined;
    return mapApiItemsToNodes(suggestionItems as unknown as ApiItem[]);
  }, [isFetchingSuggestions, suggestionItems]);

  const handleNameSearch = useCallback(
    (search: string, level: number) => {
      setSuggestionParams((prev) => {
        if (prev.search === search && prev.level === level) {
          void refetchSuggestions();
          return prev;
        }
        return { search, level };
      });
    },
    [refetchSuggestions]
  );

  // General UoM for tree table volumen column
  const {
    options: uomOptions,
    hasMore: uomHasMore,
    loadMore: loadMoreUom,
  } = useUomsInfinite({ isActive: true, search: uomSearch });

  // Time-filtered UoM for cost dialog volume/duration UoM columns
  const {
    options: uomOptionsTime,
    hasMore: uomHasMoreTime,
    loadMore: loadMoreUomTime,
  } = useUomsInfiniteTime({ isActive: true, search: uomSearchTime });
  const [jenisSearch, setJenisSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [manpowerSearch, setManpowerSearch] = useState('');

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
  } = useItemCatalogsInfinite({ isActive: true, search: materialSearch, isAllocatable: false });

  const {
    items: equipmentItems,
    options: equipmentOptions,
    hasMore: equipmentHasMore,
    loadMore: loadMoreEquipment,
  } = useItemCatalogsInfinite({ isActive: true, search: equipmentSearch, isAllocatable: true });

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

  const getUomItemByIdTime = useMemo(() => {
    const map = new Map(uomOptionsTime.map((o) => [o.value, o]));
    return (id: string) => map.get(id);
  }, [uomOptionsTime]);

  const getMaterialItemById = useMemo(() => {
    const map = new Map(materialItems.map((i) => [i.id, i]));
    return (id: string) => {
      const item = map.get(id);
      return item
        ? {
            code: item.code,
            name: item.name,
            uom: item.uom ?? undefined,
            unitPrice: item.vendor?.price ?? 0,
          }
        : undefined;
    };
  }, [materialItems]);

  const getEquipmentItemById = useMemo(() => {
    const map = new Map(equipmentItems.map((i) => [i.id, i]));
    return (id: string) => {
      const item = map.get(id);
      return item
        ? {
            code: item.code,
            name: item.name,
            uom: item.uom ?? undefined,
            unitPrice: item.vendor?.price ?? 0,
          }
        : undefined;
    };
  }, [equipmentItems]);

  const getManpowerItemById = useMemo(() => {
    const map = new Map(manpowerItems.map((i) => [i.id, i]));
    return (id: string) => {
      const item = map.get(id);
      return item ? { code: item.code, name: item.name } : undefined;
    };
  }, [manpowerItems]);

  const [boqIsComplete, setBoqIsComplete] = useState(false);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [costSectionRows, setCostSectionRows] = useState<Record<string, BOQPlanningCostRow[]>>({});
  const originalCostItemsRef = useRef<Record<string, ProjectBOQCostItemDetail[]>>({});

  const { data: costData, isLoading: isCostLoading } = useProjectBOQItemCosts(
    projectId,
    detailNodeId ?? '',
    { enabled: !!detailNodeId && detailDialogOpen }
  );

  const { mutateAsync: syncCostItems, isPending: isSavingCost } = useSyncProjectBOQItemCosts(
    projectId,
    detailNodeId ?? ''
  );

  useEffect(() => {
    if (!costData?.data) return;
    setCostSectionRows((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      const initial: Record<string, BOQPlanningCostRow[]> = {};
      const originals: Record<string, ProjectBOQCostItemDetail[]> = {};
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
          keterangan: item.remarks ?? undefined,
        }));
        originals[category.category] = category.items;
      }
      originalCostItemsRef.current = originals;
      return initial;
    });
  }, [costData]);

  const data = response;
  const project = data?.project;
  const boq = data?.boq;

  // Sync isRabComplete from API data
  useEffect(() => {
    if (boq?.isRabComplete != null) {
      setBoqIsComplete(boq.isRabComplete);
    }
  }, [boq?.isRabComplete]);

  const originalItemsMap = useMemo(() => {
    const map = new Map<string, ApiItem>();
    if (!data?.boq?.items) return map;
    walkOriginalItems(data.boq.items as ApiItem[], map);
    return map;
  }, [data]);

  const originalIdsRef = useRef<Set<string>>(new Set());
  const [treeData, setTreeData] = useState<BOQPlanningNode[] | null>(null);
  const hasSavedRef = useRef(false);

  const initialTreeData = useMemo(() => {
    if (!data?.boq?.items) return [];
    return mapApiItemsToNodes(data.boq.items as ApiItem[]);
  }, [data]);

  // Sync originalIdsRef whenever server data refreshes (including after save+refetch)
  useEffect(() => {
    if (initialTreeData.length === 0) return;
    originalIdsRef.current = collectAllIds(initialTreeData);
    // Clear local draft tree only after a save-triggered refetch
    if (hasSavedRef.current) {
      hasSavedRef.current = false;
      setTreeData(null);
    }
  }, [initialTreeData]);

  const currentTree = treeData ?? initialTreeData;
  const savedNodeIds = useMemo(() => collectAllIds(initialTreeData), [initialTreeData]);

  const handleTreeChange = useCallback((next: BOQPlanningNode[]) => {
    setTreeData(next);
  }, []);

  const jobItemTypeLabelToId = useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of jenisOptions) {
      map.set(opt.label, opt.value);
      map.set(opt.value, opt.value);
    }
    return map;
  }, [jenisOptions]);

  const handleSave = useCallback(async () => {
    if (!data?.boq) return;
    const currentIds = collectAllIds(currentTree);
    const deletedIds = Array.from(originalIdsRef.current).filter((id) => !currentIds.has(id));
    const items = flattenTree(
      currentTree,
      null,
      null,
      originalItemsMap as Map<string, { jobItemType: { id: string } }>,
      originalIdsRef.current,
      (node, original) => {
        const mapped = jobItemTypeLabelToId.get(node.jenis);
        if (mapped) return mapped;
        return original?.jobItemType.id ?? '';
      }
    ).map(({ weight: _weight, ...flat }) => {
      // Lookup by id (existing) or tempId (new draft)
      const lookupId = flat.id ?? flat.tempId;
      const nodeFromTree = lookupId ? findNodeById(currentTree, lookupId) : null;
      return {
        ...flat,
        // weight tidak dibawa ke payload save (bobot readonly di BOQ Planning)
        // weight: nodeFromTree?.bobot ?? flat.weight,
        limitBudgetPercentage: null,
        volumeRab: nodeFromTree?.volume?.rab ?? null,
        volumeCco: null,
        volumeActual: null,
        uomId: nodeFromTree?.uomId ?? null,
        remarks: nodeFromTree?.remarks ?? null,
        suggestionItemId: nodeFromTree?.suggestionItemId ?? flat.suggestionItemId ?? null,
      };
    });
    await syncItems({ items, deletedIds });
    hasSavedRef.current = true;
    // originalIdsRef and treeData are reset in the useEffect above
    // once the invalidated query refetches with the new server data
  }, [data, currentTree, originalItemsMap, jobItemTypeLabelToId, syncItems]);

  const handleToggleComplete = useCallback(async () => {
    if (!boq?.id) return;
    const next = !boqIsComplete;
    await updateProjectBOQMutation({
      boqId: boq.id,
      payload: { isRabComplete: next },
    });
  }, [boq?.id, boqIsComplete, updateProjectBOQMutation]);

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

  const [sectionErrors, setSectionErrors] = useState<Record<string, CostSectionError>>({});

  const handleSaveCostItems = useCallback(async () => {
    if (!detailNodeId) return;
    setSectionErrors({});
    const apiCategories = costData?.data?.costs ?? [];

    const apiCategoryKeys = new Set(apiCategories.map((cat) => cat.category));
    const sectionKeys = Object.keys(costSectionRows);
    const allCategoryKeys = [...new Set([...apiCategoryKeys, ...sectionKeys])];

    const categories = allCategoryKeys
      .map((categoryKey) => {
        const currentRows = costSectionRows[categoryKey] ?? [];
        const originalItems = originalCostItemsRef.current[categoryKey] ?? [];
        const originalIds = new Set(originalItems.map((i) => i.id));
        const currentIds = new Set(currentRows.map((r) => r.id));
        const deletedIds = originalItems.filter((i) => !currentIds.has(i.id)).map((i) => i.id);
        const isTransportCategory = categoryKey === 'transport_cost';
        const items = currentRows.map((row) => {
          const isExisting = originalIds.has(row.id);
          const base = {
            ...(row.catalogId ? { catalogId: row.catalogId } : {}),
            code: row.code,
            name: row.name,
            ...(isTransportCategory ? {} : { volumeRab: row.vol }),
            uomId: row.uomId ?? null,
            durationRab: row.durasiSewa,
            durationUomId: row.durationUomId ?? null,
            unitPriceRab: row.hargaSatuan,
            remarks: row.keterangan ?? null,
          };
          if (isExisting) {
            return { id: row.id, ...base };
          }
          return { id: null, ...base };
        });
        return { costCategory: categoryKey, items, deletedIds };
      })
      .filter((c) => c.items.length > 0 || c.deletedIds.length > 0);

    try {
      await syncCostItems({ categories });
      setSectionErrors({});
      // Fetch fresh cost data & populate rows directly
      const freshData = await queryClient.fetchQuery({
        queryKey: PROJECT_BOQ_ITEM_COSTS_QUERY_KEYS.detail(projectId, detailNodeId!),
        queryFn: () => getProjectBOQItemCosts(projectId, detailNodeId!),
      });
      if (!freshData?.data) return;
      const newRows: Record<string, BOQPlanningCostRow[]> = {};
      const newOriginals: Record<string, ProjectBOQCostItemDetail[]> = {};
      for (const category of freshData.data!.costs) {
        newRows[category.category] = category.items.map((item) => ({
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
          keterangan: item.remarks ?? undefined,
        }));
        newOriginals[category.category] = category.items;
      }
      setCostSectionRows(newRows);
      originalCostItemsRef.current = newOriginals;
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      const genericMsg = getErrorMessage(error);
      if (fieldErrors) {
        // Parse BE fieldErrors: "categories.{idx}.items.{rowIdx}.{field}" or "categories.{idx}.items"
        const parsed: Record<string, CostSectionError> = {};
        for (const [path, msgs] of Object.entries(fieldErrors)) {
          // path = "categories.0.items.0.catalogId" or "categories.1.items"
          const parts = path.split('.');
          const catIdx = parseInt(parts[1], 10);
          const categoryKey = allCategoryKeys[catIdx];
          if (!categoryKey) continue;
          if (!parsed[categoryKey]) parsed[categoryKey] = { tableErrors: [], rowErrors: {} };

          // categories.{idx}.items → table-level error
          if (parts.length === 3 && parts[2] === 'items') {
            parsed[categoryKey].tableErrors.push(...msgs);
          }
          // categories.{idx}.items.{rowIdx}.{field} → row-level error
          if (parts.length === 5 && parts[2] === 'items') {
            const rowIdx = parseInt(parts[3], 10);
            if (!parsed[categoryKey].rowErrors[rowIdx]) parsed[categoryKey].rowErrors[rowIdx] = [];
            parsed[categoryKey].rowErrors[rowIdx].push(...msgs);
          }
        }
        setSectionErrors(parsed);
      }
      toast.error({ title: genericMsg });
    }
  }, [detailNodeId, costData, costSectionRows, syncCostItems, projectId, queryClient]);

  const detailNode = useMemo(() => {
    if (!detailNodeId) return null;
    return findNodeById(currentTree, detailNodeId);
  }, [detailNodeId, currentTree]);

  const [resumeOpen, setResumeOpen] = useState(false);
  const [editResumeMaterialRows, setEditResumeMaterialRows] = useState<BOQResumeMaterialRow[]>(
    () => []
  );
  const [editResumeEquipmentRows, setEditResumeEquipmentRows] = useState<BOQResumeEquipmentRow[]>(
    () => []
  );
  const resumeDataReadyRef = useRef(false);
  const originalResumeMaterialRowsRef = useRef<BOQResumeMaterialRow[]>([]);
  const originalResumeEquipmentRowsRef = useRef<BOQResumeEquipmentRow[]>([]);

  const { data: catalogPricesData, refetch: refetchCatalogPrices } = useProjectBOQCatalogPrices(
    projectId,
    { enabled: resumeOpen }
  );

  // Populate editable rows from API data when first loaded
  useEffect(() => {
    if (!catalogPricesData || resumeDataReadyRef.current) return;
    const { mRows, eRows } = buildResumeRows(catalogPricesData);
    setEditResumeMaterialRows(mRows);
    setEditResumeEquipmentRows(eRows);
    originalResumeMaterialRowsRef.current = mRows;
    originalResumeEquipmentRowsRef.current = eRows;
    resumeDataReadyRef.current = true;
  }, [catalogPricesData]);

  const hasResumeChanges = useMemo(
    () =>
      JSON.stringify(editResumeMaterialRows) !==
        JSON.stringify(originalResumeMaterialRowsRef.current) ||
      JSON.stringify(editResumeEquipmentRows) !==
        JSON.stringify(originalResumeEquipmentRowsRef.current),
    [editResumeMaterialRows, editResumeEquipmentRows]
  );

  const { mutateAsync: updateCatalogPrices, isPending: isUpdatingCatalogPrices } =
    useUpdateProjectBOQCatalogPrices(projectId);

  const handleSaveResume = useCallback(async () => {
    const prices: Array<{
      catalogId: string;
      materialCost?: {
        originalPriceRab?: number;
        markupPercentageRab?: number;
        unitPriceRab?: number;
      };
      equipmentCost?: {
        originalPriceRab?: number;
        markupPercentageRab?: number;
        unitPriceRab?: number;
      };
      transportCost?: {
        originalPriceRab?: number;
        markupPercentageRab?: number;
        unitPriceRab?: number;
      };
    }> = [];

    for (const row of editResumeMaterialRows) {
      if (!row.catalogId) continue;
      const item: (typeof prices)[number] = { catalogId: row.catalogId };
      if (row.materialOriginal != null || row.materialMarkup != null) {
        const unitPrice = computeUnitPrice(
          row.materialBaseUnitPrice,
          row.materialOriginal,
          row.materialMarkup
        );
        item.materialCost = {
          ...(row.materialOriginal != null && { originalPriceRab: row.materialOriginal }),
          ...(row.materialMarkup != null && { markupPercentageRab: row.materialMarkup }),
          ...(unitPrice != null && { unitPriceRab: unitPrice }),
        };
      }
      if (row.transportOriginal != null || row.transportMarkup != null) {
        const unitPrice = computeUnitPrice(
          row.transportBaseUnitPrice,
          row.transportOriginal,
          row.transportMarkup
        );
        item.transportCost = {
          ...(row.transportOriginal != null && { originalPriceRab: row.transportOriginal }),
          ...(row.transportMarkup != null && { markupPercentageRab: row.transportMarkup }),
          ...(unitPrice != null && { unitPriceRab: unitPrice }),
        };
      }
      prices.push(item);
    }

    for (const row of editResumeEquipmentRows) {
      if (!row.catalogId) continue;
      const item: (typeof prices)[number] = { catalogId: row.catalogId };
      if (row.equipmentOriginal != null || row.equipmentMarkup != null) {
        const unitPrice = computeUnitPrice(
          row.equipmentBaseUnitPrice,
          row.equipmentOriginal,
          row.equipmentMarkup
        );
        item.equipmentCost = {
          ...(row.equipmentOriginal != null && { originalPriceRab: row.equipmentOriginal }),
          ...(row.equipmentMarkup != null && { markupPercentageRab: row.equipmentMarkup }),
          ...(unitPrice != null && { unitPriceRab: unitPrice }),
        };
      }
      if (row.transportOriginal != null || row.transportMarkup != null) {
        const unitPrice = computeUnitPrice(
          row.transportBaseUnitPrice,
          row.transportOriginal,
          row.transportMarkup
        );
        item.transportCost = {
          ...(row.transportOriginal != null && { originalPriceRab: row.transportOriginal }),
          ...(row.transportMarkup != null && { markupPercentageRab: row.transportMarkup }),
          ...(unitPrice != null && { unitPriceRab: unitPrice }),
        };
      }
      prices.push(item);
    }

    if (prices.length === 0) {
      toast.warning({ title: 'Tidak ada data yang diubah.' });
      return;
    }

    await updateCatalogPrices({ prices });
    const { data: freshCatalogPricesData } = await refetchCatalogPrices();
    const { mRows, eRows } = buildResumeRows(freshCatalogPricesData);
    setEditResumeMaterialRows(mRows);
    setEditResumeEquipmentRows(eRows);
    originalResumeMaterialRowsRef.current = mRows;
    originalResumeEquipmentRowsRef.current = eRows;
  }, [editResumeMaterialRows, editResumeEquipmentRows, updateCatalogPrices, refetchCatalogPrices]);

  const handleGenerateQuotation = useCallback(async () => {
    try {
      toast.progress('boq-quotation-download', {
        title: 'Mengunduh quotation... 0%',
        percent: 0,
      });
      const blob = await generateBOQQuotation(projectId, (percent) => {
        toast.progress('boq-quotation-download', {
          title: `Mengunduh quotation... ${percent}%`,
          percent,
        });
      });
      toast.dismiss('boq-quotation-download');
      downloadFile(blob, `boq-quotation-${projectId}.xlsx`);
      toast.success({ title: 'Quotation berhasil diunduh' });
    } catch {
      toast.dismiss('boq-quotation-download');
      toast.error({ title: 'Gagal mengunduh quotation' });
    }
  }, [projectId]);

  const resumeMaterialRows = useMemo<BOQResumeMaterialRow[]>(() => {
    if (!catalogPricesData) return [];
    return editResumeMaterialRows;
  }, [catalogPricesData, editResumeMaterialRows]);

  const resumeEquipmentRows = useMemo<BOQResumeEquipmentRow[]>(() => {
    if (!catalogPricesData) return [];
    return editResumeEquipmentRows;
  }, [catalogPricesData, editResumeEquipmentRows]);

  const costSections = useMemo<BOQPlanningCostSection[]>(() => {
    const categories = costData?.data?.costs ?? [];

    // Volume UoM (satuan column) — general list, no groupType filter
    const uomAsyncSelect = {
      options: uomOptions,
      hasNextPage: uomHasMore,
      onSearch: setUomSearch,
      onScrollEnd: loadMoreUom,
      getItemById: getUomItemById,
    };

    // Duration UoM (durationUoM column) — groupType=time filtered
    const durationUomAsyncSelect = {
      options: uomOptionsTime,
      hasNextPage: uomHasMoreTime,
      onSearch: setUomSearchTime,
      onScrollEnd: loadMoreUomTime,
      getItemById: getUomItemByIdTime,
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
      },
      {
        value: 'equipment_cost',
        label: 'Equipment Cost',
        rows: costSectionRows.equipment_cost ?? [],
        nameAsyncSelect: equipmentAsyncSelect,
        uomAsyncSelect,
        durationUomAsyncSelect,
      },
      {
        value: 'man_power_cost',
        label: 'Man Power Cost',
        rows: costSectionRows.man_power_cost ?? [],
        nameAsyncSelect: manpowerAsyncSelect,
        uomAsyncSelect,
        durationUomAsyncSelect,
      },
      {
        value: 'transport_cost',
        label: 'Transport Cost',
        rows: costSectionRows.transport_cost ?? [],
        infoBadge: { message: 'Data transport otomatis dibuat setelah menyimpan' },
        readOnlyColumns: ['vol_rab'],
      },
      {
        value: 'preliminery_cost',
        label: 'Preliminery Cost',
        rows: costSectionRows.preliminery_cost ?? [],
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
        };
      }
      if (cat.category === 'equipment_cost') {
        return {
          value: cat.category,
          label: cat.categoryName,
          rows,
          nameAsyncSelect: equipmentAsyncSelect,
          uomAsyncSelect,
          durationUomAsyncSelect,
        };
      }
      if (cat.category === 'man_power_cost') {
        return {
          value: cat.category,
          label: cat.categoryName,
          rows,
          nameAsyncSelect: manpowerAsyncSelect,
          uomAsyncSelect,
          durationUomAsyncSelect,
        };
      }
      if (cat.category === 'transport_cost') {
        return {
          value: cat.category,
          label: cat.categoryName,
          rows,
          infoBadge: { message: 'Data transport otomatis dibuat setelah menyimpan' },
          readOnlyColumns: ['vol_rab'],
        };
      }
      return { value: cat.category, label: cat.categoryName, rows, uomAsyncSelect };
    });
  }, [
    costData,
    costSectionRows,
    uomOptions,
    uomHasMore,
    loadMoreUom,
    getUomItemById,
    uomOptionsTime,
    uomHasMoreTime,
    loadMoreUomTime,
    getUomItemByIdTime,
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
        <ItemNotFound message="Data BOQ Planning tidak ditemukan." />
      </div>
    );
  }

  if (originalIdsRef.current.size === 0 && initialTreeData.length > 0) {
    originalIdsRef.current = collectAllIds(initialTreeData);
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="BOQ Planning"
        onBack={handleBack}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="md"
              disabled={!boqIsComplete}
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={handleGenerateQuotation}
            >
              {BOQ_PLANNING_PAGE_LABELS.generateQuotation}
            </Button>
            <Button
              variant="default"
              size="md"
              leftIcon={<FileText className="w-4 h-4" />}
              onClick={() => setResumeOpen(true)}
            >
              {BOQ_PLANNING_PAGE_LABELS.lihatResume}
            </Button>
          </div>
        }
      />
      <ProjectBOQInfoCard project={project} />
      <BOQPlanningDetail
        value={currentTree}
        onChange={handleTreeChange}
        suggestionTree={suggestionTree}
        onNameSearch={handleNameSearch}
        readOnly={boqIsComplete}
        isComplete={boqIsComplete}
        completeDisabled={initialTreeData.length === 0}
        onComplete={handleToggleComplete}
        title="Set BoQ Planning"
        jenisOptions={DEFAULT_JENIS_OPTIONS}
        maxDepth={DEFAULT_MAX_DEPTH}
        savedNodeIds={savedNodeIds}
        onSave={handleSave}
        isSaving={isSaving}
        onOpenDetail={handleOpenDetail}
        nonEditableTooltip="Sel ini tidak dapat diedit"
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
        onSave={handleSaveCostItems}
        isSaving={isSavingCost}
        isLoading={isCostLoading}
        readOnly={boqIsComplete}
        sectionErrors={sectionErrors}
      />
      <BOQPlanningResume
        node={null}
        open={resumeOpen}
        onOpenChange={(open) => {
          setResumeOpen(open);
          if (!open) {
            resumeDataReadyRef.current = false;
          }
        }}
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
        readOnly={boqIsComplete}
        hasChanges={hasResumeChanges}
        onMaterialRowsChange={setEditResumeMaterialRows}
        onEquipmentRowsChange={setEditResumeEquipmentRows}
        onSave={handleSaveResume}
        isSaving={isUpdatingCatalogPrices}
      />
    </div>
  );
}

function findNodeById(nodes: BOQPlanningNode[], id: string): BOQPlanningNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNodeById(n.children, id);
    if (found) return found;
  }
  return null;
}
