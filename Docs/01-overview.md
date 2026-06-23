# NutriTrack - Application Overview

## What Is This App?

NutriTrack (internally `nutritional-software`) is a full-stack web application for tracking dietary intake, analysing nutritional content, and providing feedback based on patient profiles. It is designed for nutrition professionals and health-conscious individuals who want to log meals, set dietary goals, compare intake against Recommended Daily Intakes (RDIs), and visualise trends over time.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16.2.6 (App Router) | Server-side rendering, file-based routing, API routes in one project |
| Language | TypeScript 5 (strict mode) | Type safety across frontend and backend |
| UI | React 19.2.6 | Component-based UI with hooks |
| Styling | CSS Modules + Global CSS | Scoped styles per component, no runtime CSS-in-JS overhead |
| Database | SQLite via better-sqlite3 | Zero-config, file-based, no external database server needed |
| Charts | Chart.js + react-chartjs-2 | Bar, line, and doughnut charts for visualisation |
| PDF Export | jsPDF + jspdf-autotable | Client-side PDF generation for reports |
| Linting | Biome 2.2.0 | Fast all-in-one linter and formatter replacing ESLint + Prettier |
| Testing | Vitest 4.1.7 | Fast unit testing compatible with the project's module system |
| Deployment | Docker + Docker Compose | Containerised deployment with persistent data volume |

## Project Structure

```
nextjs-nutrition-app/
├── README.md                           # API documentation
├── LICENSE                             # MIT License
├── UserStores&ProductBacklog/          # Assignment spec and backlog PDFs
├── logan_dev_files/                    # Developer scratch files
├── nutritional-software/               # ← THE ACTUAL APPLICATION
│   ├── app/                            # Next.js App Router pages + API routes
│   │   ├── page.tsx                    # Login/signup (root route)
│   │   ├── layout.tsx                  # Root layout with fonts
│   │   ├── globals.css                 # Global styles
│   │   ├── dashboard/                  # Main navigation hub
│   │   ├── profile/                    # Create/edit patient profiles
│   │   ├── patients/                   # Patient list and selection
│   │   ├── food-log/                   # Search + log foods
│   │   ├── summary/                    # Daily nutrition summary vs RDI
│   │   ├── nutritional-feedback/       # Real-time nutrient feedback
│   │   ├── analysis/                   # Save analysis records
│   │   ├── visualisation/              # Weekly charts and history
│   │   ├── education/                  # Educational content + quizzes
│   │   └── api/                        # Backend API routes
│   ├── components/                     # Reusable React components
│   ├── lib/                            # Business logic and utilities
│   │   ├── db.ts                       # SQLite database setup
│   │   ├── session.ts                  # Cookie-based session helpers
│   │   ├── nutrition/                  # Calculation engines
│   │   └── validation/                 # Input validation
│   ├── types/                          # TypeScript type definitions
│   ├── tests/                          # Vitest unit tests
│   ├── scripts/                        # Data parsing scripts
│   ├── data/                           # SQLite database + raw food data
│   │   └── raw/                        # NZ FOODfiles source data
│   ├── public/                         # Static assets (foods.json, icons)
│   ├── package.json                    # Dependencies and scripts
│   ├── Dockerfile                      # Multi-stage Docker build
│   └── docker-compose.yml              # Container orchestration
└── Docs/                               # ← THIS DOCUMENTATION
```

## Key Features

1. **User Authentication** - Signup/login with session cookies
2. **Patient Profiles** - Create multiple patient profiles with demographics, health data, and fitness assessments
3. **Food Logging** - Search 2,700+ NZ foods from the FOODfiles database, log meals by type and time
4. **Custom Foods** - Manually enter nutrition data for foods not in the database
5. **Nutrition Analysis** - Calculate daily totals across 11 nutrients, compare against personalised RDI targets
6. **Nutritional Feedback** - Real-time status indicators (low/ok/high) for each nutrient
7. **Data Visualisation** - Weekly bar and line charts, daily macro breakdowns, RDI comparison charts
8. **PDF/CSV Export** - Generate reports with daily totals, RDI comparisons, and written analysis summaries
9. **Educational Content** - Nutrient guides, RDI explanations, quizzes, and case studies
10. **Seed Data** - Generate 2 weeks of realistic meal data for testing and demos

## Authors

- **Logan Young** - Database, data pipeline, authentication, deployment
- **Marty** - Nutrition algorithms, thresholds, profile-based targets
