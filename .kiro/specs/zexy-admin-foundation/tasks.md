# Implementation Plan: Zexy Admin Foundation

## Overview

Greenfield implementation across two repos. `zexy_api` backend work is done first (model, migration, endpoints), then the `zexy_admin_web_app` Next.js 15 app is scaffolded and built up incrementally: foundation → common components → auth → dashboard → users → payouts. Property-based tests are placed close to the code they validate.

---

## Tasks

- [ ] 1. zexy_api — PayoutRequest model and Alembic migration
  - [ ] 1.1 Define `PayoutRequest` SQLAlchemy model in `zexy_api/app/models/`
    - Add fields: `id` (PK), `creator_uid` (FK → users.id), `amount` (Decimal), `status` (Enum: pending/approved/rejected), `requested_at` (DateTime), `actioned_at` (DateTime, nullable), `actioned_by` (FK → users.id, nullable), `notes` (String, nullable)
    - Register model in `zexy_api/app/models/__init__.py` so Alembic detects it
    - _Requirements: 14.1_

  - [ ] 1.2 Generate and write Alembic migration for `payout_requests` table
    - Create migration file under `zexy_api/alembic/versions/`
    - Include all columns, FK constraints (`creator_uid → users.id`, `actioned_by → users.id`), and status enum
    - _Requirements: 14.2, 14.3_

  - [ ] 1.3 Write Hypothesis property test for PayoutRequest model integrity
    - **Property 8: Payout action sets correct status and audit fields**
    - **Validates: Requirements 13.6, 13.7**
    - Tag: `# Feature: zexy-admin-foundation, Property 8: Payout action sets correct status and audit fields`
    - Generate arbitrary pending PayoutRequest records; verify approve/reject sets correct terminal status, non-null `actioned_by`, and non-null `actioned_at`

- [ ] 2. zexy_api — Admin auth endpoints
  - [ ] 2.1 Create `zexy_api/app/api/v1/admin.py` router with `/admin/auth` prefix
    - Implement `POST /api/v1/admin/auth/otp/send`: validate user exists and `role == admin`, raise `AUTH_004` otherwise, raise `AUTH_005` for inactive accounts, apply 5-req/5-min rate limit
    - Implement `POST /api/v1/admin/auth/otp/verify`: verify OTP, raise `AUTH_004` if `role != admin`, accept `"1234"` in dev mode, return `TokenResponse`
    - Register router in the main FastAPI app
    - _Requirements: 4.6, 4.7, 4.8, 4.9, 5.7, 5.8, 5.9, 5.10, 15.1, 15.3, 15.4_

  - [ ] 2.2 Write Hypothesis property test for admin role enforcement
    - **Property 9: Admin role enforcement on all admin endpoints**
    - **Validates: Requirements 15.2**
    - Tag: `# Feature: zexy-admin-foundation, Property 9: Admin role enforcement on all admin endpoints`
    - Generate arbitrary users with `role != admin`; verify every `/api/v1/admin` endpoint raises `AUTH_004`

  - [ ] 2.3 Write integration tests for admin auth endpoints (`zexy_api/tests/test_admin_auth.py`)
    - OTP send/verify happy path, `AUTH_004` for non-admin, `AUTH_005` for inactive account
    - 401 returned when no JWT provided
    - _Requirements: 4.6–4.9, 5.7–5.10, 15.2, 15.3_

- [ ] 3. zexy_api — Dashboard endpoints
  - [ ] 3.1 Implement dashboard endpoints in `zexy_api/app/api/v1/admin.py`
    - `GET /api/v1/admin/dashboard/stats`: query users table for counts, query payout_requests for pending count, compute growth percentages, return `DashboardStats` shape
    - `GET /api/v1/admin/dashboard/revenue-chart?days=30`: aggregate daily revenue from transactions for the last N days, return `[{ date, amount }]`
    - `GET /api/v1/admin/dashboard/activity?limit=10`: return most recent `activity_logs` entries
    - Apply `get_current_user_from_token` + admin role check to all three
    - _Requirements: 8.6, 8.7, 8.8, 8.9, 15.1, 15.2_

  - [ ] 3.2 Write integration tests for dashboard endpoints (`zexy_api/tests/test_admin_dashboard.py`)
    - Verify stats, revenue chart, and activity feed return correct shapes
    - Verify 401 without JWT
    - _Requirements: 8.6–8.9_

