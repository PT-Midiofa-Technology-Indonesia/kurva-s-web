import type { Meta, StoryObj } from '@storybook/nextjs';
import { BarChart2, Clock, FileText, Users } from 'lucide-react';
import { useState } from 'react';
import { Tabs } from './Tabs';
import type { TabItem } from './types';

const meta = {
  title: 'Molecules/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Static content ───────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    items: [
      {
        key: 'overview',
        label: 'Overview',
        content: <p className="p-6 text-sm text-slate-600">Overview content</p>,
      },
      {
        key: 'details',
        label: 'Details',
        content: <p className="p-6 text-sm text-slate-600">Details content</p>,
      },
      {
        key: 'history',
        label: 'History',
        content: <p className="p-6 text-sm text-slate-600">History content</p>,
      },
      {
        key: 'settings',
        label: 'Settings',
        content: <p className="p-6 text-sm text-slate-600">Settings content</p>,
      },
    ],
  },
};

// ─── With icons ───────────────────────────────────────────────────────────────

export const WithIcons: Story = {
  args: {
    items: [
      {
        key: 'overview',
        label: 'Overview',
        leftIcon: <BarChart2 className="w-4 h-4" />,
        content: <p className="p-6 text-sm text-slate-600">Overview</p>,
      },
      {
        key: 'members',
        label: 'Members',
        leftIcon: <Users className="w-4 h-4" />,
        content: <p className="p-6 text-sm text-slate-600">Members</p>,
      },
      {
        key: 'documents',
        label: 'Documents',
        leftIcon: <FileText className="w-4 h-4" />,
        content: <p className="p-6 text-sm text-slate-600">Documents</p>,
      },
      {
        key: 'activity',
        label: 'Activity',
        leftIcon: <Clock className="w-4 h-4" />,
        content: <p className="p-6 text-sm text-slate-600">Activity</p>,
      },
    ],
  },
};

// ─── Loading state per tab ────────────────────────────────────────────────────

export const LoadingTab: Story = {
  name: 'Loading State',
  args: {
    defaultActiveKey: 'details',
    items: [
      {
        key: 'overview',
        label: 'Overview',
        content: <p className="p-6 text-sm text-slate-600">Ready</p>,
      },
      {
        key: 'details',
        label: 'Details',
        isLoading: true,
        content: <p className="p-6">Will not render while loading</p>,
      },
    ],
  },
};

// ─── Dynamic fetch per tab ────────────────────────────────────────────────────

export const WithLazyFetch: Story = {
  name: 'Lazy Fetch per Tab',
  args: { items: [] },
  render: () => {
    const LazyDemo = () => {
      const [detailsLoading, setDetailsLoading] = useState(false);
      const [detailsData, setDetailsData] = useState<string | null>(null);
      const [historyLoading, setHistoryLoading] = useState(false);
      const [historyData, setHistoryData] = useState<string | null>(null);

      const handleChange = (key: string) => {
        if (key === 'details' && detailsData === null && !detailsLoading) {
          setDetailsLoading(true);
          setTimeout(() => {
            setDetailsData('Fetched details');
            setDetailsLoading(false);
          }, 1500);
        }
        if (key === 'history' && historyData === null && !historyLoading) {
          setHistoryLoading(true);
          setTimeout(() => {
            setHistoryData('Fetched history');
            setHistoryLoading(false);
          }, 2000);
        }
      };

      const items: TabItem[] = [
        {
          key: 'overview',
          label: 'Overview',
          content: <p className="p-6 text-sm text-slate-600">Static — always available.</p>,
        },
        {
          key: 'details',
          label: 'Details',
          isLoading: detailsLoading,
          content: <p className="p-6 text-sm text-slate-600">{detailsData}</p>,
        },
        {
          key: 'history',
          label: 'History',
          isLoading: historyLoading,
          content: <p className="p-6 text-sm text-slate-600">{historyData}</p>,
        },
        {
          key: 'settings',
          label: 'Settings',
          content: <p className="p-6 text-sm text-slate-600">Static settings.</p>,
        },
      ];

      return (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <Tabs items={items} onChange={handleChange} />
          <p className="px-6 pb-4 text-xs text-slate-400">
            Switch to Details (1.5 s) or History (2 s) to trigger a simulated fetch. Switching back
            won&apos;t re-fetch.
          </p>
        </div>
      );
    };
    return <LazyDemo />;
  },
};

// ─── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
  args: { items: [] },
  render: () => {
    const ControlledDemo = () => {
      const [activeKey, setActiveKey] = useState('overview');
      const items: TabItem[] = [
        {
          key: 'overview',
          label: 'Overview',
          content: <p className="p-6 text-sm text-slate-600">Overview</p>,
        },
        {
          key: 'details',
          label: 'Details',
          content: <p className="p-6 text-sm text-slate-600">Details</p>,
        },
        {
          key: 'history',
          label: 'History',
          content: <p className="p-6 text-sm text-slate-600">History</p>,
        },
      ];
      return (
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {items.map((i) => (
              <button
                type="button"
                key={i.key}
                onClick={() => setActiveKey(i.key)}
                className="px-3 py-1 text-xs border rounded-lg border-slate-200 hover:bg-slate-50"
              >
                Jump to {i.label}
              </button>
            ))}
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <Tabs items={items} activeKey={activeKey} onChange={setActiveKey} />
          </div>
        </div>
      );
    };
    return <ControlledDemo />;
  },
};
