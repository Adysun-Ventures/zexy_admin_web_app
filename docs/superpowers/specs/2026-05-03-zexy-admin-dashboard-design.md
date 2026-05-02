# Zexy Admin Dashboard - Design Specification

**Date:** May 3, 2026  
**Project:** Content/Media Platform Admin Dashboard  
**Scope:** OTP Authentication + Notification Campaigns CRUD

## Overview

A Next.js-based admin dashboard for Zexy, a content/media platform. This initial phase focuses on secure OTP-based authentication and complete CRUD operations for notification campaigns, with dual theme support (light/dark mode).

## Purpose & Context

**What problem does this solve?**
Administrators need a secure, intuitive interface to:
- Authenticate into the admin system using OTP
- Manage notification campaigns (create, view, list)
- Monitor campaign details and status

**Who uses it?**
Platform administrators and content managers who need to send targeted notifications to users.

**Success Criteria:**
- Secure OTP login flow with proper error handling
- Complete campaign management (list, create, view details)
- Responsive design that works on desktop, tablet, and mobile
- Smooth theme switching between light and dark modes
- Production-ready code with TypeScript type safety

## Technical Architecture

### Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI Library:** shadcn/ui components
- **Styling:** Tailwind CSS
- **Theme Management:** next-themes
- **HTTP Client:** Axios with interceptors
- **State Management:** React hooks + Context API for auth
- **Charts:** Recharts (for future dashboard expansion)

### Project Structure

```
/app
  /(auth)
    /login
      page.tsx - OTP login page
  /(dashboard)
    /campaigns
      page.tsx - Campaigns list
      /new
        page.tsx - Create campaign form
      /[id]
        page.tsx - Campaign details
    layout.tsx - Dashboard shell with header
  /api
    /auth - Optional server-side auth helpers
/components
  /ui - shadcn/ui base components (button, input, card, etc.)
  /auth - Login form components
  /campaigns - Campaign-specific components
  /layout - Header, ThemeToggle
/lib
  /api
    client.ts - Axios instance with interceptors
    auth.ts - Auth API functions
    campaigns.ts - Campaign API functions
  /hooks
    useAuth.ts - Authentication hook
    useCampaigns.ts - Campaign data fetching
  /utils
    cn.ts - Class name utility
/types
  auth.ts - Auth-related TypeScript interfaces
  campaigns.ts - Campaign TypeScript interfaces
/public - Static assets
```

### API Integration

**Base URL:** `https://api.zexy.live`

**Endpoints Used:**

1. **Authentication**
   - `POST /api/v1/admin/auth/otp/send` - Send OTP to email/phone
   - `POST /api/v1/admin/auth/otp/verify` - Verify OTP and get auth token

2. **Notification Campaigns**
   - `GET /api/v1/admin/notifications/campaigns` - List all campaigns
   - `POST /api/v1/admin/notifications/campaign` - Create new campaign
   - `GET /api/v1/admin/notifications/campaigns/{campaign_id}` - Get campaign details

**Authentication Flow:**
1. User enters email/phone on login page
2. Click "Send OTP" → API call to `/otp/send`
3. OTP input field appears
4. User enters OTP code
5. Click "Verify" → API call to `/otp/verify`
6. On success: store auth token in localStorage
7. Redirect to `/campaigns`
8. All subsequent API calls include token in Authorization header

**Token Management:**
- Store JWT/auth token in localStorage
- Axios interceptor adds `Authorization: Bearer {token}` to all requests
- 401 responses trigger logout and redirect to login
- Logout clears token and redirects to `/login`

**Error Handling:**
- Network errors: Show toast notification with retry option
- Validation errors: Display inline form errors
- 401 Unauthorized: Auto-logout and redirect
- 500 Server errors: Show user-friendly error message
- Loading states: Skeleton screens and spinners

## Pages & Components

### 1. Login Page (`/login`)

