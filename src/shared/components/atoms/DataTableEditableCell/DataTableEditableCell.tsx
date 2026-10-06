'use client';

import { Combobox as BaseUICombobox } from '@base-ui/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { AsyncSelect } from '@/components/atoms/Select';
import { Combobox, ComboboxContent, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/types/tanstack-table';

interface DataTableEditableCellProps {
  value: unknown;
  editType: 'input' | 'select' | 'date' | 'async-select' | 'combobox';
  inputType?: 'text' | 'number' | 'price';
  selectOptions?: SelectOption[];
  selectHasNextPage?: boolean;
  selectOnLoadMore?: () => void;
  selectOnSearch?: (search: string) => void;
  comboboxOptions?: string[];
  comboboxOnLoadMore?: () => void;
  comboboxHasNextPage?: boolean;
  comboboxOnSearch?: (search: string) => void;
  onSave: (value: unknown) => void;
  onCancel: () => void;
  onNavigate?: (direction: 'down' | 'right' | 'left') => void;
  popoverContainer?: HTMLElement | null;
}

function ComboboxEditor({
  value,
  options = [],
  onLoadMore,
  hasNextPage,
  onSearch,
  onSave,
  onCancel,
  onNavigate,
}: {
  value: unknown;
  options?: string[];
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  onSearch?: (search: string) => void;
  onSave: (v: unknown) => void;
  onCancel: () => void;
  onNavigate?: (direction: 'down' | 'right' | 'left') => void;
}) {
  // Start closed, measure the cell, then open — one paint, no bottom flash.
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<'top' | 'bottom'>('bottom');
  const latestInput = useRef(value != null ? String(value) : '');
  const didSave = useRef(false);
  const [inputText, setInputText] = useState(value != null ? String(value) : '');
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Prefer opening above when the cell sits near the bottom of the viewport.
  // A short filtered list fits below, so floating-ui's flip never triggers —
  // decide the side ourselves before the popup mounts. Flip still rescues
  // if top overflows.
  // ponytail: 200px fixed threshold; raise to ~viewport/2 if short popups feel wrong.
  useLayoutEffect(() => {
    const rect = inputRef.current?.getBoundingClientRect();
    if (rect && window.innerHeight - rect.bottom < 200) setSide('top');
    setOpen(true);
    onSearchRef.current?.('');
  }, []);

  useEffect(() => {
    setInputText(value != null ? String(value) : '');
    latestInput.current = value != null ? String(value) : '';
  }, [value]);

  // When onSearch is provided, parent handles filtering — show all options as-is.
  // Otherwise filter client-side by the typed text.
  const filteredOptions = useMemo(() => {
    if (onSearch) return options;
    const k = inputText.toLowerCase().trim();
    return k ? options.filter((o) => o.toLowerCase().includes(k)) : options;
  }, [inputText, options, onSearch]);

  const handleValueChange = (v: string | null) => {
    if (v !== null) {
      didSave.current = true;
      onSave(v);
    }
  };

  const handleInputValueChange = (v: string) => {
    latestInput.current = v;
    setInputText(v);
    if (onSearchRef.current) {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => onSearchRef.current?.(v), 300);
    }
  };

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o && !didSave.current) {
      didSave.current = true;
      onSave(latestInput.current);
    }
  };

  const handleListScroll = (e: React.UIEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 60 && hasNextPage !== false)
      onLoadMore?.();
  };

  return (
    <div
      className="contents"
      onKeyDownCapture={(e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          e.stopPropagation();
          didSave.current = true;
          setOpen(false);
          onSave(latestInput.current);
          onNavigate?.(e.shiftKey ? 'left' : 'right');
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          didSave.current = true;
          setOpen(false);
          onCancel();
        }
      }}
    >
      <Combobox
        open={open}
        onOpenChange={handleOpenChange}
        onValueChange={handleValueChange}
        inputValue={inputText}
        onInputValueChange={handleInputValueChange}
      >
        <BaseUICombobox.Input
          ref={inputRef}
          autoFocus
          placeholder=""
          className="h-full w-full rounded-none border-0 bg-transparent px-0 py-0 text-sm outline-none"
        />
        {options.length > 0 && (
          <ComboboxContent side={side} sideOffset={11} alignOffset={-10}>
            <ComboboxList onScroll={handleListScroll}>
              {filteredOptions.map((opt) => (
                <ComboboxItem key={opt} value={opt}>
                  {opt}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        )}
      </Combobox>
    </div>
  );
}

function DateEditor({
  value,
  onSave,
  onCancel,
  onNavigate,
}: {
  value: unknown;
  onSave: (value: unknown) => void;
  onCancel: () => void;
  onNavigate?: (direction: 'down' | 'right' | 'left') => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<string>(value ? String(value) : '');

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <input
      ref={inputRef}
      type="date"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft && draft !== (value ? String(value) : '')) {
          onSave(draft);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          if (draft) onSave(draft);
          onNavigate?.('down');
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onCancel();
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          e.stopPropagation();
          if (draft) onSave(draft);
          onNavigate?.(e.shiftKey ? 'left' : 'right');
        }
      }}
      className="h-7 w-full border-0 outline-none rounded-none bg-transparent px-3 py-0 text-sm appearance-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-calendar-picker-indicator]:hidden"
    />
  );
}

