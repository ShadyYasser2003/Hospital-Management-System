# SECURITY AUDIT — HMS

**Phase:** 1 (analysis only) · No secret values are reproduced in this document.

---

## 9. Security Review

### Authentication & Authorization
| Item | Status | Notes |
|------|--------|-------|
| Password hashing | 🟢 Good | BCrypt (`BCryptPasswordEncoder`) |
| Session model | 🟢 Good | Stateless JWT; `SessionCreationPolicy.STATELESS` |
| Access token | 🟢 | 15-min expiry |
| Refresh token | 🟢 | 7-day expiry, stored, rotated, deleted on logout |
| CSRF | 🟢 Appropriate | Disabled (stateless API + Bearer tokens) |
| Role model | 🟢 | RBAC via `ROLE_*` authorities, method + URL security |
| Login binding | 🟢 | Username or national ID + password |

### Critical findings
| # | Finding | Severity | Recommendation |
|---|---------|----------|----------------|
| 1 | **JWT secret hardcoded** in `application.yml` (committed) | 🔴 Critical | Move to env var → AWS Secrets Manager; rotate the exposed value |
| 2 | **DB credentials hardcoded** (`root/root`) in `application.yml` | 🔴 Critical | Externalize; never run app as DB `root` |
| 3 | **Seeded admin passwords hardcoded** in `DataSeeder` (`admin123`, `SuperAdmin@123`) | 🔴 Critical | Gate seeding behind a non-prod profile; force first-login password reset |
| 4 | **Build artifact committed** (`target/classes/application.yml`) embeds the same secrets | 🔴 Critical | Remove `target/` from VCS; secrets in artifacts persist in git history |
| 5 | **Broad GET authorization** — any authenticated user can `GET /api/patients/**` | 🟠 Medium | Already noted in app phase: scope patient reads per role/ownership at API level |
| 6 | **CORS `allowCredentials=true`** with `localhost:*` | 🟠 Medium | Restrict to explicit prod origins; avoid wildcard + credentials together |
| 7 | **Uploads served openly** at `/uploads/**` (permitAll) | 🟠 Medium | Lab reports are PHI — require auth / presigned S3 URLs |
| 8 | **DEBUG + show-sql logging** | 🟡 Low | May log sensitive query data; disable in prod |
| 9 | Frontend `.env` committed | 🟡 Low | Only a dev URL today, but establish the no-`.env`-in-VCS rule |

### Secrets & sensitive files inventory
| Location | Contains | Action |
|----------|----------|--------|
| `application.yml` | JWT secret, DB creds | Externalize + rotate |
| `target/classes/application.yml` | Copy of the above | Remove from VCS |
| `DataSeeder.java` | Seeded admin passwords | Profile-gate; rotate |
| `Front-End/HMS_Front/.env` | API base URL | Move to `.env.example` only |

### Healthcare-specific note
Patient records and uploaded lab reports constitute **PHI**. For any real deployment, encryption at rest (RDS/S3 KMS), encryption in transit (TLS via ACM), authenticated file access, and audit logging are expected. WAF in front of public entry points is recommended.

---

## Security Score

| Dimension | Score /100 |
|-----------|-----------:|
| Auth design (JWT/RBAC/BCrypt) | 80 |
| Secret management | 20 |
| Data exposure controls | 50 |
| Transport security (current) | 40 (localhost/HTTP) |
| **Overall Security** | **45 / 100** |

### Top remediations (priority order)
1. Externalize + rotate JWT secret and DB credentials.
2. Remove committed build artifacts and scrub secrets from git history.
3. Profile-gate seeders; eliminate hardcoded admin passwords in prod.
4. Protect `/uploads/**` (PHI) and tighten patient read authorization.
5. Restrict CORS to real origins; enforce TLS end-to-end.
