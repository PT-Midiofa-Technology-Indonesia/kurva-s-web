import type { Meta, StoryObj } from '@storybook/nextjs';
import { Eye, Lock, Mail, Search } from 'lucide-react';
import { Input } from './Input';

const meta = {
  title: 'Atoms/Input',
  component: Input,
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
    showLabel: { control: 'boolean' },
    showHint: { control: 'boolean' },
    leftIcon: { control: false },
    rightIcon: { control: false },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
  },
};

export const Required: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    required: true,
  },
};

export const WithHint: Story = {
  args: {
    label: 'Username',
    placeholder: 'your_username',
    hint: '3-20 characters, letters and numbers only',
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    leftIcon: <Mail size={16} />,
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    rightIcon: <Eye size={16} />,
  },
};

export const WithBothIcons: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    leftIcon: <Search size={16} />,
    rightIcon: <Lock size={16} />,
  },
};

export const ErrorState: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    error: 'Invalid email format',
  },
};

export const ErrorWithIcon: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    leftIcon: <Mail size={16} />,
    error: 'This email is already taken',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    disabled: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="w-80 flex flex-col gap-4">
      <Input label="Default" placeholder="Default input" />
      <Input label="With hint" placeholder="your_username" hint="3-20 characters" />
      <Input label="With error" placeholder="you@example.com" error="Invalid email format" />
      <Input label="Disabled" placeholder="Cannot edit" disabled />
      <Input label="With icon" placeholder="Search..." leftIcon={<Search size={16} />} />
    </div>
  ),
};
