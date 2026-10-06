import type { Meta, StoryObj } from '@storybook/nextjs';
import { addDays, format, subDays } from 'date-fns';
import React from 'react';

import { GanttChart } from './GanttChart';
import type { GanttBar, GanttChartProps, GanttColumn } from './types';

const today = new Date();
const iso = (d: Date) => format(d, 'yyyy-MM-dd');

interface StoryRow {
  id: string;
  kode?: string;
  name: string;
  start: string; // ISO yyyy-MM-dd
  end: string; // ISO yyyy-MM-dd
  days?: number;
  progress?: number;
  color?: string;
  type?: 'task' | 'group' | 'milestone';
  children?: StoryRow[];
}

const toGanttBar = (row: StoryRow): GanttBar => ({
  start: new Date(row.start),
  end: new Date(row.end),
  progress: row.progress,
  color: row.color,
  type: row.type,
});

function StatefulGanttChart(props: GanttChartProps<StoryRow>) {
  const [rows, setRows] = React.useState(props.data);

  const handleDateChange = (rowId: string, start: Date, end: Date) => {
    const iso = (d: Date) => format(d, 'yyyy-MM-dd');
    const updateTree = (list: StoryRow[]): StoryRow[] =>
      list.map((r) =>
        r.id === rowId
          ? { ...r, start: iso(start), end: iso(end) }
          : { ...r, children: r.children ? updateTree(r.children) : undefined }
      );
    setRows((prev) => updateTree(prev));
  };

  return (
    <GanttChart
      {...props}
      data={rows}
      toGanttBar={toGanttBar}
      onTaskDateChange={handleDateChange}
    />
  );
}

function GanttChartStory(props: GanttChartProps<StoryRow>) {
  return <StatefulGanttChart {...props} />;
}

// ── "Simple" demo — one column, groups/milestones/progress ────────────────────

const tasks: StoryRow[] = [
  {
    id: 'g1',
    name: 'Design Phase',
    start: iso(subDays(today, 14)),
    end: iso(subDays(today, 5)),
    color: '#8b5cf6',
    type: 'group',
    children: [
      {
        id: 't1',
        name: 'Wireframes',
        start: iso(subDays(today, 14)),
        end: iso(subDays(today, 10)),
        color: '#a78bfa',
        progress: 100,
      },
      {
        id: 't2',
        name: 'UI Design',
        start: iso(subDays(today, 10)),
        end: iso(subDays(today, 5)),
        color: '#a78bfa',
        progress: 80,
      },
    ],
  },
  {
    id: 'g2',
    name: 'Development',
    start: iso(subDays(today, 6)),
    end: iso(addDays(today, 10)),
    color: '#6366f1',
    type: 'group',
    children: [
      {
        id: 't3',
        name: 'Backend API',
        start: iso(subDays(today, 6)),
        end: iso(addDays(today, 2)),
        color: '#818cf8',
        progress: 60,
      },
      {
        id: 't4',
        name: 'Frontend',
        start: iso(subDays(today, 4)),
        end: iso(addDays(today, 6)),
        color: '#818cf8',
        progress: 35,
      },
      {
        id: 't5',
        name: 'Integration',
        start: iso(addDays(today, 4)),
        end: iso(addDays(today, 10)),
        color: '#818cf8',
        progress: 0,
      },
    ],
  },
  {
    id: 'm1',
    name: 'Beta Release',
    start: iso(addDays(today, 10)),
    end: iso(addDays(today, 10)),
    color: '#f59e0b',
    type: 'milestone',
  },
  {
    id: 'g3',
    name: 'Testing & QA',
    start: iso(addDays(today, 8)),
    end: iso(addDays(today, 18)),
    color: '#10b981',
    type: 'group',
    children: [
      {
        id: 't6',
        name: 'Unit Tests',
        start: iso(addDays(today, 8)),
        end: iso(addDays(today, 12)),
        color: '#34d399',
        progress: 0,
      },
      {
        id: 't7',
        name: 'E2E Tests',
        start: iso(addDays(today, 12)),
        end: iso(addDays(today, 18)),
        color: '#34d399',
        progress: 0,
      },
    ],
  },
  {
    id: 'm2',
    name: 'Production Launch',
    start: iso(addDays(today, 20)),
    end: iso(addDays(today, 20)),
    color: '#ef4444',
    type: 'milestone',
  },
];

