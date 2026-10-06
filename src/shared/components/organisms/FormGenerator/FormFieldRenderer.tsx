'use client';

import { format } from 'date-fns';
import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, type FieldValues, type Path, useFormContext, useWatch } from 'react-hook-form';
import {
  AsyncSelect,
  Checkbox,
  Input,
  InputCurrency,
  InputNumber,
  SelectGroupField,
  Switch,
} from '@/components/atoms';
import { DatePicker } from '@/components/molecules';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FileInput } from '@/shared/components/molecules/FileInput';
import type {
  CheckboxFieldConfig,
  CheckboxGroupFieldConfig,
  CurrencyFieldConfig,
  CustomConfig,
  DateFieldConfig,
  DateRangeFieldConfig,
  ExistingFile,
  FieldRule,
  FileFieldConfig,
  FormFieldConfig,
  HideCondition,
  HideRule,
  InputCurrencyFieldConfig,
  NumberFieldConfig,
  RequiredCondition,
  RequiredRule,
  SelectFieldConfig,
  SelectGroupFieldConfig,
  SeparatorConfig,
  SwitchFieldConfig,
  TextareaFieldConfig,
  TextFieldConfig,
  TimeFieldConfig,
} from './types';

function evaluateCondition<T extends FieldValues>(
  fieldValue: any,
  condition: FieldRule<T>['conditions'][0]
): boolean {
  if (condition.evaluator) {
    return condition.evaluator(fieldValue);
  }
  if (condition.values) {
    return condition.values.includes(fieldValue);
  }
  if (condition.value !== undefined) {
    return fieldValue === condition.value;
  }
  return !!fieldValue;
}

function evaluateRequiredCondition<T extends FieldValues>(
  fieldValue: any,
  condition: RequiredCondition<T>
): boolean {
  if (condition.evaluator) {
    return condition.evaluator(fieldValue);
  }
  if (condition.values) {
    return condition.values.includes(fieldValue);
  }
  if (condition.value !== undefined) {
    return fieldValue === condition.value;
  }
  return !!fieldValue;
}

function evaluateRequiredRules<T extends FieldValues>(
  rules: RequiredRule<T>[] | undefined,
  formValues: Partial<T>
): boolean {
  if (!rules || rules.length === 0) return false;

  return rules.some((rule) => {
    const conditionResults = rule.conditions.map((cond) => {
      const fieldValue = formValues[cond.field as keyof T];
      return evaluateRequiredCondition(fieldValue, cond);
    });

    if (rule.mode === 'all') {
      return conditionResults.every((result) => result);
    }
    return conditionResults.some((result) => result);
  });
}

function evaluateHideCondition<T extends FieldValues>(
  fieldValue: any,
  condition: HideCondition<T>
): boolean {
  if (condition.evaluator) {
    return condition.evaluator(fieldValue);
  }
  if (condition.values) {
    return condition.values.includes(fieldValue);
  }
  if (condition.value !== undefined) {
    return fieldValue === condition.value;
  }
  return !!fieldValue;
}

function evaluateHideRules<T extends FieldValues>(
  rules: HideRule<T>[] | undefined,
  formValues: Partial<T>
): boolean {
  if (!rules || rules.length === 0) return false;

  const hasDefaultHidden = rules.some((rule) => rule.defaultHidden);

  if (hasDefaultHidden) {
    return rules.every((rule) => {
      if (!rule.defaultHidden) return false;

      const conditionResults = rule.conditions.map((cond) => {
        const fieldValue = formValues[cond.field as keyof T];
        return evaluateHideCondition(fieldValue, cond);
      });

      const conditionMet =
        rule.mode === 'all' ? conditionResults.every(Boolean) : conditionResults.some(Boolean);

      return !conditionMet;
    });
  }

  return rules.some((rule) => {
    const conditionResults = rule.conditions.map((cond) => {
      const fieldValue = formValues[cond.field as keyof T];
      return evaluateHideCondition(fieldValue, cond);
    });
    if (rule.mode === 'all') {
      return conditionResults.every(Boolean);
    }
    return conditionResults.some(Boolean);
  });
}

