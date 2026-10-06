import { arrayMove } from '@dnd-kit/sortable';
import type { Meta, StoryObj } from '@storybook/nextjs';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale/id';
import {
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  ClipboardPaste,
  Copy,
  Plus,
  Scissors,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';
import type { HeaderColumnNode } from './DataTable';
import { DataTable, type DataTableProps } from './DataTable';

type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive' | null;
  joined: string;
};

const employees: Employee[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@company.com',
    department: 'Engineering',
    role: 'Senior Engineer',
    status: 'active',
    joined: '2021-03-15',
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@company.com',
    department: 'Design',
    role: 'UI Designer',
    status: 'active',
    joined: '2022-07-01',
  },
  {
    id: 3,
    name: 'Carol White',
    email: 'carol@company.com',
    department: 'Product',
    role: 'Product Manager',
    status: 'inactive',
    joined: '2020-11-20',
  },
  {
    id: 4,
    name: 'David Lee',
    email: 'david@company.com',
    department: 'Engineering',
    role: 'Junior Engineer',
    status: 'active',
    joined: '2023-01-10',
  },
  {
    id: 5,
    name: 'Eva Martinez',
    email: 'eva@company.com',
    department: 'Marketing',
    role: 'Marketing Lead',
    status: 'active',
    joined: '2021-09-05',
  },
  {
    id: 6,
    name: 'Frank Kim',
    email: 'frank@company.com',
    department: 'Engineering',
    role: 'Staff Engineer',
    status: 'active',
    joined: '2019-06-30',
  },
  {
    id: 7,
    name: 'Grace Tan',
    email: 'grace@company.com',
    department: 'HR',
    role: 'HR Manager',
    status: 'inactive',
    joined: '2022-02-14',
  },
  {
    id: 8,
    name: 'Henry Park',
    email: 'henry@company.com',
    department: 'Design',
    role: 'UX Researcher',
    status: 'active',
    joined: '2023-05-22',
  },
  {
    id: 9,
    name: 'Iris Chen',
    email: 'iris@company.com',
    department: 'Product',
    role: 'Associate PM',
    status: 'active',
    joined: '2022-12-01',
  },
  {
    id: 10,
    name: 'James Wilson',
    email: 'james@company.com',
    department: 'Engineering',
    role: 'DevOps Engineer',
    status: 'active',
    joined: '2020-08-17',
  },
  {
    id: 11,
    name: 'Karen Brown',
    email: 'karen@company.com',
    department: 'Marketing',
    role: 'Content Writer',
    status: 'inactive',
    joined: '2021-04-28',
  },
  {
    id: 12,
    name: 'Leo Nguyen',
    email: 'leo@company.com',
    department: 'Engineering',
    role: 'Frontend Engineer',
    status: 'active',
    joined: '2023-03-07',
  },
];

