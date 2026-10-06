'use client';

import { ArrowDownToLine, ArrowUpToLine, Clipboard, Copy, Scissors, Trash2 } from 'lucide-react';
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';
import type { BOQCostRow } from '../types/boq-cost.types';
import type { BOQContextMenuLabels } from '../types/boq-labels.types';

export interface BOQCostContextMenuActions {
  row: BOQCostRow;
  canPaste: boolean;
  triggerCopy?: () => void;
  onCut: (row: BOQCostRow) => void;
  onCopy: (row: BOQCostRow) => void;
  onPaste: (row: BOQCostRow) => void;
  onInsertAbove: (row: BOQCostRow) => void;
  onInsertBelow: (row: BOQCostRow) => void;
  onDelete: (row: BOQCostRow) => void;
  labels?: Partial<BOQContextMenuLabels>;
}

const DEFAULT_LABELS: BOQContextMenuLabels = {
  cut: 'Potong',
  copy: 'Salin',
  paste: 'Tempel',
  insertAbove: 'Sisipkan baris di atas',
  insertBelow: 'Sisipkan baris di bawah',
  delete: 'Hapus baris',
};

export function BOQCostContextMenuItems(a: BOQCostContextMenuActions) {
  const { row } = a;
  const labels = { ...DEFAULT_LABELS, ...a.labels };
  return (
    <>
      <ContextMenuItem onClick={() => a.onCut(row)}>
        <Scissors /> {labels.cut}
      </ContextMenuItem>
      <ContextMenuItem onClick={() => (a.triggerCopy ? a.triggerCopy() : a.onCopy(row))}>
        <Copy /> {labels.copy}
      </ContextMenuItem>
      <ContextMenuItem disabled={!a.canPaste} onClick={() => a.onPaste(row)}>
        <Clipboard /> {labels.paste}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={() => a.onInsertAbove(row)}>
        <ArrowUpToLine /> {labels.insertAbove}
      </ContextMenuItem>
      <ContextMenuItem onClick={() => a.onInsertBelow(row)}>
        <ArrowDownToLine /> {labels.insertBelow}
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem variant="destructive" onClick={() => a.onDelete(row)}>
        <Trash2 /> {labels.delete}
      </ContextMenuItem>
    </>
  );
}
