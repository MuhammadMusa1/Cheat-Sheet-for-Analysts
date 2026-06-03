# Backend — Cheat Sheet for Analysts

Express API backed by SQLite (via Node's built-in `node:sqlite`, no native compilation needed).

## Requirements

- Node.js **22.5+** (uses the built-in `node:sqlite` module)

## Setup

```bash
cd backend
npm install
npm run seed     # load frontend/data/cheatsheets.json into SQLite
npm start        # http://localhost:3000
```

On first boot the server auto-seeds if the database is empty, so `npm run seed`
is only needed when you want to force a reset.

## Scripts

| Command         | Description                                  |
|-----------------|----------------------------------------------|
| `npm start`     | Start the server (port 3000, or `$PORT`)     |
| `npm run dev`   | Start with `node --watch` (auto-reload)      |
| `npm run seed`  | Wipe and reseed the DB from the JSON file    |
| `npm test`      | Run the Jest test suite (in-memory DB)       |

## API

| Method | Path                      | Description                       |
|--------|---------------------------|-----------------------------------|
| GET    | `/api/health`             | Service status + record count     |
| GET    | `/api/cheatsheets`        | List all cheatsheets              |
| GET    | `/api/cheatsheets/:slug`  | Get one by slug                   |
| POST   | `/api/cheatsheets`        | Create (validates body)           |
| PUT    | `/api/cheatsheets/:slug`  | Update (partial fields allowed)   |
| DELETE | `/api/cheatsheets/:slug`  | Delete                            |
| GET    | `/api/search?q=term`      | Search across all fields          |

### Status codes

- `400` — validation failed (response includes an `errors` array)
- `404` — cheatsheet not found
- `409` — slug already exists (on create)
- `500` — unexpected server error

### Example: create

```bash
curl -X POST http://localhost:3000/api/cheatsheets \
  -H 'Content-Type: application/json' \
  -d '{
    "slug": "my-sheet",
    "title": "My Sheet",
    "subtitle": "Description",
    "level": "X",
    "accent": "#2563eb",
    "tags": ["one", "two"],
    "sections": [{ "title": "Section", "items": ["point a", "point b"] }]
  }'
```

## Structure

```text
backend/
├── server.js              entry point (boot + seed + listen)
├── app.js                 express app factory (importable for tests)
├── db/
│   ├── db.js              SQLite connection + data access layer
│   └── sqlite.db          database file (created on first run)
├── models/
│   └── Cheatsheet.js      model: normalisation, validation, search match
├── routes/
│   └── cheatsheets.js     CRUD router
├── seed/
│   └── seed.js            loads cheatsheets.json into the DB
└── tests/
    ├── setup.js           forces in-memory DB for tests
    ├── model.test.js      unit tests
    └── api.test.js        integration tests (supertest)
```

## Notes

- The DB path can be overridden with the `CHEATSHEET_DB` env var
  (tests set it to `:memory:`).
- `node:sqlite` prints an experimental-feature warning; suppress with
  `NODE_NO_WARNINGS=1` if desired.
