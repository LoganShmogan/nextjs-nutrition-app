# NutriTrack — Nutrition Tracking App

NutriTrack is a web application that lets you track what you eat, see how your diet stacks up against recommended daily targets, and visualise your nutrition over time. It includes a database of over 2,700 New Zealand foods, interactive charts, PDF report generation, and educational content about nutrition.

Built by **Logan Young** and **Marty** as a university assignment (BICT — Software Engineering).

---

## Table of Contents

- [What Does This App Do?](#what-does-this-app-do)
- [What You Need Before Starting](#what-you-need-before-starting)
- [Step-by-Step Setup Guide](#step-by-step-setup-guide)
- [How to Use the App](#how-to-use-the-app)
- [Running With Docker (Alternative)](#running-with-docker-alternative)
- [Useful Commands](#useful-commands)
- [Troubleshooting Common Problems](#troubleshooting-common-problems)
- [How the Tech Works (Plain English)](#how-the-tech-works-plain-english)
- [For More Detail](#for-more-detail)
- [Figma Design](#figma-design)
- [License](#license)
- [Full File Tree](#full-file-tree)

---

## What Does This App Do?

Think of it as a food diary with a brain. Here's what you can do with it:

1. **Create an account** — Sign up with a username and password so your data is saved.
2. **Set up patient profiles** — Enter details like age, weight, height, and activity level. The app uses this to calculate personalised nutrition targets.
3. **Log your meals** — Search for a food (e.g. "chicken breast"), pick a portion size, and log it to a meal (breakfast, lunch, dinner, or snack).
4. **See your daily nutrition** — The app adds up everything you've eaten and tells you if you're getting enough protein, too much sugar, not enough iron, etc.
5. **View charts and trends** — See bar charts and line graphs of your nutrition over the past week, broken down by day or by meal.
6. **Export reports** — Download your data as a CSV spreadsheet or a formatted PDF report.
7. **Learn about nutrition** — Read guides about different nutrients, take quizzes, and work through case studies.

---

## What You Need Before Starting

You need two things installed on your computer. If you don't have them yet, follow the links below.

### 1. Node.js (version 22 or newer)

Node.js is the program that runs the app on your computer. Think of it like an engine that powers the application.

- **Download it here:** https://nodejs.org
- Click the button that says **"LTS"** (Long Term Support) — that's the stable version.
- Run the installer and click through the steps. The default options are fine.
- When it's done, **npm** (Node Package Manager) is also installed automatically. npm is a tool that downloads the extra code libraries the app needs.

**To check if it worked**, open a terminal (see below) and type:
```
node --version
```
You should see something like `v22.x.x`. If you see an error like "command not found", the installation didn't work — try restarting your computer and running the installer again.

### 2. A Terminal (Command Line)

A terminal is a text-based window where you type commands. You already have one:

- **Windows:** Press the Windows key, type `Terminal` or `PowerShell`, and open it.
- **macOS:** Press Cmd + Space, type `Terminal`, and open it.
- **Linux:** Press Ctrl + Alt + T, or find "Terminal" in your application menu.

You'll use the terminal to run a handful of commands to get the app going. Don't worry — this guide tells you exactly what to type.

---

## Step-by-Step Setup Guide

### Step 1: Download the project

If you received this as a zip file, unzip it somewhere you'll remember (like your Desktop or Documents folder).

If you're cloning from GitHub, open your terminal and type:
```
git clone <the-repository-url>
```
Replace `<the-repository-url>` with the actual URL of the repository.

### Step 2: Open a terminal in the project folder

You need to navigate your terminal into the `nutritional-software` folder — this is where the actual app lives.

Type this into your terminal (adjust the path to wherever you put the project):
```
cd path/to/nextjs-nutrition-app/nutritional-software
```

For example, if the project is on your Desktop:
```
cd ~/Desktop/nextjs-nutrition-app/nutritional-software
```

**Tip:** You can also right-click the `nutritional-software` folder in your file manager and look for "Open in Terminal" or "Open Terminal Here".

### Step 3: Install dependencies

The app needs extra code libraries to work (things like the web framework, the database driver, and the charting library). This command downloads all of them:

```
npm install
```

This might take a minute or two. You'll see a lot of text scrolling by — that's normal. When it's done, you'll see your terminal prompt again with no error messages.

**If you see errors about `python3`, `make`, or `g++`:** These are build tools needed to compile one of the libraries. Install them first:

- **Ubuntu/Debian Linux:**
  ```
  sudo apt install python3 make g++
  ```
- **macOS:**
  ```
  xcode-select --install
  ```
- **Windows:** The Node.js installer has an option to install build tools — re-run the installer and tick that box.

Then run `npm install` again.

### Step 4: Generate the food database

The app comes with raw food data from the New Zealand government, but it needs to be converted into a format the app can read. Run this command once:

```
npm run parse-foods
```

You should see output like:
```
Found DATA.AP and NAME.FT - parsing...
  2767 food names loaded
  ...
2767 food records parsed
Written to public/foods.json (2767 foods, X.XX MB)
```

If you see this, it worked. You only ever need to run this command once.

### Step 5: Start the app

```
npm run dev
```

You should see something like:
```
  ▲ Next.js 16.2.6
  - Local:   http://localhost:3000
```

The app is now running.

### Step 6: Open it in your browser

Open your web browser (Chrome, Firefox, Edge, Safari — any will work) and go to:

```
http://localhost:3000
```

You should see the login/signup page. You're in!

### Step 7: Create an account and start using it

1. Click the **"Sign Up"** tab
2. Pick a username and password
3. You'll be taken to the dashboard — from here you can access all the features

To stop the app later, go back to your terminal and press **Ctrl + C**.

---

## How to Use the App

Here's a walkthrough of each section you'll see on the dashboard.

### Patient Management

This is where you create profiles for the people whose nutrition you're tracking (this could be yourself or patients/clients). Each profile stores details like age, weight, height, gender, and activity level. The app uses this information to calculate personalised nutrition targets — for example, a very active 25-year-old male needs more calories than a sedentary 60-year-old female.

You can have multiple profiles and switch between them. The currently "active" profile is the one the app uses for all calculations.

### Food Log

This is the core feature. Here's how to log a meal:

1. **Search for a food** — Type something like "banana" or "white bread" in the search box. After a brief pause, results from the NZ food database appear.
2. **Pick a food** — Click on the one you want. A panel appears showing its nutritional info.
3. **Set the portion size** — Type how many grams (or mL) you ate. The nutritional values update automatically as you change the number.
4. **Choose the meal** — Click Breakfast, Lunch, Dinner, or Snack.
5. **Set the date and time** — These default to right now, but you can change them to log past meals.
6. **Click Log** — The food is saved to your diary.

Your logged foods for today appear at the bottom of the page. You can delete any entry if you made a mistake.

**Can't find a food?** Scroll to the bottom of the page — there's a "Custom Food" form where you can type in the name and nutrition values manually.

### Nutrition Summary

Shows a grid of cards — one for each nutrient (calories, protein, carbs, fat, sugar, sodium, fibre, calcium, iron, vitamin C). Each card shows:
- How much you've eaten today
- What your target is
- A progress bar and a colour-coded badge (green = on track, orange = low, red = too high)

### Nutritional Feedback

Similar to the summary, but focused on giving you plain-English feedback about your intake for the day.

### Visualisation

Interactive charts showing your nutrition over time:
- **Weekly calorie bar chart** — one bar per day
- **Macronutrient line chart** — protein, carbs, and fat trends over the week
- **Daily breakdown** — click on any day to see a doughnut chart of your macros and a per-meal calorie comparison

You can navigate between weeks using the arrow buttons. There's also a "Load Test Data" button that fills in 2 weeks of example meals so you can see what the charts look like with data.

### Analysis

A place to save written analysis notes (useful for dietitians recording observations about a patient's intake patterns).

### Education

Four tabs of learning content:
- **Nutrient Guide** — What each nutrient does and how much you need
- **Understanding RDIs** — Explains what Recommended Daily Intakes are and how they're calculated
- **Quiz** — Test your knowledge with 8 multiple-choice questions
- **Case Study** — A practice scenario to work through

### Export (on the Dashboard)

At the bottom of the dashboard, you can export your data:
- **CSV** — A spreadsheet file you can open in Excel or Google Sheets
- **PDF Report** — A formatted document with tables of your daily totals
- **PDF Summary** — A written analysis document

Pick a date range (last 7/14/30 days, or custom) and click the export button you want.

---

## Running With Docker (Alternative)

If you have Docker installed, you can run the app in a container instead of installing Node.js directly. This is useful if you want a clean, isolated setup.

### What is Docker?

Docker is a tool that packages an app and everything it needs into a "container" — like a virtual mini-computer that runs the app the same way on every machine. You don't need to understand Docker deeply to use it here.

- **Install Docker:** https://www.docker.com/products/docker-desktop

### Run the app with Docker

```
cd nutritional-software
docker compose up --build
```

The first time takes a few minutes (it's downloading and building everything). After that, the app is at `http://localhost:3000` just like before.

### Stop the app

```
docker compose down
```

Your data is saved and will still be there next time you start it. If you want to completely wipe all data and start fresh:

```
docker compose down -v
```

---

## Useful Commands

Run all of these from inside the `nutritional-software` folder.

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start the app in development mode (what you'll use most) |
| `npm run build` | Build a production-ready version of the app |
| `npm start` | Run the production version (after building) |
| `npm run parse-foods` | Convert the raw NZ food data into the format the app needs (run once) |
| `npm run test` | Run the automated tests to check the code works correctly |
| `npm run lint` | Check the code for style issues and common mistakes |
| `npm run format` | Automatically fix code formatting |

---

## Troubleshooting Common Problems

### "command not found: npm" or "command not found: node"

Node.js isn't installed, or your terminal can't find it. Re-install Node.js from https://nodejs.org and restart your terminal.

### The food search doesn't return any results

You forgot to generate the food database. Run:
```
npm run parse-foods
```
Then restart the app (`Ctrl + C`, then `npm run dev`).

### "Error: Cannot find module 'better-sqlite3'"

The native database library didn't compile properly during `npm install`. Make sure you have build tools installed (see Step 3 above), delete the `node_modules` folder, and reinstall:
```
rm -rf node_modules
npm install
```

### The page shows a blank white screen or "Internal Server Error"

Check the terminal where the app is running — there's usually an error message that explains what went wrong. The most common causes are:
- Missing `foods.json` (run `npm run parse-foods`)
- The `data/` folder can't be created (permissions issue — try running from a folder you own, like Desktop)

### I forgot my password

There's no password reset feature. Since the database is local to your machine, you can delete it and start fresh:
```
rm data/nutrition.db
```
Then restart the app. You'll need to create a new account, but old data will be gone.

### The app won't start — port 3000 is already in use

Something else is using port 3000. Either close that other program, or stop a previous instance of this app. On Linux/macOS you can find and kill it:
```
lsof -i :3000
kill <PID>
```

---

## How the Tech Works (Plain English)

If you're curious about what's happening under the hood but don't have a programming background, here's a simplified explanation.

### The app has two halves

**The frontend** is what you see in the browser — the pages, buttons, forms, and charts. It's built with **React**, a popular library for building user interfaces. When you click a button or type in a search box, React updates the page without reloading it.

**The backend** is the invisible part that runs on your computer (not in the browser). It handles things like saving data to the database, looking up foods, and calculating nutrition totals. It's built with **Next.js**, which is a framework that combines the frontend and backend into one project.

### How they talk to each other

When the frontend needs data (e.g. "show me today's food log"), it sends a request to the backend. The backend looks up the data in the database, and sends it back as a structured response. The frontend then displays it.

This happens over **HTTP** — the same protocol your browser uses to load any website. The difference is that instead of talking to a server on the internet, the frontend talks to a server running right on your own computer (that's what `localhost:3000` means — "this computer, port 3000").

### Where your data is stored

Everything is saved in a **SQLite database**, which is just a single file on your computer called `nutrition.db` inside the `data/` folder. There's no external database server to manage. When you log a food, it gets written to this file. When you view your nutrition summary, the app reads from this file.

### Where the food data comes from

The 2,700+ foods come from the **NZ FOODfiles**, a database maintained by the New Zealand government. The raw data files ship with this project. The `npm run parse-foods` command converts them into a clean format the app can search quickly.

---

## For More Detail

The `Docs/` folder contains in-depth technical documentation:

| Document | What it covers |
|----------|---------------|
| [01-overview.md](Docs/01-overview.md) | Tech stack, project structure, feature list |
| [02-getting-started.md](Docs/02-getting-started.md) | Developer setup guide |
| [03-architecture.md](Docs/03-architecture.md) | System diagrams, how components connect |
| [04-database.md](Docs/04-database.md) | Database tables, columns, relationships |
| [05-api-reference.md](Docs/05-api-reference.md) | Every API endpoint with request/response formats |
| [06-authentication.md](Docs/06-authentication.md) | Login system, cookies, session management |
| [07-algorithms.md](Docs/07-algorithms.md) | All formulas — BMR, TDEE, BMI, nutrient scaling, search |
| [08-frontend.md](Docs/08-frontend.md) | Every page and component explained |
| [09-food-data-pipeline.md](Docs/09-food-data-pipeline.md) | How raw food files become searchable data |
| [10-deployment.md](Docs/10-deployment.md) | Docker setup, configuration files |
| [11-design-decisions.md](Docs/11-design-decisions.md) | Why things were built the way they were |
| [12-testing.md](Docs/12-testing.md) | How tests work and what they cover |

---

## Figma Design

The original UI wireframe/prototype:

https://www.figma.com/proto/V04QhCvXvDZz7aP9gYCOJp/Prototype-SWE-A1--Frontend-Wireframe-Diagram-?node-id=0-1&t=34uMyQwJYsx9egKD-1

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Full File Tree

Below is every file in the project. The main application code lives inside the `nutritional-software/` folder.

```
nextjs-nutrition-app/
│
├── README.md                          # This file — project overview and setup guide
├── LICENSE                            # MIT license
├── package-lock.json                  # Auto-generated dependency lock file (do not edit)
│
├── Docs/                              # Detailed technical documentation
│   ├── 01-overview.md                 #   App overview, tech stack, feature list
│   ├── 02-getting-started.md          #   Developer setup instructions
│   ├── 03-architecture.md             #   System architecture and data flow diagrams
│   ├── 04-database.md                 #   Database tables, columns, relationships
│   ├── 05-api-reference.md            #   Every API endpoint documented
│   ├── 06-authentication.md           #   Login system and session management
│   ├── 07-algorithms.md               #   All formulas and calculations explained
│   ├── 08-frontend.md                 #   Every page and component explained
│   ├── 09-food-data-pipeline.md       #   How raw food files become searchable data
│   ├── 10-deployment.md               #   Docker and configuration
│   ├── 11-design-decisions.md         #   Why things were built the way they were
│   └── 12-testing.md                  #   Test framework and coverage
│
├── UserStores&ProductBacklog/         # Assignment spec and product backlog
│   ├── Nutrition Spec and Assessment Guidelines.pdf
│   └── product backlog.pdf
│
├── logan_dev_files/                   # Developer scratch files
│
└── nutritional-software/              # THE MAIN APPLICATION
    │
    ├── package.json                   # App dependencies and scripts
    ├── package-lock.json              # Auto-generated dependency lock file
    ├── tsconfig.json                  # TypeScript configuration
    ├── next.config.ts                 # Next.js framework configuration
    ├── next-env.d.ts                  # Auto-generated Next.js type declarations
    ├── middleware.ts                   # Auth guard — checks login on every page load
    ├── biome.json                     # Linter and formatter configuration
    ├── vitest.config.ts               # Test runner configuration
    ├── Dockerfile                     # Docker image build instructions
    ├── docker-compose.yml             # Docker container orchestration
    ├── .dockerignore                  # Files excluded from Docker builds
    ├── .gitignore                     # Files excluded from version control
    │
    ├── app/                           # All pages and API routes (Next.js App Router)
    │   ├── layout.tsx                 #   Root layout — wraps every page with fonts + styles
    │   ├── page.tsx                   #   Login / Sign Up page (the first thing you see)
    │   ├── page.module.css            #   Styles for the login page
    │   ├── globals.css                #   Global styles shared across the whole app
    │   │
    │   ├── dashboard/                 #   Main navigation hub after login
    │   │   ├── page.tsx
    │   │   └── page.module.css
    │   │
    │   ├── patients/                  #   Patient list — view, select, edit, delete profiles
    │   │   ├── page.tsx
    │   │   └── page.module.css
    │   │
    │   ├── profile/                   #   Create or edit a patient profile
    │   │   ├── page.tsx
    │   │   └── page.module.css
    │   │
    │   ├── food-log/                  #   Search foods, log meals, manage today's entries
    │   │   ├── page.tsx
    │   │   └── page.module.css
    │   │
    │   ├── summary/                   #   Daily nutrition vs. recommended targets
    │   │   ├── page.tsx
    │   │   └── page.module.css
    │   │
    │   ├── nutritional-feedback/      #   Real-time nutrient feedback cards
    │   │   ├── page.tsx
    │   │   └── page.module.css
    │   │
    │   ├── visualisation/             #   Charts — weekly trends, daily breakdowns
    │   │   ├── page.tsx
    │   │   └── page.module.css
    │   │
    │   ├── analysis/                  #   Save written analysis records
    │   │   ├── page.tsx
    │   │   └── page.module.css
    │   │
    │   ├── education/                 #   Nutrient guides, quizzes, case studies
    │   │   ├── page.tsx
    │   │   └── page.module.css
    │   │
    │   └── api/                       #   Backend API routes (invisible to the user)
    │       ├── auth/
    │       │   ├── signup/route.ts    #     Create a new account
    │       │   ├── login/route.ts     #     Log in to an existing account
    │       │   └── logout/route.ts    #     Log out (clear session)
    │       ├── profile/
    │       │   ├── route.ts           #     Create, read, update, delete profiles
    │       │   └── activate/route.ts  #     Switch the active patient profile
    │       ├── food-log/
    │       │   └── route.ts           #     Create, read, delete food log entries
    │       ├── foods/
    │       │   └── search/route.ts    #     Search the NZ food database
    │       ├── custom-foods/
    │       │   └── route.ts           #     Create, read, delete custom foods
    │       ├── nutrition-summary/
    │       │   └── route.ts           #     Calculate daily nutrition totals vs. targets
    │       ├── energy-expenditure/
    │       │   └── route.ts           #     Calculate BMR, TDEE, and BMI
    │       ├── visualisation/
    │       │   └── route.ts           #     Aggregated data for charts
    │       ├── analyses/
    │       │   └── route.ts           #     Save and list analysis records
    │       └── seed/
    │           └── route.ts           #     Generate or remove test data
    │
    ├── components/                    # Reusable UI building blocks
    │   ├── ProfileForm.tsx            #   Patient profile creation/editing form
    │   ├── NutritionSummaryCard.tsx   #   Nutrient comparison cards with progress bars
    │   ├── Analysis.tsx               #   Analysis record form and list
    │   ├── ExportSection.tsx          #   CSV and PDF export controls
    │   ├── ExportSection.module.css   #   Styles for the export section
    │   ├── Navbar.tsx                 #   Navigation bar (placeholder)
    │   └── FoodLogForm.tsx            #   Food log form (placeholder)
    │
    ├── lib/                           # Backend logic and utilities
    │   ├── db.ts                      #   Database setup — creates tables, runs migrations
    │   ├── session.ts                 #   Reads user ID and profile ID from cookies
    │   ├── nutrition/
    │   │   ├── calculateNutrition.ts  #   Sums nutrients, compares to targets, generates analysis
    │   │   ├── energyExpenditure.ts   #   BMR, TDEE, and BMI calculations
    │   │   ├── thresholds.ts          #   Default and personalised nutrient targets
    │   │   └── foods.ts              #   Loads and searches the food database
    │   ├── validation/
    │   │   ├── profileValidation.ts   #   Profile input validation
    │   │   └── foodLogValidation.ts   #   Food log input validation
    │   └── mock-data/
    │       └── foods.ts              #   Mock food data for testing
    │
    ├── types/                         # TypeScript type definitions
    │   ├── profile.ts                 #   ProfileData, Gender, ActivityLevel, etc.
    │   ├── food.ts                    #   Food, FoodNutrients types
    │   └── nutrition.ts               #   NutritionTotals, NutrientComparison, etc.
    │
    ├── tests/                         # Automated tests
    │   ├── calculateNutrition.test.ts #   Tests for nutrition calculations
    │   ├── energyExpenditure.ts       #   Tests for BMR/TDEE/BMI calculations
    │   ├── foods.test.ts             #   Tests for food search
    │   └── validation.test.ts         #   Tests for input validation
    │
    ├── scripts/
    │   └── parse-foodfiles.mjs        # Converts raw NZ FOODfiles into foods.json
    │
    ├── data/                          # Data storage
    │   ├── nutrition.db               #   SQLite database (created automatically, not in git)
    │   └── raw/                       #   Raw government food data
    │       ├── DATA.AP                #     Nutrient values for ~2700 foods
    │       └── NAME.FT                #     Food names and short names
    │
    └── public/                        # Static files served to the browser
        ├── foods.json                 #   Parsed food database (generated by parse-foods)
        ├── next.svg
        ├── vercel.svg
        ├── file.svg
        ├── window.svg
        └── globe.svg
```
