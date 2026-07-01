# 🏥 Hospital Management System — Enterprise Cloud Platform

> A production-grade, fully automated Hospital Management System deployed on AWS using Kubernetes, Terraform, GitOps, and AI-powered medical assistance.

[![Live](https://img.shields.io/badge/Live-sofcore--hms.com-blue?style=for-the-badge)](https://sofcore-hms.com)
[![AWS](https://img.shields.io/badge/AWS-15%20Services-FF9900?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-EKS%20v1.30-326CE5?style=for-the-badge&logo=kubernetes)](https://kubernetes.io)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC?style=for-the-badge&logo=terraform)](https://terraform.io)
[![ArgoCD](https://img.shields.io/badge/GitOps-ArgoCD-EF7B4D?style=for-the-badge&logo=argo)](https://argoproj.github.io)

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [AWS Infrastructure](#aws-infrastructure)
- [Containerization & Kubernetes](#containerization--kubernetes)
- [CI/CD & GitOps Pipeline](#cicd--gitops-pipeline)
- [Observability & Monitoring](#observability--monitoring)
- [AI Medical Chatbot](#ai-medical-chatbot)
- [Security](#security)
- [Project Metrics](#project-metrics)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)

---

## 🏗️ Architecture Overview

```
                         ┌─────────────────────────────────────────────────────┐
                         │                      AWS Cloud                       │
                         │                                                     │
  Users ──► Cloudflare ──┼──► ALB (HTTPS/TLS) ──► EKS Cluster                 │
            (DNS/CDN/    │         │                    │                       │
             SSL/WAF)    │         │          ┌────────┴────────┐              │
                         │         │          │                 │              │
                         │         │     ┌────▼────┐      ┌────▼────┐         │
                         │         │     │Frontend │      │ Backend │         │
                         │         │     │(Nginx)  │      │(Spring) │         │
                         │         │     │ 3 pods  │      │ 3 pods  │         │
                         │         │     └─────────┘      └────┬────┘         │
                         │         │                           │              │
                         │         │                    ┌──────▼──────┐       │
                         │         │                    │  RDS MySQL  │       │
                         │         │                    │ (encrypted) │       │
                         │         │                    └─────────────┘       │
                         │         │                                          │
                         │    ┌────▼────────────────────────────────┐         │
                         │    │ Monitoring: Prometheus + Grafana +   │         │
                         │    │ Alertmanager + Loki + ArgoCD         │         │
                         │    └─────────────────────────────────────┘         │
                         │                                                     │
                         │    ┌──────────────────────────────────────┐         │
                         │    │ AI Chatbot: API GW → Lambda →        │         │
                         │    │ SageMaker (GPU ml.g4dn.xlarge)       │         │
                         │    └──────────────────────────────────────┘         │
                         └─────────────────────────────────────────────────────┘
```

---

## ☁️ AWS Infrastructure

All infrastructure provisioned and managed via **Terraform** (10 modular modules).

| Service | Purpose | Configuration |
|---------|---------|---------------|
| **VPC** | Network isolation | 10.0.0.0/16, 9 subnets, 3 AZs |
| **EKS** | Container orchestration | v1.30, managed node group (t3.medium) |
| **RDS** | Managed MySQL database | Encrypted, automated backups |
| **S3** | Object storage | Uploads + backups, KMS encrypted, versioned |
| **ECR** | Container registry | 3 repos (backend, frontend, chatbot), scan-on-push |
| **ALB** | Load balancing | HTTPS with ACM certificate, health checks |
| **SageMaker** | AI model hosting | ml.g4dn.xlarge (NVIDIA T4 GPU) |
| **Lambda** | Serverless compute | Chatbot proxy (Python 3.12) |
| **API Gateway** | HTTP API | Chatbot endpoint with CORS |
| **IAM** | Access management | Least privilege, IRSA, OIDC |
| **ACM** | TLS certificates | sofcore-hms.com + wildcard |
| **CloudWatch** | AWS monitoring | Container Insights, log groups |
| **NAT Gateway** | Outbound connectivity | Single AZ (cost-optimized) |
| **Secrets Manager** | Credential storage | DB creds, JWT secret |
| **EBS CSI** | Persistent storage | gp2/gp3 volumes for stateful workloads |

### Terraform Modules

```
infrastructure/terraform/
├── modules/
│   ├── vpc/          # VPC, subnets, IGW, NAT, route tables
│   ├── eks/          # EKS cluster + managed node group + OIDC
│   ├── rds/          # MySQL 8.0, parameter groups, monitoring
│   ├── s3/           # Buckets with encryption + lifecycle
│   ├── ecr/          # Container registries + lifecycle policies
│   ├── alb/          # ALB + target groups + listeners
│   ├── iam/          # Roles, policies, IRSA
│   ├── security/     # Security groups (ALB, backend, DB)
│   ├── networking/   # NACLs, VPC flow logs
│   └── sagemaker/    # AI model endpoint (GPU)
└── environments/
    └── production/   # Module composition + state management
```

---

## 🐳 Containerization & Kubernetes

### Docker Images

| Image | Base | Size | Features |
|-------|------|------|----------|
| Backend | eclipse-temurin:17-jre-jammy | ~280 MB | Multi-stage, non-root, healthcheck, OCI labels |
| Frontend | nginx:1.27-alpine | ~25 MB | Multi-stage (Node build → Nginx), non-root |
| Chatbot | nvidia/cuda:12.4-runtime | ~4.8 GB | GPU support, custom ML models |

### Kubernetes Resources

- **Deployments:** Backend (3 replicas), Frontend (3 replicas)
- **Services:** ClusterIP (backend), NodePort (frontend → ALB)
- **HPA:** CPU-based auto-scaling (2-6 backend, 2-5 frontend)
- **PDB:** Pod Disruption Budgets (minAvailable: 1-2)
- **Network Policies:** Default-deny + explicit allow (zero-trust)
- **Security Contexts:** Non-root, drop ALL capabilities, seccomp
- **Resource Quotas:** Namespace-level CPU/memory limits

### Helm Charts

```
infrastructure/helm/
├── backend/       # 8 templates (deployment, service, configmap, secret, SA, HPA, PDB, PVC)
├── frontend/      # 5 templates (deployment, service, HPA, PDB, nodeport)
├── ingress/       # ALB ingress with path-based routing
├── common/        # Shared library chart (helpers, labels)
└── monitoring/    # Prometheus, Grafana, Loki, Promtail, Alertmanager
```

---

## 🔄 CI/CD & GitOps Pipeline

### Pipeline Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌────────┐
│  PR Open │────►│    CI    │────►│  Build   │────►│  Deploy  │────►│ ArgoCD │
│          │     │  (test)  │     │  (image) │     │  (GitOps)│     │ (sync) │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └────────┘
```

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Pull Request | Lint, test, type-check, build validation |
| `build.yml` | Push to main | Security scan → Docker build → ECR push → Helm package |
| `deploy.yml` | After build | Update Helm values → Git tag → GitHub Release → ArgoCD sync |
| `build-chatbot.yml` | ai_chatbot/ changes only | Build GPU container → ECR push |

### Key Features

- **Unified versioning:** Single version calculated once, used everywhere (Docker tags, Helm, Git tags, Releases)
- **Smart triggers:** Path-based filtering (chatbot builds only when ai_chatbot/ changes)
- **Security scanning:** Trivy (vulnerabilities) + Gitleaks (secret detection)
- **AWS authentication:** GitHub OIDC (no long-lived credentials)
- **ArgoCD Image Updater:** Automatically detects new ECR images and deploys
- **Idempotent operations:** Tag/release creation skipped if already exists
- **Rolling updates:** Zero-downtime deployments (maxUnavailable: 0)

---

## 📊 Observability & Monitoring

### Stack

| Component | Purpose |
|-----------|---------|
| **Prometheus** | Metrics collection (30s scrape interval, 7d retention) |
| **Grafana** | Visualization (6 dashboards, 3 datasources) |
| **Alertmanager** | Alert routing (3 severity tiers, escalation policies) |
| **Loki** | Log aggregation (14d retention, label-based querying) |
| **Promtail** | Log collection (DaemonSet, K8s metadata enrichment) |
| **CloudWatch** | AWS-native monitoring (Container Insights) |

### Alert Rules (10 rules)

| Severity | Alerts |
|----------|--------|
| 🔴 Critical | Pod CrashLoop, HTTP 5xx > 5%, DB connectivity failure, Node NotReady |
| 🟠 Warning | High CPU/Memory > 85%, P95 latency > 2s, Restart storm, Disk > 80% |
| 🔵 Info | HPA maxed out, JVM heap > 80% |

### Grafana Dashboards

- Cluster Overview (nodes, pods, CPU, memory, network)
- Node Resources (per-node CPU/memory/disk)
- Backend Performance (request rate, P95 latency, error rate, HikariCP)
- Frontend Performance (Nginx connections, requests/sec)
- JVM Metrics (heap, GC, threads, classes)
- Autoscaling (replicas vs max, CPU target tracking)

---

## 🤖 AI Medical Chatbot

### Architecture

```
User → Frontend Widget → API Gateway → Lambda → SageMaker Endpoint
                                                       │
                                                ml.g4dn.xlarge (GPU)
                                                       │
                                          ┌────────────┴────────────┐
                                          │  Qwen 3.5 4B (Arabic)  │
                                          │  + BGE-M3 Embeddings    │
                                          │  + Qdrant Vector DB     │
                                          │  (RAG Architecture)     │
                                          └─────────────────────────┘
```

### Key Features

- **Arabic Medical LLM:** Fine-tuned 4B parameter model for medical Q&A
- **RAG Pipeline:** Retrieval-Augmented Generation with medical knowledge base
- **Serverless proxy:** Lambda + API Gateway (~$0 idle cost)
- **GPU inference:** SageMaker ml.g4dn.xlarge (NVIDIA T4, 16GB)
- **Source citations:** Returns medical source + page number with answers
- **Custom container:** Built via GitHub Actions, pushed to ECR

---

## 🔒 Security

| Layer | Implementation |
|-------|---------------|
| **Edge** | Cloudflare (TLS, DDoS protection, WAF) |
| **Transport** | ACM certificates, HTTPS everywhere, HSTS |
| **Network** | VPC isolation, Security Groups chain, NACLs, Network Policies |
| **Identity** | IAM least privilege, OIDC (no static keys), IRSA |
| **Secrets** | AWS Secrets Manager, K8s Secrets (not in Git) |
| **Container** | Non-root, drop capabilities, seccomp, image scanning |
| **Code** | Trivy scanning, Gitleaks, dependency auditing |
| **Git** | Branch protection, PR required, immutable ECR tags |

---

## 📈 Project Metrics

| Metric | Value |
|--------|-------|
| AWS Services | 15 |
| Terraform Modules | 10 |
| Helm Charts | 8 |
| CI/CD Pipelines | 4 |
| Kubernetes Pods (app + monitoring) | 15+ |
| Docker Images | 3 (backend, frontend, chatbot) |
| Alert Rules | 10 |
| Grafana Dashboards | 6 |
| Deployment Time (push → production) | < 5 min |
| Monthly Cost | ~$750 (optimized) |
| Availability Target | 99.9% |

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Cloud** | AWS (EKS, RDS, S3, ECR, ALB, SageMaker, Lambda, API Gateway, CloudWatch, IAM, VPC, ACM, NAT, Secrets Manager) |
| **IaC** | Terraform (modular, S3 backend, DynamoDB locking) |
| **Containers** | Docker (multi-stage), Amazon ECR |
| **Orchestration** | Kubernetes (EKS), Helm, HPA, PDB, Network Policies |
| **CI/CD** | GitHub Actions, ArgoCD, ArgoCD Image Updater |
| **Monitoring** | Prometheus, Grafana, Alertmanager, Loki, Promtail |
| **Security** | Trivy, Gitleaks, IAM, OIDC, Security Groups, KMS |
| **DNS/CDN** | Cloudflare (DNS, SSL, Proxy, CDN, DDoS) |
| **AI/ML** | SageMaker, Lambda, PyTorch, CUDA, HuggingFace, Qdrant |
| **Backend** | Java 17, Spring Boot 4, Spring Security, JPA, MySQL |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |

---

## 📂 Repository Structure

```
.
├── .github/workflows/           # CI/CD pipelines (4 workflows)
├── infrastructure/
│   ├── terraform/               # IaC (10 modules + production env)
│   ├── helm/                    # Kubernetes charts (app + monitoring)
│   ├── kubernetes/              # Namespace, RBAC, Network Policies
│   ├── argocd/                  # GitOps application manifests
│   └── lambda/                  # Serverless functions
├── backend-docker/              # Backend Dockerfile + .dockerignore
├── frontend-docker/             # Frontend Dockerfile + Nginx configs
├── ai_chatbot/                  # Arabic Medical Chatbot (FastAPI + ML)
├── Back-End/                    # Spring Boot application source
├── Front-End/                   # React application source
├── docs/                        # Architecture, audit, deployment docs
│   ├── audit/                   # Security & readiness reports
│   ├── aws/                     # AWS architecture documentation
│   ├── docker/                  # Containerization guide
│   ├── kubernetes/              # EKS deployment guide
│   ├── cicd/                    # Pipeline documentation
│   ├── observability/           # Monitoring setup guide
│   └── production/              # Production deployment runbook
├── .env.production              # Environment variable template
├── .gitleaks.toml               # Secret scanning configuration
└── .editorconfig                # Code style consistency
```

---

## 🚀 Getting Started

### Prerequisites

- AWS CLI (authenticated)
- Terraform >= 1.5
- kubectl
- Helm 3
- Docker

### Deploy Infrastructure

```bash
cd infrastructure/terraform/environments/production
terraform init
terraform plan
terraform apply
```

### Deploy Application

```bash
# Connect to EKS
aws eks update-kubeconfig --name hms-production --region us-east-1

# Deploy via Helm
helm install hms-backend infrastructure/helm/backend/ -n hms-production
helm install hms-frontend infrastructure/helm/frontend/ -n hms-production
```

### Access

| Service | URL |
|---------|-----|
| Application | https://sofcore-hms.com |
| Grafana | http://grafana.sofcore-hms.com |
| ArgoCD | http://argocd.sofcore-hms.com |
| API Docs | https://sofcore-hms.com/swagger-ui/ |

---

## 📄 Documentation

| Document | Description |
|----------|-------------|
| [Project Audit](docs/audit/PROJECT_AUDIT.md) | Complete technical audit & readiness assessment |
| [AWS Architecture](docs/aws/AWS_ARCHITECTURE.md) | Cloud architecture & service inventory |
| [Docker Guide](docs/docker/Docker_Architecture.md) | Containerization architecture |
| [EKS Deployment](docs/kubernetes/EKS_ARCHITECTURE.md) | Kubernetes platform design |
| [CI/CD Pipeline](docs/cicd/CI_PIPELINE.md) | Pipeline architecture & workflows |
| [Observability](docs/observability/OBSERVABILITY_ARCHITECTURE.md) | Monitoring stack design |
| [Security Report](docs/SECURITY_REMEDIATION_REPORT.md) | Security audit & remediation |
| [Production Runbook](docs/production/PRODUCTION_DEPLOYMENT.md) | Deployment procedures |

---

## 👤 Author

**Role:** AWS Solutions Architect & DevOps Engineer

Built as a graduation project demonstrating enterprise-grade cloud architecture, infrastructure automation, container orchestration, GitOps, observability, security, and AI integration on AWS.

---

*Deployed with ❤️ on AWS using Terraform, Kubernetes, and ArgoCD*