**Layout:**
- Centered card on full-screen background
- Logo at top
- Two-step form (email → OTP)
- Theme toggle in top-right corner

**Step 1: Email/Phone Input**
- Single input field for email or phone
- "Send OTP" button
- Loading state while sending
- Error message display area

**Step 2: OTP Verification**
- OTP input field (6 digits, auto-focus)
- "Verify" button
- "Resend OTP" link (with countdown timer)
- Back button to change email/phone

**Components:**
- `LoginForm` - Main form component with state management
- `OTPInput` - Specialized input for OTP codes
- `Button` (shadcn/ui) - Primary action buttons
- `Input` (shadcn/ui) - Text input fields
- `Card` (shadcn/ui) - Container for form

**Validation:**
- Email: Valid email format or phone number
- OTP: 6 digits required
- Show errors inline below inputs

### 2. Campaigns List Page (`/campaigns`)

**Layout:**
- Header with "Notification Campaigns" title
- "Create Campaign" button (top-right)
- Data table with campaigns
- Empty state if no campaigns exist

**Table Columns:**
- Campaign Name
- Status (badge: active/draft/completed)
- Created Date (formatted)
- Recipients Count
- Actions (view details icon)

**Features:**
- Click row to navigate to campaign details
- Hover effects on rows
- Loading skeleton while fetching
- Pagination (if API supports it)
- Search/filter (future enhancement)

**Components:**
- `CampaignsTable` - Main table component
- `Table` (shadcn/ui) - Base table components
- `Badge` (shadcn/ui) - Status indicators
- `Button` (shadcn/ui) - Create campaign button
- `EmptyState` - Custom component for no campaigns

### 3. Create Campaign Page (`/campaigns/new`)

**Layout:**
- Header with "Create Campaign" title and back button
- Form card with all campaign fields
- Submit and cancel buttons at bottom

**Form Fields:**
(Based on typical notification campaign structure - adjust based on actual API requirements)
- Campaign Name (text input, required)
- Message Title (text input, required)
- Message Body (textarea, required)
- Target Audience (select/multi-select)
- Schedule (date-time picker or "Send Now")
- Priority (select: low/medium/high)

