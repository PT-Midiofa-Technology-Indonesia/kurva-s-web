# Testing Strategy for Next.js

Complete testing strategy for Curva Frontend: unit tests, integration tests, and E2E tests.

---

## Testing Pyramid

```
        /\          E2E Tests (5-10)
       /  \         Real browser, real API
      /____\        Critical user paths
      
     /      \      Integration Tests (20-30)
    /________\     Pages, workflows
                   MSW mocked API
    
  /            \  Unit Tests (100+)
 /  __________  \ Components, services, hooks
/______________\ Pure functions, mocked deps
```

---

## Unit Tests

### Components (Atoms, Molecules)

```typescript
// src/shared/components/atoms/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with label', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(onClick).toHaveBeenCalled()
  })

  it('disables submit when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Button className="custom">Click</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom')
  })
})
```

**Rules:**
- Test props (label, disabled, onClick)
- Test rendering variants
- Test accessibility (roles)
- Mock nothing (component is isolated)

---

### Services (Pure Functions)

```typescript
// src/domains/user/services/user-transformer.test.ts
import { transformUserForDisplay } from './user-transformer'

describe('transformUserForDisplay', () => {
  it('transforms raw user to display format', () => {
    const raw = { 
      id: '1', 
      name: 'john doe', 
      email: 'john@test.com',
      role: 'admin'
    }
    
    const result = transformUserForDisplay(raw)
    
    expect(result).toEqual({
      id: '1',
      name: 'JOHN DOE',        // Uppercase
      email: 'john@test.com',
      displayRole: 'Admin'     // Formatted
    })
  })

  it('handles missing fields', () => {
    const raw = { id: '1', name: 'john' }
    const result = transformUserForDisplay(raw)
    
    expect(result.email).toBeUndefined()
  })
})
```

**Rules:**
- No mocks (pure functions only)
- Test edge cases
- Test transformations
- Test error conditions

---

### API Functions

```typescript
// src/domains/user/api/get-users.test.ts
import { getUsers } from './get-users'

jest.mock('@/shared/lib/axios')
import api from '@/shared/lib/axios'

describe('getUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches users from API', async () => {
    const mockUsers = [
      { id: '1', name: 'User 1' },
      { id: '2', name: 'User 2' }
    ]

    api.get.mockResolvedValue({
      data: { success: true, data: mockUsers }
    })

    const result = await getUsers()

    expect(api.get).toHaveBeenCalledWith('/v1/users')
    expect(result).toEqual(mockUsers)
  })

  it('throws error on API failure', async () => {
    const error = new Error('Network error')
    api.get.mockRejectedValue(error)

    await expect(getUsers()).rejects.toThrow()
  })
})
```

**Rules:**
- Mock axios at module level
- Mock response structure (envelope)
- Test success and error paths
- Test parameters

---

### Hooks (Mocked API)

```typescript
// src/domains/user/hooks/use-users.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { useUsers } from './use-users'

jest.mock('../api/get-users')
import { getUsers } from '../api/get-users'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('useUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
  })

  it('fetches users on mount', async () => {
    getUsers.mockResolvedValue([
      { id: '1', name: 'User 1' }
    ])

    const { result } = renderHook(() => useUsers(), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toEqual([{ id: '1', name: 'User 1' }])
    })
  })

  it('shows error state on API failure', async () => {
    getUsers.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => {
      expect(result.current.error).toBeDefined()
      expect(result.current.isError).toBe(true)
    })
  })
})
```

**Rules:**
- Mock API functions at module level
- Wrap with QueryClientProvider
- Test loading, success, error states
- Use waitFor for async operations

---

## Integration Tests

### Overview

Integration tests verify that components, hooks, and mocked APIs work together correctly. They test user workflows without hitting real APIs (MSW mocks intercept HTTP requests).

**IMPORTANT:** Use `test-utils` render function which includes QueryClientProvider + NuqsTestingAdapter. MSW server lifecycle is handled globally in `vitest.setup.ts` — do NOT duplicate it in tests.

```typescript
import { describe, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/shared/utils/test-utils'  // ✅ USE THIS
import { server } from '@/mocks/server'  // Only for server.use() overrides
import { http, HttpResponse } from 'msw'
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config'
```

---

### Page Test Patterns

#### 1. List Page Tests

