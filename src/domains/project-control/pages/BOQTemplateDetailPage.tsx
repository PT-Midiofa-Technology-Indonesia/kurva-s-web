'use client';

import { Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';

const ConfirmDialog = dynamic(
  () =>
    import('@/shared/components/molecules/AlertDialog').then((m) => ({ default: m.ConfirmDialog })),
  { loading: () => null, ssr: false }
);

import { useItemCatalogsInfinite } from '@/domains/item-master';
import { useJobItemTypesInfinite } from '@/domains/job-item-type/hooks/use-job-item-types-infinite';
import { useSkillCatalogsInfinite } from '@/domains/skill-master';
import { Button } from '@/shared/components/atoms/Button';
import { ItemNotFound } from '@/shared/components/molecules';
import { PageHeader } from '@/shared/components/molecules/PageHeader';
import { FormPageSkeleton } from '@/shared/components/templates';
import { BOQTemplateCostDialog } from '@/shared/components/templates/BOQ/BOQTemplate/BOQTemplateCostDialog';
import { BOQTemplateDetail } from '@/shared/components/templates/BOQ/BOQTemplate/BOQTemplateDetail';
import type {
  BOQCostRow,
  BOQCostSection,
  CostSectionError,
} from '@/shared/components/templates/BOQ/types/boq-cost.types';
import type { BOQNode } from '@/shared/components/templates/BOQ/types/boq-tree.types';
import {
  DEFAULT_BOBOT_OPTIONS,
  DEFAULT_JENIS_OPTIONS,
  DEFAULT_MAX_DEPTH,
} from '@/shared/components/templates/BOQ/types/boq-tree.types';
import { collectAllIds, flattenTree } from '@/shared/utils/boq-tree-helpers';
import type { BOQTemplateItem } from '../api/get-boq-template';
import type {
  BOQTemplateItemCostCategory,
  BOQTemplateItemCostItem,
} from '../api/get-boq-template-item-costs';
import { BOQTemplateInfoCard } from '../components/BOQTemplateInfoCard';
import {
  useBOQTemplate,
  useBOQTemplateItemCosts,
  useBOQTemplateItemsSuggestions,
  useDeleteBOQTemplate,
  useSyncBOQTemplateItemCosts,
  useSyncBOQTemplateItems,
} from '../hooks';

interface BOQTemplateDetailPageProps {
  initialTab?: string;
}

function mapApiItemsToNodes(items: BOQTemplateItem[]): BOQNode[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    jenis: item.jobItemType.name,
    bobot: item.weight ? Number(item.weight) : null,
    isFinalLevel: item.isFinalLevel,
    suggestionItemId: item.suggestionItemId ?? null,
    children: mapApiItemsToNodes(item.children ?? []),
  }));
}

function mapCostCategoriesToSectionRows(categories: BOQTemplateItemCostCategory[]): {
  rows: Record<string, BOQCostRow[]>;
  originals: Record<string, BOQTemplateItemCostItem[]>;
} {
  const rows: Record<string, BOQCostRow[]> = {};
  const originals: Record<string, BOQTemplateItemCostItem[]> = {};

  for (const category of categories) {
    rows[category.category] = category.items.map((item) => ({
      id: item.id,
      catalogId: item.catalogId ?? undefined,
      code: item.code,
      name: item.name,
    }));
    originals[category.category] = category.items;
  }

  return { rows, originals };
}

