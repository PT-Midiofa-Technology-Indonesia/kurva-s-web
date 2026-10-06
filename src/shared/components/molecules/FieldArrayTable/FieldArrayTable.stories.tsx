import type { Meta, StoryObj } from '@storybook/nextjs';
import { FieldArrayTable, type FieldArrayTableColumn } from './FieldArrayTable';

interface DemoRow {
  id: string;
  code: string;
  qty: number;
}

const rows: DemoRow[] = [
  { id: '1', code: 'PO-001', qty: 10 },
  { id: '2', code: 'PO-002', qty: 5 },
];

const columns: FieldArrayTableColumn<DemoRow>[] = [
  { key: 'code', label: 'Code', render: (row) => row.code },
  { key: 'qty', label: 'Qty', align: 'right', render: (row) => row.qty },
];

const meta: Meta<typeof FieldArrayTable> = {
  title: 'Molecules/FieldArrayTable',
  component: FieldArrayTable,
};
export default meta;

type Story = StoryObj<typeof FieldArrayTable<DemoRow>>;

export const ReadOnly: Story = {
  args: { columns, rows, emptyMessage: 'Belum ada data' },
};

export const Empty: Story = {
  args: { columns, rows: [], emptyMessage: 'Belum ada data' },
};

export const Editable: Story = {
  args: {
    columns,
    rows,
    emptyMessage: 'Belum ada data',
    onRemove: () => {},
    toolbar: <button type="button">Tambah</button>,
  },
};
