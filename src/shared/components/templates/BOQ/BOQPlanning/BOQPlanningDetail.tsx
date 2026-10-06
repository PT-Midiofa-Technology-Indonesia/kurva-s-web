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
import type { BOQPlanningNode, BOQPlanningProps } from '../types/boq-planning.types';
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
import { BOQPlanningCostDialog } from './BOQPlanningCostDialog';
import { createBOQPlanningColumns, createEmptyPlanningNode } from './boq-planning-columns';
import type { BOQPlanningCostRow } from './boq-planning-cost.types';

function updatePlanningNode(
  tree: BOQPlanningNode[],
  id: string,
  patch: Partial<BOQPlanningNode>
): BOQPlanningNode[] {
  return tree.map((n) =>
    n.id === id ? { ...n, ...patch } : { ...n, children: updatePlanningNode(n.children, id, patch) }
  );
}

const DEFAULT_HEADER_LABELS: BOQHeaderLabels = {
  title: 'Set BoQ Planning',
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
  tambah: 'Tambah/',
};

const DEFAULT_TOOLTIP_LABELS: BOQTooltipLabels = {
  viewDetail: 'Lihat detail',
  addMenu: 'Tambah Menu',
  addSubMenu: 'Tambah Sub Menu',
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

export function BOQPlanningDetail({
  value,
  onChange,
  nameOptions: nameOptionsProp = [],
  suggestionTree,
  onNameSearch,
  jenisOptions = DEFAULT_JENIS_OPTIONS,
  maxDepth = DEFAULT_MAX_DEPTH,
  title,
  searchPlaceholder,
  onNameOptionsScrollEnd,
  planningCostTypes = DEFAULT_COST_TYPES,
  onOpenDetail,
  onComplete,
  isComplete = false,
  readOnly = false,
  labels,
  uomAsyncSelect,
  jenisAsyncSelect,
  nonEditableTooltip,
  onSave,
  isSaving = false,
  savedNodeIds,
  editableColumnIds,
  showComplete = true,
  completeDisabled = false,
}: BOQPlanningProps) {
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
  const [detailNode, setDetailNode] = useState<BOQPlanningNode | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [rowsByNode, setRowsByNode] = useState<
    Record<string, Record<string, BOQPlanningCostRow[]>>
  >({});
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
  const nameOptions = useMemo(() => {
    if (nameOptionsProp && nameOptionsProp.length > 0) return nameOptionsProp;
    if (!suggestionTree || suggestionTree.length === 0) return [];
    const names = new Set<string>();
    for (const n of suggestionTree) {
      if (n.name) names.add(n.name);
    }
    return Array.from(names);
  }, [nameOptionsProp, suggestionTree]);

  const detailSections = useMemo(
    () =>
      detailNode
        ? planningCostTypes.map((t) => ({
            ...t,
            disabled: readOnly || t.disabled,
            rows: rowsByNode[detailNode.id]?.[t.value] ?? [],
          }))
        : [],
    [detailNode, rowsByNode, planningCostTypes, readOnly]
  );

  const handleDetailSectionRowsChange = useCallback(
    (sectionValue: string, rows: BOQPlanningCostRow[]) => {
      if (!detailNode) return;
      const updatedNodeRows = { ...(rowsByNode[detailNode.id] ?? {}), [sectionValue]: rows };
      setRowsByNode((prev) => ({ ...prev, [detailNode.id]: updatedNodeRows }));
      const totalCount = Object.values(updatedNodeRows).reduce((sum, r) => sum + r.length, 0);
      onChange(
        updatePlanningNode(value, detailNode.id, {
          detailsFilledCount: totalCount > 0 ? totalCount : undefined,
        })
      );
    },
    [detailNode, rowsByNode, value, onChange]
  );

  const handleOpenDetail = useCallback(
    (node: BOQPlanningNode) => {
      if (onOpenDetail) return onOpenDetail(node);
      setDetailNode(node);
      setDetailOpen(true);
    },
    [onOpenDetail]
  );

  const addChildTo = useCallback(
    (node: BOQPlanningNode) => {
      if (!canAddChild(value as BOQNode[], node.id, maxDepth)) return;
      const withUnsetParent = unsetParentFinalLevel(value as BOQNode[], node.id);
      onChange(
        addChild(
          withUnsetParent,
          node.id,
          createEmptyPlanningNode({ isDraft: true })
        ) as BOQPlanningNode[]
      );
      setExpanded((prev) => (prev === true ? prev : { ...prev, [node.id]: true }));
      setHasDraft(true);
    },
    [value, maxDepth, onChange]
  );

  const addSiblingBelow = useCallback(
    (node: BOQPlanningNode) => {
      onChange(
        addSibling(
          value as BOQNode[],
          node.id,
          'below',
          createEmptyPlanningNode({ isDraft: true })
        ) as BOQPlanningNode[]
      );
      setHasDraft(true);
    },
    [value, onChange]
  );

  const insertAbove = useCallback(
    (node: BOQPlanningNode) => {
      onChange(
        addSibling(
          value as BOQNode[],
          node.id,
          'above',
          createEmptyPlanningNode({ isDraft: true })
        ) as BOQPlanningNode[]
      );
      setHasDraft(true);
    },
    [value, onChange]
  );

  const insertBelow = useCallback(
    (node: BOQPlanningNode) => {
      onChange(
        addSibling(
          value as BOQNode[],
          node.id,
          'below',
          createEmptyPlanningNode({ isDraft: true })
        ) as BOQPlanningNode[]
      );
      setHasDraft(true);
    },
    [value, onChange]
  );

  const makeLast = useCallback(
    (node: BOQPlanningNode) => {
      onChange(setFinalLevel(value as BOQNode[], node.id) as BOQPlanningNode[]);
      setHasDraft(true);
    },
    [value, onChange]
  );

  const remove = useCallback(
    (node: BOQPlanningNode) => {
      onChange(deleteNode(value as BOQNode[], node.id) as BOQPlanningNode[]);
      setHasDraft(true);
    },
    [value, onChange]
  );

  const handleCellEdit = useCallback(
    (_rowIndex: number, columnId: string, val: unknown, row?: BOQPlanningNode) => {
      if (!row) return;

      if (columnId === 'name') {
        const name = String(val ?? '');
        // If name matches a suggestionTree node, clone its subtree
        if (suggestionTree) {
          const matched = findNodeByName(suggestionTree as BOQNode[], name);
          if (matched) {
            onChange(
              replaceNode(value as BOQNode[], row.id, cloneNode(matched)) as BOQPlanningNode[]
            );
            setHasDraft(true);
            return;
          }
        }
        onChange(
          updateNode(value as BOQNode[], row.id, {
            name,
            suggestionItemId: null,
          }) as BOQPlanningNode[]
        );
      } else if (columnId === 'jenis') {
        onChange(
          updateNode(value as BOQNode[], row.id, { jenis: String(val ?? '') }) as BOQPlanningNode[]
        );
      } else if (columnId === 'volume_rab') {
        const newVol = val !== '' && val != null ? Number(val) : undefined;
        const unitMat = row.unitPrices?.material?.materialRab;
        const unitWrk = row.unitPrices?.material?.workRab;
        const patch: Partial<BOQPlanningNode> = {
          volume: { ...row.volume, rab: newVol },
        };
        // Only auto-compute total prices for leaf nodes (isFinalLevel=true).
        // For parent nodes, totals come from children via rollup.
        if (row.isFinalLevel && newVol != null && !Number.isNaN(newVol)) {
          const totalMat = unitMat != null ? newVol * unitMat : undefined;
          const totalWrk = unitWrk != null ? newVol * unitWrk : undefined;
          patch.unitPrices = {
            ...row.unitPrices,
            work: {
              materialRab: totalMat,
              workRab: totalWrk,
            },
          };
          const sumAmt = (totalMat ?? 0) + (totalWrk ?? 0);
          patch.amount = { rab: sumAmt > 0 ? sumAmt : undefined };
        } else if (!row.isFinalLevel) {
          // Parent node: clear any stale totals (they will be recomputed by rollup from children)
          patch.unitPrices = {
            ...row.unitPrices,
            work: { materialRab: undefined, workRab: undefined },
          };
          patch.amount = { rab: undefined };
        } else {
          // Volume cleared on leaf — reset totals
          patch.unitPrices = {
            ...row.unitPrices,
            work: { materialRab: undefined, workRab: undefined },
          };
          patch.amount = { rab: undefined };
        }
        onChange(updatePlanningNode(value, row.id, patch));
      } else if (columnId === 'volume_uom') {
        const selectedOption = uomAsyncSelect?.getItemById(String(val));
        onChange(
          updatePlanningNode(value, row.id, {
            volume: { ...row.volume, uom: selectedOption?.label ?? String(val ?? '') },
            uomId: val !== '' && val != null ? String(val) : undefined,
            uomLabel: selectedOption?.label,
          })
        );
      } else if (columnId === 'amount_rab') {
        onChange(
          updatePlanningNode(value, row.id, {
            amount: { rab: val !== '' && val != null ? Number(val) : undefined },
          })
        );
      } else if (columnId === 'bobot') {
        onChange(
          updatePlanningNode(value, row.id, {
            bobot: val !== '' && val != null ? Number(val) : null,
          })
        );
      } else if (columnId === 'remarks') {
        onChange(
          updatePlanningNode(value, row.id, {
            remarks: val !== '' && val != null ? String(val) : undefined,
          })
        );
      } else if (columnId.startsWith('unitprice_material_rab_')) {
        const catValue = columnId.slice('unitprice_material_rab_'.length);
        onChange(
          updatePlanningNode(value, row.id, {
            unitPrices: {
              ...(row.unitPrices ?? {}),
              [catValue]: {
                ...(row.unitPrices?.[catValue] ?? {}),
                materialRab: val !== '' && val != null ? Number(val) : undefined,
              },
            },
          })
        );
      } else if (columnId.startsWith('unitprice_work_rab_')) {
        const catValue = columnId.slice('unitprice_work_rab_'.length);
        onChange(
          updatePlanningNode(value, row.id, {
            unitPrices: {
              ...(row.unitPrices ?? {}),
              [catValue]: {
                ...(row.unitPrices?.[catValue] ?? {}),
                workRab: val !== '' && val != null ? Number(val) : undefined,
              },
            },
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
      onChange([...value, createEmptyPlanningNode({ isDraft: true })]);
      setHasDraft(true);
    }
  }, [hasDraft, value, onChange, onSave]);

  const { columns, headerColumnTree } = useMemo(
    () =>
      createBOQPlanningColumns({
        codes,
        nameOptions,
        jenisOptions,
        maxDepth,
        treeData: value,
        onAddChild: addChildTo,
        onAddSiblingBelow: addSiblingBelow,
        onOpenDetail: handleOpenDetail,
        onScrollEnd: onNameOptionsScrollEnd,
        onNameSearch,
        readOnly,
        savedNodeIds,
        labels: {
          columns: columnLabels,
          tooltips: tooltipLabels,
        },
        editableColumnIds,
        uomAsyncSelect,
        jenisAsyncSelect,
      }),
    [
      codes,
      nameOptions,
      jenisOptions,
      maxDepth,
      value,
      addChildTo,
      addSiblingBelow,
      handleOpenDetail,
      onNameOptionsScrollEnd,
      onNameSearch,
      readOnly,
      savedNodeIds,
      columnLabels,
      tooltipLabels,
      editableColumnIds,
      uomAsyncSelect,
      jenisAsyncSelect,
    ]
  );

  const filteredValue = useMemo(() => {
    const k = search.toLowerCase().trim();
    if (!k) return value;
    const filter = (nodes: BOQPlanningNode[]): BOQPlanningNode[] =>
      nodes.reduce<BOQPlanningNode[]>((acc, node) => {
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
      className={`rounded-xl border bg-card p-4 shadow-sm${isFullscreen ? ' flex flex-col overflow-hidden' : ''}`}
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
              disabled={completeDisabled}
              onCheckedChange={() => onComplete?.()}
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
          {!readOnly &&
            (!hasDraft ? (
              <Button
                leftIcon={<Plus />}
                type="button"
                onClick={handleTambahOrSimpan}
                disabled={readOnly}
              >
                {headerLabels.tambahButton}
              </Button>
            ) : (
              <Button
                leftIcon={<Save />}
                variant="outline"
                type="button"
                onClick={handleTambahOrSimpan}
                disabled={isSaving}
              >
                {isSaving ? 'Menyimpan...' : headerLabels.simpanButton}
              </Button>
            ))}
        </div>
      </div>

      {/* Table */}
      <div className={isFullscreen ? 'flex-1 overflow-auto' : undefined}>
        <DataTable<BOQPlanningNode, unknown>
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
          enableRangeSelection={!readOnly}
          contextMenuContainer={isFullscreen ? containerRef.current : undefined}
          popoverContainer={isFullscreen ? containerRef.current : undefined}
          emptyMessage={headerLabels.emptyMessage}
          onCellEdit={readOnly ? undefined : handleCellEdit}
          nonEditableTooltip={nonEditableTooltip}
          contextMenu={
            readOnly
              ? undefined
              : (row, options) => {
                  const node = row.original;
                  const cellValue = String(options?.activeCellInfo?.value ?? '');
                  const columnId = options?.activeCellInfo?.columnId ?? '';
                  return (
                    <BOQContextMenuItems
                      node={node}
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
                          tree: BOQPlanningNode[],
                          nodeId: string,
                          col: string,
                          v: string
                        ): BOQPlanningNode[] => {
                          if (col === 'name')
                            return updateNode(tree as BOQNode[], nodeId, {
                              name: v,
                            }) as BOQPlanningNode[];
                          if (col === 'jenis')
                            return updateNode(tree as BOQNode[], nodeId, {
                              jenis: v,
                            }) as BOQPlanningNode[];
                          if (col === 'volume_rab') {
                            const newVol = v ? Number(v) : undefined;
                            const node = tree.find((n) => n.id === nodeId);
                            const unitMat = node?.unitPrices?.material?.materialRab;
                            const unitWrk = node?.unitPrices?.material?.workRab;
                            const patch: Partial<BOQPlanningNode> = {
                              volume: { ...node?.volume, rab: newVol },
                            };
                            if (newVol != null && !Number.isNaN(newVol)) {
                              const totalMat = unitMat != null ? newVol * unitMat : undefined;
                              const totalWrk = unitWrk != null ? newVol * unitWrk : undefined;
                              patch.unitPrices = {
                                ...node?.unitPrices,
                                work: {
                                  materialRab: totalMat,
                                  workRab: totalWrk,
                                },
                              };
                              const sumAmt = (totalMat ?? 0) + (totalWrk ?? 0);
                              patch.amount = { rab: sumAmt > 0 ? sumAmt : undefined };
                            } else {
                              patch.unitPrices = {
                                ...node?.unitPrices,
                                work: { materialRab: undefined, workRab: undefined },
                              };
                              patch.amount = { rab: undefined };
                            }
                            return updatePlanningNode(tree, nodeId, patch);
                          }
                          if (col === 'volume_uom') {
                            const selectedOption = uomAsyncSelect?.getItemById(v);
                            return updatePlanningNode(tree, nodeId, {
                              volume: {
                                ...tree.find((n) => n.id === nodeId)?.volume,
                                uom: selectedOption?.label ?? v,
                              },
                              uomId: v ? v : undefined,
                              uomLabel: selectedOption?.label,
                            });
                          }
                          if (col === 'amount_rab')
                            return updatePlanningNode(tree, nodeId, {
                              amount: { rab: v ? Number(v) : undefined },
                            });
                          if (col === 'remarks')
                            return updatePlanningNode(tree, nodeId, {
                              remarks: v ? v : undefined,
                            });
                          return tree;
                        };
                        let next = applyVal(value, node.id, columnId, val);
                        const cutSrc = cutSourceRef.current;
                        if (cutSrc) {
                          next = applyVal(next, cutSrc.rowId, cutSrc.columnId, '');
                          cutSourceRef.current = null;
                        }
                        clipboardRef.current = null;
                        setHasClipboard(false);
                        onChange(next);
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

      <BOQPlanningCostDialog
        node={detailNode}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        sections={detailSections}
        onSectionRowsChange={handleDetailSectionRowsChange}
        readOnly={readOnly}
        labels={{
          dialog: costDialogLabels,
          columns: costColumnLabels,
        }}
      />
    </div>
  );
}

export default BOQPlanningDetail;