```typescript
// src/domains/<domain>/pages/__tests__/EntityListPage.integration.test.tsx
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config'
import { render, screen, waitFor } from '@/shared/utils/test-utils'
import { ENTITY_LABELS } from '../../constants'
import { EntityListPage } from '../EntityListPage'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('EntityListPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear()
  })

  it('renders without crashing', () => {
    render(<EntityListPage />)
  })

  it('displays page title as heading', async () => {
    render(<EntityListPage />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        ENTITY_LABELS.LIST.TITLE
      )
    })
  })

  it('shows search input', async () => {
    render(<EntityListPage />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })
  })

  it('displays status filter', async () => {
    render(<EntityListPage />)
    await waitFor(() => {
      expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('fetches and displays the mock data', async () => {
    render(<EntityListPage />)
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument()
    })
  })

  it('renders table column headers', async () => {
    render(<EntityListPage />)
    await waitFor(() => {
      const headers = screen.getAllByRole('columnheader')
      expect(headers.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('handles search input typing', async () => {
    const user = userEvent.setup()
    render(<EntityListPage />)

    const searchInput = await screen.findByPlaceholderText('Search...')
    await user.type(searchInput, 'search term')

    await waitFor(() => {
      expect(searchInput).toHaveValue('search term')
    })
  })

  it('navigates to create page on add button click', async () => {
    const user = userEvent.setup()
    render(<EntityListPage />)

    const addButton = await screen.findByRole('button', {
      name: ENTITY_LABELS.LIST.ADD_BUTTON,
    })
    await user.click(addButton)

    expect(mockPush).toHaveBeenCalledWith('/<route>/<entity>/create')
  })

  it('displays error message when API fails', async () => {
    server.use(
      http.get(getApiPath('/entities'), () => {
        return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      })
    )

    render(<EntityListPage />)

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong. Please try again./i)).toBeInTheDocument()
    })
  })
})
```

**Key patterns:**
- Mock `useRouter` for navigation assertions
- Use `screen.getByPlaceholderText('Search...')` for search input
- Use `screen.getAllByRole('combobox')` for filters
- Use `screen.getAllByRole('columnheader')` for table headers
- Mock data from generic MSW handlers returns `"Test Item"` by default

---

#### 2. Create Page Tests

```typescript
// src/domains/<domain>/pages/__tests__/CreateEntityPage.integration.test.tsx
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/shared/utils/test-utils'
import { ENTITY_LABELS } from '../../constants'
import { CreateEntityPage } from '../CreateEntityPage'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('CreateEntityPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear()
  })

  it('renders without crashing', () => {
    render(<CreateEntityPage />)
  })

  it('renders page title', () => {
    render(<CreateEntityPage />)
    expect(screen.getByText(ENTITY_LABELS.CREATE.PAGE_TITLE)).toBeInTheDocument()
  })

  it('renders back button', () => {
    render(<CreateEntityPage />)
    expect(
      screen.getByRole('button', { name: ENTITY_LABELS.CREATE.BACK_BUTTON })
    ).toBeInTheDocument()
  })

  it('renders form fields', async () => {
    render(<CreateEntityPage />)
    await waitFor(() => {
      expect(screen.getByText(ENTITY_LABELS.CREATE.FIELDS.CODE)).toBeInTheDocument()
      expect(screen.getByText(ENTITY_LABELS.CREATE.FIELDS.NAME)).toBeInTheDocument()
    })
  })

  it('renders cancel and save buttons', async () => {
    render(<CreateEntityPage />)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: ENTITY_LABELS.CREATE.BUTTONS.CANCEL })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: ENTITY_LABELS.CREATE.BUTTONS.SAVE })
      ).toBeInTheDocument()
    })
  })

  it('save button is disabled when required fields are empty', async () => {
    render(<CreateEntityPage />)
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: ENTITY_LABELS.CREATE.BUTTONS.SAVE })
      expect(saveButton).toBeDisabled()
    })
  })

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateEntityPage />)

    const cancelButton = await screen.findByRole('button', {
      name: ENTITY_LABELS.CREATE.BUTTONS.CANCEL,
    })
    await user.click(cancelButton)

    expect(mockPush).toHaveBeenCalledWith('/<route>/<entity>')
  })

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<CreateEntityPage />)

    const backButton = await screen.findByRole('button', { name: ENTITY_LABELS.CREATE.BACK_BUTTON })
    await user.click(backButton)

    expect(mockPush).toHaveBeenCalledWith('/<route>/<entity>')
  })
})
```

**Key patterns:**
- Test page title via labels constants
- Test form fields exist (use `getByText` with label constants)
- Test save button is initially disabled (Zod validation)
- Test cancel/back navigation
- Mock `useRouter` at module level with `vi.mock`

---

#### 3. Edit Page Tests

