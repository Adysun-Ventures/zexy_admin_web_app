# Content Access Control & Secure Media Delivery

**Date:** 2026-04-30  
**Scope:** Full-stack — API (`zexy_api`) + Creator App (`zexy_creator_app`) + Fan App  
**Status:** Approved for implementation

---

## Problem

1. `visibility = 'subscribers'` sent by app → API rejects (expects `'membership'`)
2. `/media` served as public static files — anyone with a URL can access protected content
3. No tier-specific access control — "Members Only" = any subscriber, no plan filtering
4. URL patterns expose relationship between blurred preview and original file

---

## Goals

- Fix visibility enum mismatch
- Tier-specific content locking (creator picks which subscription plans can access a post)
- Blurred preview generated server-side at upload, stored with opaque unrelated filename
- Protected files served only via short-lived HMAC-signed URLs — no static access
- Block tier deletion if content is locked to it

---

## Decisions Summary

| Decision | Choice |
|---|---|
| Visibility values | `public`, `membership`, `private` |
| `paid` visibility | Removed — paid handled via `is_paid` + `price` fields |
| Members Only tier selection | Required — must pick ≥1 plan to publish |
| Empty tier on publish | Block with validation error |
| Tier deleted with locked content | Block deletion, return 400 with count |
| Blurred preview generation | FFmpeg at upload time, opaque UUID filename |
| Preview URL | Public static, stored as `preview_url` on Content |
| Video preview | Blurred thumbnail image only (no blurred video) |
| Protected file serving | HMAC signed URL, 5 min expiry, stateless |
| File naming | Pure UUID, no creator_uid prefix, no pattern |
| Existing content | No migration — new uploads only |

---

## Architecture

### 1. Data Model Changes

#### `content` table — new columns
```
preview_url: String(1024), nullable  — public blurred preview, static URL
```

#### New table: `content_allowed_plans`
```sql
CREATE TABLE content_allowed_plans (
    content_id  INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    plan_id     INTEGER NOT NULL REFERENCES subscriptions(id) ON DELETE RESTRICT,
    PRIMARY KEY (content_id, plan_id)
);
```

`ON DELETE RESTRICT` on `plan_id` enforces the "block tier deletion" rule at DB level. API layer also checks and returns a human-readable error before hitting the constraint.

#### `Visibility` type (app + API)
Remove `'paid'` and `'subscribers'`. Valid values: `'public' | 'membership' | 'private'`

---

### 2. File Storage & Naming

**All new uploads** (public or protected) use opaque UUID naming:
```
{uuid4()}.jpg        ← original
{uuid4()}.jpg        ← blurred preview (completely separate UUID)
```

No `image_{creator_uid}_` prefix. No `_blurred` suffix. No pattern linking the two.

Files stored in `media/protected/` (membership/private) vs `media/public/` (public content).  
`/media/public/` remains static-served. `/media/protected/` is NOT mounted as static.

---

### 3. Upload Pipeline Changes (`/api/v1/creator/media/upload/image`)

Current flow: save file → return URL  
New flow:
```
1. Save original as media/protected/{uuid_a}.jpg
2. FFmpeg blur: boxblur=20:1, scale down to 720px wide
   ffmpeg -i {uuid_a}.jpg -vf "boxblur=20:1,scale=720:-1" {uuid_b}.jpg
3. Save blurred as media/public/{uuid_b}.jpg
4. Return:
   {
     "url": "/media/protected/{uuid_a}.jpg",      ← never exposed to fans directly
     "preview_url": "/media/public/{uuid_b}.jpg"  ← safe to expose, already blurred
   }
```

For **public content**: original saved to `media/public/`, no blur needed, `preview_url = url`.

For **video uploads**: thumbnail already generated → apply same FFmpeg blur to thumbnail → store as `media/public/{uuid_b}.jpg`. Video file itself stored in `media/protected/`.

---

### 4. Signed URL Service

New module: `app/services/signed_url_service.py`

```python
# Token format: "{content_id}:{fan_uid}:{expiry_unix}"
# Signature: HMAC-SHA256(token_payload, SECRET_KEY)
# Final token: base64url(payload) + "." + base64url(signature)
# Expiry: 5 minutes from generation

def generate_signed_url(content_id: int, fan_uid: int) -> str: ...
def verify_signed_url(token: str) -> tuple[int, int]: ...  # returns (content_id, fan_uid)
```

---

### 5. API Endpoints

