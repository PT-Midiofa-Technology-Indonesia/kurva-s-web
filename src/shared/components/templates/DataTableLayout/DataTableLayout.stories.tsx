'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import type { ColumnDef } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Input } from '@/components/atoms/Input';
import { AsyncSelect, type SelectOption } from '@/components/atoms/Select';
import type { DataTableLayoutProps } from './DataTableLayout';
import { DataTableLayout } from './DataTableLayout';

// ─── Shared data ─────────────────────────────────────────────────────────────

type Employee = {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
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

const columns: ColumnDef<Employee>[] = [
  { accessorKey: 'id', header: 'ID', size: 60 },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'status', header: 'Status', cell: statusCell },
  { accessorKey: 'joined', header: 'Joined' },
];

// ─── Concrete wrapper for Storybook ──────────────────────────────────────────

function EmployeeDataTableLayout(props: DataTableLayoutProps<Employee, string>) {
  return <DataTableLayout {...props} />;
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Templates/DataTableLayout',
  component: EmployeeDataTableLayout,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof EmployeeDataTableLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ─────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    data: employees,
    columns,
    enablePagination: true,
  },
};

export const WithSearchFilter: Story = {
  args: { data: employees, columns },
  render: () => {
    const [search, setSearch] = useState('');

    const filtered = useMemo(
      () =>
        employees.filter(
          (e) =>
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.email.toLowerCase().includes(search.toLowerCase())
        ),
      [search]
    );

    return (
      <DataTableLayout
        data={filtered}
        columns={columns}
        enablePagination
        containerClassName="space-y-4"
        filter={
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="size-4" />}
            className="max-w-xs"
          />
        }
      />
    );
  },
};

export const WithSelectFilters: Story = {
  args: { data: employees, columns },
  render: () => {
    const [department, setDepartment] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    const departmentOptions: SelectOption[] = [
      { label: 'Engineering', value: 'Engineering' },
      { label: 'Design', value: 'Design' },
      { label: 'Product', value: 'Product' },
      { label: 'Marketing', value: 'Marketing' },
      { label: 'HR', value: 'HR' },
    ];

    const statusOptions: SelectOption[] = [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ];

    const filtered = useMemo(
      () =>
        employees.filter(
          (e) => (!department || e.department === department) && (!status || e.status === status)
        ),
      [department, status]
    );

    return (
      <DataTableLayout
        data={filtered}
        columns={columns}
        enablePagination
        containerClassName="space-y-4"
        filter={
          <div className="flex items-center gap-3">
            <AsyncSelect
              placeholder="All departments"
              options={departmentOptions}
              value={department}
              onChange={(val) => setDepartment(val as string | null)}
              isClearable
              className="w-48"
            />
            <AsyncSelect
              placeholder="All statuses"
              options={statusOptions}
              value={status}
              onChange={(val) => setStatus(val as string | null)}
              isClearable
              className="w-40"
            />
          </div>
        }
      />
    );
  },
};

export const WithSearchAndSelectFilters: Story = {
  args: { data: employees, columns },
  render: () => {
    const [search, setSearch] = useState('');
    const [department, setDepartment] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);

    const departmentOptions: SelectOption[] = [
      { label: 'Engineering', value: 'Engineering' },
      { label: 'Design', value: 'Design' },
      { label: 'Product', value: 'Product' },
      { label: 'Marketing', value: 'Marketing' },
      { label: 'HR', value: 'HR' },
    ];

    const statusOptions: SelectOption[] = [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ];

    const filtered = useMemo(
      () =>
        employees.filter(
          (e) =>
            (e.name.toLowerCase().includes(search.toLowerCase()) ||
              e.email.toLowerCase().includes(search.toLowerCase())) &&
            (!department || e.department === department) &&
            (!status || e.status === status)
        ),
      [search, department, status]
    );

    return (
      <DataTableLayout
        data={filtered}
        columns={columns}
        enablePagination
        containerClassName="space-y-4"
        filter={
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="size-4" />}
              className="w-64"
            />
            <AsyncSelect
              placeholder="All departments"
              options={departmentOptions}
              value={department}
              onChange={(val) => setDepartment(val as string | null)}
              isClearable
              className="w-48"
            />
            <AsyncSelect
              placeholder="All statuses"
              options={statusOptions}
              value={status}
              onChange={(val) => setStatus(val as string | null)}
              isClearable
              className="w-40"
            />
          </div>
        }
      />
    );
  },
};

export const WithInfiniteScroll: Story = {
  args: { data: employees, columns },
  render: () => {
    const pageSize = 4;
    const [search, setSearch] = useState('');
    const [visibleData, setVisibleData] = useState<Employee[]>(employees.slice(0, pageSize));
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
    const hasNextPage = visibleData.length < employees.length;

    const handleLoadMore = () => {
      if (isFetchingNextPage) return;
      setIsFetchingNextPage(true);
      setTimeout(() => {
        setVisibleData((prev) => employees.slice(0, prev.length + pageSize));
        setIsFetchingNextPage(false);
      }, 800);
    };

    const filtered = useMemo(
      () =>
        visibleData.filter(
          (e) =>
            e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.email.toLowerCase().includes(search.toLowerCase())
        ),
      [visibleData, search]
    );

    return (
      <DataTableLayout
        data={filtered}
        columns={columns}
        enableInfiniteScroll
        onLoadMore={handleLoadMore}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        enableColumnDnd={false}
        containerClassName="space-y-4"
        filter={
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="size-4" />}
            className="max-w-xs"
          />
        }
      />
    );
  },
};

export const NoFilter: Story = {
  args: {
    data: employees,
    columns,
    enablePagination: true,
    enableRowSelection: true,
    pageSizeOptions: [5, 10, 20],
  },
};
