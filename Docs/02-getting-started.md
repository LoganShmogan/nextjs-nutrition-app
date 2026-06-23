# Getting Started

## Prerequisites

- **Node.js 22+** (for better-sqlite3 compatibility)
- **npm** (comes with Node.js)
- **Docker** (optional, for containerised deployment)

## Local Development Setup

### 1. Install Dependencies

```bash
cd nutritional-software
npm install
```

This installs all packages including `better-sqlite3`, which requires a native C++ build step. The install may need Python 3, `make`, and `g++` on Linux/macOS. On most systems these are already present.

### 2. Parse the Food Database

The app ships with raw NZ FOODfiles data in `data/raw/`. You need to parse this into a JSON file before the food search will work:

```bash
npm run parse-foods
```

This runs `scripts/parse-foodfiles.mjs`, which reads `data/raw/DATA.AP` and `data/raw/NAME.FT`, extracts 8 nutrients per food, and writes the result to `public/foods.json`. You only need to run this once unless the raw data files change.

Expected output:
```
Found DATA.AP and NAME.FT - parsing...
  2767 food names loaded
  Header at line 1, 89 cols
  ...
2767 food records parsed
Written to public/foods.json (2767 foods, X.XX MB)
```

### 3. Start the Development Server

```bash
npm run dev
```

This starts Next.js in development mode using webpack (not Turbopack). The app will be available at `http://localhost:3000`.

The SQLite database file (`data/nutrition.db`) is created automatically on first request. No database setup or migration commands are needed.

### 4. Create an Account

1. Open `http://localhost:3000`
2. Click "Sign Up" tab
3. Enter a username and password
4. You'll be redirected to the dashboard

## Docker Deployment

### Build and Run

```bash
cd nutritional-software
docker compose up --build
```

This builds a multi-stage Docker image (Node 22 Alpine) and starts the app on port 3000. The SQLite database is stored in a Docker named volume (`nutrition-data`) mounted at `/app/data`, so data persists across container restarts.

### Stop

```bash
docker compose down
```

Data is preserved in the `nutrition-data` volume. To destroy data too:

```bash
docker compose down -v
```

## Available Scripts

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start development server (webpack mode, port 3000) |
| `npm run build` | Create production build |
| `npm start` | Run production server |
| `npm run lint` | Run Biome linter |
| `npm run format` | Auto-format code with Biome |
| `npm run parse-foods` | Parse NZ FOODfiles into `public/foods.json` |
| `npm run test` | Run Vitest unit tests |

## Environment

No `.env` file is required. The app uses:
- SQLite stored at `data/nutrition.db` (auto-created)
- Food data from `public/foods.json` (must be generated via `npm run parse-foods`)
- No external API keys needed

## Troubleshooting

**`better-sqlite3` fails to install:**
Install native build tools first:
```bash
# Ubuntu/Debian
sudo apt install python3 make g++

# macOS
xcode-select --install
```

**Food search returns no results:**
Run `npm run parse-foods` to generate `public/foods.json`. If the file is empty or missing, the search API returns a 503 error.

**Database errors:**
Delete `data/nutrition.db` and restart the server. The database is recreated automatically with all tables and migrations.
