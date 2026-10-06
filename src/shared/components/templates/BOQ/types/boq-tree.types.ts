import type { ReactNode } from 'react';
import type { BOQCostType } from './boq-cost.types';
import type { BOQLabels } from './boq-labels.types';

export interface BOQNode {
  id: string;
  name: string;
  jenis: string;
  bobot: number | null;
  children: BOQNode[];
  isDraft?: boolean;
  isFinalLevel?: boolean;
  detailsFilledCount?: number;
  suggestionItemId?: string | null;
}

export interface BOQJenisOption {
  label: string;
  value: string;
}

export interface BOQJenisAsyncSelect {
  options: BOQJenisOption[];
  hasNextPage?: boolean;
  onSearch: (query: string) => void;
  onScrollEnd: () => void;
}

export interface BOQTemplateDetailProps {
  value: BOQNode[];
  onChange: (next: BOQNode[]) => void;
  jenisOptions?: BOQJenisOption[];
  jenisAsyncSelect?: BOQJenisAsyncSelect;
  bobotOptions?: number[];
  maxDepth?: number;
  title?: string;
  searchPlaceholder?: string;
  /** Suggestions shown in the Job/Item combobox. Free text is always allowed. */
  nameOptions?: string[];
  /** Full tree of existing items. When user selects a name from suggestionTree,
   *  that node + its children are cloned into the editing position. */
  suggestionTree?: BOQNode[];
  /** Server-side suggestion search. Called with the typed search string and the 1-based level of the edited row. */
  onNameSearch?: (search: string, level: number) => void;
  onOpenCost?: (node: BOQNode) => void;
  /** Called when the options dropdown is scrolled near the bottom — use to load more. */
  onNameOptionsScrollEnd?: () => void;
  /** Optional header action slot (e.g. fullscreen button override). */
  headerActions?: ReactNode;
  /** Cost-type sections shown in the cost dialog. Defaults to the five standard types. */
  costTypes?: BOQCostType[];
  /** Optional labels for customization */
  labels?: BOQLabels;
  /** Set of node IDs saved on server */
  savedNodeIds?: Set<string>;
  /** Called when the user clicks Simpan to save changes. */
  onSave?: () => Promise<void>;
  /** Whether a save operation is in progress. */
  isSaving?: boolean;
}

export const DEFAULT_COST_TYPES: { value: string; label: string }[] = [
  { value: 'material_cost', label: 'Material Cost' },
  { value: 'equipment_cost', label: 'Equipment Cost' },
  { value: 'man_power_cost', label: 'Man Power Cost' },
  { value: 'transport_cost', label: 'Transport Cost' },
  { value: 'preliminery_cost', label: 'Preliminery Cost' },
];

export const DEFAULT_JENIS_OPTIONS: BOQJenisOption[] = [
  { label: 'Job', value: 'Job' },
  { label: 'Location', value: 'Location' },
];

export const DEFAULT_BOBOT_OPTIONS: number[] = Array.from({ length: 11 }, (_, i) => i); // 0..10
export const DEFAULT_MAX_DEPTH = 5;
