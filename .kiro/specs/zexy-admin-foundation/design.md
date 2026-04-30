# Design Document: Zexy Admin Foundation

## Overview

Greenfield Next.js 15 admin dashboard for Zexy platform administrators. Provides oversight of users, payout management, and platform health metrics. Backed by new admin-specific FastAPI endpoints in `zexy_api`.

This spec covers the foundation: project scaffold, authentication via mobile OTP, a dashboard page, a users management page, and a payouts management page. Content moderation, analytics, and system monitoring are out of scope for this iteration.

**Repos affected:**
- `zexy_admin_web_app` — new Next.js 15 application
- `zexy_api` — new admin endpoints added to the existing FastAPI service

---

## Architecture

### High-Level Data Flow

```
Admin browser
  → Next.js middleware (checks admin_access_token in localStorage)
  → Page component (App Router)
  → TanStack Query hook (useUsers, usePayouts, useDashboard, useAuth)
  → Axios service function (with auth interceptor)
  → zexy_api FastAPI endpoint (/api/v1/admin/*)
  → AdminService / CRUD layer
  → MySQL database
```

### Mutation Flow (e.g. deactivate user)

1. Admin clicks "Deactivate" in the users table
2. `ConfirmModal` opens with `variant='danger'`
3. Admin confirms
4. `useUsers.deactivateUser(id)` called
5. Axios `POST /api/v1/admin/users/{id}/deactivate`
6. On success: TanStack Query invalidates `['users']` cache → table refetches
7. Toast notification shown

### Authentication Flow

```
/login page
  → Admin enters mobile number
  → POST /api/v1/admin/auth/otp/send
  → OTP form displayed
  → Admin enters 4-digit OTP (auto-submit after 500ms)
  → POST /api/v1/admin/auth/otp/verify
  → JWT stored in localStorage (admin_access_token, admin_refresh_token, admin_session_token)
  → Redirect to /dashboard
```

### Route Protection

Next.js `middleware.ts` at the project root intercepts all navigations:
- No `admin_access_token` → redirect to `/login`
- Authenticated request to `/login` → redirect to `/dashboard`
- `/login` is the only public route

---

## Components and Interfaces

### Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | Matches `zexy_website` ecosystem |
| Language | TypeScript | Matches all existing repos |
| Styling | Tailwind CSS v4 | Matches `zexy_website` |
| UI Components | Shadcn UI | README-specified, pairs with Next.js + Tailwind |
| Icons | Lucide React | Used throughout `zexy_website` |
| Fonts | Manrope + Inter (Google Fonts) | Matches creator app: Manrope = headlines, Inter = body |
| Data Tables | TanStack Table v8 | README-specified |
| Charts | Recharts | README-specified, lightweight |
| HTTP Client | Axios | Matches creator app pattern — reuse interceptor structure |
| Server State | TanStack Query v5 | Matches creator app |
| Token Storage | localStorage | MVP — upgrade to httpOnly cookies in future security pass |

### Visual Design

**Color palette:**
- Background: `#0a0a0a` / `#0d0d0d`
- Surface: `#111` / `#1a1a1a`
- Border: `#1e1e1e` / `#2a2a2a`
- Primary: purple gradient `#7c3aed → #a855f7`
- Accent: `#e879f9`
- Success: `#22c55e` | Warning: `#f97316` | Danger: `#ef4444`

**Typography:**
- Headline/Display: `Manrope` (700, 800, 900) — page titles, stat numbers, logo wordmark
- Body/Label: `Inter` (400, 500, 600) — table content, descriptions, badges

Tailwind font config:
```js
fontFamily: {
  headline: ['Manrope', 'sans-serif'],
  body: ['Inter', 'sans-serif'],
}
```

### Common Components (`src/components/common/`)

