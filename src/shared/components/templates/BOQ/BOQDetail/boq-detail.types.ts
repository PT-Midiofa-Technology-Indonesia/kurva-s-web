import type { Row } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import type { BOQDetailRow } from '@/domains/project-control/types/boq-detail';

export interface BOQDetailLabels {
  title?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  kode?: string;
  viewCost?: string;
  jobItem?: string;
  jenis?: string;
  volume?: string;
  rab?: string;
  cco?: string;
  act?: string;
  uom?: string;
  amount?: string;
  amountRab?: string;
}

export interface BOQDetailProps {
  value: BOQDetailRow[];
  search?: string;
  onSearchChange?: (search: string) => void;
  labels?: BOQDetailLabels;
  /** ReactNode for context menu. Default: undefined (no context menu) */
  contextMenu?: (row: Row<BOQDetailRow>) => ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  backButton?: ReactNode;
  /** Optional header content shown before the search bar */
  titleExtra?: ReactNode;
  /** Show RAB amount column only (design). Default: true */
  showSingleAmount?: boolean;
  /** Callback when eye icon clicked — only final-level rows */
  onViewCost?: (row: BOQDetailRow) => void;
}
