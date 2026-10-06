'use client';

import type { ExpandedState } from '@tanstack/react-table';
import { Expand, Minimize2, Plus, Save, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Switch } from '@/components/atoms/Switch';
import { DataTable } from '@/components/organisms/DataTable';
import type {
  BOQColumnLabels,
  BOQContextMenuLabels,
  BOQCostColumnLabels,
  BOQCostDialogLabels,
  BOQHeaderLabels,
  BOQTooltipLabels,
} from '../types/boq-labels.types';
import type { BOQNode } from '../types/boq-tree.types';
import {
  DEFAULT_COST_TYPES,
  DEFAULT_JENIS_OPTIONS,
  DEFAULT_MAX_DEPTH,
} from '../types/boq-tree.types';
import { BOQContextMenuItems } from '../utils/BOQContextMenu';
import {
  addChild,
  addSibling,
  canAddChild,
  cloneNode,
  computeCodes,
  deleteNode,
  findDepth,
  findNodeByName,
  replaceNode,
  setFinalLevel,
  unsetParentFinalLevel,
  updateNode,
} from '../utils/boq-tree.utils';
import { BOQExecutionCostDialog } from './BOQExecutionCostDialog';
import { createBOQExecutionColumns, createEmptyExecutionNode } from './boq-execution-columns';
import type { BOQExecutionCostRow, BOQExecutionCostSection } from './boq-execution-cost-columns';
import type { BOQExecutionNode, BOQExecutionProps } from './types/boq-execution.types';

function updateExecutionNode(
  tree: BOQExecutionNode[],
  id: string,
  patch: Partial<BOQExecutionNode>
): BOQExecutionNode[] {
  return tree.map((n) =>
    n.id === id
      ? { ...n, ...patch }
      : { ...n, children: updateExecutionNode(n.children, id, patch) }
  );
}

const DEFAULT_HEADER_LABELS: BOQHeaderLabels = {
  title: 'Set BoQ Execution',
  searchPlaceholder: 'Pencarian',
  emptyMessage: 'Belum ada data',
  completeLabel: 'Complete',
  fullscreenEnter: 'Layar penuh',
  fullscreenExit: 'Keluar layar penuh',
  tambahButton: 'Tambah',
  simpanButton: 'Simpan',
};

const DEFAULT_COLUMN_LABELS: BOQColumnLabels = {
  kode: 'Kode',
  jobItem: 'Job/Item',
  jenis: 'Jenis',
  rab: 'RAB',
  uom: 'UoM',
  remarks: 'Remarks',
  volume: 'Volume',
  amount: 'Amount',
  material: 'Material',
  work: 'Work',
  tambah: 'Tambah',
};

const DEFAULT_TOOLTIP_LABELS: BOQTooltipLabels = {
  viewDetail: 'Lihat detail',
  addMenu: 'Tambah Menu',
  addSubMenu: 'Tambah Sub Menu',
  saveFirstToFillCost: 'Simpan terlebih dahulu untuk mengisi cost item',
};

const DEFAULT_CONTEXT_MENU_LABELS: BOQContextMenuLabels = {
  cut: 'Potong',
  copy: 'Salin',
  paste: 'Tempel',
  insertAbove: 'Sisipkan baris di atas',
  insertBelow: 'Sisipkan baris di bawah',
  delete: 'Hapus baris',
  makeLast: 'Jadikan level terakhir',
  addChild: 'Tambahkan child',
};

const DEFAULT_COST_DIALOG_LABELS: BOQCostDialogLabels = {
  detailTitle: 'Detail',
  lockedTooltip: (label: string) => `${label} tidak dapat diubah!`,
  saveButton: 'Simpan',
  savingButton: 'Menyimpan...',
};

const DEFAULT_COST_COLUMN_LABELS: BOQCostColumnLabels = {
  code: 'Code',
  name: 'Name',
  vol: 'VOL',
  uom: 'UoM',
  unitPrice: 'Unit Price',
  total: 'Total',
  salary: 'Salary/h',
  remarks: 'Remarks',
};

