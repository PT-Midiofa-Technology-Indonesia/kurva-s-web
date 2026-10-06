import type { SelectOption } from '@/shared/components/atoms';

export interface BOQCostRow {
  id: string;
  catalogId?: string;
  code: string;
  name: string;
}

export interface BOQCostNameCombobox {
  options: string[];
  onSearch: (query: string) => void;
  onScrollEnd: () => void;
  hasNextPage?: boolean;
}

export interface BOQCostNameAsyncSelect {
  options: SelectOption[];
  hasNextPage?: boolean;
  onSearch: (query: string) => void;
  onScrollEnd: () => void;
  /** Resolve code+name+uom from a selected option value (catalog id). */
  getItemById: (
    id: string
  ) => { code: string; name: string; uom?: { id: string; name: string; code: string } } | undefined;
}

/** A single cost-type tab/section as configured by the parent. */
export interface BOQCostType {
  value: string;
  label: string;
  /** Override for the 2nd column header. Defaults via DEFAULT_COST_NAME_HEADERS. */
  nameHeader?: string;
  /** When true the section is read-only (locked). */
  disabled?: boolean;
  nameCombobox?: BOQCostNameCombobox;
  nameAsyncSelect?: BOQCostNameAsyncSelect;
  /** When set, replaces the "Tambah" button with an informational badge. */
  infoBadge?: { message: string };
  /** Column IDs that should be read-only even when section is not disabled. */
  readOnlyColumns?: string[];
}

/** A cost section with its current rows — what BOQCostDialog renders. */
export interface BOQCostSection extends BOQCostType {
  rows: BOQCostRow[];
  searchPlaceholder?: string;
}

/** Per-section validation errors from BE, keyed by section value */
export interface CostSectionError {
  /** Global table-level errors (e.g. 'Minimal satu dari items atau deletedIds harus diisi') */
  tableErrors: string[];
  /** Per-row errors keyed by row index: { 0: ['catalogId wajib diisi'] } */
  rowErrors: Record<number, string[]>;
}

/** Default 2nd-column header per cost type. Overridable via `nameHeader`. */
export const DEFAULT_COST_NAME_HEADERS: Record<string, string> = {
  material_cost: 'Nama Material',
  equipment_cost: 'Equipment name',
  man_power_cost: 'Job Title',
  transport_cost: 'Nama Material',
  preliminery_cost: 'Nama Material',
};

export function resolveNameHeader(value: string, override?: string): string {
  return override ?? DEFAULT_COST_NAME_HEADERS[value] ?? 'Nama';
}