function evaluateRules<T extends FieldValues>(
  rules: FieldRule<T>[] | undefined,
  formValues: Partial<T>
): boolean {
  if (!rules || rules.length === 0) return true;

  return rules.every((rule) => {
    const conditionResults = rule.conditions.map((cond) => {
      const fieldValue = formValues[cond.field as keyof T];
      return evaluateCondition(fieldValue, cond);
    });

    if (rule.mode === 'any') {
      return conditionResults.some((result) => result);
    }
    return conditionResults.every((result) => result);
  });
}

interface FieldWrapperProps {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  id?: string;
  children: React.ReactNode;
}

function FieldWrapper({ id, label, required, hint, error, children }: FieldWrapperProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <Label
          id={id ? `${id}-label` : undefined}
          htmlFor={id}
          className={cn(
            required && 'after:content-["*"] after:ml-0.5 after:text-primary',
            error && 'text-destructive after:text-destructive'
          )}
        >
          {label}
        </Label>
      )}
      {children}
      {(error ?? hint) && (
        <p className={cn('text-sm', error ? 'text-destructive' : 'text-muted-foreground')}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

function TextFieldInput({
  field,
  error,
  computedDisabled,
  computedRequired,
}: {
  field: TextFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
  computedRequired: boolean;
}) {
  const { control, trigger } = useFormContext<FieldValues>();
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = field.type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : field.type;
  const rightIcon = isPassword ? (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="text-slate-500 hover:text-slate-700"
      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
    >
      {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
    </button>
  ) : (
    field.rightIcon
  );

  return (
    <FieldWrapper
      id={field.name}
      label={field.label}
      required={computedRequired}
      hint={field.hint}
      error={error}
    >
      <Controller
        name={field.name}
        control={control}
        render={({ field: { value, onChange, onBlur, ref } }) => (
          <Input
            ref={ref}
            type={inputType}
            value={value ?? ''}
            name={field.name}
            id={field.name}
            showLabel={false}
            showHint={false}
            required={computedRequired}
            disabled={computedDisabled}
            placeholder={field.placeholder}
            leftIcon={field.leftIcon}
            rightIcon={rightIcon}
            prefix={field.prefix}
            error={error}
            onChange={(e) => {
              const masks = field.mask
                ? Array.isArray(field.mask)
                  ? field.mask
                  : [field.mask]
                : [];
              onChange(masks.reduce((v, fn) => fn(v), e.target.value));
            }}
            onBlur={async () => {
              onBlur();
              if (field.validateOnBlur) {
                await trigger(field.name);
              }
            }}
          />
        )}
      />
    </FieldWrapper>
  );
}

function NumberFieldInput({
  field,
  error,
  computedDisabled,
  computedRequired,
}: {
  field: NumberFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
  computedRequired: boolean;
}) {
  const { control } = useFormContext<FieldValues>();
  return (
    <FieldWrapper
      id={field.name}
      label={field.label}
      required={computedRequired}
      hint={field.hint}
      error={error}
    >
      <Controller
        name={field.name}
        control={control}
        render={({ field: { value, onChange, onBlur, ref } }) => (
          <InputNumber
            ref={ref}
            value={value}
            onChange={(nextValue) =>
              onChange(nextValue === undefined ? field.emptyValue : nextValue)
            }
            onBlur={onBlur}
            showLabel={false}
            showHint={false}
            required={computedRequired}
            disabled={computedDisabled}
            placeholder={field.placeholder}
            allowNegative={field.allowNegative}
            decimalPlaces={field.decimalPlaces}
            id={field.name}
          />
        )}
      />
    </FieldWrapper>
  );
}

function CurrencyFieldInput({
  field,
  error,
  computedDisabled,
  computedRequired,
}: {
  field: CurrencyFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
  computedRequired: boolean;
}) {
  const { control } = useFormContext<FieldValues>();
  return (
    <FieldWrapper
      id={field.name}
      label={field.label}
      required={computedRequired}
      hint={field.hint}
      error={error}
    >
      <Controller
        name={field.name}
        control={control}
        render={({ field: { value, onChange, onBlur, ref } }) => (
          <InputCurrency
            ref={ref}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            showLabel={false}
            showHint={false}
            required={computedRequired}
            disabled={computedDisabled}
            placeholder={field.placeholder}
            currency={field.currency}
            locale={field.locale}
            decimalPlaces={field.decimalPlaces}
            id={field.name}
          />
        )}
      />
    </FieldWrapper>
  );
}

function InputCurrencyFieldInput({
  field,
  error,
  computedDisabled,
  computedRequired,
}: {
  field: InputCurrencyFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
  computedRequired: boolean;
}) {
  const { control } = useFormContext<FieldValues>();
  return (
    <FieldWrapper
      id={field.name}
      label={field.label}
      required={computedRequired}
      hint={field.hint}
      error={error}
    >
      <Controller
        name={field.name}
        control={control}
        render={({ field: { value, onChange, onBlur, ref } }) => (
          <InputCurrency
            ref={ref}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            showLabel={false}
            showHint={false}
            required={computedRequired}
            disabled={computedDisabled}
            placeholder={field.placeholder}
            prefix={field.prefix}
            locale={field.locale}
            decimalPlaces={field.decimalPlaces}
            id={field.name}
          />
        )}
      />
    </FieldWrapper>
  );
}

function SelectFieldInput({
  field,
  error,
  computedDisabled,
  computedRequired,
}: {
  field: SelectFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
  computedRequired: boolean;
}) {
  const { control } = useFormContext<FieldValues>();

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: { value, onChange, ref } }) => (
        <FieldWrapper
          id={field.name}
          label={field.label}
          required={computedRequired}
          hint={field.hint}
          error={error}
        >
          <AsyncSelect
            ref={ref}
            value={value}
            onChange={(val) => {
              if (!computedDisabled) {
                onChange(val);
                field.onValueChange?.(val);
              }
            }}
            options={field.options}
            groups={field.groups}
            isMulti={field.isMulti}
            isClearable={field.isClearable && !computedDisabled}
            isSearchable={field.isSearchable && !computedDisabled}
            isDisabled={computedDisabled}
            isLoading={field.isLoading}
            isCreatable={field.isCreatable && !computedDisabled}
            onCreateOption={computedDisabled ? undefined : field.onCreateOption}
            placeholder={field.placeholder}
            invalid={!!error}
            id={field.name}
            onScrollToBottom={field.onScrollToBottom}
            onSearchChange={field.onSearchChange}
            popoverContainer={field.popoverContainer}
          />
        </FieldWrapper>
      )}
    />
  );
}

