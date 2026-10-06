'use client';

import { CheckIcon, ChevronDownIcon, Loader2Icon, XIcon } from 'lucide-react';
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
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

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  skills?: { id: string; skillCatalog: { name: string } }[];
}

export interface SelectGroup {
  heading?: string;
  headingBadge?: string;
  options: SelectOption[];
}

export type SelectValue = string | string[] | null | undefined;

export interface AsyncSelectProps {
  value?: SelectValue;
  defaultValue?: SelectValue;
  onChange?: (value: SelectValue) => void;
  options?: SelectOption[];
  groups?: SelectGroup[];
  isMulti?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  isCreatable?: boolean;
  onCreateOption?: (value: string) => void;
  placeholder?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  invalid?: boolean;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  onScrollToBottom?: () => void;
  onSearchChange?: (value: string) => void;
  /** Controlled open state. When provided, the component delegates open/close to the caller. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Portal container for the dropdown. Pass fullscreen element to fix visibility in fullscreen mode. */
  popoverContainer?: HTMLElement | null;
}

const defaultMessages = {
  noOptions: 'No options found.',
  loading: 'Loading...',
  placeholder: 'Select...',
  searchPlaceholder: 'Search...',
  createPlaceholder: (input: string) => `Create "${input}"`,
};

function useSelectState({
  value,
  defaultValue,
  isMulti,
  onChange,
}: Pick<AsyncSelectProps, 'value' | 'defaultValue' | 'isMulti' | 'onChange'>) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState<SelectValue>(() => {
    if (defaultValue !== undefined) return defaultValue;
    return isMulti ? [] : null;
  });

  const currentValue = isControlled ? value : internalValue;

  const updateValue = React.useCallback(
    (newValue: SelectValue) => {
      // Keep the internal mirror in sync even while controlled — otherwise a
      // `value` prop that transitions to `undefined` (e.g. a cleared filter
      // dropping its query param) falls back to a stale `internalValue` for
      // one render, requiring a second click before the label actually clears.
      setInternalValue(newValue);
      onChange?.(newValue);
    },
    [onChange]
  );

  return { value: currentValue, setValue: updateValue };
}

