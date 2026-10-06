'use client';

import { ChevronDown, Minus, X } from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '@/shared/components/atoms';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';
import type { FilterConfig, FilterDrawerState } from './types';

interface DynamicFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApply: (values: FilterDrawerState) => void;
  availableFilters: FilterConfig[];
  initialValues?: FilterDrawerState;
}

export function DynamicFilterDrawer({
  open,
  onClose,
  onApply,
  availableFilters,
  initialValues = {},
}: DynamicFilterDrawerProps) {
  const [values, setValues] = useState<FilterDrawerState>(initialValues);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // ── Track selection order ─────────────────────────────────────────────
  // derived: which types currently have a key in values (even if value is empty)
  const keysWithValues = useMemo(
    () => availableFilters.map((f) => f.type).filter((t) => t in values),
    [availableFilters, values]
  );

  // appliedOrder starts from initial values, new additions go to the end
  const [appliedOrder, setAppliedOrder] = useState<string[]>(() =>
    availableFilters.map((f) => f.type).filter((t) => t in initialValues)
  );

  // Sync appliedOrder when values change (e.g. on reset)
  // but only add new keys that appear in values (from parent initialState change)
  // without disrupting the existing order
  const prevKeysWithValuesRef = useRef<string[]>(keysWithValues);
  if (keysWithValues.length !== prevKeysWithValuesRef.current.length) {
    // Something external changed values — absorb any new keys into appliedOrder
    setAppliedOrder((prev) => {
      const next = [...prev];
      for (const k of keysWithValues) {
        if (!next.includes(k)) next.push(k);
      }
      // also remove keys no longer in values
      return next.filter((k) => k in values);
    });
    prevKeysWithValuesRef.current = keysWithValues;
  }

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) {
        onClose();
      } else {
        setValues(initialValues);
        setAddMenuOpen(false);
        setCollapsed({});
        setAppliedOrder(availableFilters.map((f) => f.type).filter((t) => t in initialValues));
      }
    },
    [onClose, initialValues, availableFilters]
  );

  // Types with values, in selection order
  const appliedTypes = useMemo(
    () => appliedOrder.filter((t) => t in values),
    [appliedOrder, values]
  );

  const remainingTypes = useMemo(
    () => availableFilters.filter((f) => !appliedTypes.includes(f.type)),
    [availableFilters, appliedTypes]
  );

  const handleAddFilter = useCallback((type: string) => {
    setValues((prev) => ({ ...prev, [type]: prev[type] ?? undefined }));
    setAppliedOrder((prev) => (prev.includes(type) ? prev : [...prev, type]));
    setAddMenuOpen(false);
  }, []);

  const handleRemoveFilter = useCallback((type: string) => {
    setValues((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
    setAppliedOrder((prev) => prev.filter((t) => t !== type));
  }, []);

  const handleValueChange = useCallback((type: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [type]: value }));
  }, []);

  const handleApply = useCallback(() => {
    const filtered: FilterDrawerState = {};
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value) && value.length === 0) return;
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0
      )
        return;
      if (typeof value === 'string' && value === '') return;
      filtered[key] = value;
    });
    onApply(filtered);
    onClose();
  }, [values, onApply, onClose]);

  const toggleCollapse = useCallback((type: string) => {
    setCollapsed((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} direction="right">
      <DrawerContent className="w-md max-w-md inset-y-0! right-0! left-auto! mt-0! rounded-l-xl! rounded-r-none! border-l! flex flex-col">
        <DrawerHeader className="pb-2">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-semibold text-[#0A0A0A]">Filter</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="xs" className="h-6 w-6 p-0" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {/* Applied filters — rendered in selection order */}
          {appliedTypes.length > 0 && (
            <div className="space-y-4">
              {appliedTypes.map((type) => {
                const config = availableFilters.find((f) => f.type === type);
                if (!config) return null;
                const isCollapsed = collapsed[type] === true;
                const val = values[type];
                const countStr =
                  Array.isArray(val) && val.length > 0 ? `(${val.length} selected)` : null;
                return (
                  <div key={type} className="rounded-lg border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2">
                      <button
                        type="button"
                        onClick={() => toggleCollapse(type)}
                        className="flex items-center gap-2 text-sm font-medium text-slate-700"
                      >
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${
                            isCollapsed ? '-rotate-90' : ''
                          }`}
                        />
                        {config.label}
                        {countStr && (
                          <span className="text-xs text-slate-400 font-normal">{countStr}</span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFilter(type)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {!isCollapsed && (
                      <div className="px-3 pb-3">
                        {config.renderEditor({
                          value: values[type],
                          onChange: (v) => handleValueChange(type, v),
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {appliedTypes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg
                className="w-10 h-10 text-teal-600 mb-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 4h16v2.172a2 2 0 0 1-.586 1.414L15 12v7l-6 2v-8.5L4.52 7.53A2 2 0 0 1 4 6.162V4z" />
              </svg>
              <p className="text-sm font-medium text-slate-600">Filter not set</p>
              <p className="text-xs text-slate-400 mt-1">Your filter will be displayed here</p>
            </div>
          )}

          {/* Add filter */}
          {remainingTypes.length > 0 && (
            <div className="relative mt-4">
              <button
                ref={addBtnRef}
                type="button"
                onClick={() => setAddMenuOpen((v) => !v)}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                + Add filter
              </button>
              {addMenuOpen && (
                <div className="relative">
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default"
                    aria-hidden="true"
                    tabIndex={-1}
                    onClick={() => setAddMenuOpen(false)}
                  />
                  <div className="relative z-20 mt-1 rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {remainingTypes.map((f) => (
                      <button
                        key={f.type}
                        type="button"
                        className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                        onClick={() => handleAddFilter(f.type)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DrawerFooter className="px-4 py-4 border-t flex flex-col gap-2">
          <Button onClick={handleApply} className="w-full">
            Apply
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Batal
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
