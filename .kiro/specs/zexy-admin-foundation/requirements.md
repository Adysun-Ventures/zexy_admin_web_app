# Requirements Document

## Introduction

The Zexy Admin Web App Foundation is a greenfield Next.js 15 admin dashboard for Zexy platform administrators. It provides oversight of users, payout management, and platform health metrics. The foundation covers: project scaffold, authentication via mobile OTP, a dashboard page, a users management page, and a payouts management page. It is backed by new admin-specific FastAPI endpoints added to `zexy_api`.

Repos affected: `zexy_admin_web_app` (new) and `zexy_api` (new admin endpoints).

---

## Glossary

- **Admin_App**: The Next.js 15 admin web application being built in `zexy_admin_web_app`.
- **Admin_API**: The FastAPI backend in `zexy_api` that serves admin-specific endpoints.
- **Admin**: A platform user whose `role` field equals `admin` in the `users` table.
- **OTP**: A 4-digit one-time password sent to the admin's registered mobile number.
- **JWT**: JSON Web Token returned by the Admin_API after successful OTP verification; stored in `localStorage`.
- **Sidebar**: The collapsible icon navigation panel on the left side of the Admin_App layout.
- **ConfirmModal**: A reusable confirmation dialog component with a `variant` prop (`danger` | `success` | `default`).
- **DataTable**: A reusable TanStack Table v8 wrapper component used for Users and Payouts tables.
- **Pagination**: A reusable component providing Previous/Next navigation and a "Page X of Y" indicator.
- **TabFilters**: A reusable styled tab row component used to filter table data by category.
- **StatusBadge**: A colored pill badge component indicating entity status (active, inactive, pending, approved, rejected).
- **StatCard**: A dashboard metric card showing a label, value, and percentage change.
- **PageShell**: A layout wrapper component that composes the Sidebar and main content area.
- **UserDrawer**: A right-side slide-in drawer showing full user detail without navigating away.
- **PayoutRequest**: A new database model in `zexy_api` representing a creator payout request.
- **TanStack_Query**: TanStack Query v5, used for server state management and cache invalidation.
- **Axios_Instance**: The configured Axios HTTP client with auth interceptors, mirroring the creator app pattern.
- **Activity_Logs**: The existing `activity_logs` table in `zexy_api` recording platform events.

---

## Requirements

### Requirement 1: Project Scaffold and Tech Stack

**User Story:** As a developer, I want a correctly scaffolded Next.js 15 project with the agreed tech stack, so that all contributors work from a consistent, reproducible foundation.

#### Acceptance Criteria

1. THE Admin_App SHALL be scaffolded as a Next.js 15 project using the App Router with TypeScript enabled.
2. THE Admin_App SHALL use Tailwind CSS v4 for styling.
3. THE Admin_App SHALL include Shadcn UI as the component library.
4. THE Admin_App SHALL include `lucide-react` as the icon library.
5. THE Admin_App SHALL include TanStack Table v8 (`@tanstack/react-table`) for data tables.
6. THE Admin_App SHALL include TanStack Query v5 (`@tanstack/react-query`) for server state management.
7. THE Admin_App SHALL include Recharts for data visualisation.
8. THE Admin_App SHALL include Axios as the HTTP client.
9. THE Admin_App SHALL load Manrope (weights 700, 800, 900) and Inter (weights 400, 500, 600) from Google Fonts in `app/layout.tsx`.
10. THE Admin_App SHALL configure Tailwind with `fontFamily.headline = ['Manrope', 'sans-serif']` and `fontFamily.body = ['Inter', 'sans-serif']`.
11. THE Admin_App SHALL apply a dark theme with background `#0a0a0a`, surface `#111`, border `#1e1e1e`, and primary purple gradient `#7c3aed → #a855f7`.

---

### Requirement 2: Axios Instance and Query Client

**User Story:** As a developer, I want a pre-configured Axios instance and TanStack Query client, so that all API calls share consistent auth headers and error handling without duplication.

#### Acceptance Criteria

1. THE Axios_Instance SHALL attach an `Authorization: Bearer <token>` header to every outgoing request by reading `admin_access_token` from `localStorage`.
2. WHEN the Admin_API returns a 401 response, THE Axios_Instance SHALL clear `admin_access_token`, `admin_refresh_token`, and `admin_session_token` from `localStorage` and redirect the browser to `/login`.
3. WHEN the Admin_API returns a 403 response, THE Axios_Instance SHALL display a toast notification with the message "Permission denied".
4. WHEN a network error occurs, THE Axios_Instance SHALL display a toast notification with the message "Connection error. Check your network."
5. THE Admin_App SHALL export a singleton TanStack_Query `QueryClient` instance from `src/lib/queryClient.ts` and wrap the application in a `QueryClientProvider` in `app/layout.tsx`.

