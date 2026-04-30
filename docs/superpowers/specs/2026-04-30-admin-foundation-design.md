# Zexy Admin Web App — Foundation Design

**Date:** 2026-04-30  
**Scope:** MVP foundation — Auth, Dashboard, Users, Payouts  
**Repos affected:** `zexy_admin_web_app` (new), `zexy_api` (new admin endpoints)

---

## 1. Overview

Greenfield Next.js admin dashboard for Zexy platform administrators. Provides oversight of users, payout management, and platform health metrics. Backed by new admin-specific FastAPI endpoints in `zexy_api`.

This spec covers the foundation: project scaffold, auth flow, and three core pages. Content moderation, analytics, and system monitoring are out of scope for this iteration.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | Matches `zexy_website` (Next.js 16), consistent ecosystem |
| Language | TypeScript | Matches all existing repos |
| Styling | Tailwind CSS v4 | Matches `zexy_website` |
| UI Components | Shadcn UI | README-specified, pairs with Next.js + Tailwind |
| Icons | Lucide React | Used throughout `zexy_website`; web-compatible (creator app uses Ionicons which is React Native only) |
| Fonts | Manrope + Inter (Google Fonts) | Matches creator app exactly: Manrope = headlines/display, Inter = body/label |
| Data Tables | TanStack Table v8 | README-specified, same TanStack ecosystem as creator app (TanStack Query v5) |
| Charts | Recharts | README-specified, lightweight |
| HTTP Client | Axios | Matches creator app pattern exactly — reuse interceptor structure |
| Server State | TanStack Query v5 | Matches creator app |
| Token Storage | localStorage | MVP — note: upgrade to httpOnly cookies in future security pass |

---

## 3. Visual Design

### 3.1 Theme
- Dark background: `#0a0a0a` / `#0d0d0d`
- Surface: `#111` / `#1a1a1a`
- Border: `#1e1e1e` / `#2a2a2a`
- Primary: purple gradient `#7c3aed → #a855f7`
- Accent: `#e879f9`
- Success: `#22c55e` | Warning: `#f97316` | Danger: `#ef4444`

### 3.2 Typography
- **Headline / Display**: `Manrope` (weights: 700, 800, 900) — page titles, stat numbers, logo wordmark
- **Body / Label**: `Inter` (weights: 400, 500, 600) — table content, descriptions, badges
- Load via Google Fonts in `app/layout.tsx` (same pattern as `zexy_website`)

```html
<!-- In <head> -->
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
```

Tailwind font config:
```js
fontFamily: {
  headline: ['Manrope', 'sans-serif'],
  body: ['Inter', 'sans-serif'],
}
```

### 3.3 Icons
- **Library**: `lucide-react` (already used in `zexy_website`)
- **Usage**: All sidebar icons, action buttons, status indicators, form icons
- Key icons: `LayoutDashboard`, `Users`, `Wallet`, `Settings`, `LogOut`, `ChevronRight`, `Check`, `X`, `AlertTriangle`, `Search`

### 3.4 Logo Component (`ZexyLogo`)
Web equivalent of creator app's `ZexyLogo.tsx`:
```tsx
// src/components/common/ZexyLogo.tsx
// Props: size ('sm' | 'md' | 'lg'), showText (boolean)
// Renders: <img src="/zexy_logo_nobg.png" /> + optional "ZEXY" wordmark in Manrope
// Logo asset: copy zexy_logo_nobg.png to public/zexy_logo_nobg.png
```

### 3.5 Layout Shell
- **Icon sidebar** (collapsed by default, 40px wide)
  - Icons only at rest; hover/click expands to 200px with labels
  - Active item: `#1e1e2e` background + `#a855f7` border
  - Bottom: admin avatar circle + settings icon
- **Main content area** fills remaining width
- **Top bar** per page: page title + contextual actions (search, date, alerts)

### 3.6 Reusable Component Contracts

All shared components live in `src/components/common/`. Each has a single clear purpose:

