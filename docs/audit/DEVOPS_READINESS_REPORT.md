# DEVOPS READINESS REPORT — HMS

**Phase:** 1 (analysis only) · **Scope:** Docker, Kubernetes, CI/CD readiness

---

## 10. Docker Readiness

> No Dockerfiles created in this phase. The repo already contains prepared
> Dockerfiles under `backend/` and `frontend/` from the scaffolding phase; the
> facts below describe what a container needs.

### Backend container
| Aspect | Value |
|--------|-------|
| Build dependencies | JDK 17, Maven, `pom.xml`, `src/` |
| Runtime dependencies | JRE 17, reachable MySQL |
| Build artifact | `target/hospital-management-system-0.0.1-SNAPSHOT.jar` |
| Exposed port | `8080` |
| Health endpoint | `GET /actuator/health` |
| Startup command | `java -jar app.jar` |
| Required volumes | `uploads/` (lab reports) — **ephemeral risk**, migrate to S3 |
| Config needs | DB URL/creds, JWT secret, profile, CORS — all via env |

### Frontend container
| Aspect | Value |
|--------|-------|
| Build dependencies | Node LTS, `package.json`, lockfile, `src/` |
| Build artifact | `dist/` static bundle |
| Runtime | Nginx serving static files |
| Exposed port | `80` |
| Health endpoint | `GET /` (SPA index) |
| Volumes | None (stateless) |
| Config needs | `VITE_API_BASE_URL` at build time; reverse-proxy target at runtime |

### Docker blockers
- Local-FS uploads (not container-friendly across replicas).
- Hardcoded config must move to env before images are environment-portable.

---

## 11. Kubernetes Readiness

> No manifests written. This is a requirements inventory.

| Resource | Required? | Notes |
|----------|-----------|-------|
| **Namespaces** | Yes | e.g. `hms-dev`, `hms-staging`, `hms-prod` |
| **Deployments** | 2 | `backend` (stateless once S3 used), `frontend` (stateless) |
| **Services** | 2 | ClusterIP for backend, ClusterIP for frontend |
| **Ingress** | 1 | Route `/` → frontend, `/api` → backend; TLS via ACM/cert-manager |
| **ConfigMaps** | Yes | Non-sensitive config (ports, CORS origins, profile, expirations) |
| **Secrets** | Yes | DB creds, `JWT_SECRET` (sourced from AWS Secrets Manager) |
| **PersistentVolumes** | Only if NOT using S3 | Preferred path: **eliminate PV** by moving uploads to S3 |
| **HPA (autoscaling)** | Possible | Backend scales on CPU/memory once stateless; frontend trivially scalable |
| **Readiness/Liveness probes** | Yes | Backend `/actuator/health`; frontend `/` |
| **Database** | External | RDS, not in-cluster |

### K8s blockers
- Backend is **not yet stateless** due to local uploads → blocks safe multi-replica + HPA.
- No externalized config → ConfigMap/Secret wiring impossible until Phase 2 config work done.

---

## 13. CI/CD Readiness

> `.github/workflows/` exists as an **empty placeholder** (no pipelines, by design).

Recommended pipeline stages (future):
| Stage | Frontend | Backend |
|-------|----------|---------|
| Test | `vitest run` (tests exist) | `mvn test` (JUnit/Mockito present) |
| Build | `npm ci && npm run build` | `mvn clean package` |
| Security scan | `npm audit` / SCA, image scan (Trivy) | OWASP dependency-check, image scan |
| Image build | Frontend Dockerfile | Backend Dockerfile |
| Registry | Push to **Amazon ECR** | Push to **Amazon ECR** |
| Deploy | Helm/ArgoCD → EKS | Helm/ArgoCD → EKS |

### CI/CD blockers
- Tests not yet verified to pass in clean CI environment.
- Secrets must exist in CI (GitHub OIDC → AWS) before image push/deploy.
- No image tagging/versioning strategy defined yet.

---

## DevOps readiness verdict

| Area | Status |
|------|--------|
| Docker foundation | 🟢 Prepared (Dockerfiles + compose + nginx scaffolded) |
| Container portability | 🟠 Blocked by hardcoded config + local FS uploads |
| Kubernetes | 🟠 Requirements clear; needs statelessness + config externalization |
| CI/CD | 🟡 Folder ready; pipelines not started (intentional) |

**Overall DevOps readiness: ~70/100** — strong scaffolding, blocked mainly by app-config externalization and storage statelessness, both addressed in Phase 2.