```typescript
// src/domains/<domain>/pages/__tests__/EditEntityPage.integration.test.tsx
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config'
import { render, screen, waitFor } from '@/shared/utils/test-utils'
import { ENTITY_LABELS } from '../../constants'
import { EditEntityPage } from '../EditEntityPage'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('EditEntityPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear()
  })

  it('renders without crashing', () => {
    render(<EditEntityPage entityId="1" />)
  })

  it('renders page title after loading', async () => {
    render(<EditEntityPage entityId="1" />)
    await waitFor(() => {
      expect(screen.getByText(ENTITY_LABELS.EDIT.PAGE_TITLE)).toBeInTheDocument()
    })
  })

  it('renders back button after loading', async () => {
    render(<EditEntityPage entityId="1" />)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: ENTITY_LABELS.EDIT.BACK_BUTTON })
      ).toBeInTheDocument()
    })
  })

  it('renders form fields after loading', async () => {
    render(<EditEntityPage entityId="1" />)
    await waitFor(() => {
      expect(screen.getByText(ENTITY_LABELS.EDIT.FIELDS.CODE)).toBeInTheDocument()
      expect(screen.getByText(ENTITY_LABELS.EDIT.FIELDS.NAME)).toBeInTheDocument()
    })
  })

  it('renders cancel and save buttons after loading', async () => {
    render(<EditEntityPage entityId="1" />)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: ENTITY_LABELS.EDIT.BUTTONS.CANCEL })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: ENTITY_LABELS.EDIT.BUTTONS.SAVE })
      ).toBeInTheDocument()
    })
  })

  it('navigates back when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<EditEntityPage entityId="1" />)

    const cancelButton = await screen.findByRole('button', {
      name: ENTITY_LABELS.EDIT.BUTTONS.CANCEL,
    })
    await user.click(cancelButton)

    expect(mockPush).toHaveBeenCalledWith('/<route>/<entity>')
  })

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<EditEntityPage entityId="1" />)

    const backButton = await screen.findByRole('button', {
      name: ENTITY_LABELS.EDIT.BACK_BUTTON,
    })
    await user.click(backButton)

    expect(mockPush).toHaveBeenCalledWith('/<route>/<entity>')
  })

  it('displays not found state when API fails', async () => {
    server.use(
      http.get(getApiPath('/entities/:id'), () => {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 })
      })
    )

    render(<EditEntityPage entityId="1" />)

    await waitFor(() => {
      expect(screen.getByText(/tidak ditemukan/i)).toBeInTheDocument()
    })
  })
})
```

**Key patterns:**
- Pass entityId prop: `render(<EditEntityPage entityId="1" />)`
- Wait for data to load before querying form fields
- Test not-found state by overriding the detail handler
- Use `ENTITY_LABELS.EDIT.*` constants for all assertions

---

#### 4. Detail Page Tests

```typescript
// src/domains/<domain>/pages/__tests__/DetailEntityPage.integration.test.tsx
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/mocks/server'
import { getHandlerPath as getApiPath } from '@/shared/lib/api-config'
import { render, screen, waitFor } from '@/shared/utils/test-utils'
import { ENTITY_LABELS } from '../../constants'
import { DetailEntityPage } from '../DetailEntityPage'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('DetailEntityPage Integration', () => {
  afterEach(() => {
    mockPush.mockClear()
  })

  it('renders without crashing', () => {
    render(<DetailEntityPage entityId="1" />)
  })

  it('displays page title', async () => {
    render(<DetailEntityPage entityId="1" />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        ENTITY_LABELS.DETAIL.PAGE_TITLE
      )
    })
  })

  it('displays info card', async () => {
    render(<DetailEntityPage entityId="1" />)
    await waitFor(() => {
      expect(screen.getByText(ENTITY_LABELS.DETAIL.INFO_CARD_TITLE)).toBeInTheDocument()
    })
  })

  it('displays delete button', async () => {
    render(<DetailEntityPage entityId="1" />)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: ENTITY_LABELS.DETAIL.DELETE_BUTTON })
      ).toBeInTheDocument()
    })
  })

  it('navigates back when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<DetailEntityPage entityId="1" />)

    const backButton = await screen.findByRole('button', {
      name: ENTITY_LABELS.DETAIL.BACK_BUTTON,
    })
    await user.click(backButton)

    expect(mockPush).toHaveBeenCalledWith('/<route>/<entity>')
  })

  it('navigates to edit page when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(<DetailEntityPage entityId="1" />)

    const editButton = await screen.findByRole('button', {
      name: ENTITY_LABELS.DETAIL.EDIT_BUTTON,
    })
    await user.click(editButton)

    expect(mockPush).toHaveBeenCalledWith('/<route>/<entity>/1/edit')
  })

  it('displays not found state when API fails', async () => {
    server.use(
      http.get(getApiPath('/entities/:id'), () => {
        return HttpResponse.json({ message: 'Not Found' }, { status: 404 })
      })
    )

    render(<DetailEntityPage entityId="1" />)

    await waitFor(() => {
      expect(screen.getByText(/tidak ditemukan/i)).toBeInTheDocument()
    })
  })
})
```

