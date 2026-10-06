import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { InputNumber } from './InputNumber';

const meta = {
  title: 'Atoms/Input/InputNumber',
  component: InputNumber,
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
    allowNegative: { control: 'boolean' },
    decimalPlaces: { control: 'number' },
    showLabel: { control: 'boolean' },
    showHint: { control: 'boolean' },
  },
} satisfies Meta<typeof InputNumber>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter number...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Quantity',
    placeholder: '0',
  },
};

export const Required: Story = {
  args: {
    label: 'Quantity',
    placeholder: '0',
    required: true,
  },
};

export const WithHint: Story = {
  args: {
    label: 'Weight',
    placeholder: '0.00',
    hint: 'Enter weight in kilograms',
  },
};

export const WithDecimalPlaces: Story = {
  args: {
    label: 'Price',
    placeholder: '0.000',
    decimalPlaces: 3,
  },
};

export const AllowNegative: Story = {
  args: {
    label: 'Temperature',
    placeholder: '-0.00',
    allowNegative: true,
    hint: 'Negative values allowed',
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Quantity',
    placeholder: '0',
    error: 'Please enter a valid number',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Quantity',
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
          <InputNumber
            label="Number Input"
            placeholder="Enter a number"
            value={value}
            onChange={setValue}
            hint={`Current value: ${value ?? 'none'}`}
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
      const [val2, setVal2] = useState<number | undefined>(123.45);

      return (
        <div className="flex flex-col gap-4">
          <InputNumber label="Default" placeholder="Enter number" />
          <InputNumber label="With hint" placeholder="0.00" hint="Two decimal places" />
          <InputNumber
            label="With value"
            value={val2}
            onChange={setVal2}
            hint={`Value: ${val2 ?? 'none'}`}
          />
          <InputNumber label="With error" placeholder="0" error="Invalid number" />
          <InputNumber label="Disabled" placeholder="0" disabled />
          <InputNumber label="Negative allowed" placeholder="-0.00" allowNegative />
        </div>
      );
    };

    return <AllStatesDemo />;
  },
};
