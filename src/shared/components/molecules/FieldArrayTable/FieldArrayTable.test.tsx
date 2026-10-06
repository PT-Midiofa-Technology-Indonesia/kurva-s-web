import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FieldArrayTable, type FieldArrayTableColumn } from './FieldArrayTable';

interface Row {
  id: string;
  code: string;
  qty: number;
}

const rows: Row[] = [
  { id: '1', code: 'PO-001', qty: 10 },
  { id: '2', code: 'PO-002', qty: 5 },
];

const columns: FieldArrayTableColumn<Row>[] = [
  { key: 'code', label: 'Code', render: (row) => row.code },
  { key: 'qty', label: 'Qty', align: 'right', render: (row) => row.qty },
];

describe('FieldArrayTable', () => {
  it('renders empty message when rows is empty', () => {
    render(<FieldArrayTable columns={columns} rows={[]} emptyMessage="Belum ada data" />);
    expect(screen.getByText('Belum ada data')).toBeInTheDocument();
  });

  it('renders column headers and row cells', () => {
    render(<FieldArrayTable columns={columns} rows={rows} emptyMessage="Belum ada data" />);
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Qty')).toBeInTheDocument();
    expect(screen.getByText('PO-001')).toBeInTheDocument();
    expect(screen.getByText('PO-002')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('does not render an Action column when onRemove is omitted', () => {
    render(<FieldArrayTable columns={columns} rows={rows} emptyMessage="Belum ada data" />);
    expect(screen.queryByText('Action')).not.toBeInTheDocument();
  });

  it('renders an Action column and calls onRemove(index) when onRemove is provided', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <FieldArrayTable
        columns={columns}
        rows={rows}
        emptyMessage="Belum ada data"
        onRemove={onRemove}
      />
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
    const deleteButtons = screen.getAllByRole('button');
    await user.click(deleteButtons[1]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('renders toolbar content above the table when provided', () => {
    render(
      <FieldArrayTable
        columns={columns}
        rows={rows}
        emptyMessage="Belum ada data"
        toolbar={<button type="button">Tambah</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Tambah' })).toBeInTheDocument();
  });

  it('passes the row index to render()', () => {
    const indexColumns: FieldArrayTableColumn<Row>[] = [
      { key: 'idx', label: 'No.', render: (_row, index) => `#${index + 1}` },
    ];
    render(<FieldArrayTable columns={indexColumns} rows={rows} emptyMessage="Belum ada data" />);
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });
});
