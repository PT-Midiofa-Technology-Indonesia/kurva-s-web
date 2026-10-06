'use client';

import { CircleAlert, FileText, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { useItemCatalogsInfinite } from '@/domains/item-master';
import { useJobItemTypesInfinite } from '@/domains/job-item-type/hooks/use-job-item-types-infinite';
import { useBOQItemsSuggestions } from '@/domains/project-control/hooks/use-boq-items-suggestions';
import { useUomsInfinite } from '@/domains/uom/hooks/use-uoms-infinite';
import { ItemNotFound } from '@/shared/components/molecules';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/molecules/Alert';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { FormPageSkeleton } from '@/shared/components/templates';
import {
  BOQExecutionCostDialog,
  type BOQExecutionCostSavePayload,
} from '@/shared/components/templates/BOQ/BOQExecution/BOQExecutionCostDialog';
import { BOQExecutionDetail } from '@/shared/components/templates/BOQ/BOQExecution/BOQExecutionDetail';
import type {
  BOQExecutionCostRow,
  BOQExecutionCostSection,
} from '@/shared/components/templates/BOQ/BOQExecution/boq-execution-cost-columns';
import type { BOQExecutionNode } from '@/shared/components/templates/BOQ/BOQExecution/types/boq-execution.types';
import { BOQPlanningResume } from '@/shared/components/templates/BOQ/BOQPlanning/BOQPlanningResume';
import type {
  BOQResumeEquipmentRow,
  BOQResumeMaterialRow,
} from '@/shared/components/templates/BOQ/BOQPlanning/boq-resume.types';
import type { CostSectionError } from '@/shared/components/templates/BOQ/types/boq-cost.types';
import type { BOQNode } from '@/shared/components/templates/BOQ/types/boq-tree.types';
import { DEFAULT_MAX_DEPTH } from '@/shared/components/templates/BOQ/types/boq-tree.types';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import { collectAllIds, flattenTree } from '@/shared/utils/boq-tree-helpers';
import { generateId } from '@/shared/utils/generate-id';
import { ProjectBOQInfoCard } from '../components/ProjectBOQInfoCard';
import { SPKUploadSection } from '../components/SPKUploadSection';
import { BOQ_EXECUTION_DETAIL_PAGE_LABELS } from '../constants';
import {
  useProjectBOQ,
  useProjectBOQCatalogPrices,
  useProjectBOQItemCosts,
  useStartProjectExecution,
  useSyncProjectBOQItemCosts,
  useSyncProjectBOQItems,
  useUpdateProjectBOQ,
} from '../hooks';

interface ItemFromApi {
  id: string;
  name: string;
  jobItemType?: { id: string; name: string };
  weight?: string | number | null;
  isFinalLevel?: boolean;
  volumeRab?: string | number | null;
  volumeCco?: string | number | null;
  volumeActual?: string | number | null;
  uomId?: string | null;
  uom?: { id: string; code: string; name: string } | null;
  unitPriceMaterialRab?: string | number | null;
  unitPriceMaterialCco?: string | number | null;
  unitPriceMaterialActual?: string | number | null;
  unitPriceWorkRab?: string | number | null;
  unitPriceWorkCco?: string | number | null;
  unitPriceWorkActual?: string | number | null;
  totalPriceMaterialRab?: string | number | null;
  totalPriceMaterialCco?: string | number | null;
  totalPriceMaterialActual?: string | number | null;
  totalPriceWorkRab?: string | number | null;
  totalPriceWorkCco?: string | number | null;
  totalPriceWorkActual?: string | number | null;
  totalAmountRab?: string | number | null;
  totalAmountCco?: string | number | null;
  totalAmountActual?: string | number | null;
  remarks?: string | null;
  sortOrder?: number;
  children?: ItemFromApi[];
}

function mapApiItemsToExecutionNodes(items: ItemFromApi[]): BOQExecutionNode[] {
  return items.map((item) => {
    const isLeaf = item.isFinalLevel;
    const volumeRab = item.volumeRab != null ? Number(item.volumeRab) : undefined;
    const volumeCco = item.volumeCco != null ? Number(item.volumeCco) : undefined;
    const volumeActual = item.volumeActual != null ? Number(item.volumeActual) : undefined;
    const unitPriceMaterialRab =
      item.unitPriceMaterialRab != null ? Number(item.unitPriceMaterialRab) : undefined;
    const unitPriceMaterialCco =
      item.unitPriceMaterialCco != null ? Number(item.unitPriceMaterialCco) : undefined;
    const unitPriceMaterialActual =
      item.unitPriceMaterialActual != null ? Number(item.unitPriceMaterialActual) : undefined;
    const unitPriceWorkRab =
      item.unitPriceWorkRab != null ? Number(item.unitPriceWorkRab) : undefined;
    const unitPriceWorkCco =
      item.unitPriceWorkCco != null ? Number(item.unitPriceWorkCco) : undefined;
    const unitPriceWorkActual =
      item.unitPriceWorkActual != null ? Number(item.unitPriceWorkActual) : undefined;

    const computeTotal = (vol: number | undefined, unit: number | undefined) =>
      isLeaf && vol != null && unit != null ? vol * unit : undefined;

    const uomName = item.uom?.name ?? undefined;
    return {
      id: item.id,
      name: item.name,
      jenis: item.jobItemType?.name ?? '',
      bobot: item.weight ? Number(item.weight) : null,
      isFinalLevel: item.isFinalLevel,
      uomId: item.uom?.id ?? item.uomId ?? undefined,
      uomLabel: uomName,
      volume: {
        rab: volumeRab,
        cco: volumeCco,
        actual: volumeActual,
        uom: uomName,
      },
      unitPrice: {
        material: {
          rab: unitPriceMaterialRab,
          cco: unitPriceMaterialCco,
          actual: unitPriceMaterialActual,
        },
        work: {
          rab: unitPriceWorkRab,
          cco: unitPriceWorkCco,
          actual: unitPriceWorkActual,
        },
      },
      totalPrice: {
        material: {
          rab:
            item.totalPriceMaterialRab != null
              ? Number(item.totalPriceMaterialRab)
              : computeTotal(volumeRab, unitPriceMaterialRab),
          cco:
            item.totalPriceMaterialCco != null
              ? Number(item.totalPriceMaterialCco)
              : computeTotal(volumeCco, unitPriceMaterialCco),
          actual:
            item.totalPriceMaterialActual != null
              ? Number(item.totalPriceMaterialActual)
              : computeTotal(volumeActual, unitPriceMaterialActual),
        },
        work: {
          rab:
            item.totalPriceWorkRab != null
              ? Number(item.totalPriceWorkRab)
              : computeTotal(volumeRab, unitPriceWorkRab),
          cco:
            item.totalPriceWorkCco != null
              ? Number(item.totalPriceWorkCco)
              : computeTotal(volumeCco, unitPriceWorkCco),
          actual:
            item.totalPriceWorkActual != null
              ? Number(item.totalPriceWorkActual)
              : computeTotal(volumeActual, unitPriceWorkActual),
        },
      },
      amount: {
        rab: item.totalAmountRab != null ? Number(item.totalAmountRab) : undefined,
        cco: item.totalAmountCco != null ? Number(item.totalAmountCco) : undefined,
        actual: item.totalAmountActual != null ? Number(item.totalAmountActual) : undefined,
      },
      remarks: item.remarks ?? undefined,
      children: mapApiItemsToExecutionNodes(item.children ?? []),
    };
  });
}

function findNodeById(nodes: BOQExecutionNode[], id: string): BOQExecutionNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNodeById(n.children, id);
    if (found) return found;
  }
  return null;
}