| Component | Props | Purpose |
|---|---|---|
| `ZexyLogo` | `size`, `showText` | Brand logo + wordmark |
| `StatusBadge` | `status: 'active'\|'inactive'\|'pending'\|'approved'\|'rejected'` | Colored pill badge |
| `ConfirmModal` | `title`, `description`, `confirmLabel`, `variant: 'danger'\|'success'\|'default'`, `onConfirm`, `onCancel`, `isLoading` | Reusable confirm dialog — `variant` drives button color + header icon automatically: `danger`→red+AlertTriangle, `success`→green+CheckCircle, `default`→purple+Info |
| `DataTable` | `columns`, `data`, `isLoading` | TanStack Table wrapper with loading state |
| `Pagination` | `page`, `totalPages`, `onPageChange` | Prev/Next + "Page X of Y" |
| `TabFilters` | `tabs: {label, value, count}[]`, `active`, `onChange` | Styled tab row |
| `PageShell` | `children` | Sidebar + main content layout wrapper |
| `StatCard` | `label`, `value`, `change`, `changeDirection` | Dashboard metric card |

### 3.7 Navigation Items (MVP)
```
⊞  Dashboard    /dashboard
👥  Users        /users
💰  Payouts      /payouts
⚙️  Settings     /settings   (account only, placeholder)
```

---

## 4. Authentication

### 4.1 Flow
1. Admin visits `/login` — split-screen layout
   - Left panel: purple gradient brand panel (logo, tagline, feature bullets)
   - Right panel: mobile OTP form
2. Admin enters Indian mobile number (+91 prefix shown)
3. `POST /api/v1/admin/auth/otp/send` — sends OTP to mobile
4. Admin enters 4-digit OTP (individual input boxes, auto-advance, auto-submit on fill)
5. `POST /api/v1/admin/auth/otp/verify` — verifies OTP, returns JWT
6. API rejects non-admin roles with `AUTH_004` — UI shows "Access denied. Admin accounts only."
7. JWT stored in `localStorage` (`admin_access_token`, `admin_refresh_token`, `admin_session_token`)
8. All subsequent requests include `Authorization: Bearer <token>`
9. 401 response → clear tokens → redirect to `/login`

### 4.2 Route Protection
- Next.js middleware (`middleware.ts`) checks `admin_access_token` in localStorage on every route
- Unauthenticated → redirect to `/login`
- Authenticated on `/login` → redirect to `/dashboard`

### 4.3 OTP UI Details
- 4 individual `<input>` boxes (matches creator app exactly)
- Auto-advance on digit entry
- Backspace moves to previous box
- Auto-submit after 500ms when all 4 filled (matches creator app pattern)
- Resend button with 30-second countdown
- Error state: clear all boxes, focus first, show error message

### 4.4 New API Endpoints Required (zexy_api)

**`POST /api/v1/admin/auth/otp/send`**
```
Request:  { mobile: str }  # Indian mobile, same regex as existing
Response: { status: "success", message: "OTP sent successfully" }
Behavior: Only proceeds if user exists AND role == admin. 
          Raises AUTH_004 if user not found or role != admin.
          Raises AUTH_005 if account is inactive.
          Rate limit: 5 requests / 5 min (stricter than creator).
```

**`POST /api/v1/admin/auth/otp/verify`**
```
Request:  { mobile: str, otp: str }  # No role field — always admin
Response: TokenResponse (same schema as existing)
Behavior: Verifies OTP. Raises AUTH_004 if role != admin.
          Dev mode: accepts "1234".
          Creates session, returns access + refresh + session tokens.
          Does NOT create new users (admin accounts pre-exist).
```

Both endpoints live in `zexy_api/app/api/v1/admin.py` under prefix `/admin/auth`.

---

## 5. Pages

### 5.1 Dashboard (`/dashboard`)

**Purpose:** Platform health at a glance.

