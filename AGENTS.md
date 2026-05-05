<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Agent Self-Improvement Guidelines

## Pattern Recognition & Issue Prevention

### 1. **NULL SAFETY & DEFENSIVE PROGRAMMING**

**Pattern**: Runtime errors from `undefined` or `null` values calling methods like `.toLocaleString()`, `.map()`, etc.

**Root Cause**: API responses may not match TypeScript interface definitions. Backend might return `null`/`undefined` for optional fields.

**Prevention Rules**:
- ✅ Always use optional chaining (`?.`) or nullish coalescing (`??`) for API response data
- ✅ Add default values: `(value || 0).toLocaleString()` instead of `value.toLocaleString()`
- ✅ Mark potentially nullable fields as optional in TypeScript interfaces: `field?: type`
- ✅ Check API response schemas before writing frontend code
- ✅ Test with empty/null data scenarios

**Example Fix**:
```typescript
// ❌ BAD - Will crash if recipientsCount is null/undefined
{campaign.recipientsCount.toLocaleString()}

// ✅ GOOD - Safe with default value
{(campaign.recipientsCount || 0).toLocaleString()}

// ❌ BAD - Will crash if date is null/undefined/invalid
{format(new Date(campaign.createdAt), 'MMM d, yyyy')}

// ✅ GOOD - Safe date formatting with validation
const formatDate = (dateString: string | null | undefined, formatStr: string, fallback = 'N/A') => {
  if (!dateString) return fallback;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return fallback;
    return format(date, formatStr);
  } catch {
    return fallback;
  }
};
{formatDate(campaign.createdAt, 'MMM d, yyyy')}
```

---

### 2. **BUILD-TIME VALIDATION**

**Pattern**: Production builds fail with TypeScript errors that weren't caught during development.

**Prevention Rules**:
- ✅ **ALWAYS run `npm run build` locally before pushing to production**
- ✅ Fix ALL TypeScript errors, not just warnings
- ✅ Test the production build, not just dev mode
- ✅ Use strict TypeScript settings

**Command to run**:
```bash
npm run build
```

---

### 3. **DEPENDENCY MANAGEMENT**

**Pattern**: Missing dependencies cause build failures in production (e.g., `@radix-ui/react-alert-dialog`).

**Prevention Rules**:
- ✅ When creating UI components that import external libraries, verify the package is in `package.json`
- ✅ Install missing dependencies immediately: `npm install <package>`
- ✅ Commit both `package.json` AND `package-lock.json`
- ✅ Check component imports match installed packages

---

### 4. **ENVIRONMENT CONFIGURATION**

**Pattern**: Runtime configuration files (like `env.js`) missing in production builds.

**Prevention Rules**:
- ✅ If using runtime env injection, ensure build script generates required files
- ✅ Make runtime scripts non-blocking: use `async` attribute on script tags
- ✅ Provide fallback values in config files
- ✅ Test that generated files are created during build

**Example**:
```json
// package.json
"scripts": {
  "build": "node scripts/inject-env.js && next build"
}
```

---

### 5. **GIT WORKFLOW**

**Pattern**: Local changes not reflected in production because they weren't pushed to GitHub.

**Prevention Rules**:
- ✅ After committing, ALWAYS push: `git push origin main`
- ✅ Verify push succeeded by checking remote
- ✅ Don't assume Netlify has latest code until push completes
- ✅ Check `git status` to ensure working tree is clean

---

### 6. **API RESPONSE STRUCTURE**

**Pattern**: Frontend expects direct data but API wraps responses in `StandardJSONResponse` format.

**Prevention Rules**:
- ✅ **Check API response schemas BEFORE writing frontend code**
- ✅ All Zexy API responses are wrapped: `{ success, data, error, meta }`
- ✅ Extract actual data: `response.data.data` not just `response.data`
- ✅ Update all API client functions consistently

**Example**:
```typescript
// ✅ CORRECT - Extract from StandardJSONResponse wrapper
const response = await api.get('/endpoint');
const actualData = response.data.data; // Not response.data
```

---

### 7. **SYNTAX ERRORS & TYPOS**

**Pattern**: Simple typos cause build failures (e.g., `i  data:` instead of `data:`).

**Prevention Rules**:
- ✅ Use IDE with TypeScript language server for real-time error detection
- ✅ Review diffs before committing
- ✅ Run build locally to catch syntax errors
- ✅ Enable ESLint and fix all errors

---

### 8. **SESSION MANAGEMENT & AUTHENTICATION**

**Pattern**: Users remain logged in with expired/invalid tokens, causing AUTH_002, AUTH_003, AUTH_008 errors.

