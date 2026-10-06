import type { ReactNode } from 'react';
import type { DefaultValues, FieldValues, Path, SubmitHandler } from 'react-hook-form';
import type { ZodType } from 'zod';
import type { SelectGroup, SelectOption } from '@/components/atoms';
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type ColSpanValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type RowSpanValue = 1 | 2 | 3 | 4 | 5 | 6;

/** A plain number or a responsive map: `{ base: 12, md: 6, lg: 4 }` */
export type ColSpan = ColSpanValue | Partial<Record<'base' | Breakpoint, ColSpanValue>>;
/** A plain number or a responsive map: `{ base: 1, md: 2 }` */
export type RowSpan = RowSpanValue | Partial<Record<'base' | Breakpoint, RowSpanValue>>;

/** Condition to evaluate if a field should be enabled */
export interface FieldCondition<T extends FieldValues> {
  field: Path<T>;
  /** Enable field when dependent field has this value */
  value?: any;
  /** Enable field when dependent field has one of these values */
  values?: any[];
  /** Custom evaluator function */
  evaluator?: (fieldValue: any) => boolean;
}

/** Rule to enable/disable a field based on other field values */
export interface FieldRule<T extends FieldValues> {
  /** Conditions to check */
  conditions: FieldCondition<T>[];
  /** 'all' = all conditions must be true (AND), 'any' = at least one must be true (OR) */
  mode?: 'all' | 'any';
}

/** Condition to make field required based on other field values */
export interface RequiredCondition<T extends FieldValues> {
  field: Path<T>;
  value?: any;
  values?: any[];
  evaluator?: (fieldValue: any) => boolean;
}

/** Rule to make a field required based on other field values */
export interface RequiredRule<T extends FieldValues> {
  conditions: RequiredCondition<T>[];
  mode?: 'all' | 'any';
}

/** Condition to hide field based on other field values */
export interface HideCondition<T extends FieldValues> {
  field: Path<T>;
  value?: any;
  values?: any[];
  evaluator?: (fieldValue: any) => boolean;
}

/** Rule to hide field based on other field values */
export interface HideRule<T extends FieldValues> {
  conditions: HideCondition<T>[];
  mode?: 'all' | 'any';
  defaultHidden?: boolean;
}

interface BaseFieldConfig<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  colSpan?: ColSpan;
  rowSpan?: RowSpan;
  className?: string;
  /** Rules to enable/disable this field based on other field values */
  enableRules?: FieldRule<T>[];
  /** Rules to make this field required based on other field values */
  requiredRules?: RequiredRule<T>[];
  /** Rules to hide this field based on other field values */
  hideRules?: HideRule<T>[];
}

export interface TextFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'text' | 'email' | 'password';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Static prefix displayed before the input value (e.g. "+62" for phone) */
  prefix?: string;
  /** Validate this field on blur (when user leaves the field) */
  validateOnBlur?: boolean;
  /** Input mask — single function or array of functions applied left-to-right */
  mask?: ((value: string) => string) | ((value: string) => string)[];
}

export interface NumberFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'number';
  allowNegative?: boolean;
  decimalPlaces?: number;
  /** Value to store when the input is cleared. Defaults to undefined. */
  emptyValue?: number;
}

export interface CurrencyFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'currency';
  currency?: string;
  locale?: string;
  decimalPlaces?: number;
}

export interface InputCurrencyFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'input-currency';
  prefix?: string;
  locale?: string;
  decimalPlaces?: number;
}

export interface SelectFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'select';
  options?: SelectOption[];
  groups?: SelectGroup[];
  isMulti?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  isCreatable?: boolean;
  isLoading?: boolean;
  onCreateOption?: (value: string) => void;
  onScrollToBottom?: () => void;
  onSearchChange?: (value: string) => void;
  onValueChange?: (value: unknown) => void;
  /** Portal container for the dropdown. Pass the scrollable ancestor when the field sits inside a Drawer/Dialog so its options list can be scrolled. */
  popoverContainer?: HTMLElement | null;
}

export interface DateFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'date';
  minDate?: Date;
  maxDate?: Date;
}

export interface DateRangeFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'date-range';
  minDate?: Date;
  maxDate?: Date;
}

export interface TimeFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'time';
  minTime?: string;
  maxTime?: string;
}

export interface CheckboxFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'checkbox';
  description?: string;
}

export interface CheckboxGroupItem<T extends FieldValues> {
  label: string;
  name: Path<T>;
}

export interface CheckboxGroupFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'checkbox-group';
  items: CheckboxGroupItem<T>[];
}

export interface SwitchFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'switch';
  labelPosition?: 'left' | 'right';
  stateActiveLabel?: string;
  stateInactiveLabel?: string;
}

export interface TextareaFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'textarea';
  rows?: number;
}

export interface ExistingFile {
  id: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  url: string;
}

export interface FileFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'file-input';
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  existingFiles?: ExistingFile[];
}

export interface SeparatorConfig {
  type: 'separator';
  label?: string;
  colSpan?: ColSpan;
  rowSpan?: RowSpan;
  className?: string;
}

export interface SelectGroupFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'select-group';
  options?: SelectOption[];
  isLoading?: boolean;
}

export interface CustomConfig {
  type: 'custom';
  content: ReactNode;
  colSpan?: ColSpan;
  rowSpan?: RowSpan;
  className?: string;
}

export type FormFieldConfig<T extends FieldValues> =
  | TextFieldConfig<T>
  | NumberFieldConfig<T>
  | CurrencyFieldConfig<T>
  | InputCurrencyFieldConfig<T>
  | SelectFieldConfig<T>
  | DateFieldConfig<T>
  | DateRangeFieldConfig<T>
  | TimeFieldConfig<T>
  | CheckboxFieldConfig<T>
  | CheckboxGroupFieldConfig<T>
  | SwitchFieldConfig<T>
  | TextareaFieldConfig<T>
  | FileFieldConfig<T>
  | SelectGroupFieldConfig<T>
  | SeparatorConfig
  | CustomConfig;

export interface FormGeneratorProps<T extends FieldValues> {
  id?: string;
  schema: ZodType<T>;
  fields: FormFieldConfig<T>[];
  onSubmit: SubmitHandler<T>;
  defaultValues?: DefaultValues<T>;
  className?: string;
  actions?: ReactNode;
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all';
  /** Keep form values local instead of syncing them from defaultValues. */
  syncValues?: boolean;
  /** Backend validation errors to display under form fields */
  externalErrors?: Record<string, string[]>;
}