const statusCell = ({ getValue }: { getValue: () => unknown }) => {
  const status = getValue() as string;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        status === 'active' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'
      }`}
    >
      {status}
    </span>
  );
};

const dateCell = ({ getValue }: { getValue: () => unknown }) => {
  const value = getValue() as string;
  if (!value) return <span className="text-muted-foreground">—</span>;
  return <span>{format(new Date(value), 'dd MMM yyyy', { locale: id })}</span>;
};

const columns: ColumnDef<Employee>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status', cell: statusCell },
  { accessorKey: 'joined', header: 'Joined', cell: dateCell },
];

const editableColumns: ColumnDef<Employee>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { editable: true },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    meta: { editable: true },
  },
  {
    accessorKey: 'department',
    header: 'Department',
    meta: {
      editable: true,
      edit: {
        editType: 'select',
        selectOptions: [
          { label: 'Engineering', value: 'Engineering' },
          { label: 'Design', value: 'Design' },
          { label: 'Product', value: 'Product' },
          { label: 'Marketing', value: 'Marketing' },
          { label: 'HR', value: 'HR' },
        ],
      },
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    meta: { editable: true },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: statusCell,
    meta: {
      editable: true,
      edit: {
        editType: 'select',
        selectOptions: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
      },
    },
  },
  {
    accessorKey: 'joined',
    header: 'Joined',
    cell: dateCell,
    meta: { editable: true, edit: { editType: 'date' } },
  },
];

const styledColumns: ColumnDef<Employee>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  {
    accessorKey: 'name',
    header: 'Name',
    meta: {
      headerClassName: 'bg-blue-50 font-bold text-blue-900',
      cellClassName: 'font-semibold',
      footerClassName: 'bg-blue-50 font-semibold',
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    meta: {
      headerClassName: 'bg-green-50 text-green-900',
      cellClassName: 'text-sm text-gray-600',
      footerClassName: 'bg-green-50 text-sm',
    },
  },
  {
    accessorKey: 'department',
    header: 'Department',
    meta: {
      headerClassName: 'bg-purple-50 text-purple-900 font-bold',
      footerClassName: 'bg-purple-50 font-semibold',
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    meta: {
      cellClassName: 'text-orange-600 font-medium',
    },
  },
  {
    accessorKey: 'joined',
    header: 'Joined',
    cell: dateCell,
    meta: {
      headerClassName: 'text-right',
      cellClassName: 'text-right',
    },
  },
];

function EmployeeDataTable(props: DataTableProps<Employee, string>) {
  return <DataTable {...props} />;
}

const meta = {
  title: 'Organisms/DataTable',
  component: EmployeeDataTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    enableRowSelection: { control: 'boolean' },
    enablePagination: { control: 'boolean' },
    enableColumnDnd: { control: 'boolean' },
    enableZebraStripes: { control: 'boolean' },
    emptyMessage: { control: 'text' },
  },
} satisfies Meta<typeof EmployeeDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: employees,
    columns,
    enableRowSelection: false,
    enablePagination: true,
    enableColumnDnd: true,
    enableZebraStripes: true,
  },
};

export const WithoutZebraStripes: Story = {
  args: {
    data: employees,
    columns,
    enableRowSelection: false,
    enablePagination: true,
    enableColumnDnd: true,
    enableZebraStripes: false,
  },
};

export const WithRowSelection: Story = {
  args: {
    data: employees,
    columns,
    enableRowSelection: true,
    enablePagination: true,
    enableColumnDnd: true,
  },
};

export const WithoutPagination: Story = {
  args: {
    data: employees.slice(0, 5),
    columns,
    enableRowSelection: false,
    enablePagination: false,
    enableColumnDnd: true,
  },
};

export const SmallPageSize: Story = {
  args: {
    data: employees,
    columns,
    enableRowSelection: true,
    enablePagination: true,
    enableColumnDnd: true,
    pageSizeOptions: [3, 5, 10],
  },
};

export const EmptyState: Story = {
  args: {
    data: [],
    columns,
    enableRowSelection: false,
    enablePagination: true,
    enableColumnDnd: true,
    emptyMessage: 'No employees found.',
  },
};

export const WithContextMenu: Story = {
  args: { data: employees, columns },
  render: () => {
    const [data, setData] = useState<Employee[]>(employees);
    const [lastAction, setLastAction] = useState<string | null>(null);

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Right-click any row to open the context menu.
        </p>
        {lastAction && (
          <p className="text-sm font-medium text-foreground">
            Last action: <span className="text-primary">{lastAction}</span>
          </p>
        )}
        <DataTable
          data={data}
          columns={columns}
          enableRowSelection
          enablePagination={false}
          contextMenu={(
            row,
            { activeCellInfo, rangeBounds, rangeRowIndices, triggerCopy } = {}
          ) => {
            const isMultiRowSelected = rangeRowIndices && rangeRowIndices.length > 1;

            return (
              <>
                <ContextMenuItem
                  onClick={() => {
                    if (rangeBounds && triggerCopy) {
                      triggerCopy();
                      setLastAction(
                        `Salin ${rangeBounds.maxRow - rangeBounds.minRow + 1}x${rangeBounds.maxCol - rangeBounds.minCol + 1} sel`
                      );
                    } else {
                      const valueToCopy = activeCellInfo?.value ?? row.original.name;
                      navigator.clipboard.writeText(String(valueToCopy));
                      setLastAction(`Salin: ${valueToCopy}`);
                    }
                  }}
                >
                  <Copy />
                  Salin
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setLastAction(`Tempel "${text}"`);
                    } catch {
                      setLastAction('Gagal membaca clipboard');
                    }
                  }}
                >
                  <ClipboardPaste />
                  Tempel
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  variant="destructive"
                  onClick={() => {
                    if (isMultiRowSelected && rangeRowIndices) {
                      const rowsToDelete = new Set(rangeRowIndices);
                      setData((prev) => prev.filter((_, i) => !rowsToDelete.has(i)));
                      setLastAction(`Hapus ${rowsToDelete.size} baris`);
                    } else {
                      setData((prev) => prev.filter((_, i) => i !== row.index));
                      setLastAction(`Hapus baris: "${row.original.name}"`);
                    }
                  }}
                >
                  <Trash2 />
                  {isMultiRowSelected ? `Hapus ${rangeRowIndices.length} baris` : 'Hapus baris'}
                </ContextMenuItem>
              </>
            );
          }}
        />
      </div>
    );
  },
};

export const WithRowDnd: Story = {
  args: { data: employees, columns },
  render: () => {
    const [data, setData] = useState<Employee[]>(employees.slice(0, 8));

    const handleRowReorder = (fromIndex: number, toIndex: number) => {
      setData((prev) => arrayMove(prev, fromIndex, toIndex));
    };

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Drag the <strong>grip handle</strong> on the left of each row to reorder. Column headers
          are also draggable.
        </p>
        <DataTable
          data={data}
          columns={columns}
          enableRowDnd
          enablePagination={false}
          onRowReorder={handleRowReorder}
        />
      </div>
    );
  },
};

export const WithRowAndColumnDnd: Story = {
  args: { data: employees, columns },
  render: () => {
    const [data, setData] = useState<Employee[]>(employees.slice(0, 8));

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Drag the <strong>row grip</strong> to reorder rows. Drag the <strong>column grip</strong>{' '}
          in each header to reorder columns.
        </p>
        <DataTable
          data={data}
          columns={columns}
          enableRowDnd
          enableColumnDnd
          enableRowSelection
          enablePagination={false}
          onRowReorder={(from, to) => setData((prev) => arrayMove(prev, from, to))}
        />
      </div>
    );
  },
};

export const InlineEditing: Story = {
  args: { data: employees, columns: editableColumns },
  render: () => {
    const [data, setData] = useState<Employee[]>(employees.slice(0, 6));

    const handleCellEdit = (rowIndex: number, columnId: string, value: unknown) => {
      setData((prev) =>
        prev.map((row, i) => (i === rowIndex ? { ...row, [columnId]: value } : row))
      );
    };

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Click any highlighted cell to edit. <strong>Name</strong>, <strong>Email</strong>, and{' '}
          <strong>Role</strong> use a text input. <strong>Department</strong> and{' '}
          <strong>Status</strong> use a select dropdown. <strong>Joined</strong> uses a date input.
          Hover over non-editable cells (ID, Joined) to see tooltip.
        </p>
        <DataTable
          data={data}
          columns={editableColumns}
          enablePagination={false}
          enableColumnDnd={true}
          onCellEdit={handleCellEdit}
          nonEditableTooltip={({ header }) => `Cell ${header} tidak dapat diubah!`}
        />
      </div>
    );
  },
};

export const WithColumnResize: Story = {
  args: { data: employees, columns },
  render: () => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Drag the right edge of any column header to resize it. Column widths persist while the table
        is mounted.
      </p>
      <DataTable
        data={employees}
        columns={columns}
        enableColumnResize
        enablePagination={false}
        enableColumnDnd={false}
      />
    </div>
  ),
};

export const WithRangeSelection: Story = {
  args: { data: employees, columns },
  render: () => {
    const [data, setData] = useState<Employee[]>(employees.slice(0, 8));
    const [lastAction, setLastAction] = useState<string | null>(null);

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Click and drag across cells to select a range (like Excel). Hold <kbd>Escape</kbd> to
          clear the selection. Right-click a cell to open the context menu.
        </p>
        {lastAction && (
          <p className="text-sm font-medium text-foreground">
            Last action: <span className="text-primary">{lastAction}</span>
          </p>
        )}
        <DataTable
          data={data}
          columns={columns}
          enableRangeSelection
          enablePagination={false}
          enableColumnDnd={false}
          contextMenu={(
            row,
            { activeCellInfo, rangeBounds, rangeRowIndices, triggerCopy } = {}
          ) => {
            const isMultiRowSelected = rangeRowIndices && rangeRowIndices.length > 1;

            return (
              <>
                <ContextMenuItem
                  onClick={() => {
                    if (rangeBounds && triggerCopy) {
                      triggerCopy();
                      setLastAction(
                        `Salin ${rangeBounds.maxRow - rangeBounds.minRow + 1}x${rangeBounds.maxCol - rangeBounds.minCol + 1} sel`
                      );
                    } else {
                      const valueToCopy = activeCellInfo?.value ?? row.original.name;
                      navigator.clipboard.writeText(String(valueToCopy));
                      setLastAction(`Salin: ${valueToCopy}`);
                    }
                  }}
                >
                  <Copy />
                  Salin
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setLastAction(`Tempel "${text}" ke ${activeCellInfo?.columnId ?? 'sel'}`);
                    } catch {
                      setLastAction('Gagal membaca clipboard');
                    }
                  }}
                >
                  <ClipboardPaste />
                  Tempel
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  variant="destructive"
                  onClick={() => {
                    if (isMultiRowSelected && rangeRowIndices) {
                      const rowsToDelete = new Set(rangeRowIndices);
                      setData((prev) => prev.filter((_, i) => !rowsToDelete.has(i)));
                      setLastAction(`Hapus ${rowsToDelete.size} baris`);
                    } else {
                      setData((prev) => prev.filter((_, i) => i !== row.index));
                      setLastAction(`Hapus baris: "${row.original.name}"`);
                    }
                  }}
                >
                  <Trash2 />
                  {isMultiRowSelected ? `Hapus ${rangeRowIndices.length} baris` : 'Hapus baris'}
                </ContextMenuItem>
              </>
            );
          }}
        />
      </div>
    );
  },
};

export const InfiniteScroll: Story = {
  args: { data: employees, columns },
  render: () => {
    const pageSize = 4;
    const [data, setData] = useState<Employee[]>(employees.slice(0, pageSize));
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const hasNextPage = data.length < employees.length;

    const handleLoadMore = () => {
      if (isFetchingNextPage) return;
      setIsFetchingNextPage(true);
      setTimeout(() => {
        setData((prev) => employees.slice(0, prev.length + pageSize));
        setIsFetchingNextPage(false);
      }, 800);
    };

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Scroll to the bottom of the table to load more rows. No pagination controls are shown.
        </p>
        <DataTable
          data={data}
          columns={columns}
          enableInfiniteScroll
          onLoadMore={handleLoadMore}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          enableColumnDnd={false}
        />
      </div>
    );
  },
};

// ─── Tree view stories ────────────────────────────────────────────────────────

type Department = {
  id: string;
  name: string;
  lead: string;
  headcount: number;
  budget: string;
  status: 'active' | 'inactive';
  children?: Department[];
};

const departments: Department[] = [
  {
    id: 'eng',
    name: 'Engineering',
    lead: 'Frank Kim',
    headcount: 48,
    budget: '$2.4M',
    status: 'active',
    children: [
      {
        id: 'eng-fe',
        name: 'Frontend',
        lead: 'Alice Johnson',
        headcount: 12,
        budget: '$600K',
        status: 'active',
        children: [
          {
            id: 'eng-fe-web',
            name: 'Web',
            lead: 'Leo Nguyen',
            headcount: 6,
            budget: '$300K',
            status: 'active',
          },
          {
            id: 'eng-fe-mob',
            name: 'Mobile',
            lead: 'Iris Chen',
            headcount: 6,
            budget: '$300K',
            status: 'active',
          },
        ],
      },
      {
        id: 'eng-be',
        name: 'Backend',
        lead: 'James Wilson',
        headcount: 18,
        budget: '$900K',
        status: 'active',
      },
      {
        id: 'eng-infra',
        name: 'Infrastructure',
        lead: 'David Lee',
        headcount: 10,
        budget: '$500K',
        status: 'active',
      },
      {
        id: 'eng-qa',
        name: 'Quality Assurance',
        lead: 'Karen Brown',
        headcount: 8,
        budget: '$400K',
        status: 'inactive',
      },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    lead: 'Bob Smith',
    headcount: 15,
    budget: '$750K',
    status: 'active',
    children: [
      {
        id: 'design-ux',
        name: 'UX Research',
        lead: 'Henry Park',
        headcount: 5,
        budget: '$250K',
        status: 'active',
      },
      {
        id: 'design-ui',
        name: 'UI / Brand',
        lead: 'Grace Tan',
        headcount: 10,
        budget: '$500K',
        status: 'active',
      },
    ],
  },
  {
    id: 'product',
    name: 'Product',
    lead: 'Carol White',
    headcount: 10,
    budget: '$500K',
    status: 'inactive',
    children: [
      {
        id: 'product-growth',
        name: 'Growth',
        lead: 'Eva Martinez',
        headcount: 5,
        budget: '$250K',
        status: 'active',
      },
      {
        id: 'product-core',
        name: 'Core',
        lead: 'Iris Chen',
        headcount: 5,
        budget: '$250K',
        status: 'inactive',
      },
    ],
  },
  { id: 'hr', name: 'HR', lead: 'Grace Tan', headcount: 6, budget: '$300K', status: 'active' },
];

const deptColumns: ColumnDef<Department>[] = [
  { accessorKey: 'name', header: 'Department', size: 200 },
  { accessorKey: 'lead', header: 'Lead' },
  { accessorKey: 'headcount', header: 'Headcount', size: 110 },
  { accessorKey: 'budget', header: 'Budget', size: 100 },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 90,
    cell: ({ getValue }) => {
      const v = getValue() as string;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            v === 'active' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'
          }`}
        >
          {v}
        </span>
      );
    },
  },
];

