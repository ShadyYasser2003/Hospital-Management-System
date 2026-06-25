# DEPLOYMENT REQUIREMENTS — HMS

**Phase:** 1 (analysis only). Consolidated runtime/build/config requirements.

---

## Runtime Requirements

| Component | Requirement |
|-----------|-------------|
| Backend runtime | JRE 17 |
| Backend port | 8080 |
| Frontend runtime | Static web server (Nginx) |
| Frontend port | 80 (container) / 5173 (dev) |
| Database | MySQL 8 (external in prod → RDS) |
| Database port | 3306 |
| File storage | `uploads/reports/` today → **S3 in cloud** |

## Build Requirements

| Component | Build tooling | Command | Artifact |
|-----------|---------------|---------|----------|
| Backend | JDK 17 + Maven | `mvn clean package -DskipTests` | `target/*.jar` |
| Frontend | Node LTS + npm | `npm ci && npm run build` | `dist/` |

## Required Environment Variables (target state)

### Backend
| Variable | Type | Replaces |
|----------|------|----------|
| `SPRING_PROFILES_ACTIVE` | Required | (new) profile selection |
| `SPRING_DATASOURCE_URL` | Required | hardcoded JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Sensitive | hardcoded `root` |
| `SPRING_DATASOURCE_PASSWORD` | Sensitive | hardcoded `root` |
| `JWT_SECRET` | Sensitive | inline `jwt.secret` |
| `JWT_ACCESS_TOKEN_EXPIRATION` | Optional | tunable |
| `JWT_REFRESH_TOKEN_EXPIRATION` | Optional | tunable |
| `CORS_ALLOWED_ORIGINS` | Required (prod) | hardcoded `localhost:*` |
| `UPLOAD_DIR` / `S3_BUCKET` | Required (cloud) | local `uploads/` |

### Frontend
| Variable | Type | Notes |
|----------|------|-------|
| `VITE_API_BASE_URL` | Required | Build-time inlined; or runtime-config strategy |
| `VITE_CHATBOT_BASE_URL` | Optional | Empty disables external chatbot |

> Sensitive → AWS Secrets Manager. Non-sensitive → ConfigMap / SSM Parameter Store.

## Networking / Routing

- Reverse proxy (Nginx/Ingress) routes `/` → frontend, `/api` → backend.
- Prefer same-origin routing in prod to avoid CORS entirely.
- TLS termination at ALB/CloudFront via ACM.

## Storage

- **Lab report uploads** must move to S3 (durability + statelessness).
- **Static frontend** → S3 + CloudFront (optional but recommended).
- No persistent volume needed once uploads are on S3.

## Data / Schema

- Replace `ddl-auto: update` with versioned migrations (Flyway/Liquibase).
- Resolve orphaned `schema-patch.sql` (wire in or remove).
- Provision RDS MySQL; supply connection via env/secret.

## Health & Observability

- Liveness/Readiness: backend `/actuator/health`, frontend `/`.
- Ship logs to CloudWatch; disable `show-sql`/DEBUG in prod.
- Expose metrics (Micrometer/Actuator) for Prometheus/Grafana.

## Pre-Deployment Checklist (blockers marked 🔴)

- [ ] 🔴 Externalize DB credentials & JWT secret
- [ ] 🔴 Add `prod` profile; disable DEBUG/show-sql
- [ ] 🔴 Migrate uploads to S3 (enables horizontal scaling)
- [ ] 🔴 Introduce DB migrations; retire `ddl-auto: update`
- [ ] 🟠 Configure real CORS origins
- [ ] 🟠 Protect `/uploads/**` (PHI)
- [ ] 🟠 Remove `target/` from VCS; standardize FE lockfile
- [ ] 🟡 Pin Node version (`engines`); parameterize FE API URL
