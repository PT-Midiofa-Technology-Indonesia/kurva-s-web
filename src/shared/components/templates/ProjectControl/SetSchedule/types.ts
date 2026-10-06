import type { GanttViewMode } from '@/components/organisms/GanttChart';

export interface ScheduleNode {
  id: string;
  taskName: string;
  startDate: string; // ISO yyyy-MM-dd
  endDate: string; // ISO yyyy-MM-dd
  days: number;
  bobot: number | null;
  percent: number;
  children: ScheduleNode[];
  /** Color override for the Gantt bar. */
  color?: string;
  /** Marks a row added but not yet saved. */
  isDraft?: boolean;
}

export interface SetScheduleProps {
  /** Controlled tree data. */
  value: ScheduleNode[];
  onChange: (next: ScheduleNode[]) => void;
  /** Called when the user clicks Simpan on a dirty tree. */
  onSave?: () => Promise<void>;
  /** Whether a save is in progress — disables the Simpan button and shows "Menyimpan...". */
  isSaving?: boolean;
  readOnly?: boolean;
  /** When true, hides the Tambah/Simpan button and row-level add actions while keeping other edits enabled. */
  hideAddButton?: boolean;
  defaultViewMode?: GanttViewMode;
  rowHeight?: number;
  columnWidth?: number;
  className?: string;
}