export const TreeView: Story = {
  args: { data: employees, columns },
  render: () => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Click the <strong>chevron</strong> to expand or collapse a row&apos;s children. Rows with
        children are shown in <strong>medium weight</strong>; child rows have a subtle background.
      </p>
      <DataTable
        data={departments}
        columns={deptColumns}
        enableTreeView
        enablePagination={false}
        enableColumnDnd={false}
      />
    </div>
  ),
};

export const TreeViewWithSelection: Story = {
  args: { data: employees, columns },
  render: () => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Tree view combined with row selection. Checkboxes are independent per row.
      </p>
      <DataTable
        data={departments}
        columns={deptColumns}
        enableTreeView
        enablePagination={false}
        enableColumnDnd={false}
      />
    </div>
  ),
};

export const ExcelMode: Story = {
  args: { data: employees, columns: editableColumns },
  render: () => {
    const [data, setData] = useState<Employee[]>(employees.slice(0, 8));
    const [lastAction, setLastAction] = useState<string | null>(null);

    const handleCellEdit = (rowIndex: number, columnId: string, value: unknown) => {
      setData((prev) =>
        prev.map((row, i) => (i === rowIndex ? { ...row, [columnId]: value } : row))
      );
    };

    const handleRowReorder = (fromIndex: number, toIndex: number) => {
      setData((prev) => arrayMove(prev, fromIndex, toIndex));
      setLastAction(`Moved row ${fromIndex + 1} to position ${toIndex + 1}`);
    };

    const handleAddRow = () => {
      const newId = data.length + 1;
      const newRow: Employee = {
        id: newId,
        name: ``,
        email: ``,
        department: ``,
        role: '',
        status: null,
        joined: new Date().toISOString().split('T')[0],
      };
      setData((prev) => [...prev, newRow]);
      setLastAction(`Added row: "${newRow.name}"`);
    };

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Spreadsheet-like mode combining <strong>inline editing</strong>,{' '}
          <strong>row drag & drop</strong>, <strong>context menu</strong>, and{' '}
          <strong>keyboard navigation</strong>. <strong>Joined</strong> uses a date picker.
        </p>
        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
          <li>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↑</kbd>{' '}
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">↓</kbd>{' '}
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">←</kbd>{' '}
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">→</kbd> Navigate cells
          </li>
          <li>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Enter</kbd> or{' '}
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">F2</kbd> Edit active cell
          </li>
          <li>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Enter</kbd> Confirm edit
            and move down
          </li>
          <li>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Tab</kbd> Confirm edit
            and move right
          </li>
          <li>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Shift</kbd> +{' '}
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Tab</kbd> Confirm edit
            and move left
          </li>
          <li>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Esc</kbd> Cancel editing
          </li>
          <li>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Ctrl</kbd> +{' '}
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">C</kbd> Copy selected
            cells
          </li>
          <li>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Ctrl</kbd> +{' '}
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">V</kbd> Paste into
            selected cell(s)
          </li>
          <li>Drag the grip handle to reorder rows</li>
          <li>Right-click any row for context menu actions</li>
        </ul>
        {lastAction && (
          <p className="text-sm font-medium text-foreground">
            Last action: <span className="text-primary">{lastAction}</span>
          </p>
        )}
        <DataTable
          data={data}
          columns={editableColumns}
          enableRangeSelection
          enableRowDnd
          enablePagination={false}
          onCellEdit={handleCellEdit}
          onRowReorder={handleRowReorder}
          nonEditableTooltip={({ header }) => `Cell ${header} tidak dapat diubah!`}
          contextMenu={(
            row,
            { activeCellInfo, rangeBounds, rangeRowIndices, triggerCopy } = {}
          ) => {
            const isMultiRowSelected = rangeRowIndices && rangeRowIndices.length > 1;

            return (
              <>
                <ContextMenuItem
                  onClick={() => {
                    if (rangeBounds && triggerCopy) {
                      triggerCopy();
                      setLastAction(
                        `Salin ${rangeBounds.maxRow - rangeBounds.minRow + 1}x${rangeBounds.maxCol - rangeBounds.minCol + 1} sel`
                      );
                    } else {
                      const valueToCopy = activeCellInfo?.value ?? row.original.name;
                      navigator.clipboard.writeText(String(valueToCopy));
                      setLastAction(`Salin: ${valueToCopy}`);
                    }
                  }}
                >
                  <Copy />
                  Salin
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={async () => {
                    if (!activeCellInfo) {
                      setLastAction('Tidak ada sel aktif untuk tempel');
                      return;
                    }
                    try {
                      const text = await navigator.clipboard.readText();
                      const pasteRows = text.split('\n').filter((line) => line.length > 0);
                      const values = pasteRows.map((r) => r.split('\t'));

                      const columnIds = editableColumns
                        .map(
                          (c) =>
                            (c as { accessorKey?: string }).accessorKey ??
                            (c as { id?: string }).id ??
                            ''
                        )
                        .filter(Boolean);
                      const startColIdx = columnIds.indexOf(activeCellInfo.columnId);

                      let pastedCount = 0;
                      for (let r = 0; r < values.length; r++) {
                        const targetRowIndex = activeCellInfo.rowIndex + r;
                        if (targetRowIndex >= data.length) break;
                        for (let c = 0; c < values[r].length; c++) {
                          const targetColId = columnIds[startColIdx + c];
                          if (!targetColId) break;
                          handleCellEdit(targetRowIndex, targetColId, values[r][c]);
                          pastedCount++;
                        }
                      }

                      const cellCount = `${values.length}x${values[0]?.length ?? 1}`;
                      setLastAction(`Tempel ${cellCount} (${pastedCount} sel)`);
                    } catch {
                      setLastAction('Gagal membaca clipboard');
                    }
                  }}
                >
                  <ClipboardPaste />
                  Tempel
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  variant="destructive"
                  onClick={() => {
                    if (isMultiRowSelected && rangeRowIndices) {
                      const rowsToDelete = new Set(rangeRowIndices);
                      setData((prev) => prev.filter((_, i) => !rowsToDelete.has(i)));
                      setLastAction(`Hapus ${rowsToDelete.size} baris`);
                    } else {
                      setData((prev) => prev.filter((_, i) => i !== row.index));
                      setLastAction(`Hapus baris: "${row.original.name}"`);
                    }
                  }}
                >
                  <Trash2 />
                  {isMultiRowSelected ? `Hapus ${rangeRowIndices.length} baris` : 'Hapus baris'}
                </ContextMenuItem>
              </>
            );
          }}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Row
          </button>
        </div>
      </div>
    );
  },
};

