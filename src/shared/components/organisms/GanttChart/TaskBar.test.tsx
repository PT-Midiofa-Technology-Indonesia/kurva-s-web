import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { TaskBar } from './TaskBar';

const cols = Array.from({ length: 10 }, (_, i) => new Date(2026, 5, 1 + i)); // Jun 1..10, 2026

describe('TaskBar', () => {
  it('renders a milestone diamond and fires onClick with the row id', () => {
    const onClick = vi.fn();
    render(
      <TaskBar
        bar={{ start: new Date(2026, 5, 3), end: new Date(2026, 5, 3), type: 'milestone' }}
        rowId="m1"
        label="Beta"
        cols={cols}
        colWidth={32}
        rowHeight={40}
        showProgress
        viewMode="day"
        onClick={onClick}
      />
    );
    fireEvent.click(screen.getByLabelText('Milestone: Beta'));
    expect(onClick).toHaveBeenCalledWith('m1');
  });

  it('fires onDragEnd with shifted dates and the row id after a drag-to-move', async () => {
    const onDragEnd = vi.fn();
    const { container } = render(
      <TaskBar
        bar={{ start: new Date(2026, 5, 3), end: new Date(2026, 5, 5) }}
        rowId="t1"
        label="Task A"
        cols={cols}
        colWidth={32}
        rowHeight={40}
        showProgress
        viewMode="day"
        onDragEnd={onDragEnd}
      />
    );
    const grabZone = container.querySelector('.cursor-grab')!;

    // Simulate drag: start at x=0, move to x=32 (one column width)
    await act(async () => {
      fireEvent.mouseDown(grabZone, { clientX: 0 });

      const mouseMoveEvent = new MouseEvent('mousemove', { bubbles: true });
      Object.defineProperty(mouseMoveEvent, 'clientX', { value: 32, writable: false });
      document.dispatchEvent(mouseMoveEvent);

      const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
      Object.defineProperty(mouseUpEvent, 'clientX', { value: 32, writable: false });
      document.dispatchEvent(mouseUpEvent);
    });

    expect(onDragEnd).toHaveBeenCalledWith('t1', new Date(2026, 5, 4), new Date(2026, 5, 6));
  });

  it('does not render out of range bars', () => {
    const { container } = render(
      <TaskBar
        bar={{ start: new Date(2025, 0, 1), end: new Date(2025, 0, 2) }}
        rowId="t2"
        cols={cols}
        colWidth={32}
        rowHeight={40}
        showProgress
        viewMode="day"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
