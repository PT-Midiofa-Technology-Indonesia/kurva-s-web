'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Search, X } from 'lucide-react';
import { useEffect } from 'react';
import type { FieldValues } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import type { ZodType } from 'zod';
import { FormFieldRenderer } from '@/components/organisms/FormGenerator/FormFieldRenderer';
import type { FormFieldConfig } from '@/components/organisms/FormGenerator/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { resolveColSpan, resolveRowSpan } from '@/shared/utils/grid';

export interface AdvancedFilterProps<T extends FieldValues> {
  title?: string;
  schema: ZodType<T>;
  fields: FormFieldConfig<T>[];
  defaultValues?: Partial<T>;
  onApply: (data: T) => void;
  onReset?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function AdvancedFilter<T extends FieldValues>({
  title = 'Filter',
  schema,
  fields,
  defaultValues,
  onApply,
  onReset,
  isLoading = false,
  className,
}: AdvancedFilterProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as any,
    mode: 'onChange',
  });

  // Sync form state when defaultValues change
  useEffect(() => {
    form.reset(defaultValues as any);
  }, [defaultValues, form]);

  const handleReset = () => {
    // Reset by setting all values to null for select/date fields, undefined for others
    fields.forEach((field) => {
      if ('name' in field) {
        // Select, date, and date-range fields need null instead of undefined
        const emptyValue =
          field.type === 'select' || field.type === 'date' || field.type === 'date-range'
            ? null
            : undefined;

        form.setValue(field.name as any, emptyValue as any, {
          shouldValidate: false,
          shouldDirty: true,
          shouldTouch: false,
        });
      }
    });

    onReset?.();
  };

  const handleSubmit = (data: T) => {
    // Convert Date objects to ISO strings for URL params
    const converted = Object.entries(data).reduce((acc, [key, value]) => {
      if (value instanceof Date) {
        acc[key as keyof T] = value.toISOString() as any;
      } else {
        acc[key as keyof T] = value;
      }
      return acc;
    }, {} as T);
    onApply(converted);
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn(
          'flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm',
          className
        )}
        noValidate
      >
        {title && <div className="text-sm font-medium text-slate-500">{title}</div>}

        <div className="grid grid-cols-12 gap-x-4 gap-y-4">
          {fields.map((field, index) => {
            const key = 'name' in field ? field.name : `${field.type}-${index}`;
            const colClass = resolveColSpan(field.colSpan ?? 12);
            const rowClass = resolveRowSpan(field.rowSpan);
            return (
              <div key={key} className={cn(colClass, rowClass, field.className)}>
                <FormFieldRenderer<T> field={field} />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="gap-2 bg-slate-900 hover:bg-slate-800"
          >
            <Search className="h-4 w-4" />
            {isLoading ? 'Searching...' : 'Apply'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