---

### Form Component Tests

```typescript
// src/domains/<domain>/components/__tests__/EntityForm.integration.test.tsx
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/shared/utils/test-utils'
import { ENTITY_LABELS } from '../../constants'
import { EntityForm } from '../EntityForm'

describe('EntityForm Integration', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockOnCancel.mockClear()
  })

  it('renders all required form fields in create mode', async () => {
    render(<EntityForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await waitFor(() => {
      expect(screen.getByLabelText(ENTITY_LABELS.CREATE.FIELDS.CODE)).toBeInTheDocument()
      expect(screen.getByLabelText(ENTITY_LABELS.CREATE.FIELDS.NAME)).toBeInTheDocument()
      expect(screen.getByLabelText(ENTITY_LABELS.CREATE.FIELDS.STATUS)).toBeInTheDocument()
    })
  })

  it('renders optional form fields', async () => {
    render(<EntityForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await waitFor(() => {
      expect(screen.getByLabelText(ENTITY_LABELS.CREATE.FIELDS.DESCRIPTION)).toBeInTheDocument()
    })
  })

  it('displays create mode button text', async () => {
    render(<EntityForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: ENTITY_LABELS.CREATE.BUTTONS.SAVE })
      ).toBeInTheDocument()
    })
  })

  it('displays edit mode button text', async () => {
    render(<EntityForm mode="edit" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: ENTITY_LABELS.EDIT.BUTTONS.SAVE })
      ).toBeInTheDocument()
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<EntityForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const cancelButton = await screen.findByRole('button', {
      name: ENTITY_LABELS.CREATE.BUTTONS.CANCEL,
    })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('submit button is disabled when form is invalid', async () => {
    render(<EntityForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const submitButton = await screen.findByRole('button', {
      name: ENTITY_LABELS.CREATE.BUTTONS.SAVE,
    })

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })

  it('submit button shows loading text when submitting', async () => {
    render(
      <EntityForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    )

    const submitButton = await screen.findByRole('button', {
      name: ENTITY_LABELS.CREATE.BUTTONS.SAVING,
    })

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
    })
  })

  it('cancel button is disabled when submitting', async () => {
    render(
      <EntityForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isSubmitting={true}
      />
    )

    const cancelButton = await screen.findByRole('button', {
      name: ENTITY_LABELS.CREATE.BUTTONS.CANCEL,
    })

    await waitFor(() => {
      expect(cancelButton).toBeDisabled()
    })
  })

  it('allows typing in text fields', async () => {
    const user = userEvent.setup()
    render(<EntityForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const codeInput = await screen.findByLabelText(ENTITY_LABELS.CREATE.FIELDS.CODE)
    await user.type(codeInput, 'CODE-001')

    await waitFor(() => {
      expect(codeInput).toHaveValue('CODE-001')
    })
  })

  it('renders with entity data in edit mode', async () => {
    const entity = {
      id: '1',
      code: 'CODE-001',
      name: 'Test Entity',
      isActive: true,
      // ... all required type properties
    }

    render(<EntityForm mode="edit" entity={entity} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    await waitFor(() => {
      expect(screen.getByLabelText(ENTITY_LABELS.EDIT.FIELDS.CODE)).toHaveValue('CODE-001')
      expect(screen.getByLabelText(ENTITY_LABELS.EDIT.FIELDS.NAME)).toHaveValue('Test Entity')
    })
  })
})
```

**Key patterns:**
- Use `screen.getByLabelText()` for text inputs (matches `<label>` text)
- Use `screen.getByRole('button', { name: ... })` for buttons
- Use label constants from `ENTITY_LABELS` for all queries
- Wrap `toBeDisabled()` assertions in `waitFor()` for async form validation
- Pass complete mock data matching TypeScript types (check optional/required fields)

---

### Drawer Component Tests

