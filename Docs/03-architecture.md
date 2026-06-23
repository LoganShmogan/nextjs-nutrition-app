# System Architecture

## High-Level Architecture

<img width="601" height="1171" alt="arch drawio" src="https://github.com/user-attachments/assets/1b97a923-8e1c-4f17-990f-71d4b7230fee" />

## Request Lifecycle

### 1. Page Load (Server-Side)

```
Browser requests /dashboard
  → Next.js middleware intercepts
  → Checks for session_user_id cookie
  → If missing: redirect to / (login page)
  → If present: allow through to page component
  → Server renders the page shell
  → Client-side hydration kicks in
  → useEffect fires fetch() calls to API routes
```

### 2. API Request (Client → Server → Database)

```
Client component calls fetch("/api/food-log?date=2026-06-23")
  → Next.js routes to app/api/food-log/route.ts
  → Route handler extracts session_user_id from cookie
  → If no session: returns 401
  → Calls getDb() to get SQLite connection (singleton)
  → Executes SQL query with user_id filter
  → Returns JSON response
  → Client component updates state with response data
  → React re-renders the UI
```

### 3. Food Search Flow

```
User types "chicken" in search box
  → 350ms debounce timer starts
  → Timer fires: fetch("/api/foods/search?q=chicken&limit=30")
  → API route reads public/foods.json (cached in memory after first read)
  → Splits query into terms: ["chicken"]
  → Filters foods where ALL terms appear in name/shortName (case-insensitive)
  → Returns up to 30 matches
  → Client renders food result buttons
  → User clicks a food → nutrient panel updates instantly (no API call)
  → User adjusts portion → nutrients scale proportionally on the client
  → User clicks "Log" → POST /api/food-log with pre-calculated values
```

## How Components Talk to Each Other

### Frontend Communication

There is **no global state management** library (no Redux, Zustand, etc.). Communication happens through:

1. **URL Query Parameters** - Used to pass mode/ID between pages:
   - `/profile?new=true` → ProfileForm opens in create mode
   - `/profile?edit=5` → ProfileForm loads profile #5 for editing

2. **Cookies** - Two session cookies managed by the server:
   - `session_user_id` → identifies the logged-in user
   - `active_profile_id` → identifies which patient profile is active

3. **Local Component State** - Each page manages its own state with `useState` and fetches data in `useEffect` on mount. No data is shared between pages through React context or stores.

4. **Props** - Parent pages pass data down to child components:
   - `page.tsx` (server component) → renders `SomeClient.tsx` (client component)
   - Components like `ProfileForm`, `NutritionSummaryCard`, `Analysis` receive no props — they fetch their own data

### Backend Communication

API routes communicate with two data sources:

1. **SQLite Database** (`lib/db.ts`) - All user data (profiles, food logs, analyses, custom foods). Accessed via synchronous `better-sqlite3` queries.

2. **Food JSON File** (`lib/nutrition/foods.ts`) - Read-only food composition data. Loaded into memory once and cached for the server process lifetime.

API routes never call each other. Each route is self-contained and directly queries the database or food file as needed.

## Key Architectural Decisions

### Why SQLite Instead of PostgreSQL?

SQLite was chosen because:
- Zero configuration — no database server to install or manage
- The database file is created automatically on first use
- Single-file storage makes backup and deployment trivial
- WAL (Write-Ahead Logging) mode is enabled for concurrent read performance
- The app is single-user per deployment, so SQLite's write concurrency limitations are acceptable

### Why No ORM?

Raw SQL via `better-sqlite3` was preferred over Prisma/Drizzle/etc. because:
- Direct control over queries with no abstraction layer to debug
- Simpler mental model — what you write is what runs
- No schema files, migrations CLI, or code generation steps
- The synchronous API of `better-sqlite3` is simpler than async ORMs in Next.js API routes

### Why Static JSON for Food Data Instead of a Database Table?

The 2,767 NZ foods are read-only reference data. Storing them in a JSON file and caching in memory means:
- Instant search with no database queries (pure array filter)
- No database bloat from static data
- Easy to regenerate from source files without migrations
- The food data never changes at runtime — only the parse script updates it

### Why CSS Modules Instead of Tailwind?

CSS Modules provide scoped styles without a utility framework. Each component has its own `.module.css` file, preventing style collisions. This approach was chosen for simplicity and to keep the styling conventional.

### Why Webpack Instead of Turbopack?

The `npm run dev` script uses `--webpack` instead of `--turbopack` because `better-sqlite3` (a native Node.js addon) requires a webpack `externals` configuration to work correctly with Next.js. Turbopack doesn't support the same `externals` API, so webpack is used for compatibility.