- [ ] 4. zexy_api — Users admin endpoints
  - [ ] 4.1 Implement users admin endpoints in `zexy_api/app/api/v1/admin.py`
    - `GET /api/v1/admin/users`: paginated list with `page`, `page_size`, `role`, `is_active`, `search` params; return `{ users, total, page, page_size, total_pages }`
    - `GET /api/v1/admin/users/{user_id}`: return full user detail with mobile masked to last 4 digits
    - `POST /api/v1/admin/users/{user_id}/deactivate`: set `is_active = False`, log to `activity_logs`, raise `DB_002` if not found
    - Apply admin role check to all endpoints
    - _Requirements: 9.6, 9.7, 9.8, 10.7, 10.8, 15.1, 15.2_

  - [ ] 4.2 Write Hypothesis property test for mobile number masking
    - **Property 6: Mobile number masking**
    - **Validates: Requirements 9.7**
    - Tag: `# Feature: zexy-admin-foundation, Property 6: Mobile number masking`
    - Generate arbitrary valid Indian mobile number strings; verify the endpoint response shows only the last 4 digits

  - [ ] 4.3 Write Hypothesis property test for user deactivation
    - **Property 7: Deactivation sets is_active to false**
    - **Validates: Requirements 10.7**
    - Tag: `# Feature: zexy-admin-foundation, Property 7: Deactivation sets is_active to false`
    - Generate arbitrary users with `is_active = True`; verify `POST .../deactivate` sets `is_active = False` in the database

  - [ ] 4.4 Write integration tests for users admin endpoints (`zexy_api/tests/test_admin_users.py`)
    - List pagination, search, role filter, detail with masked mobile, deactivate/activate transitions
    - 401 without JWT, `AUTH_004` for non-admin role
    - _Requirements: 9.6–9.8, 10.7, 10.8_

- [ ] 5. zexy_api — Payouts admin endpoints
  - [ ] 5.1 Implement payouts admin endpoints in `zexy_api/app/api/v1/admin.py`
    - `GET /api/v1/admin/payouts`: paginated list with `page`, `page_size`, `status` params; return paginated `PayoutRequest` records including `creator_username`
    - `POST /api/v1/admin/payouts/{payout_id}/approve`: set `status = approved`, record `actioned_by` and `actioned_at`, raise `DB_002` if not found
    - `POST /api/v1/admin/payouts/{payout_id}/reject`: set `status = rejected`, record `actioned_by` and `actioned_at`, raise `DB_002` if not found
    - Apply admin role check to all endpoints
    - _Requirements: 12.7, 12.8, 13.6, 13.7, 13.8, 15.1, 15.2_

  - [ ] 5.2 Write integration tests for payouts admin endpoints (`zexy_api/tests/test_admin_payouts.py`)
    - List with status filter, approve/reject transitions, `DB_002` for missing payout
    - 401 without JWT, `AUTH_004` for non-admin role
    - _Requirements: 12.7, 12.8, 13.6–13.8_

- [ ] 6. Checkpoint — zexy_api backend
  - Ensure all zexy_api tests pass and the Alembic migration applies cleanly. Ask the user if questions arise.