---

### Requirement 3: Route Protection Middleware

**User Story:** As a security requirement, I want unauthenticated users redirected to login and authenticated users redirected away from login, so that protected pages are never accessible without a valid token.

#### Acceptance Criteria

1. THE Admin_App SHALL include a Next.js `middleware.ts` at the project root that intercepts all route navigations.
2. WHEN an unauthenticated request (no `admin_access_token` cookie or header) reaches any protected route, THE Admin_App SHALL redirect the request to `/login`.
3. WHEN an authenticated request reaches `/login`, THE Admin_App SHALL redirect the request to `/dashboard`.
4. THE Admin_App SHALL treat `/login` as the only public route; all other routes SHALL require authentication.

---

### Requirement 4: Authentication — OTP Send

**User Story:** As an admin, I want to enter my mobile number and receive an OTP, so that I can securely log in without a password.

#### Acceptance Criteria

1. THE Admin_App SHALL render a split-screen login page at `/login` with a purple gradient brand panel on the left and a mobile OTP form on the right.
2. WHEN an admin submits a valid Indian mobile number, THE Admin_App SHALL call `POST /api/v1/admin/auth/otp/send` with `{ mobile }`.
3. WHEN the OTP send request succeeds, THE Admin_App SHALL display the 4-digit OTP input form.
4. IF the OTP send request returns an `AUTH_004` error, THEN THE Admin_App SHALL display the message "Access denied. Admin accounts only." below the mobile input.
5. IF the OTP send request returns an `AUTH_005` error, THEN THE Admin_App SHALL display the message "Your account is inactive. Contact support." below the mobile input.
6. THE Admin_API SHALL expose `POST /api/v1/admin/auth/otp/send` under the `/admin/auth` prefix.
7. WHEN `POST /api/v1/admin/auth/otp/send` is called, THE Admin_API SHALL send an OTP only if the user exists AND `role == admin`; otherwise THE Admin_API SHALL raise `AUTH_004`.
8. WHEN `POST /api/v1/admin/auth/otp/send` is called for an inactive admin account, THE Admin_API SHALL raise `AUTH_005`.
9. THE Admin_API SHALL enforce a rate limit of 5 OTP send requests per 5 minutes per mobile number on `POST /api/v1/admin/auth/otp/send`.

---

### Requirement 5: Authentication — OTP Verify

**User Story:** As an admin, I want to enter the OTP I received and be granted access, so that I can reach the dashboard.

#### Acceptance Criteria

1. THE Admin_App SHALL render 4 individual `<input>` boxes for OTP entry that auto-advance focus on digit entry.
2. WHEN the user presses Backspace in an OTP box, THE Admin_App SHALL move focus to the previous box.
3. WHEN all 4 OTP boxes are filled, THE Admin_App SHALL automatically submit the OTP after a 500 ms delay.
4. WHEN the OTP verify request succeeds, THE Admin_App SHALL store `access_token` as `admin_access_token`, `refresh_token` as `admin_refresh_token`, and `session_token` as `admin_session_token` in `localStorage`, then redirect to `/dashboard`.
5. IF the OTP verify request fails, THEN THE Admin_App SHALL clear all 4 OTP boxes, focus the first box, and display the message "Invalid OTP. Try again."
6. THE Admin_App SHALL display a resend button with a 30-second countdown; WHEN the countdown reaches zero, THE Admin_App SHALL enable the resend button.
7. THE Admin_API SHALL expose `POST /api/v1/admin/auth/otp/verify` under the `/admin/auth` prefix.
8. WHEN `POST /api/v1/admin/auth/otp/verify` is called, THE Admin_API SHALL verify the OTP and raise `AUTH_004` if the user's `role != admin`.
9. WHERE the Admin_API is running in development mode, THE Admin_API SHALL accept `"1234"` as a valid OTP for `POST /api/v1/admin/auth/otp/verify`.
10. WHEN `POST /api/v1/admin/auth/otp/verify` succeeds, THE Admin_API SHALL return a `TokenResponse` containing `access_token`, `refresh_token`, and `session_token`.

---

### Requirement 6: Layout Shell and Sidebar Navigation

**User Story:** As an admin, I want a persistent sidebar with navigation links, so that I can move between pages without losing context.

#### Acceptance Criteria

