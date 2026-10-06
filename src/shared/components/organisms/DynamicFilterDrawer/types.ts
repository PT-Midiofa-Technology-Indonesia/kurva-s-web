import type { ReactNode } from 'react';

export type FilterType =
  | 'dateRange'
  | 'status'
  | 'employee'
  | 'project'
  | 'location'
  | 'leaveType'
  | 'year'
  | 'golongan'
  | 'sourceType'
  | 'warehouseId'
  | 'type'
  | 'includeInactive'
  | 'hasAdjustment';

export interface FilterConfig {
  type: FilterType;
  label: string;
  renderEditor: (props: FilterEditorProps) => ReactNode;
}

export interface FilterEditorProps {
  value: unknown;
  onChange: (value: unknown) => void;
}

export interface FilterDrawerState {
  [type: string]: unknown;
}

export interface DynamicFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApply: (values: FilterDrawerState) => void;
  availableFilters: FilterConfig[];
  initialValues?: FilterDrawerState;
}