**Prevention Rules**:
- ✅ Implement axios response interceptor to catch authentication errors
- ✅ Listen for specific error codes: AUTH_002 (User not found), AUTH_003 (Token expired), AUTH_008 (Session revoked)
- ✅ Dispatch custom events for session expiry to decouple API layer from UI
- ✅ Show elegant modal/toast before redirecting to login
- ✅ Clear localStorage tokens on authentication errors
- ✅ Use event-driven architecture for cross-component communication

**Implementation Pattern**:
```typescript
// In axios interceptor (lib/api/client.ts)
const AUTH_ERROR_CODES = ['AUTH_002', 'AUTH_003', 'AUTH_008'];
if (errorCode && AUTH_ERROR_CODES.includes(errorCode)) {
  window.dispatchEvent(new CustomEvent('session-expired', { detail: { message } }));
  localStorage.removeItem('auth_token');
  setTimeout(() => window.location.href = '/login', 2000);
}

// In auth hook (lib/hooks/useAuth.tsx)
useEffect(() => {
  const handleSessionExpired = () => { /* clear state */ };
  window.addEventListener('session-expired', handleSessionExpired);
  return () => window.removeEventListener('session-expired', handleSessionExpired);
}, []);

// Session expiry modal component
<SessionExpiryModal /> // Listens to 'session-expired' event
```

---

## Pre-Push Checklist

Before pushing ANY code to production:

1. ✅ Run `npm run build` locally and ensure it succeeds
2. ✅ Check for TypeScript errors: `npx tsc --noEmit`
3. ✅ Test critical user flows in dev mode
4. ✅ Verify all dependencies are in `package.json`
5. ✅ Review git diff for unintended changes
6. ✅ Commit with descriptive message
7. ✅ Push to GitHub: `git push origin main`
8. ✅ Monitor deployment logs for errors

---

## Common Error Patterns & Solutions

| Error Pattern | Root Cause | Solution |
|--------------|------------|----------|
| `Cannot read properties of undefined` | Null/undefined value calling method | Add null checks: `(value || default)` |
| `Invalid time value` / `RangeError` with dates | Invalid/null date string passed to Date constructor | Validate date strings, use safe formatter helper |
| `Property does not exist on type` | Missing dependency or wrong import | Install package, check imports |
| `404 for /env.js` | Build script not generating file | Update build script to generate file |
| `Type error: Property 'asChild' does not exist` | Using component without proper package | Install correct Radix UI package |
| API returns data but UI shows empty | Wrong response extraction path | Check API wrapper structure |
| AUTH_002/AUTH_003/AUTH_008 errors | Expired/invalid token still in localStorage | Implement axios interceptor for auth errors |

---

## Lessons Learned Log

### 2025-05-03: Safe Date Formatting
- **Issue**: `RangeError: Invalid time value` when formatting dates with `date-fns`
- **Root Cause**: API returns null/undefined/invalid date strings, but code calls `new Date()` without validation
- **Fix**: Created `formatDate()` helper that validates dates before formatting, returns fallback for invalid dates
- **Prevention**: Always validate date strings before creating Date objects, use helper functions for date formatting

### 2025-05-03: Null Safety in Campaigns
- **Issue**: `recipientsCount.toLocaleString()` crashed when value was null
- **Fix**: Added null coalescing: `(recipientsCount || 0).toLocaleString()`
- **Prevention**: Always assume API fields can be null, add defensive checks

### 2025-05-03: Missing Radix UI Dependency
- **Issue**: `@radix-ui/react-alert-dialog` not in package.json
- **Fix**: Installed package and committed lock files
- **Prevention**: Verify dependencies when creating new UI components

### 2025-05-03: Build Script Missing env.js Generation
- **Issue**: Production build didn't generate runtime config file
- **Fix**: Updated build script to run inject-env.js before next build
- **Prevention**: Test production builds locally before deploying

### 2025-05-03: Automatic Logout on Authentication Errors
- **Issue**: Users with expired/invalid tokens received AUTH_002 errors but remained "logged in"
- **Root Cause**: Axios interceptor only checked HTTP status codes (401), not API error codes
- **Fix**: Enhanced interceptor to check AUTH_002, AUTH_003, AUTH_008 error codes; dispatch custom event; show elegant modal; auto-redirect
- **Prevention**: Always handle both HTTP status AND application error codes for authentication failures

---

## Self-Improvement Protocol

When encountering a NEW issue:

1. **Document the pattern** in this file under "Common Error Patterns"
2. **Add prevention rules** to avoid repeating the mistake
3. **Update the checklist** if a new verification step is needed
4. **Commit the updated AGENTS.md** with the code fix

This file should grow with every issue resolved, creating a knowledge base that prevents regression.