1. THE Admin_App SHALL render a `PageShell` component on all authenticated pages that composes the Sidebar and the main content area.
2. THE Sidebar SHALL be 40 px wide in its collapsed (default) state, showing only icons.
3. WHEN the user hovers over or clicks the Sidebar, THE Sidebar SHALL expand to 200 px wide and display navigation labels alongside icons.
4. THE Sidebar SHALL include navigation items for Dashboard (`/dashboard`), Users (`/users`), Payouts (`/payouts`), and Settings (`/settings`).
5. WHEN a navigation item matches the current route, THE Sidebar SHALL apply a `#1e1e2e` background and `#a855f7` left border to that item.
6. THE Sidebar SHALL display an admin avatar circle and a settings icon at the bottom.
7. THE Admin_App SHALL use `lucide-react` icons: `LayoutDashboard` for Dashboard, `Users` for Users, `Wallet` for Payouts, `Settings` for Settings, and `LogOut` for logout.

---

### Requirement 7: Common Reusable Components

**User Story:** As a developer, I want a library of shared UI components, so that all pages maintain visual consistency and avoid duplicated logic.

#### Acceptance Criteria

1. THE Admin_App SHALL provide a `ZexyLogo` component in `src/components/common/` accepting `size` (`'sm' | 'md' | 'lg'`) and `showText` (boolean) props, rendering the logo image and an optional "ZEXY" wordmark in Manrope font.
2. THE Admin_App SHALL provide a `StatusBadge` component accepting a `status` prop of `'active' | 'inactive' | 'pending' | 'approved' | 'rejected'` and rendering a colored pill badge.
3. THE Admin_App SHALL provide a `ConfirmModal` component accepting `title`, `description`, `confirmLabel`, `variant` (`'danger' | 'success' | 'default'`), `onConfirm`, `onCancel`, and `isLoading` props.
4. WHEN `ConfirmModal` is rendered with `variant='danger'`, THE Admin_App SHALL display a red confirm button and an `AlertTriangle` icon in the modal header.
5. WHEN `ConfirmModal` is rendered with `variant='success'`, THE Admin_App SHALL display a green confirm button and a `CheckCircle` icon in the modal header.
6. WHEN `ConfirmModal` is rendered with `variant='default'`, THE Admin_App SHALL display a purple confirm button and an `Info` icon in the modal header.
7. THE Admin_App SHALL provide a `DataTable` component accepting `columns`, `data`, and `isLoading` props, wrapping TanStack Table v8 and rendering a loading skeleton WHILE `isLoading` is true.
8. THE Admin_App SHALL provide a `Pagination` component accepting `page`, `totalPages`, and `onPageChange` props, rendering Previous/Next buttons and a "Page X of Y" label.
9. THE Admin_App SHALL provide a `TabFilters` component accepting `tabs` (array of `{ label, value, count }`), `active`, and `onChange` props, rendering a styled tab row where the active tab has a `#1e1e2e` background and `#a855f7` border.
10. THE Admin_App SHALL provide a `StatCard` component accepting `label`, `value`, `change`, and `changeDirection` props for use on the Dashboard page.

---

### Requirement 8: Dashboard Page

**User Story:** As an admin, I want a dashboard page showing platform health metrics, so that I can quickly assess the state of the platform.

#### Acceptance Criteria

1. THE Admin_App SHALL render a dashboard page at `/dashboard` displaying four `StatCard` components: Total Users, Total Creators, Revenue This Month (₹), and Pending Payouts count.
2. WHEN the dashboard loads, THE Admin_App SHALL fetch stats from `GET /api/v1/admin/dashboard/stats` via TanStack_Query.
3. THE Admin_App SHALL render a Recharts `BarChart` on the dashboard showing daily revenue for the last 30 days, with data fetched from `GET /api/v1/admin/dashboard/revenue-chart?days=30`.
4. THE Admin_App SHALL render a Recent Activity feed on the dashboard showing the last 10 entries from `GET /api/v1/admin/dashboard/activity?limit=10`, each displaying an action description and a relative timestamp.
5. WHEN `pending_payouts_count` is greater than 0, THE Admin_App SHALL display a badge in the top-right area of the dashboard that navigates to `/payouts` when clicked.
6. THE Admin_API SHALL expose `GET /api/v1/admin/dashboard/stats` returning `{ total_users, total_creators, total_fans, revenue_this_month, pending_payouts_count, user_growth_pct, creator_growth_pct, revenue_growth_pct }`.
7. THE Admin_API SHALL expose `GET /api/v1/admin/dashboard/revenue-chart` accepting a `days` query parameter and returning an array of `{ date, amount }` objects.
8. THE Admin_API SHALL expose `GET /api/v1/admin/dashboard/activity` accepting a `limit` query parameter and returning recent Activity_Logs entries.
9. WHEN any dashboard endpoint is called without a valid admin JWT, THE Admin_API SHALL return a 401 or 403 error.

