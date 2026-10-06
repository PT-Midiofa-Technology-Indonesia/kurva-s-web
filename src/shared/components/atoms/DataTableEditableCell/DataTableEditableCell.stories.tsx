'use client';

import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { DataTableEditableCell } from './DataTableEditableCell';

const ALL_DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'HR',
  'Finance',
  'Legal',
  'Sales',
  'Support',
  'Operations',
];

const ALL_ROLES = [
  'Engineer',
  'Senior Engineer',
  'Staff Engineer',
  'Principal Engineer',
  'Designer',
  'UX Researcher',
  'Product Manager',
  'Associate PM',
  'Marketing Lead',
  'Content Writer',
  'HR Manager',
  'DevOps Engineer',
];

const OPTS_PER_PAGE = 4;

// Required-prop stubs for render-only stories
const NOOP_ARGS = {
  value: '',
  editType: 'input' as const,
  onSave: () => {},
  onCancel: () => {},
};

const meta = {
  title: 'Atoms/DataTableEditableCell',
  component: DataTableEditableCell,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story: React.ComponentType) => (
      <div className="w-64 rounded border bg-background p-2">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DataTableEditableCell>;

export default meta;
type Story = StoryObj<typeof meta>;

function SavedValue({ label, onEdit }: { label: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <button type="button" onClick={onEdit} className="text-xs text-primary underline">
        Edit
      </button>
    </div>
  );
}

export const InputEdit: Story = {
  args: NOOP_ARGS,
  render: () => {
    const [value, setValue] = useState('Alice Johnson');
    const [editing, setEditing] = useState(true);

    if (!editing) {
      return <SavedValue label={value} onEdit={() => setEditing(true)} />;
    }
    return (
      <DataTableEditableCell
        value={value}
        editType="input"
        onSave={(v) => {
          setValue(String(v));
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  },
};

export const SelectEdit: Story = {
  args: NOOP_ARGS,
  render: () => {
    const options = ALL_DEPARTMENTS.map((d) => ({ value: d, label: d }));
    const [value, setValue] = useState('Engineering');
    const [editing, setEditing] = useState(true);

    if (!editing) {
      return <SavedValue label={value} onEdit={() => setEditing(true)} />;
    }
    return (
      <DataTableEditableCell
        value={value}
        editType="select"
        selectOptions={options}
        onSave={(v) => {
          setValue(String(v));
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  },
};

export const SelectWithInfiniteScroll: Story = {
  args: NOOP_ARGS,
  render: () => {
    const [value, setValue] = useState('Engineering');
    const [editing, setEditing] = useState(true);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const options = ALL_DEPARTMENTS.slice(0, page * OPTS_PER_PAGE).map((d) => ({
      value: d,
      label: d,
    }));
    const hasNextPage = options.length < ALL_DEPARTMENTS.length;

    const handleLoadMore = () => {
      if (loading || !hasNextPage) return;
      setLoading(true);
      setTimeout(() => {
        setPage((p) => p + 1);
        setLoading(false);
      }, 600);
    };

    if (!editing) {
      return (
        <SavedValue
          label={value}
          onEdit={() => {
            setPage(1);
            setEditing(true);
          }}
        />
      );
    }
    return (
      <DataTableEditableCell
        value={value}
        editType="select"
        selectOptions={options}
        selectHasNextPage={hasNextPage}
        selectOnLoadMore={handleLoadMore}
        onSave={(v) => {
          setValue(String(v));
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  },
};

export const AsyncSelectEdit: Story = {
  args: NOOP_ARGS,
  render: () => {
    const [value, setValue] = useState('Engineer');
    const [editing, setEditing] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const filtered = ALL_ROLES.filter((r) => r.toLowerCase().includes(search.toLowerCase()));
    const options = filtered.slice(0, page * OPTS_PER_PAGE).map((r) => ({ value: r, label: r }));
    const hasNextPage = options.length < filtered.length;

    const handleSearch = (q: string) => {
      setSearch(q);
      setPage(1);
    };

    const handleLoadMore = () => {
      if (loading || !hasNextPage) return;
      setLoading(true);
      setTimeout(() => {
        setPage((p) => p + 1);
        setLoading(false);
      }, 600);
    };

    if (!editing) {
      return (
        <SavedValue
          label={value}
          onEdit={() => {
            setSearch('');
            setPage(1);
            setEditing(true);
          }}
        />
      );
    }
    return (
      <DataTableEditableCell
        value={value}
        editType="async-select"
        selectOptions={options}
        selectHasNextPage={hasNextPage}
        selectOnLoadMore={handleLoadMore}
        selectOnSearch={handleSearch}
        onSave={(v) => {
          setValue(String(v));
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  },
};

export const DateEdit: Story = {
  args: NOOP_ARGS,
  render: () => {
    const [value, setValue] = useState('2021-03-15');
    const [editing, setEditing] = useState(true);

    if (!editing) {
      return <SavedValue label={value} onEdit={() => setEditing(true)} />;
    }
    return (
      <DataTableEditableCell
        value={value}
        editType="date"
        onSave={(v) => {
          setValue(String(v));
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  },
};
