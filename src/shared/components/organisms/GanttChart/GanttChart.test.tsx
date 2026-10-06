import { fireEvent, render, screen } from '@testing-library/react';
import { format } from 'date-fns';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { GanttChart } from './GanttChart';
import type { GanttBar, GanttColumn } from './types';

vi.mock('@/components/molecules', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    DatePicker: ({ value, onChange }: { value?: Date | null; onChange?: (d?: Date) => void }) => (
      <button type="button" onClick={() => onChange?.(new Date(2026, 5, 20))}>
        {value ? format(value, 'yyyy-MM-dd') : 'pick'}
      </button>
    ),
  };
});

interface Row {
  id: string;
  name: string;
  start: string;
  end: string;
  days: number;
  children?: Row[];
}

const data: Row[] = [
  {
    id: 'parent',
    name: 'Parent Task',
    start: '2026-06-01',
    end: '2026-06-10',
    days: 10,
    children: [
      { id: 'child', name: 'Child Task', start: '2026-06-02', end: '2026-06-04', days: 3 },
    ],
  },
];

const columns: GanttColumn<Row>[] = [
  {
    id: 'name',
    header: 'Task Name',
    accessor: (r) => r.name,
    editable: true,
    indent: true,
    showExpandToggle: true,
  },
  { id: 'start', header: 'Start', accessor: (r) => r.start, editable: true, type: 'date' },
  { id: 'end', header: 'End', accessor: (r) => r.end, editable: true, type: 'date' },
  { id: 'days', header: 'Days', accessor: (r) => `${r.days}d` },
];

const toGanttBar = (row: Row): GanttBar => ({ start: new Date(row.start), end: new Date(row.end) });

describe('GanttChart', () => {
  it('renders caller columns and a bar per row', () => {
    render(
      <GanttChart<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        toGanttBar={toGanttBar}
      />
    );
    expect(screen.getByText('Task Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Parent Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Child Task')).toBeInTheDocument();
    expect(screen.getByText('10d')).toBeInTheDocument();
  });

  it('editing the Task Name input fires onCellEdit', () => {
    const onCellEdit = vi.fn();
    render(
      <GanttChart<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        toGanttBar={toGanttBar}
        onCellEdit={onCellEdit}
      />
    );
    const input = screen.getByDisplayValue('Parent Task');
    fireEvent.change(input, { target: { value: 'Renamed' } });
    fireEvent.blur(input);
    expect(onCellEdit).toHaveBeenCalledWith('parent', 'name', 'Renamed');
  });

  it('editing the Start date fires onCellEdit with an ISO string', () => {
    const onCellEdit = vi.fn();
    render(
      <GanttChart<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        toGanttBar={toGanttBar}
        onCellEdit={onCellEdit}
      />
    );
    fireEvent.click(screen.getByText('2026-06-01'));
    expect(onCellEdit).toHaveBeenCalledWith('parent', 'start', '2026-06-20');
  });

  it('collapsing a parent row hides its child row and bar together', () => {
    render(
      <GanttChart<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        toGanttBar={toGanttBar}
      />
    );
    expect(screen.getByDisplayValue('Child Task')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Collapse row'));
    expect(screen.queryByDisplayValue('Child Task')).not.toBeInTheDocument();
  });

  it('fires onTaskDateChange with the dragged row id', async () => {
    const onTaskDateChange = vi.fn();
    const { container } = render(
      <GanttChart<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        toGanttBar={toGanttBar}
        onTaskDateChange={onTaskDateChange}
      />
    );
    const grabZone = container.querySelectorAll('.cursor-grab')[0];

    await act(async () => {
      fireEvent.mouseDown(grabZone, { clientX: 0 });

      const mouseMoveEvent = new MouseEvent('mousemove', { bubbles: true });
      Object.defineProperty(mouseMoveEvent, 'clientX', { value: 32, writable: false });
      document.dispatchEvent(mouseMoveEvent);

      const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
      Object.defineProperty(mouseUpEvent, 'clientX', { value: 32, writable: false });
      document.dispatchEvent(mouseUpEvent);
    });

    expect(onTaskDateChange).toHaveBeenCalledWith('parent', expect.any(Date), expect.any(Date));
  });

  it('renders a context menu with the supplied items when contextMenu is provided', () => {
    const contextMenu = vi.fn((row: Row, rowId: string) => (
      <div data-testid={`ctx-${rowId}`}>Context for {row.name}</div>
    ));
    render(
      <GanttChart<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        toGanttBar={toGanttBar}
        contextMenu={contextMenu}
      />
    );
    const trigger = screen
      .getByDisplayValue('Parent Task')
      .closest('[data-slot="context-menu-trigger"]');
    fireEvent.contextMenu(trigger!);
    expect(screen.getByTestId('ctx-parent')).toBeInTheDocument();
  });

  it('renders the context menu inside contextMenuContainer, for fullscreen portal support', () => {
    const fullscreenRoot = document.createElement('div');
    document.body.appendChild(fullscreenRoot);
    const contextMenu = vi.fn((row: Row, rowId: string) => (
      <div data-testid={`ctx-${rowId}`}>Context for {row.name}</div>
    ));
    render(
      <GanttChart<Row>
        data={data}
        columns={columns}
        getRowId={(r) => r.id}
        toGanttBar={toGanttBar}
        contextMenu={contextMenu}
        contextMenuContainer={fullscreenRoot}
      />
    );
    const trigger = screen
      .getByDisplayValue('Parent Task')
      .closest('[data-slot="context-menu-trigger"]');
    fireEvent.contextMenu(trigger!);
    expect(fullscreenRoot.querySelector('[data-testid="ctx-parent"]')).not.toBeNull();
    document.body.removeChild(fullscreenRoot);
  });
});
