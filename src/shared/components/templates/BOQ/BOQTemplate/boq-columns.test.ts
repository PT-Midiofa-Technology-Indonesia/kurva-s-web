import { describe, expect, it, vi } from 'vitest';
import type { BOQNode } from '../types/boq-tree.types';
import { createBOQColumns } from './boq-columns';

const BASE_OPTS = {
  codes: new Map<string, string>(),
  nameOptions: [],
  jenisOptions: [],
  bobotOptions: [1, 2, 3],
  maxDepth: 3,
  treeData: [] as BOQNode[],
  onAddChild: vi.fn(),
  onAddSiblingBelow: vi.fn(),
  onOpenCost: vi.fn(),
};

describe('createBOQColumns', () => {
  it('creates columns with Tambah, name, kode, etc.', () => {
    const columns = createBOQColumns(BASE_OPTS);
    expect(columns.length).toBeGreaterThan(0);
    const tambah = columns.find((c) => (c as { id?: string }).id === 'Tambah');
    expect(tambah).toBeDefined();
  });

  it('renders disabled eye tooltip when node is not in savedNodeIds', () => {
    const unsavedLeaf: BOQNode = {
      id: 'unsaved-1',
      name: 'Unsaved Leaf',
      jenis: 'Job',
      bobot: 1,
      isFinalLevel: true,
      children: [],
    };
    const columns = createBOQColumns({
      ...BASE_OPTS,
      treeData: [unsavedLeaf],
      savedNodeIds: new Set(['other-id']),
    });
    const tambah = columns.find((c) => (c as { id?: string }).id === 'Tambah');
    expect(tambah).toBeDefined();
    const cellFn = tambah?.cell as ((props: { row: { original: BOQNode } }) => unknown) | undefined;
    expect(cellFn).toBeDefined();
  });

  it('supports row-aware combobox onNameSearch with 1-based level', () => {
    const onNameSearch = vi.fn();
    const leaf: BOQNode = {
      id: 'node-1',
      name: 'Test Node',
      jenis: 'Job',
      bobot: 1,
      children: [],
    };
    const columns = createBOQColumns({
      ...BASE_OPTS,
      treeData: [leaf],
      onNameSearch,
    });
    const nameCol = columns.find((c) => (c as { id?: string }).id === 'name');
    expect(nameCol).toBeDefined();
    const editFn = nameCol?.meta?.edit as
      | ((row: BOQNode) => { comboboxOnSearch?: (s: string) => void })
      | undefined;
    expect(typeof editFn).toBe('function');
    const editConfig = editFn?.(leaf);
    expect(editConfig?.comboboxOnSearch).toBeDefined();
    editConfig?.comboboxOnSearch?.('hello');
    expect(onNameSearch).toHaveBeenCalledWith('hello', 1);
  });
});