function SelectGroupFieldInput({
  field,
  error,
  computedDisabled,
  computedRequired,
}: {
  field: SelectGroupFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
  computedRequired: boolean;
}) {
  const { control } = useFormContext<FieldValues>();
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <FieldWrapper
          id={field.name}
          label={field.label}
          required={computedRequired}
          hint={field.hint}
          error={error}
        >
          <SelectGroupField
            value={Array.isArray(value) ? value : []}
            options={field.options ?? []}
            onChange={(val) => onChange(val)}
            placeholder={field.placeholder}
            isLoading={field.isLoading}
            disabled={computedDisabled}
            invalid={!!error}
            id={field.name}
          />
        </FieldWrapper>
      )}
    />
  );
}

function toDateOrNull(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) return direct;
    const dateOnly = new Date(`${value}T00:00:00`);
    return Number.isNaN(dateOnly.getTime()) ? null : dateOnly;
  }
  return null;
}

function DateFieldInput({
  field,
  error,
  computedDisabled,
  computedRequired,
}: {
  field: DateFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
  computedRequired: boolean;
}) {
  const { control } = useFormContext<FieldValues>();
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <FieldWrapper
          label={field.label}
          required={computedRequired}
          hint={field.hint}
          error={error}
        >
          <DatePicker
            mode="single"
            value={toDateOrNull(value)}
            onChange={(date) => onChange(date instanceof Date ? format(date, 'yyyy-MM-dd') : '')}
            placeholder={field.placeholder}
            disabledState={computedDisabled}
            minDate={field.minDate}
            maxDate={field.maxDate}
            className={cn(error && 'border-destructive focus-visible:ring-destructive')}
          />
        </FieldWrapper>
      )}
    />
  );
}