**Validation:**
- Required field validation
- Character limits on text fields
- Date validation (can't schedule in past)
- Show errors inline

**Submission:**
- POST to `/api/v1/admin/notifications/campaign`
- Loading state on submit button
- Success: Show toast and redirect to campaigns list
- Error: Show error message, keep form data

**Components:**
- `CreateCampaignForm` - Main form component
- `Input`, `Textarea`, `Select` (shadcn/ui)
- `DatePicker` (shadcn/ui or custom)
- `Button` (shadcn/ui)
- `Label` (shadcn/ui)

### 4. Campaign Details Page (`/campaigns/[id]`)

**Layout:**
- Header with campaign name and back button
- Details card showing all campaign information
- Action buttons (Edit, Delete - future)

**Information Displayed:**
- Campaign Name
- Status (with colored badge)
- Message Title and Body
- Target Audience
- Created Date
- Scheduled/Sent Date
- Recipients Count
- Delivery Stats (if available)

**Components:**
- `CampaignDetails` - Main details component
- `Card` (shadcn/ui) - Container for information
- `Badge` (shadcn/ui) - Status indicator
- `Separator` (shadcn/ui) - Visual dividers

### 5. Dashboard Layout (`/app/(dashboard)/layout.tsx`)

**Header Components:**
- Logo/Brand name (left)
- Navigation links (future: Dashboard, Users, Campaigns)
- Theme toggle button (light/dark)
- User profile dropdown with logout (right)

**Responsive Behavior:**
- Desktop: Full header with all elements
- Mobile: Hamburger menu for navigation

**Components:**
- `Header` - Main header component
- `ThemeToggle` - Theme switcher button
- `UserMenu` - Dropdown with logout
- `Button` (shadcn/ui)
- `DropdownMenu` (shadcn/ui)

## Visual Design & Aesthetics

### Design Direction: Neo-Brutalist Precision

A bold, confident aesthetic that combines brutalist clarity with refined details. Sharp edges, strong typography, and purposeful animations create an interface that feels both powerful and precise.

**Core Principles:**
- **Clarity over decoration** - Every element serves a purpose
- **Bold without chaos** - Strong visual hierarchy
- **Smooth interactions** - Animations that feel intentional
- **Confident typography** - Geometric sans-serif with character

### Typography

**Font Choices:**
- **Primary:** Geist Sans (or DM Sans as alternative)
  - Geometric, modern, excellent readability
  - Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- **Monospace:** Geist Mono (for codes, technical data)

**Type Scale:**
- Headings: Bold, generous spacing
- Body: Medium weight, comfortable line height (1.6)
- Labels: Semibold, uppercase with letter-spacing
- Data/Numbers: Tabular figures for alignment

**Avoid:** Inter, Roboto, Arial, system fonts (too generic)

### Color Palette

**Light Mode:**
- Background: `#FAFAFA` (warm white)
- Surface: `#FFFFFF` (pure white cards)
- Text Primary: `#0A0A0A` (near black)
- Text Secondary: `#6B6B6B` (medium gray)
- Border: `#E5E5E5` (subtle gray)
- Accent: `#0066FF` (electric blue)
- Accent Hover: `#0052CC`

**Dark Mode:**
- Background: `#0A0A0A` (rich black)
- Surface: `#1A1A1A` (elevated black)
- Text Primary: `#FAFAFA` (near white)
- Text Secondary: `#A3A3A3` (light gray)
- Border: `#2A2A2A` (subtle gray)
- Accent: `#3B82F6` (bright blue)
- Accent Hover: `#2563EB`

**Status Colors:**
- Success: `#10B981` (green)
- Error: `#EF4444` (red)
- Warning: `#F59E0B` (amber)
- Info: `#3B82F6` (blue)

**Implementation:**
- Use CSS variables for all colors
- Tailwind config with custom color tokens
- next-themes for seamless switching

### Spatial Composition

**Layout Principles:**
- **Grid-based:** 12-column grid for consistency
- **Generous spacing:** 16px base unit, scale by 1.5x
- **Card elevation:** Subtle shadows, stronger on hover
- **Asymmetric balance:** Not everything centered

**Spacing Scale:**
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

**Component Spacing:**
- Form fields: 16px vertical gap
- Card padding: 24px
- Section margins: 48px
- Page margins: 32px (desktop), 16px (mobile)

### Motion & Animations

**Animation Principles:**
- **Purposeful:** Every animation communicates state
- **Fast:** 150-300ms for most interactions
- **Smooth:** Ease-out curves for natural feel
- **Staggered:** Sequential reveals for lists

**Key Animations:**

1. **Page Transitions:**
   - Fade in + slight upward movement (20px)
   - Duration: 300ms
   - Ease: ease-out

2. **Button Interactions:**
   - Hover: Scale 1.02, shadow increase
   - Active: Scale 0.98
   - Duration: 150ms

3. **Card Hover:**
   - Lift effect (translateY: -4px)
   - Shadow increase
   - Duration: 200ms

4. **Form Focus:**
   - Border color transition
   - Subtle glow effect
   - Duration: 200ms

5. **Toast Notifications:**
   - Slide in from top-right
   - Duration: 300ms
   - Auto-dismiss after 5s with fade out

6. **Loading States:**
   - Skeleton screens with shimmer effect
   - Spinner for buttons (rotate animation)

**Implementation:**
- CSS transitions for simple effects
- Framer Motion for complex animations (optional)
- Tailwind transition utilities

### Visual Details

**Backgrounds:**
- Subtle gradient mesh on login page
- Solid colors for dashboard (performance)
- Noise texture overlay (5% opacity) for depth

**Borders:**
- 1px solid borders (not too thick)
- 2px on focus states
- Rounded corners: 8px (cards), 6px (buttons), 4px (inputs)

**Shadows:**
- Light mode: Soft, warm shadows
- Dark mode: Deeper, cooler shadows
- Elevation scale:
  - sm: `0 1px 2px rgba(0,0,0,0.05)`
  - md: `0 4px 6px rgba(0,0,0,0.07)`
  - lg: `0 10px 15px rgba(0,0,0,0.1)`

**Icons:**
- Lucide React (consistent, modern icon set)
- 20px default size
- Stroke width: 2px

**Custom Cursor:**
- Default cursor (no custom needed for admin dashboard)

## Data Flow & State Management

### Authentication State

**Auth Context:**
```typescript
interface AuthContext {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}
```

**Flow:**
1. App loads → Check localStorage for token
2. If token exists → Validate (optional API call)
3. Set auth state accordingly
4. Protected routes check `isAuthenticated`
5. Logout clears token and resets state

### Campaign Data

**Fetching Strategy:**
- Server Components for initial load (faster)
- Client-side hooks for mutations (create, update)
- Optimistic updates for better UX

**State Management:**
- Local component state for forms
- React Query or SWR for server state (optional)
- No global state needed for campaigns

### Form State

**Validation:**
- Client-side validation before submit
- Server-side validation errors displayed
- Zod schema for type-safe validation (optional)

**Error Handling:**
- Field-level errors (inline)
- Form-level errors (toast or alert)
- Network errors (toast with retry)

## TypeScript Types

### Auth Types

```typescript
interface OTPSendRequest {
  email?: string;
  phone?: string;
}

interface OTPSendResponse {
  success: boolean;
  message: string;
}

interface OTPVerifyRequest {
  email?: string;
  phone?: string;
  otp: string;
}

interface OTPVerifyResponse {
  success: boolean;
  token: string;
  user: User;
}

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}
```

### Campaign Types

```typescript
interface Campaign {
  id: string;
  name: string;
  title: string;
  body: string;
  status: 'draft' | 'active' | 'completed' | 'scheduled';
  targetAudience?: string[];
  recipientsCount: number;
  createdAt: string;
  scheduledAt?: string;
  sentAt?: string;
}

interface CreateCampaignRequest {
  name: string;
  title: string;
  body: string;
  targetAudience?: string[];
  scheduledAt?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface CampaignsListResponse {
  campaigns: Campaign[];
  total: number;
  page?: number;
  pageSize?: number;
}
```

## Responsive Design

### Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Responsive Behavior

**Login Page:**
- Mobile: Full-width card with padding
- Desktop: Centered card (max-width: 400px)

**Campaigns List:**
- Mobile: Card-based layout (stacked)
- Tablet: 2-column grid
- Desktop: Full data table

**Create Campaign Form:**
- Mobile: Single column, full-width inputs
- Desktop: Two-column layout for some fields

**Header:**
- Mobile: Hamburger menu, compact layout
- Desktop: Full horizontal layout

## Accessibility

**Keyboard Navigation:**
- Tab order follows visual flow
- Focus indicators on all interactive elements
- Escape key closes modals/dropdowns
- Enter key submits forms

**Screen Readers:**
- ARIA labels on icon buttons
- ARIA live regions for dynamic content
- Semantic HTML (nav, main, header, etc.)
- Alt text on images (if any)

**Color Contrast:**
- WCAG AA compliance (4.5:1 for text)
- Status colors tested for accessibility
- Focus indicators visible in both themes

**Form Accessibility:**
- Labels associated with inputs
- Error messages announced
- Required fields marked
- Helpful placeholder text

## Testing Strategy

### Manual Testing

**Authentication Flow:**
- [ ] Send OTP with valid email
- [ ] Send OTP with invalid email (error handling)
- [ ] Verify OTP with correct code
- [ ] Verify OTP with incorrect code (error handling)
- [ ] Token stored correctly
- [ ] Protected routes redirect when not authenticated
- [ ] Logout clears token and redirects

**Campaign CRUD:**
- [ ] List campaigns loads correctly
- [ ] Empty state shows when no campaigns
- [ ] Create campaign with valid data
- [ ] Create campaign with invalid data (validation)
- [ ] View campaign details
- [ ] Navigation between pages works

**Theme Switching:**
- [ ] Toggle switches between light/dark
- [ ] Theme persists on page reload
- [ ] All components render correctly in both themes
- [ ] Colors have sufficient contrast

**Responsive Design:**
- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1440px width)
- [ ] All interactions work on touch devices

