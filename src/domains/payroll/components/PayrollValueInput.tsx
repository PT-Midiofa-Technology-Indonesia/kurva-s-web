'use client';

import { InputCurrency } from '@/shared/components/atoms/Input/InputCurrency';
import { InputNumber } from '@/shared/components/atoms/Input/InputNumber';
import type { PayrollValueType } from '../types';

interface PayrollValueInputProps {
  valueType: PayrollValueType;
  value?: number;
  onChange: (value: number | undefined) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  showLabel?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function PayrollValueInput({
  valueType,
  placeholder = '0',
  ...props
}: PayrollValueInputProps) {
  if (valueType === 'percentage') {
    return (
      <InputNumber
        {...props}
        placeholder={placeholder}
        decimalPlaces={2}
        rightIcon={<span className="text-sm text-slate-500">%</span>}
      />
    );
  }

  return <InputCurrency {...props} placeholder={placeholder} />;
}
