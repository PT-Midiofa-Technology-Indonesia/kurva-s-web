import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { format } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';
import { SetSchedule } from './SetSchedule';
import type { ScheduleNode } from './types';

vi.mock('@/components/molecules', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    DatePicker: ({ value, onChange }: { value?: Date | null; onChange?: (d?: Date) => void }) => (
      <button type="button" onClick={() => onChange?.(new Date(2026, 5, 10))}>
        {value ? format(value, 'yyyy-MM-dd') : 'pick'}
      </button>
    ),
  };
});

function node(patch: Partial<ScheduleNode> = {}): ScheduleNode {
  return {
    id: 'x',
    taskName: 'Task',
    startDate: '2026-06-01',
    endDate: '2026-06-01',
    days: 1,
    bobot: null,
    percent: 0,
    children: [],
    ...patch,
  };
}

const seed: ScheduleNode[] = [
  node({
    id: 'a',
    taskName: 'Pekerjaan Bangunan Office',
    startDate: '2026-06-01',
    endDate: '2026-08-30',
    days: 167,
    children: [
      node({
        id: 'a1',
        taskName: 'Pekerjaan Civil',
        startDate: '2026-06-05',
        endDate: '2026-06-06',
      }),
    ],
  }),
];

describe('SetSchedule', () => {
  it('renders seeded rows with computed Kode codes', () => {
    render(<SetSchedule value={seed} onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('Pekerjaan Bangunan Office')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pekerjaan Civil')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('A.1')).toBeInTheDocument();
  });

  it('colors a group bar (has children) amber and a leaf bar (no children) gray', () => {
    const { container } = render(<SetSchedule value={seed} onChange={vi.fn()} />);
    const grabZones = container.querySelectorAll('.cursor-grab');
    const parentBar = grabZones[0].parentElement as HTMLElement; // node 'a', has a child
    const leafBar = grabZones[1].parentElement as HTMLElement; // node 'a1', no children
    expect(parentBar.style.backgroundColor).toBe('rgb(245, 158, 11)'); // #F59E0B
    expect(leafBar.style.backgroundColor).toBe('rgb(148, 163, 184)'); // #94A3B8
  });

  it('indents the Kode column per depth level so the tree is visually nested', () => {
    render(<SetSchedule value={seed} onChange={vi.fn()} />);
    const kodeCell = screen.getByText('A.1').closest('div[style*="padding-left"]');
    expect(kodeCell).toHaveStyle({ paddingLeft: '32px' }); // depth 1 -> 8 + 1*24

    // Task Name no longer carries its own indentation — the Kode column owns the tree visual.
    const taskNameCell = screen.getByDisplayValue('Pekerjaan Civil').closest('div[style]');
    expect(taskNameCell?.getAttribute('style')).not.toContain('padding-left');
  });

  it('editing Task Name calls onChange with the updated tree', () => {
    const onChange = vi.fn();
    render(<SetSchedule value={seed} onChange={onChange} />);
    const input = screen.getByDisplayValue('Pekerjaan Civil');
    fireEvent.change(input, { target: { value: 'Renamed Civil' } });
    fireEvent.blur(input);
    const [next] = onChange.mock.calls[0] as [ScheduleNode[]];
    expect(next[0].children[0].taskName).toBe('Renamed Civil');
  });

  it('changing parent Start cannot shrink past children and recalculates days', () => {
    const onChange = vi.fn();
    render(<SetSchedule value={seed} onChange={onChange} />);
    fireEvent.click(screen.getByText('2026-06-01'));
    const [next] = onChange.mock.calls[0] as [ScheduleNode[]];
    expect(next[0].startDate).toBe('2026-06-05');
    expect(next[0].days).toBeGreaterThan(1);
  });

  it('filters rows by search text, keeping ancestors of a match visible', () => {
    render(<SetSchedule value={seed} onChange={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText('Pencarian'), { target: { value: 'Civil' } });
    expect(screen.getByDisplayValue('Pekerjaan Civil')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pekerjaan Bangunan Office')).toBeInTheDocument();
  });

  it('clicking Tambah appends a new root row', () => {
    const onChange = vi.fn();
    render(<SetSchedule value={seed} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Tambah' }));
    const [next] = onChange.mock.calls[0] as [ScheduleNode[]];
    expect(next).toHaveLength(2);
  });

  it('swaps Tambah for Simpan once the tree is dirty', () => {
    render(<SetSchedule value={seed} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Tambah' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tambah' }));
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tambah' })).not.toBeInTheDocument();
  });

  it('clicking Simpan clears isDraft flags and calls onSave', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onChange = vi.fn();
    const { rerender } = render(<SetSchedule value={seed} onChange={onChange} onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: 'Tambah' }));
    const [afterTambah] = onChange.mock.calls[0] as [ScheduleNode[]];
    expect(afterTambah[afterTambah.length - 1].isDraft).toBe(true);

    rerender(<SetSchedule value={afterTambah} onChange={onChange} onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));
    await Promise.resolve();

    expect(onSave).toHaveBeenCalled();
    const [afterSimpan] = onChange.mock.calls[1] as [ScheduleNode[]];
    expect(afterSimpan.every((n) => n.isDraft === undefined)).toBe(true);
  });

  it('clicking Simpan keeps isDraft flags intact and stays dirty when onSave rejects', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('network error'));
    const onChange = vi.fn();
    const { rerender } = render(<SetSchedule value={seed} onChange={onChange} onSave={onSave} />);

    fireEvent.click(screen.getByRole('button', { name: 'Tambah' }));
    const [afterTambah] = onChange.mock.calls[0] as [ScheduleNode[]];
    expect(afterTambah[afterTambah.length - 1].isDraft).toBe(true);

    rerender(<SetSchedule value={afterTambah} onChange={onChange} onSave={onSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Simpan' }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeInTheDocument();
  });
});