export function BOQTemplateDetailPage({ initialTab }: BOQTemplateDetailPageProps) {
  const router = useRouter();
  const params = useParams<Record<string, string>>();
  const templateId = params.id ?? '';
  const { data: response, isLoading, error } = useBOQTemplate(templateId);
  const { mutateAsync: syncItems, isPending: isSaving } = useSyncBOQTemplateItems(templateId);
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteBOQTemplate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [materialSearch, setMaterialSearch] = useState('');
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [manpowerSearch, setManpowerSearch] = useState('');
  const [jenisSearch, setJenisSearch] = useState('');

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

  const {
    options: jenisOptions,
    hasMore: jenisHasMore,
    loadMore: loadMoreJenis,
  } = useJobItemTypesInfinite({ isActive: true, search: jenisSearch });

  const [suggestionParams, setSuggestionParams] = useState<{
    search?: string;
    level?: number;
  }>({});

  const {
    data: suggestionItems,
    isFetching: isFetchingSuggestions,
    refetch: refetchSuggestions,
  } = useBOQTemplateItemsSuggestions(
    {
      boqTemplateId: templateId,
      search: suggestionParams.search,
      level: suggestionParams.level,
    },
    Boolean(templateId && suggestionParams.level != null)
  );

  const suggestionTree = useMemo(() => {
    if (isFetchingSuggestions || !suggestionItems || suggestionItems.length === 0) return undefined;
    return mapApiItemsToNodes(suggestionItems);
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

  const [costNodeId, setCostNodeId] = useState<string | null>(null);
  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [costSectionRows, setCostSectionRows] = useState<Record<string, BOQCostRow[]>>({});
  const originalCostItemsRef = useRef<Record<string, BOQTemplateItemCostItem[]>>({});

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

  const {
    data: costData,
    isLoading: isCostLoading,
    refetch: refetchCostData,
  } = useBOQTemplateItemCosts(templateId, costNodeId ?? '', {
    enabled: !!costNodeId && costDialogOpen,
  });

  const { mutateAsync: syncCostItems, isPending: isSavingCost } = useSyncBOQTemplateItemCosts(
    templateId,
    costNodeId ?? ''
  );

  useEffect(() => {
    if (!costData?.data) return;
    const { rows, originals } = mapCostCategoriesToSectionRows(costData.data.costs);
    setCostSectionRows((prev) => (Object.keys(prev).length > 0 ? prev : rows));
    originalCostItemsRef.current = originals;
  }, [costData]);

  const template = response?.data;

  const originalItemsMap = useMemo(() => {
    const map = new Map<string, BOQTemplateItem>();
    if (!template) return map;
    const walk = (items: BOQTemplateItem[]) => {
      for (const item of items) {
        map.set(item.id, item);
        if (item.children?.length > 0) walk(item.children);
      }
    };
    walk(template.items);
    return map;
  }, [template]);

  const originalIdsRef = useRef<Set<string>>(new Set());
  const hasSavedRef = useRef(false);
  const [treeData, setTreeData] = useState<BOQNode[] | null>(null);

  const initialTreeData = useMemo(() => {
    if (!template) return [];
    return mapApiItemsToNodes(template.items);
  }, [template]);

  const savedNodeIds = useMemo(() => collectAllIds(initialTreeData), [initialTreeData]);

  const currentTree = treeData ?? initialTreeData;

  // Sync originalIdsRef & clear local draft after save-triggered refetch
  useEffect(() => {
    if (initialTreeData.length === 0) return;
    originalIdsRef.current = collectAllIds(initialTreeData);
    if (hasSavedRef.current) {
      hasSavedRef.current = false;
      setTreeData(null);
    }
  }, [initialTreeData]);

  const handleTreeChange = useCallback((next: BOQNode[]) => {
    setTreeData(next);
  }, []);

  const jenisLabelToId = useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of jenisOptions) {
      map.set(opt.label, opt.value);
      map.set(opt.value, opt.value);
    }
    return map;
  }, [jenisOptions]);

  const handleSave = useCallback(async () => {
    if (!template) return;
    const currentIds = collectAllIds(currentTree);
    const deletedIds = Array.from(originalIdsRef.current).filter((id) => !currentIds.has(id));
    const items = flattenTree(
      currentTree,
      null,
      null,
      originalItemsMap,
      originalIdsRef.current,
      (node, original) => {
        const mapped = jenisLabelToId.get(node.jenis);
        if (mapped) return mapped;
        return original?.jobItemType.id ?? '';
      }
    );

    await syncItems({ items, deletedIds });
    hasSavedRef.current = true;
    // originalIdsRef and treeData reset in useEffect above (on initialTreeData change)
  }, [template, currentTree, originalItemsMap, syncItems, jenisLabelToId]);

  const handleOpenCost = useCallback((node: BOQNode) => {
    setCostNodeId(node.id);
    setCostSectionRows({});
    originalCostItemsRef.current = {};
    setSectionErrors({});
    setCostDialogOpen(true);
  }, []);

  const handleCostDialogOpenChange = useCallback((open: boolean) => {
    setCostDialogOpen(open);
    if (!open) {
      setCostNodeId(null);
      setCostSectionRows({});
      originalCostItemsRef.current = {};
      setSectionErrors({});
    }
  }, []);

  const handleCostSectionRowsChange = useCallback((sectionValue: string, rows: BOQCostRow[]) => {
    setCostSectionRows((prev) => ({ ...prev, [sectionValue]: rows }));
  }, []);

  const [sectionErrors, setSectionErrors] = useState<Record<string, CostSectionError>>({});

  const handleSaveCostItems = useCallback(async () => {
    if (!costNodeId) return;
    setSectionErrors({});
    const apiCategories = (costData?.data?.costs ?? []).filter(
      (cat) => cat.category !== 'transport_cost'
    );
    const categories = apiCategories.map((cat) => {
      const currentRows = costSectionRows[cat.category] ?? [];
      const originalItems = originalCostItemsRef.current[cat.category] ?? [];
      const originalIds = new Set(originalItems.map((i) => i.id));
      const currentIds = new Set(currentRows.map((r) => r.id));
      const deletedIds = originalItems.filter((i) => !currentIds.has(i.id)).map((i) => i.id);
      const items = currentRows.map((row) => {
        const isExisting = originalIds.has(row.id);
        if (isExisting) {
          return {
            id: row.id,
            ...(row.catalogId ? { catalogId: row.catalogId } : {}),
            code: row.code,
            name: row.name,
          };
        }
        return {
          id: null,
          ...(row.catalogId ? { catalogId: row.catalogId } : {}),
          code: row.code,
          name: row.name,
        };
      });
      return { costCategory: cat.category, items, deletedIds };
    });

    try {
      await syncCostItems({ categories });
      const freshCostData = await refetchCostData();
      if (freshCostData.data?.data) {
        const { rows, originals } = mapCostCategoriesToSectionRows(freshCostData.data.data.costs);
        setCostSectionRows(rows);
        originalCostItemsRef.current = originals;
      }
      setSectionErrors({});
      handleCostDialogOpenChange(false);
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      const genericMsg = getErrorMessage(error);
      if (fieldErrors) {
        const parsed: Record<string, CostSectionError> = {};
        for (const [path, msgs] of Object.entries(fieldErrors)) {
          const parts = path.split('.');
          const catIdx = parseInt(parts[1], 10);
          const categoryKey = apiCategories[catIdx]?.category;
          if (!categoryKey) continue;
          if (!parsed[categoryKey]) parsed[categoryKey] = { tableErrors: [], rowErrors: {} };

          if (parts.length === 3 && parts[2] === 'items') {
            parsed[categoryKey].tableErrors.push(...msgs);
          }
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
  }, [
    costNodeId,
    costData,
    costSectionRows,
    syncCostItems,
    refetchCostData,
    handleCostDialogOpenChange,
  ]);

  const costNode = useMemo(() => {
    if (!costNodeId) return null;
    const findNode = (nodes: BOQNode[]): BOQNode | null => {
      for (const n of nodes) {
        if (n.id === costNodeId) return n;
        const found = findNode(n.children);
        if (found) return found;
      }
      return null;
    };
    return findNode(currentTree);
  }, [costNodeId, currentTree]);

  const costSections = useMemo<BOQCostSection[]>(() => {
    const categories = costData?.data?.costs ?? [];

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

    if (categories.length === 0) {
      return [
        {
          value: 'material_cost',
          label: 'Material Cost',
          rows: costSectionRows.material_cost ?? [],
          nameAsyncSelect: materialAsyncSelect,
        },
        {
          value: 'equipment_cost',
          label: 'Equipment Cost',
          rows: costSectionRows.equipment_cost ?? [],
          nameAsyncSelect: equipmentAsyncSelect,
        },
        {
          value: 'man_power_cost',
          label: 'Man Power Cost',
          rows: costSectionRows.man_power_cost ?? [],
          nameAsyncSelect: manpowerAsyncSelect,
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
        },
      ];
    }

    return categories.map((cat) => {
      const rows = costSectionRows[cat.category] ?? [];
      if (cat.category === 'material_cost') {
        return {
          value: cat.category,
          label: cat.categoryName,
          rows,
          nameAsyncSelect: materialAsyncSelect,
        };
      }
      if (cat.category === 'equipment_cost') {
        return {
          value: cat.category,
          label: cat.categoryName,
          rows,
          nameAsyncSelect: equipmentAsyncSelect,
        };
      }
      if (cat.category === 'man_power_cost') {
        return {
          value: cat.category,
          label: cat.categoryName,
          rows,
          nameAsyncSelect: manpowerAsyncSelect,
        };
      }
      if (cat.category === 'transport_cost') {
        return {
          value: cat.category,
          label: cat.categoryName,
          rows,
          disabled: true,
          infoBadge: { message: 'Data transport otomatis dibuat setelah menyimpan' },
        };
      }
      return { value: cat.category, label: cat.categoryName, rows };
    });
  }, [
    costData,
    costSectionRows,
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

  const handleDeleteConfirm = useCallback(() => {
    deleteTemplate(templateId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        router.push('/project-control/boq-management');
      },
    });
  }, [deleteTemplate, templateId, router]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <FormPageSkeleton />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="p-6">
        <ItemNotFound message="Template BOQ tidak ditemukan." />
      </div>
    );
  }

  if (originalIdsRef.current.size === 0) {
    originalIdsRef.current = collectAllIds(initialTreeData);
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Detail Template"
        onBack={handleBack}
        actions={
          <Button
            variant="destructive"
            size="sm"
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </Button>
        }
      />
      <BOQTemplateInfoCard template={template} />
      <BOQTemplateDetail
        value={currentTree}
        onChange={handleTreeChange}
        title="Set BoQ Template"
        jenisOptions={DEFAULT_JENIS_OPTIONS}
        bobotOptions={DEFAULT_BOBOT_OPTIONS}
        maxDepth={DEFAULT_MAX_DEPTH}
        onSave={handleSave}
        isSaving={isSaving}
        savedNodeIds={savedNodeIds}
        suggestionTree={suggestionTree}
        onNameSearch={handleNameSearch}
        onOpenCost={handleOpenCost}
        jenisAsyncSelect={{
          options: jenisOptions,
          hasNextPage: jenisHasMore,
          onSearch: setJenisSearch,
          onScrollEnd: loadMoreJenis,
        }}
      />
      <BOQTemplateCostDialog
        node={costNode}
        open={costDialogOpen}
        onOpenChange={handleCostDialogOpenChange}
        sections={costSections}
        onSectionRowsChange={handleCostSectionRowsChange}
        onSave={handleSaveCostItems}
        isSaving={isSavingCost}
        isLoading={isCostLoading}
        sectionErrors={sectionErrors}
      />

      {deleteDialogOpen && (
        <Suspense fallback={null}>
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            variant="danger"
            title="Hapus Template BOQ"
            description={`Apakah Anda yakin ingin menghapus template "${template.name}"? Tindakan ini tidak dapat dibatalkan.`}
            cancelText="Batal"
            confirmText="Hapus"
            onCancel={() => setDeleteDialogOpen(false)}
            onConfirm={handleDeleteConfirm}
            isLoading={isDeleting}
          />
        </Suspense>
      )}
    </div>
  );
}
