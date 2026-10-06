# Storybook Documentation

Complete guide to creating and maintaining Storybook stories for shared components in Curva Frontend.

---

## Rule: Every Shared Component Requires a Story

**Storybook stories are MANDATORY for all components in `src/shared/components/`:**
- Atoms (Button, Input, Badge, etc.)
- Molecules (Card, Dialog, Dropdown, etc.)
- Organisms (DataTable, Form, etc.)
- Templates

Stories serve as:
1. **Living documentation** — shows component variants and usage
2. **QA checklist** — visual regression testing
3. **Design system catalog** — designers review components
4. **Integration reference** — how to use the component in different states

---

## File Organization

```
src/shared/components/
└── atoms/Button/
    ├── Button.tsx              ← Component
    ├── Button.test.tsx         ← Unit test
    ├── Button.types.ts         ← Types (optional)
    └── Button.stories.tsx      ← Story (REQUIRED)
```

Place the `.stories.tsx` file in the same directory as the component.

---

## Basic Story Structure

```typescript
// src/shared/components/atoms/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  args: {
    children: 'Click me',
    variant: 'default',
  },
}

// Variant stories
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    children: 'Loading',
    isLoading: true,
  },
}

// Size variants
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
}
```

---

## Story Naming Convention

### Title Structure
Use the Atomic Design hierarchy:

```typescript
const meta = {
  title: 'Atoms/Button',           // ✅ Atoms
  // OR
  title: 'Molecules/Dialog',       // ✅ Molecules
  // OR
  title: 'Organisms/DataTable',    // ✅ Organisms
  // OR
  title: 'Templates/Layout',       // ✅ Templates
}
```

### Story Names
Use descriptive, action-oriented names:

```typescript
export const Default: Story = { ... }      // Base state
export const Primary: Story = { ... }      // Variant
export const Disabled: Story = { ... }     // State
export const WithLongText: Story = { ... } // Edge case
export const Empty: Story = { ... }        // Empty/null state
export const Loading: Story = { ... }      // Loading state
export const Error: Story = { ... }        // Error state
```

---

## Atom Examples

### Button Story

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Click me',
  },
}

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    children: 'Loading',
    isLoading: true,
  },
}

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
}

export const FullWidth: Story = {
  args: {
    children: 'Full Width',
  },
  parameters: {
    layout: 'fullscreen',
  },
}
```

### Input Story

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const meta = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const WithValue: Story = {
  args: {
    value: 'Prefilled value',
    placeholder: 'Enter text...',
  },
}

export const WithLabel: Story = {
  args: {
    placeholder: 'Enter email',
    label: 'Email Address',
  },
}

export const WithError: Story = {
  args: {
    placeholder: 'Enter email',
    label: 'Email Address',
    error: 'Invalid email format',
  },
}

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
}

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
}

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
}
```

---

## Molecule Examples

### Card Story

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card'
import { Button } from '../Button/Button'

const meta = {
  title: 'Molecules/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card content goes here</p>
      </CardContent>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Action</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Are you sure you want to proceed?</p>
      </CardContent>
      <CardFooter>
        <Button variant="secondary">Cancel</Button>
        <Button>Confirm</Button>
      </CardFooter>
    </Card>
  ),
}

export const Loading: Story = {
  render: () => (
    <Card>
      <CardContent>
        <div className="h-20 bg-gray-200 animate-pulse rounded" />
      </CardContent>
    </Card>
  ),
}
```

### Dialog Story

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from './Dialog'
import { Button } from '../Button/Button'

const meta = {
  title: 'Molecules/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

const DialogWithState = () => {
  const [open, setOpen] = useState(false)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <div>
          <p>Dialog content goes here</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const Default: Story = {
  render: () => <DialogWithState />,
}

export const ConfirmDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(true)
    
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>
            <p>Are you sure? This action cannot be undone.</p>
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive">Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  },
}
```

---

## Organism Examples

### DataTable Story

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { DataTable } from './DataTable'

const meta = {
  title: 'Organisms/DataTable',
  component: DataTable,
  tags: ['autodocs'],
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj<typeof meta>

const mockColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
]

const mockData = [
  { id: '1', name: 'John Doe', email: 'john@test.com', role: 'Admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@test.com', role: 'User' },
  { id: '3', name: 'Bob Johnson', email: 'bob@test.com', role: 'User' },
]

export const Default: Story = {
  args: {
    columns: mockColumns,
    data: mockData,
  },
}

export const Empty: Story = {
  args: {
    columns: mockColumns,
    data: [],
  },
}

export const Loading: Story = {
  args: {
    columns: mockColumns,
    data: mockData,
    isLoading: true,
  },
}

export const WithSorting: Story = {
  args: {
    columns: mockColumns,
    data: mockData,
    enableSorting: true,
  },
}
```

---

## Best Practices

### 1. Show All Variants

```typescript
// ✅ Good: Multiple variants shown
export const Primary: Story = { ... }
export const Secondary: Story = { ... }
export const Disabled: Story = { ... }
export const Loading: Story = { ... }
export const Error: Story = { ... }

// ❌ Bad: Only default variant
export const Default: Story = { ... }
```

### 2. Use `render()` for Complex Compositions

```typescript
// ✅ Good: Clear composition
export const WithForm: Story = {
  render: () => (
    <form>
      <Input label="Email" />
      <Button type="submit">Submit</Button>
    </form>
  ),
}

// ❌ Bad: Hard to read
export const WithForm: Story = {
  args: { /* complex nested structure */ }
}
```

### 3. Include Edge Cases

```typescript
export const WithLongText: Story = {
  args: {
    children: 'This is a very long button text that might wrap...',
  },
}

export const Empty: Story = {
  args: {
    children: '',
  },
}

export const WithSpecialChars: Story = {
  args: {
    children: 'Button with <special> & chars!',
  },
}
```

### 4. Document Interactive Behavior

```typescript
export const Interactive: Story = {
  render: () => {
    const [count, setCount] = useState(0)
    
    return (
      <Button onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </Button>
    )
  },
}
```

### 5. Use `parameters` for Visual Options

```typescript
export const CenteredLayout: Story = {
  args: { children: 'Button' },
  parameters: {
    layout: 'centered',
  },
}

export const PaddedLayout: Story = {
  args: { children: 'Button' },
  parameters: {
    layout: 'padded',
  },
}

export const FullScreenLayout: Story = {
  args: { children: 'Button' },
  parameters: {
    layout: 'fullscreen',
  },
}
```

### 6. Enable Autodocs

```typescript
const meta = {
  // ...
  tags: ['autodocs'],  // Generates auto documentation
}
```

---

## Running Storybook

```bash
# Start Storybook dev server
pnpm run storybook

# Build static Storybook
pnpm run build:storybook

# Run Storybook tests
pnpm run test:storybook
```

Storybook will start at `http://localhost:6006`

---

## Checklist When Adding Shared Component

- [ ] Component created in `src/shared/components/`
- [ ] `.test.tsx` file added with unit tests
- [ ] `.stories.tsx` file added with at least 3 variants
- [ ] All props documented in stories
- [ ] All states shown (default, disabled, loading, error)
- [ ] Edge cases included (empty, long text)
- [ ] `pnpm run storybook` shows component without errors
- [ ] Stories are accessible and readable

---

## See Also

- [Testing Strategy](01-testing-strategy.md) — Unit tests for components
- [ARCHITECTURE.md](../ARCHITECTURE.md) — Component structure
- [Atomic Design Pattern](../ARCHITECTURE.md#atomic-design) — When to create atoms vs molecules