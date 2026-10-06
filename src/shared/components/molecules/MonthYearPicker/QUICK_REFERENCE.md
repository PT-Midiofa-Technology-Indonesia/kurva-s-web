# MonthYearPicker - Quick Reference

## Import

```tsx
import { MonthYearPicker } from '@/shared/components/molecules/MonthYearPicker';
```

## Basic Usage

```tsx
const [date, setDate] = useState<Date>();

<MonthYearPicker value={date} onChange={setDate} />
```

## With react-hook-form

```tsx
<Controller
  name="reportMonth"
  control={control}
  rules={{ required: 'Required' }}
  render={({ field }) => (
    <MonthYearPicker
      value={field.value}
      onChange={field.onChange}
      error={!!errors.reportMonth}
    />
  )}
/>
```

## Common Props

```tsx
<MonthYearPicker
  value={date}              // Date | undefined
  onChange={setDate}        // (date: Date) => void
  fromYear={2020}           // number (default: currentYear - 3)
  toYear={2025}             // number (default: currentYear)
  placeholder="Pick month"  // string
  disabled={false}          // boolean
  error={false}             // boolean (red border + ring)
  className="w-full"        // string
/>
```

## Return Value

Returns **first day of month** as Date object:
- Selecting "Aug 2026" → `new Date(2026, 7, 1)`
- ISO string: `"2026-08-01T00:00:00.000Z"`

## Key Features

✓ Month grid (3×4 layout)  
✓ Year dropdown selector  
✓ Default range: last 3 years  
✓ Current month highlighted  
✓ Selected month in primary color  
✓ Keyboard accessible  
✓ Error state support  
✓ react-hook-form ready  

## Files

- `MonthYearPicker.tsx` - Main component
- `MonthYearPicker.stories.tsx` - Storybook demos
- `MonthYearPickerFormExample.tsx` - Form integration
- `examples/KPIFilterExample.tsx` - Real-world usage
- `README.md` - Full documentation

## Tech Stack

- **UI**: shadcn/ui (Popover + Button)
- **Date**: date-fns (`format`, `setMonth`, `setYear`, `startOfMonth`)
- **Icons**: lucide-react (`CalendarIcon`)
- **Styling**: Tailwind CSS + cn utility