export const WithAddRow: Story = {
  args: { data: employees, columns },
  render: () => {
    const [data, setData] = useState<Employee[]>(employees.slice(0, 6));
    const [lastAction, setLastAction] = useState<string | null>(null);

    const handleAddRow = () => {
      const newId = data.length + 1;
      const newRow: Employee = {
        id: newId,
        name: `New Employee ${newId}`,
        email: `new${newId}@company.com`,
        department: 'Engineering',
        role: 'Junior Engineer',
        status: 'active',
        joined: new Date().toISOString().split('T')[0],
      };
      setData((prev) => [...prev, newRow]);
      setLastAction(`Added row: "${newRow.name}"`);
    };

    const handleCellEdit = (rowIndex: number, columnId: string, value: unknown) => {
      setData((prev) =>
        prev.map((row, i) => (i === rowIndex ? { ...row, [columnId]: value } : row))
      );
    };

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Click the <strong>+</strong> button to add a new row at the bottom of the table. Cells are
          also editable — double-click to edit (date picker is used for the <strong>Joined</strong>{' '}
          column).
        </p>
        {lastAction && (
          <p className="text-sm font-medium text-foreground">
            Last action: <span className="text-primary">{lastAction}</span>
          </p>
        )}
        <DataTable
          data={data}
          columns={editableColumns}
          enableRowDnd
          enablePagination={false}
          onCellEdit={handleCellEdit}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Row
          </button>
        </div>
      </div>
    );
  },
};

export const TreeViewCustomSubRows: Story = {
  args: { data: employees, columns },
  render: () => {
    type OrgNode = { id: string; label: string; type: string; subItems?: OrgNode[] };

    const orgData: OrgNode[] = [
      {
        id: 'c1',
        label: 'Acme Corp',
        type: 'Company',
        subItems: [
          {
            id: 'd1',
            label: 'Technology Division',
            type: 'Division',
            subItems: [
              { id: 't1', label: 'Platform Team', type: 'Team' },
              { id: 't2', label: 'Data Team', type: 'Team' },
            ],
          },
          {
            id: 'd2',
            label: 'Operations Division',
            type: 'Division',
            subItems: [{ id: 't3', label: 'Logistics Team', type: 'Team' }],
          },
        ],
      },
    ];

    const orgColumns: ColumnDef<OrgNode>[] = [
      { accessorKey: 'label', header: 'Name' },
      { accessorKey: 'type', header: 'Type' },
    ];

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Custom <code>getSubRows</code> pointing to <code>subItems</code> instead of{' '}
          <code>children</code>.
        </p>
        <DataTable
          data={orgData}
          columns={orgColumns}
          enableTreeView
          getSubRows={(row) => row.subItems}
          enablePagination={false}
          enableColumnDnd={false}
        />
      </div>
    );
  },
};

export const WithColumnTree: Story = {
  args: { data: employees, columns },
  render: () => {
    const columnTree: HeaderColumnNode[] = [
      { id: 'id', header: 'ID' },
      {
        id: 'personal',
        header: 'Personal Info',
        children: [
          { id: 'name', header: 'Name' },
          {
            id: 'email',
            header: 'Email',
            children: [{ id: 'e', header: 'e' }],
          },
        ],
      },
      {
        id: 'work',
        header: 'Work Info',
        children: [
          {
            id: 'dept',
            header: 'Department',
            children: [{ id: 'd', header: 'd' }],
          },
          { id: 'role', header: 'Role' },
          { id: 'status', header: 'Status' },
        ],
      },
      { id: 'date', header: 'Date' },
    ];

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Multi-level headers defined as a <strong>column tree</strong>. <code>colspan</code> and{' '}
          <code>rowspan</code> are auto-generated from the tree structure — no manual span
          calculation needed.
        </p>
        <DataTable
          data={employees.slice(0, 6)}
          columns={columns}
          enablePagination={false}
          enableColumnDnd={false}
          headerColumnTree={columnTree}
        />
      </div>
    );
  },
};

const wideEmployeeColumns: ColumnDef<Employee>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  { accessorKey: 'name', header: 'Name', size: 180 },
  { accessorKey: 'email', header: 'Email', size: 260 },
  { accessorKey: 'department', header: 'Department', size: 200 },
  { accessorKey: 'role', header: 'Role', size: 200 },
  { accessorKey: 'status', header: 'Status', size: 120, cell: statusCell },
  { accessorKey: 'joined', header: 'Joined', size: 160, cell: dateCell },
];

export const WithStickyHeader: Story = {
  args: { data: employees, columns },
  render: () => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Header stays visible while scrolling vertically. The table has a{' '}
        <strong>max height of 400 px</strong> — scroll down to see it in action.
      </p>
      <DataTable
        data={employees}
        columns={wideEmployeeColumns}
        stickyHeader
        enablePagination={false}
        enableColumnDnd={false}
      />
    </div>
  ),
};

export const WithStickyColumns: Story = {
  args: { data: employees, columns },
  render: () => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        <strong>ID</strong> and <strong>Name</strong> stay pinned while the remaining columns scroll
        horizontally. Uses <code>stickyColumns={'{2}'}</code> — you can pass any number.
      </p>
      <div className="max-w-135">
        <DataTable
          data={employees}
          columns={wideEmployeeColumns}
          stickyColumns={2}
          enablePagination={false}
          enableColumnDnd={false}
          enableColumnResize={false}
        />
      </div>
    </div>
  ),
};

export const WithStickyHeaderAndColumns: Story = {
  args: { data: employees, columns },
  render: () => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Both axes frozen — like a spreadsheet. Header sticks at the top; <strong>ID</strong> and{' '}
        <strong>Name</strong> stay pinned on the left. Uses{' '}
        <code>stickyHeader stickyColumns={'{2}'}</code>.
      </p>
      <div className="max-w-135">
        <DataTable
          data={employees}
          columns={wideEmployeeColumns}
          stickyHeader
          stickyColumns={2}
          enablePagination={false}
          enableColumnDnd={false}
          enableColumnResize={false}
        />
      </div>
    </div>
  ),
};