#### New: `GET /api/v1/fan/content/{content_id}/signed-url`
- Auth: fan JWT required
- Checks: fan has active subscription to a plan listed in `content_allowed_plans`
- Returns: `{ "url": "http://host/media/serve/{token}" }`
- Token expiry: 5 minutes

#### New: `GET /media/serve/{token}` (NOT under `/api/v1`)
- No auth header — token is self-contained
- Verifies HMAC signature
- Verifies expiry timestamp
- Streams file from `media/protected/` to client
- Returns 403 if invalid/expired, 404 if file missing

#### Modified: `DELETE /api/v1/creator/subscription/{plan_id}`
- Before deleting: count rows in `content_allowed_plans` where `plan_id = id`
- If count > 0: return 400 `"Cannot delete tier — {n} posts are locked to it. Reassign or delete those posts first."`
- If count = 0: proceed with deletion

#### Modified: `POST /api/v1/creator/content` and `PUT /api/v1/creator/content/{id}`
- If `visibility = membership` and `allowed_plan_ids` is empty or missing → 400 `"Members Only content requires at least one subscription tier"`
- Save `allowed_plan_ids` to `content_allowed_plans` table

#### Modified: `GET /api/v1/fan/content` (content list)
- Returns `preview_url` field on all content items
- For membership/private content fan cannot access: return `preview_url` only, omit `url`
- Include `allowed_plan_names: string[]` so fan app can show "Upgrade to [Plan Name]"

---

### 6. Access Control Logic (updated)

```python
def check_content_access(db, fan_uid, content) -> bool:
    if fan_uid == content.creator_uid: return True
    if content.visibility == 'public': return True
    if content.visibility == 'private': return fan_uid == content.private_fan_uid

    if content.visibility == 'membership':
        allowed_plan_ids = [row.plan_id for row in content.allowed_plans]
        subscription = db.query(FanCreatorSubscriptionMapping).filter(
            fan_uid == fan_uid,
            creator_uid == content.creator_uid,
            plan_id.in_(allowed_plan_ids),
            status == active,
            expires_at > now()
        ).first()
        return subscription is not None
```

---

### 7. Creator App UI Changes (`CreateEditContentScreen.tsx`)

**Visibility selector:** 2 options — "Public" / "Members Only" (maps to `public` / `membership`)

**Tier multi-select** (shown only when "Members Only" selected):
- Fetch creator's plans from `GET /api/v1/creator/subscription`
- Modal with checkboxes, same style as existing Tags modal
- Required — publish button disabled + inline error if none selected

**Paid toggle** (shown only when "Public" selected):
- Switch row: "Paid Content" label + toggle
- When on: price input + quick-price chips appear below
- Sets `is_paid: true` + `price` in payload

**Validation:**
- `visibility = membership` + no tiers selected → block publish, show error
- `visibility = public` + `is_paid = true` + no price → block publish

**`Visibility` type:** `'public' | 'membership' | 'private'` (remove `'paid'`, remove `'subscribers'`)

---

### 8. Fan App UI Changes

> **Out of scope for this implementation** — fan app codebase not yet started. Fan-facing endpoints (signed-url, content list with preview_url) are built on the API side and ready for fan app integration later.

---

### 9. Other Files Needing Updates

- `zexy_creator_app/services/content.ts` — update `Visibility` type, add `preview_url` + `allowed_plan_ids` to interfaces
- `zexy_creator_app/components/dashboard/ContentGrid.tsx` — update `'subscribers'` reference to `'membership'`
- `zexy_creator_app/components/dashboard/ContentDetailScreen.tsx` — update `VISIBILITY_CONFIG` (remove `subscribers` key)
- `zexy_api/app/models/content.py` — add `preview_url` column, add `allowed_plans` relationship
- `zexy_api/app/schemas/content.py` — add `preview_url`, `allowed_plan_ids` fields
- `zexy_api/alembic/versions/` — migration for `preview_url` column + `content_allowed_plans` table
- `zexy_api/app/services/subscription_plan_service.py` — add deletion guard

---

## Security Properties

| Attack | Defense |
|---|---|
| Guess original URL from blurred URL | Different UUID, no pattern |
| Access protected file directly | `/media/protected/` not static-mounted |
| Share signed URL with non-subscriber | Token contains `fan_uid`, verified server-side |
| Replay expired signed URL | Expiry timestamp in token, verified server-side |
| Forge signed URL | HMAC-SHA256 with server SECRET_KEY |
| URL pattern enumeration | Pure UUID filenames, no creator_uid prefix |

---

## Out of Scope

- Screenshot/screen-recording prevention (OS-level, not solvable server-side)
- Watermarking
- CDN integration
- Existing content URL migration
