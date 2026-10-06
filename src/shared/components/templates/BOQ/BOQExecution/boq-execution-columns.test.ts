import { describe, expect, it } from 'vitest';
import { createBOQExecutionColumns } from './boq-execution-columns';
import type { BOQExecutionNode } from './types/boq-execution.types';

const BASE_OPTS = {
  codes: new Map<string, string>(),
  nameOptions: [],
  jenisOptions: [{ value: 'Job', label: 'Job' }],
  maxDepth: 5,
  treeData: [],
  onAddChild: () => {},
  onAddSiblingBelow: () => {},
};

const leaf: BOQExecutionNode = {
  id: 'leaf-1',
  name: 'Pondasi',
  jenis: 'Job',
  bobot: 7,
  isFinalLevel: true,
  children: [],
};

const parent: BOQExecutionNode = {
  id: 'parent-1',
  name: 'Pekerjaan Beton',
  jenis: 'Job',
  bobot: null,
  isFinalLevel: false,
  children: [leaf],
};

describe('createBOQExecutionColumns bobot column', () => {
  it('includes bobot column in columns and headerColumnTree', () => {
    const { columns, headerColumnTree } = createBOQExecutionColumns({
      ...BASE_OPTS,
      treeData: [parent],
    });
    const bobot = columns.find((c) => (c as { id?: string }).id === 'bobot');
    expect(bobot).toBeDefined();
    expect(headerColumnTree.some((n) => n.id === 'bobot')).toBe(true);
  });

  it('bobot column is always non-editable (readonly)', () => {
    const { columns } = createBOQExecutionColumns({
      ...BASE_OPTS,
      treeData: [parent],
    });
    const bobot = columns.find((c) => (c as { id?: string }).id === 'bobot');
    const meta = bobot?.meta as { editable?: boolean } | undefined;
    expect(meta?.editable).toBe(false);
  });

  it('copyValue returns leaf bobot for leaf node', () => {
    const { columns } = createBOQExecutionColumns({
      ...BASE_OPTS,
      treeData: [parent],
    });
    const bobot = columns.find((c) => (c as { id?: string }).id === 'bobot');
    const meta = bobot?.meta as { copyValue?: (n: BOQExecutionNode) => unknown } | undefined;
    expect(meta?.copyValue?.(leaf)).toBe(7);
  });

  it('copyValue returns sum of children bobot for parent node', () => {
    const { columns } = createBOQExecutionColumns({
      ...BASE_OPTS,
      treeData: [parent],
    });
    const bobot = columns.find((c) => (c as { id?: string }).id === 'bobot');
    const meta = bobot?.meta as { copyValue?: (n: BOQExecutionNode) => unknown } | undefined;
    expect(meta?.copyValue?.(parent)).toBe(7);
  });
});

describe('createBOQExecutionColumns CCO & ACT editability', () => {
  it('allows editing volume_cco and volume_actual when isComplete is false', () => {
    const { columns } = createBOQExecutionColumns({
      ...BASE_OPTS,
      treeData: [leaf],
      isComplete: false,
    });
    const cco = columns.find((c) => (c as { id?: string }).id === 'volume_cco');
    const act = columns.find((c) => (c as { id?: string }).id === 'volume_actual');

    expect((cco?.meta as { editable?: boolean })?.editable).toBe(true);
    expect((act?.meta as { editable?: boolean })?.editable).toBe(true);
  });

  it('disables volume_cco and volume_actual when isComplete is true', () => {
    const { columns } = createBOQExecutionColumns({
      ...BASE_OPTS,
      treeData: [leaf],
      isComplete: true,
    });
    const cco = columns.find((c) => (c as { id?: string }).id === 'volume_cco');
    const act = columns.find((c) => (c as { id?: string }).id === 'volume_actual');

    expect((cco?.meta as { editable?: boolean })?.editable).toBe(false);
    expect((act?.meta as { editable?: boolean })?.editable).toBe(false);
  });
});