export const TreeViewWithGroupedHeaders: Story = {
  args: { data: employees, columns },
  render: () => {
    type RabItem = {
      id: string;
      kode: string;
      jobItem: string;
      jenis: 'Job' | 'Location';
      volumeRab: number | null;
      volumeUom: string | null;
      unitPriceMaterial: number | null;
      unitPriceWork: number | null;
      totalPriceMaterial: number | null;
      totalPriceWork: number | null;
      amountRab: number | null;
      remarks: 'Aktif' | 'Tidak Aktif';
      children?: RabItem[];
    };

    const initialData: RabItem[] = [
      {
        id: 'A',
        kode: 'A',
        jobItem: 'Pekerjaan Bangunan Office',
        jenis: 'Job',
        volumeRab: null,
        volumeUom: null,
        unitPriceMaterial: null,
        unitPriceWork: null,
        totalPriceMaterial: null,
        totalPriceWork: null,
        amountRab: null,
        remarks: 'Aktif',
        children: [
          {
            id: 'A.1',
            kode: 'A.1',
            jobItem: 'Pekerjaan Civil',
            jenis: 'Job',
            volumeRab: null,
            volumeUom: null,
            unitPriceMaterial: null,
            unitPriceWork: null,
            totalPriceMaterial: null,
            totalPriceWork: null,
            amountRab: null,
            remarks: 'Tidak Aktif',
            children: [
              {
                id: 'A.1.1',
                kode: 'A.1.1',
                jobItem: 'Area Lobby',
                jenis: 'Location',
                volumeRab: null,
                volumeUom: null,
                unitPriceMaterial: null,
                unitPriceWork: null,
                totalPriceMaterial: null,
                totalPriceWork: null,
                amountRab: null,
                remarks: 'Aktif',
                children: [
                  {
                    id: 'A.1.1.1',
                    kode: 'A.1.1.1',
                    jobItem: 'Pemasangan Batu Bata',
                    jenis: 'Job',
                    volumeRab: 15,
                    volumeUom: 'm2',
                    unitPriceMaterial: 0,
                    unitPriceWork: 40039000,
                    totalPriceMaterial: 0,
                    totalPriceWork: 600585000,
                    amountRab: 600585000,
                    remarks: 'Aktif',
                    children: [
                      {
                        id: 'A.1.1.1.1',
                        kode: 'A.1.1.1.1',
                        jobItem: 'Pengadukan Semen & Pasir',
                        jenis: 'Job',
                        volumeRab: null,
                        volumeUom: null,
                        unitPriceMaterial: null,
                        unitPriceWork: null,
                        totalPriceMaterial: null,
                        totalPriceWork: null,
                        amountRab: null,
                        remarks: 'Aktif',
                      },
                      {
                        id: 'A.1.1.1.2',
                        kode: 'A.1.1.1.2',
                        jobItem: 'Pemasangan Granit',
                        jenis: 'Job',
                        volumeRab: null,
                        volumeUom: null,
                        unitPriceMaterial: null,
                        unitPriceWork: null,
                        totalPriceMaterial: null,
                        totalPriceWork: null,
                        amountRab: null,
                        remarks: 'Aktif',
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

    const rabColumns: ColumnDef<RabItem>[] = [
      { accessorKey: 'kode', header: 'Kode', size: 100 },
      {
        accessorKey: 'jobItem',
        header: 'Job/Item',
        size: 220,
        meta: { editable: true },
      },
      {
        accessorKey: 'jenis',
        header: 'Jenis',
        size: 90,
        meta: {
          editable: true,
          edit: {
            editType: 'select',
            selectOptions: [
              { label: 'Job', value: 'Job' },
              { label: 'Location', value: 'Location' },
            ],
          },
        },
      },
      {
        accessorKey: 'volumeRab',
        header: 'RAB',
        size: 70,
        meta: { editable: true },
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v !== null ? <span>{v.toLocaleString('id-ID')}</span> : null;
        },
      },
      {
        accessorKey: 'volumeUom',
        header: 'UoM',
        size: 60,
        meta: { editable: true },
      },
      {
        accessorKey: 'unitPriceMaterial',
        header: 'RAB',
        size: 110,
        meta: { editable: true },
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v !== null ? <span>{v.toLocaleString('id-ID')}</span> : null;
        },
      },
      {
        accessorKey: 'unitPriceWork',
        header: 'RAB',
        size: 110,
        meta: { editable: true },
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v !== null ? <span>{v.toLocaleString('id-ID')}</span> : null;
        },
      },
      {
        accessorKey: 'totalPriceMaterial',
        header: 'RAB',
        size: 120,
        meta: { editable: true },
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v !== null ? <span>{v.toLocaleString('id-ID')}</span> : null;
        },
      },
      {
        accessorKey: 'totalPriceWork',
        header: 'RAB',
        size: 120,
        meta: { editable: true },
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v !== null ? <span>{v.toLocaleString('id-ID')}</span> : null;
        },
      },
      {
        accessorKey: 'amountRab',
        header: 'RAB',
        size: 130,
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v !== null ? (
            <span className="font-medium">{v.toLocaleString('id-ID')}</span>
          ) : null;
        },
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        size: 110,
        cell: ({ getValue }) => {
          const v = getValue() as 'Aktif' | 'Tidak Aktif';
          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                v === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'
              }`}
            >
              {v}
            </span>
          );
        },
      },
    ];

    // Column tree mirrors the column order exactly:
    // [kode][jobItem][jenis][volume: RAB|UoM][unitPrice: Material>RAB | Work>RAB][totalPrice: Material>RAB | Work>RAB][amount: RAB][remarks]
    const columnTree: HeaderColumnNode[] = [
      { id: 'kode', header: 'Kode' },
      { id: 'jobItem', header: 'Job/Item' },
      { id: 'jenis', header: 'Jenis' },
      {
        id: 'volume',
        header: 'Volume',
        children: [
          { id: 'volumeRab', header: 'RAB' },
          { id: 'volumeUom', header: 'UoM' },
        ],
      },
      {
        id: 'unitPrice',
        header: 'Unit Price',
        children: [
          {
            id: 'unitPriceMaterialGroup',
            header: 'Material',
            children: [{ id: 'unitPriceMaterial', header: 'RAB' }],
          },
          {
            id: 'unitPriceWorkGroup',
            header: 'Work',
            children: [{ id: 'unitPriceWork', header: 'RAB' }],
          },
        ],
      },
      {
        id: 'totalPrice',
        header: 'Total Price',
        children: [
          {
            id: 'totalPriceMaterialGroup',
            header: 'Material',
            children: [{ id: 'totalPriceMaterial', header: 'RAB' }],
          },
          {
            id: 'totalPriceWorkGroup',
            header: 'Work',
            children: [{ id: 'totalPriceWork', header: 'RAB' }],
          },
        ],
      },
      {
        id: 'amountGroup',
        header: 'Amount',
        children: [{ id: 'amountRab', header: 'RAB' }],
      },
      { id: 'remarks', header: 'Remarks' },
    ];

    const [data, setData] = useState<RabItem[]>(initialData);
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [cutCell, setCutCell] = useState<{ rowId: string; columnId: string } | null>(null);

    function deepUpdate(items: RabItem[], id: string, columnId: string, value: unknown): RabItem[] {
      return items.map((item) => {
        if (item.id === id) return { ...item, [columnId]: value };
        if (item.children)
          return { ...item, children: deepUpdate(item.children, id, columnId, value) };
        return item;
      });
    }

    function insertSibling(
      items: RabItem[],
      targetId: string,
      newRow: RabItem,
      before: boolean
    ): RabItem[] {
      const idx = items.findIndex((item) => item.id === targetId);
      if (idx !== -1) {
        const next = [...items];
        next.splice(before ? idx : idx + 1, 0, newRow);
        return next;
      }
      return items.map((item) => ({
        ...item,
        children: item.children
          ? insertSibling(item.children, targetId, newRow, before)
          : undefined,
      }));
    }

    function makeLeaf(items: RabItem[], targetId: string): RabItem[] {
      return items.map((item) => {
        if (item.id === targetId) return { ...item, children: undefined };
        return { ...item, children: item.children ? makeLeaf(item.children, targetId) : undefined };
      });
    }

    function deleteRow(items: RabItem[], targetId: string): RabItem[] {
      return items
        .filter((item) => item.id !== targetId)
        .map((item) => ({
          ...item,
          children: item.children ? deleteRow(item.children, targetId) : undefined,
        }));
    }

    function newEmptyRow(id: string): RabItem {
      return {
        id,
        kode: id,
        jobItem: '',
        jenis: 'Job',
        volumeRab: null,
        volumeUom: null,
        unitPriceMaterial: null,
        unitPriceWork: null,
        totalPriceMaterial: null,
        totalPriceWork: null,
        amountRab: null,
        remarks: 'Aktif',
      };
    }

    const handleCellEdit = (_rowIndex: number, columnId: string, value: unknown, row?: RabItem) => {
      if (!row?.id) return;
      setData((prev) => deepUpdate(prev, row.id, columnId, value));
    };

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Tree view with multi-level grouped headers, inline editing, and context menu. Right-click
          any row to cut, copy, paste, insert siblings, or delete.
        </p>
        {lastAction && (
          <p className="text-sm font-medium text-foreground">
            Last action: <span className="text-primary">{lastAction}</span>
          </p>
        )}
        <DataTable
          data={data}
          columns={rabColumns}
          headerColumnTree={columnTree}
          enableTreeView
          enablePagination={false}
          enableColumnDnd={false}
          enableColumnResize
          enableZebraStripes={true}
          onCellEdit={handleCellEdit}
          getSubRows={(row) => row.children}
          contextMenu={(row, { activeCellInfo, triggerPaste } = {}) => {
            const rowData = row.original;
            const hasChildren = !!rowData.children?.length;
            const label = rowData.jobItem || rowData.kode;

            return (
              <>
                <ContextMenuItem
                  onClick={() => {
                    const value = activeCellInfo?.value ?? label;
                    navigator.clipboard.writeText(String(value)).catch(() => undefined);
                    if (activeCellInfo) {
                      const colDef = rabColumns.find(
                        (c) =>
                          (c as { accessorKey?: string }).accessorKey === activeCellInfo.columnId
                      );
                      if ((colDef as { meta?: { editable?: boolean } })?.meta?.editable) {
                        setCutCell({ rowId: rowData.id, columnId: activeCellInfo.columnId });
                      }
                    }
                    setLastAction(`Potong: "${value}"`);
                  }}
                >
                  <Scissors />
                  Potong
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    const value = activeCellInfo?.value ?? label;
                    navigator.clipboard.writeText(String(value)).catch(() => undefined);
                    setCutCell(null);
                    setLastAction(`Salin: "${value}"`);
                  }}
                >
                  <Copy />
                  Salin
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={async () => {
                    await triggerPaste?.();
                    if (cutCell) {
                      setData((prev) => deepUpdate(prev, cutCell.rowId, cutCell.columnId, null));
                      setCutCell(null);
                    }
                    setLastAction('Tempel');
                  }}
                >
                  <ClipboardPaste />
                  Tempel
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  disabled={!hasChildren}
                  onClick={() => {
                    setData((prev) => makeLeaf(prev, rowData.id));
                    setLastAction(`Jadikan level terakhir: "${label}"`);
                  }}
                >
                  <AlignRight />
                  Jadikan level terakhir
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    const newId = `row-${Date.now()}`;
                    setData((prev) => insertSibling(prev, rowData.id, newEmptyRow(newId), true));
                    setLastAction(`Sisipkan baris di atas: "${label}"`);
                  }}
                >
                  <ArrowUpToLine />
                  Sisipkan baris di atas
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    const newId = `row-${Date.now()}`;
                    setData((prev) => insertSibling(prev, rowData.id, newEmptyRow(newId), false));
                    setLastAction(`Sisipkan baris di bawah: "${label}"`);
                  }}
                >
                  <ArrowDownToLine />
                  Sisipkan baris di bawah
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  variant="destructive"
                  onClick={() => {
                    setData((prev) => deleteRow(prev, rowData.id));
                    setLastAction(`Hapus baris: "${label}"`);
                  }}
                >
                  <Trash2 />
                  Hapus baris
                </ContextMenuItem>
              </>
            );
          }}
        />
      </div>
    );
  },
};

export const ExcelModeTreeAndSticky: Story = {
  args: { data: employees, columns },
  render: () => {
    type RabItem = {
      id: string;
      kode: string;
      jobItem: string;
      jenis: 'Job' | 'Location';
      volumeRab: number | null;
      volumeUom: string | null;
      unitPriceMaterial: number | null;
      unitPriceWork: number | null;
      totalPriceMaterial: number | null;
      totalPriceWork: number | null;
      amountRab: number | null;
      remarks: 'Aktif' | 'Tidak Aktif';
      children?: RabItem[];
    };

    const initialData: RabItem[] = [
      {
        id: 'A',
        kode: 'A',
        jobItem: 'Pekerjaan Bangunan Office',
        jenis: 'Job',
        volumeRab: null,
        volumeUom: null,
        unitPriceMaterial: null,
        unitPriceWork: null,
        totalPriceMaterial: null,
        totalPriceWork: null,
        amountRab: null,
        remarks: 'Aktif',
        children: [
          {
            id: 'A.1',
            kode: 'A.1',
            jobItem: 'Pekerjaan Civil',
            jenis: 'Job',
            volumeRab: null,
            volumeUom: null,
            unitPriceMaterial: null,
            unitPriceWork: null,
            totalPriceMaterial: null,
            totalPriceWork: null,
            amountRab: null,
            remarks: 'Tidak Aktif',
            children: [
              {
                id: 'A.1.1',
                kode: 'A.1.1',
                jobItem: 'Area Lobby',
                jenis: 'Location',
                volumeRab: null,
                volumeUom: null,
                unitPriceMaterial: null,
                unitPriceWork: null,
                totalPriceMaterial: null,
                totalPriceWork: null,
                amountRab: null,
                remarks: 'Aktif',
                children: [
                  {
                    id: 'A.1.1.1',
                    kode: 'A.1.1.1',
                    jobItem: 'Pemasangan Batu Bata',
                    jenis: 'Job',
                    volumeRab: 15,
                    volumeUom: 'm2',
                    unitPriceMaterial: 0,
                    unitPriceWork: 40039000,
                    totalPriceMaterial: 0,
                    totalPriceWork: 600585000,
                    amountRab: 600585000,
                    remarks: 'Aktif',
                  },
                  {
                    id: 'A.1.1.2',
                    kode: 'A.1.1.2',
                    jobItem: 'Pemasangan Granit',
                    jenis: 'Job',
                    volumeRab: 30,
                    volumeUom: 'm2',
                    unitPriceMaterial: 250000,
                    unitPriceWork: 85000,
                    totalPriceMaterial: 7500000,
                    totalPriceWork: 2550000,
                    amountRab: 10050000,
                    remarks: 'Aktif',
                  },
                ],
              },
            ],
          },
          {
            id: 'A.2',
            kode: 'A.2',
            jobItem: 'Pekerjaan MEP',
            jenis: 'Job',
            volumeRab: null,
            volumeUom: null,
            unitPriceMaterial: null,
            unitPriceWork: null,
            totalPriceMaterial: null,
            totalPriceWork: null,
            amountRab: null,
            remarks: 'Aktif',
            children: [
              {
                id: 'A.2.1',
                kode: 'A.2.1',
                jobItem: 'Instalasi Listrik',
                jenis: 'Job',
                volumeRab: 1,
                volumeUom: 'ls',
                unitPriceMaterial: 12000000,
                unitPriceWork: 3500000,
                totalPriceMaterial: 12000000,
                totalPriceWork: 3500000,
                amountRab: 15500000,
                remarks: 'Aktif',
              },
            ],
          },
        ],
      },
    ];

    // kode and amountRab are intentionally non-editable to show nonEditableTooltip
    const rabColumns: ColumnDef<RabItem>[] = [
      { accessorKey: 'kode', header: 'Kode', size: 100 },
      {
        accessorKey: 'jobItem',
        header: 'Job/Item',
        size: 220,
        meta: { editable: true },
      },
      {
        accessorKey: 'jenis',
        header: 'Jenis',
        size: 90,
        meta: {
          editable: true,
          edit: {
            editType: 'select',
            selectOptions: [
              { label: 'Job', value: 'Job' },
              { label: 'Location', value: 'Location' },
            ],
          },
        },
      },
      {
        accessorKey: 'volumeRab',
        header: 'RAB',
        size: 70,
        meta: { editable: true },
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v !== null ? <span>{v.toLocaleString('id-ID')}</span> : null;
        },
      },
      {
        accessorKey: 'volumeUom',
        header: 'UoM',
        size: 60,
        meta: { editable: true },
      },
      {
        accessorKey: 'unitPriceMaterial',
        header: 'RAB',
        size: 110,
        meta: { editable: true },
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v !== null ? <span>{v.toLocaleString('id-ID')}</span> : null;
        },
      },
      {
        accessorKey: 'unitPriceWork',
        header: 'RAB',
        size: 110,
        meta: { editable: true },
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v !== null ? <span>{v.toLocaleString('id-ID')}</span> : null;
        },
      },
      {
        accessorKey: 'totalPriceMaterial',
        header: 'RAB',
        size: 120,
        meta: { editable: true },
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v !== null ? <span>{v.toLocaleString('id-ID')}</span> : null;
        },
      },
      {
        accessorKey: 'totalPriceWork',
        header: 'RAB',
        size: 120,
        meta: { editable: true },
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v !== null ? <span>{v.toLocaleString('id-ID')}</span> : null;
        },
      },
      {
        accessorKey: 'amountRab',
        header: 'Amount',
        size: 130,
        cell: ({ getValue }) => {
          const v = getValue() as number | null;
          return v !== null ? (
            <span className="font-medium">{v.toLocaleString('id-ID')}</span>
          ) : null;
        },
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        size: 110,
        meta: {
          editable: true,
          edit: {
            editType: 'select',
            selectOptions: [
              { label: 'Aktif', value: 'Aktif' },
              { label: 'Tidak Aktif', value: 'Tidak Aktif' },
            ],
          },
        },
        cell: ({ getValue }) => {
          const v = getValue() as 'Aktif' | 'Tidak Aktif';
          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                v === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'
              }`}
            >
              {v}
            </span>
          );
        },
      },
    ];

    const columnTree: HeaderColumnNode[] = [
      { id: 'kode', header: 'Kode' },
      { id: 'jobItem', header: 'Job/Item' },
      { id: 'jenis', header: 'Jenis' },
      {
        id: 'volume',
        header: 'Volume',
        children: [
          { id: 'volumeRab', header: 'RAB' },
          { id: 'volumeUom', header: 'UoM' },
        ],
      },
      {
        id: 'unitPrice',
        header: 'Unit Price',
        children: [
          {
            id: 'unitPriceMaterialGroup',
            header: 'Material',
            children: [{ id: 'unitPriceMaterial', header: 'RAB' }],
          },
          {
            id: 'unitPriceWorkGroup',
            header: 'Work',
            children: [{ id: 'unitPriceWork', header: 'RAB' }],
          },
        ],
      },
      {
        id: 'totalPrice',
        header: 'Total Price',
        children: [
          {
            id: 'totalPriceMaterialGroup',
            header: 'Material',
            children: [{ id: 'totalPriceMaterial', header: 'RAB' }],
          },
          {
            id: 'totalPriceWorkGroup',
            header: 'Work',
            children: [{ id: 'totalPriceWork', header: 'RAB' }],
          },
        ],
      },
      {
        id: 'amountGroup',
        header: 'Amount',
        children: [{ id: 'amountRab', header: 'RAB' }],
      },
      { id: 'remarks', header: 'Remarks' },
    ];

    const [data, setData] = useState<RabItem[]>(initialData);
    const [lastAction, setLastAction] = useState<string | null>(null);
    const [cutCell, setCutCell] = useState<{ rowId: string; columnId: string } | null>(null);

    function deepUpdate(items: RabItem[], id: string, columnId: string, value: unknown): RabItem[] {
      return items.map((item) => {
        if (item.id === id) return { ...item, [columnId]: value };
        if (item.children)
          return { ...item, children: deepUpdate(item.children, id, columnId, value) };
        return item;
      });
    }

    function insertSibling(
      items: RabItem[],
      targetId: string,
      newRow: RabItem,
      before: boolean
    ): RabItem[] {
      const idx = items.findIndex((item) => item.id === targetId);
      if (idx !== -1) {
        const next = [...items];
        next.splice(before ? idx : idx + 1, 0, newRow);
        return next;
      }
      return items.map((item) => ({
        ...item,
        children: item.children
          ? insertSibling(item.children, targetId, newRow, before)
          : undefined,
      }));
    }

    function makeLeaf(items: RabItem[], targetId: string): RabItem[] {
      return items.map((item) => {
        if (item.id === targetId) return { ...item, children: undefined };
        return { ...item, children: item.children ? makeLeaf(item.children, targetId) : undefined };
      });
    }

    function deleteRow(items: RabItem[], targetId: string): RabItem[] {
      return items
        .filter((item) => item.id !== targetId)
        .map((item) => ({
          ...item,
          children: item.children ? deleteRow(item.children, targetId) : undefined,
        }));
    }

    function newEmptyRow(id: string): RabItem {
      return {
        id,
        kode: id,
        jobItem: '',
        jenis: 'Job',
        volumeRab: null,
        volumeUom: null,
        unitPriceMaterial: null,
        unitPriceWork: null,
        totalPriceMaterial: null,
        totalPriceWork: null,
        amountRab: null,
        remarks: 'Aktif',
      };
    }

    const handleCellEdit = (_rowIndex: number, columnId: string, value: unknown, row?: RabItem) => {
      if (!row?.id) return;
      setData((prev) => deepUpdate(prev, row.id, columnId, value));
      setLastAction(`Edited "${columnId}" on row ${row.id}`);
    };

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Combines <strong>tree view</strong>, <strong>multi-level headers</strong>,{' '}
          <strong>sticky header</strong>, <strong>sticky columns</strong> (Kode + Job/Item), and{' '}
          <strong>Excel range selection</strong>. <strong>Kode</strong> and <strong>Amount</strong>{' '}
          are read-only — hover them to see the tooltip. All other cells are editable. Range
          selection clears automatically when you expand or collapse a row.
        </p>
        <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
          <li>Click and drag to select a range — marching ants show the copied region</li>
          <li>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Ctrl/Cmd+C</kbd> Copy
            range — <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Ctrl/Cmd+V</kbd>{' '}
            Paste at active cell
          </li>
          <li>Double-click a cell to edit it inline</li>
          <li>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Enter</kbd> Confirm and
            move down — <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Tab</kbd>{' '}
            move right — <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">Esc</kbd>{' '}
            cancel
          </li>
          <li>Click the chevron in the Kode column to expand / collapse (clears active range)</li>
          <li>Right-click for context menu — row actions and range copy</li>
        </ul>
        {lastAction && (
          <p className="text-sm font-medium text-foreground">
            Last action: <span className="text-primary">{lastAction}</span>
          </p>
        )}
        <DataTable
          data={data}
          columns={rabColumns}
          headerColumnTree={columnTree}
          enableRangeSelection
          enableTreeView
          stickyHeader
          stickyColumns={2}
          enablePagination={false}
          enableColumnDnd={false}
          enableColumnResize
          enableZebraStripes
          onCellEdit={handleCellEdit}
          getSubRows={(row) => row.children}
          nonEditableTooltip={({ columnId, header }) =>
            columnId === 'kode' ? 'Kode tidak dapat diubah' : `${header} dihitung otomatis`
          }
          contextMenu={(
            row,
            { activeCellInfo, rangeBounds, triggerCopy, triggerCut, triggerPaste } = {}
          ) => {
            const rowData = row.original;
            const hasChildren = !!rowData.children?.length;
            const label = rowData.jobItem || rowData.kode;

            return (
              <>
                <ContextMenuItem
                  onClick={() => {
                    const insideRange =
                      rangeBounds &&
                      activeCellInfo &&
                      activeCellInfo.rowIndex >= rangeBounds.minRow &&
                      activeCellInfo.rowIndex <= rangeBounds.maxRow &&
                      activeCellInfo.colIndex >= rangeBounds.minCol &&
                      activeCellInfo.colIndex <= rangeBounds.maxCol;
                    if (insideRange && triggerCut) {
                      triggerCut();
                      setCutCell(null);
                      setLastAction('Potong range');
                    } else {
                      const value = activeCellInfo?.value ?? label;
                      navigator.clipboard.writeText(String(value)).catch(() => undefined);
                      if (activeCellInfo) {
                        const colDef = rabColumns.find(
                          (c) =>
                            (c as { accessorKey?: string }).accessorKey === activeCellInfo.columnId
                        );
                        if ((colDef as { meta?: { editable?: boolean } })?.meta?.editable) {
                          setCutCell({ rowId: rowData.id, columnId: activeCellInfo.columnId });
                        }
                      }
                      setLastAction(`Potong: "${value}"`);
                    }
                  }}
                >
                  <Scissors />
                  Potong
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    if (rangeBounds && triggerCopy) {
                      triggerCopy();
                      setCutCell(null);
                      setLastAction('Salin range');
                    } else {
                      const value = activeCellInfo?.value ?? label;
                      navigator.clipboard.writeText(String(value)).catch(() => undefined);
                      setCutCell(null);
                      setLastAction(`Salin: "${value}"`);
                    }
                  }}
                >
                  <Copy />
                  Salin
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={async () => {
                    await triggerPaste?.();
                    if (cutCell) {
                      setData((prev) => deepUpdate(prev, cutCell.rowId, cutCell.columnId, null));
                      setCutCell(null);
                    }
                    setLastAction('Tempel');
                  }}
                >
                  <ClipboardPaste />
                  Tempel
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  disabled={!hasChildren}
                  onClick={() => {
                    setData((prev) => makeLeaf(prev, rowData.id));
                    setLastAction(`Jadikan level terakhir: "${label}"`);
                  }}
                >
                  <AlignRight />
                  Jadikan level terakhir
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    const newId = `row-${Date.now()}`;
                    setData((prev) => insertSibling(prev, rowData.id, newEmptyRow(newId), true));
                    setLastAction(`Sisipkan baris di atas: "${label}"`);
                  }}
                >
                  <ArrowUpToLine />
                  Sisipkan baris di atas
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    const newId = `row-${Date.now()}`;
                    setData((prev) => insertSibling(prev, rowData.id, newEmptyRow(newId), false));
                    setLastAction(`Sisipkan baris di bawah: "${label}"`);
                  }}
                >
                  <ArrowDownToLine />
                  Sisipkan baris di bawah
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  variant="destructive"
                  onClick={() => {
                    setData((prev) => deleteRow(prev, rowData.id));
                    setLastAction(`Hapus baris: "${label}"`);
                  }}
                >
                  <Trash2 />
                  Hapus baris
                </ContextMenuItem>
              </>
            );
          }}
        />
      </div>
    );
  },
};