### API Integration Testing

- [ ] All endpoints return expected data structure
- [ ] Error responses handled gracefully
- [ ] Loading states display correctly
- [ ] Network errors show user-friendly messages
- [ ] Token refresh works (if implemented)

### Browser Testing

- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Performance Considerations

**Optimization Strategies:**
- Server Components for static content
- Client Components only where needed
- Image optimization with Next.js Image
- Code splitting by route
- Lazy load heavy components

**Bundle Size:**
- Monitor with Next.js bundle analyzer
- Tree-shake unused shadcn/ui components
- Minimize third-party dependencies

**Loading Performance:**
- Skeleton screens for better perceived performance
- Optimistic updates for instant feedback
- Debounce search/filter inputs

## Security Considerations

**Token Storage:**
- localStorage for simplicity (acceptable for admin dashboard)
- Consider httpOnly cookies for enhanced security (future)

**API Security:**
- All requests over HTTPS
- Token in Authorization header
- No sensitive data in URLs
- CSRF protection (if using cookies)

**Input Validation:**
- Client-side validation for UX
- Trust server-side validation for security
- Sanitize user inputs
- Prevent XSS attacks

**Error Messages:**
- Don't expose sensitive information
- Generic messages for auth failures
- Detailed errors only in development

## Future Enhancements

