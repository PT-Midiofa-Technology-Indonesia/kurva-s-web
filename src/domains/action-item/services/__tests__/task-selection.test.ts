import { describe, expect, it } from 'vitest';
import { buildDescendantIdMap, getCascadeSelectionIds, getSelectableIds } from '../task-selection';

const tree = [
  {
    id: 'parent',
    isDelegatable: true,
    children: [
      {
        id: 'child',
        isDelegatable: true,
        children: [{ id: 'blocked', isDelegatable: false, children: [] }],
      },
    ],
  },
  { id: 'other', isDelegatable: true, children: [] },
];

describe('task selection', () => {
  it('builds all descendant IDs recursively', () => {
    expect(buildDescendantIdMap(tree).get('parent')).toEqual(['child', 'blocked']);
  });

  it('selects a row and only delegatable descendants', () => {
    const descendants = buildDescendantIdMap(tree);
    const selectableIds = getSelectableIds(tree);

    expect(getCascadeSelectionIds('parent', descendants, selectableIds)).toEqual([
      'parent',
      'child',
    ]);
  });

  it('returns only delegatable rows for select-all', () => {
    expect([...getSelectableIds(tree)]).toEqual(['parent', 'child', 'other']);
  });

  it('treats only an explicit false flag as non-delegatable', () => {
    const missingFlagTree = [{ id: 'legacy', children: [] }];

    expect([...getSelectableIds(missingFlagTree)]).toEqual(['legacy']);
  });
});
