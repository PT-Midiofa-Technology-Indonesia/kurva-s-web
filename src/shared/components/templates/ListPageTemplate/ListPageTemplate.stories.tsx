import type { Meta, StoryObj } from '@storybook/nextjs';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { EllipsisVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/atoms/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ListPageTemplate, type ListPageTemplateProps } from './ListPageTemplate';

// ─── Shared demo data ─────────────────────────────────────────────────────────

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
};

const USERS: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Admin',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'Editor',
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Carol White',
    email: 'carol@example.com',
    role: 'Viewer',
    status: 'inactive',
    createdAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'David Lee',
    email: 'david@example.com',
    role: 'Editor',
    status: 'active',
    createdAt: '2024-04-05',
  },
  {
    id: '5',
    name: 'Eva Martinez',
    email: 'eva@example.com',
    role: 'Admin',
    status: 'active',
    createdAt: '2024-05-18',
  },
  {
    id: '6',
    name: 'Frank Kim',
    email: 'frank@example.com',
    role: 'Viewer',
    status: 'inactive',
    createdAt: '2024-06-22',
  },
  {
    id: '7',
    name: 'Grace Tan',
    email: 'grace@example.com',
    role: 'Editor',
    status: 'active',
    createdAt: '2024-07-30',
  },
  {
    id: '8',
    name: 'Henry Park',
    email: 'henry@example.com',
    role: 'Viewer',
    status: 'active',
    createdAt: '2024-08-14',
  },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        status === 'active' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'
      }`}
    >
      {status}
    </span>
  );
}

// ─── Actions cell ─────────────────────────────────────────────────────────────

function ActionsCell({ row }: { row: Row<User> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-6 w-6 p-0">
          <EllipsisVertical className="h-4 w-4 text-slate-950" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => alert(`Edit ${row.original.name}`)}>
          <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => alert(`View ${row.original.name}`)}>
          <Eye className="mr-2 h-4 w-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => alert(`Delete ${row.original.name}`)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Base columns (all 4 columns, name + email sortable, status not) ──────────

const BASE_COLUMNS: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <span className="font-medium text-slate-950">{row.original.name}</span>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <span className="text-slate-600">{row.original.email}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    enableHiding: false,
    size: 60,
    cell: ({ row }) => <ActionsCell row={row} />,
  },
];

// ─── Storybook wrapper — simulates a real domain page ─────────────────────────

function InteractiveListPage(props: Partial<ListPageTemplateProps<User>>) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>(props.sortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(props.sortOrder ?? 'asc');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return USERS.filter(
      (u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <ListPageTemplate<User>
      title="Users"
      headerActions={<Button onClick={() => alert('Add User')}>Add User</Button>}
      data={paged}
      columns={props.columns ?? BASE_COLUMNS}
      search={search}
      onSearchChange={(v) => {
        setSearch(v ?? '');
        setPage(1);
      }}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={(by, order) => {
        setSortBy(by);
        setSortOrder(order);
      }}
      page={page}
      perPage={perPage}
      totalItems={filtered.length}
      totalPages={totalPages}
      onPaginationChange={(p, pp) => {
        setPage(p);
        setPerPage(pp);
      }}
      toolbarRight={props.toolbarRight}
      {...props}
    />
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Templates/ListPageTemplate',
  component: InteractiveListPage,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof InteractiveListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: 'Default — search + sort + pagination',
  args: {},
};

export const WithDefaultSort: Story = {
  name: 'Default sort on "name" asc',
  args: { sortBy: 'name', sortOrder: 'asc' },
};

export const WithStatusFilter: Story = {
  name: 'Extra filter — status select',
  render: () => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(5);

    const filtered = useMemo(() => {
      const s = search.toLowerCase();
      return USERS.filter(
        (u) =>
          (u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)) &&
          (status === 'all' || u.status === status)
      );
    }, [search, status]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paged = filtered.slice((page - 1) * perPage, page * perPage);

    return (
      <ListPageTemplate<User>
        title="Users"
        headerActions={<Button onClick={() => alert('Add User')}>Add User</Button>}
        data={paged}
        columns={BASE_COLUMNS}
        search={search}
        onSearchChange={(v) => {
          setSearch(v ?? '');
          setPage(1);
        }}
        page={page}
        perPage={perPage}
        totalItems={filtered.length}
        totalPages={totalPages}
        onPaginationChange={(p, pp) => {
          setPage(p);
          setPerPage(pp);
        }}
        toolbarRight={
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-950 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        }
      />
    );
  },
};

export const WithDateRangeFilter: Story = {
  name: 'Extra filter — date range',
  render: () => {
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(5);

    const filtered = useMemo(() => {
      const s = search.toLowerCase();
      return USERS.filter((u) => {
        const matchesSearch = u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
        const matchesFrom = !dateFrom || u.createdAt >= dateFrom;
        const matchesTo = !dateTo || u.createdAt <= dateTo;
        return matchesSearch && matchesFrom && matchesTo;
      });
    }, [search, dateFrom, dateTo]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paged = filtered.slice((page - 1) * perPage, page * perPage);

    return (
      <ListPageTemplate<User>
        title="Users"
        data={paged}
        columns={BASE_COLUMNS}
        search={search}
        onSearchChange={(v) => {
          setSearch(v ?? '');
          setPage(1);
        }}
        page={page}
        perPage={perPage}
        totalItems={filtered.length}
        totalPages={totalPages}
        onPaginationChange={(p, pp) => {
          setPage(p);
          setPerPage(pp);
        }}
        toolbarRight={
          <>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            />
            <span className="text-sm text-slate-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
            />
          </>
        }
      />
    );
  },
};

export const WithTwoSortableColumns: Story = {
  name: '2 sortable columns, no actions',
  render: () => {
    const columns: ColumnDef<User>[] = [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span>{row.original.email}</span>,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        enableSorting: false,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ];

    return <InteractiveListPage columns={columns} sortBy="name" sortOrder="asc" />;
  },
};

export const LoadingState: Story = {
  name: 'Loading state',
  args: { isLoading: true, data: [] },
};

export const ErrorState: Story = {
  name: 'Error state',
  args: { isError: true, data: [], errorMessage: 'Failed to load users. Please try again.' },
};

export const EmptyState: Story = {
  name: 'Empty data',
  render: () => (
    <ListPageTemplate<User>
      title="Users"
      headerActions={<Button onClick={() => alert('Add User')}>Add User</Button>}
      data={[]}
      columns={BASE_COLUMNS}
      emptyMessage="No users found. Try a different search."
      totalItems={0}
      totalPages={0}
      page={1}
      perPage={10}
    />
  ),
};

export const NoAddButton: Story = {
  name: 'No add button (read-only page)',
  args: {},
  render: () => <InteractiveListPage />,
};
