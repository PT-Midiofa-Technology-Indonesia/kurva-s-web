import type { RowData } from '@tanstack/table-core';

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Discriminated union for the `edit` field in column meta.
 * TypeScript enforces that select-specific props only exist on 'select' / 'async-select' columns.
 */
export type ColumnEditMeta =
  | { editType: 'input'; inputType?: 'text' | 'number' | 'price' }
  | { editType: 'date' }
  | {
      editType: 'select';
      selectOptions?: SelectOption[];
      selectHasNextPage?: boolean;
      selectOnLoadMore?: () => void;
    }
  | {
      editType: 'async-select';
      selectOptions?: SelectOption[];
      selectHasNextPage?: boolean;
      selectOnLoadMore?: () => void;
      selectOnSearch?: (search: string) => void;
    }
  | {
      editType: 'combobox';
      /** Free-text suggestions (plain strings). Selecting one commits the value; typing anything else is also valid. */
      comboboxOptions?: string[];
      comboboxHasNextPage?: boolean;
      comboboxOnLoadMore?: () => void;
      comboboxOnSearch?: (search: string) => void;
    };

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    editable?: boolean;
    /** Per-row guard: when provided, a cell is only editable if this returns true for that row. */
    editableWhen?: (row: TData) => boolean;
    /** Omit for the default 'input' behaviour. Only 'select'/'async-select' branches carry extra props.
     * Can also be a function of the row, for row-dependent edit options (e.g. depth-aware suggestions). */
    edit?: ColumnEditMeta | ((row: TData) => ColumnEditMeta);
    cellClassName?: string | ((row: TData) => string | undefined);
    /** CSS class name(s) to apply to header cells in this column. */
    headerClassName?: string;
    /** CSS class name(s) to apply to footer cells in this column. */
    footerClassName?: string;
    /** Custom value to copy when range-copying. Falls back to cell.getValue() when omitted. */
    copyValue?: (row: TData) => unknown;
    /** Disable non-editable tooltip for this column. Default: undefined (inherits from table prop). */
    nonEditableTooltip?:
      | boolean
      | string
      | ((info: { columnId: string; header: string }) => string);
  }
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    editable?: boolean;
    /** Per-row guard: when provided, a cell is only editable if this returns true for that row. */
    editableWhen?: (row: TData) => boolean;
    /** Omit for the default 'input' behaviour. Only 'select'/'async-select' branches carry extra props.
     * Can also be a function of the row, for row-dependent edit options (e.g. depth-aware suggestions). */
    edit?: ColumnEditMeta | ((row: TData) => ColumnEditMeta);
    cellClassName?: string | ((row: TData) => string | undefined);
    /** CSS class name(s) to apply to header cells in this column. */
    headerClassName?: string;
    /** CSS class name(s) to apply to footer cells in this column. */
    footerClassName?: string;
    /** Custom value to copy when range-copying. Falls back to cell.getValue() when omitted. */
    copyValue?: (row: TData) => unknown;
    /** Disable non-editable tooltip for this column. Default: undefined (inherits from table prop). */
    nonEditableTooltip?:
      | boolean
      | string
      | ((info: { columnId: string; header: string }) => string);
  }
}
