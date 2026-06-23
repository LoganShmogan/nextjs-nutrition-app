# Design Decisions

This document explains **why** things were built the way they are — the reasoning behind architectural choices, tradeoffs considered, and alternatives that were rejected.

## Why Next.js App Router?

**Decision:** Use Next.js with the App Router (not Pages Router) as the full-stack framework.

**Reasoning:**
- App Router is the current standard for new Next.js projects
- File-based routing means adding a new page is just creating a folder with a `page.tsx` — no router configuration
- API routes live alongside pages in the same project, eliminating the need for a separate backend server
- Server components (the default) reduce client-side JavaScript for pages that don't need interactivity
- TypeScript support is built-in with zero configuration

**Why not a separate backend (Express, Fastify)?**
Adding a separate API server would double the deployment complexity and require CORS configuration. Next.js API routes give us a server-side Node.js environment within the same project and deployment.

## Why SQLite Over PostgreSQL?

**Decision:** Use SQLite (better-sqlite3) instead of PostgreSQL.

**Reasoning:**
- **Zero setup** — no database server to install, configure, or manage
- **No Docker dependency for the database** — the database is just a file on disk
- **Automatic creation** — the database and all tables are created on first server startup
- **Simple deployment** — the database file travels with the application
- **WAL mode** provides adequate concurrency for a single-user application
- **Synchronous API** in better-sqlite3 simplifies code — no `async/await` for every query

**Tradeoff:** SQLite doesn't handle concurrent writes well. If the app needed to serve many simultaneous users writing data, PostgreSQL would be necessary. For this application's scope (one nutritionist with a manageable number of patients), SQLite is sufficient.

## Why Raw SQL Over an ORM?

**Decision:** Write raw SQL queries with better-sqlite3 instead of using Prisma, Drizzle, or another ORM.

**Reasoning:**
- **Direct control** — you write the exact SQL that runs, no abstraction layer to debug
- **Simpler mental model** — understanding what happens requires knowing SQL, not SQL plus an ORM's query language
- **No code generation** — ORMs like Prisma require a schema file, a generate step, and produce a client library. Raw SQL has none of that overhead
- **No migration CLI** — the app handles its own schema creation and migrations in `lib/db.ts`
- **Fewer dependencies** — just the `better-sqlite3` package

**Tradeoff:** You lose type-safe query builders and automatic migration tooling. Every query is a plain string, so typos in column names are caught at runtime, not compile time. For a project of this size, the simplicity wins.

## Why Store Pre-Calculated Nutrient Values in Food Logs?

**Decision:** When a user logs a food, the nutrient values are scaled to the portion size and stored directly in the `food_logs` row, rather than storing only a food ID and portion size and calculating on read.

**Reasoning:**
- **Simple aggregation** — daily totals are just `SUM(protein)` across the day's rows, no joins or per-row calculations needed
- **Custom food support** — custom foods (not in the NZ FOODfiles) work identically to database foods because the values are embedded in the log entry
- **Historical accuracy** — if the food database is updated (e.g., a nutrient value is corrected), existing log entries retain the values that were accurate at the time of logging
- **Query performance** — aggregation queries (used by visualisation, summary, and feedback pages) are fast because they operate on pre-computed values

**Tradeoff:** The food_logs table is wider (11 nutrient columns per row) and uses more storage. For the scale of this application (individual users logging meals), storage is not a concern.

## Why No Global State Management?

**Decision:** Use React `useState` and `useEffect` for all state, with no Redux/Zustand/React Context for app data.

**Reasoning:**
- **Each page is independent** — the dashboard doesn't share data with the food log page, and the visualisation page fetches its own data fresh
- **No cross-page data flow** — authentication state is handled by cookies (server-side), not React state
- **Simpler debugging** — state lives in one component, not in a global store that multiple components read and write
- **Fresh data** — navigating to a page always fetches the latest data from the server, so there's no stale cache to manage

