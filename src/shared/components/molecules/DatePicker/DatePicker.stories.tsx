import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import type { DateRange as RDPDateRange } from 'react-day-picker';
import { DatePicker } from './DatePicker';

const meta = {
  title: 'Molecules/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    mode: { control: 'radio', options: ['single', 'range', 'month'] },
    disabledState: { control: 'boolean' },
    minDate: { control: false },
    maxDate: { control: false },
    disabled: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    onChange: { control: false },
    footer: { control: false },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Pick a date',
  },
};

export const WithDefaultValue: Story = {
  args: {
    defaultValue: new Date(),
    placeholder: 'Pick a date',
  },
};

export const Controlled: Story = {
  render: () => {
    const ControlledDemo = () => {
      const [date, setDate] = useState<Date | RDPDateRange | undefined>(undefined);

      return (
        <div className="flex flex-col gap-4">
          <DatePicker
            mode="single"
            value={date}
            onChange={(v) => setDate(v as Date | undefined)}
            placeholder="Select a date"
          />
          <p className="text-xs text-muted-foreground">
            Selected: {date instanceof Date ? date.toDateString() : 'none'}
          </p>
        </div>
      );
    };

    return <ControlledDemo />;
  },
};

export const MinDate: Story = {
  args: {
    minDate: new Date(),
    placeholder: 'Select future date',
  },
};

export const MaxDate: Story = {
  args: {
    maxDate: new Date(),
    placeholder: 'Select past date',
  },
};

export const DateRange: Story = {
  args: {
    mode: 'range',
    placeholder: 'Start date',
    rangePlaceholder: 'Select date range',
  },
};

export const DateRangeWithDefaults: Story = {
  args: {
    mode: 'range',
    defaultValue: {
      from: new Date(2026, 0, 1),
      to: new Date(2026, 0, 15),
    } as RDPDateRange,
    placeholder: 'Start date',
    rangePlaceholder: 'Select date range',
  },
};

export const DateRangeControlled: Story = {
  render: () => {
    const RangeDemo = () => {
      const [range, setRange] = useState<RDPDateRange | undefined>(undefined);

      return (
        <div className="flex flex-col gap-4">
          <DatePicker
            mode="range"
            value={range}
            onChange={(v) => setRange(v as RDPDateRange | undefined)}
            placeholder="Start date"
            rangePlaceholder="Select date range"
          />
          <p className="text-xs text-muted-foreground">
            Selected: {(range as RDPDateRange)?.from?.toDateString()} -{' '}
            {(range as RDPDateRange)?.to?.toDateString() ?? '...'}
          </p>
        </div>
      );
    };

    return <RangeDemo />;
  },
};

export const Disabled: Story = {
  args: {
    disabledState: true,
    placeholder: 'Cannot select',
  },
};

export const DisabledWeekends: Story = {
  args: {
    disabled: (date: Date) => date.getDay() === 0 || date.getDay() === 6,
    placeholder: 'No weekends',
  },
};

export const MinAndMaxDate: Story = {
  args: {
    minDate: new Date(2026, 0, 1),
    maxDate: new Date(2026, 11, 31),
    placeholder: 'Select in 2026',
  },
};

export const WithFooter: Story = {
  args: {
    footer: <p className="px-2 py-1 text-xs text-muted-foreground">Footer content</p>,
    placeholder: 'Pick a date',
  },
};

export const WithNavigation: Story = {
  render: () => {
    const NavigationDemo = () => {
      const [date, setDate] = useState<Date | undefined>(undefined);

      return (
        <div className="flex flex-col gap-4">
          <DatePicker
            mode="single"
            value={date}
            onChange={(v) => setDate(v as Date | undefined)}
            placeholder="Pick a date"
          />
          <p className="text-xs text-muted-foreground">Use header to switch month/year</p>
        </div>
      );
    };

    return <NavigationDemo />;
  },
};

export const AllStates: Story = {
  render: () => {
    const AllStatesDemo = () => {
      const [val1, setVal1] = useState<Date | RDPDateRange | undefined>(undefined);
      const [val2, setVal2] = useState<RDPDateRange | undefined>(undefined);

      return (
        <div className="flex flex-col gap-4">
          <DatePicker placeholder="Default" />
          <DatePicker defaultValue={new Date()} placeholder="With default" />
          <DatePicker
            value={val1}
            onChange={(v) => setVal1(v as Date | undefined)}
            placeholder="Controlled"
          />
          <DatePicker minDate={new Date()} placeholder="Min date (today)" />
          <DatePicker maxDate={new Date()} placeholder="Max date (today)" />
          <DatePicker
            disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
            placeholder="No weekends"
          />
          <DatePicker mode="range" placeholder="Range" />
          <DatePicker mode="month" placeholder="Month and year" />
          <DatePicker
            mode="range"
            value={val2}
            onChange={(v) => setVal2(v as RDPDateRange | undefined)}
            placeholder="Range"
            rangePlaceholder="Select date range"
          />
          <DatePicker disabledState placeholder="Disabled" />
        </div>
      );
    };

    return <AllStatesDemo />;
  },
};