- [ ] 7. zexy_admin_web_app — Project scaffold and foundation
  - [ ] 7.1 Scaffold Next.js 15 project with App Router and TypeScript
    - Run `npx create-next-app@latest` with TypeScript, App Router, Tailwind CSS v4, and `src/` directory
    - Install dependencies: `@tanstack/react-query`, `@tanstack/react-table`, `axios`, `recharts`, `lucide-react`, `fast-check`
    - Install Shadcn UI and initialise it
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [ ] 7.2 Configure Tailwind, fonts, and dark theme
    - Add `fontFamily.headline` and `fontFamily.body` to `tailwind.config.ts`
    - Load Manrope (700, 800, 900) and Inter (400, 500, 600) from Google Fonts in `app/layout.tsx`
    - Set global background `#0a0a0a`, surface `#111`, border `#1e1e1e`, and primary purple gradient in `globals.css` / Tailwind config
    - _Requirements: 1.9, 1.10, 1.11_

  - [ ] 7.3 Create TypeScript types in `src/types/index.ts`
    - Define interfaces: `User`, `PayoutRequest`, `DashboardStats`, `RevenueDataPoint`, `ActivityLogEntry`, `PaginatedResponse<T>`, `TokenResponse`
    - _Requirements: 1.1_

  - [ ] 7.4 Create Axios instance (`src/lib/axios.ts`) and QueryClient (`src/lib/queryClient.ts`)
    - Axios request interceptor: read `admin_access_token` from localStorage, attach `Authorization: Bearer <token>`
    - Axios response interceptor: 401 → clear three tokens + redirect to `/login`; 403 → toast "Permission denied"; network error → toast "Connection error. Check your network."
    - Export singleton `QueryClient` from `src/lib/queryClient.ts`
    - Wrap app in `QueryClientProvider` in `app/layout.tsx`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 7.5 Create `AuthContext` and `useAuth` hook
    - `src/context/AuthContext.tsx`: store auth state (isAuthenticated, admin user), expose login/logout helpers
    - `src/hooks/useAuth.ts`: `login` calls `sendOtp`/`verifyOtp` services, stores tokens in localStorage, `logout` clears tokens and redirects
    - _Requirements: 5.4_

  - [ ] 7.6 Create Next.js route protection middleware (`middleware.ts`)
    - Intercept all routes; no `admin_access_token` → redirect to `/login`; authenticated on `/login` → redirect to `/dashboard`
    - `/login` is the only public route
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 7.7 Create service layer (`src/services/`)
    - `auth.ts`: `sendOtp(mobile)`, `verifyOtp(mobile, otp)`
    - `users.ts`: `getUsers(params)`, `getUserDetail(id)`, `deactivateUser(id)`, `activateUser(id)`
    - `payouts.ts`: `getPayouts(params)`, `approvePayout(id)`, `rejectPayout(id)`
    - `dashboard.ts`: `getDashboardStats()`, `getRevenueChart(days)`, `getActivityFeed(limit)`
    - _Requirements: 2.1_

