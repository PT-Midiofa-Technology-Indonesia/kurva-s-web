import type { Meta, StoryObj } from '@storybook/nextjs';
import { AuthInitializer } from './index';

const meta = {
  title: 'Organisms/AuthInitializer',
  component: AuthInitializer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AuthInitializer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