function DateRangeFieldInput({
  field,
  error,
  computedDisabled,
  computedRequired,
}: {
  field: DateRangeFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
  computedRequired: boolean;
}) {
  const { control } = useFormContext<FieldValues>();
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <FieldWrapper
          label={field.label}
          required={computedRequired}
          hint={field.hint}
          error={error}
        >
          <DatePicker
            mode="range"
            value={value}
            onChange={onChange}
            placeholder={field.placeholder}
            disabledState={computedDisabled}
            minDate={field.minDate}
            maxDate={field.maxDate}
            className={cn(error && 'border-destructive focus-visible:ring-destructive')}
          />
        </FieldWrapper>
      )}
    />
  );
}

function TimeFieldInput({
  field,
  error,
  computedDisabled,
  computedRequired,
}: {
  field: TimeFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
  computedRequired: boolean;
}) {
  const { control } = useFormContext<FieldValues>();
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: { value, onChange, onBlur, ref } }) => (
        <FieldWrapper
          id={field.name}
          label={field.label}
          required={computedRequired}
          hint={field.hint}
          error={error}
        >
          <Input
            ref={ref}
            type="time"
            value={value ?? ''}
            name={field.name}
            id={field.name}
            showLabel={false}
            showHint={false}
            required={computedRequired}
            disabled={computedDisabled}
            placeholder={field.placeholder}
            min={field.minTime}
            max={field.maxTime}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
        </FieldWrapper>
      )}
    />
  );
}

function CheckboxFieldInput({
  field,
  error,
  computedDisabled,
}: {
  field: CheckboxFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
}) {
  const { control } = useFormContext<FieldValues>();
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: { value, onChange, ref } }) => (
        <Checkbox
          ref={ref}
          checked={!!value}
          onCheckedChange={onChange}
          disabled={computedDisabled}
          label={field.label}
          description={field.description}
          error={error}
        />
      )}
    />
  );
}

function CheckboxGroupFieldInput({
  field,
  error,
  computedDisabled,
}: {
  field: CheckboxGroupFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
}) {
  const { control, trigger } = useFormContext<FieldValues>();

  return (
    <FieldWrapper label={field.label} required={field.required} error={error}>
      <div className="flex flex-wrap gap-6">
        {field.items.map((item) => (
          <Controller
            key={item.name}
            name={item.name}
            control={control}
            render={({ field: { value, onChange } }) => (
              <Checkbox
                checked={!!value}
                onCheckedChange={(checked) => {
                  onChange(checked === true);
                  void trigger(field.name as Path<FieldValues>);
                }}
                disabled={computedDisabled}
                label={item.label}
              />
            )}
          />
        ))}
      </div>
    </FieldWrapper>
  );
}