- [ ] 8. zexy_admin_web_app — Common reusable components
  - [ ] 8.1 Implement `ZexyLogo` component (`src/components/common/ZexyLogo.tsx`)
    - Copy `zexy_logo_nobg.png` to `public/`
    - Accept `size: 'sm' | 'md' | 'lg'` and `showText: boolean`; render logo image + optional "ZEXY" wordmark in Manrope
    - _Requirements: 7.1_

  - [ ] 8.2 Implement `StatusBadge` component (`src/components/common/StatusBadge.tsx`)
    - Accept `status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected'`
    - Render colored pill: green for active/approved, red for inactive/rejected, yellow for pending
    - _Requirements: 7.2_

  - [ ] 8.3 Write fast-check property test for StatusBadge
    - **Property 4: StatusBadge renders correct color for any valid status**
    - **Validates: Requirements 7.2**
    - Tag: `// Feature: zexy-admin-foundation, Property 4: StatusBadge renders correct color for any valid status`
    - File: `src/components/common/StatusBadge.test.tsx`
    - Vary over all valid status enum values; assert correct color class is present

  - [ ] 8.4 Implement `ConfirmModal` component (`src/components/common/ConfirmModal.tsx`)
    - Accept `title`, `description`, `confirmLabel`, `variant: 'danger' | 'success' | 'default'`, `onConfirm`, `onCancel`, `isLoading`
    - `danger` → red button + `AlertTriangle` icon; `success` → green button + `CheckCircle` icon; `default` → purple button + `Info` icon
    - _Requirements: 7.3, 7.4, 7.5, 7.6_

  - [ ] 8.5 Implement `DataTable` component (`src/components/common/DataTable.tsx`)
    - Accept `columns`, `data`, `isLoading`; wrap TanStack Table v8; render loading skeleton when `isLoading` is true
    - _Requirements: 7.7_

  - [ ] 8.6 Implement `Pagination` component (`src/components/common/Pagination.tsx`)
    - Accept `page`, `totalPages`, `onPageChange`; render Previous/Next buttons and "Page X of Y" label
    - _Requirements: 7.8_

  - [ ] 8.7 Write fast-check property test for Pagination label
    - **Property 5: Pagination label correctness**
    - **Validates: Requirements 7.8**
    - Tag: `// Feature: zexy-admin-foundation, Property 5: Pagination label correctness`
    - File: `src/components/common/Pagination.test.tsx`
    - Vary `page` (1–N) and `totalPages` (1–N); assert rendered label reads exactly "Page {page} of {totalPages}"

  - [ ] 8.8 Implement `TabFilters` component (`src/components/common/TabFilters.tsx`)
    - Accept `tabs: { label, value, count }[]`, `active`, `onChange`
    - Active tab: `#1e1e2e` background + `#a855f7` border
    - _Requirements: 7.9_

  - [ ] 8.9 Implement `StatCard` component (`src/components/common/StatCard.tsx`)
    - Accept `label`, `value`, `change`, `changeDirection`
    - _Requirements: 7.10_

- [ ] 9. zexy_admin_web_app — Layout shell and sidebar
  - [ ] 9.1 Implement `Sidebar` component (`src/components/layout/Sidebar.tsx`)
    - Collapsed default: 40 px wide, icons only; hover/click expands to 200 px with labels
    - Active item: `#1e1e2e` background + `#a855f7` left border
    - Nav items: Dashboard (`LayoutDashboard`), Users (`Users`), Payouts (`Wallet`), Settings (`Settings`)
    - Bottom: admin avatar circle + `Settings` icon + `LogOut` icon
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 9.2 Implement `PageShell` component (`src/components/layout/PageShell.tsx`)
    - Compose `Sidebar` + main content area; wrap all authenticated pages
    - _Requirements: 6.1_

  - [ ] 9.3 Wire root layout and root redirect
    - `app/layout.tsx`: include `QueryClientProvider`, `AuthContext`, Google Fonts, dark background
    - `app/page.tsx`: redirect to `/dashboard`
    - _Requirements: 1.9, 2.5_

- [ ] 10. Checkpoint — scaffold and common components
  - Ensure the app builds without TypeScript errors and all common component tests pass. Ask the user if questions arise.

- [ ] 11. zexy_admin_web_app — Auth pages
  - [ ] 11.1 Implement `LoginForm` component (`src/components/auth/LoginForm.tsx`)
    - Mobile number input with +91 prefix; "Send OTP" button
    - On submit: call `sendOtp(mobile)` service; on success show OTP form; on `AUTH_004` show "Access denied. Admin accounts only."; on `AUTH_005` show "Your account is inactive. Contact support."
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 11.2 Implement `OtpForm` component (`src/components/auth/OtpForm.tsx`)
    - 4 individual `<input>` boxes; auto-advance focus on digit entry; Backspace moves to previous box
    - Auto-submit after 500 ms when all 4 filled
    - Resend button with 30-second countdown
    - On verify success: store tokens in localStorage, redirect to `/dashboard`
    - On verify failure: clear all boxes, focus first, show "Invalid OTP. Try again."
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ] 11.3 Write fast-check property test for OTP auto-advance
    - **Property 2: OTP input auto-advance**
    - **Validates: Requirements 5.1**
    - Tag: `// Feature: zexy-admin-foundation, Property 2: OTP input auto-advance`
    - File: `src/components/auth/OtpForm.test.tsx`
    - Vary digit value (0–9) and box index (0–2); assert focus advances to the next input box

  - [ ] 11.4 Write fast-check property test for token storage
    - **Property 3: Token storage on successful verify**
    - **Validates: Requirements 5.4**
    - Tag: `// Feature: zexy-admin-foundation, Property 3: Token storage on successful verify`
    - File: `src/hooks/useAuth.test.ts`
    - Vary arbitrary `access_token`, `refresh_token`, `session_token` strings in `TokenResponse`; assert each is stored under the correct localStorage key

  - [ ] 11.5 Build `/login` page (`src/app/login/page.tsx`)
    - Split-screen layout: purple gradient brand panel left, mobile OTP form right
    - Compose `LoginForm` and `OtpForm`
    - _Requirements: 4.1_

