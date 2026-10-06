import type { ReactNode } from 'react';
import type { GanttViewMode } from './gantt-utils';

export type { GanttViewMode };

export interface GanttBar {
  start: Date;
  end: Date;
  progress?: number; // 0–100
  color?: string;
  type?: 'task' | 'milestone' | 'group';
}

export interface GanttColumn<TData> {
  id: string;
  header: string;
  /** Column width in px. Default: 140. */
  width?: number;
  accessor: (row: TData) => string | number;
  editable?: boolean;
  /** Editor type when `editable` is true. Default: 'text'. */
  type?: 'text' | 'date';
  /** Renders the expand/collapse chevron for tree rows. Set on exactly one column (e.g. Kode). */
  showExpandToggle?: boolean;
  /** Applies depth-based left padding + bold-when-group styling. Set on exactly one column (e.g. Task Name). */
  indent?: boolean;
  /** Custom cell renderer, overrides the default text/input rendering. */
  render?: (row: TData) => ReactNode;
}

export interface GanttChartProps<TData> {
  data: TData[];
  columns: GanttColumn<TData>[];
  /** Tree children accessor. Default: reads `row.children`. */
  getSubRows?: (row: TData) => TData[] | undefined;
  getRowId: (row: TData) => string;
  /** The one translation a consumer supplies: row -> timeline bar. */
  toGanttBar: (row: TData) => GanttBar;

  viewMode?: GanttViewMode;
  rowHeight?: number;
  columnWidth?: number;
  showProgress?: boolean;
  /** When false, hides the progress % from the hover tooltip. Default: true. */
  showTooltipProgress?: boolean;
  className?: string;

  /** Drag-to-reschedule callback, fired from the timeline's TaskBar. */
  onTaskDateChange?: (rowId: string, startDate: Date, endDate: Date) => void;
  /** Fired when a bar (not a drag) is clicked. */
  onTaskClick?: (rowId: string) => void;
  /** Fired when an editable column's input commits a new value. Date columns pass an ISO `yyyy-MM-dd` string. */
  onCellEdit?: (rowId: string, columnId: string, value: string) => void;
  /** Renders a right-click context menu for a row. Omit to disable context menus (default). */
  contextMenu?: (row: TData, rowId: string) => ReactNode;
  /** Portal container for the context menu. Pass the fullscreen element to keep it visible/interactive in fullscreen mode. */
  contextMenuContainer?: HTMLElement | null;
  /** Portal container for date-column popovers. Pass the fullscreen element to keep them visible/interactive in fullscreen mode. */
  popoverContainer?: HTMLElement | null;
  /** Map of taskId → prerequisite taskIds for rendering dependency arrows. */
  dependencies?: Map<string, string[]>;
}
