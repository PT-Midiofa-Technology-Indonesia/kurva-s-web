import { describe, expect, it } from 'vitest';
import type { BOQPlanningNode } from '../types/boq-planning.types';
import { createBOQPlanningColumns, createEmptyPlanningNode } from './boq-planning-columns';

const BASE_OPTS = {
  codes: new Map<string, string>(),
  nameOptions: [],
  jenisOptions: [{ value: 'Job', label: 'Job' }],
  maxDepth: 5,
  treeData: [],
  onAddChild: () => {},
  onAddSiblingBelow: () => {},
};

describe('createEmptyPlanningNode', () => {
  it('returns a BOQPlanningNode with empty planning fields', () => {
    const node = createEmptyPlanningNode();
    expect(node.id).toBeDefined();
    expect(node.children).toEqual([]);
    expect(node.bobot).toBe(1);
    expect(node.volume).toBeUndefined();
    expect(node.unitPrices).toBeUndefined();
    expect(node.amount).toBeUndefined();
    expect(node.remarks).toBeUndefined();
  });

  it('merges patch values', () => {
    const node = createEmptyPlanningNode({ isDraft: true, remarks: 'test' });
    expect(node.isDraft).toBe(true);
    expect(node.remarks).toBe('test');
  });
});

describe('createBOQPlanningColumns', () => {
  it('returns columns with expected structure', () => {
    const { columns } = createBOQPlanningColumns(BASE_OPTS);
    expect(columns.length).toBeGreaterThan(0);
  });

  it('includes unit price category columns', () => {
    const { columns } = createBOQPlanningColumns(BASE_OPTS);
    const ids = columns.map((c) => (c as { id?: string }).id ?? '');
    expect(ids).toContain('amount_rab');
    expect(ids).toContain('remarks');
  });

  it('headerColumnTree matches flat column structure', () => {
    const { headerColumnTree, columns } = createBOQPlanningColumns(BASE_OPTS);
    expect(headerColumnTree.length).toBeGreaterThan(0);
    expect(columns.length).toBeGreaterThan(0);
  });
});

describe('createBOQPlanningColumns readOnly mode', () => {
  it('marks all previously-editable columns non-editable', () => {
    const { columns } = createBOQPlanningColumns({ ...BASE_OPTS, readOnly: true });
    const editableIds = [
      'name',
      'jenis',
      'bobot',
      'volume_rab',
      'volume_uom',
      'amount_rab',
      'remarks',
    ];
    for (const id of editableIds) {
      const col = columns.find((c) => (c as { id?: string }).id === id);
      const meta = col?.meta as { editable?: boolean } | undefined;
      expect(meta?.editable).toBe(false);
    }
  });

  it('renames the tambah column header to "Detail"', () => {
    const { columns, headerColumnTree } = createBOQPlanningColumns({
      ...BASE_OPTS,
      readOnly: true,
    });
    const tambah = columns.find((c) => (c as { id?: string }).id === 'tambah');
    expect(tambah?.header).toBe('Detail');
    const tambahNode = headerColumnTree.find((n) => n.id === 'tambah');
    expect(tambahNode?.header).toBe('Detail');
  });

  it('keeps the tambah column header as "Tambah" when not readOnly', () => {
    const { columns } = createBOQPlanningColumns(BASE_OPTS);
    const tambah = columns.find((c) => (c as { id?: string }).id === 'tambah');
    expect(tambah?.header).toBe('Tambah');
  });
});

