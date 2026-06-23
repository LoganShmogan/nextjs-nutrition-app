# Deployment and Configuration

## Docker Deployment

The app is containerised with a multi-stage Dockerfile and orchestrated with Docker Compose.

### Dockerfile

**File:** `nutritional-software/Dockerfile`

The build uses three stages to minimise the final image size:

```
Stage 1: "deps" (Install dependencies)
  ├── Base: node:22-alpine
  ├── Install build tools: python3, make, g++ (needed for better-sqlite3 native compilation)
  ├── Copy package*.json
  └── Run npm ci (clean install from lockfile)

Stage 2: "builder" (Build the app)
  ├── Base: node:22-alpine
  ├── Copy node_modules from deps stage
  ├── Copy all source files
  └── Run npm run build (Next.js production build)

Stage 3: "runner" (Production image)
  ├── Base: node:22-alpine
  ├── Set NODE_ENV=production, PORT=3000, HOSTNAME=0.0.0.0
  ├── Create /app/data directory for SQLite database
  ├── Copy node_modules, .next, public, package.json from previous stages
  └── CMD: next start
```

The multi-stage approach means the final image doesn't contain build tools (python3, make, g++), source TypeScript files, or intermediate build artefacts. Only the compiled Next.js output, node_modules, and public assets ship.

### Docker Compose

**File:** `nutritional-software/docker-compose.yml`

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - nutrition-data:/app/data
    restart: unless-stopped

volumes:
  nutrition-data:
```

**Key points:**
- **Single service** — just the app (no separate database container since SQLite is embedded)
- **Named volume** `nutrition-data` mounted at `/app/data` — this is where the SQLite database file lives, so data persists across container rebuilds
- **Port 3000** exposed to the host
- **`restart: unless-stopped`** — container restarts automatically on crash but not after manual stop

### Running with Docker

```bash
cd nutritional-software

# Build and start
docker compose up --build

# Start in background
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down

# Stop and destroy data
docker compose down -v
```

### .dockerignore

The `.dockerignore` file excludes from the build context:
- `node_modules` (reinstalled in the container)
- `.next` (rebuilt in the container)
- `data/nutrition.db*` (database files — these are created at runtime)
- `.git` (not needed in the image)
- `coverage` and debug logs

## Configuration Files

### next.config.ts

```typescript
const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
  webpack: (config) => {
    config.externals.push({ "better-sqlite3": "commonjs better-sqlite3" });
    return config;
  },
};
```

- **React Compiler** is enabled for automatic optimisation of React components
- **Webpack externals** marks `better-sqlite3` as external so webpack doesn't try to bundle the native addon — it's loaded at runtime from node_modules instead
- **Turbopack root** is set but the dev script uses `--webpack` flag, so Turbopack is not used in development

### tsconfig.json

- **Target: ES2017** — modern JavaScript features without cutting-edge syntax
- **Strict mode: true** — enables all TypeScript strict checks
- **Module resolution: bundler** — matches Next.js's module resolution strategy
- **Path alias: `@/*`** maps to the project root, allowing imports like `@/lib/db` instead of `../../lib/db`

### biome.json

Biome replaces ESLint + Prettier as the linter and formatter:
- **2-space indentation**
- **Recommended rules** for general TypeScript, React, and Next.js
- **Import organisation** enabled (auto-sorts imports)
- **Git-aware** — uses `.gitignore` to skip files

### vitest.config.ts

Configures Vitest with the same path alias (`@/`) as the Next.js project, so test files can use the same import paths as source files.

## Environment Variables

The app requires **no environment variables** for local development. Everything is configured with defaults:

| Variable | Where Used | Default |
|----------|-----------|---------|
| `DATABASE_URL` | Not used (SQLite uses file path) | `data/nutrition.db` |
| `PORT` | Dockerfile | `3000` |
| `HOSTNAME` | Dockerfile | `0.0.0.0` |
| `NODE_ENV` | Dockerfile | `production` |

No `.env` file is needed. The database path is hardcoded in `lib/db.ts`.

## Production Considerations

### Data Persistence

The SQLite database is stored at `data/nutrition.db` relative to the project root. In Docker, this directory is backed by a named volume so data survives container restarts and rebuilds.

**Backup:** Copy the `nutrition.db` file while the app is stopped, or use SQLite's `.backup` command. The WAL files (`nutrition.db-shm`, `nutrition.db-wal`) are transient and regenerated automatically.

### Food Data

`public/foods.json` must be generated before deployment by running `npm run parse-foods`. This file is included in the Docker image during the build stage. If you update the raw FOODfiles data, rebuild the Docker image to include the new `foods.json`.

### Scaling

SQLite handles one writer at a time. WAL mode allows concurrent reads, but if multiple users write simultaneously, writes are serialised. For a single-user or small-team deployment this is fine. For high-concurrency scenarios, you'd need to swap SQLite for PostgreSQL or another client-server database.