| Component | Props | Purpose |
|---|---|---|
| `ZexyLogo` | `size: 'sm'\|'md'\|'lg'`, `showText: boolean` | Brand logo + optional "ZEXY" wordmark in Manrope |
| `StatusBadge` | `status: 'active'\|'inactive'\|'pending'\|'approved'\|'rejected'` | Colored pill badge |
| `ConfirmModal` | `title`, `description`, `confirmLabel`, `variant: 'danger'\|'success'\|'default'`, `onConfirm`, `onCancel`, `isLoading` | Reusable confirm dialog — `variant` drives button color + header icon: `danger`→red+AlertTriangle, `success`→green+CheckCircle, `default`→purple+Info |
| `DataTable` | `columns`, `data`, `isLoading` | TanStack Table v8 wrapper with loading skeleton |
| `Pagination` | `page`, `totalPages`, `onPageChange` | Previous/Next buttons + "Page X of Y" label |
| `TabFilters` | `tabs: {label, value, count}[]`, `active`, `onChange` | Styled tab row; active tab: `#1e1e2e` bg + `#a855f7` border |
| `PageShell` | `children` | Sidebar + main content layout wrapper |
| `StatCard` | `label`, `value`, `change`, `changeDirection` | Dashboard metric card |

### Layout Components (`src/components/layout/`)

**Sidebar:**
- Collapsed (default): 40px wide, icons only
- Expanded (hover/click): 200px wide, icons + labels
- Active item: `#1e1e2e` background + `#a855f7` left border
- Bottom: admin avatar circle + settings icon
- Icons: `LayoutDashboard` (Dashboard), `Users` (Users), `Wallet` (Payouts), `Settings` (Settings), `LogOut` (logout)

**Navigation items:**
```
Dashboard    /dashboard
Users        /users
Payouts      /payouts
Settings     /settings   (placeholder in MVP)
```

### Auth Components (`src/components/auth/`)

**LoginForm:** Mobile number input with +91 prefix, "Send OTP" button.

**OtpForm:**
- 4 individual `<input>` boxes
- Auto-advance focus on digit entry
- Backspace moves focus to previous box
- Auto-submit after 500ms when all 4 filled
- Resend button with 30-second countdown
- Error state: clear all boxes, focus first, show error message

### Page-Specific Components

**Dashboard (`src/components/dashboard/`):**
- `StatCard` — metric display (Total Users, Total Creators, Revenue This Month, Pending Payouts)
- `RevenueChart` — Recharts `BarChart`, last 30 days daily revenue
- `ActivityFeed` — last 10 `activity_logs` entries with relative timestamps

**Users (`src/components/users/`):**
- `UsersTable` — TanStack Table with columns: User, Role, Status, Joined, Actions
- `UserDrawer` — right-side slide-in drawer showing user detail (id, masked mobile, name, username, role, status, joined date, last login, onboarding step); read-only in MVP
- `UserFilters` — TabFilters (All | Creators | Fans | Inactive) + debounced search input (300ms)

**Payouts (`src/components/payouts/`):**
- `PayoutsTable` — TanStack Table with columns: Creator, Amount (₹, green), Requested date, Status, Actions
- `PayoutFilters` — TabFilters (Pending | Approved | Rejected | All), default Pending

### Axios Instance (`src/lib/axios.ts`)

Mirrors creator app interceptor pattern:
- **Request interceptor**: reads `admin_access_token` from localStorage, attaches `Authorization: Bearer <token>` header
- **Response interceptor**:
  - 401 → clear `admin_access_token`, `admin_refresh_token`, `admin_session_token` from localStorage, redirect to `/login`
  - 403 → toast "Permission denied"
  - Network error → toast "Connection error. Check your network."

### Service Layer (`src/services/`)

| File | Functions |
|---|---|
| `auth.ts` | `sendOtp(mobile)`, `verifyOtp(mobile, otp)` |
| `users.ts` | `getUsers(params)`, `getUserDetail(id)`, `deactivateUser(id)`, `activateUser(id)` |
| `payouts.ts` | `getPayouts(params)`, `approvePayout(id)`, `rejectPayout(id)` |
| `dashboard.ts` | `getDashboardStats()`, `getRevenueChart(days)`, `getActivityFeed(limit)` |

### Hooks (`src/hooks/`)

| Hook | Responsibilities |
|---|---|
| `useAuth` | Login, logout, token management, auth state |
| `useUsers` | User list query, user detail query, deactivate/activate mutations |
| `usePayouts` | Payout list query, approve/reject mutations |
| `useDashboard` | Stats query, revenue chart query, activity feed query |