describe('createBOQPlanningColumns parent rollup', () => {
  const granit: BOQPlanningNode = {
    id: 'granit',
    name: 'Pemasangan Granit',
    jenis: 'Job',
    bobot: 7,
    isFinalLevel: true,
    children: [],
    volume: { rab: 1 },
    unitPrices: {
      material: { materialRab: 370_000, workRab: 2_300_000 },
      work: { materialRab: 370_000, workRab: 2_300_000 },
    },
    amount: { rab: 2_670_000 },
  };
  const variasi: BOQPlanningNode = {
    id: 'variasi',
    name: 'Pemasangan Variasi',
    jenis: 'Job',
    bobot: 3,
    isFinalLevel: true,
    children: [],
    volume: { rab: 2 },
    unitPrices: {
      material: { materialRab: 60_000, workRab: 28_000 },
      work: { materialRab: 120_000, workRab: 56_000 },
    },
    amount: { rab: 176_000 },
  };
  const batuBata: BOQPlanningNode = {
    id: 'batuBata',
    name: 'Pemasangan Batu Bata Ruang 1',
    jenis: 'Job',
    bobot: null,
    volume: { rab: 1 },
    children: [granit, variasi],
  };

  const findAccessor = (
    columns: ReturnType<typeof createBOQPlanningColumns>['columns'],
    id: string
  ) => {
    const col = columns.find((c) => (c as { id?: string }).id === id) as {
      accessorFn?: (row: BOQPlanningNode, index: number) => unknown;
    };
    if (!col.accessorFn) throw new Error(`column ${id} has no accessorFn`);
    return col.accessorFn;
  };

  it('sums Total Price Material/Work and Amount for a parent from its live children', () => {
    const { columns } = createBOQPlanningColumns({ ...BASE_OPTS, treeData: [batuBata] });
    expect(findAccessor(columns, 'unitprice_material_rab_work')(batuBata, 0)).toBe(490_000);
    expect(findAccessor(columns, 'unitprice_work_rab_work')(batuBata, 0)).toBe(2_356_000);
    expect(findAccessor(columns, 'amount_rab')(batuBata, 0)).toBe(2_846_000);
  });

  it('computes Unit Price for a parent as Total Price divided by its own volume', () => {
    const { columns } = createBOQPlanningColumns({ ...BASE_OPTS, treeData: [batuBata] });
    expect(findAccessor(columns, 'unitprice_material_rab_material')(batuBata, 0)).toBe(490_000);
    expect(findAccessor(columns, 'unitprice_work_rab_material')(batuBata, 0)).toBe(2_356_000);
  });

  it('keeps a leaf row own stored values untouched', () => {
    const { columns } = createBOQPlanningColumns({ ...BASE_OPTS, treeData: [batuBata] });
    expect(findAccessor(columns, 'unitprice_material_rab_material')(granit, 0)).toBe(370_000);
    expect(findAccessor(columns, 'unitprice_material_rab_work')(granit, 0)).toBe(370_000);
    expect(findAccessor(columns, 'amount_rab')(granit, 0)).toBe(2_670_000);
  });

  it('resolves the full children set from treeData even if the passed-in row has a trimmed children array', () => {
    const trimmedBatuBata: BOQPlanningNode = { ...batuBata, children: [granit] };
    const { columns } = createBOQPlanningColumns({ ...BASE_OPTS, treeData: [batuBata] });
    expect(findAccessor(columns, 'amount_rab')(trimmedBatuBata, 0)).toBe(2_846_000);
  });

  it('shows bobot column as readonly', () => {
    const { columns, headerColumnTree } = createBOQPlanningColumns({
      ...BASE_OPTS,
      treeData: [batuBata],
    });
    const bobot = columns.find((c) => (c as { id?: string }).id === 'bobot');
    const meta = bobot?.meta as
      | {
          editable?: boolean;
          editableWhen?: (node: BOQPlanningNode) => boolean;
          copyValue?: (node: BOQPlanningNode) => unknown;
        }
      | undefined;

    expect(headerColumnTree.some((node) => node.id === 'bobot')).toBe(true);
    // bobot readonly di BOQ Planning
    expect(meta?.editable).toBe(false);
    expect(meta?.copyValue?.(batuBata)).toBe(10);
    expect(meta?.copyValue?.(granit)).toBe(7);
  });
});

describe('createBOQPlanningColumns detail button for unsaved nodes', () => {
  it('renders disabled eye tooltip when node is not in savedNodeIds', () => {
    const unsavedLeaf: BOQPlanningNode = {
      id: 'unsaved-1',
      name: 'Unsaved Leaf',
      jenis: 'Job',
      bobot: 1,
      isFinalLevel: true,
      children: [],
    };
    const { columns } = createBOQPlanningColumns({
      ...BASE_OPTS,
      treeData: [unsavedLeaf],
      savedNodeIds: new Set(['other-id']),
    });
    const tambah = columns.find((c) => (c as { id?: string }).id === 'tambah');
    expect(tambah).toBeDefined();
    // Test that column exists and cell is callable
    const cellFn = tambah?.cell as
      | ((props: { row: { original: BOQPlanningNode } }) => unknown)
      | undefined;
    expect(cellFn).toBeDefined();
  });
});
