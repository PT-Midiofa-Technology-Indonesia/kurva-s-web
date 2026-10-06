import type { SelectOption } from '@/shared/components/atoms';
import type { BOQCostType } from '../../types/boq-cost.types';
import type { BOQLabels } from '../../types/boq-labels.types';
import type { BOQJenisOption, BOQNode } from '../../types/boq-tree.types';

export type { BOQJenisOption };

export interface BOQExecutionNode extends Omit<BOQNode, 'children'> {
  children: BOQExecutionNode[];
  /** uuid of the selected UOM — persisted to API */
  uomId?: string;
  /** display label for the selected UOM — used for rendering */
  uomLabel?: string;
  volume?: {
    rab?: number;
    cco?: number;
    actual?: number;
    uom?: string;
  };
  /** keyed by BOQUnitPriceCategory.value — unit prices */
  unitPrice?: Record<
    string,
    {
      rab?: number;
      cco?: number;
      actual?: number;
    }
  >;
  /** keyed by BOQUnitPriceCategory.value — total prices (volume × unit price) */
  totalPrice?: Record<
    string,
    {
      rab?: number;
      cco?: number;
      actual?: number;
    }
  >;
  amount?: {
    rab?: number;
    cco?: number;
    actual?: number;
  };
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

export interface BOQExecutionProps {
  value: BOQExecutionNode[];
  onChange: (next: BOQExecutionNode[]) => void;
  nameOptions?: string[];
  jenisOptions?: BOQJenisOption[];
  maxDepth?: number;
  title?: string;
  searchPlaceholder?: string;
  onNameOptionsScrollEnd?: () => void;
  executionCostTypes?: BOQCostType[];
  onOpenDetail?: (node: BOQExecutionNode) => void;
  onComplete?: () => void;
  isComplete?: boolean;
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
  /** Called when user clicks Simpan */
  onSave?: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Set of column IDs that are editable. When provided, all other columns are locked. */
  editableColumnIds?: Set<string>;
  /** Whether to show the Complete toggle switch */
  showComplete?: boolean;
  /** Whether the Complete toggle switch is disabled */
  completeDisabled?: boolean;
  /** Pre-fetched suggestion tree used to clone full subtrees when a parent name matches */
  suggestionTree?: BOQExecutionNode[];
  /** Called when the name combobox searches — drives `useBOQItemsSuggestions` refetch */
  onNameSearch?: (search: string, level: number, parentId?: string | null) => void;
  /** Set of node IDs saved on server */
  savedNodeIds?: Set<string>;
}

export const DEFAULT_UNIT_PRICE_CATEGORIES: BOQUnitPriceCategory[] = [
  { value: 'material', label: 'Material' },
  { value: 'work', label: 'Work' },
];