// ─── Select with infinite scroll ─────────────────────────────────────────────

const ALL_DEPT_OPTIONS = [
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Design', value: 'Design' },
  { label: 'Product', value: 'Product' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'HR', value: 'HR' },
  { label: 'Finance', value: 'Finance' },
  { label: 'Legal', value: 'Legal' },
  { label: 'Sales', value: 'Sales' },
];

const ALL_ROLE_OPTIONS = [
  'Senior Engineer',
  'Junior Engineer',
  'Staff Engineer',
  'Principal Engineer',
  'UI Designer',
  'UX Researcher',
  'Product Manager',
  'Associate PM',
  'Marketing Lead',
  'Content Writer',
  'HR Manager',
  'DevOps Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
];

const STORY_PAGE_SIZE = 3;

export const WithSelectInfiniteScroll: Story = {
  args: { data: employees, columns: editableColumns },
  render: () => {
    const [data, setData] = useState<Employee[]>(employees.slice(0, 6));
    const [deptPage, setDeptPage] = useState(1);
    const [deptLoading, setDeptLoading] = useState(false);

    const deptOptions = ALL_DEPT_OPTIONS.slice(0, deptPage * STORY_PAGE_SIZE);
    const deptHasNextPage = deptOptions.length < ALL_DEPT_OPTIONS.length;

    const loadMoreDepts = () => {
      if (deptLoading || !deptHasNextPage) return;
      setDeptLoading(true);
      setTimeout(() => {
        setDeptPage((p) => p + 1);
        setDeptLoading(false);
      }, 600);
    };

    const cols: ColumnDef<Employee>[] = [
      { accessorKey: 'id', header: 'ID', size: 60 },
      { accessorKey: 'name', header: 'Name', meta: { editable: true } },
      {
        accessorKey: 'department',
        header: 'Department',
        meta: {
          editable: true,
          edit: {
            editType: 'select',
            selectOptions: deptOptions,
            selectHasNextPage: deptHasNextPage,
            selectOnLoadMore: loadMoreDepts,
          },
        },
      },
      { accessorKey: 'role', header: 'Role', meta: { editable: true } },
    ];

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Double-click <strong>Department</strong> to open the select. Scroll to the bottom of the
          dropdown to load more options ({STORY_PAGE_SIZE} at a time, 600ms simulated delay).
        </p>
        {deptLoading && <p className="text-xs text-muted-foreground">Loading more departments…</p>}
        <DataTable
          data={data}
          columns={cols}
          enablePagination={false}
          onCellEdit={(rowIndex, columnId, value) =>
            setData((prev) =>
              prev.map((row, i) => (i === rowIndex ? { ...row, [columnId]: value } : row))
            )
          }
        />
      </div>
    );
  },
};

