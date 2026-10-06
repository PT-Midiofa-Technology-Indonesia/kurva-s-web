import { describe, expect, it } from 'vitest';
import type { BOQNode } from '@/shared/components/templates/BOQ/types/boq-tree.types';
import { collectAllIds, flattenTree, type OriginalItem } from './boq-tree-helpers';

describe('flattenTree', () => {
  it('maps suggestionItemId when present on node', () => {
    const nodes: BOQNode[] = [
      {
        id: 'node-1',
        name: 'Pekerjaan Persiapan',
        jenis: 'Job',
        bobot: 1,
        suggestionItemId: 'suggestion-item-123',
        children: [
          {
            id: 'node-2',
            name: 'Pembersihan',
            jenis: 'Job',
            bobot: 1,
            suggestionItemId: 'suggestion-item-456',
            children: [],
          },
        ],
      },
    ];

    const originalMap = new Map<string, OriginalItem>();
    const existingIds = new Set<string>();

    const flattened = flattenTree(nodes, null, null, originalMap, existingIds);

    expect(flattened).toHaveLength(2);
    expect(flattened[0].name).toBe('Pekerjaan Persiapan');
    expect(flattened[0].suggestionItemId).toBe('suggestion-item-123');
    expect(flattened[1].name).toBe('Pembersihan');
    expect(flattened[1].suggestionItemId).toBe('suggestion-item-456');
  });

  it('sets suggestionItemId to null when node is manual (not from suggestion)', () => {
    const nodes: BOQNode[] = [
      {
        id: 'node-manual',
        name: 'Manual Item',
        jenis: 'Job',
        bobot: 2,
        children: [],
      },
    ];

    const originalMap = new Map<string, OriginalItem>();
    const existingIds = new Set<string>();

    const flattened = flattenTree(nodes, null, null, originalMap, existingIds);

    expect(flattened).toHaveLength(1);
    expect(flattened[0].name).toBe('Manual Item');
    expect(flattened[0].suggestionItemId).toBeNull();
  });

  it('falls back to original item suggestionItemId if existing', () => {
    const nodes: BOQNode[] = [
      {
        id: 'existing-id-1',
        name: 'Existing Item',
        jenis: 'Job',
        bobot: 1,
        children: [],
      },
    ];

    const originalMap = new Map<string, OriginalItem>([
      [
        'existing-id-1',
        {
          jobItemType: { id: 'type-1' },
          suggestionItemId: 'server-suggestion-id',
        },
      ],
    ]);
    const existingIds = new Set<string>(['existing-id-1']);

    const flattened = flattenTree(nodes, null, null, originalMap, existingIds);

    expect(flattened).toHaveLength(1);
    expect(flattened[0].id).toBe('existing-id-1');
    expect(flattened[0].suggestionItemId).toBe('server-suggestion-id');
  });
});

describe('collectAllIds', () => {
  it('collects all node ids recursively', () => {
    const nodes: BOQNode[] = [
      {
        id: 'a',
        name: 'A',
        jenis: 'Job',
        bobot: null,
        children: [
          {
            id: 'a1',
            name: 'A1',
            jenis: 'Job',
            bobot: null,
            children: [],
          },
        ],
      },
      {
        id: 'b',
        name: 'B',
        jenis: 'Job',
        bobot: null,
        children: [],
      },
    ];

    const ids = collectAllIds(nodes);
    expect(ids).toEqual(new Set(['a', 'a1', 'b']));
  });
});
