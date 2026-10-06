export const TASK_STATUS_OPTIONS = [
  { value: 'created', label: 'Created' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'delegated', label: 'Delegated' },
  { value: 'done', label: 'Done' },
  { value: 'qc_passed', label: 'Qc Passed' },
  { value: 'qc_failed', label: 'Qc Failed' },
  { value: 'reopened', label: 'Reopened' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;
