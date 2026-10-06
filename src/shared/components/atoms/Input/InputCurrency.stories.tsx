import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { InputCurrency } from './InputCurrency';

const meta = {
  title: 'Atoms/Input/InputCurrency',
  component: InputCurrency,
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
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    locale: { control: 'select', options: ['id-ID', 'en-US', 'ja-JP', 'de-DE'] },
    decimalPlaces: { control: 'number' },
    showLabel: { control: 'boolean' },
    showHint: { control: 'boolean' },
  },
} satisfies Meta<typeof InputCurrency>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter amount...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Amount (IDR)',
    placeholder: '0',
  },
};

export const Required: Story = {
  args: {
    label: 'Amount (IDR)',
    placeholder: '0',
    required: true,
  },
};

export const WithHint: Story = {
  args: {
    label: 'Price',
    placeholder: '0',
    hint: 'Enter price in Rupiah',
  },
};

export const IndonesianLocale: Story = {
  args: {
    label: 'Price (IDR)',
    placeholder: '0',
    locale: 'id-ID',
    hint: 'Format: 1.000.000',
  },
};

export const USLocale: Story = {
  args: {
    label: 'Price (USD)',
    placeholder: '0',
    locale: 'en-US',
    hint: 'Format: 1,000,000',
  },
};

export const JapaneseLocale: Story = {
  args: {
    label: 'Price (JPY)',
    placeholder: '0',
    locale: 'ja-JP',
    hint: 'Format: ¥1,000,000',
  },
};

export const WithDecimalPlaces: Story = {
  args: {
    label: 'Amount',
    placeholder: '0.00',
    locale: 'en-US',
    decimalPlaces: 2,
    hint: 'Shows cents',
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Amount',
    placeholder: '0',
    error: 'Please enter a valid amount',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Amount',
    placeholder: '0',
    disabled: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const InteractiveDemo = () => {
      const [value, setValue] = useState<number | undefined>(undefined);

      return (
        <div className="flex flex-col gap-4">
          <InputCurrency
            label="Currency Input (IDR)"
            placeholder="Enter amount"
            value={value}
            onChange={setValue}
            locale="id-ID"
            hint={`Raw value: ${value ?? 'none'}`}
          />
        </div>
      );
    };

    return <InteractiveDemo />;
  },
};

export const AllStates: Story = {
  render: () => {
    const AllStatesDemo = () => {
      const [val2, setVal2] = useState<number | undefined>(1000000);

      return (
        <div className="flex flex-col gap-4">
          <InputCurrency label="Default" placeholder="Enter amount" />
          <InputCurrency label="IDR format" placeholder="0" locale="id-ID" hint="1.000.000" />
          <InputCurrency
            label="With value"
            value={val2}
            onChange={setVal2}
            locale="id-ID"
            hint={`Raw: ${val2 ?? 'none'}`}
          />
          <InputCurrency label="USD format" placeholder="0" locale="en-US" hint="1,000,000" />
          <InputCurrency label="With error" placeholder="0" error="Invalid amount" />
          <InputCurrency label="Disabled" placeholder="0" disabled />
        </div>
      );
    };

    return <AllStatesDemo />;
  },
};
