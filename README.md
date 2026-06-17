## Figma design
https://www.figma.com/proto/V04QhCvXvDZz7aP9gYCOJp/Prototype-SWE-A1--Frontend-Wireframe-Diagram-?node-id=0-1&t=34uMyQwJYsx9egKD-1

# Dependencies:
- next
- react
- react-dom

## devDependencies
- @biomejs/biome
- @types/node
- @types/react
- @types/react-dom
- babel-plugin-react-compiler
- typescript

# API

## The data files
The NZ FOODfiles are a govt-maintained food composition db with ~2700 NZ foods. Each food has up to 86 nutrients measured per 100g. The raw files (DATA.AP, NAME.FT) are tilde-delimited text files, basically CSVs but with ~ as the separator instead of a comma.

## The parse script (run once)
scripts/parse-foodfiles.mjs is a Node.js script you run once manually. It reads both .FT files, matches the column headers to the 7 nutrients you want (kcal, kJ, protein, carbs, fat, sugar, sodium, fibre), then writes a clean public/foods.json file. That JSON is a flat array of 2767 food objects, each with an id, name, short name, food chapter (e.g. "M" for meats), and a nutrients object. You only rerun this script if the source data changes.

## The API route
app/api/foods/search/route.ts is a Next.js API route, so it runs server-side. When hit at /api/foods/search?q=chicken, it reads foods.json from disk into memory and caches it for the lifetime of the server process so it only reads the file once. It then filters the array by splitting your search query into terms and checking all terms appear in the food name. It returns up to 30 matches as JSON.

## The frontend
app/food-log/page.tsx is a client component. As you type in the search box it waits 350ms (debounce) before firing a fetch to the API route above. That delay stops it hammering the API on every keystroke. The results come back and render as buttons. When you click a food, the nutrient panel updates instantly using the data already returned, scaling all values from per-100g to whatever portion size you enter. No second API call needed for that.

## The not-found flow
If the API returns 0 results it shows a message pointing the user to the custom food form at the bottom of the page, where they can manually enter nutrients for anything missing from the db.
