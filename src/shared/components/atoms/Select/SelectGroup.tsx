'use client';

import { X } from 'lucide-react';
import * as React from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { SelectOption } from './Select';

interface SelectGroupProps {
  value?: string[];
  options: SelectOption[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  isLoading?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
}

export const SelectGroupField = React.forwardRef<HTMLDivElement, SelectGroupProps>(
  (
    { value = [], options, onChange, placeholder = 'Pilih...', isLoading, disabled, invalid, id },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

    const selected = options.filter((o) => value.includes(o.value));

    const toggleItem = (optValue: string) => {
      const next = value.includes(optValue)
        ? value.filter((v) => v !== optValue)
        : [...value, optValue];
      onChange?.(next);
    };

    return (
      <div ref={ref} className="flex flex-col gap-2">
        {/* Selected tags */}
        <div className="flex flex-wrap gap-1.5">
          {selected.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-sm text-slate-700"
            >
              {opt.label}
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggleItem(opt.value)}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>

        {/* Dropdown */}
        <Popover open={open && !disabled} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              id={id}
              disabled={disabled || isLoading}
              className={cn(
                'flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm',
                'hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                invalid && 'border-destructive',
                disabled && 'cursor-not-allowed opacity-50',
                !value?.length && 'text-slate-400'
              )}
            >
              {isLoading ? 'Memuat...' : placeholder}
              <span className="ml-1 text-xs text-slate-400">▼</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput placeholder="Cari..." value={search} onValueChange={setSearch} />
              <CommandList>
                <CommandEmpty>Tidak ada data</CommandEmpty>
                <CommandGroup>
                  {filtered.map((opt) => (
                    <CommandItem
                      key={opt.value}
                      value={opt.value}
                      onSelect={() => {
                        toggleItem(opt.value);
                      }}
                    >
                      <div
                        className={cn(
                          'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-slate-300',
                          value.includes(opt.value) && 'border-primary bg-primary'
                        )}
                      >
                        {value.includes(opt.value) && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      {opt.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
SelectGroupField.displayName = 'SelectGroupField';