---

## Data Models

### Existing: User (zexy_api)

```python
class User(Base):
    __tablename__ = "users"
    id: int (PK)
    mobile: str (unique)
    username: str (nullable)
    name: str (nullable)
    avatar: str (nullable)
    role: RoleEnum  # 'creator' | 'fan' | 'admin'
    is_active: bool
    is_deleted: bool
    has_completed_onboarding: bool
    onboarding_step: int
    last_login_at: datetime (nullable)
    # ... additional fields
```

### New: PayoutRequest (zexy_api)

```python
class PayoutRequest(Base):
    __tablename__ = "payout_requests"
    id: int (PK)
    creator_uid: int (FK → users.id)
    amount: Decimal
    status: Enum('pending', 'approved', 'rejected')
    requested_at: datetime
    actioned_at: datetime (nullable)
    actioned_by: int (FK → users.id, nullable)  # admin user id
    notes: str (nullable)
```

Alembic migration required to create the `payout_requests` table with all fields and foreign key constraints.

### TypeScript Types (`src/types/index.ts`)

```typescript
interface User {
  id: number;
  mobile: string;  // masked to last 4 digits in detail view
  username: string | null;
  name: string | null;
  role: 'creator' | 'fan' | 'admin';
  is_active: boolean;
  joined_at: string;
  last_login_at: string | null;
  onboarding_step: number;
}

interface PayoutRequest {
  id: number;
  creator_uid: number;
  creator_username: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  actioned_at: string | null;
  actioned_by: number | null;
}

interface DashboardStats {
  total_users: number;
  total_creators: number;
  total_fans: number;
  revenue_this_month: number;
  pending_payouts_count: number;
  user_growth_pct: number;
  creator_growth_pct: number;
  revenue_growth_pct: number;
}

interface RevenueDataPoint {
  date: string;
  amount: number;
}

interface ActivityLogEntry {
  id: number;
  action: string;
  created_at: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  session_token: string;
  token_type: string;
}
```

### New API Endpoints (zexy_api)

All endpoints require `role == admin` via `get_current_user_from_token` dependency.

**Auth** (prefix: `/api/v1/admin/auth`):

```
POST /api/v1/admin/auth/otp/send
  Request:  { mobile: str }
  Response: { status: "success", message: "OTP sent successfully" }
  Behavior: Only proceeds if user exists AND role == admin.
            Raises AUTH_004 if user not found or role != admin.
            Raises AUTH_005 if account is inactive.
            Rate limit: 5 requests / 5 min.

POST /api/v1/admin/auth/otp/verify
  Request:  { mobile: str, otp: str }
  Response: TokenResponse (access_token, refresh_token, session_token)
  Behavior: Verifies OTP. Raises AUTH_004 if role != admin.
            Dev mode: accepts "1234".
            Does NOT create new users.
```

**Dashboard** (prefix: `/api/v1/admin/dashboard`):

```
GET /api/v1/admin/dashboard/stats
  Response: { total_users, total_creators, total_fans, revenue_this_month,
              pending_payouts_count, user_growth_pct, creator_growth_pct, revenue_growth_pct }

GET /api/v1/admin/dashboard/revenue-chart?days=30
  Response: [{ date: "2026-04-01", amount: 12400 }, ...]

GET /api/v1/admin/dashboard/activity?limit=10
  Response: recent activity_logs entries
```

**Users** (prefix: `/api/v1/admin/users`):

```
GET /api/v1/admin/users?page=1&page_size=20&role=creator&is_active=true&search=priya
  Response: { users: [...], total: 1847, page: 1, page_size: 20, total_pages: 93 }

GET /api/v1/admin/users/{user_id}
  Response: full user detail (mobile masked to last 4 digits)

POST /api/v1/admin/users/{user_id}/deactivate
  Behavior: sets is_active = False, logs to activity_logs
  Raises: DB_002 if user not found

POST /api/v1/admin/users/{user_id}/activate
  Behavior: sets is_active = True (existing endpoint, keep as-is)
```

**Payouts** (prefix: `/api/v1/admin/payouts`):

