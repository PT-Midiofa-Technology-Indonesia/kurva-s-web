import type { Meta, StoryObj } from '@storybook/nextjs';
import { Text } from './Text';

const meta = {
  title: 'Atoms/Text',
  component: Text,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: [
        'xs',
        'sm',
        'base',
        'lg',
        'xl',
        '2xl',
        '3xl',
        '4xl',
        '5xl',
        '6xl',
        '7xl',
        '8xl',
        '9xl',
      ],
    },
    weight: {
      control: 'select',
      options: ['light', 'normal', 'medium', 'semibold', 'bold'],
    },
    color: {
      control: 'select',
      options: [
        'foreground',
        'muted-foreground',
        'accent',
        'accent-foreground',
        'primary',
        'primary-foreground',
        'secondary',
        'secondary-foreground',
        'destructive',
        'destructive-foreground',
      ],
    },
    as: {
      control: 'select',
      options: ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'The quick brown fox jumps over the lazy dog.',
    size: 'base',
    weight: 'normal',
    color: 'foreground',
    as: 'p',
  },
};

export const Sizes: Story = {
  args: { children: '' },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Text Sizes</h3>
      <div className="space-y-2 border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <span className="text-xs w-16">xs</span>
          <Text size="xs">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm w-16">sm</span>
          <Text size="sm">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-base w-16">base</span>
          <Text size="base">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg w-16">lg</span>
          <Text size="lg">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xl w-16">xl</span>
          <Text size="xl">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl w-16">2xl</span>
          <Text size="2xl">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-3xl w-16">3xl</span>
          <Text size="3xl">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-4xl w-16">4xl</span>
          <Text size="4xl">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-5xl w-16">5xl</span>
          <Text size="5xl">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-6xl w-16">6xl</span>
          <Text size="6xl">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-7xl w-16">7xl</span>
          <Text size="7xl">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-8xl w-16">8xl</span>
          <Text size="8xl">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-9xl w-16">9xl</span>
          <Text size="9xl">The quick brown fox</Text>
        </div>
      </div>
    </div>
  ),
};

export const Weights: Story = {
  args: { children: '' },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Text Weights</h3>
      <div className="space-y-2 border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <span className="w-20">light</span>
          <Text weight="light">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-20">normal</span>
          <Text weight="normal">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-20">medium</span>
          <Text weight="medium">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-20">semibold</span>
          <Text weight="semibold">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-20">bold</span>
          <Text weight="bold">The quick brown fox</Text>
        </div>
      </div>
    </div>
  ),
};

export const Colors: Story = {
  args: { children: '' },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Text Colors</h3>
      <div className="space-y-2 border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <span className="w-32">foreground</span>
          <Text color="foreground">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-32">muted-foreground</span>
          <Text color="muted-foreground">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-32">primary</span>
          <Text color="primary">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-32">primary-foreground</span>
          <Text color="primary-foreground">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-32">secondary</span>
          <Text color="secondary">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-32">secondary-foreground</span>
          <Text color="secondary-foreground">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-32">accent</span>
          <Text color="accent">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-32">accent-foreground</span>
          <Text color="accent-foreground">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-32">destructive</span>
          <Text color="destructive">The quick brown fox</Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-32">destructive-foreground</span>
          <Text color="destructive-foreground">The quick brown fox</Text>
        </div>
      </div>
    </div>
  ),
};

export const TypographyHeading: Story = {
  args: { children: '' },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Heading Variants</h3>
      <div className="space-y-2 border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <span className="w-16">h1</span>
          <Text as="h1" size="9xl" weight="bold">
            Heading 1
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-16">h2</span>
          <Text as="h2" size="8xl" weight="bold">
            Heading 2
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-16">h3</span>
          <Text as="h3" size="7xl" weight="bold">
            Heading 3
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-16">h4</span>
          <Text as="h4" size="6xl" weight="bold">
            Heading 4
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-16">h5</span>
          <Text as="h5" size="5xl" weight="bold">
            Heading 5
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-16">h6</span>
          <Text as="h6" size="4xl" weight="bold">
            Heading 6
          </Text>
        </div>
      </div>
    </div>
  ),
};

export const TypographyParagraph: Story = {
  args: { children: '' },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Paragraph Variants</h3>
      <div className="space-y-3 border rounded-lg p-4">
        <Text as="p" size="sm" weight="normal">
          Small paragraph - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </Text>
        <Text as="p" size="base" weight="normal">
          Base paragraph - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </Text>
        <Text as="p" size="lg" weight="normal">
          Large paragraph - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </Text>
      </div>
    </div>
  ),
};

export const TypographyInline: Story = {
  args: { children: '' },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Inline Text Variants</h3>
      <div className="space-y-2 border rounded-lg p-4">
        <div>
          <Text as="span" size="base" color="muted-foreground">
            Muted text - This is a muted text variant
          </Text>
        </div>
        <div>
          <Text as="span" size="base" color="primary">
            Primary text - This is a primary text variant
          </Text>
        </div>
        <div>
          <Text as="span" size="base" color="accent">
            Accent text - This is an accent text variant
          </Text>
        </div>
        <div>
          <Text as="span" size="base" color="destructive">
            Destructive text - This is a destructive text variant
          </Text>
        </div>
      </div>
    </div>
  ),
};

export const TypographyLabels: Story = {
  args: { children: '' },
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Label Variants</h3>
      <div className="space-y-2 border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <span className="w-20">xs bold</span>
          <Text size="xs" weight="bold">
            Label
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-20">sm bold</span>
          <Text size="sm" weight="bold">
            Label
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-20">base bold</span>
          <Text size="base" weight="bold">
            Label
          </Text>
        </div>
      </div>
    </div>
  ),
};

export const AllCombinations: Story = {
  args: { children: '' },
  render: () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">All Size + Weight Combinations</h3>
      {(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const).map(
        (size) => (
          <div key={size} className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2 capitalize">{size}</h4>
            <div className="space-y-1">
              {(['light', 'normal', 'medium', 'semibold', 'bold'] as const).map((weight) => (
                <div key={weight} className="flex items-center gap-4">
                  <span className="w-20 text-muted-foreground text-sm">{weight}</span>
                  <Text size={size} weight={weight}>
                    The quick brown fox
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  ),
};
