'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { SearchBar } from '@/components/molecules/SearchBar';

export interface PageTableTemplateProps {
  // ── Header ────────────────────────────────────────────────────────────────
  title: string;
  /** Anything rendered to the right of the title — company selector, action buttons, etc. */
  headerActions?: ReactNode;

  // ── Search (state managed internally, synced from URL via `search` prop) ──
  search?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string | undefined) => void;

  // ── Toolbar right slot (filters, view toggles, etc.) ──────────────────────
  toolbarRight?: ReactNode;

  // ── Table / view content ──────────────────────────────────────────────────
  children: ReactNode;
}

export function PageTableTemplate({
  title,
  headerActions,
  search = '',
  searchPlaceholder = 'Search...',
  onSearchChange,
  toolbarRight,
  children,
}: PageTableTemplateProps) {
  const [inputValue, setInputValue] = useState(search);

  useEffect(() => {
    setInputValue(search);
  }, [search]);

  const handleClear = useCallback(() => {
    setInputValue('');
    onSearchChange?.(undefined);
  }, [onSearchChange]);

  const handleDebounce = useCallback(
    (value: string) => onSearchChange?.(value || undefined),
    [onSearchChange]
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-950">{title}</h1>
        {headerActions}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-wrap gap-3 items-center p-4 justify-between">
          <SearchBar
            placeholder={searchPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onClear={handleClear}
            onDebounce={handleDebounce}
            width="288px"
            showClear
          />
          {toolbarRight}
        </div>

        {children}
      </div>
    </div>
  );
}