**Tradeoff:** Navigating between pages triggers fresh API calls even for data you just saw. For this app, the data could change between page views (e.g., a food was logged), so re-fetching is correct behaviour. A global store would add complexity for caching that isn't needed.

## Why Cookie-Based Auth Over JWT?

**Decision:** Use simple httpOnly cookies with the user ID instead of signed JWTs.

**Reasoning:**
- **Simplicity** — setting a cookie is one line of code, no JWT library needed
- **httpOnly** — the cookie can't be read by client-side JavaScript, reducing XSS risk
- **Automatic transmission** — browsers send cookies with every request, no need for an Authorization header or token refresh logic
- **Stateless on the server** — no session store needed, the user ID is in the cookie

**Tradeoff:** The cookie is not signed or encrypted, so if an attacker can read cookies (e.g., via a man-in-the-middle attack on HTTP), they can impersonate the user. In production, this would need HTTPS and signed/encrypted session tokens. For a development/assignment context, the simplicity is appropriate.

## Why CSS Modules Over Tailwind?

**Decision:** Use CSS Modules (`.module.css` files) for component-scoped styling.

**Reasoning:**
- **Scoped by default** — class names are automatically unique per component, preventing style collisions
- **Standard CSS** — no utility class vocabulary to learn
- **No build configuration** — CSS Modules work out of the box with Next.js
- **Clean JSX** — class names like `styles.card` are more readable than long utility strings

## Why In-Memory Food Data Cache Over Database Storage?

**Decision:** Load `foods.json` into memory and search it with array filtering, rather than importing the 2,767 foods into a SQLite table and querying with SQL.

**Reasoning:**
- **Speed** — in-memory array filter on 2,767 records takes < 1ms, far faster than any database query
- **Separation of concerns** — the food reference database is read-only external data; the SQLite database is for user-generated data that changes. Mixing them would conflate two different data lifecycles
- **Simple updates** — re-running the parse script regenerates `foods.json` without database migrations or data imports
- **No indexing needed** — 2,767 records is small enough that a linear scan is effectively instant

**Tradeoff:** The full food list (~1-2MB of JSON) lives in server memory. This is negligible for a Node.js process.

## Why Client-Side PDF Generation?

**Decision:** Generate PDF reports using jsPDF in the browser, rather than on the server.

**Reasoning:**
- **No server load** — PDF generation can be CPU-intensive; offloading to the client frees up the server
- **Instant download** — the PDF is generated and downloaded in the browser with no round-trip to the server
- **Access to display data** — the export component already has all the data it needs in state; sending it to a server endpoint and back would be redundant

## Why Debounced Search Over Instant Search?

**Decision:** Wait 350ms after the user stops typing before sending a search request.

**Reasoning:**
- **Fewer API calls** — typing "chicken" fires one request instead of seven (c, ch, chi, chic, chick, chicke, chicken)
- **Better UX** — intermediate results for partial queries (like results for "ch") would flash and disappear, which is distracting
- **Server protection** — prevents unnecessary load on the food search endpoint

## Why Vitest Over Jest?

**Decision:** Use Vitest instead of Jest for unit testing.

**Reasoning:**
- **Native ESM support** — Vitest handles ES modules without the configuration gymnastics that Jest requires
- **Shared config** — uses the same Vite/esbuild transform as the app, so import paths and TypeScript work identically in tests
- **Faster** — no separate compilation step, tests run against the same module graph as the app
- **Compatible API** — `describe`, `it`, `expect` work the same as Jest, so there's no learning curve

## Why Biome Over ESLint + Prettier?

**Decision:** Use Biome as a single tool for linting and formatting.

**Reasoning:**
- **One tool, one config** — replaces ESLint, Prettier, and their configuration files with a single `biome.json`
- **Fast** — Biome is written in Rust and processes files much faster than the JavaScript-based ESLint/Prettier
- **No plugin management** — ESLint requires plugins for React, Next.js, TypeScript, import sorting, etc. Biome includes all of these built-in
- **Consistent** — formatting and linting are integrated, so there are no conflicts between them (a common issue with separate ESLint and Prettier setups)
