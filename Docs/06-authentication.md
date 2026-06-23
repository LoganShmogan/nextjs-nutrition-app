# Authentication System

## Overview

The app uses a simple **cookie-based session system**. There are no JWTs, no OAuth, no third-party auth providers. A user signs up with a username and password, and the server sets an httpOnly cookie containing their user ID.

## How It Works

### Signup Flow

```
User fills in username + password on / page
  → POST /api/auth/signup { username, password }
  → Server checks both fields are present
  → INSERT INTO users (username, password) VALUES (?, ?)
  → If username is taken: 409 Conflict
  → If success: set cookie "session_user_id" = newUserId
  → Return { ok: true }
  → Client redirects to /dashboard
```

### Login Flow

```
User fills in username + password on / page
  → POST /api/auth/login { username, password }
  → Server queries: SELECT * FROM users WHERE username = ?
  → If no user found: 401 Unauthorized
  → If password doesn't match: 401 Unauthorized
  → If match: set cookie "session_user_id" = user.id
  → Return { ok: true }
  → Client redirects to /dashboard
```

### Logout Flow

```
User clicks Logout on dashboard
  → POST /api/auth/logout
  → Server sets "session_user_id" cookie with maxAge: 0 (expires immediately)
  → Return { ok: true }
  → Client redirects to /
```

## Session Cookies

Two cookies are used:

| Cookie | Set By | Purpose | Options |
|--------|--------|---------|---------|
| `session_user_id` | `/api/auth/login` and `/api/auth/signup` | Identifies the logged-in user | httpOnly, sameSite=lax |
| `active_profile_id` | `/api/profile` (POST) and `/api/profile/activate` | Identifies the active patient profile | httpOnly, sameSite=lax |

Both cookies are `httpOnly`, meaning JavaScript running in the browser cannot read them. They are automatically sent with every request to the same origin.

## Middleware

**File:** `middleware.ts`

Next.js middleware runs before every request. It implements a simple auth guard:

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth needed
  if (pathname === "/" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Everything else requires a session
  const userId = request.cookies.get("session_user_id")?.value;
  if (!userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
```

**What's protected:** Every page and API route except:
- `/` (login/signup page)
- `/api/auth/*` (login, signup, logout endpoints)
- Static assets (`_next/static`, images, favicon)

**What happens without a session:** The user is redirected to `/` (the login page).

## How API Routes Check Authentication

Each API route that needs the user ID calls a helper function from `lib/session.ts`:

```typescript
export function getUserId(request: NextRequest): number | null {
  const raw = request.cookies.get("session_user_id")?.value;
  return raw ? Number(raw) : null;
}

export function getActiveProfileId(request: NextRequest): number | null {
  const raw = request.cookies.get("active_profile_id")?.value;
  return raw ? Number(raw) : null;
}
```

API routes extract the user ID from the cookie and use it to filter all database queries:

```typescript
const userId = getUserId(request);
if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

const logs = db.prepare("SELECT * FROM food_logs WHERE user_id = ?").all(userId);
```

This ensures users can only see and modify their own data.

## Security Notes

**Password Storage:** Passwords are currently stored in plaintext in the database. This is a known limitation for the development/assignment context. In a production system, passwords should be hashed with bcrypt or argon2 before storage.

**Session Security:** The session cookie contains only the user's numeric ID. It is httpOnly (not accessible to JavaScript) and sameSite=lax (not sent on cross-site requests). However, there is no session signing or encryption — if someone can read the cookie value, they can impersonate that user.

**CSRF Protection:** The `sameSite=lax` cookie attribute provides basic CSRF protection for state-changing requests. Next.js API routes also only respond to the correct HTTP methods.

**Data Isolation:** All database queries filter by `user_id`, ensuring one user cannot access another user's profiles, food logs, or analyses.