```typescript
// src/domains/<domain>/components/__tests__/EntityDetailDrawer.integration.test.tsx
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/shared/utils/test-utils'
import { ENTITY_LABELS } from '../../constants'
import { EntityDetailDrawer } from '../EntityDetailDrawer'

// Polyfill for jsdom which doesn't support setPointerCapture (used by vaul/Drawer)
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn()
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn()
}

describe('EntityDetailDrawer Integration', () => {
  const mockOnClose = vi.fn()
  const mockOnEdit = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
    mockOnEdit.mockClear()
  })

  it('renders when open', () => {
    render(
      <EntityDetailDrawer
        open={true}
        onClose={mockOnClose}
        onEdit={mockOnEdit}
        entity={mockEntity}
      />
    )
  })

  it('does not render drawer content when closed', () => {
    render(
      <EntityDetailDrawer
        open={false}
        onClose={mockOnClose}
        entity={mockEntity}
      />
    )
    expect(
      screen.queryByRole('heading', { name: ENTITY_LABELS.DETAIL.PAGE_TITLE })
    ).not.toBeInTheDocument()
  })

  it('displays drawer title', async () => {
    render(
      <EntityDetailDrawer open={true} onClose={mockOnClose} entity={mockEntity} />
    )

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: ENTITY_LABELS.DETAIL.PAGE_TITLE })
      ).toBeInTheDocument()
    })
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <EntityDetailDrawer open={true} onClose={mockOnClose} entity={mockEntity} />
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <EntityDetailDrawer open={true} onClose={mockOnClose} onEdit={mockOnEdit} entity={mockEntity} />
    )

    const editButton = screen.getByRole('button', { name: ENTITY_LABELS.DETAIL.BUTTONS.EDIT })
    await user.click(editButton)

    expect(mockOnEdit).toHaveBeenCalled()
  })
})
```

**Key patterns:**
- Add `setPointerCapture` polyfill at top of file (vaul Drawer requirement)
- Use `screen.getByRole('button', { name: /close/i })` for DrawerClose button
- Test closed state with `queryByRole` (returns null, not throws)
- Use `heading` role for drawer title assertions

---

### Testing Loading States

All loading states in this codebase render a `Loader2` spinner SVG (`aria-hidden="true"`) — there is **no** `"Loading..."` text. Do not use `getByText('Loading...')`.

**For edit/detail pages** (data fetch before form renders):
```typescript
it('displays loading state initially', () => {
  render(<EditEntityPage entityId="123" />)
  // Form fields are absent while loading
  expect(screen.queryByDisplayValue('expected-value')).not.toBeInTheDocument()
})
```

**For list pages** (spinner replaces table):
```typescript
it('shows spinner while loading', () => {
  render(<EntityListPage />)
  // Spinner SVG is present
  expect(document.querySelector('.animate-spin')).toBeInTheDocument()
})
```

---

### Mocking Patterns

#### Mocking `next/navigation`

```typescript
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// For pages using useQueryParams (needs useSearchParams):
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}))
```

**Always reset mocks between tests:**
```typescript
afterEach(() => {
  mockPush.mockClear()
})
```

---

### MSW Handler Override Patterns

**Error state test:**
```typescript
it('displays error message when API fails', async () => {
  server.use(
    http.get(getApiPath('/entities'), () => {
      return HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
    })
  )

  render(<EntityListPage />)

  await waitFor(() => {
    expect(screen.getByText(/Something went wrong. Please try again./i)).toBeInTheDocument()
  })
})
```

**Not found state test:**
```typescript
it('displays not found state when API fails', async () => {
  server.use(
    http.get(getApiPath('/entities/:id'), () => {
      return HttpResponse.json({ message: 'Not Found' }, { status: 404 })
    })
  )

  render(<EditEntityPage entityId="1" />)

  await waitFor(() => {
    expect(screen.getByText(/tidak ditemukan/i)).toBeInTheDocument()
  })
})
```

**Important:** Handler resets automatically after each test via `afterEach(() => server.resetHandlers())` in `vitest.setup.ts`. No manual cleanup needed.

---

### TypeScript Mock Data Patterns

When passing mock data to components, match the full TypeScript type exactly:

```typescript
const company = {
  id: '1',
  code: 'COMP-001',
  name: 'PT Existing',
  isActive: true,
  groupId: 'g1',
  group: { id: 'g1', code: 'G01', name: 'Group A' },  // All sub-type fields required
  npwp: '123456789012345',
  siupNumber: 'SIUP-001',
  phone: '08123456789',
  email: 'test@example.com',
  projectCapabilities: [{ id: 'pc1', code: 'PC01', name: 'Capability 1', isActive: true }],
  province: { id: 'p1', code: 'P01', name: 'Jawa Barat' },
  city: null,
  district: null,
  village: null,
  postalCode: null,
  addressDetail: 'Jl. Test No. 1',
  departments: [],
  createdAt: '2020-01-01T00:00:00.000Z',
  updatedAt: '2020-01-01T00:00:00.000Z',
}
```

**Tip:** Check the domain's `types/index.ts` for required fields. Missing required fields causes TypeScript errors during `pnpm run type-check`.

---

### Common Form Testing Pitfalls

**Select/dropdown fields:** FormGenerator renders AsyncSelect as a `role="combobox"` button, not a native `<select>`. Use `getByRole('combobox', { name: /Label/i })` to find them.

**Textarea fields:** Labels use `htmlFor` but textarea may not receive focus properly via `getByLabelText`. Use `getByPlaceholderText()` as fallback.

