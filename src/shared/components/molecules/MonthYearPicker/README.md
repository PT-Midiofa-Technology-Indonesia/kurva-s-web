# MonthYearPicker

Month and year selector component for Curva-S. Built on shadcn/ui primitives (Popover + Button) with custom month grid.

## Features

- **Month grid display**: 12 months in 3×4 grid
- **Year dropdown**: Navigate years with native select
- **Default range**: Last 3 years to current year
- **Date-fns formatting**: Returns first day of selected month as Date object
- **react-hook-form ready**: Built-in error state support
- **Accessible**: Keyboard navigation, focus management

## Usage

### Basic

```tsx
import { MonthYearPicker } from '@/shared/components/molecules/MonthYearPicker';

function MyComponent() {
  const [date, setDate] = useState<Date>();

  return (
    <MonthYearPicker
      value={date}
      onChange={setDate}
      placeholder="Select month"
    />
  );
}
```

### With react-hook-form

```tsx
import { Controller, useForm } from 'react-hook-form';
import { MonthYearPicker } from '@/shared/components/molecules/MonthYearPicker';

interface FormData {
  reportMonth: Date;
}

function MyForm() {
  const { control, formState: { errors } } = useForm<FormData>();

  return (
    <Controller
      name="reportMonth"
      control={control}
      rules={{ required: 'Month is required' }}
      render={({ field }) => (
        <MonthYearPicker
          value={field.value}
          onChange={field.onChange}
          error={!!errors.reportMonth}
        />
      )}
    />
  );
}
```

### Custom year range

```tsx
<MonthYearPicker
  value={date}
  onChange={setDate}
  fromYear={2020}
  toYear={2025}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| undefined` | - | Selected date (first day of month) |
| `onChange` | `(date: Date) => void` | - | Callback when month selected |
| `fromYear` | `number` | `currentYear - 3` | Start year of range |
| `toYear` | `number` | `currentYear` | End year of range |
| `placeholder` | `string` | `'Pick month'` | Button placeholder text |
| `className` | `string` | - | Additional CSS classes for button |
| `disabled` | `boolean` | `false` | Disable picker |
| `error` | `boolean` | `false` | Show error state (red border + ring) |

## Return Value

`onChange` receives a `Date` object set to the **first day** of the selected month at 00:00:00 local time.

Example: Selecting "Aug 2026" returns `new Date(2026, 7, 1)` → `2026-08-01T00:00:00`.

## Architecture

- **Atomic Design**: Molecule (composed of Button + Popover atoms)
- **No Calendar component**: Custom month grid for cleaner UX (no day selection needed)
- **date-fns utilities**: `setMonth`, `setYear`, `startOfMonth`, `format`
- **Controlled state**: Internal year/month state syncs with `value` prop

## Styling

Error state auto-applies destructive styles:
```tsx
error && 'border-destructive ring-3 ring-destructive/20'
```

Current month highlighted with accent background. Selected month uses primary color.

## Files

```
MonthYearPicker/
├── MonthYearPicker.tsx          # Main component
├── MonthYearPicker.stories.tsx  # Storybook demos
├── MonthYearPickerFormExample.tsx  # react-hook-form integration example
├── index.ts                     # Barrel export
└── README.md                    # This file
```
