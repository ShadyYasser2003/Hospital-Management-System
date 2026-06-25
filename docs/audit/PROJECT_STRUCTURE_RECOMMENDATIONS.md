# PROJECT STRUCTURE RECOMMENDATIONS — HMS

**Phase:** 1 (analysis only). Recommendations are advisory — **no files were moved or deleted.**

---

## Current vs. Recommended

### Issue 1 — Triple-nested backend path
**Current:** `Back-End/Back-End/hospital-management-system-main/`
**Recommended:** flatten to `backend-app/` (or `services/backend/`).
**Why:** Redundant nesting complicates Docker build contexts, CI paths, and IDE imports.

### Issue 2 — Committed build artifacts
**Current:** `target/` is tracked (e.g. `target/classes/application.yml`).
**Recommended:** remove `target/` from version control; rely on `.gitignore`.
**Why:** Build output is regenerated; committing it bloats the repo, causes stale-config bugs, and **persists secrets in git history**.

### Issue 3 — Multiple frontend lockfiles
**Current:** `package-lock.json` + `bun.lock` + `bun.lockb`, plus a duplicate `package-lock.json` at `Front-End/`.
**Recommended:** keep a single package manager (npm) and one lockfile beside `package.json`.
**Why:** Conflicting lockfiles produce non-deterministic, non-reproducible builds.

### Issue 4 — Committed frontend `.env`
**Current:** `Front-End/HMS_Front/.env` is present.
**Recommended:** commit only `.env.example`; keep real `.env` untracked.
**Why:** Establishes the no-secrets-in-VCS convention before real keys exist.

### Issue 5 — Orphaned SQL file
**Current:** `src/main/resources/schema-patch.sql` is not loaded by anything.
**Recommended:** either adopt a migration tool (Flyway/Liquibase) and convert it, or remove it.
**Why:** Dead config misleads future engineers and diverges from actual schema behavior (`ddl-auto: update`).

### Issue 6 — Naming consistency
**Current:** mixed-case folders (`Back-End`, `Front-End`) and a non-ASCII filename.
**Recommended:** lowercase, hyphenated, ASCII names (`backend-app/`, `frontend-app/`, `CLIENT_OVERVIEW_AR.md`).
**Why:** Cross-platform tooling and CI portability.

---

## Recommended target layout (illustrative)

```
HMS_last_v/
├── backend-app/          # (was Back-End/Back-End/hospital-management-system-main)
├── frontend-app/         # (was Front-End/HMS_Front)
├── backend/              # container build (Dockerfile, .dockerignore)
├── frontend/             # container build + nginx
├── docker/               # compose + env templates
├── infrastructure/       # terraform / kubernetes / helm / ansible (scaffold)
├── monitoring/           # prometheus / grafana / loki (scaffold)
├── scripts/              # build/deploy/start/stop (placeholders)
├── docs/                 # docs + audit + deployment
│   └── audit/            # ← this report set
├── .github/workflows/    # CI/CD (empty placeholder)
├── .editorconfig  .gitignore  README.md
```

---

## What is already good ✅
- Enterprise DevOps scaffolding (`backend/`, `frontend/`, `docker/`, `infrastructure/`, `monitoring/`, `scripts/`, `docs/`) is present and well-documented.
- Root `.gitignore` and `.editorconfig` exist.
- Compose split into dev (with MySQL) and prod (external DB) follows best practice.
- Nginx config avoids hardcoded backend URLs.

---

## Priority of structural cleanup
| Priority | Item |
|----------|------|
| 🔴 High | Remove `target/` from VCS (secret exposure) |
| 🔴 High | Stop committing real `.env` |
| 🟠 Medium | Consolidate frontend lockfiles / package manager |
| 🟠 Medium | Resolve orphaned `schema-patch.sql` |
| 🟡 Low | Flatten backend nesting |
| 🟡 Low | Naming consistency |

> All changes above are **recommendations**. Per Phase-1 rules, nothing was modified, moved, or removed.
