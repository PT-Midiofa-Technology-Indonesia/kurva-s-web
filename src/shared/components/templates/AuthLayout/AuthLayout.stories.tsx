import type { Meta, StoryObj } from '@storybook/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui';
import { AuthLayout } from './AuthLayout';

const meta = {
  title: 'Templates/AuthLayout',
  component: AuthLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Please sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-9 rounded-md border border-slate-300 bg-white" />
          </div>
        </CardContent>
      </Card>
    ),
  },
};
