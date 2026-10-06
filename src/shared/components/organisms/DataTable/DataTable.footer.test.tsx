import type { ColumnDef } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable } from './DataTable';

interface Row {
  id: string;
  amount: number;
}

const data: Row[] = [
  { id: 'a', amount: 100 },
  { id: 'b', amount: 250 },
];

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: 'amount',
    header: 'Amount',
    footer: ({ table }) => {
      const total = table.getRowModel().rows.reduce((s, r) => s + r.original.amount, 0);
      return <span>{total.toLocaleString('id-ID')}</span>;
    },
  },
];

describe('DataTable footer', () => {
  it('renders a footer total when enableFooter is set', () => {
    render(
      <DataTable<Row, unknown>
        columns={columns}
        data={data}
        getRowId={(r) => r.id}
        enablePagination={false}
        enableFooter
      />
    );
    expect(screen.getByText('350')).toBeInTheDocument();
  });

  it('renders no footer by default', () => {
    render(
      <DataTable<Row, unknown>
        columns={columns}
        data={data}
        getRowId={(r) => r.id}
        enablePagination={false}
      />
    );
    expect(screen.queryByText('350')).not.toBeInTheDocument();
  });
});