**Address section fields:** Geography fields (province, city, district, village) may not appear until parent selections are made. Test only the initially visible province field.

**Submit button state:** The save button's disabled state depends on React Hook Form's async validation. Always wrap `toBeDisabled()` in `waitFor()`:
```typescript
await waitFor(() => {
  expect(submitButton).toBeDisabled()
})
```

---

## E2E Tests (Playwright)

### Critical User Flows

```typescript
// tests/e2e/user-crud.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to users page
    await page.goto('http://localhost:3000/users')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('create user flow', async ({ page }) => {
    // Click "Add User" button
    await page.click('button:has-text("Add User")')
    
    // Wait for modal/page
    await page.waitForURL('**/users/create')

    // Fill form
    await page.fill('input[name="email"]', 'newuser@test.com')
    await page.fill('input[name="name"]', 'New User')
    await page.selectOption('select[name="role"]', 'user')

    // Submit
    await page.click('button:has-text("Create")')

    // Should show success
    await expect(page.locator('text=created successfully')).toBeVisible()

    // Should redirect to list
    await expect(page).toHaveURL('**/users')

    // New user appears in list
    await expect(page.locator('text=New User')).toBeVisible()
  })

  test('edit user flow', async ({ page }) => {
    // Wait for list to load
    await page.waitForLoadState('networkidle')

    // Find first user row and click edit
    const firstRow = page.locator('table tbody tr').first()
    await firstRow.locator('button:has-text("Edit")').click()

    // Should navigate to edit page
    await expect(page).toHaveURL('**/users/*/edit')

    // Change name
    const nameInput = page.locator('input[name="name"]')
    await nameInput.clear()
    await nameInput.fill('Updated Name')

    // Submit
    await page.click('button:has-text("Save")')

    // Should show success
    await expect(page.locator('text=updated successfully')).toBeVisible()

    // Should redirect to list
    await expect(page).toHaveURL('**/users')

    // Updated name appears
    await expect(page.locator('text=Updated Name')).toBeVisible()
  })

  test('delete user flow', async ({ page }) => {
    // Wait for list to load
    await page.waitForLoadState('networkidle')

    // Get initial count
    const initialCount = await page.locator('table tbody tr').count()

    // Find and delete first user
    const firstRow = page.locator('table tbody tr').first()
    await firstRow.locator('button:has-text("Delete")').click()

    // Confirm deletion
    await page.click('button:has-text("Confirm")')

    // Should show success
    await expect(page.locator('text=deleted successfully')).toBeVisible()

    // Count should decrease
    const newCount = await page.locator('table tbody tr').count()
    expect(newCount).toBe(initialCount - 1)
  })

  test('search users', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Type in search
    await page.fill('input[placeholder="Search..."]', 'John')

    // Wait for results
    await page.waitForLoadState('networkidle')

    // Only John should appear
    const rows = page.locator('table tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)

    // All visible rows should contain "John"
    for (let i = 0; i < count; i++) {
      const text = await rows.nth(i).textContent()
      expect(text).toContain('John')
    }
  })
})
```

**Rules:**
- Test complete user journeys
- Use real browser (Playwright)
- Real/staging API
- Critical paths only
- Wait for page loads (networkidle)
- Verify success (messages, redirects, list updates)

---

## Complete Integration Testing Setup

### 1. Global Setup (vitest.setup.ts)
- MSW server lifecycle (beforeAll, afterEach, afterAll)
- Mocks for next/image, next/navigation, ResizeObserver
- Runs once before all tests

### 2. Test Utilities (src/shared/utils/test-utils.tsx)
- Export custom `render()` function with providers
- QueryClientProvider with `retry: false`
- NuqsTestingAdapter for query params
- Re-exports all testing-library functions

### 3. Mock Handlers (src/mocks/handlers.ts)
- Specific handlers for unique endpoints (e.g., /roles, /permissions)
- Generic handlers for standard list/detail pages
- Update when adding/removing domains

### 4. Server Setup (src/mocks/server.ts)
- Creates MSW server from handlers
- Doesn't change after initial setup

### Writing Integration Tests
```typescript
// pages/__tests__/MyPage.integration.test.tsx
import { describe, it } from 'vitest'
import { render, screen, waitFor } from '@/utils/test-utils'
import { server } from '@/mocks/server'  // Only for overrides
import { http, HttpResponse } from 'msw'
import { getApiPath } from '@/shared/lib/api-config'
import { MyPage } from '../MyPage'

describe('MyPage Integration', () => {
  it('renders and loads data', async () => {
    render(<MyPage />)  // No wrapper needed (test-utils provides it)
    
    await waitFor(() => {
      expect(screen.getByText('expected text')).toBeInTheDocument()
    })
  })

  it('handles API errors', async () => {
    server.use(
      http.get(getApiPath('/endpoint'), () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 })
      })
    )
    
    render(<MyPage />)
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
```