- [ ] 12. zexy_admin_web_app — Axios instance property test
  - [ ] 12.1 Write fast-check property test for Axios auth header attachment
    - **Property 1: Axios auth header attachment**
    - **Validates: Requirements 2.1**
    - Tag: `// Feature: zexy-admin-foundation, Property 1: Axios auth header attachment`
    - File: `src/lib/axios.test.ts`
    - Vary arbitrary token strings stored in localStorage as `admin_access_token`; assert every outgoing request includes `Authorization: Bearer <token>` with that exact value

  - [ ] 12.2 Write unit tests for Axios interceptors (`src/lib/axios.test.ts`)
    - 401 response → clears all three tokens + redirects to `/login`
    - 403 response → shows "Permission denied" toast
    - Network error → shows "Connection error. Check your network." toast
    - _Requirements: 2.2, 2.3, 2.4_

  - [ ] 12.3 Write unit tests for route middleware
    - Unauthenticated request → redirects to `/login`
    - Authenticated request on `/login` → redirects to `/dashboard`
    - _Requirements: 3.2, 3.3_

- [ ] 13. zexy_admin_web_app — Dashboard page
  - [ ] 13.1 Implement `useDashboard` hook (`src/hooks/useDashboard.ts`)
    - `statsQuery`: `GET /api/v1/admin/dashboard/stats` via TanStack Query
    - `revenueChartQuery`: `GET /api/v1/admin/dashboard/revenue-chart?days=30`
    - `activityFeedQuery`: `GET /api/v1/admin/dashboard/activity?limit=10`
    - _Requirements: 8.2, 8.3, 8.4_

  - [ ] 13.2 Implement `RevenueChart` component (`src/components/dashboard/RevenueChart.tsx`)
    - Recharts `BarChart` showing daily revenue for last 30 days
    - _Requirements: 8.3_

  - [ ] 13.3 Implement `ActivityFeed` component (`src/components/dashboard/ActivityFeed.tsx`)
    - Render last 10 activity log entries with action description and relative timestamp
    - _Requirements: 8.4_

  - [ ] 13.4 Build `/dashboard` page (`src/app/dashboard/page.tsx`)
    - Wrap in `PageShell`; render four `StatCard` components (Total Users, Total Creators, Revenue This Month, Pending Payouts)
    - Render `RevenueChart` and `ActivityFeed`
    - Show pending payouts badge linking to `/payouts` when `pending_payouts_count > 0`
    - _Requirements: 8.1, 8.2, 8.5_