function SwitchFieldInput({
  field,
  error,
  computedDisabled,
  computedRequired,
}: {
  field: SwitchFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
  computedRequired: boolean;
}) {
  const { control } = useFormContext<FieldValues>();
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: { value, onChange, ref } }) => (
        <FieldWrapper
          label={field.label}
          required={computedRequired}
          hint={field.hint}
          error={error}
        >
          <div className="flex items-center gap-2">
            <Switch
              ref={ref}
              checked={!!value}
              onCheckedChange={onChange}
              disabled={computedDisabled}
              size="sm"
              showLabel={false}
            />
            {(field.stateActiveLabel || field.stateInactiveLabel) && (
              <span className="text-sm text-slate-600">
                {value ? field.stateActiveLabel : field.stateInactiveLabel}
              </span>
            )}
          </div>
        </FieldWrapper>
      )}
    />
  );
}

function TextareaFieldInput({
  field,
  error,
  computedDisabled,
  computedRequired,
}: {
  field: TextareaFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
  computedRequired: boolean;
}) {
  const { register } = useFormContext<FieldValues>();
  return (
    <FieldWrapper label={field.label} required={computedRequired} hint={field.hint} error={error}>
      <Textarea
        {...register(field.name)}
        placeholder={field.placeholder}
        disabled={computedDisabled}
        rows={field.rows}
        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
        aria-invalid={!!error}
      />
    </FieldWrapper>
  );
}

function FileFieldInput({
  field,
  error,
  computedDisabled,
}: {
  field: FileFieldConfig<FieldValues>;
  error?: string;
  computedDisabled: boolean;
}) {
  const { control, setValue, watch } = useFormContext<FieldValues>();
  const keptIdsKey = `${field.name}__existingIds`;
  const keptIds = (watch(keptIdsKey) as string[] | undefined) ?? [];

  useEffect(() => {
    if (!field.existingFiles || field.existingFiles.length === 0) return;
    setValue(
      keptIdsKey,
      field.existingFiles.map((f) => f.id),
      { shouldDirty: false }
    );
  }, [field.existingFiles, keptIdsKey, setValue]);

  const displayedExistingFiles = (field.existingFiles ?? []).filter((f) => keptIds.includes(f.id));

  const handleExistingFilesChange = (files: ExistingFile[]) => {
    setValue(
      keptIdsKey,
      files.map((f) => f.id),
      { shouldDirty: true }
    );
  };

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <div className="flex flex-col gap-2">
          <FileInput
            value={(value as File[]) || []}
            onChange={(files) => onChange(files)}
            accept={field.accept}
            maxFiles={field.maxFiles}
            maxSize={field.maxSize}
            disabled={computedDisabled}
            error={error}
            existingFiles={displayedExistingFiles}
            onExistingFilesChange={handleExistingFilesChange}
          />
        </div>
      )}
    />
  );
}

function SeparatorField({ field }: { field: SeparatorConfig }) {
  if (field.label) {
    return (
      <div className={cn('flex items-center gap-3', field.className)}>
        <Separator className="flex-1" />
        <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">
          {field.label}
        </span>
        <Separator className="flex-1" />
      </div>
    );
  }
  return <Separator className={field.className} />;
}

function getResetValue(field: FormFieldConfig<FieldValues>): unknown {
  switch (field.type) {
    case 'select':
      return (field as SelectFieldConfig<FieldValues>).isMulti ? [] : null;
    case 'checkbox':
    case 'switch':
      return false;
    case 'number':
    case 'currency':
    case 'input-currency':
    case 'date':
    case 'date-range':
    case 'time':
      return null;
    case 'file-input':
      return [];
    default:
      return '';
  }
}

// checkbox-group doesn't have a single reset value since each item is its own field

