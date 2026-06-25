# PROJECT AUDIT — Hospital Management System (HMS)

**Phase:** 1 — Enterprise Project Audit & DevOps Readiness Assessment
**Type:** Analysis only (no code changed, nothing built or deployed)
**Audited stack:** Spring Boot (Java 17) backend · React + Vite frontend · MySQL 8

---

## 1. Repository Structure Audit

### Current layout (relevant parts)
```
HMS_last_v/
├── Back-End/Back-End/hospital-management-system-main/   # Spring Boot app
├── Front-End/HMS_Front/                                 # React + Vite app
├── backend/ frontend/ docker/ infrastructure/ monitoring/ scripts/ docs/
├── .github/workflows/  .editorconfig  .gitignore  README.md
├── start.sh  stop.sh  وصف-النظام-للعميل.md
└── .run/ (runtime logs & pids)
```

### Findings
| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| 1 | **Triple-nested backend path** `Back-End/Back-End/hospital-management-system-main` | Medium | Flatten to a single `backend-app/` (or `services/backend/`) source root. Awkward paths complicate Docker build contexts and CI. |
| 2 | **Build artifacts committed** — `target/classes/application.yml` is present in the repo | High | `target/` must be git-ignored and removed from tracking. Committed build output causes stale-config confusion and bloats the repo. |
| 3 | **Multiple frontend lockfiles** — `package-lock.json`, `bun.lock`, and `bun.lockb` all present | Medium | Pick one package manager (npm is already used by scripts). Remove the others to guarantee deterministic builds. |
| 4 | **Duplicate `package-lock.json`** — one at `Front-End/` and one at `Front-End/HMS_Front/` | Low | Keep only the one next to the app's `package.json`. |
| 5 | **Frontend `.env` committed** with a real (dev) value | Medium | Commit only `.env.example`; keep real `.env` out of version control. |
| 6 | **Mixed-language/encoded filename** `وصف-النظام-للعميل.md` | Low | Acceptable, but consider an ASCII filename (e.g. `CLIENT_OVERVIEW_AR.md`) for tooling/CI portability. |
| 7 | **Orphaned SQL file** — `src/main/resources/schema-patch.sql` is not referenced anywhere (no `spring.sql.init`, no loader) | Medium | Either wire it into a proper migration tool or remove it. Dead config is a maintenance trap. |
| 8 | DevOps scaffolding folders present and well-structured | ✅ Good | `backend/`, `frontend/`, `docker/`, `infrastructure/`, `monitoring/`, `scripts/`, `docs/` follow enterprise conventions. |

### Verdict
Structure is **acceptable for a student/graduation project** and now has a solid DevOps scaffold, but has **enterprise hygiene issues** (committed artifacts, multiple lockfiles, deep nesting, committed `.env`). None are deployment blockers, but they should be cleaned before CI/CD.

---

## 2. Frontend Audit

| Aspect | Observed | Notes |
|--------|----------|-------|
| Framework | React 18.3 + TypeScript 5.8 | Modern, supported |
| Build tool | Vite 5.4 | Output dir: `dist/` |
| Package manager | npm (`package-lock.json`) — but bun lockfiles also present | ⚠️ Ambiguous; standardize |
| Node version | Not pinned (no `engines` field / `.nvmrc`) | ⚠️ Add `engines.node` (LTS 20.x) for reproducible builds |
| Build command | `npm run build` → `vite build` | ✅ |
| Dev server port | `5173` (vite.config.ts) | Fixed earlier from 8080 to avoid backend clash |
| API base URL | `VITE_API_BASE_URL`, defaults to `http://localhost:8080` | ⚠️ Hardcoded dev default in code/`.env` |
| Chatbot proxy | Hardcoded IP `54.163.18.81:8000` in `vite.config.ts` dev proxy | ⚠️ External dependency; only used in dev proxy |
| Routing | react-router (BrowserRouter), 50+ routes | Needs Nginx SPA fallback (`try_files … /index.html`) — already prepared |
| Static assets | Vite content-hashed bundle | Cache-friendly; long-cache headers prepared in Nginx config |

### Potential deployment issues
- API base URL must be injected at **build time** (Vite inlines `VITE_*` vars). A runtime-config strategy (e.g. `/config.js` or Nginx env substitution) is needed if one image must serve multiple environments.
- No `engines` pin → CI could build with an unexpected Node version.
- Multiple lockfiles → non-deterministic installs.

