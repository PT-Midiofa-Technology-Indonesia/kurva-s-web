---
name: testing-strategy
description: Frontend testing pyramid - unit tests (components, services, API), integration tests (pages, forms with MSW), E2E tests (critical user flows)
user-invocable: false
---

# Testing Strategy for Next.js

Comprehensive testing approach covering unit, integration, and E2E tests.

## Testing Pyramid

See [../../.docs/practices/01-testing-strategy.md](../../.docs/practices/01-testing-strategy.md) for:
- **Unit Tests** (70%): Components (atoms/molecules), pure services, API functions with mocked axios
- **Integration Tests** (20%): Pages and forms with QueryClientProvider and MSW for realistic API behavior
- **E2E Tests** (10%): Critical user flows (create, edit, delete, search) with Playwright

## Test Organization

```
src/
├── domains/auth/
│   ├── components/LoginForm.tsx
│   ├── components/__tests__/LoginForm.test.tsx  # Unit test
│   ├── hooks/use-login.ts
│   ├── hooks/__tests__/use-login.test.ts        # Integration test (mock API)
│   └── api/login.ts
│       └── login.test.ts                         # Unit test (mock axios)
├── shared/components/atoms/Button.tsx
│   └── Button.test.tsx                           # Unit test (no dependencies)
└── shared/services/transformers.ts
    └── transformers.test.ts                      # Unit test (pure functions)

e2e/
├── auth.spec.ts                                  # E2E critical flows
└── user-management.spec.ts
```

## Jest Configuration

```
jest.config.ts          # Coverage thresholds: 70% global, 80% components/hooks, 90% services
tsconfig.jest.json      # Module resolution for tests
jest.setup.ts           # Test utilities, MSW server setup
```

## MSW (Mock Service Worker)

```
mocks/
├── server.ts           # MSW server instance (setupServer)
├── handlers.ts         # Default HTTP handlers matching API contract
└── data/               # Mock data matching backend responses
    ├── users.ts
    ├── roles.ts
    └── etc.
```

## Test Coverage by Type

**Unit Tests** (80%+ for components/hooks):
- Component rendering with props
- Service function outputs
- Hook state and effects
- API error handling

**Integration Tests** (realistic):
- Page with data fetching (QueryClientProvider)
- Form submission (React Hook Form + mutation)
- Error handling with MSW error responses
- Cache invalidation after mutations

**E2E Tests** (critical paths):
- User login → dashboard → create resource
- Edit resource → verify in list
- Delete resource → verify deleted
- Search and filter functionality

## Key Principles

1. **Test behavior, not implementation** - Don't test internals
2. **Mock at API boundary** - Use MSW for HTTP, not axios.get()
3. **Test isolation** - Each test independent, clean up after
4. **Realistic data** - Mock data matches backend schema exactly
5. **Error scenarios** - Test both happy path and error cases

## Commands

```bash
pnpm run test              # Run all tests
pnpm run test:watch        # Watch mode
pnpm run test:coverage     # Coverage report
pnpm run e2e               # Run Playwright E2E tests
```

## See Also

- [Error Handling & Observability](../../.docs/practices/02-error-handling.md) — Test error scenarios
- [API Contract Documentation](../../.docs/practices/05-api-contract.md) — Match backend responses exactly
