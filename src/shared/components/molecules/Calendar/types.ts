export type CalendarEventColor =
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'pink'
  | 'purple'
  | 'orange'
  | 'teal'
  | 'gray'
  | (string & {});

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  label: string;
  color?: CalendarEventColor;
  /** Extra data attached to event, forwarded to onEventClick */
  meta?: unknown;
}

export interface CalendarProps {
  /** Current month to display (YYYY-MM-DD or Date). Defaults to today */
  currentDate?: Date | string;
  /** Events to render on the calendar */
  events?: CalendarEvent[];
  /** Max visible event pills per cell before "+N more" */
  maxVisible?: number;
  /** ISO locale day names override. Defaults to Indonesian */
  dayNames?: string[];
  /** Slot rendered near month label in header (counts, badges, etc.) */
  headerMeta?: React.ReactNode;
  /** Slot rendered on the right side of header (filters, actions, etc.) */
  headerActions?: React.ReactNode;
  /** Highlight a selected date (YYYY-MM-DD) */
  selectedDate?: string | null;
  /** Render previous/next month dates instead of blank cells */
  showOutsideDays?: boolean;
  /** Override small labels inside the calendar */
  labels?: {
    today?: string;
    more?: (count: number) => string;
  };
  /** Called when an event pill is clicked */
  onEventClick?: (event: CalendarEvent) => void;
  /** Called when a date cell (not event) is clicked */
  onDateClick?: (date: string) => void;
  /** Called when "+N more" is clicked. Receives the date and hidden events */
  onExpandMore?: (date: string, events: CalendarEvent[]) => void;
  /** Called when month is navigated. Receives the new Date */
  onMonthChange?: (date: Date) => void;
  /** Called when "Today" button is clicked */
  onTodayClick?: () => void;
}
