# Frontend Pages and Components

## Page Architecture

Every page in the app follows the same pattern:

```
app/some-page/page.tsx          ← Server component (thin wrapper)
  └── components/SomeClient.tsx  ← Client component ("use client", all logic here)
       └── Uses useState, useEffect, fetch() to manage data
```

Some pages (food-log, nutritional-feedback, visualisation, education, patients, dashboard) put all their logic directly in `page.tsx` as a client component instead of using a separate component file.

## All Pages

### 1. Login/Signup (`/`)

**File:** `app/page.tsx`

The root route is the authentication page. It has two tabs — "Login" and "Sign Up" — toggled by a `mode` state variable.

**State:**
- `mode`: "login" or "signup"
- `username`, `password`: form inputs
- `error`: error message string
- `loading`: boolean for submit button

**Flow:**
- Login: POST to `/api/auth/login` → redirect to `/dashboard`
- Signup: POST to `/api/auth/signup` → redirect to `/dashboard`
- Errors display below the form

### 2. Dashboard (`/dashboard`)

**File:** `app/dashboard/page.tsx`

The main navigation hub after login. Displays a grid of 8 feature links with icons and descriptions:

| Link | Destination | Description |
|------|------------|-------------|
| Patient Management | `/patients` | View and manage patient profiles |
| Food Log | `/food-log` | Search and log food intake |
| Profile | `/profile` | Create/edit patient profile |
| Nutrition Summary | `/summary` | View daily nutrition vs RDI |
| Nutritional Feedback | `/nutritional-feedback` | Real-time nutrient feedback |
| Analysis | `/analysis` | Save analysis records |
| Visualisation | `/visualisation` | Weekly charts and trends |
| Education | `/education` | Learning resources |

Also shows the active patient profile name and includes the `ExportSection` component for data export.

### 3. Patients (`/patients`)

**File:** `app/patients/page.tsx`

Lists all patient profiles for the current user. Each patient card shows:
- Name, age, gender, weight, height, activity level
- "Active" badge if this is the currently selected profile
- Actions: Select (activate), Edit, Delete

**Key behaviours:**
- "New Patient" button → navigates to `/profile?new=true`
- "Edit" button → navigates to `/profile?edit={profileId}`
- "Select" button → calls POST `/api/profile/activate` to switch active profile
- "Delete" button → confirmation dialog, then DELETE `/api/profile?id={id}`

### 4. Profile (`/profile`)

**File:** `app/profile/page.tsx` → renders `components/ProfileForm.tsx`

A comprehensive form for creating or editing patient profiles. Uses URL query parameters to determine mode:
- `/profile?new=true` → empty form for new profile
- `/profile?edit=5` → loads profile #5 for editing
- `/profile` (no params) → loads active profile for editing

**Form sections:**
1. **Patient Information** — name, age, gender, ethnicity, measurement system, activity level, weight, height
2. **Health and Diet Details** — nutrition goal, dietary preference, restrictions, allergies, medical conditions, medications
3. **Fitness Assessment Results** — beep test level, VO2 max, resting heart rate, blood pressure

**Two-column layout:** Form on the left, a live preview card on the right that shows:
- Estimated energy needs (BMR, TDEE) calculated in real-time via `/api/energy-expenditure`
- BMI with category
- Activity multiplier and formula used
- Complete profile recap

**On submit:** POST to `/api/profile` → success message, sets active profile cookie

### 5. Food Log (`/food-log`)

**File:** `app/food-log/page.tsx`

The most complex page. Three main sections:

**Section 1: Food Search**
- Text input with 350ms debounce
- Calls `/api/foods/search?q=...&limit=30`
- Also fetches custom foods from `/api/custom-foods` and merges them into results
- Shows loading/idle/results/not-found/error states
- Each result is a clickable button showing food name and key nutrients

**Section 2: Log Form (appears when a food is selected)**
- Portion size input (number) with unit selector (g/mL/serving)
- Date picker and time picker
- Meal tag buttons: Breakfast, Lunch, Dinner, Snack
- Live nutrient display that updates as portion size changes
- Nutrients are scaled client-side: `displayValue = (nutrientPer100g / 100) × portionSize`
- Submit calls POST `/api/food-log` with pre-calculated nutrient values

**Section 3: Today's Log**
- Lists all food entries for the current date
- Each entry shows food name, amount, calories, and a delete button
- Delete calls DELETE `/api/food-log?id={id}`

**Section 4: Custom Food Form (bottom of page)**
- Manual entry form for foods not in the database
- Fields: name, and all 11 nutrient values
- Saves to `/api/custom-foods`

