# DevOps Lab – Student Project (Node.js + Jira/GitHub + CI/CD)

![CI](https://github.com/johndoe47284/devops-lab-nodejs/actions/workflows/ci.yml/badge.svg)

This repository is a **teaching template** for a 4-student DevOps mini-project.
It demonstrates a realistic workflow: **PLAN (Jira) → CODE (Git/VS Code) → BUILD/TEST (GitHub Actions) → REVIEW (PRs) → DEPLOY (optional)**.

> **What you get here**
> - Minimal **Express** API with auto-mounted routes
> - **Vitest + Supertest** for integration & unit tests
> - Coverage thresholds enforced in CI
> - **GitHub Actions** workflow for lint + tests + coverage artifact
> - Clear file layout for a team of 4

---

## Quickstart

```bash
npm ci
npm run dev          # http://localhost:3000
npm test -- --coverage
```

Open `coverage/index.html` for a visual coverage report (locally).

---

## Routes

- `GET /` – basic JSON greeting
- `GET /health` – health check (200 OK)
- `GET /version` – returns `{ version }` from `package.json`
- `GET /info` – returns `{ name, version, node, uptime }`
- `GET /boom` – triggers an error to test the global error handler

Routes are **auto-mounted** from `src/routes/auto/*.route.js` so each student can add a file without touching `src/app.js` (fewer merge conflicts).

### TaskFlow REST API (lab 5)

Routers in `src/routes/*.route.js`, registered in `src/app.js` under their `/api` prefix.
Data is kept in memory (`src/data/store.js`) until the database layer is added.

| Jira | Method & path | Description |
|---|---|---|
| DEVOPS-11 | `GET /api/projects` | List projects |
| DEVOPS-11 | `GET /api/projects/:id` | One project (404 if unknown) |
| DEVOPS-11 | `POST /api/projects` | Create `{ name, description? }` → 201, 409 if the name is taken |
| DEVOPS-12 | `GET /api/projects/:projectId/tasks?status=&assignee=&q=` | List, filter and search the tasks of a project |
| DEVOPS-12 | `POST /api/projects/:projectId/tasks` | Create `{ title, description?, status?, assignee?, dueDate? }` |
| DEVOPS-13 | `GET /api/tasks/:id` | One task |
| DEVOPS-13 | `PATCH /api/tasks/:id` | Update title, description, status (`todo`, `in_progress`, `done`), assignee, dueDate |
| DEVOPS-13 | `DELETE /api/tasks/:id` | Delete a task and its comments → 204 |
| DEVOPS-14 | `GET /api/tasks/:taskId/comments` | Comments of a task, oldest first |
| DEVOPS-14 | `POST /api/tasks/:taskId/comments` | Add `{ author, content }` |
| DEVOPS-15 | `GET /api/dashboard?projectId=` | Task counts by status, overdue tasks, completion rate |

Errors always use the shape `{ "error": true, "message": "..." }` with 400 (invalid input), 404 (unknown id) or 409 (conflict).

### Postman

`postman/TaskFlow API Postman Collection.json` (v2.1) holds one request per route with test assertions.
Start the server (`npm run dev`), import the file in Postman and run the whole collection in order:
later requests reuse the `projectId` and `taskId` created earlier. From the command line:

```bash
npx newman run "postman/TaskFlow API Postman Collection.json"
```

### JavaScript practice (lab 5, part 2)

- `node js-practice.js`: exercises 2.1–2.4, 2.6 and 2.7 adapted to TaskFlow
- `node main.js`: exercise 2.5 (modules), imports `taskflowData.js`

---

## Tests

- **Integration tests** (Supertest) target HTTP endpoints in `test/*.test.js`.
- **Unit tests** target internal logic in `test/unit/*.test.js`.

Coverage thresholds (Lines/Functions/Statements ≥ 80%, Branches ≥ 70%) are set in `vitest.config.js`
(Vitest ignores a `"vitest"` key in `package.json`, so they must live in the config file to be enforced).  
If coverage drops below thresholds, CI fails and blocks the merge (quality gate).

---

## Branch & Commit Convention (Jira-friendly)

- Branch: `feature/<ISSUE-KEY>-<short-desc>` → e.g., `feature/SHMS-12-info-endpoint`
- Commit: `feat(<ISSUE-KEY>): <what>` → e.g., `feat(SHMS-12): implement /info endpoint`
- PR title: `<ISSUE-KEY> | <title>` → e.g., `SHMS-12 | Add /info endpoint`

If you install **GitHub for Jira**, issues will link automatically when the key appears in branch/commit/PR.

---

## CI (GitHub Actions)

A workflow is included at `.github/workflows/ci.yml` that runs on pushes and PRs to `main`:

- Install Node and deps
- `npm run lint`
- `npm test -- --coverage`
- Upload `coverage/` as an artifact

> Badge (enable after first run):
>
> ```md
> ![CI](https://github.com/<org>/<repo>/actions/workflows/ci.yml/badge.svg)
> ```

---

## Project layout

```
src/
  app.js          # Express app (auto-mount + global error handler)
  index.js        # server entry (not used by tests)
  routes/auto/    # students add *.route.js files here
  routes/*.route.js # TaskFlow /api routers (lab 5)
  data/store.js   # in-memory data shared by the /api routes
  utils/          # small testable helpers
postman/          # Postman collection (lab 5)
test/
  *.test.js       # integration (HTTP) tests
  unit/*.test.js  # pure unit tests
```

---

## Useful scripts

- `npm run dev` – start dev server with nodemon
- `npm test` – run all tests (Vitest)
- `npm test -- --coverage` (or `npm run coverage`) – with coverage
- `npm run lint` – ESLint check

Enjoy the lab!
