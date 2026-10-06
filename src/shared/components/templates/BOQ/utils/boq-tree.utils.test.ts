import { describe, expect, it } from 'vitest';
import type { BOQNode } from '../types/boq-tree.types';
import {
  addChild,
  addSibling,
  canAddChild,
  cloneNode,
  computeBobot,
  computeCodes,
  createEmptyNode,
  deleteNode,
  findDepth,
  moveToBottom,
  setFinalLevel,
  updateNode,
} from './boq-tree.utils';

const leaf = (id: string, name = id): BOQNode => ({
  id,
  name,
  jenis: 'Job',
  bobot: null,
  children: [],
});
const node = (id: string, children: BOQNode[]): BOQNode => ({
  id,
  name: id,
  jenis: 'Job',
  bobot: null,
  children,
});

describe('computeBobot', () => {
  it('sums children bobot', () => {
    const tree = [node('a', [leaf('a1'), leaf('a2')])];
    tree[0].children[0].bobot = 10;
    tree[0].children[1].bobot = 90;
    expect(computeBobot(tree[0])).toBe(100);
  });

  it('strips float artifacts from bobot sums', () => {
    // 0.35 + 0.35 + 0.3 = 0.9999999999999999 — must not leak into display
    const kids = [leaf('x'), leaf('y'), leaf('z')];
    kids[0].bobot = 0.35;
    kids[1].bobot = 0.35;
    kids[2].bobot = 0.3;
    const tree = [node('p', kids)];
    expect(computeBobot(tree[0])).toBe(1);
  });

  it('returns null when every descendant leaf has null bobot', () => {
    const tree = [node('a', [leaf('a1')])];
    expect(computeBobot(tree[0])).toBeNull();
  });
});

describe('computeCodes', () => {
  it('assigns letters to roots and dotted numbers to descendants', () => {
    const tree: BOQNode[] = [node('a', [node('a1', [leaf('a11')])]), leaf('b')];
    const codes = computeCodes(tree);
    expect(codes.get('a')).toBe('A');
    expect(codes.get('a1')).toBe('A.1');
    expect(codes.get('a11')).toBe('A.1.1');
    expect(codes.get('b')).toBe('B');
  });

  it('uses spreadsheet-style letters past Z', () => {
    const roots = Array.from({ length: 27 }, (_, i) => leaf(`r${i}`));
    const codes = computeCodes(roots);
    expect(codes.get('r0')).toBe('A');
    expect(codes.get('r25')).toBe('Z');
    expect(codes.get('r26')).toBe('AA');
  });
});

describe('createEmptyNode', () => {
  it('makes a blank node with a fresh id and empty children', () => {
    const n = createEmptyNode({ isDraft: true });
    expect(n.id).toBeTruthy();
    expect(n.name).toBe('');
    expect(n.children).toEqual([]);
    expect(n.isDraft).toBe(true);
  });
});

describe('cloneNode', () => {
  it('deep clones with all-new ids and assigns suggestionItemId', () => {
    const src = node('a', [leaf('a1')]);
    const copy = cloneNode(src);
    expect(copy.id).not.toBe('a');
    expect(copy.suggestionItemId).toBe('a');
    expect(copy.children[0].id).not.toBe('a1');
    expect(copy.children[0].suggestionItemId).toBe('a1');
    expect(copy.children).toHaveLength(1);
  });
});

describe('findDepth / canAddChild', () => {
  const tree: BOQNode[] = [node('a', [node('a1', [node('a11', [node('a111', [leaf('a1111')])])])])];
  it('roots are depth 0', () => expect(findDepth(tree, 'a')).toBe(0));
  it('deep node depth', () => expect(findDepth(tree, 'a1111')).toBe(4));
  it('cannot add child at maxDepth-1 leaf (depth 4, maxDepth 5)', () => {
    expect(canAddChild(tree, 'a1111', 5)).toBe(false);
  });
  it('can add child above maxDepth', () => {
    expect(canAddChild(tree, 'a111', 5)).toBe(true);
  });
});

describe('addChild', () => {
  it('appends a child to the target node', () => {
    const tree: BOQNode[] = [node('a', [])];
    const next = addChild(tree, 'a', leaf('c1'));
    expect(next[0].children.map((c) => c.id)).toEqual(['c1']);
  });
});

describe('addSibling', () => {
  it('inserts below the target — B shifts down so codes renumber', () => {
    const tree: BOQNode[] = [leaf('a'), leaf('b')];
    const next = addSibling(tree, 'a', 'below', leaf('x'));
    expect(next.map((n) => n.id)).toEqual(['a', 'x', 'b']);
  });
  it('inserts above the target', () => {
    const tree: BOQNode[] = [leaf('a'), leaf('b')];
    const next = addSibling(tree, 'b', 'above', leaf('x'));
    expect(next.map((n) => n.id)).toEqual(['a', 'x', 'b']);
  });
  it('inserts among nested siblings', () => {
    const tree: BOQNode[] = [node('a', [leaf('a1'), leaf('a2')])];
    const next = addSibling(tree, 'a1', 'below', leaf('x'));
    expect(next[0].children.map((n) => n.id)).toEqual(['a1', 'x', 'a2']);
  });
});

describe('deleteNode', () => {
  it('removes the node and its subtree', () => {
    const tree: BOQNode[] = [node('a', [leaf('a1')]), leaf('b')];
    expect(deleteNode(tree, 'a').map((n) => n.id)).toEqual(['b']);
  });
});

describe('moveToBottom', () => {
  it('moves the node to the end of its sibling list', () => {
    const tree: BOQNode[] = [node('p', [leaf('x'), leaf('y'), leaf('z')])];
    expect(moveToBottom(tree, 'x')[0].children.map((n) => n.id)).toEqual(['y', 'z', 'x']);
  });
});

describe('updateNode', () => {
  it('patches a node in place (immutably)', () => {
    const tree: BOQNode[] = [node('a', [leaf('a1')])];
    const next = updateNode(tree, 'a1', { bobot: 4 });
    expect(next[0].children[0].bobot).toBe(4);
    expect(next).not.toBe(tree);
  });
});

describe('setFinalLevel', () => {
  it('sets isFinalLevel to true and removes all children', () => {
    const tree: BOQNode[] = [node('a', [node('a1', [leaf('a11')]), leaf('a2')])];
    const next = setFinalLevel(tree, 'a1');
    expect(next[0].children[0].isFinalLevel).toBe(true);
    expect(next[0].children[0].children).toEqual([]);
  });

  it('preserves other nodes', () => {
    const tree: BOQNode[] = [node('a', [node('a1', [leaf('a11')]), leaf('a2')])];
    const next = setFinalLevel(tree, 'a1');
    expect(next[0].children[1].id).toBe('a2');
  });

  it('works on deeply nested nodes', () => {
    const tree: BOQNode[] = [node('a', [node('a1', [node('a11', [leaf('a111')])])])];
    const next = setFinalLevel(tree, 'a11');
    expect(next[0].children[0].children[0].isFinalLevel).toBe(true);
    expect(next[0].children[0].children[0].children).toEqual([]);
  });
});
