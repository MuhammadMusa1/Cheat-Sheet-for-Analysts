# Cheat Sheet for Analysts

A small, working reference site for business analysts, system analysts, and product owners. The project can be opened as a static frontend or run with a lightweight Express backend that exposes the same cheatsheets through an API.

## Project Structure

```text
cheat-sheet-for-analysts/
|-- backend/
|   |-- db/
|   |   `-- db.js
|   |-- models/
|   |   `-- Cheatsheet.js
|   |-- routes/
|   |   `-- app.js
|   `-- package.json
|-- frontend/
|   |-- css/
|   |   |-- cheatsheet.css
|   |   `-- style.css
|   |-- data/
|   |   `-- cheatsheets.json
|   |-- img/
|   |   `-- README.md
|   |-- js/
|   |   |-- search.js
|   |   `-- theme.js
|   `-- pages/
|       |-- biznes-analiz.html
|       |-- sistemny-analiz.html
|       |-- product-owner.html
|       |-- cheatsheet.html
|       `-- index.html
|-- index.html
|-- .gitignore
`-- README.md
```

## Run as a Static Site

Open `index.html` in the repository root, or serve the project with any static server. For GitHub Pages, use the repository root as the Pages source.

## Run with Backend API

```bash
cd backend
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

API endpoints:

```text
GET /api/cheatsheets
GET /api/cheatsheets/:slug
GET /api/search?q=term
```

## What Is Included

- Search across cheatsheet titles, tags, sections, and items.
- Dark/light theme toggle saved in local storage.
- Dedicated pages for business analysis, system analysis, and product owner topics.
- Responsive layout for desktop and mobile screens.
