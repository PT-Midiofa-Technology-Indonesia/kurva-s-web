export interface ScheduleTask {
  id: string;
  taskName: string;
  startDate: string; // ISO yyyy-MM-dd
  endDate: string; // ISO yyyy-MM-dd
  duration: number; // calculated, min 1
  weight: number | null;
  progress: number; // 0-100
  children: ScheduleTask[];
  dependencies?: string[]; // IDs this task depends on
}