---

### Requirement 9: Users Page — List and Filter

**User Story:** As an admin, I want to view all platform users with filtering and search, so that I can find and review specific accounts efficiently.

#### Acceptance Criteria

1. THE Admin_App SHALL render a users page at `/users` displaying a `DataTable` with columns: User (username + avatar placeholder), Role, Status, Joined date, and Actions.
2. THE Admin_App SHALL render `TabFilters` on the users page with tabs: All, Creators, Fans, and Inactive, each showing a count in parentheses.
3. WHEN an admin selects a tab, THE Admin_App SHALL refetch the users list passing the corresponding `role` or `is_active` filter to the API.
4. THE Admin_App SHALL render a debounced search input (300 ms delay) on the users page that passes a `search` query parameter to `GET /api/v1/admin/users`.
5. THE Admin_App SHALL implement server-side pagination on the users page with 20 rows per page, using the `Pagination` component.
6. THE Admin_API SHALL expose `GET /api/v1/admin/users` accepting `page`, `page_size`, `role`, `is_active`, and `search` query parameters and returning `{ users, total, page, page_size, total_pages }`.
7. THE Admin_API SHALL expose `GET /api/v1/admin/users/{user_id}` returning full user detail with the mobile number masked to show only the last 4 digits.
8. WHEN any users endpoint is called without a valid admin JWT, THE Admin_API SHALL return a 401 or 403 error.

---

### Requirement 10: Users Page — Deactivate and Activate Actions

**User Story:** As an admin, I want to deactivate or activate user accounts with a confirmation step, so that I can moderate the platform without accidental changes.

#### Acceptance Criteria

1. THE Admin_App SHALL render Deactivate and Activate action buttons in the Actions column of the users table, showing Deactivate for active users and Activate for inactive users.
2. WHEN an admin clicks Deactivate, THE Admin_App SHALL open a `ConfirmModal` with `variant='danger'` and the message "Deactivate @{username}? This will prevent them from logging in."
3. WHEN an admin clicks Activate, THE Admin_App SHALL open a `ConfirmModal` with `variant='success'` and the message "Activate @{username}? This will restore their access."
4. WHEN the admin confirms deactivation, THE Admin_App SHALL call `POST /api/v1/admin/users/{user_id}/deactivate` and on success invalidate the TanStack_Query `['users']` cache to trigger a table refetch.
5. WHEN the admin confirms activation, THE Admin_App SHALL call `POST /api/v1/admin/users/{user_id}/activate` and on success invalidate the TanStack_Query `['users']` cache to trigger a table refetch.
6. IF the deactivate or activate API call fails, THEN THE Admin_App SHALL display a toast error notification, close the modal, and NOT apply any optimistic update.
7. THE Admin_API SHALL expose `POST /api/v1/admin/users/{user_id}/deactivate` that sets `is_active = False` for the target user and logs the action to Activity_Logs.
8. WHEN `POST /api/v1/admin/users/{user_id}/deactivate` is called, THE Admin_API SHALL raise `DB_002` if the target user does not exist.

---

### Requirement 11: Users Page — User Detail Drawer

**User Story:** As an admin, I want to view full details of a user in a side drawer, so that I can inspect account information without leaving the users list.

#### Acceptance Criteria

1. THE Admin_App SHALL render a "View details" action in the users table Actions column.
2. WHEN an admin clicks "View details", THE Admin_App SHALL open a `UserDrawer` sliding in from the right side of the screen.
3. THE UserDrawer SHALL display: user id, masked mobile (last 4 digits), name, username, role, status, joined date, last login date, and onboarding step.
4. THE UserDrawer SHALL fetch user detail from `GET /api/v1/admin/users/{user_id}` via TanStack_Query.
5. THE UserDrawer SHALL NOT provide any edit capability in the MVP.

---

### Requirement 12: Payouts Page — List and Filter

**User Story:** As an admin, I want to view payout requests from creators with status filtering, so that I can manage the payout queue efficiently.

#### Acceptance Criteria

