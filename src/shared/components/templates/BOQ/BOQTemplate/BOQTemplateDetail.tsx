'use client';

import type { ExpandedState } from '@tanstack/react-table';
import { Expand, Minimize2, Plus, Save, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { DataTable } from '@/components/organisms/DataTable';
import type { BOQCostRow, BOQCostSection } from '../types/boq-cost.types';
import type { BOQHeaderLabels } from '../types/boq-labels.types';
import type { BOQNode, BOQTemplateDetailProps } from '../types/boq-tree.types';
import {
  DEFAULT_BOBOT_OPTIONS,
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
  createEmptyNode,
  deleteNode,
  findDepth,
  findNodeByName,
  replaceNode,
  setFinalLevel,
  updateNode,
} from '../utils/boq-tree.utils';
import { BOQTemplateCostDialog } from './BOQTemplateCostDialog';
import { createBOQColumns } from './boq-columns';

const DEFAULT_HEADER_LABELS: BOQHeaderLabels = {
  title: 'Set BoQ Template',
  searchPlaceholder: 'Pencarian',
  fullscreenEnter: 'Layar penuh',
  fullscreenExit: 'Keluar layar penuh',
  tambahButton: 'Tambah',
  simpanButton: 'Simpan',
  emptyMessage: 'Belum ada data',
};

export function BOQTemplateDetail({
  value,
  onChange,
  nameOptions: nameOptionsProp,
  suggestionTree,
  onNameSearch,
  jenisOptions = DEFAULT_JENIS_OPTIONS,
  jenisAsyncSelect,
  bobotOptions = DEFAULT_BOBOT_OPTIONS,
  maxDepth = DEFAULT_MAX_DEPTH,
  title: titleProp,
  searchPlaceholder: searchPlaceholderProp,
  onOpenCost,
  onNameOptionsScrollEnd,
  costTypes = DEFAULT_COST_TYPES,
  labels,
  savedNodeIds,
  onSave,
  isSaving,
}: BOQTemplateDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clipboardRef = useRef<string | null>(null);
  const cutSourceRef = useRef<{ rowId: string; columnId: string } | null>(null);
  const [hasClipboard, setHasClipboard] = useState(false);

  const mergedLabels = useMemo(
    () => ({
      header: { ...DEFAULT_HEADER_LABELS, ...labels?.header },
      contextMenu: labels?.contextMenu,
      tooltips: labels?.tooltips,
      costDialog: labels?.costDialog,
      columns: labels?.columns,
      costColumns: labels?.costColumns,
    }),
    [labels]
  );

  const title = titleProp ?? mergedLabels.header.title;
  const searchPlaceholder = searchPlaceholderProp ?? mergedLabels.header.searchPlaceholder;

  const [costNode, setCostNode] = useState<BOQNode | null>(null);
  const [costOpen, setCostOpen] = useState(false);
  // rowsByNode[nodeId][sectionValue] = rows
  const [rowsByNode, setRowsByNode] = useState<Record<string, Record<string, BOQCostRow[]>>>({});

  const costSections = useMemo<BOQCostSection[]>(() => {
    if (!costNode) return [];
    const stored = rowsByNode[costNode.id] ?? {};
    return costTypes.map((t) => ({ ...t, rows: stored[t.value] ?? [] }));
  }, [costNode, rowsByNode, costTypes]);

  const handleSectionRowsChange = useCallback(
    (sectionValue: string, rows: BOQCostRow[]) => {
      if (!costNode) return;
      setRowsByNode((prev) => ({
        ...prev,
        [costNode.id]: { ...(prev[costNode.id] ?? {}), [sectionValue]: rows },
      }));
    },
    [costNode]
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const filteredValue = useMemo(() => {
    const k = search.toLowerCase().trim();
    if (!k) return value;
    const filter = (nodes: BOQNode[]): BOQNode[] =>
      nodes.reduce<BOQNode[]>((acc, node) => {
        const filteredChildren = filter(node.children);
        const selfMatches =
          node.name?.toLowerCase().includes(k) || node.jenis?.toLowerCase().includes(k);
        if (selfMatches || filteredChildren.length > 0) {
          acc.push({ ...node, children: filteredChildren });
        }
        return acc;
      }, []);
    return filter(value);
  }, [value, search]);

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

  const [hasDraft, setHasDraft] = useState(false);
  const codes = useMemo(() => computeCodes(value), [value]);

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

  const handleOpenCost = useCallback(
    (node: BOQNode) => {
      if (onOpenCost) return onOpenCost(node);
      setCostNode(node);
      setCostOpen(true);
    },
    [onOpenCost]
  );

  // ── Tree mutation helpers (all call onChange) ──────────────────────────────
  const addChildTo = useCallback(
    (node: BOQNode) => {
      if (!canAddChild(value, node.id, maxDepth)) return;
      onChange(addChild(value, node.id, createEmptyNode({ isDraft: true })));
      setExpanded((prev) => (prev === true ? prev : { ...prev, [node.id]: true }));
      setHasDraft(true);
    },
    [value, maxDepth, onChange]
  );
  const addSiblingBelow = useCallback(
    (node: BOQNode) => {
      onChange(addSibling(value, node.id, 'below', createEmptyNode({ isDraft: true })));
      setHasDraft(true);
    },
    [value, onChange]
  );
  const insertAbove = useCallback(
    (node: BOQNode) => {
      onChange(addSibling(value, node.id, 'above', createEmptyNode({ isDraft: true })));
      setHasDraft(true);
    },
    [value, onChange]
  );
  const insertBelow = useCallback(
    (node: BOQNode) => {
      onChange(addSibling(value, node.id, 'below', createEmptyNode({ isDraft: true })));
      setHasDraft(true);
    },
    [value, onChange]
  );
  const makeLast = useCallback(
    (node: BOQNode) => {
      onChange(setFinalLevel(value, node.id));
      setHasDraft(true);
    },
    [value, onChange]
  );
  const remove = useCallback(
    (node: BOQNode) => {
      onChange(deleteNode(value, node.id));
      setHasDraft(true);
    },
    [value, onChange]
  );
  const handleCellEdit = useCallback(
    (_rowIndex: number, columnId: string, val: unknown, row?: BOQNode) => {
      if (!row) return;
      if (columnId === 'name') {
        const name = String(val ?? '');
        // If name matches a suggestionTree node, clone its subtree
        if (suggestionTree) {
          const matched = findNodeByName(suggestionTree, name);
          if (matched) {
            onChange(replaceNode(value, row.id, cloneNode(matched)));
            setHasDraft(true);
            return;
          }
        }
        onChange(updateNode(value, row.id, { name, suggestionItemId: null }));
      } else if (columnId === 'jenis')
        onChange(updateNode(value, row.id, { jenis: String(val ?? '') }));
      else if (columnId === 'bobot') onChange(updateNode(value, row.id, { bobot: Number(val) }));
      setHasDraft(true);
    },
    [value, onChange, suggestionTree]
  );

  // ── Header: Tambah / Simpan ────────────────────────────────────────────────
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
      onChange([...value, createEmptyNode({ isDraft: true })]);
      setHasDraft(true);
    }
  }, [hasDraft, value, onChange, onSave]);

  // ── Columns ────────────────────────────────────────────────────────────────
  const columns = useMemo(
    () =>
      createBOQColumns({
        codes,
        nameOptions,
        jenisOptions,
        jenisAsyncSelect,
        bobotOptions,
        maxDepth,
        treeData: value,
        onAddChild: addChildTo,
        onAddSiblingBelow: addSiblingBelow,
        onOpenCost: handleOpenCost,
        onScrollEnd: onNameOptionsScrollEnd,
        onNameSearch,
        savedNodeIds,
        labels: { columns: mergedLabels.columns, tooltips: mergedLabels.tooltips },
      }),
    [
      codes,
      nameOptions,
      jenisOptions,
      jenisAsyncSelect,
      bobotOptions,
      maxDepth,
      value,
      addChildTo,
      addSiblingBelow,
      handleOpenCost,
      onNameOptionsScrollEnd,
      onNameSearch,
      savedNodeIds,
      mergedLabels.columns,
      mergedLabels.tooltips,
    ]
  );

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border bg-card p-4 shadow-sm${isFullscreen ? ' flex flex-col overflow-hidden' : ''}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-64 pl-8"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={
              isFullscreen
                ? mergedLabels.header.fullscreenExit
                : mergedLabels.header.fullscreenEnter
            }
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </Button>
          {!hasDraft ? (
            <Button leftIcon={<Plus />} type="button" onClick={handleTambahOrSimpan}>
              {mergedLabels.header.tambahButton}
            </Button>
          ) : (
            <Button
              leftIcon={<Save />}
              variant={'outline'}
              type="button"
              onClick={handleTambahOrSimpan}
              disabled={isSaving}
            >
              {isSaving ? 'Menyimpan...' : mergedLabels.header.simpanButton}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={isFullscreen ? 'flex-1 overflow-auto' : undefined}>
        <DataTable<BOQNode, unknown>
          columns={columns}
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
          emptyMessage={mergedLabels.header.emptyMessage}
          onCellEdit={handleCellEdit}
          contextMenu={(row, options) => {
            const node = row.original;
            const cellValue = String(options?.activeCellInfo?.value ?? '');
            const columnId = options?.activeCellInfo?.columnId ?? '';
            return (
              <BOQContextMenuItems
                node={node}
                canAddChild={findDepth(value, node.id) + 1 <= maxDepth - 1}
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
                    if (col === 'bobot')
                      return updateNode(tree, nodeId, { bobot: v ? Number(v) : null });
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
                onMakeLast={makeLast}
                onInsertAbove={insertAbove}
                onInsertBelow={insertBelow}
                onAddChild={addChildTo}
                onDelete={remove}
                labels={mergedLabels.contextMenu}
              />
            );
          }}
        />
      </div>

      <BOQTemplateCostDialog
        node={costNode}
        open={costOpen}
        onOpenChange={setCostOpen}
        sections={costSections}
        onSectionRowsChange={handleSectionRowsChange}
        labels={{ dialog: mergedLabels.costDialog, columns: mergedLabels.costColumns }}
      />
    </div>
  );
}

export default BOQTemplateDetail;
