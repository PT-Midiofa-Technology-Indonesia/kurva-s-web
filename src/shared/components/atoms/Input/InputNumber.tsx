'use client';

import { ChangeEvent, forwardRef, useState } from 'react';
import { Input, InputProps } from '@/components/atoms/Input/Input';

export interface InputNumberProps
  extends Omit<InputProps, 'type' | 'value' | 'onChange' | 'defaultValue'> {
  value?: number | string;
  defaultValue?: number | string;
  onChange?: (value: number | undefined) => void;
  allowNegative?: boolean;
  decimalPlaces?: number;
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
  ({ value, defaultValue, onChange, allowNegative = false, decimalPlaces = 2, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState<string>(() => {
      if (defaultValue !== undefined && defaultValue !== null && defaultValue !== '') {
        return String(defaultValue);
      }
      return '';
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;

      const regex = allowNegative ? /^-?\d*\.?\d{0,15}$/ : /^\d*\.?\d{0,15}$/;

      if (rawValue === '' || regex.test(rawValue)) {
        setDisplayValue(rawValue);

        if (rawValue === '' || rawValue === '-' || rawValue === '.') {
          onChange?.(undefined);
        } else {
          const num = parseFloat(rawValue);
          onChange?.(Number.isNaN(num) ? undefined : num);
        }
      }
    };

    const handleBlur = () => {
      if (displayValue === '' || displayValue === '-' || displayValue === '.') {
        setDisplayValue('');
        onChange?.(undefined);
        return;
      }

      const num = parseFloat(displayValue);
      if (!Number.isNaN(num)) {
        const formatted = num.toFixed(decimalPlaces);
        setDisplayValue(formatted);
        onChange?.(num);
      }
    };

    const currentDisplayValue =
      value !== undefined && value !== null ? String(value) : displayValue;

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={currentDisplayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        {...props}
      />
    );
  }
);

InputNumber.displayName = 'InputNumber';
