'use client';

import { Loader2, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ── Public types ──

export interface MultiSelectPopupItem {
  id: string;
  label: string;
  description?: string;
}

export interface MultiSelectPopupProps {
  /** Controlled open state */
  open: boolean;
  /** Called when user closes without confirming */
  onClose: () => void;
  /** Called when user clicks confirm — passes final selected items */
  onSelect: (items: MultiSelectPopupItem[]) => void;
  /** Called when a checkbox is toggled — passes updated selected items */
  onToggle: (items: MultiSelectPopupItem[]) => void;
  /** Dialog title */
  title: string;
  /** List of items to display */
  items: MultiSelectPopupItem[];
  /** Pre-selected item IDs (controlled) */
  selectedIds: string[];
  /** Show loading spinner */
  isLoading?: boolean;
  /** Whether more items can be loaded (hides load-more when false) */
  hasMore?: boolean;
  /** Called when user scrolls to bottom */
  onLoadMore?: () => void;
  /** Called when search input changes */
  onSearch?: (query: string) => void;
  /** Placeholder for search input */
  searchPlaceholder?: string;
  /** Message when list is empty */
  emptyMessage?: string;
  /** Max height of the scrollable list */
  maxHeight?: string;
  /** Optional filter element rendered beside the search input */
  filterSlot?: ReactNode;
}

/**
 * Multi-select popup with search + infinite scroll.
 *
 * Generic — not tied to any domain. Consumer provides `items`, `selectedIds`,
 * and callbacks. Supports optional infinite scroll via `hasMore` + `onLoadMore`.
 *
 * - `onToggle` fires on every checkbox change (popup stays open)
 * - `onSelect` fires only on confirm button click
 */
export function MultiSelectPopup({
  open,
  onClose,
  onSelect,
  onToggle,
  title,
  items,
  selectedIds,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onSearch,
  searchPlaceholder = 'Cari...',
  emptyMessage = 'Tidak ada data',
  maxHeight = '400px',
  filterSlot,
}: MultiSelectPopupProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Infinite scroll: fire onLoadMore when near bottom ──
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !hasMore || isLoading || !onLoadMore) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore]);

  // ── Build item map for quick lookup ──
  const itemMap = useRef(new Map(items.map((i) => [i.id, i])));
  // Update map when items change
  for (const item of items) {
    itemMap.current.set(item.id, item);
  }

  // ── Toggle a single item (calls onToggle, NOT onSelect) ──
  const toggleItem = useCallback(
    (id: string) => {
      const isSelected = selectedIds.includes(id);
      const selectedMap = new Map(
        selectedIds
          .map((sid) => itemMap.current.get(sid))
          .filter(Boolean)
          .map((item) => [item!.id, item!])
      );

      if (isSelected) {
        selectedMap.delete(id);
      } else {
        const item = itemMap.current.get(id);
        if (item) selectedMap.set(id, item);
      }

      onToggle(Array.from(selectedMap.values()));
    },
    [selectedIds, onToggle]
  );

  // ── Toggle all visible items (calls onToggle) ──
  const toggleAll = useCallback(() => {
    const allVisibleSelected =
      items.length > 0 && items.every((item) => selectedIds.includes(item.id));

    if (allVisibleSelected) {
      // Deselect all visible, keep non-visible selected
      const visibleIds = new Set(items.map((i) => i.id));
      onToggle(
        selectedIds
          .filter((id) => !visibleIds.has(id))
          .map((id) => itemMap.current.get(id)!)
          .filter(Boolean)
      );
    } else {
      // Select all visible (merge with existing non-visible)
      const merged = new Map(
        selectedIds
          .map((id) => itemMap.current.get(id))
          .filter(Boolean)
          .map((item) => [item!.id, item!])
      );
      for (const item of items) {
        merged.set(item.id, item);
      }
      onToggle(Array.from(merged.values()));
    }
  }, [items, selectedIds, onToggle]);

  const allVisibleSelected =
    items.length > 0 && items.every((item) => selectedIds.includes(item.id));
  const someSelected = selectedIds.length > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Search + optional filter */}
        {(onSearch || filterSlot) && (
          <div className="flex items-center gap-2">
            {onSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder={searchPlaceholder}
                  className="pl-9"
                  onChange={(e) => onSearch(e.target.value)}
                />
              </div>
            )}
            {filterSlot}
          </div>
        )}

        {/* Select all */}
        {items.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <Checkbox checked={allVisibleSelected} onCheckedChange={toggleAll} />
            <span className="text-xs text-slate-500">Pilih semua ({items.length})</span>
          </div>
        )}

        {/* Scrollable list */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            'divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200'
          )}
          style={{ maxHeight }}
        >
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">{emptyMessage}</div>
          ) : (
            items.map((item) => {
              const checked = selectedIds.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-slate-50',
                    checked && 'bg-slate-50'
                  )}
                >
                  <Checkbox checked={checked} onCheckedChange={() => toggleItem(item.id)} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-900">{item.label}</div>
                    {item.description && (
                      <div className="truncate text-xs text-slate-500">{item.description}</div>
                    )}
                  </div>
                </label>
              );
            })
          )}

          {/* Load more indicator */}
          {isLoading && items.length > 0 && (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={() =>
              onSelect(selectedIds.map((id) => itemMap.current.get(id)!).filter(Boolean))
            }
            disabled={!someSelected}
          >
            Tambah{someSelected ? ` (${selectedIds.length})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
