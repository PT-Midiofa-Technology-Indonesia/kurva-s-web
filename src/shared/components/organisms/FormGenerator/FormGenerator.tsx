'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import type { FieldValues, Path } from 'react-hook-form';
import { FormProvider, useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { resolveColSpan, resolveRowSpan } from '@/shared/utils/grid';
import { FormFieldRenderer } from './FormFieldRenderer';
import type { FormGeneratorProps } from './types';

export function FormGenerator<T extends FieldValues>({
  id,
  schema,
  fields,
  onSubmit,
  defaultValues,
  className,
  actions,
  mode = 'onChange',
  syncValues = true,
  externalErrors,
}: FormGeneratorProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema as any),
    defaultValues,
    values: syncValues ? (defaultValues as unknown as T) : undefined,
    mode,
  });

  const prevExternalErrorsRef = useRef<Record<string, string[]>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && e.target instanceof HTMLElement) {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const isButton = tagName === 'button';
      const isTextarea = tagName === 'textarea';
      const hasRole = target.getAttribute('role');

      if (isButton || hasRole === 'button') {
        return;
      }

      if (isTextarea) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          form.handleSubmit(onSubmit as any)();
        }
        return;
      }

      e.preventDefault();
      form.handleSubmit(onSubmit as any)();
    }
  };

  useEffect(() => {
    // Clear previously set external errors that are no longer present
    Object.keys(prevExternalErrorsRef.current).forEach((field) => {
      if (!externalErrors?.[field]) {
        form.clearErrors(field as Path<T>);
      }
    });

    // Set new external errors from backend
    if (externalErrors) {
      Object.entries(externalErrors).forEach(([field, messages]) => {
        if (messages.length > 0) {
          form.setError(field as Path<T>, {
            type: 'server',
            message: messages[0],
          });
        }
      });
    }

    prevExternalErrorsRef.current = externalErrors || {};
  }, [externalErrors, form]);

  return (
    <FormProvider {...form}>
      <form
        ref={formRef}
        id={id}
        onSubmit={form.handleSubmit(onSubmit as any)}
        onKeyDown={handleKeyDown}
        className={cn('grid grid-cols-12 gap-x-4 gap-y-5', className)}
        noValidate
      >
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

        {actions && <div className="col-span-12">{actions}</div>}
      </form>
    </FormProvider>
  );
}
