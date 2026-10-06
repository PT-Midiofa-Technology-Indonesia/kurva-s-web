import { fireEvent, render, screen } from '@testing-library/react';
import { format } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';
import { GanttColumnPanel } from './GanttColumnPanel';
import type { FlatGanttRow } from './gantt-utils';
import type { GanttColumn } from './types';

vi.mock('@/components/molecules', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    DatePicker: ({
      value,
      onChange,
      clearable,
      popoverContainer,
    }: {
      value?: Date | null;
      onChange?: (d?: Date) => void;
      clearable?: boolean;
      popoverContainer?: HTMLElement | null;
    }) => (
      <button
        type="button"
        data-clearable={String(clearable)}
        data-popover-container={
          popoverContainer ? popoverContainer.getAttribute('data-marker') : 'none'
        }
        onClick={() => onChange?.(new Date(2026, 5, 20))}
      >
        {value ? format(value, 'yyyy-MM-dd') : 'pick'}
      </button>
    ),
  };
});

interface Row {
  id: string;
  name: string;
  start: string;
  days: number;
}

const rows: FlatGanttRow<Row>[] = [
  {
    row: { id: 'a', name: 'Parent', start: '2026-06-01', days: 5 },
    rowId: 'a',
    depth: 0,
    hasChildren: true,
  },
  {
    row: { id: 'a1', name: 'Child', start: '2026-06-02', days: 2 },
    rowId: 'a1',
    depth: 1,
    hasChildren: false,
  },
];

const baseColumns: GanttColumn<Row>[] = [
  {
    id: 'name',
    header: 'Task Name',
    accessor: (r) => r.name,
    editable: true,
    showExpandToggle: true,
    indent: true,
  },
  { id: 'start', header: 'Start', accessor: (r) => r.start, editable: true, type: 'date' },
  { id: 'days', header: 'Days', accessor: (r) => `${r.days}d` },
];

