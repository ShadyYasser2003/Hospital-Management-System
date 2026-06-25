# CLOUD READINESS REPORT — HMS (AWS Target)

**Phase:** 1 (analysis only)

---

## 12-Factor Assessment

| Factor | Status | Notes |
|--------|--------|-------|
| Codebase | 🟢 | Single repo |
| Dependencies | 🟡 | Declared (Maven/npm); multiple FE lockfiles |
| **Config** | 🔴 | Hardcoded in `application.yml` — must externalize |
| Backing services | 🟡 | MySQL swappable to RDS once config externalized |
| Build/release/run | 🟡 | Build defined; no release versioning |
| Processes | 🔴 | **Stateful** local uploads break stateless model |
| Port binding | 🟢 | 8080 / 80 |
| Concurrency | 🔴 | Cannot scale horizontally until uploads → S3 |
| Disposability | 🟡 | Boot-time seeders/migrations add startup side-effects |
| Dev/prod parity | 🔴 | No profiles; localhost-only assumptions |
| Logs | 🟡 | Console logs OK for CloudWatch, but DEBUG/SQL on |
| Admin processes | 🟡 | Seeding/migration done in-app at boot |

---

## 12. AWS Services Required

| Service | Required | Why |
|---------|----------|-----|
| **VPC** | Yes | Network isolation for EKS, RDS, subnets, security groups |
| **EKS** | Yes | Target Kubernetes runtime for both services |
| **ECR** | Yes | Private registry for backend/frontend images |
| **RDS (MySQL)** | Yes | Managed external database (replaces local MySQL); the app's `ddl-auto` and missing migrations must be fixed first |
| **S3** | Yes | Durable storage for lab-report uploads + static frontend hosting |
| **CloudFront** | Yes | CDN for the SPA + cached static assets; HTTPS edge |
| **Route53** | Yes | DNS for app domains |
| **ACM** | Yes | TLS certificates for CloudFront/ALB |
| **IAM** | Yes | Roles for EKS nodes, IRSA for S3/Secrets access, CI OIDC |
| **Secrets Manager** | Yes | `JWT_SECRET`, DB credentials |
| **SSM Parameter Store** | Optional | Non-sensitive config (ports, CORS, expirations) |
| **CloudWatch** | Yes | Logs/metrics/alarms; container insights |
| **WAF** | Recommended | Protect public ALB/CloudFront (healthcare data) |
| **ALB / Ingress Controller** | Yes | L7 routing `/` and `/api`, TLS termination |

---

## Cloud Blockers (must fix before AWS migration)

1. 🔴 **Config externalization** — DB/JWT/CORS hardcoded.
2. 🔴 **Stateful uploads** — local FS must move to S3 for stateless, scalable pods.
3. 🔴 **Schema management** — `ddl-auto: update` + no migration tool is unsafe on RDS.
4. 🟠 **CORS** — localhost-only origins block real domains.
5. 🟠 **Logging** — disable `show-sql`/DEBUG in prod profile (cost + noise in CloudWatch).
6. 🟠 **Boot-time seeding** — hardcoded admin creds seeded on every start; gate behind profile.

---

## Cloud Readiness Score

| Dimension | Score /100 |
|-----------|-----------:|
| Config externalization | 35 |
| Statelessness | 40 |
| Data layer (RDS-ready) | 55 |
| Observability hooks | 65 (Actuator present) |
| Network/routing | 60 |
| **Overall Cloud Readiness** | **55 / 100** |

**Conclusion:** The application is a good migration candidate — the gaps are configuration and storage concerns, **not architectural rewrites**. Addressing config externalization, S3 uploads, and migrations raises cloud readiness substantially without touching business logic.