- [ ] 14. zexy_admin_web_app — Users page
  - [ ] 14.1 Implement `useUsers` hook (`src/hooks/useUsers.ts`)
    - `usersQuery`: `GET /api/v1/admin/users` with page/filter params via TanStack Query
    - `userDetailQuery(id)`: `GET /api/v1/admin/users/{id}`
    - `deactivateMutation`: `POST .../deactivate`, invalidates `['users']` on success
    - `activateMutation`: `POST .../activate`, invalidates `['users']` on success
    - _Requirements: 9.3, 9.4, 9.5, 10.4, 10.5, 10.6_

  - [ ] 14.2 Implement `UserFilters` component (`src/components/users/UserFilters.tsx`)
    - `TabFilters` with tabs: All, Creators, Fans, Inactive (each with count)
    - Debounced search input (300 ms delay) passing `search` param to API
    - _Requirements: 9.2, 9.3, 9.4_

  - [ ] 14.3 Implement `UsersTable` component (`src/components/users/UsersTable.tsx`)
    - TanStack Table columns: User (username + avatar placeholder), Role, Status (`StatusBadge`), Joined, Actions
    - Actions column: "View details" button; Deactivate (active users) / Activate (inactive users) button
    - On Deactivate click: open `ConfirmModal` with `variant='danger'` and message "Deactivate @{username}? This will prevent them from logging in."
    - On Activate click: open `ConfirmModal` with `variant='success'` and message "Activate @{username}? This will restore their access."
    - _Requirements: 9.1, 10.1, 10.2, 10.3_

  - [ ] 14.4 Implement `UserDrawer` component (`src/components/users/UserDrawer.tsx`)
    - Right-side slide-in drawer; fetch user detail via `userDetailQuery`
    - Display: id, masked mobile, name, username, role, status, joined date, last login, onboarding step
    - Read-only; no edit capability
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ] 14.5 Build `/users` page (`src/app/users/page.tsx`)
    - Wrap in `PageShell`; compose `UserFilters`, `UsersTable`, `Pagination`, `UserDrawer`
    - Server-side pagination: 20 rows per page
    - _Requirements: 9.1, 9.5_

- [ ] 15. zexy_admin_web_app — Payouts page
  - [ ] 15.1 Implement `usePayouts` hook (`src/hooks/usePayouts.ts`)
    - `payoutsQuery`: `GET /api/v1/admin/payouts` with page/status params via TanStack Query
    - `approveMutation`: `POST .../approve`, invalidates `['payouts']` on success
    - `rejectMutation`: `POST .../reject`, invalidates `['payouts']` on success
    - _Requirements: 12.4, 13.3, 13.4, 13.5_

  - [ ] 15.2 Implement `PayoutFilters` component (`src/components/payouts/PayoutFilters.tsx`)
    - `TabFilters` with tabs: Pending (default), Approved, Rejected, All
    - Pending tab shows count badge
    - _Requirements: 12.2, 12.3, 12.4_

  - [ ] 15.3 Implement `PayoutsTable` component (`src/components/payouts/PayoutsTable.tsx`)
    - TanStack Table columns: Creator (username), Amount (₹, green), Requested date, Status (`StatusBadge`), Actions
    - Approve and Reject buttons shown only on Pending tab rows
    - On Approve click: open `ConfirmModal` with `variant='success'` and message "Approve payout of ₹{amount} to @{username}?"
    - On Reject click: open `ConfirmModal` with `variant='danger'` and message "Reject payout of ₹{amount} to @{username}?"
    - _Requirements: 12.1, 12.6, 13.1, 13.2_

  - [ ] 15.4 Build `/payouts` page (`src/app/payouts/page.tsx`)
    - Wrap in `PageShell`; compose `PayoutFilters`, `PayoutsTable`, `Pagination`
    - Server-side pagination: 20 rows per page; default to Pending tab
    - _Requirements: 12.1, 12.5_

- [ ] 16. Final checkpoint — full integration
  - Ensure all tests pass in both repos, the app builds without TypeScript errors, and the Alembic migration applies cleanly. Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Implementation order respects dependencies: `zexy_api` backend (tasks 1–6) must be complete before frontend work begins (tasks 7–16)
- Each task references specific requirements for traceability
- Property tests use **fast-check** (frontend) and **Hypothesis** (backend); each runs a minimum of 100 iterations
- Unit tests and property tests are complementary — both are included where applicable
- Checkpoints (tasks 6, 10, 16) ensure incremental validation across both repos