```
GET /api/v1/admin/payouts?page=1&page_size=20&status=pending
  Response: paginated PayoutRequest records

POST /api/v1/admin/payouts/{payout_id}/approve
  Behavior: sets status = approved, records actioned_by + actioned_at
  Raises: DB_002 if payout not found

POST /api/v1/admin/payouts/{payout_id}/reject
  Behavior: sets status = rejected, records actioned_by + actioned_at
  Raises: DB_002 if payout not found
```

---

## Project Structure

```
zexy_admin_web_app/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (providers, Google Fonts)
│   │   ├── page.tsx                # Redirect → /dashboard
│   │   ├── login/
│   │   │   └── page.tsx            # Split-screen OTP login
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   └── page.tsx
│   │   └── payouts/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx         # Icon sidebar with expand on hover
│   │   │   └── PageShell.tsx       # Sidebar + main content wrapper
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx       # Mobile input + send OTP
│   │   │   └── OtpForm.tsx         # 4-digit OTP boxes
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   └── ActivityFeed.tsx
│   │   ├── users/
│   │   │   ├── UsersTable.tsx
│   │   │   ├── UserDrawer.tsx
│   │   │   └── UserFilters.tsx
│   │   ├── payouts/
│   │   │   ├── PayoutsTable.tsx
│   │   │   └── PayoutFilters.tsx
│   │   └── common/
│   │       ├── ZexyLogo.tsx
│   │       ├── ConfirmModal.tsx
│   │       ├── DataTable.tsx
│   │       ├── Pagination.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── StatCard.tsx
│   │       └── TabFilters.tsx
│   ├── lib/
│   │   ├── axios.ts                # Axios instance with auth interceptors
│   │   └── queryClient.ts          # TanStack Query singleton client
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUsers.ts
│   │   ├── usePayouts.ts
│   │   └── useDashboard.ts
│   ├── services/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── payouts.ts
│   │   └── dashboard.ts
│   ├── context/
│   │   └── AuthContext.tsx         # Admin auth state (mirrors creator app)
│   └── types/
│       └── index.ts                # Shared TypeScript types
├── middleware.ts                   # Route protection
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Axios auth header attachment

*For any* token string stored in `localStorage` as `admin_access_token`, every request made through the Axios instance should include an `Authorization: Bearer <token>` header with that exact token value.

**Validates: Requirements 2.1**

---

### Property 2: OTP input auto-advance

*For any* digit character (0–9) entered into any OTP input box that is not the last box, focus should automatically advance to the next input box.

**Validates: Requirements 5.1**

---

### Property 3: Token storage on successful verify

*For any* `TokenResponse` returned by a successful OTP verify call (with arbitrary `access_token`, `refresh_token`, and `session_token` string values), the Admin_App should store each token under its correct `localStorage` key (`admin_access_token`, `admin_refresh_token`, `admin_session_token` respectively).

**Validates: Requirements 5.4**

---

### Property 4: StatusBadge renders correct color for any valid status

*For any* valid status value (`'active'`, `'inactive'`, `'pending'`, `'approved'`, `'rejected'`), the `StatusBadge` component should render a pill element with the color class corresponding to that status (green for active/approved, red for inactive/rejected, yellow for pending).

**Validates: Requirements 7.2**

---

### Property 5: Pagination label correctness

*For any* `page` number and `totalPages` value, the `Pagination` component should render a label that reads exactly "Page {page} of {totalPages}".

**Validates: Requirements 7.8**

---

### Property 6: Mobile number masking

*For any* user with any valid Indian mobile number, the `GET /api/v1/admin/users/{user_id}` endpoint should return a masked mobile string that shows only the last 4 digits (all preceding digits replaced or hidden).

**Validates: Requirements 9.7**

---

### Property 7: Deactivation sets is_active to false

*For any* user with `is_active = True`, calling `POST /api/v1/admin/users/{user_id}/deactivate` should result in that user's `is_active` field being set to `False` in the database.

**Validates: Requirements 10.7**

---

### Property 8: Payout action sets correct status and audit fields

*For any* `PayoutRequest` with `status = pending`, actioning it (approve or reject) should set `status` to the corresponding terminal value (`approved` or `rejected`), and should populate both `actioned_by` (the admin's user id) and `actioned_at` (a non-null timestamp) on the record.

**Validates: Requirements 13.6, 13.7**

---

### Property 9: Admin role enforcement on all admin endpoints

*For any* user whose `role` is not `admin`, calling any endpoint under the `/api/v1/admin` prefix should raise `AUTH_004` regardless of which endpoint is called or what parameters are supplied.

**Validates: Requirements 15.2**

---

## Error Handling

| Scenario | Behavior |
|---|---|
| OTP send — non-admin mobile (`AUTH_004`) | Display "Access denied. Admin accounts only." below mobile input |
| OTP send — inactive account (`AUTH_005`) | Display "Your account is inactive. Contact support." below mobile input |
| OTP verify — wrong code | Clear all 4 boxes, focus first box, display "Invalid OTP. Try again." |
| 401 on any API call | Clear `admin_access_token`, `admin_refresh_token`, `admin_session_token` from localStorage; redirect to `/login` |
| 403 on any API call | Toast: "Permission denied" |
| Network error | Toast: "Connection error. Check your network." |
| Deactivate/activate API fails | Toast error, modal closes, no optimistic update applied |
| Approve/reject payout API fails | Toast error, modal closes, no optimistic update applied |
| User/payout not found (`DB_002`) | Toast error surfaced from API 404 response |

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are used for comprehensive coverage:
- **Unit/example tests**: verify specific behaviors, error conditions, and integration points
- **Property-based tests**: verify universal properties across many generated inputs

### Property-Based Testing Library

Use **fast-check** (TypeScript/JavaScript PBT library) for the frontend properties, and **Hypothesis** for the Python/FastAPI backend properties.

Each property test runs a minimum of **100 iterations**.

Tag format for each property test:
```
// Feature: zexy-admin-foundation, Property {N}: {property_text}
```

### Property Test Mapping

| Property | Test location | What varies |
|---|---|---|
| P1: Axios auth header | `src/lib/axios.test.ts` | Token string value (arbitrary strings) |
| P2: OTP auto-advance | `src/components/auth/OtpForm.test.tsx` | Digit value (0–9), box index (0–2) |
| P3: Token storage | `src/hooks/useAuth.test.ts` | Token string values in TokenResponse |
| P4: StatusBadge color | `src/components/common/StatusBadge.test.tsx` | Status enum value |
| P5: Pagination label | `src/components/common/Pagination.test.tsx` | page (1–N), totalPages (1–N) |
| P6: Mobile masking | `zexy_api/tests/test_admin_users.py` | Mobile number strings |
| P7: Deactivation | `zexy_api/tests/test_admin_users.py` | User records with is_active=True |
| P8: Payout action | `zexy_api/tests/test_admin_payouts.py` | PayoutRequest records with status=pending |
| P9: Role enforcement | `zexy_api/tests/test_admin_auth.py` | User records with role != admin |

### Unit / Example Test Coverage

- **Axios interceptors**: 401 clears tokens + redirects, 403 shows toast, network error shows toast
- **Route middleware**: unauthenticated → `/login`, authenticated on `/login` → `/dashboard`
- **LoginForm**: valid mobile submits, invalid mobile blocked
- **OtpForm**: Backspace moves focus back, 4-filled auto-submits after 500ms, resend countdown
- **ConfirmModal variants**: danger shows red + AlertTriangle, success shows green + CheckCircle, default shows purple + Info
- **DataTable**: renders loading skeleton when `isLoading=true`
- **UserDrawer**: renders all required fields from user detail response
- **Dashboard**: pending payouts badge appears when count > 0, hidden when count = 0
- **Users page**: tab selection triggers refetch with correct filter params, search debounce fires after 300ms
- **Payouts page**: Approve/Reject buttons only visible on Pending tab rows

### Integration Tests (zexy_api)

- Admin auth endpoints: OTP send/verify happy path, AUTH_004 for non-admin, AUTH_005 for inactive
- Dashboard endpoints: stats, revenue chart, activity feed return correct shapes
- Users endpoints: list pagination, search, detail with masked mobile
- Payouts endpoints: list with status filter, approve/reject transitions
- Role enforcement: all admin endpoints return 401 without JWT, AUTH_004 for non-admin role
