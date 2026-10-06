import type { Meta, StoryObj } from '@storybook/nextjs';
import { Award } from 'lucide-react';
import { WeightSlider } from './WeightSlider';

const meta = {
  title: 'Molecules/WeightSlider',
  component: WeightSlider,
} satisfies Meta<typeof WeightSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Produktivitas',
    value: 50,
    icon: <Award className="h-5 w-5 text-cyan-600" />,
    min: 0,
    max: 100,
    onChange: () => {},
  },
};
