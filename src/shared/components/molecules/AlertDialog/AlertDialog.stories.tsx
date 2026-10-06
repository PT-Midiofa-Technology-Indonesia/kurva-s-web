import type { Meta, StoryObj } from '@storybook/nextjs';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { ConfirmDialog } from './AlertDialog';

const meta = {
  title: 'Molecules/AlertDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['default', 'danger', 'success', 'warning'] },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    open: { control: false },
    onOpenChange: { control: false },
    trigger: { control: false },
    icon: { control: false },
    onCancel: { control: false },
    onConfirm: { control: false },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Are you sure?',
    description: 'This action cannot be undone.',
    cancelText: 'Cancel',
    confirmText: 'Confirm',
    trigger: <Button variant="outline">Open Dialog</Button>,
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    title: 'Delete Item',
    description: 'Are you sure you want to delete this item? This action cannot be undone.',
    cancelText: 'Cancel',
    confirmText: 'Delete',
    trigger: <Button variant="destructive">Delete</Button>,
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success',
    description: 'Your changes have been saved successfully.',
    cancelText: 'Close',
    confirmText: 'OK',
    trigger: <Button>Save Changes</Button>,
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    description: 'Please review your changes before proceeding.',
    cancelText: 'Go Back',
    confirmText: 'Continue',
    trigger: <Button variant="outline">Submit</Button>,
  },
};

export const Loading: Story = {
  args: {
    title: 'Processing',
    description: 'Please wait while we process your request.',
    isLoading: true,
    trigger: <Button variant="outline">Open Dialog</Button>,
  },
};

export const Disabled: Story = {
  args: {
    title: 'Disabled Action',
    description: 'The confirm button is disabled.',
    disabled: true,
    trigger: <Button variant="outline">Open Dialog</Button>,
  },
};

export const CustomIcon: Story = {
  args: {
    variant: 'warning',
    icon: <AlertTriangle className="size-4 text-amber-600" />,
    title: 'Custom Icon',
    description: 'This dialog uses a custom icon.',
    trigger: <Button variant="outline">Open Dialog</Button>,
  },
};

export const Interactive: Story = {
  args: {
    title: 'Delete Item',
    description: 'Are you sure you want to delete this item?',
  },
  render: () => {
    const InteractiveDemo = () => {
      const [open, setOpen] = useState(false);
      const [result, setResult] = useState<string>('');

      return (
        <div className="flex flex-col items-center gap-4">
          <ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            variant="danger"
            title="Delete Item"
            description="Are you sure you want to delete this item?"
            cancelText="Cancel"
            confirmText="Delete"
            onCancel={() => setResult('Cancelled')}
            onConfirm={() => {
              setResult('Deleted');
              setOpen(false);
            }}
            trigger={<Button variant="destructive">Delete</Button>}
          />
          {result && (
            <p className="text-sm text-muted-foreground">
              Last action: <span className="font-medium">{result}</span>
            </p>
          )}
        </div>
      );
    };

    return <InteractiveDemo />;
  },
};

export const AllVariants: Story = {
  args: {
    title: 'Dialog',
  },
  render: () => {
    const AllVariantsDemo = () => {
      return (
        <div className="flex flex-wrap gap-4">
          <ConfirmDialog
            variant="default"
            title="Are you sure?"
            description="This action cannot be undone."
            trigger={<Button variant="outline">Default</Button>}
          />
          <ConfirmDialog
            variant="danger"
            title="Delete Item"
            description="This will permanently delete the item."
            confirmText="Delete"
            trigger={<Button variant="destructive">Danger</Button>}
          />
          <ConfirmDialog
            variant="success"
            title="Success"
            description="Your changes have been saved."
            confirmText="OK"
            trigger={<Button>Success</Button>}
          />
          <ConfirmDialog
            variant="warning"
            title="Warning"
            description="Please review before continuing."
            trigger={<Button variant="outline">Warning</Button>}
          />
        </div>
      );
    };

    return <AllVariantsDemo />;
  },
};
