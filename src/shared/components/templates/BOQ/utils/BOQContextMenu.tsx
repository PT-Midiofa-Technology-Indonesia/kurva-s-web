'use client';

import {
  ArrowDownToLine,
  ArrowUpToLine,
  Clipboard,
  Copy,
  ListEnd,
  Plus,
  Scissors,
  Trash2,
} from 'lucide-react';
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';
import type { BOQContextMenuLabels } from '../types/boq-labels.types';
import type { BOQNode } from '../types/boq-tree.types';

export interface BOQContextMenuActions {
  node: BOQNode;
  canAddChild: boolean;
  canPaste: boolean;
  onCut: (node: BOQNode) => void;
  onCopy: (node: BOQNode) => void;
  onPaste: (node: BOQNode) => void;
  onMakeLast?: (node: BOQNode) => void;
  onInsertAbove?: (node: BOQNode) => void;
  onInsertBelow?: (node: BOQNode) => void;
  onAddChild?: (node: BOQNode) => void;
  onDelete?: (node: BOQNode) => void;
  labels?: Partial<BOQContextMenuLabels>;
}

const DEFAULT_LABELS: BOQContextMenuLabels = {
  cut: 'Potong',
  copy: 'Salin',
  paste: 'Tempel',
  insertAbove: 'Sisipkan baris di atas',
  insertBelow: 'Sisipkan baris di bawah',
  delete: 'Hapus baris',
  makeLast: 'Jadikan level terakhir',
  addChild: 'Tambahkan child',
};

export function BOQContextMenuItems(a: BOQContextMenuActions) {
  const { node, onMakeLast, onInsertAbove, onInsertBelow, onAddChild, onDelete } = a;
  const labels = { ...DEFAULT_LABELS, ...a.labels };
  return (
    <>
      <ContextMenuItem onClick={() => a.onCut(node)}>
        <Scissors /> {labels.cut}
      </ContextMenuItem>
      <ContextMenuItem onClick={() => a.onCopy(node)}>
        <Copy /> {labels.copy}
      </ContextMenuItem>
      <ContextMenuItem disabled={!a.canPaste} onClick={() => a.onPaste(node)}>
        <Clipboard /> {labels.paste}
      </ContextMenuItem>
      {onMakeLast && !node.isFinalLevel && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onMakeLast(node)}>
            <ListEnd /> {labels.makeLast}
          </ContextMenuItem>
        </>
      )}
      {onInsertAbove && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onInsertAbove(node)}>
            <ArrowUpToLine /> {labels.insertAbove}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onInsertBelow!(node)}>
            <ArrowDownToLine /> {labels.insertBelow}
          </ContextMenuItem>
        </>
      )}
      {onAddChild && a.canAddChild && (
        <ContextMenuItem onClick={() => onAddChild(node)}>
          <Plus /> {labels.addChild}
        </ContextMenuItem>
      )}
      {onDelete && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive" onClick={() => onDelete(node)}>
            <Trash2 /> {labels.delete}
          </ContextMenuItem>
        </>
      )}
    </>
  );
}