**Phase 2 (Post-MVP):**
- Dashboard page with stats and charts
- User management CRUD
- Campaign editing and deletion
- Advanced filtering and search
- Bulk operations
- Export functionality

**Phase 3:**
- Real-time notifications
- Campaign analytics
- A/B testing for campaigns
- Template management
- Role-based access control
- Audit logs

## Implementation Notes

**Setup Steps:**
1. Initialize Next.js project with TypeScript
2. Install and configure Tailwind CSS
3. Set up shadcn/ui (init command)
4. Install required shadcn/ui components
5. Configure next-themes
6. Set up Axios client with interceptors
7. Create folder structure
8. Implement auth flow first
9. Build campaigns CRUD
10. Test and refine

**Development Order:**
1. Project setup and configuration
2. Auth context and API client
3. Login page (OTP flow)
4. Protected route wrapper
5. Dashboard layout (header, theme toggle)
6. Campaigns list page
7. Create campaign page
8. Campaign details page
9. Styling and animations
10. Testing and bug fixes

**Key Dependencies:**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "next-themes": "^0.2.1",
    "axios": "^1.6.0",
    "lucide-react": "^0.300.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

## Success Metrics

**Functional:**
- ✅ Users can log in with OTP
- ✅ Users can create campaigns
- ✅ Users can view campaign list
- ✅ Users can view campaign details
- ✅ Theme switching works flawlessly

**Non-Functional:**
- ✅ Page load < 2 seconds
- ✅ Smooth 60fps animations
- ✅ Mobile-friendly interface
- ✅ Accessible to keyboard users
- ✅ Type-safe codebase (no `any` types)

## Conclusion

This design provides a solid foundation for the Zexy admin dashboard, focusing on essential functionality (auth + campaigns) with room for growth. The neo-brutalist aesthetic creates a memorable, professional interface that stands out from generic admin panels while maintaining usability and accessibility.

The architecture is scalable, allowing easy addition of new features (user management, analytics dashboard) in future phases without major refactoring.
