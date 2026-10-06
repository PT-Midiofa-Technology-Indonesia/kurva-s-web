import type { ColumnDef } from '@tanstack/react-table';
import type {
  BOQCostNameAsyncSelect,
  BOQCostNameCombobox,
  BOQCostRow,
} from '../types/boq-cost.types';
import type { BOQCostColumnLabels } from '../types/boq-labels.types';

export interface BOQCostColumnsOptions {
  nameHeader: string;
  disabled: boolean;
  nameCombobox?: BOQCostNameCombobox;
  nameAsyncSelect?: BOQCostNameAsyncSelect;
  labels?: Partial<BOQCostColumnLabels>;
}

const DEFAULT_COST_COLUMN_LABELS: BOQCostColumnLabels = {
  code: 'Kode',
  name: 'Name',
  vol: 'VOL',
  uom: 'UoM',
  unitPrice: 'Unit Price',
  total: 'Total',
  salary: 'Salary/h',
  remarks: 'Remarks',
};

export function createBOQCostColumns(opts: BOQCostColumnsOptions): ColumnDef<BOQCostRow>[] {
  const labels = { ...DEFAULT_COST_COLUMN_LABELS, ...opts.labels };

  const codeEditable = !opts.disabled && !opts.nameAsyncSelect;

  const nameEditMeta = (() => {
    if (opts.disabled) return { editable: false, cellClassName: 'h-9' };
    if (opts.nameAsyncSelect) {
      return {
        editable: true,
        cellClassName: 'h-9',
        edit: {
          editType: 'async-select' as const,
          selectOptions: opts.nameAsyncSelect.options,
          selectHasNextPage: opts.nameAsyncSelect.hasNextPage,
          selectOnLoadMore: opts.nameAsyncSelect.onScrollEnd,
          selectOnSearch: opts.nameAsyncSelect.onSearch,
        },
      };
    }
    if (opts.nameCombobox) {
      return {
        editable: true,
        cellClassName: 'h-9',
        edit: {
          editType: 'combobox' as const,
          comboboxOptions: opts.nameCombobox.options,
          comboboxOnLoadMore: opts.nameCombobox.onScrollEnd,
          comboboxOnSearch: opts.nameCombobox.onSearch,
          comboboxHasNextPage: opts.nameCombobox.hasNextPage,
        },
      };
    }
    return { editable: true, cellClassName: 'h-9' };
  })();

  return [
    {
      accessorKey: 'code',
      header: labels.code,
      meta: { editable: codeEditable, cellClassName: 'h-9' },
      size: 120,
    },
    {
      accessorKey: 'name',
      header: opts.nameHeader,
      meta: nameEditMeta,
      size: 480,
    },
  ];
}