export function FormFieldRenderer<T extends FieldValues>({ field }: { field: FormFieldConfig<T> }) {
  const {
    formState: { errors },
    setValue,
  } = useFormContext<T>();

  // Only fields declaring value-dependent rules need the whole-form subscription.
  // An unscoped useWatch() re-renders on EVERY keystroke in ANY field, and this
  // component wraps every field — so without the guard a single character typed
  // re-renders the entire form, including heavy `custom` fields (e.g. a DataTable).
  const hasValueDependentRules = Boolean(
    ('enableRules' in field && field.enableRules?.length) ||
      ('requiredRules' in field && field.requiredRules?.length) ||
      ('hideRules' in field && field.hideRules?.length)
  );
  const formValues = useWatch<T>({ disabled: !hasValueDependentRules });

  const name = 'name' in field ? (field.name as string) : undefined;
  const error = name ? (errors[name]?.message as string | undefined) : undefined;

  const rulesEnabled = 'enableRules' in field ? evaluateRules(field.enableRules, formValues) : true;
  const staticDisabled = 'disabled' in field ? (field as any).disabled : false;
  const isDisabled = staticDisabled || false || !rulesEnabled;

  const isRequiredByRules =
    'requiredRules' in field ? evaluateRequiredRules(field.requiredRules, formValues) : false;
  const staticRequired = 'required' in field ? (field as any).required : false;
  const isRequired = staticRequired || isRequiredByRules;

  const isHiddenByRules =
    'hideRules' in field ? evaluateHideRules(field.hideRules, formValues) : false;
  const isHidden = isHiddenByRules;

  // Track previous rulesEnabled to detect enabled → disabled transition only
  const prevRulesEnabledRef = useRef(rulesEnabled);
  useEffect(() => {
    const wasEnabled = prevRulesEnabledRef.current;
    prevRulesEnabledRef.current = rulesEnabled;

    if (wasEnabled && !rulesEnabled && name && 'enableRules' in field) {
      setValue(name as Path<T>, getResetValue(field as FormFieldConfig<FieldValues>) as any);
    }
  }, [rulesEnabled, name, field, setValue]);

  // Don't render if hidden
  if (isHidden) return null;

  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
      return (
        <TextFieldInput
          field={field as TextFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
          computedRequired={isRequired}
        />
      );
    case 'number':
      return (
        <NumberFieldInput
          field={field as NumberFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
          computedRequired={isRequired}
        />
      );
    case 'currency':
      return (
        <CurrencyFieldInput
          field={field as CurrencyFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
          computedRequired={isRequired}
        />
      );
    case 'input-currency':
      return (
        <InputCurrencyFieldInput
          field={field as InputCurrencyFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
          computedRequired={isRequired}
        />
      );
    case 'select':
      return (
        <SelectFieldInput
          field={field as SelectFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
          computedRequired={isRequired}
        />
      );
    case 'select-group':
      return (
        <SelectGroupFieldInput
          field={field as SelectGroupFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
          computedRequired={isRequired}
        />
      );
    case 'date':
      return (
        <DateFieldInput
          field={field as DateFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
          computedRequired={isRequired}
        />
      );
    case 'date-range':
      return (
        <DateRangeFieldInput
          field={field as DateRangeFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
          computedRequired={isRequired}
        />
      );
    case 'time':
      return (
        <TimeFieldInput
          field={field as TimeFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
          computedRequired={isRequired}
        />
      );
    case 'checkbox':
      return (
        <CheckboxFieldInput
          field={field as CheckboxFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
        />
      );
    case 'checkbox-group':
      return (
        <CheckboxGroupFieldInput
          field={field as CheckboxGroupFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
        />
      );
    case 'switch':
      return (
        <SwitchFieldInput
          field={field as SwitchFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
          computedRequired={isRequired}
        />
      );
    case 'textarea':
      return (
        <TextareaFieldInput
          field={field as TextareaFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
          computedRequired={isRequired}
        />
      );
    case 'file-input':
      return (
        <FileFieldInput
          field={field as FileFieldConfig<FieldValues>}
          error={error}
          computedDisabled={isDisabled}
        />
      );
    case 'separator':
      return <SeparatorField field={field as SeparatorConfig} />;
    case 'custom':
      return <>{(field as CustomConfig).content}</>;
    default:
      return null;
  }
}