---

## 3. Backend Audit

| Aspect | Observed | Notes |
|--------|----------|-------|
| Language/runtime | Java 17 | ✅ LTS |
| Framework | Spring Boot **4.0.2** (parent) | Very new major; verify library/EKS base-image compatibility |
| Build | Maven (`spring-boot-maven-plugin`) → executable jar | Artifact: `target/hospital-management-system-0.0.1-SNAPSHOT.jar` |
| Profiles | **None defined** (no `application-{profile}.yml`) | ⚠️ No `dev`/`prod` separation |
| Actuator | `spring-boot-starter-actuator` present; `/actuator/**` permitted | ✅ Health endpoint available at `/actuator/health` |
| Health endpoint | `/actuator/health` (used by prepared Docker HEALTHCHECK) | ✅ |
| Logging | Default Spring logging; `root: INFO`, `com.hospital.hms: DEBUG`, `show-sql: true` | ⚠️ DEBUG + SQL logging not suitable for production |
| Config | Single `application.yml` with **hardcoded** DB creds + JWT secret | 🔴 Critical for cloud |
| Env variables | Not externalized — values inline in YAML | 🔴 Must externalize |
| Startup logic | `DataSeeder` (seeds admin/superadmin), `DatabaseMigrationRunner` (raw SQL) | ⚠️ Seeds hardcoded passwords; runs on every boot |
| CORS | Allows `http://localhost:*` only | ⚠️ Will block real domains until updated |

### Production readiness
**Not production-ready as-is.** Blockers: hardcoded secrets, no profiles, DEBUG/SQL logging on, `ddl-auto: update`, CORS limited to localhost. All are configuration-level (no code redesign required).

---

## 4. Database Audit

| Aspect | Observed | Notes |
|--------|----------|-------|
| Engine | MySQL 8 (`mysql-connector-j`) | ✅ RDS-compatible |
| Connection | `jdbc:mysql://localhost:3306/hms_backend`, `root/root` | 🔴 Hardcoded host + credentials |
| Schema management | Hibernate `ddl-auto: update` | 🔴 Unsafe for production; no controlled migrations |
| Migrations | **No Flyway/Liquibase** | 🔴 No versioned schema history |
| Init scripts | `schema-patch.sql` present but **orphaned** (not loaded); `DatabaseMigrationRunner` runs ad-hoc `UPDATE` on boot | ⚠️ Fragile, non-idempotent migration strategy |
| External DB compat | Connector + JDBC URL are standard | ✅ Works with RDS once host/creds externalized |

### Blocking cloud concerns
1. `ddl-auto: update` lets Hibernate mutate schema implicitly → unpredictable on shared/managed DB.
2. No migration tool → cannot reliably version or roll back schema on RDS.
3. Hardcoded localhost connection → must come from env/secret.

---

## 5. Environment Variables Audit

> No secret **values** are reproduced below.

### Currently used
| Variable | Where | Classification | Notes |
|----------|-------|----------------|-------|
| `VITE_API_BASE_URL` | Frontend (`.env`) | Required | Build-time inlined |
| `VITE_CHATBOT_BASE_URL` | Frontend (`.env`) | Optional | Empty by default |
| `jwt.secret` | Backend `application.yml` (inline) | **Sensitive** | Should be env/secret |
| `jwt.access-token-expiration` | Backend yaml | Optional | Tunable |
| `jwt.refresh-token-expiration` | Backend yaml | Optional | Tunable |
| `spring.datasource.url` | Backend yaml (inline) | Required | Should be env |
| `spring.datasource.username` | Backend yaml (inline) | **Sensitive** | Should be env/secret |
| `spring.datasource.password` | Backend yaml (inline) | **Sensitive** | Should be env/secret |

### Not yet externalized but should exist
`SPRING_PROFILES_ACTIVE`, `SPRING_DATASOURCE_*`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, `UPLOAD_DIR` / future `S3_BUCKET`.

### Recommended for AWS Secrets Manager (later phase)
- `JWT_SECRET`
- `spring.datasource.username` / `password`
- Any future third-party API keys

Non-sensitive tunables (ports, expirations, base URLs) → ConfigMap / SSM Parameter Store.

---

## 6. Build Process Audit