export function DataTableEditableCell({
  value,
  editType,
  inputType = 'text',
  selectOptions,
  selectHasNextPage,
  selectOnLoadMore,
  selectOnSearch,
  comboboxOptions,
  comboboxOnLoadMore,
  comboboxHasNextPage,
  comboboxOnSearch,
  onSave,
  onCancel,
  onNavigate,
  popoverContainer,
}: DataTableEditableCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Stable ref so the mount effect can call the latest version without being a dep
  const selectOnSearchRef = useRef(selectOnSearch);
  selectOnSearchRef.current = selectOnSearch;

  const [draft, setDraft] = useState(() =>
    value === null || value === undefined ? '' : String(value)
  );
  const [open, setOpen] = useState(false);

  // Auto-open dropdown and trigger initial async search on mount
  useEffect(() => {
    if (editType === 'input') {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else if (editType === 'select' || editType === 'async-select') {
      setOpen(true);
      if (editType === 'async-select') {
        selectOnSearchRef.current?.('');
      }
    }
  }, [editType]);

  if (editType === 'select' || editType === 'async-select') {
    const currentValue = value === null || value === undefined ? null : String(value);

    return (
      // Intercept Tab/Escape before AsyncSelect's internal handlers consume them
      <div
        className="contents"
        onKeyDownCapture={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            onSave(currentValue);
            onNavigate?.(e.shiftKey ? 'left' : 'right');
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
            onCancel();
          }
        }}
      >
        <AsyncSelect
          value={currentValue}
          options={selectOptions}
          isSearchable={editType === 'async-select'}
          isClearable={false}
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) onCancel();
          }}
          onChange={(v) => onSave(v)}
          onScrollToBottom={selectHasNextPage ? selectOnLoadMore : undefined}
          onSearchChange={editType === 'async-select' ? selectOnSearch : undefined}
          popoverContainer={popoverContainer}
          className={cn(
            'h-7 border-0 rounded-none px-0 py-0 gap-1',
            'hover:bg-transparent',
            'focus-visible:ring-0 focus-visible:border-transparent',
            '[&>div>span]:text-foreground [&>div>svg]:text-cyan-600'
          )}
        />
      </div>
    );
  }

  if (editType === 'combobox') {
    return (
      <ComboboxEditor
        value={value}
        options={comboboxOptions}
        onLoadMore={comboboxOnLoadMore}
        hasNextPage={comboboxHasNextPage}
        onSearch={comboboxOnSearch}
        onSave={onSave}
        onCancel={onCancel}
        onNavigate={onNavigate}
      />
    );
  }

  if (editType === 'date') {
    return <DateEditor value={value} onSave={onSave} onCancel={onCancel} onNavigate={onNavigate} />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (inputType === 'number' || inputType === 'price') {
      // Allow only digits, minus sign at start, and single decimal point
      if (newValue === '' || newValue === '-' || /^-?\d*\.?\d*$/.test(newValue)) {
        setDraft(newValue);
      }
    } else {
      setDraft(newValue);
    }
  };

  return (
    <Input
      ref={inputRef}
      className="h-7 w-full border-0 rounded-none bg-transparent px-0 py-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
      value={draft}
      onChange={handleInputChange}
      onBlur={() => onSave(draft)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          onSave(draft);
          onNavigate?.('down');
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onCancel();
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          e.stopPropagation();
          onSave(draft);
          onNavigate?.(e.shiftKey ? 'left' : 'right');
        }
      }}
    />
  );
}