## Test File Organization

```
src/
├── shared/
│   ├── components/
│   │   └── atoms/Button/
│   │       ├── Button.tsx
│   │       ├── Button.test.tsx          ← Unit test
│   │       └── Button.types.ts
│   │
│   └── utils/
│       ├── test-utils.tsx               ← Custom render with providers
│       └── test-utils.test.ts           ← (optional)
│
├── domains/<domain>/
│   ├── api/
│   │   ├── get-users.ts
│   │   └── get-users.test.ts            ← Unit test (mock axios)
│   │
│   ├── services/
│   │   ├── user-transformer.ts
│   │   └── user-transformer.test.ts     ← Unit test (pure function)
│   │
│   ├── hooks/
│   │   ├── use-users.ts
│   │   └── use-users.test.ts            ← Unit test (mock API)
│   │
│   ├── pages/
│   │   ├── UserListPage.tsx
│   │   └── __tests__/
│   │       └── UserListPage.integration.test.tsx  ← Integration test
│   │
│   └── components/
│       └── CreateUserForm.tsx
│           └── __tests__/
│               └── CreateUserForm.integration.test.tsx
│
├── mocks/
│   ├── server.ts                        ← MSW setupServer
│   └── handlers.ts                      ← HTTP handlers
│
├── vitest.setup.ts                      ← Global test setup
└── vitest.config.ts                     ← Vitest configuration

tests/
└── e2e/
    ├── user-crud.spec.ts                ← E2E test (Playwright)
    └── auth.spec.ts
```

---

## Setup & Tools

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Vitest Setup (vitest.setup.ts)

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from '@/mocks/server'

// ✅ Global MSW server lifecycle — applies to all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => server.close())

// Mock next/image, next/navigation, ResizeObserver, etc.
// (see actual file for full setup)
```

### Test Utils (src/shared/utils/test-utils.tsx)

```typescript
// Provides render() with providers already configured
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { RenderOptions, render } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const testQueryClient = createTestQueryClient()
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
    </QueryClientProvider>
  )
  return render(ui, { wrapper: Wrapper, ...options })
}

export { renderWithProviders as render }  // Override default render
export * from '@testing-library/react'     // Re-export everything
```

**Usage in tests:**
```typescript
import { render, screen, waitFor } from '@/utils/test-utils'

it('fetches data', async () => {
  render(<MyPage />)  // Already has providers
  await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument()
  })
})
```

### MSW Setup

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'
import { getApiPath } from '@/shared/lib/api-config'

export const handlers = [
  // Domain-specific handlers (place before generic handlers)
  http.get(getApiPath('/roles'), ({ request }) => {
    // Custom pagination for roles
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    // ... return paginated roles
  }),

  // Generic handlers for list pages (pagination)
  ...['/users', '/cost-item-types', '/job-item-types', ...].map((path) =>
    http.get(getApiPath(path), ({ request }) => {
      const url = new URL(request.url)
      const page = parseInt(url.searchParams.get('page') || '1', 10)
      const perPage = parseInt(url.searchParams.get('perPage') || '10', 10)
      
      return HttpResponse.json({
        success: true,
        data: [{ id: '1', name: 'Test Item' }],
        meta: { currentPage: page, perPage, total: 1, lastPage: 1, from: 1, to: 1 },
      })
    })
  ),

  // Generic handlers for detail pages (:id endpoints)
  ...['/users', '/cost-item-types', ...].map((path) =>
    http.get(getApiPath(`${path}/:id`), () => {
      return HttpResponse.json({
        success: true,
        data: { id: '1', name: 'Test Item Detail' },
      })
    })
  ),
]
```

**⚠️ IMPORTANT:** When adding a new domain, update the generic handler arrays above with the domain's endpoint path.

### MSW Handler Best Practices

1. **Handler Precedence**: Domain-specific handlers should be placed BEFORE generic handlers
   ```typescript
   export const handlers = [
     // ✅ Specific /roles handler (matches first)
     http.get(getApiPath('/roles'), ...),
     
     // ✅ Generic handler (matches others)
     ...paths.map(path => http.get(getApiPath(path), ...))
   ]
   ```

2. **Extracting Query Parameters**:
   ```typescript
   http.get(getApiPath('/users'), ({ request }) => {
     const url = new URL(request.url)
     const page = parseInt(url.searchParams.get('page') || '1', 10)
     const search = url.searchParams.get('search') || ''
     // Use page, search in filtering/pagination logic
   })
   ```

