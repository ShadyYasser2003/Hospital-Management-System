# AWS INFRASTRUCTURE REPORT

**Phase:** 4 — AWS Infrastructure Foundation (Terraform)
**Status:** ✅ Complete

---

## VPC Topology

```
VPC 10.0.0.0/16
├── Public Subnets   (3 AZs) — ALB, NAT, future bastion
├── Private Subnets  (3 AZs) — EKS nodes, application workloads
└── Database Subnets (3 AZs) — RDS (isolated, NACL restricted)
```

## Subnet Design (CIDR Allocation)

| Tier | AZ-1 | AZ-2 | AZ-3 | IPs each |
|------|------|------|------|----------|
| Public | 10.0.0.0/20 | 10.0.16.0/20 | 10.0.32.0/20 | 4,094 |
| Private | 10.0.48.0/20 | 10.0.64.0/20 | 10.0.80.0/20 | 4,094 |
| Database | 10.0.96.0/20 | 10.0.112.0/20 | 10.0.128.0/20 | 4,094 |

## Security Groups

| Name | Purpose | Inbound |
|------|---------|---------|
| ALB SG | Internet-facing load balancer | 80/443 from 0.0.0.0/0 |
| Backend SG | Spring Boot pods | 8080 from ALB SG only |
| Database SG | RDS MySQL | 3306 from Backend SG only |

## IAM Roles

| Role | Trust | Policies |
|------|-------|----------|
| EKS Cluster Role | eks.amazonaws.com | AmazonEKSClusterPolicy, VPCResourceController |
| EKS Node Role | ec2.amazonaws.com | WorkerNodePolicy, CNI, ECR ReadOnly |
| RDS Monitoring | monitoring.rds.amazonaws.com | EnhancedMonitoringRole |
| VPC Flow Logs | vpc-flow-logs.amazonaws.com | CloudWatch Logs write |

## RDS Architecture

| Property | Value |
|----------|-------|
| Engine | MySQL 8.0 |
| Instance | db.t3.medium |
| Storage | 20 GB gp3, autoscale to 100 GB |
| Encryption | ✅ (at rest) |
| Multi-AZ | ✅ |
| Backups | 7 days retention |
| Monitoring | Enhanced (60s), Performance Insights |
| Deletion Protection | ✅ |

## S3 Design

| Bucket | Purpose | Versioning | Encryption | Public |
|--------|---------|------------|------------|--------|
| hms-production-uploads | Lab reports, files | ✅ | KMS | ❌ Blocked |
| hms-production-backups | DB backups, DR | ✅ | KMS | ❌ Blocked |

## ECR Design

| Repository | Scanning | Mutability | Lifecycle |
|------------|----------|------------|-----------|
| hms/backend | On push | Immutable | Untagged: 7d, Tagged: max 20 |
| hms/frontend | On push | Immutable | Untagged: 7d, Tagged: max 20 |

## Cost Estimation

| Service | Monthly |
|---------|---------|
| RDS (db.t3.medium, Multi-AZ) | ~$130 |
| NAT Gateway (1) | ~$35 |
| ALB | ~$20 |
| S3 | ~$2 |
| ECR | ~$1 |
| CloudWatch (flow logs) | ~$5 |
| **Total (Phase 4)** | **~$193/month** |

## Readiness Score

| Dimension | Score |
|-----------|------:|
| VPC/Networking | 95/100 |
| Security Groups | 95/100 |
| IAM | 90/100 |
| RDS | 95/100 |
| S3 | 95/100 |
| ECR | 95/100 |
| ALB | 80/100 (no listeners yet) |
| EKS | 60/100 (module only) |
| **Overall Infrastructure** | **88/100** |

## Modules Delivered

| Module | Files | Status |
|--------|-------|--------|
| vpc | main.tf, variables.tf, outputs.tf | ✅ |
| networking | main.tf, variables.tf, outputs.tf | ✅ |
| security | main.tf, variables.tf, outputs.tf | ✅ |
| iam | main.tf, variables.tf, outputs.tf | ✅ |
| ecr | main.tf, variables.tf, outputs.tf | ✅ |
| s3 | main.tf, variables.tf, outputs.tf | ✅ |
| rds | main.tf, variables.tf, outputs.tf | ✅ |
| alb | main.tf, variables.tf, outputs.tf | ✅ |
| acm | main.tf, variables.tf, outputs.tf | ✅ |
| eks | main.tf, variables.tf, outputs.tf | ✅ (structure only) |

## Next Phase (Phase 5): Amazon EKS Deployment

Prerequisites satisfied:
- [x] VPC with tagged subnets (kubernetes.io/cluster, kubernetes.io/role)
- [x] EKS IAM roles ready
- [x] ECR repositories for images
- [x] RDS endpoint available for DATABASE_URL
- [x] S3 bucket for uploads
- [x] ALB + target groups for Ingress
- [x] ACM certificate for TLS

Remaining:
- [ ] Activate EKS module (provision cluster + nodes)
- [ ] Configure kubectl / IRSA
- [ ] Deploy Helm charts / manifests
- [ ] Wire ALB Ingress Controller
- [ ] Configure Secrets Manager integration
