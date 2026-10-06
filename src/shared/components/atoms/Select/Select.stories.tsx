import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { AsyncSelect, SelectGroup, SelectOption, SelectValue } from './Select';

const meta = {
  title: 'Atoms/Select',
  component: AsyncSelect,
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
    isMulti: { control: 'boolean' },
    isClearable: { control: 'boolean' },
    isSearchable: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    isCreatable: { control: 'boolean' },
    invalid: { control: 'boolean' },
    size: { control: 'select', options: ['sm', 'default', 'lg'] },
    options: { control: false },
    groups: { control: false },
    value: { control: false },
    defaultValue: { control: false },
    onChange: { control: false },
    onCreateOption: { control: false },
  },
} satisfies Meta<typeof AsyncSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions: SelectOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew' },
];

const groupedOptions: SelectGroup[] = [
  {
    heading: 'Fruits',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
    ],
  },
  {
    heading: 'Vegetables',
    options: [
      { value: 'carrot', label: 'Carrot' },
      { value: 'broccoli', label: 'Broccoli' },
      { value: 'spinach', label: 'Spinach' },
    ],
  },
];

const countryOptions: SelectOption[] = [
  { value: 'id', label: '🇮🇩 Indonesia' },
  { value: 'us', label: '🇺🇸 United States' },
  { value: 'jp', label: '🇯🇵 Japan' },
  { value: 'de', label: '🇩🇪 Germany' },
  { value: 'fr', label: '🇫🇷 France' },
  { value: 'gb', label: '🇬🇧 United Kingdom' },
  { value: 'au', label: '🇦🇺 Australia' },
  { value: 'ca', label: '🇨🇦 Canada' },
  { value: 'sg', label: '🇸🇬 Singapore' },
  { value: 'kr', label: '🇰🇷 South Korea' },
];

export const Default: Story = {
  args: {
    options: sampleOptions,
    placeholder: 'Select a fruit...',
  },
};

export const WithLabel: Story = {
  render: () => {
    const WithLabelDemo = () => {
      const [value, setValue] = useState<SelectValue>(null);

      return (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Fruit</label>
          <AsyncSelect
            options={sampleOptions}
            value={value}
            onChange={setValue}
            placeholder="Select a fruit..."
          />
        </div>
      );
    };

    return <WithLabelDemo />;
  },
};

export const MultiSelect: Story = {
  args: {
    options: sampleOptions,
    isMulti: true,
    placeholder: 'Select fruits...',
  },
};

export const WithDefaultValue: Story = {
  args: {
    options: sampleOptions,
    defaultValue: 'banana',
    placeholder: 'Select a fruit...',
  },
};

export const MultiWithDefaultValue: Story = {
  args: {
    options: sampleOptions,
    isMulti: true,
    defaultValue: ['apple', 'cherry'],
    placeholder: 'Select fruits...',
  },
};

export const MultiWithAllSelected: Story = {
  args: {
    options: sampleOptions,
    isMulti: true,
    defaultValue: sampleOptions.map((opt) => opt.value),
    placeholder: 'Select fruits...',
  },
};

export const WithGroups: Story = {
  args: {
    groups: groupedOptions,
    placeholder: 'Select an item...',
  },
};

export const NotClearable: Story = {
  args: {
    options: sampleOptions,
    isClearable: false,
    placeholder: 'Select a fruit...',
  },
};

export const NotSearchable: Story = {
  args: {
    options: sampleOptions,
    isSearchable: false,
    placeholder: 'Select a fruit...',
  },
};

export const Disabled: Story = {
  args: {
    options: sampleOptions,
    isDisabled: true,
    placeholder: 'Select a fruit...',
  },
};

export const Loading: Story = {
  args: {
    options: sampleOptions,
    isLoading: true,
    placeholder: 'Select a fruit...',
    loadingMessage: 'Loading options...',
  },
};

export const Creatable: Story = {
  args: {
    options: sampleOptions,
    isCreatable: true,
    placeholder: 'Select or create...',
  },
};

export const Invalid: Story = {
  args: {
    options: sampleOptions,
    invalid: true,
    placeholder: 'Select a fruit...',
  },
};

export const SmallSize: Story = {
  args: {
    options: sampleOptions,
    size: 'sm',
    placeholder: 'Select...',
  },
};

export const WithDisabledOptions: Story = {
  args: {
    options: [...sampleOptions, { value: 'kiwi', label: 'Kiwi (Disabled)', disabled: true }],
    placeholder: 'Select a fruit...',
  },
};

export const ManyOptions: Story = {
  args: {
    options: countryOptions,
    placeholder: 'Select a country...',
  },
};

export const Interactive: Story = {
  render: () => {
    const InteractiveDemo = () => {
      const [value, setValue] = useState<SelectValue>(null);

      return (
        <div className="flex flex-col gap-4">
          <AsyncSelect
            options={countryOptions}
            value={value}
            onChange={setValue}
            placeholder="Select a country..."
            isClearable
          />
          <p className="text-xs text-muted-foreground">
            Selected value: <code>{JSON.stringify(value)}</code>
          </p>
        </div>
      );
    };

    return <InteractiveDemo />;
  },
};

export const MultiInteractive: Story = {
  render: () => {
    const MultiInteractiveDemo = () => {
      const [value, setValue] = useState<SelectValue>([]);

      return (
        <div className="flex flex-col gap-4">
          <AsyncSelect
            options={countryOptions}
            value={value}
            onChange={setValue}
            isMulti
            placeholder="Select countries..."
          />
          <p className="text-xs text-muted-foreground">
            Selected values: <code>{JSON.stringify(value)}</code>
          </p>
        </div>
      );
    };

    return <MultiInteractiveDemo />;
  },
};

export const AllStates: Story = {
  render: () => {
    const AllStatesDemo = () => {
      const [val1, setVal1] = useState<SelectValue>(null);
      const [val2, setVal2] = useState<SelectValue>([]);

      return (
        <div className="flex flex-col gap-4">
          <AsyncSelect options={sampleOptions} placeholder="Default" />
          <AsyncSelect
            options={sampleOptions}
            value={val1}
            onChange={setVal1}
            placeholder="Controlled"
          />
          <AsyncSelect
            options={sampleOptions}
            value={val2}
            onChange={setVal2}
            isMulti
            defaultValue={['apple', 'banana', 'cherry', 'date', 'elderberry']}
            placeholder="Multi-select"
          />
          <AsyncSelect options={sampleOptions} defaultValue="banana" placeholder="With default" />
          <AsyncSelect groups={groupedOptions} placeholder="Grouped" />
          <AsyncSelect options={sampleOptions} isCreatable placeholder="Creatable" />
          <AsyncSelect options={sampleOptions} invalid placeholder="Invalid" />
          <AsyncSelect options={sampleOptions} isLoading placeholder="Loading" />
          <AsyncSelect options={sampleOptions} isDisabled placeholder="Disabled" />
          <AsyncSelect options={sampleOptions} size="sm" placeholder="Small" />
        </div>
      );
    };

    return <AllStatesDemo />;
  },
};