3. **Overriding Handlers in Tests**:
   ```typescript
   it('shows error on 500', async () => {
     // Temporarily override for this test
     server.use(
       http.get(getApiPath('/users'), () => {
         return HttpResponse.json({ error: 'Server error' }, { status: 500 })
       })
     )
     // ✅ Resets after test (afterEach in setup)
     
     render(<UserPage />)
     await waitFor(() => {
       expect(screen.getByText(/error/i)).toBeInTheDocument()
     })
   })
   ```

4. **Response Structure**: Always match your API envelope format
   ```typescript
   // ✅ Correct: matches ApiPaginatedResponse type
   HttpResponse.json({
     success: true,
     message: 'Success',
     data: [{ id: '1', name: 'Item' }],
     meta: { currentPage: 1, total: 10, ... },
     links: { first: '...', last: '...', ... }
   })
   ```

---

## Common Mistakes & How to Avoid Them

### 1. Importing render from wrong place

❌ **Wrong:**
```typescript
import { render } from '@testing-library/react'  // No providers!
```

✅ **Right:**
```typescript
import { render } from '@/utils/test-utils'  // Has QueryClientProvider + NuqsTestingAdapter
```

### 2. Mocking axios in integration tests

❌ **Wrong:**
```typescript
jest.mock('@/shared/lib/axios')
import api from '@/shared/lib/axios'
api.get.mockResolvedValue(...)  // Breaks the contract!
```

✅ **Right:**
```typescript
// Use MSW in vitest.setup.ts + handlers.ts
// Or override in test:
server.use(
  http.get(getApiPath('/users'), () => {
    return HttpResponse.json(...)
  })
)
```

### 3. Duplicating server setup in tests

❌ **Wrong:**
```typescript
beforeAll(() => server.listen())  // Already in vitest.setup.ts!
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

✅ **Right:**
```typescript
// Just write the test, setup is global
describe('MyPage', () => {
  it('works', () => {
    // MSW server already listening
  })
})
```

### 4. Forgetting handlers when adding domains

❌ **Wrong:**
```typescript
// Created new domain /products but didn't update handlers.ts
// Integration test fails: "No handler found for GET /v1/products"
```

✅ **Right:**
```typescript
// 1. Add to handlers.ts generic arrays:
...['/products', '/orders', ...].map(path => http.get(...))

// 2. Create integration test
// 3. Test passes because handler exists
```

### 5. Not waiting for async operations

❌ **Wrong:**
```typescript
render(<UserPage />)
expect(screen.getByText('User 1')).toBeInTheDocument()  // Fails: data not loaded yet
```

✅ **Right:**
```typescript
render(<UserPage />)
await waitFor(() => {
  expect(screen.getByText('User 1')).toBeInTheDocument()
})
```

### 6. Testing without understanding data flow

❌ **Wrong (test is too generic):**
```typescript
it('works', () => {
  render(<UserPage />)
  // No assertions, just checking it doesn't crash
})
```

✅ **Right (test verifies the flow):**
```typescript
it('loads and displays users from API', async () => {
  render(<UserPage />)
  // MSW intercepts API call
  // React Query fetches data
  // Component renders data
  await waitFor(() => {
    expect(screen.getByText('Test Item')).toBeInTheDocument()
  })
})

it('shows error when API fails', async () => {
  server.use(
    http.get(getApiPath('/users'), () => {
      return HttpResponse.json({ error: 'Server down' }, { status: 500 })
    })
  )
  render(<UserPage />)
  // Component's error boundary handles failure
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

---

## Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test Button.test.tsx

# Run tests matching pattern
pnpm test --testNamePattern="creates user"

# Generate coverage report
pnpm test --coverage

# Run E2E tests
pnpm exec playwright test

# Run E2E tests in UI mode
pnpm exec playwright test --ui
```

---

## Coverage Targets

| Type | Target | Why |
|---|---|---|
| Components (atoms/molecules) | 80%+ | Building blocks, heavily reused |
| Hooks | 80%+ | Business logic orchestration |
| Services | 90%+ | Pure functions, easy to test |
| Pages | 60%+ | Often tested via integration |
| Overall | 70%+ | Good balance of coverage/effort |

---

## Checklist When Adding Code

- [ ] Unit test added (components, services, hooks, API)
- [ ] Integration test added (pages, workflows)
- [ ] Edge cases tested (null, empty, error)
- [ ] Error states tested
- [ ] Loading states tested
- [ ] All tests pass: `pnpm test`
- [ ] Coverage maintained: `pnpm test --coverage`

---

## See Also

- [Error Handling & Observability](02-error-handling.md) — Test error scenarios
- [CLAUDE.md](../CLAUDE.md) — Architecture & conventions