### 6. Nutrition Summary (`/summary`)

**File:** `app/summary/page.tsx` → renders `components/NutritionSummaryCard.tsx`

Displays a grid of nutrient comparison cards. Each card shows:
- Nutrient label and unit
- Current total intake
- Target value
- Percentage of target
- Progress bar (filled to percentage, capped at 100%)
- Status badge: "Low" (orange), "OK" (green), "High" (red)

Also shows a summary line: "X nutrients low, Y on target, Z high" and detailed feedback messages for each nutrient.

**Data flow:** Fetches active profile → POST to `/api/nutrition-summary` with today's date → receives analysis with comparisons → renders cards

### 7. Nutritional Feedback (`/nutritional-feedback`)

**File:** `app/nutritional-feedback/page.tsx`

Similar to the summary but focused on real-time feedback cards. Fetches today's food logs and the active profile, then calculates intake totals client-side for 6 key nutrients: calories, protein, carbs, fat, sugar, sodium.

Each card is colour-coded:
- Green: intake within target range
- Orange: intake below target
- Red: intake above target

### 8. Visualisation (`/visualisation`)

**File:** `app/visualisation/page.tsx`

The data visualisation page with interactive charts. Uses Chart.js via react-chartjs-2.

**Controls:**
- Week navigator: ← Previous Week / Next Week → buttons
- Day selector: 7 buttons (Mon–Sun) to drill into a specific day
- Test data controls: "Load Test Data" (POST `/api/seed`) and "Clear Test Data" (DELETE `/api/seed`)

**Charts displayed:**

| Chart | Type | Data Source |
|-------|------|-------------|
| Weekly Calories | Bar chart | Daily energy_kcal totals |
| Weekly Macros | Line chart | Daily protein, carbs, fat |
| Daily Macro Breakdown | Doughnut chart | Protein/carb/fat calories for selected day |
| Calories by Meal | Bar chart | Per-meal calorie breakdown for selected day |
| RDI Comparison | Horizontal bar chart | % of RDI target for each nutrient, with 100% reference line |

Clicking a bar in the weekly calorie chart selects that day and shows the daily detail section.

### 9. Analysis (`/analysis`)

**File:** `app/analysis/page.tsx` → renders `components/Analysis.tsx`

A form to save analysis records with two columns:
- **Left:** Form with analysis name, patient identifier, notes, and date fields
- **Right:** List of previously saved analyses

Submits to POST `/api/analyses`. Fetches existing records from GET `/api/analyses`.

### 10. Education (`/education`)

**File:** `app/education/page.tsx`

An educational content page with 4 tabs:

| Tab | Content |
|-----|---------|
| Nutrient Guide | Grid of 10 nutrient cards with descriptions and RDI info |
| Understanding RDIs | Educational text about RDI concepts, BMR, TDEE, BMI formulas |
| Quiz | 8 multiple-choice questions with instant feedback |
| Case Study | Practice scenario (Sarah the nursing student) with discussion prompts |

All content is hardcoded — no API calls. The quiz tracks score locally.

## Reusable Components

### `ProfileForm` (`components/ProfileForm.tsx`)

Large form component used by the `/profile` page. Manages 18+ form fields, makes API calls for energy calculations, and renders a live preview card.

### `NutritionSummaryCard` (`components/NutritionSummaryCard.tsx`)

Displays the RDI comparison grid. Fetches profile and nutrition summary data, renders colour-coded nutrient cards with progress bars.

### `Analysis` (`components/Analysis.tsx`)

Form + list component for saving and viewing analysis records.

### `ExportSection` (`components/ExportSection.tsx`)

Export/reporting widget embedded in the dashboard. Supports:
- **Preset date ranges:** Last 7/14/30 days, or custom range
- **Three export formats:**
  - CSV — raw food log entries + daily totals + RDI comparison
  - PDF Report — formatted tables with daily totals and nutrient vs RDI
  - PDF Assignment Summary — written analysis with overview and key findings

Uses jsPDF and jspdf-autotable for PDF generation, all client-side.

### `Navbar` and `FoodLogForm`

Placeholder components that are not fully implemented.

## State Management

There is **no global state management library**. All state is local to each page/component:

- `useState` for form data, UI toggles, fetched data, loading states
- `useEffect` for data fetching on mount
- No React Context (beyond what Next.js provides)
- No localStorage for app state (only server-side cookies for auth)
- Pages are independent — navigating away loses all local state
