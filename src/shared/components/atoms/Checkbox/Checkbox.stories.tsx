import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    description: { control: 'text' },
    error: { control: 'text' },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Accept terms',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox size="sm" label="Small checkbox" defaultChecked />
      <Checkbox size="md" label="Medium checkbox" defaultChecked />
      <Checkbox size="lg" label="Large checkbox" defaultChecked />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Indeterminate" checked="indeterminate" />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled & Checked" disabled defaultChecked />
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox
        label="Marketing emails"
        description="Receive updates about new features and products"
      />
      <Checkbox
        label="Newsletter"
        description="Stay informed with our weekly digest"
        defaultChecked
      />
      <Checkbox label="Push notifications" description="Get instant notifications on your device" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Checkbox label="Accept terms" error="You must accept the terms to continue" />
      <Checkbox
        label="Privacy policy"
        error="This field is required"
        description="We respect your privacy"
      />
    </div>
  ),
};

export const CustomCheckbox: Story = {
  render: function Render() {
    const [checked, setChecked] = useState<boolean | 'indeterminate'>(false);

    return (
      <div className="flex flex-col gap-4">
        <Checkbox
          label="Custom state"
          checked={checked}
          onCheckedChange={(detail) => setChecked(detail as boolean | 'indeterminate')}
        />
        <p className="text-sm text-slate-500">
          Checked: {checked === true ? 'Yes' : checked === 'indeterminate' ? 'Indeterminate' : 'No'}
        </p>
      </div>
    );
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Small</h3>
        <Checkbox size="sm" label="Unchecked" />
        <Checkbox size="sm" label="Checked" defaultChecked />
        <Checkbox size="sm" label="Disabled" disabled />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Medium</h3>
        <Checkbox size="md" label="Unchecked" />
        <Checkbox size="md" label="Checked" defaultChecked />
        <Checkbox size="md" label="Disabled" disabled />
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Large</h3>
        <Checkbox size="lg" label="Unchecked" />
        <Checkbox size="lg" label="Checked" defaultChecked />
        <Checkbox size="lg" label="Disabled" disabled />
      </div>
    </div>
  ),
};