| Item | Frontend | Backend |
|------|----------|---------|
| Build command | `npm ci && npm run build` | `mvn clean package -DskipTests` |
| Production artifact | `dist/` (static bundle) | `target/*.jar` (executable Spring Boot jar) |
| Output dir | `dist/` | `target/` |
| Key dependencies | React, Vite, Radix UI, TanStack Query, Axios | Spring Boot, Spring Security, Spring Data JPA, JWT (jjwt), springdoc |
| Runtime requirement | Static web server (Nginx) | JRE 17 + reachable MySQL |

---

## 7. Networking Audit

| Concern | Value | Notes |
|---------|-------|-------|
| Frontend port | `5173` dev / `80` in Nginx image | |
| Backend port | `8080` | Spring Boot default |
| Database port | `3306` | MySQL |
| CORS | `http://localhost:*` only | ⚠️ Must add real origins; uses `allowCredentials=true` |
| Reverse proxy | Needed to route `/api` → backend | Nginx placeholder prepared (commented, not hardcoded) |
| API routing | Frontend calls `VITE_API_BASE_URL` directly today | In prod, route via Nginx/Ingress same-origin to avoid CORS |

---

## 8. Storage Audit

| Type | Location | S3 candidate? |
|------|----------|---------------|
| Uploaded files (lab reports) | Local FS `uploads/reports/` (`TestRequestServiceImpl`) | ✅ **Yes** — strong S3 candidate |
| Served uploads | `/uploads/**` → `file:uploads/` (FileUploadConfig) | Needs S3 + CloudFront or presigned URLs |
| Static frontend assets | `dist/` served by Nginx | ✅ S3 + CloudFront candidate |
| Temp/multipart | Servlet multipart (max 20MB) | Ephemeral; fine |

**Key risk:** local-filesystem uploads are **not durable** and break horizontal scaling (each pod has its own disk). Must migrate to S3 before multi-replica deployment.

---

## 9. Security Audit (summary — full detail in SECURITY_AUDIT.md)

- 🔴 **Hardcoded JWT secret** in `application.yml`.
- 🔴 **Hardcoded DB credentials** (`root/root`).
- 🔴 **Seeded admin passwords** hardcoded in `DataSeeder` (`admin123`, `SuperAdmin@123`).
- 🟠 CORS restricted to localhost (functional blocker, not a leak).
- 🟠 Broad authorization on some GET endpoints (e.g. any authenticated user can `GET /api/patients`).
- ✅ Passwords hashed with BCrypt.
- ✅ Stateless JWT, refresh-token rotation, CSRF disabled appropriately for stateless API.

---

## 15. Final Readiness Score

| Category | Score /100 | Rationale |
|----------|-----------:|-----------|
| Repository Structure | 70 | Good scaffold; committed artifacts, multiple lockfiles, deep nesting |
| Frontend | 75 | Modern & buildable; env injection & Node pin needed |
| Backend | 65 | Solid app; config/secrets/profiles not production-ready |
| Database | 50 | No migrations, `ddl-auto: update`, hardcoded connection |
| Security | 45 | Good hashing/JWT, but hardcoded secrets & seeded creds |
| Cloud Readiness | 55 | 12-factor gaps; local FS storage |
| DevOps Readiness | 70 | Strong Docker/Nginx foundation already prepared |
| Production Readiness | 50 | Multiple config blockers remain |
| **Overall** | **60 / 100** | **Functionally complete, needs config hardening before cloud** |

---

## Prioritized Action Plan → Phase 2 (Docker & Containerization)

1. **Externalize all config** (DB URL/creds, JWT secret, CORS origins) via env vars — prerequisite for any container.
2. **Add Spring profiles** (`dev`, `prod`); turn off `show-sql` and DEBUG in prod.
3. **Stop committing `target/`**; remove from tracking and rely on `.gitignore`.
4. **Standardize the frontend package manager** (npm); delete bun lockfiles; pin Node via `engines`.
5. **Decide schema strategy** — introduce Flyway/Liquibase, retire `ddl-auto: update` and the orphaned `schema-patch.sql`.
6. **Plan S3 migration** for `uploads/` before enabling multiple replicas.
7. **Parameterize frontend API base URL** for build-time/runtime injection.
8. Then proceed to building images from the already-prepared Dockerfiles.

> Items 1–7 are configuration/hygiene and require **no application redesign**.