export function BOQExecutionDetail({
  value,
  onChange,
  nameOptions = [],
  jenisOptions = DEFAULT_JENIS_OPTIONS,
  maxDepth = DEFAULT_MAX_DEPTH,
  title,
  searchPlaceholder,
  onNameOptionsScrollEnd,
  executionCostTypes = DEFAULT_COST_TYPES,
  onOpenDetail,
  onComplete,
  isComplete = false,
  readOnly = false,
  labels,
  uomAsyncSelect,
  jenisAsyncSelect,
  onSave,
  isSaving = false,
  editableColumnIds,
  showComplete = true,
  completeDisabled,
  suggestionTree,
  onNameSearch,
  savedNodeIds,
}: BOQExecutionProps) {
  const headerLabels = useMemo(
    () => ({
      ...DEFAULT_HEADER_LABELS,
      ...labels?.header,
      title: title ?? labels?.header?.title ?? DEFAULT_HEADER_LABELS.title,
      searchPlaceholder:
        searchPlaceholder ??
        labels?.header?.searchPlaceholder ??
        DEFAULT_HEADER_LABELS.searchPlaceholder,
    }),
    [labels?.header, title, searchPlaceholder]
  );
  const columnLabels = useMemo(
    () => ({ ...DEFAULT_COLUMN_LABELS, ...labels?.columns }),
    [labels?.columns]
  );
  const tooltipLabels = useMemo(
    () => ({ ...DEFAULT_TOOLTIP_LABELS, ...labels?.tooltips }),
    [labels?.tooltips]
  );
  const contextMenuLabels = useMemo(
    () => ({ ...DEFAULT_CONTEXT_MENU_LABELS, ...labels?.contextMenu }),
    [labels?.contextMenu]
  );
  const costDialogLabels = useMemo(
    () => ({ ...DEFAULT_COST_DIALOG_LABELS, ...labels?.costDialog }),
    [labels?.costDialog]
  );
  const costColumnLabels = useMemo(
    () => ({ ...DEFAULT_COST_COLUMN_LABELS, ...labels?.costColumns }),
    [labels?.costColumns]
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const clipboardRef = useRef<string | null>(null);
  const cutSourceRef = useRef<{ rowId: string; columnId: string } | null>(null);
  const [hasClipboard, setHasClipboard] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [search, setSearch] = useState('');
  const [detailNode, setDetailNode] = useState<BOQExecutionNode | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rowsByNode] = useState<Record<string, Record<string, BOQExecutionCostRow[]>>>({});
  const [expanded, setExpanded] = useState<ExpandedState>(true);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, []);

  const codes = useMemo(() => computeCodes(value as BOQNode[]), [value]);

  // Collect only top-level parent names from suggestionTree for combobox suggestions.
  // Children stay hidden from the dropdown; selecting a parent still clones its full subtree.
  const resolvedNameOptions = useMemo(() => {
    if (nameOptions && nameOptions.length > 0) return nameOptions;
    if (!suggestionTree || suggestionTree.length === 0) return [];
    const names = new Set<string>();
    for (const n of suggestionTree) {
      if (n.name) names.add(n.name);
    }
    return Array.from(names);
  }, [nameOptions, suggestionTree]);

  const detailSections = useMemo<BOQExecutionCostSection[]>(
    () =>
      detailNode
        ? executionCostTypes.map((t) => ({
            ...t,
            disabled: true, // always read-only in execution
            rows: rowsByNode[detailNode.id]?.[t.value] ?? [],
          }))
        : [],
    [detailNode, rowsByNode, executionCostTypes]
  );

  const handleOpenDetail = useCallback(
    (node: BOQExecutionNode) => {
      if (onOpenDetail) return onOpenDetail(node);
      setDetailNode(node);
      setDetailOpen(true);
    },
    [onOpenDetail]
  );

  const addChildTo = useCallback(
    (node: BOQExecutionNode) => {
      if (!canAddChild(value as BOQNode[], node.id, maxDepth)) return;
      const withUnsetParent = unsetParentFinalLevel(value as BOQNode[], node.id);
      onChange(
        addChild(withUnsetParent, node.id, createEmptyExecutionNode()) as BOQExecutionNode[]
      );
      setExpanded((prev) => (prev === true ? prev : { ...prev, [node.id]: true }));
      setHasDraft(true);
    },
    [value, maxDepth, onChange]
  );

  const addSiblingBelow = useCallback(
    (node: BOQExecutionNode) => {
      onChange(
        addSibling(
          value as BOQNode[],
          node.id,
          'below',
          createEmptyExecutionNode()
        ) as BOQExecutionNode[]
      );
      setHasDraft(true);
    },
    [value, onChange]
  );

  const insertAbove = useCallback(
    (node: BOQExecutionNode) => {
      onChange(
        addSibling(
          value as BOQNode[],
          node.id,
          'above',
          createEmptyExecutionNode()
        ) as BOQExecutionNode[]
      );
      setHasDraft(true);
    },
    [value, onChange]
  );

  const insertBelow = useCallback(
    (node: BOQExecutionNode) => {
      onChange(
        addSibling(
          value as BOQNode[],
          node.id,
          'below',
          createEmptyExecutionNode()
        ) as BOQExecutionNode[]
      );
      setHasDraft(true);
    },
    [value, onChange]
  );

  const makeLast = useCallback(
    (node: BOQExecutionNode) => {
      onChange(setFinalLevel(value as BOQNode[], node.id) as BOQExecutionNode[]);
      setHasDraft(true);
    },
    [value, onChange]
  );

  const remove = useCallback(
    (node: BOQExecutionNode) => {
      onChange(deleteNode(value as BOQNode[], node.id) as BOQExecutionNode[]);
      setHasDraft(true);
    },
    [value, onChange]
  );

  const handleCellEdit = useCallback(
    (_rowIndex: number, columnId: string, val: unknown, row?: BOQExecutionNode) => {
      if (!row) return;

      if (columnId === 'name') {
        const name = String(val ?? '');
        // If name matches a suggestionTree node, clone its subtree
        if (suggestionTree) {
          const matched = findNodeByName(suggestionTree as BOQNode[], name);
          if (matched) {
            onChange(
              replaceNode(value as BOQNode[], row.id, cloneNode(matched)) as BOQExecutionNode[]
            );
            setHasDraft(true);
            return;
          }
        }
        onChange(
          updateNode(value as BOQNode[], row.id, {
            name,
            suggestionItemId: null,
          }) as BOQExecutionNode[]
        );
      } else if (columnId === 'jenis') {
        onChange(
          updateNode(value as BOQNode[], row.id, {
            jenis: String(val ?? ''),
          }) as BOQExecutionNode[]
        );
      } else if (columnId === 'volume_rab') {
        const numVal = val !== '' && val != null ? Number(val) : undefined;
        const patch: Partial<BOQExecutionNode> = {
          volume: { ...row.volume, rab: numVal },
        };
        onChange(updateExecutionNode(value, row.id, patch));
      } else if (columnId === 'volume_cco') {
        onChange(
          updateExecutionNode(value, row.id, {
            volume: {
              ...row.volume,
              cco: val !== '' && val != null ? Number(val) : undefined,
            },
          })
        );
      } else if (columnId === 'volume_actual') {
        onChange(
          updateExecutionNode(value, row.id, {
            volume: {
              ...row.volume,
              actual: val !== '' && val != null ? Number(val) : undefined,
            },
          })
        );
      } else if (columnId === 'volume_uom') {
        const selectedOption = uomAsyncSelect?.getItemById(String(val));
        onChange(
          updateExecutionNode(value, row.id, {
            volume: {
              ...row.volume,
              uom: selectedOption?.label ?? String(val ?? ''),
            },
            uomId: val !== '' && val != null ? String(val) : undefined,
            uomLabel: selectedOption?.label,
          })
        );
      } else if (columnId === 'remarks') {
        onChange(
          updateExecutionNode(value, row.id, {
            remarks: val !== '' && val != null ? String(val) : undefined,
          })
        );
      }
      setHasDraft(true);
    },
    [value, onChange, uomAsyncSelect, suggestionTree]
  );

  const handleTambahOrSimpan = useCallback(async () => {
    if (hasDraft) {
      onChange(value.map((n) => (n.isDraft ? { ...n, isDraft: undefined } : n)));
      try {
        await onSave?.();
        setHasDraft(false);
      } catch {
        // Keep hasDraft true so Simpan button remains visible for retry
      }
    } else {
      onChange([...value, createEmptyExecutionNode({ isDraft: true })]);
      setHasDraft(true);
    }
  }, [hasDraft, value, onChange, onSave]);

  const { columns, headerColumnTree } = useMemo(
    () =>
      createBOQExecutionColumns({
        codes,
        nameOptions: resolvedNameOptions,
        jenisOptions,
        maxDepth,
        treeData: value,
        onAddChild: addChildTo,
        onAddSiblingBelow: addSiblingBelow,
        onOpenDetail: handleOpenDetail,
        onNameSearch,
        onScrollEnd: onNameOptionsScrollEnd,
        readOnly,
        savedNodeIds,
        labels: {
          columns: columnLabels,
          tooltips: tooltipLabels,
        },
        editableColumnIds,
        uomAsyncSelect,
        jenisAsyncSelect,
        isComplete,
      }),
    [
      codes,
      resolvedNameOptions,
      jenisOptions,
      maxDepth,
      value,
      addChildTo,
      addSiblingBelow,
      handleOpenDetail,
      onNameSearch,
      onNameOptionsScrollEnd,
      readOnly,
      savedNodeIds,
      columnLabels,
      tooltipLabels,
      editableColumnIds,
      uomAsyncSelect,
      jenisAsyncSelect,
      isComplete,
    ]
  );

  const filteredValue = useMemo(() => {
    const k = search.toLowerCase().trim();
    if (!k) return value;
    const filter = (nodes: BOQExecutionNode[]): BOQExecutionNode[] =>
      nodes.reduce<BOQExecutionNode[]>((acc, node) => {
        const selfMatches =
          node.name.toLowerCase().includes(k) || node.jenis.toLowerCase().includes(k);
        const filteredChildren = filter(node.children);
        if (selfMatches || filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
        return acc;
      }, []);
    return filter(value);
  }, [value, search]);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border bg-card p-4 shadow-sm${
        isFullscreen ? ' flex flex-col overflow-hidden' : ''
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{headerLabels.title}</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={headerLabels.searchPlaceholder}
              className="w-64 pl-8"
            />
          </div>
          {/* Toggle Complete */}
          {showComplete && (
            <Switch
              checked={isComplete}
              onCheckedChange={() => onComplete?.()}
              disabled={completeDisabled}
              label={headerLabels.completeLabel}
              labelPosition="right"
            />
          )}
          {/* Fullscreen */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={isFullscreen ? headerLabels.fullscreenExit : headerLabels.fullscreenEnter}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </Button>
          {/* Tambah / Simpan */}
          {!readOnly && !hasDraft && (
            <Button
              leftIcon={<Plus />}
              type="button"
              onClick={handleTambahOrSimpan}
              disabled={readOnly}
            >
              {headerLabels.tambahButton}
            </Button>
          )}
          {hasDraft && (
            <Button
              leftIcon={<Save />}
              variant="outline"
              type="button"
              onClick={handleTambahOrSimpan}
              disabled={isSaving}
            >
              {isSaving ? 'Menyimpan...' : headerLabels.simpanButton}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={isFullscreen ? 'flex-1 overflow-auto' : undefined}>
        <DataTable<BOQExecutionNode, unknown>
          columns={columns}
          headerColumnTree={headerColumnTree}
          data={filteredValue}
          enableTreeView
          getSubRows={(r) => r.children}
          getRowId={(node) => node.id}
          expanded={expanded}
          onExpandedChange={setExpanded}
          enablePagination={false}
          enableColumnDnd={false}
          enableColumnResize={false}
          enableRangeSelection={true}
          contextMenuContainer={isFullscreen ? containerRef.current : undefined}
          popoverContainer={isFullscreen ? containerRef.current : undefined}
          emptyMessage={headerLabels.emptyMessage}
          onCellEdit={handleCellEdit}
          contextMenu={
            readOnly
              ? undefined
              : (row, options) => {
                  const node = row.original;
                  const cellValue = String(options?.activeCellInfo?.value ?? '');
                  const columnId = options?.activeCellInfo?.columnId ?? '';
                  return (
                    <BOQContextMenuItems
                      node={node as unknown as BOQNode}
                      canAddChild={findDepth(value as BOQNode[], node.id) + 1 <= maxDepth - 1}
                      canPaste={hasClipboard}
                      onCut={() => {
                        clipboardRef.current = cellValue;
                        cutSourceRef.current = { rowId: node.id, columnId };
                        setHasClipboard(true);
                        options?.triggerCut?.();
                      }}
                      onCopy={() => {
                        clipboardRef.current = cellValue;
                        cutSourceRef.current = null;
                        setHasClipboard(true);
                        options?.triggerCopy?.();
                      }}
                      onPaste={() => {
                        const val = clipboardRef.current;
                        if (val == null || !columnId) return;
                        const applyVal = (
                          tree: BOQNode[],
                          nodeId: string,
                          col: string,
                          v: string
                        ): BOQNode[] => {
                          if (col === 'name') return updateNode(tree, nodeId, { name: v });
                          if (col === 'jenis') return updateNode(tree, nodeId, { jenis: v });
                          return tree;
                        };
                        let next = applyVal(value as BOQNode[], node.id, columnId, val);
                        const cutSrc = cutSourceRef.current;
                        if (cutSrc) {
                          next = applyVal(next, cutSrc.rowId, cutSrc.columnId, '');
                          cutSourceRef.current = null;
                        }
                        clipboardRef.current = null;
                        setHasClipboard(false);
                        onChange(next as BOQExecutionNode[]);
                        setHasDraft(true);
                        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                      }}
                      onMakeLast={node.isFinalLevel ? undefined : makeLast}
                      onInsertAbove={insertAbove}
                      onInsertBelow={insertBelow}
                      onAddChild={addChildTo}
                      onDelete={remove}
                      labels={contextMenuLabels}
                    />
                  );
                }
          }
        />
      </div>

      <BOQExecutionCostDialog
        node={detailNode as unknown as BOQNode}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        sections={detailSections}
        labels={{
          dialog: costDialogLabels,
          columns: costColumnLabels,
        }}
      />
    </div>
  );
}

export default BOQExecutionDetail;
