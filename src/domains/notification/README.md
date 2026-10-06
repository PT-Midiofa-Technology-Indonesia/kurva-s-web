# Notification

Domain for in-app notification badges — unread-update counts per sidebar menu (main menu + submenu), and marking a submenu's notifications as read.

## Structure

```
notification/
├── api/
│   ├── get-menu-badges.ts              # GET  /v1/notifications/menu-badges
│   ├── get-notifications.ts            # GET  /v1/notifications (paginated list)
│   ├── mark-notification-item-read.ts  # PATCH /v1/notifications/{id}/read
│   ├── mark-notification-read.ts       # POST /v1/notifications/read (submenu-level)
│   └── read-all-notifications.ts       # PATCH /v1/notifications/read-all
├── hooks/
│   ├── use-menu-badges.ts               # Query hook; defines NOTIFICATION_QUERY_KEYS
│   ├── use-mark-notification-read.ts    # Mutation hook (submenu-level)
│   ├── use-notifications.ts             # Query hook for the drawer list + unreadCount
│   ├── use-mark-notification-item-read.ts # Mutation hook (single notification)
│   ├── use-read-all-notifications.ts    # Mutation hook (mark all read)
│   └── use-sidebar-notifications.ts     # Orchestrator: decorates sidebar groups + auto mark-as-read
├── services/
│   ├── apply-menu-badges.ts             # Pure: merge badge counts into sidebar section groups
│   ├── find-menu-codes-by-path.ts       # Pure: pathname -> { mainMenuCode, submenuCode }
│   └── get-notification-target-path.ts  # Pure: NotificationItem -> deep-link route
├── types/
│   └── index.ts                      # MenuBadges, NotificationItem, payload/result types
└── index.ts                          # Barrel exports
```

## Key Files

- `api/get-menu-badges.ts` — fetches unread badge counts per main menu / submenu, scoped by optional `X-Company-Id` header
- `api/mark-notification-read.ts` — marks a single submenu's notifications as read
- `api/get-notifications.ts` — paginated notification list (`filter=all|unread`); response carries a top-level `unreadCount` used by the Navbar bell
- `api/mark-notification-item-read.ts` / `api/read-all-notifications.ts` — mark one notification / all notifications as read
- `hooks/use-menu-badges.ts` — React Query hook; reads `selectedCompanyId` from `useSelectedCompanyStore` and includes it in the query key so cache never leaks across companies; owns `NOTIFICATION_QUERY_KEYS`
- `hooks/use-notifications.ts` — React Query infinite-query hook for the drawer list (20 items per page, auto-fetch next page on scroll); all notification mutations invalidate `NOTIFICATION_QUERY_KEYS.all`, so list, menu badges, and the bell count stay in sync
- `hooks/use-sidebar-notifications.ts` — takes the sidebar's `PortalAwareSectionGroup[]`, decorates them with `unreadCount` / `hasUnread`, and auto-fires mark-as-read when the current route matches a submenu with unread notifications
- `services/apply-menu-badges.ts` / `services/find-menu-codes-by-path.ts` — pure functions, no React/HTTP, safe to unit test in isolation

## Menu-code mapping

The API identifies menus by `mainMenuCode` / `submenuCode` (e.g. `APPR` / `approval_requests`), which do **not** match the sidebar's own `id` fields. The mapping lives in `src/shared/constants/navigation.tsx` via an optional `notificationCode` field on `PortalAwareSection` and `PortalAwareMenuItem` — sections/items without it simply never show a badge.

## Exports

- `getMenuBadges` / `getNotifications` / `markNotificationRead` / `markNotificationItemRead` / `readAllNotifications` — API functions
- `useMenuBadges` / `useNotifications` / `useMarkNotificationRead` / `useMarkNotificationItemRead` / `useReadAllNotifications` — React Query hooks
- `useSidebarNotifications` — page-layout orchestration hook (used by `DashboardRouteLayout`)
- `applyMenuBadges` / `findMenuCodesByPath` / `getNotificationTargetPath` — pure services
- `MenuBadges` / `MainMenuBadge` / `SubmenuBadge` / `NotificationItem` / `NotificationListResult` / payload & result types

## Usage Example

```tsx
import { useSidebarNotifications } from '@/domains/notification';

const sectionGroupsWithBadges = useSidebarNotifications(filteredSectionGroups);

<DashboardLayout sidebarSectionGroups={sectionGroupsWithBadges} ... />
```

## Follow-ups (not implemented)

- **Real-time refresh**: currently no polling — fetched on mount and invalidated after mark-as-read. If real-time badges become a requirement, add `refetchInterval` / `refetchOnWindowFocus` in `use-menu-badges.ts` (TODO already marked there).

## Deep-link navigation

`services/get-notification-target-path.ts` resolves a notification's route with this precedence:

1. `resourceType` detail route (requires `resourceId`) — e.g. `approval_request` → `/approval-management/approval-request/{id}`
2. `type` list-route fallback — e.g. `approval` → `/approval-management/approval-request`
3. `null` — caller only marks the notification read

Only `approval_request` is a confirmed `resourceType` from the API; the payment-request/billing keys are defensive candidates. When the real values are known, update the two maps at the top of the service.
