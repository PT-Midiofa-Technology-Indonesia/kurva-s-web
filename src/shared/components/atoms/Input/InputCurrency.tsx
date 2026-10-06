'use client';

import { ChangeEvent, FocusEvent, forwardRef, useEffect, useState } from 'react';
import { Input, InputProps } from '@/components/atoms/Input/Input';

export interface InputCurrencyProps
  extends Omit<InputProps, 'type' | 'value' | 'onChange' | 'defaultValue'> {
  value?: number | string;
  defaultValue?: number | string;
  onChange?: (value: number | undefined) => void;
  currency?: string;
  locale?: string;
  decimalPlaces?: number;
}

function formatCurrency(value: number | string, locale: string, decimalPlaces: number): string {
  if (value === '' || value === null || value === undefined) return '';

  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (Number.isNaN(num)) return '';

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces,
  }).format(num);
}

export const InputCurrency = forwardRef<HTMLInputElement, InputCurrencyProps>(
  (
    {
      value,
      defaultValue,
      onChange,
      onBlur,
      currency,
      locale = 'id-ID',
      decimalPlaces = 0,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState<string>(() => {
      if (defaultValue !== undefined && defaultValue !== null && defaultValue !== '') {
        return formatCurrency(defaultValue, locale, decimalPlaces);
      }
      return '';
    });

    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (!isFocused && value !== undefined && value !== null) {
        setDisplayValue(formatCurrency(value, locale, decimalPlaces));
      }
    }, [value, locale, decimalPlaces, isFocused]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const cleaned = rawValue.replace(/[^0-9]/g, '');

      setDisplayValue(cleaned);

      const num = cleaned === '' ? undefined : parseFloat(cleaned);
      onChange?.(num);
    };

    const handleFocus = () => {
      setIsFocused(true);
      if (value !== undefined && value !== null) {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        setDisplayValue(Number.isNaN(num) ? '' : String(Math.round(num * 100) / 100));
      }
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (displayValue === '' || displayValue === '0') {
        setDisplayValue('');
        onChange?.(undefined);
      } else {
        const num = parseFloat(displayValue.replace(/[^0-9]/g, ''));
        if (!Number.isNaN(num)) {
          setDisplayValue(formatCurrency(num, locale, decimalPlaces));
          onChange?.(num);
        }
      }
      onBlur?.(e);
    };

    const currentDisplayValue =
      value !== undefined && value !== null && !isFocused
        ? formatCurrency(value, locale, decimalPlaces)
        : displayValue;

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={currentDisplayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        {...props}
      />
    );
  }
);

InputCurrency.displayName = 'InputCurrency';