const simpleColumns: GanttColumn<StoryRow>[] = [
  {
    id: 'name',
    header: 'Task',
    accessor: (row) => row.name,
    indent: true,
    showExpandToggle: true,
    width: 220,
  },
];

const meta = {
  title: 'Organisms/GanttChart',
  component: GanttChartStory,
  parameters: { layout: 'padded' },
  args: {
    data: tasks,
    columns: simpleColumns,
    getRowId: (row) => row.id,
    toGanttBar,
    showProgress: true,
    rowHeight: 40,
    columnWidth: 32,
  },
} satisfies Meta<typeof GanttChartStory>;

export default meta;
type Story = StoryObj<typeof meta>;

const withHeightDecorator = [
  (Story: React.ComponentType) => (
    <div style={{ height: 500 }}>
      <Story />
    </div>
  ),
];

export const DayView: Story = {
  args: { viewMode: 'day' },
  decorators: withHeightDecorator,
};

export const WeekView: Story = {
  args: { viewMode: 'week', columnWidth: 48 },
  decorators: withHeightDecorator,
};

export const MonthView: Story = {
  args: { viewMode: 'month', columnWidth: 56 },
  decorators: withHeightDecorator,
};

export const NoProgress: Story = {
  args: { viewMode: 'day', showProgress: false },
  decorators: withHeightDecorator,
};

// ── Multi-column, editable left panel (Kode / Task Name / Start / End / Days) ──

const scheduleData: StoryRow[] = [
  {
    id: 'a',
    kode: 'A',
    name: 'Pekerjaan Bangunan Office',
    start: '2026-06-01',
    end: '2026-08-30',
    days: 167,
    children: [
      {
        id: 'a1',
        kode: 'A.1',
        name: 'Pekerjaan Civil',
        start: '2026-06-01',
        end: '2026-06-02',
        days: 30,
        children: [
          {
            id: 'a11',
            kode: 'A.1.1',
            name: 'Area Lobby',
            start: '2026-06-01',
            end: '2026-06-02',
            days: 6,
            children: [
              {
                id: 'a111',
                kode: 'A.1.1.1',
                name: 'Pengerjaan Dinding',
                start: '2026-06-03',
                end: '2026-07-01',
                days: 6,
                children: [
                  {
                    id: 'a1111',
                    kode: 'A.1.1.1.1',
                    name: 'Penataan Bata Dinding',
                    start: '2026-07-03',
                    end: '2026-07-04',
                    days: 16,
                  },
                  {
                    id: 'a1112',
                    kode: 'A.1.1.1.2',
                    name: 'Pemasangan Granit',
                    start: '2026-07-03',
                    end: '2026-07-04',
                    days: 31,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const scheduleColumns: GanttColumn<StoryRow>[] = [
  { id: 'kode', header: 'Kode', accessor: (r) => r.kode ?? '', showExpandToggle: true, width: 90 },
  {
    id: 'name',
    header: 'Task Name',
    accessor: (r) => r.name,
    editable: true,
    indent: true,
    width: 220,
  },
  {
    id: 'start',
    header: 'Start',
    accessor: (r) => r.start,
    editable: true,
    type: 'date',
    width: 150,
  },
  { id: 'end', header: 'End', accessor: (r) => r.end, editable: true, type: 'date', width: 150 },
  { id: 'days', header: 'Days', accessor: (r) => `${r.days ?? 0} d`, width: 80 },
];

export const MultiColumn: Story = {
  args: {
    data: scheduleData,
    columns: scheduleColumns,
    viewMode: 'day',
  },
  decorators: withHeightDecorator,
};