describe('GanttColumnPanel', () => {
  it('renders a header cell for every configured column', () => {
    render(
      <GanttColumnPanel
        columns={baseColumns}
        rows={rows}
        rowHeight={40}
        collapsed={new Set()}
        onToggleCollapse={vi.fn()}
      />
    );
    expect(screen.getByText('Task Name')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Days')).toBeInTheDocument();
  });

  it('renders a readonly column as plain text with no input', () => {
    render(
      <GanttColumnPanel
        columns={baseColumns}
        rows={rows}
        rowHeight={40}
        collapsed={new Set()}
        onToggleCollapse={vi.fn()}
      />
    );
    expect(screen.getByText('5d')).toBeInTheDocument();
    expect(screen.getByText('2d')).toBeInTheDocument();
  });

  it('renders an editable text column as a borderless, ring-less input and fires onCellEdit on blur', () => {
    const onCellEdit = vi.fn();
    render(
      <GanttColumnPanel
        columns={baseColumns}
        rows={rows}
        rowHeight={40}
        collapsed={new Set()}
        onToggleCollapse={vi.fn()}
        onCellEdit={onCellEdit}
      />
    );
    const input = screen.getByDisplayValue('Parent');
    expect(input.className).toContain('border-0');
    expect(input.className).toContain('focus-visible:ring-0');
    fireEvent.change(input, { target: { value: 'Parent Updated' } });
    fireEvent.blur(input);
    expect(onCellEdit).toHaveBeenCalledWith('a', 'name', 'Parent Updated');
  });

  it('renders an editable date column and fires onCellEdit with an ISO string on change', () => {
    const onCellEdit = vi.fn();
    render(
      <GanttColumnPanel
        columns={baseColumns}
        rows={rows}
        rowHeight={40}
        collapsed={new Set()}
        onToggleCollapse={vi.fn()}
        onCellEdit={onCellEdit}
      />
    );
    fireEvent.click(screen.getByText('2026-06-01'));
    expect(onCellEdit).toHaveBeenCalledWith('a', 'start', '2026-06-20');
  });

  it('renders date columns as non-clearable, since dates are required for this domain', () => {
    render(
      <GanttColumnPanel
        columns={baseColumns}
        rows={rows}
        rowHeight={40}
        collapsed={new Set()}
        onToggleCollapse={vi.fn()}
      />
    );
    const dateButton = screen.getByText('2026-06-01');
    expect(dateButton).toHaveAttribute('data-clearable', 'false');
  });

  it('shows the expand/collapse chevron only for rows with children and toggles on click', () => {
    const onToggleCollapse = vi.fn();
    render(
      <GanttColumnPanel
        columns={baseColumns}
        rows={rows}
        rowHeight={40}
        collapsed={new Set()}
        onToggleCollapse={onToggleCollapse}
      />
    );
    fireEvent.click(screen.getByLabelText('Collapse row'));
    expect(onToggleCollapse).toHaveBeenCalledWith('a');
    expect(screen.queryByLabelText('Expand row')).not.toBeInTheDocument();
  });

  it('applies 24px indentation per depth level on the indent column', () => {
    render(
      <GanttColumnPanel
        columns={baseColumns}
        rows={rows}
        rowHeight={40}
        collapsed={new Set()}
        onToggleCollapse={vi.fn()}
      />
    );
    const childCell = screen.getByDisplayValue('Child').closest('div[style*="padding-left"]');
    expect(childCell).toHaveStyle({ paddingLeft: '32px' }); // depth 1 -> 8 + 1*24
  });

  it('does not wrap rows in a context-menu trigger when contextMenu is omitted', () => {
    render(
      <GanttColumnPanel
        columns={baseColumns}
        rows={rows}
        rowHeight={40}
        collapsed={new Set()}
        onToggleCollapse={vi.fn()}
      />
    );
    expect(document.querySelector('[data-slot="context-menu-trigger"]')).not.toBeInTheDocument();
  });

  it('wraps each row in a context menu and renders the supplied items on right-click', () => {
    const contextMenu = vi.fn((row: Row, rowId: string) => (
      <div data-testid={`menu-${rowId}`}>Menu for {row.name}</div>
    ));
    render(
      <GanttColumnPanel
        columns={baseColumns}
        rows={rows}
        rowHeight={40}
        collapsed={new Set()}
        onToggleCollapse={vi.fn()}
        contextMenu={contextMenu}
      />
    );
    const trigger = screen
      .getByDisplayValue('Parent')
      .closest('[data-slot="context-menu-trigger"]');
    expect(trigger).not.toBeNull();
    fireEvent.contextMenu(trigger!);
    expect(screen.getByTestId('menu-a')).toBeInTheDocument();
    expect(contextMenu).toHaveBeenCalledWith(rows[0].row, 'a');
  });

  it('renders the context menu content inside contextMenuContainer, for fullscreen portal support', () => {
    const fullscreenRoot = document.createElement('div');
    document.body.appendChild(fullscreenRoot);
    const contextMenu = vi.fn((row: Row, rowId: string) => (
      <div data-testid={`menu-${rowId}`}>Menu for {row.name}</div>
    ));
    render(
      <GanttColumnPanel
        columns={baseColumns}
        rows={rows}
        rowHeight={40}
        collapsed={new Set()}
        onToggleCollapse={vi.fn()}
        contextMenu={contextMenu}
        contextMenuContainer={fullscreenRoot}
      />
    );
    const trigger = screen
      .getByDisplayValue('Parent')
      .closest('[data-slot="context-menu-trigger"]');
    fireEvent.contextMenu(trigger!);
    expect(fullscreenRoot.querySelector('[data-testid="menu-a"]')).not.toBeNull();
    document.body.removeChild(fullscreenRoot);
  });

  it('forwards popoverContainer to date-column DatePickers, for fullscreen portal support', () => {
    const fullscreenRoot = document.createElement('div');
    fullscreenRoot.setAttribute('data-marker', 'fullscreen-root');
    render(
      <GanttColumnPanel
        columns={baseColumns}
        rows={rows}
        rowHeight={40}
        collapsed={new Set()}
        onToggleCollapse={vi.fn()}
        popoverContainer={fullscreenRoot}
      />
    );
    const dateButton = screen.getByText('2026-06-01');
    expect(dateButton).toHaveAttribute('data-popover-container', 'fullscreen-root');
  });
});