1. THE Admin_App SHALL render a payouts page at `/payouts` displaying a `DataTable` with columns: Creator (username), Amount (₹, green), Requested date, Status badge, and Actions.
2. THE Admin_App SHALL render `TabFilters` on the payouts page with tabs: Pending, Approved, Rejected, and All, defaulting to the Pending tab.
3. THE Admin_App SHALL display a count badge on the Pending tab showing the number of pending payout requests.
4. WHEN an admin selects a tab, THE Admin_App SHALL refetch the payouts list passing the corresponding `status` filter to the API.
5. THE Admin_App SHALL implement server-side pagination on the payouts page with 20 rows per page, using the `Pagination` component.
6. THE Admin_App SHALL show Approve and Reject action buttons only on rows displayed under the Pending tab.
7. THE Admin_API SHALL expose `GET /api/v1/admin/payouts` accepting `page`, `page_size`, and `status` query parameters and returning paginated `PayoutRequest` records.
8. WHEN any payouts endpoint is called without a valid admin JWT, THE Admin_API SHALL return a 401 or 403 error.

---

### Requirement 13: Payouts Page — Approve and Reject Actions

**User Story:** As an admin, I want to approve or reject payout requests with a confirmation step, so that creator payments are processed accurately and intentionally.

#### Acceptance Criteria

1. WHEN an admin clicks Approve on a payout row, THE Admin_App SHALL open a `ConfirmModal` with `variant='success'` and the message "Approve payout of ₹{amount} to @{username}?"
2. WHEN an admin clicks Reject on a payout row, THE Admin_App SHALL open a `ConfirmModal` with `variant='danger'` and the message "Reject payout of ₹{amount} to @{username}?"
3. WHEN the admin confirms approval, THE Admin_App SHALL call `POST /api/v1/admin/payouts/{payout_id}/approve` and on success invalidate the TanStack_Query `['payouts']` cache to trigger a table refetch.
4. WHEN the admin confirms rejection, THE Admin_App SHALL call `POST /api/v1/admin/payouts/{payout_id}/reject` and on success invalidate the TanStack_Query `['payouts']` cache to trigger a table refetch.
5. IF the approve or reject API call fails, THEN THE Admin_App SHALL display a toast error notification, close the modal, and NOT apply any optimistic update.
6. THE Admin_API SHALL expose `POST /api/v1/admin/payouts/{payout_id}/approve` that sets `status = approved`, records `actioned_by` (admin user id) and `actioned_at` (current timestamp) on the `PayoutRequest` record.
7. THE Admin_API SHALL expose `POST /api/v1/admin/payouts/{payout_id}/reject` that sets `status = rejected`, records `actioned_by` and `actioned_at` on the `PayoutRequest` record.
8. WHEN `POST /api/v1/admin/payouts/{payout_id}/approve` or `POST /api/v1/admin/payouts/{payout_id}/reject` is called, THE Admin_API SHALL raise `DB_002` if the target `PayoutRequest` does not exist.

---

### Requirement 14: PayoutRequest Data Model and Migration

**User Story:** As a developer, I want a `PayoutRequest` database model and Alembic migration, so that payout data is persisted correctly in `zexy_api`.

#### Acceptance Criteria

1. THE Admin_API SHALL define a `PayoutRequest` SQLAlchemy model with fields: `id` (primary key), `creator_uid` (FK → `users.id`), `amount` (Decimal), `status` (Enum: `pending` | `approved` | `rejected`), `requested_at` (DateTime), `actioned_at` (DateTime, nullable), `actioned_by` (FK → `users.id`, nullable), and `notes` (String, nullable).
2. THE Admin_API SHALL include an Alembic migration that creates the `payout_requests` table with all fields and foreign key constraints defined in Acceptance Criterion 1.
3. WHEN the Alembic migration is applied, THE Admin_API SHALL be able to create, read, and update `PayoutRequest` records without errors.

---

### Requirement 15: Admin Role Enforcement on All Admin Endpoints

**User Story:** As a security requirement, I want every admin API endpoint to verify the caller is an admin, so that non-admin users cannot access or modify sensitive platform data.

#### Acceptance Criteria

1. THE Admin_API SHALL apply the `get_current_user_from_token` dependency to every endpoint under the `/api/v1/admin` prefix.
2. WHEN any `/api/v1/admin` endpoint is called by a user whose `role != admin`, THE Admin_API SHALL raise `AUTH_004`.
3. WHEN any `/api/v1/admin` endpoint is called without a valid JWT, THE Admin_API SHALL return a 401 Unauthorized response.
4. THE Admin_API SHALL NOT create new user accounts via the admin auth endpoints; admin accounts SHALL pre-exist in the database.
