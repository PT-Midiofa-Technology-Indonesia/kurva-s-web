import type { Meta, StoryObj } from '@storybook/nextjs';
import { NetworkStatusNotifier } from './index';

const meta = {
  title: 'Organisms/NetworkStatusNotifier',
  component: NetworkStatusNotifier,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof NetworkStatusNotifier>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
