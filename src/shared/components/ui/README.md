# UI Components (Pure Radix Primitives)

This directory contains **pure Radix UI components** (via shadcn/ui) - these are the base primitives without business logic.

> **Important**: Use the **atoms** components for application development. The UI components here are the building blocks that atoms wrap.

## Purpose

- Raw Radix UI primitives
- No business logic
- Styling via Tailwind CSS only
- Used by **atoms** components as implementation details

## Component List

### Input Components
- `Input` - Text input
- `Textarea` - Multi-line text
- `Checkbox` - Checkbox (atoms wraps this)
- `RadioGroup` - Radio buttons
- `Select` - Dropdown select
- `Slider` - Range slider
- `Switch` - Toggle switch

### Overlay Components
- `Dialog` - Modal dialog
- `Drawer` - Side drawer
- `Popover` - Popover overlay
- `DropdownMenu` - Dropdown menu (atoms wraps this)
- `ContextMenu` - Right-click menu
- `Tooltip` - Hover tooltip

### Navigation
- `Breadcrumb` - Navigation hierarchy
- `NavigationMenu` - Complex navigation
- `Tabs` - Tabbed content

### Data Display
- `Table` - Data table
- `Badge` - Status badges
- `Card` - Content container

### Feedback
- `Alert` - Alert messages (atoms wraps this with variants)
- `Progress` - Progress bar
- `Skeleton` - Loading placeholder

### Actions
- `Button` - Action button
- `Separator` - Visual divider

## Usage

These components should **not** be imported directly in application code. Instead, use the **atoms** components:

```tsx
// ❌ Don't use UI components directly
import { Button } from '@/components/ui/button'

// ✅ Use atoms components
import { Button } from '@/components/atoms/Button'
```

## Why?

UI components are:
- Pure primitives (Radix only)
- No business logic
- Generic styling only
- Not aligned to project design system

Atoms components:
- Wrap UI components
- Add business logic
- Project-specific styling
- Design system integration

## Customization

To extend UI components, create an atom that wraps them:

```tsx
// atoms/CustomButton.tsx
import { Button as UIButton } from '@/components/ui/button'

export function CustomButton(props) {
  return (
    <UIButton
      className="bg-brand-500 hover:bg-brand-600"
      {...props}
    />
  )
}
```