**Stat cards (top row):**
- Total Users (count, % change vs last 7d)
- Total Creators (count, % change)
- Revenue this month (₹, % change)
- Pending Payouts (count — links to `/payouts`)

**Revenue chart:**
- Recharts `BarChart`, last 30 days, daily revenue
- Data from new API endpoint (see §6)

**Recent Activity feed:**
- Last 10 entries from `activity_logs` table
- Shows: action description + timestamp (relative)
- Pulls from new API endpoint (see §6)

**Pending payouts alert:**
- Badge in top-right if pending count > 0
- Clicking navigates to `/payouts`

### 5.2 Users (`/users`)

**Purpose:** View and moderate all platform users.

**Tab filters:**
- All | Creators | Fans | Inactive
- Each tab shows count in parentheses
- Active tab: `#1e1e2e` bg + `#a855f7` border

**Search:**
- Debounced text input (300ms), searches username + mobile
- Server-side — passes `search` query param to API

**Table columns:**
- User (username + avatar placeholder)
- Role (Creator / Fan — color coded)
- Status (Active / Inactive badge)
- Joined (date)
- Actions (View details | Deactivate / Activate)

**Pagination:**
- Server-side, 20 rows per page
- Previous / Next buttons + page indicator
- API params: `page`, `page_size`, `role`, `is_active`, `search`

**Confirm modal (Deactivate / Activate):**
- Triggered before any status change
- Shows: "Deactivate @username? This will prevent them from logging in."
- Buttons: Cancel | Confirm (red for deactivate, green for activate)
- On confirm: calls API, refreshes table row optimistically

**User detail (View):**
- Opens a right-side drawer (not a new page)
- Shows: id, mobile (masked), name, username, role, status, joined date, last login, onboarding step
- No edit capability in MVP

### 5.3 Payouts (`/payouts`)

**Purpose:** Review and action payout requests from creators.

**Tab filters:**
- Pending | Approved | Rejected | All
- Default: Pending tab
- Pending tab shows count badge

**Table columns:**
- Creator (username)
- Amount (₹, green)
- Requested date
- Status badge
- Actions (Approve | Reject — only shown on Pending tab)

**Pagination:**
- Server-side, 20 rows per page
- Same pattern as Users table

**Confirm modal (Approve / Reject):**
- "Approve payout of ₹12,400 to @priya_k?"
- "Reject payout of ₹12,400 to @priya_k?"
- Buttons: Cancel | Confirm
- On confirm: calls API, moves row to Approved/Rejected tab

**Note:** Payout data model (`PayoutRequest` table) does not yet exist in `zexy_api`. New model + migration required (see §6).

---

## 6. New API Endpoints Required (zexy_api)

All endpoints require `role == admin` check via `get_current_user_from_token` dependency.

### Auth (covered in §4.4)
- `POST /api/v1/admin/auth/otp/send`
- `POST /api/v1/admin/auth/otp/verify`

### Dashboard
- `GET /api/v1/admin/dashboard/stats`
  - Returns: `{ total_users, total_creators, total_fans, revenue_this_month, pending_payouts_count, user_growth_pct, creator_growth_pct, revenue_growth_pct }`
- `GET /api/v1/admin/dashboard/revenue-chart?days=30`
  - Returns: `[{ date: "2026-04-01", amount: 12400 }, ...]`
- `GET /api/v1/admin/dashboard/activity?limit=10`
  - Returns recent `activity_logs` entries

### Users
- `GET /api/v1/admin/users?page=1&page_size=20&role=creator&is_active=true&search=priya`
  - Returns: `{ users: [...], total: 1847, page: 1, page_size: 20, total_pages: 93 }`
- `GET /api/v1/admin/users/{user_id}`
  - Returns full user detail (masked mobile: show last 4 digits only)
- `POST /api/v1/admin/users/{user_id}/deactivate`
  - Sets `is_active = False`, logs to `activity_logs`
- `POST /api/v1/admin/users/{user_id}/activate`
  - Already exists — keep as-is

