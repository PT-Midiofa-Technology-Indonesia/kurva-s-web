import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Stepper } from './Stepper';

const meta = {
  title: 'Molecules/Stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultSteps = [
  { key: 'pr', label: 'Pilih PR', content: <div className="p-4">Content PR here</div> },
  { key: 'items', label: 'Pilih Items', content: <div className="p-4">Content Items here</div> },
  { key: 'comparison', label: 'Compare', content: <div className="p-4">Comparison view</div> },
  { key: 'winner', label: 'Pick Winner', content: <div className="p-4">Winner selection</div> },
  { key: 'finalize', label: 'Finalize', content: <div className="p-4">Finalize form</div> },
];

export const Default = {
  name: '5 Step Wizard',
  args: { items: defaultSteps, defaultActiveKey: 'items' },
} as Story;

export const ThreeSteps = {
  name: '3 Step Wizard',
  args: {
    items: [
      { key: 'info', label: 'Information', content: <div className="p-4">Step 1 content</div> },
      { key: 'confirm', label: 'Confirmation', content: <div className="p-4">Step 2 content</div> },
      { key: 'done', label: 'Done', content: <div className="p-4">Step 3 content</div> },
    ],
    defaultActiveKey: 'confirm',
  },
} as unknown as Story;

export const Controlled = {
  name: 'Controlled with Navigation',
  render: () => {
    const [active, setActive] = useState('info');
    const steps = [
      {
        key: 'info',
        label: 'Information',
        content: <div className="p-4">Step 1 — fill details</div>,
      },
      {
        key: 'review',
        label: 'Review',
        content: <div className="p-4">Step 2 — review details</div>,
      },
      { key: 'done', label: 'Done', content: <div className="p-4">Step 3 — complete!</div> },
    ];
    return (
      <div className="flex flex-col w-full max-w-2xl">
        <Stepper items={steps} activeKey={active} onChange={setActive} />
        <div className="flex justify-between mt-4">
          <button
            type="button"
            disabled={active === 'info'}
            onClick={() => {
              const i = steps.findIndex((s) => s.key === active);
              if (i > 0) setActive(steps[i - 1].key);
            }}
            className="px-4 py-2 rounded bg-slate-100 text-slate-700 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={active === 'done'}
            onClick={() => {
              const i = steps.findIndex((s) => s.key === active);
              if (i < steps.length - 1) setActive(steps[i + 1].key);
            }}
            className="px-4 py-2 rounded bg-brand-600 text-white text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    );
  },
} as unknown as Story;

export const ClickableSteps = {
  name: 'Clickable Completed Steps',
  render: () => {
    const [active, setActive] = useState('items');
    const steps = [
      { key: 'pr', label: 'Pilih PR', content: <div className="p-4">PR selection</div> },
      { key: 'items', label: 'Pilih Items', content: <div className="p-4">Item selection</div> },
      { key: 'compare', label: 'Comparison', content: <div className="p-4">Comparison</div> },
    ];
    return (
      <div className="w-full max-w-2xl">
        <Stepper items={steps} activeKey={active} onChange={setActive} stepClickable />
      </div>
    );
  },
} as unknown as Story;

export const WithLoading = {
  name: 'Step with Loading State',
  render: () => {
    const [active, setActive] = useState('first');
    const steps = [
      {
        key: 'first',
        label: 'First',
        content: <div className="p-4">First step ready</div>,
      },
      {
        key: 'second',
        label: 'Second',
        isLoading: active === 'second',
        content: <div className="p-4">Second step loaded</div>,
      },
      {
        key: 'third',
        label: 'Third',
        content: <div className="p-4">Third step</div>,
      },
    ];
    return (
      <div className="w-full max-w-2xl">
        <Stepper items={steps} activeKey={active} onChange={setActive} />
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => setActive(active === 'first' ? 'second' : 'first')}
            className="px-4 py-2 rounded bg-brand-600 text-white text-sm"
          >
            Toggle Loading
          </button>
        </div>
      </div>
    );
  },
} as unknown as Story;
