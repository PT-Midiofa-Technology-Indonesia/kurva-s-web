import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Calendar } from './Calendar';
import type { CalendarEvent } from './types';

const meta = {
  title: 'Molecules/Calendar',
  component: Calendar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Helper ──────────────────────────────────────────────────────────────────

function makeDate(day: number, monthOffset = 0): string {
  const d = new Date(2026, 6 + monthOffset, day); // July 2026
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: '1', date: makeDate(1), label: 'Payroll: Pembayaran Gaji Karyawan', color: 'yellow' },
  { id: '2', date: makeDate(1), label: 'Cost Request: Pekerjaan Tambahan', color: 'green' },
  { id: '3', date: makeDate(1), label: 'Purchase Order: PO-001', color: 'red' },
  { id: '4', date: makeDate(1), label: 'Cost Request: Maintenance', color: 'green' },
  { id: '5', date: makeDate(1), label: 'Payroll: THR', color: 'yellow' },
  { id: '6', date: makeDate(1), label: 'Cost Request: Sumbingan', color: 'green' },
  { id: '7', date: makeDate(1), label: 'Purchase Order: PO-002', color: 'red' },

  { id: '8', date: makeDate(6), label: 'Purchase Order: Pekerjaan 1', color: 'pink' },
  { id: '9', date: makeDate(6), label: 'Cost Request: Pekerjaan Tambahan', color: 'green' },
  { id: '10', date: makeDate(6), label: 'Cost Request: Maintenance', color: 'green' },

  { id: '11', date: makeDate(17), label: 'Cost Request: Pekerjaan Tambahan', color: 'green' },
  { id: '12', date: makeDate(17), label: 'Payroll: Pembayaran Gaji', color: 'yellow' },
  { id: '13', date: makeDate(17), label: 'Purchase Order: PO-003', color: 'red' },
  { id: '14', date: makeDate(17), label: 'Cost Request: ATK', color: 'green' },
  { id: '15', date: makeDate(17), label: 'Payroll: THR', color: 'yellow' },
  { id: '16', date: makeDate(17), label: 'Cost Request: Lainnya', color: 'green' },

  { id: '17', date: makeDate(21), label: 'Purchase Order: Pekerjaan Utama', color: 'pink' },
  { id: '18', date: makeDate(21), label: 'Payroll: Pembayaran Gaji Karyawan', color: 'pink' },

  { id: '19', date: makeDate(14), label: 'Purchase Order: PO-004', color: 'red' },
  { id: '20', date: makeDate(25), label: 'Cost Request: Transport', color: 'green' },
  { id: '21', date: makeDate(25), label: 'Payroll: Bonus', color: 'yellow' },
];

// ─── Default ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    currentDate: '2026-07-01',
    events: SAMPLE_EVENTS,
  },
};

// ─── With Header Actions ─────────────────────────────────────────────────────

export const WithHeaderActions: Story = {
  name: 'With Header Actions',
  args: {
    currentDate: '2026-07-01',
    events: SAMPLE_EVENTS,
  },
  render: (props) => (
    <Calendar
      {...props}
      headerActions={
        <>
          <span className="text-sm font-medium text-slate-700">18 Payment Requests</span>
          <select className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Semua Status</option>
            <option>Draft</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </>
      }
    />
  ),
};

// ─── Empty Calendar ──────────────────────────────────────────────────────────

export const Empty: Story = {
  args: {
    currentDate: '2026-07-01',
    events: [],
  },
};

// ─── Custom Colors ───────────────────────────────────────────────────────────

export const CustomColors: Story = {
  name: 'Custom Colors',
  args: {
    currentDate: '2026-07-01',
    events: [
      { id: 'c1', date: makeDate(10), label: 'Hex color event', color: '#6366f1' },
      { id: 'c2', date: makeDate(10), label: 'Another hex event', color: '#ec4899' },
      { id: 'c3', date: makeDate(12), label: 'Preset purple', color: 'purple' },
      { id: 'c4', date: makeDate(12), label: 'Preset orange', color: 'orange' },
      { id: 'c5', date: makeDate(12), label: 'Preset teal', color: 'teal' },
    ],
  },
};

// ─── Max Visible ─────────────────────────────────────────────────────────────

export const MaxVisibleTwo: Story = {
  name: 'Max Visible = 2',
  args: {
    currentDate: '2026-07-01',
    events: SAMPLE_EVENTS,
    maxVisible: 2,
  },
};

// ─── Click Callbacks (interactive) ──────────────────────────────────────────

export const Interactive: Story = {
  name: 'Click Callbacks',
  args: { currentDate: '2026-07-01', events: SAMPLE_EVENTS },
  render: (props) => {
    const InteractiveDemo = () => {
      const [log, setLog] = useState<string[]>([]);
      const push = (msg: string) => setLog((prev) => [msg, ...prev].slice(0, 8));

      const CalendarWithLog = (
        <Calendar
          {...props}
          onEventClick={(e) => push(`Event click: "${e.label}" (${e.date})`)}
          onDateClick={(d) => push(`Date click: ${d}`)}
          onExpandMore={(d, evts) =>
            push(`Expand: ${d} (+${evts.length - (props.maxVisible ?? 3)} hidden)`)
          }
          onTodayClick={() => push('Today clicked')}
          onMonthChange={(d) =>
            push(`Month: ${d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`)
          }
        />
      );

      return (
        <div className="flex flex-col gap-4">
          {CalendarWithLog}
          {log.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-600 mb-1">Event Log</p>
              <ul className="text-xs text-slate-700 space-y-0.5">
                {log.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    };
    return <InteractiveDemo />;
  },
};

// ─── Custom Day Names ────────────────────────────────────────────────────────

export const CustomDayNames: Story = {
  name: 'Custom Day Names (English)',
  args: {
    currentDate: '2026-07-01',
    events: [
      { id: 'e1', date: makeDate(4), label: 'Meeting', color: 'blue' },
      { id: 'e2', date: makeDate(4), label: 'Deadline', color: 'red' },
    ],
    dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
};
