# Leave Domain

Manages leave requests and leave settings through the backend API contract. Leave list and settings pages follow the attendance, overtime, and settings patterns, while integration tests use contract-aligned MSW fixtures.

## Structure

```
leave/
├── api/            # axios API calls for list, detail, create, update, cancel, settings
├── components/     # filter drawer, detail drawer, form drawer, settings section
├── constants/      # labels and badge config
├── hooks/          # React Query hooks and list page orchestration
├── pages/          # LeaveListPage and LeaveSettingsPage
├── schemas/        # Zod schemas for form and settings
├── types/          # Leave entities and payloads
└── index.ts        # public barrel exports
```

## Routes

- `/human-resource/leave`
- `/human-resource/leave/settings`

## Key behaviors

- company-scoped leave list using `X-Company-Id`
- drawer-based create and edit flow
- cancellable pending leave requests
- global settings page with editable leave type rows
