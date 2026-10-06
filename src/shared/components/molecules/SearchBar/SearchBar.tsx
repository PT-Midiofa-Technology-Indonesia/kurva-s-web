'use client';

import { Search, X } from 'lucide-react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void;
  showClear?: boolean;
  width?: string;
  defaultValue?: string;
  debounce?: number;
  onDebounce?: (value: string) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      value,
      defaultValue,
      onClear,
      showClear,
      width = '288px',
      placeholder = 'Type here',
      debounce = 300,
      onDebounce,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(
      value !== undefined ? value : defaultValue || ''
    );
    const currentValue = value !== undefined ? internalValue : internalValue;

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);
    const hasValue = typeof currentValue === 'string' && currentValue.length > 0;

    const debouncedValue = useDebounce(currentValue, debounce);
    const prevDebouncedValue = useRef(debouncedValue);

    useEffect(() => {
      if (onDebounce && debouncedValue !== prevDebouncedValue.current) {
        prevDebouncedValue.current = debouncedValue;
        onDebounce(String(debouncedValue));
      }
    }, [debouncedValue, onDebounce]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      props.onChange?.(e);
    };

    const handleClear = () => {
      setInternalValue('');
      onClear?.();
    };

    return (
      <div className={cn('relative')} style={{ width }}>
        <Input
          ref={ref}
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          leftIcon={<Search className="w-4 h-4 text-slate-500" />}
          rightIcon={
            showClear && hasValue ? (
              <Button
                variant="ghost"
                size="xs"
                onClick={handleClear}
                className="w-2 h-2 p-0 min-w-0 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </Button>
            ) : undefined
          }
          className={cn(className)}
          {...props}
        />
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