export const AsyncSelect = React.forwardRef<HTMLDivElement, AsyncSelectProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      options = [],
      groups,
      isMulti = false,
      isClearable = true,
      isSearchable = true,
      isDisabled = false,
      isLoading = false,
      isCreatable = false,
      onCreateOption,
      placeholder = defaultMessages.placeholder,
      noOptionsMessage = defaultMessages.noOptions,
      loadingMessage = defaultMessages.loading,
      className,
      size = 'default',
      invalid = false,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      onScrollToBottom,
      onSearchChange,
      open: openProp,
      onOpenChange,
      popoverContainer,
    },
    ref
  ) => {
    const isOpenControlled = openProp !== undefined;
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = isOpenControlled ? openProp : internalOpen;
    const setOpen = React.useCallback(
      (val: boolean) => {
        if (!isOpenControlled) setInternalOpen(val);
        onOpenChange?.(val);
      },
      [isOpenControlled, onOpenChange]
    );
    const [search, setSearch] = React.useState('');

    const handleListScroll = React.useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        if (!onScrollToBottom) return;
        const el = e.currentTarget;
        if (el.scrollHeight - el.scrollTop <= el.clientHeight + 50) {
          onScrollToBottom();
        }
      },
      [onScrollToBottom]
    );
    const { value: currentValue, setValue } = useSelectState({
      value,
      defaultValue,
      isMulti,
      onChange,
    });

    const flatOptions = React.useMemo(() => {
      if (groups) {
        return groups.flatMap((g) => g.options);
      }
      return options;
    }, [options, groups]);

    const filteredOptions = React.useMemo(() => {
      if (!search) {
        return groups || [{ options }];
      }
      const searchLower = search.toLowerCase();
      const filtered = flatOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchLower) ||
          opt.value.toLowerCase().includes(searchLower)
      );

      if (
        isCreatable &&
        search &&
        !filtered.some((opt) => opt.value.toLowerCase() === search.toLowerCase())
      ) {
        return [{ options: [{ value: search, label: defaultMessages.createPlaceholder(search) }] }];
      }

      return [{ options: filtered }];
    }, [search, flatOptions, groups, options, isCreatable]);

    const selectedValues = React.useMemo(() => {
      if (!currentValue) return [];
      const values = Array.isArray(currentValue) ? currentValue : [currentValue];
      return values
        .map((v) => flatOptions.find((opt) => opt.value === v))
        .filter((opt): opt is SelectOption => opt !== undefined);
    }, [currentValue, flatOptions]);

    const handleSelect = React.useCallback(
      (selectedValue: string, isCreate = false) => {
        if (isMulti) {
          const current = Array.isArray(currentValue) ? currentValue : [];
          if (current.includes(selectedValue)) {
            setValue(current.filter((v) => v !== selectedValue));
          } else {
            setValue([...current, selectedValue]);
          }
        } else {
          setValue(selectedValue);
          setOpen(false);
        }
        setSearch('');

        if (isCreate && onCreateOption) {
          onCreateOption(selectedValue);
        }
      },
      [isMulti, currentValue, setValue, onCreateOption, setOpen]
    );

    const handleRemove = React.useCallback(
      (removeValue: string) => {
        if (isMulti && Array.isArray(currentValue)) {
          setValue(currentValue.filter((v) => v !== removeValue));
        }
      },
      [isMulti, currentValue, setValue]
    );

    const handleClear = React.useCallback(() => {
      setValue(isMulti ? [] : null);
      setSearch('');
    }, [isMulti, setValue]);

    const isSelected = React.useCallback(
      (optionValue: string) => {
        if (!currentValue) return false;
        return Array.isArray(currentValue)
          ? currentValue.includes(optionValue)
          : currentValue === optionValue;
      },
      [currentValue]
    );

    const triggerLabel = React.useMemo(() => {
      if (selectedValues.length === 0) return placeholder;
      if (isMulti) {
        return selectedValues.map((opt) => opt.label).join(', ');
      }
      return selectedValues[0]?.label || placeholder;
    }, [selectedValues, isMulti, placeholder]);

    const isCreateOption = React.useCallback(
      (option: SelectOption) => {
        return (
          isCreatable &&
          option.value === search &&
          !flatOptions.some((opt) => opt.value.toLowerCase() === search.toLowerCase())
        );
      },
      [isCreatable, search, flatOptions]
    );

    return (
      <Popover open={open} onOpenChange={(val) => !isDisabled && setOpen(val)}>
        <PopoverTrigger asChild>
          <div
            ref={ref}
            id={id}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy || (id ? `${id}-label` : undefined)}
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            aria-disabled={isDisabled}
            className={cn(
              'flex w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-1 pr-2 pl-2.5 text-sm text-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 select-none',
              !isDisabled && 'cursor-pointer hover:bg-slate-100',
              selectedValues.length === 0 && 'text-muted-foreground',
              invalid && 'border-destructive focus-visible:ring-destructive/50',
              size === 'sm' ? 'min-h-7' : 'min-h-8',
              isDisabled && 'pointer-events-none cursor-not-allowed bg-input/50 opacity-50',
              className
            )}
            tabIndex={isDisabled ? -1 : 0}
          >
            <div
              className={cn(
                'flex w-full items-center gap-1.5 overflow-hidden',
                isMulti && 'flex-wrap'
              )}
            >
              {isMulti && selectedValues.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1 py-0.5">
                  {selectedValues.map((opt) => (
                    <Badge
                      key={opt.value}
                      variant="secondary"
                      className="h-5 rounded-full px-1.5 text-xs"
                    >
                      <span className="truncate">{opt.label}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(opt.value);
                        }}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        aria-label={`Remove ${opt.label}`}
                      >
                        <XIcon className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="truncate">{triggerLabel}</span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {isLoading && <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />}
              {!isLoading && isClearable && selectedValues.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="rounded-sm p-0.5 hover:bg-muted-foreground/20"
                  aria-label="Clear selection"
                >
                  <XIcon className="size-3.5 text-muted-foreground" />
                </button>
              )}
              <ChevronDownIcon
                className={cn(
                  'size-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
                  open && 'rotate-180'
                )}
              />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-(--radix-popover-trigger-width) p-0"
          align="start"
          sideOffset={4}
          container={popoverContainer}
        >
          <Command shouldFilter={false}>
            {isSearchable && (
              <CommandInput
                placeholder={defaultMessages.searchPlaceholder}
                value={search}
                onValueChange={(val) => {
                  setSearch(val);
                  onSearchChange?.(val);
                }}
                className="h-9"
              />
            )}
            <CommandList
              className="mt-2 max-h-60 overflow-y-auto"
              onScroll={onScrollToBottom ? handleListScroll : undefined}
            >
              <CommandEmpty>{isLoading ? loadingMessage : noOptionsMessage}</CommandEmpty>
              {filteredOptions.map((group, groupIndex) => (
                <CommandGroup key={groupIndex} heading="">
                  <div className="flex items-center px-2 py-1.5 gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {group.heading}
                    </span>
                    {group.headingBadge && (
                      <Badge variant="default" className="text-xs">
                        {group.headingBadge}
                      </Badge>
                    )}
                  </div>
                  {group.options.map((option) => {
                    const selected = isSelected(option.value);
                    const isCreate = isCreateOption(option);

                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option.value, isCreate)}
                        disabled={option.disabled}
                      >
                        <div className={'flex flex-col gap-2 items-start'}>
                          <div className="flex w-full items-center">
                            <CheckIcon
                              className={cn(
                                'mr-2 size-4 shrink-0',
                                selected ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {isCreate ? (
                              <span className="italic">{option.label}</span>
                            ) : (
                              option.label
                            )}
                          </div>
                          {option.skills && option.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 pl-6">
                              {option.skills.map((skill) => (
                                <Badge
                                  key={skill.id}
                                  variant="success"
                                  className="h-5 rounded-full px-1.5 text-[10px] font-normal"
                                >
                                  {skill.skillCatalog?.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

AsyncSelect.displayName = 'AsyncSelect';
