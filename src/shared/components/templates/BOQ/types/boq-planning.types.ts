import type { SelectOption } from '@/shared/components/atoms';
import type { BOQCostType } from './boq-cost.types';
import type { BOQLabels } from './boq-labels.types';
import type { BOQJenisOption, BOQNode } from './boq-tree.types';

export type { BOQJenisOption };

export interface BOQPlanningNode extends Omit<BOQNode, 'children'> {
  children: BOQPlanningNode[];
  /** uuid of the selected UOM — persisted to API */
  uomId?: string;
  /** display label for the selected UOM — used for rendering */
  uomLabel?: string;
  volume?: { rab?: number; uom?: string };
  /** keyed by BOQUnitPriceCategory.value */
  unitPrices?: Record<string, { materialRab?: number; workRab?: number }>;
  amount?: { rab?: number };
  remarks?: string;
}

export interface BOQUnitPriceCategory {
  value: string;
  label: string;
}

export interface BOQUomAsyncSelect {
  options: SelectOption[];
  hasNextPage?: boolean;
  onSearch: (query: string) => void;
  onScrollEnd: () => void;
  getItemById: (id: string) => SelectOption | undefined;
}

export interface BOQPlanningProps {
  value: BOQPlanningNode[];
  onChange: (next: BOQPlanningNode[]) => void;
  nameOptions?: string[];
  /** Full tree of existing items. When user selects a name from suggestionTree,
   *  that node + its children are cloned into the editing position. */
  suggestionTree?: BOQPlanningNode[];
  /** Server-side suggestion search. Called with the typed search string and the 1-based level of the edited row. */
  onNameSearch?: (search: string, level: number) => void;
  jenisOptions?: BOQJenisOption[];
  maxDepth?: number;
  title?: string;
  searchPlaceholder?: string;
  onNameOptionsScrollEnd?: () => void;
  planningCostTypes?: BOQCostType[];
  onOpenDetail?: (node: BOQPlanningNode) => void;
  onComplete?: () => void;
  isComplete?: boolean;
  completeDisabled?: boolean;
  readOnly?: boolean;
  labels?: BOQLabels;
  /** UOM async-select config for volume_uom column */
  uomAsyncSelect?: BOQUomAsyncSelect;
  /** Jenis async-select config for jenis column */
  jenisAsyncSelect?: {
    options: SelectOption[];
    hasNextPage?: boolean;
    onSearch: (query: string) => void;
    onScrollEnd: () => void;
  };
  /** Tooltip shown for non-editable cells */
  nonEditableTooltip?: string;
  /** Called when user clicks Simpan. When provided, Simpan calls this instead of draft toggle. */
  onSave?: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Set of node IDs already persisted on server. Unsaved new nodes show disabled cost detail with tooltip. */
  savedNodeIds?: Set<string>;
  /** Set of column IDs that are editable. When provided, all other columns are locked with nonEditableTooltip. */
  editableColumnIds?: Set<string>;
  /** Whether to show the Complete toggle switch. Default true. */
  showComplete?: boolean;
}

export const DEFAULT_UNIT_PRICE_CATEGORIES: BOQUnitPriceCategory[] = [
  { value: 'material', label: 'Unit Price' },
  { value: 'work', label: 'Total Price' },
];