### Payouts
- New DB model: `PayoutRequest` table
  - Fields: `id`, `creator_uid` (FK users), `amount`, `status` (pending/approved/rejected), `requested_at`, `actioned_at`, `actioned_by` (FK users admin), `notes`
  - Alembic migration required
- `GET /api/v1/admin/payouts?page=1&page_size=20&status=pending`
  - Returns paginated payout requests
- `POST /api/v1/admin/payouts/{payout_id}/approve`
  - Sets status = approved, records actioned_by + actioned_at
- `POST /api/v1/admin/payouts/{payout_id}/reject`
  - Sets status = rejected, records actioned_by + actioned_at

---

## 7. Project Structure

```
zexy_admin_web_app/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (providers)
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
│   │   │   ├── Sidebar.tsx         # Icon sidebar with expand
│   │   │   └── PageShell.tsx       # Sidebar + main content wrapper
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx       # Mobile input + send OTP
│   │   │   └── OtpForm.tsx         # 4-digit OTP boxes
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   └── ActivityFeed.tsx
│   │   ├── users/
│   │   │   ├── UsersTable.tsx      # TanStack Table
│   │   │   ├── UserDrawer.tsx      # Right-side detail drawer
│   │   │   └── UserFilters.tsx     # Tab filters + search
│   │   ├── payouts/
│   │   │   ├── PayoutsTable.tsx
│   │   │   └── PayoutFilters.tsx
│   │   └── common/
│   │       ├── ConfirmModal.tsx    # Reusable confirm dialog
│   │       ├── DataTable.tsx       # Shared TanStack Table wrapper
│   │       ├── Pagination.tsx      # Prev/Next + page indicator
│   │       └── StatusBadge.tsx     # Active/Inactive/Pending badges
│   ├── lib/
│   │   ├── axios.ts                # Axios instance (mirrors creator app pattern)
│   │   └── queryClient.ts          # TanStack Query client
│   ├── hooks/
│   │   ├── useAuth.ts              # Login, logout, token management
│   │   ├── useUsers.ts             # User list + actions
│   │   ├── usePayouts.ts           # Payout list + actions
│   │   └── useDashboard.ts         # Stats + chart data
│   ├── services/
│   │   ├── auth.ts                 # sendOtp, verifyOtp API calls
│   │   ├── users.ts                # User API calls
│   │   ├── payouts.ts              # Payout API calls
│   │   └── dashboard.ts            # Dashboard API calls
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

## 8. Data Flow

```
Admin browser
  → Next.js middleware (checks localStorage token)
  → Page component
  → TanStack Query hook (useUsers, usePayouts, etc.)
  → Axios service function
  → zexy_api FastAPI endpoint
  → AdminService / CRUD layer
  → MySQL
```

**Mutation flow (e.g. deactivate user):**
1. Admin clicks "Deactivate"
2. `ConfirmModal` opens
3. Admin confirms
4. `useUsers.deactivateUser(id)` called
5. Axios `POST /api/v1/admin/users/{id}/deactivate`
6. On success: TanStack Query invalidates `['users']` cache → table refetches
7. Toast notification shown

---

## 9. Error Handling

| Scenario | Behavior |
|---|---|
| OTP send fails (non-admin mobile) | "Access denied. Admin accounts only." below form |
| OTP verify fails (wrong code) | Clear boxes, focus first, show "Invalid OTP. Try again." |
| 401 on any API call | Clear tokens, redirect to `/login` |
| 403 on any API call | Toast: "Permission denied" |
| Network error | Toast: "Connection error. Check your network." |
| Deactivate/approve API fails | Toast error, modal closes, no optimistic update |

---

## 10. Out of Scope (this iteration)

- Content moderation page
- Analytics page
- System monitoring (WebRTC health)
- AI moderation hooks
- Global notification system
- httpOnly cookie auth upgrade
- Multi-admin role levels (all admins have equal access in MVP)
- Payout bank account verification UI
