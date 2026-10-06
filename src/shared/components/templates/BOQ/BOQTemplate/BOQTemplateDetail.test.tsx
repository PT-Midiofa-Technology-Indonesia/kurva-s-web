import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { BOQNode } from '../types/boq-tree.types';
import { BOQTemplateDetail } from './BOQTemplateDetail';
import * as boqColumnsModule from './boq-columns';

// DataTable mock — captures onCellEdit so tests can simulate cell edits.
// vi.mock is hoisted, so the holder must live at module scope.
const capturedOnCellEdits: Array<{
  onCellEdit?: (rowIndex: number, columnId: string, val: unknown, row?: BOQNode) => void;
}> = [];

vi.mock('@/components/organisms/DataTable', () => ({
  DataTable: (props: {
    onCellEdit?: (rowIndex: number, columnId: string, val: unknown, row?: BOQNode) => void;
  }) => {
    capturedOnCellEdits.push(props);
    return <div data-testid="mock-data-table" />;
  },
}));

describe('BOQTemplateDetail suggestionTree behavior', () => {
  it('only passes top-level parent names to comboboxOptions, excluding children', () => {
    const createBOQColumnsSpy = vi.spyOn(boqColumnsModule, 'createBOQColumns');

    const suggestionTree: BOQNode[] = [
      {
        id: 'parent-1',
        name: 'Pekerjaan Persiapan',
        jenis: 'Job',
        bobot: 1,
        children: [
          {
            id: 'child-1-1',
            name: 'Pembersihan Lahan',
            jenis: 'Job',
            bobot: 1,
            children: [],
          },
        ],
      },
      {
        id: 'parent-2',
        name: 'Pekerjaan Struktur',
        jenis: 'Job',
        bobot: 2,
        children: [
          {
            id: 'child-2-1',
            name: 'Pondasi Bore Pile',
            jenis: 'Job',
            bobot: 1,
            children: [],
          },
        ],
      },
    ];

    render(<BOQTemplateDetail value={[]} onChange={vi.fn()} suggestionTree={suggestionTree} />);

    expect(createBOQColumnsSpy).toHaveBeenCalled();
    const lastCall = createBOQColumnsSpy.mock.calls.at(-1);
    const passedOptions = lastCall?.[0]?.nameOptions;

    expect(passedOptions).toEqual(['Pekerjaan Persiapan', 'Pekerjaan Struktur']);
    expect(passedOptions).not.toContain('Pembersihan Lahan');
    expect(passedOptions).not.toContain('Pondasi Bore Pile');

    createBOQColumnsSpy.mockRestore();
  });

  it('clones full subtree when parent name is selected from suggestionTree', () => {
    const onChange = vi.fn();
    const suggestionTree: BOQNode[] = [
      {
        id: 'parent-1',
        name: 'Pekerjaan Persiapan',
        jenis: 'Job',
        bobot: 1,
        children: [
          {
            id: 'child-1-1',
            name: 'Pembersihan Lahan',
            jenis: 'Job',
            bobot: 1,
            children: [],
          },
        ],
      },
    ];

    const initialTree: BOQNode[] = [
      {
        id: 'draft-node-1',
        name: '',
        jenis: 'Job',
        bobot: null,
        children: [],
      },
    ];

    render(
      <BOQTemplateDetail value={initialTree} onChange={onChange} suggestionTree={suggestionTree} />
    );

    const dataTableProps = capturedOnCellEdits.at(-1);
    expect(dataTableProps?.onCellEdit).toBeDefined();

    // Simulate editing name cell with parent name from suggestion dropdown
    dataTableProps?.onCellEdit?.(0, 'name', 'Pekerjaan Persiapan', initialTree[0]);

    expect(onChange).toHaveBeenCalled();
    const updatedTree = onChange.mock.calls[0][0] as BOQNode[];
    expect(updatedTree).toHaveLength(1);
    expect(updatedTree[0].name).toBe('Pekerjaan Persiapan');
    expect(updatedTree[0].suggestionItemId).toBe('parent-1');
    expect(updatedTree[0].children).toHaveLength(1);
    expect(updatedTree[0].children[0].name).toBe('Pembersihan Lahan');
    expect(updatedTree[0].children[0].suggestionItemId).toBe('child-1-1');
  });

  it('sets suggestionItemId to null when manual text is entered', () => {
    const onChange = vi.fn();
    const initialTree: BOQNode[] = [
      {
        id: 'draft-node-1',
        name: '',
        jenis: 'Job',
        bobot: null,
        children: [],
        suggestionItemId: 'old-suggestion-id',
      },
    ];

    render(<BOQTemplateDetail value={initialTree} onChange={onChange} />);

    const dataTableProps = capturedOnCellEdits.at(-1);
    dataTableProps?.onCellEdit?.(0, 'name', 'Custom Manual Name', initialTree[0]);

    expect(onChange).toHaveBeenCalled();
    const updatedTree = onChange.mock.calls[0][0] as BOQNode[];
    expect(updatedTree[0].name).toBe('Custom Manual Name');
    expect(updatedTree[0].suggestionItemId).toBeNull();
  });
});