export const WithAsyncSelect: Story = {
  args: { data: employees, columns: editableColumns },
  render: () => {
    const [data, setData] = useState<Employee[]>(employees.slice(0, 6));
    const [roleSearch, setRoleSearch] = useState('');
    const [rolePage, setRolePage] = useState(1);
    const [roleLoading, setRoleLoading] = useState(false);

    const filteredRoles = ALL_ROLE_OPTIONS.filter((r) =>
      r.toLowerCase().includes(roleSearch.toLowerCase())
    );
    const roleOptions = filteredRoles
      .slice(0, rolePage * STORY_PAGE_SIZE)
      .map((r) => ({ value: r, label: r }));
    const roleHasNextPage = roleOptions.length < filteredRoles.length;

    const handleRoleSearch = (q: string) => {
      setRoleSearch(q);
      setRolePage(1);
    };

    const loadMoreRoles = () => {
      if (roleLoading || !roleHasNextPage) return;
      setRoleLoading(true);
      setTimeout(() => {
        setRolePage((p) => p + 1);
        setRoleLoading(false);
      }, 500);
    };

    const cols: ColumnDef<Employee>[] = [
      { accessorKey: 'id', header: 'ID', size: 60 },
      { accessorKey: 'name', header: 'Name', meta: { editable: true } },
      {
        accessorKey: 'role',
        header: 'Role',
        meta: {
          editable: true,
          edit: {
            editType: 'async-select',
            selectOptions: roleOptions,
            selectHasNextPage: roleHasNextPage,
            selectOnLoadMore: loadMoreRoles,
            selectOnSearch: handleRoleSearch,
          },
        },
      },
      { accessorKey: 'department', header: 'Department' },
    ];

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Double-click <strong>Role</strong> to open the async-select. Type to filter results,
          scroll to the bottom to load more ({STORY_PAGE_SIZE} per page, 500ms simulated delay).
        </p>
        {roleLoading && <p className="text-xs text-muted-foreground">Loading more roles…</p>}
        <DataTable
          data={data}
          columns={cols}
          enablePagination={false}
          onCellEdit={(rowIndex, columnId, value) =>
            setData((prev) =>
              prev.map((row, i) => (i === rowIndex ? { ...row, [columnId]: value } : row))
            )
          }
        />
      </div>
    );
  },
};

/**
 * Demonstrates column-level styling overrides using headerClassName, cellClassName, and footerClassName.
 * Each column can customize the appearance of its header, data cells, and footer independently.
 */
export const ColumnStyling: Story = {
  args: {
    columns: styledColumns,
    data: employees,
    enablePagination: true,
    enableFooter: true,
  },
};