interface BOQExecutionDetailPageProps {
  projectId: string;
  initialTab?: string;
}

export function BOQExecutionDetailPage({ projectId, initialTab }: BOQExecutionDetailPageProps) {
  const router = useRouter();
  const { data: response, isLoading, error } = useProjectBOQ(projectId);
  const { mutateAsync: syncItems, isPending: isSaving } = useSyncProjectBOQItems(projectId);
  const { mutateAsync: startExecution, isPending: isStarting } =
    useStartProjectExecution(projectId);
  const { mutateAsync: updateBOQ } = useUpdateProjectBOQ(projectId);

  const [uomSearch, setUomSearch] = useState('');
  const [materialSearch, setMaterialSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');

  const {
    options: uomOptions,
    hasMore: uomHasMore,
    loadMore: loadMoreUom,
  } = useUomsInfinite({ isActive: true, search: uomSearch });

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

  const data = response;
  const project = data?.project;
  const boq = data?.boq;

  const [suggestionParams, setSuggestionParams] = useState<{
    search?: string;
    level?: number;
    parentId?: string;
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
      parentId: suggestionParams.parentId,
    },
    Boolean(projectId && suggestionParams.level != null && project?.isSideInstruction)
  );

  const suggestionTree = useMemo(() => {
    if (isFetchingSuggestions || !suggestionItems || suggestionItems.length === 0) return undefined;
    return mapApiItemsToExecutionNodes(suggestionItems as unknown as ItemFromApi[]);
  }, [isFetchingSuggestions, suggestionItems]);

  const handleNameSearch = useCallback(
    (search: string, level: number, parentId?: string | null) => {
      setSuggestionParams((prev) => {
        if (
          prev.search === search &&
          prev.level === level &&
          prev.parentId === (parentId ?? undefined)
        ) {
          void refetchSuggestions();
          return prev;
        }
        return { search, level, parentId: parentId ?? undefined };
      });
    },
    [refetchSuggestions]
  );

  // Default value from API
  const [boqIsComplete, setBoqIsComplete] = useState(false);

  useEffect(() => {
    if (boq?.isCcoComplete != null) {
      setBoqIsComplete(boq.isCcoComplete);
    }
  }, [boq?.isCcoComplete]);

  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [costSectionRows, setCostSectionRows] = useState<Record<string, BOQExecutionCostRow[]>>({});
  const originalCostItemsRef = useRef<Record<string, unknown[]>>({});
  const [costSectionErrors, setCostSectionErrors] = useState<Record<string, CostSectionError>>({});
  const [costSaving, setCostSaving] = useState(false);

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
          uomId: item.uomId ?? item.uom?.id ?? null,
          durasiSewa_rab: item.durationRab ? Number(item.durationRab) : undefined,
          durasiSewa_cco: item.durationCco ? Number(item.durationCco) : undefined,
          durasiSewa_actual: item.durationActual ? Number(item.durationActual) : undefined,
          durationUoM: item.durationUom?.name ?? undefined,
          durationUomId: item.durationUomId ?? item.durationUom?.id ?? null,
          hargaSatuan_rab: item.unitPriceRab ? Number(item.unitPriceRab) : undefined,
          hargaSatuan_cco: item.unitPriceCco ? Number(item.unitPriceCco) : undefined,
          hargaSatuan_actual: item.unitPriceActual ? Number(item.unitPriceActual) : undefined,
          keterangan: item.remarks ?? undefined,
        }));
        originals[category.category] = category.items;
      }
      originalCostItemsRef.current = originals;
      return initial;
    });
  }, [costData]);

  const originalItemsMap = useMemo(() => {
    const map = new Map<string, ItemFromApi>();
    if (!data?.boq?.items) return map;
    function walk(items: ItemFromApi[]) {
      for (const item of items) {
        map.set(item.id, item);
        if (item.children && item.children.length > 0) walk(item.children);
      }
    }
    walk(data.boq.items as ItemFromApi[]);
    return map;
  }, [data]);

  const originalIdsRef = useRef<Set<string>>(new Set());
  const [treeData, setTreeData] = useState<BOQExecutionNode[] | null>(null);

  const initialTreeData = useMemo(() => {
    if (!data?.boq?.items) return [];
    return mapApiItemsToExecutionNodes(data.boq.items as ItemFromApi[]);
  }, [data]);

  const currentTree = treeData ?? initialTreeData;

  const savedNodeIds = useMemo(
    () => collectAllIds(initialTreeData as unknown as BOQNode[]),
    [initialTreeData]
  );

  const handleTreeChange = useCallback((next: BOQExecutionNode[]) => {
    setTreeData(next);
  }, []);

  const [jenisSearch, setJenisSearch] = useState('');

  const {
    options: jenisOptions,
    hasMore: jenisHasMore,
    loadMore: loadMoreJenis,
  } = useJobItemTypesInfinite({ isActive: true, search: jenisSearch });

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
    const currentIds = collectAllIds(currentTree as unknown as BOQNode[]);
    const deletedIds = Array.from(originalIdsRef.current).filter((id) => !currentIds.has(id));
    const items = flattenTree(
      currentTree as unknown as BOQNode[],
      null,
      null,
      originalItemsMap as unknown as Map<string, { jobItemType: { id: string } }>,
      originalIdsRef.current,
      (node, original) => {
        if (original) return original.jobItemType.id;
        return jobItemTypeLabelToId.get(node.jenis) ?? '';
      }
    ).map((flat) => {
      // Lookup by id (existing) or tempId (new draft)
      const lookupId = flat.id ?? flat.tempId;
      const nodeFromTree = lookupId ? findNodeById(currentTree, lookupId) : null;
      return {
        ...flat,
        weight: nodeFromTree?.bobot ?? flat.weight,
        limitBudgetPercentage: null,
        volumeRab: nodeFromTree?.volume?.rab ?? null,
        volumeCco: nodeFromTree?.volume?.cco ?? null,
        volumeActual: nodeFromTree?.volume?.actual ?? null,
        uomId: nodeFromTree?.uomId ?? null,
        remarks: nodeFromTree?.remarks ?? null,
      };
    });
    await syncItems({ items, deletedIds });
    originalIdsRef.current = currentIds;
    setTreeData(null);
  }, [data, currentTree, originalItemsMap, jobItemTypeLabelToId, syncItems]);

  const handleToggleComplete = useCallback(async () => {
    if (!data?.boq) return;
    const next = !boqIsComplete;
    setBoqIsComplete(next);
    await updateBOQ({
      boqId: data.boq.id,
      payload: { isCcoComplete: next },
    });
  }, [data, boqIsComplete, updateBOQ]);

  const handleOpenDetail = useCallback((node: BOQExecutionNode) => {
    setDetailNodeId(node.id);
    setCostSectionRows({});
    originalCostItemsRef.current = {};
    setDetailDialogOpen(true);
  }, []);

  const { mutateAsync: syncCostCategory } = useSyncProjectBOQItemCosts(
    projectId,
    detailNodeId ?? ''
  );

  const handleDetailDialogOpenChange = useCallback((open: boolean) => {
    setDetailDialogOpen(open);
    if (!open) {
      setDetailNodeId(null);
      setCostSectionRows({});
      originalCostItemsRef.current = {};
      setCostSectionErrors({});
    }
  }, []);

  const detailNode = useMemo(() => {
    if (!detailNodeId) return null;
    return findNodeById(currentTree, detailNodeId);
  }, [detailNodeId, currentTree]);

  const handleSaveCosts = useCallback(
    async (payload: BOQExecutionCostSavePayload) => {
      if (!detailNodeId) return;
      setCostSaving(true);
      try {
        await syncCostCategory(payload);
        setCostSectionErrors({});

        // Sync saved rows back so sections' hasEdits resets to false
        const newRows: Record<string, BOQExecutionCostRow[]> = {};
        for (const cat of payload.categories) {
          newRows[cat.costCategory] = cat.items.map((item) => ({
            id: item.id ?? generateId(),
            catalogId: item.catalogId,
            code: item.code ?? '',
            name: item.name ?? '',
            vol_rab: item.volumeRab ?? undefined,
            vol_cco: item.volumeCco ?? undefined,
            vol_actual: item.volumeActual ?? undefined,
            uomId: item.uomId,
            durasiSewa_rab: item.durationRab ?? undefined,
            durasiSewa_cco: item.durationCco ?? undefined,
            durasiSewa_actual: item.durationActual ?? undefined,
            durationUomId: item.durationUomId,
            hargaSatuan_rab: item.unitPriceRab ?? undefined,
            hargaSatuan_cco: item.unitPriceCco ?? undefined,
            hargaSatuan_actual: item.unitPriceActual ?? undefined,
            keterangan: item.remarks ?? undefined,
          }));
        }
        setCostSectionRows((prev) => ({ ...prev, ...newRows }));
      } catch (error) {
        const fieldErrors = getFieldErrors(error);
        const genericMsg = getErrorMessage(error);
        if (fieldErrors) {
          const categoryKeys = (costData?.data?.costs ?? []).map((c) => c.category);
          const parsed: Record<string, CostSectionError> = {};
          for (const [path, msgs] of Object.entries(fieldErrors)) {
            const parts = path.split('.');
            const catIdx = parseInt(parts[1], 10);
            const categoryKey = categoryKeys[catIdx];
            if (!categoryKey) continue;
            if (!parsed[categoryKey]) parsed[categoryKey] = { tableErrors: [], rowErrors: {} };
            if (parts.length === 3 && parts[2] === 'items') {
              parsed[categoryKey].tableErrors.push(...msgs);
            }
            if (parts.length === 5 && parts[2] === 'items') {
              const rowIdx = parseInt(parts[3], 10);
              if (!parsed[categoryKey].rowErrors[rowIdx])
                parsed[categoryKey].rowErrors[rowIdx] = [];
              parsed[categoryKey].rowErrors[rowIdx].push(...msgs);
            }
          }
          setCostSectionErrors(parsed);
        }
        toast.error({ title: genericMsg });
      } finally {
        setCostSaving(false);
      }
    },
    [detailNodeId, syncCostCategory, costData]
  );

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
        volCco: m.volumeCco != null ? Number(m.volumeCco) : undefined,
        volAct: m.volumeActual != null ? Number(m.volumeActual) : undefined,
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
        volCco: e.volumeCco != null ? Number(e.volumeCco) : undefined,
        volAct: e.volumeActual != null ? Number(e.volumeActual) : undefined,
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

  // ── Project status flags ──
  // readOnly locks structure/RAB/CCO columns once complete; ACT stays editable
  // via the isComplete flag in the columns factory until the project starts.
  const readOnly = boqIsComplete;
  const startedAt = project?.startedAt ?? null;
  const hasExecutionData = (data?.boq?.items?.length ?? 0) > 0;
  const canStartProject = boqIsComplete && !startedAt;
  const completeSwitchDisabled = !!startedAt || !hasExecutionData;

  const costSections = useMemo<BOQExecutionCostSection[]>(() => {
    const categories = costData?.data?.costs ?? [];
    if (categories.length === 0) return [];

    // CCO & ACT editable before complete; disabled once complete.
    // isSideInstruction items never allow CCO edits.
    const isSideInstruction = costData?.data?.item?.isSideInstruction ?? false;
    const editableSuffixes = new Set(boqIsComplete ? [] : ['cco', 'actual']);
    if (isSideInstruction) editableSuffixes.delete('cco');

    return categories.map((cat) => {
      const category = cat.category;
      return {
        value: category,
        label: cat.categoryName,
        disabled: false,
        rows: costSectionRows[category] ?? [],
        editableSuffixes,
        onRowsChange: (rows: BOQExecutionCostRow[]) => {
          setCostSectionRows((prev) => ({ ...prev, [category]: rows }));
        },
      };
    });
  }, [costData, costSectionRows, boqIsComplete]);

  const nameAsyncSelects = useMemo(
    () =>
      boqIsComplete
        ? undefined
        : ({
            material_cost: {
              options: materialOptions,
              hasNextPage: materialHasMore,
              onSearch: setMaterialSearch,
              onScrollEnd: loadMoreMaterial,
              getItemById: getMaterialItemById,
            },
            equipment_cost: {
              options: equipmentOptions,
              hasNextPage: equipmentHasMore,
              onSearch: setEquipmentSearch,
              onScrollEnd: loadMoreEquipment,
              getItemById: getEquipmentItemById,
            },
          } as Record<
            string,
            import('@/shared/components/templates/BOQ/types/boq-cost.types').BOQCostNameAsyncSelect
          >),
    [
      boqIsComplete,
      materialOptions,
      materialHasMore,
      loadMoreMaterial,
      getMaterialItemById,
      equipmentOptions,
      equipmentHasMore,
      loadMoreEquipment,
      getEquipmentItemById,
    ]
  );

  const handleBack = useCallback(() => {
    router.push(`/project-control/boq-management${initialTab ? `?tab=${initialTab}` : ''}`);
  }, [router, initialTab]);

  const [isStartConfirmOpen, setIsStartConfirmOpen] = useState(false);

  const handleOpenStartConfirm = useCallback(() => {
    setIsStartConfirmOpen(true);
  }, []);

  const handleStartProject = useCallback(async () => {
    await startExecution();
    setIsStartConfirmOpen(false);
  }, [startExecution]);

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
        <ItemNotFound message={BOQ_EXECUTION_DETAIL_PAGE_LABELS.NOT_FOUND} />
      </div>
    );
  }

  if (originalIdsRef.current.size === 0 && initialTreeData.length > 0) {
    originalIdsRef.current = collectAllIds(initialTreeData as unknown as BOQNode[]);
  }

  // Execution tab: name + jenis readonly — editable only for side-instruction projects
  const editableColumnIds = new Set<string>([
    ...(project.isSideInstruction ? (['name', 'jenis'] as const) : []),
    'kode',
    'tambah',
    'volume_rab',
    'volume_cco',
    'volume_actual',
    'volume_uom',
    'unitPrice_material_rab',
    'unitPrice_material_cco',
    'unitPrice_material_actual',
    'unitPrice_work_rab',
    'unitPrice_work_cco',
    'unitPrice_work_actual',
    'totalPrice_material_rab',
    'totalPrice_material_cco',
    'totalPrice_material_actual',
    'totalPrice_work_rab',
    'totalPrice_work_cco',
    'totalPrice_work_actual',
    'amount_rab',
    'amount_cco',
    'amount_actual',
    'remarks',
  ]);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="BOQ Execution"
        onBack={handleBack}
        actions={
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="md"
              leftIcon={<Play className="w-4 h-4" />}
              onClick={handleOpenStartConfirm}
              disabled={!canStartProject || isStarting}
              isLoading={isStarting}
            >
              {BOQ_EXECUTION_DETAIL_PAGE_LABELS.BUTTONS.START_PROJECT}
            </Button>

            <Button
              variant="default"
              size="md"
              leftIcon={<FileText className="w-4 h-4" />}
              onClick={() => setResumeOpen(true)}
            >
              {BOQ_EXECUTION_DETAIL_PAGE_LABELS.BUTTONS.VIEW_RESUME}
            </Button>
          </div>
        }
      />
      {project.isSideInstruction && (
        <Alert variant="warning">
          <AlertTitle>{BOQ_EXECUTION_DETAIL_PAGE_LABELS.SIDE_INSTRUCTION_WARNING.TITLE}</AlertTitle>
          <AlertDescription className="text-amber-900">
            {BOQ_EXECUTION_DETAIL_PAGE_LABELS.SIDE_INSTRUCTION_WARNING.DESCRIPTION}
          </AlertDescription>
        </Alert>
      )}
      <ProjectBOQInfoCard project={project} />
      {project.isSideInstruction && project.spkRequirementDocuments && (
        <SPKUploadSection
          projectId={project.id}
          spkRequirementDocument={project.spkRequirementDocuments}
          spkNumber={project.spkNumber ?? undefined}
          readOnly={startedAt != null}
        />
      )}
      <BOQExecutionDetail
        value={currentTree}
        onChange={handleTreeChange}
        readOnly={readOnly}
        isComplete={boqIsComplete}
        showComplete
        completeDisabled={completeSwitchDisabled}
        onComplete={handleToggleComplete}
        title="BoQ Execution"
        jenisOptions={jenisOptions}
        jenisAsyncSelect={{
          options: jenisOptions,
          hasNextPage: jenisHasMore,
          onSearch: setJenisSearch,
          onScrollEnd: loadMoreJenis,
        }}
        maxDepth={DEFAULT_MAX_DEPTH}
        onSave={handleSave}
        isSaving={isSaving}
        onOpenDetail={handleOpenDetail}
        editableColumnIds={editableColumnIds}
        suggestionTree={suggestionTree}
        onNameSearch={handleNameSearch}
        savedNodeIds={savedNodeIds}
        uomAsyncSelect={{
          options: uomOptions,
          hasNextPage: uomHasMore,
          onSearch: setUomSearch,
          onScrollEnd: loadMoreUom,
          getItemById: getUomItemById,
        }}
      />
      <BOQExecutionCostDialog
        node={detailNode ?? null}
        open={detailDialogOpen}
        onOpenChange={handleDetailDialogOpenChange}
        sections={costSections}
        sectionErrors={costSectionErrors}
        nameAsyncSelects={nameAsyncSelects}
        isLoading={isCostLoading}
        onSave={handleSaveCosts}
        isSaving={costSaving}
      />
      <BOQPlanningResume
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
        showVolumeCcoAct
        readOnly
      />
      <ConfirmDialog
        open={isStartConfirmOpen}
        onOpenChange={setIsStartConfirmOpen}
        variant="danger"
        icon={<CircleAlert className="size-4 text-slate-950" />}
        title={BOQ_EXECUTION_DETAIL_PAGE_LABELS.START_PROJECT_CONFIRM.TITLE}
        description={BOQ_EXECUTION_DETAIL_PAGE_LABELS.START_PROJECT_CONFIRM.DESCRIPTION}
        cancelText={BOQ_EXECUTION_DETAIL_PAGE_LABELS.START_PROJECT_CONFIRM.CANCEL}
        confirmText={BOQ_EXECUTION_DETAIL_PAGE_LABELS.START_PROJECT_CONFIRM.CONFIRM}
        onCancel={() => setIsStartConfirmOpen(false)}
        onConfirm={handleStartProject}
        isLoading={isStarting}
      />
    </div>
  );
}

export default BOQExecutionDetailPage;
