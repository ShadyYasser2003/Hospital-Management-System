# AWS Architecture — Hospital Management System

## High-Level Architecture

```
                          ┌──────────────────────────────────────────────────┐
                          │                    AWS Cloud                      │
                          │                                                  │
  Internet ──►  Route53 ──►  CloudFront ──►  ALB (public subnets)           │
                          │                    │                              │
                          │         ┌──────────┴──────────┐                  │
                          │         │                     │                  │
                          │    ┌────▼────┐          ┌─────▼─────┐           │
                          │    │Frontend │          │  Backend   │           │
                          │    │(EKS Pod)│          │ (EKS Pod)  │           │
                          │    │  Nginx  │          │Spring Boot │           │
                          │    └─────────┘          └─────┬─────┘           │
                          │         (private subnets)     │                  │
                          │                               │                  │
                          │                    ┌──────────▼──────────┐       │
                          │                    │    RDS MySQL         │       │
                          │                    │   (database subnets) │       │
                          │                    └─────────────────────┘       │
                          │                                                  │
                          │    ┌─────────┐    ┌─────────────┐               │
                          │    │   S3    │    │   ECR       │               │
                          │    │Uploads  │    │  Images     │               │
                          │    └─────────┘    └─────────────┘               │
                          └──────────────────────────────────────────────────┘
```

## AWS Services Used

| Service | Purpose | Status |
|---------|---------|--------|
| **VPC** | Network isolation, subnets, routing | ✅ Provisioned |
| **EC2/EKS** | Compute (Kubernetes nodes) | 📋 Module ready |
| **ECR** | Container image registry | ✅ Provisioned |
| **RDS** | Managed MySQL database | ✅ Provisioned |
| **S3** | File uploads, backups | ✅ Provisioned |
| **ALB** | Load balancing, TLS termination | ✅ Provisioned |
| **ACM** | SSL/TLS certificates | ✅ Provisioned |
| **IAM** | Roles, policies | ✅ Provisioned |
| **Route53** | DNS management | 📋 Planned |
| **CloudFront** | CDN | 📋 Planned |
| **Secrets Manager** | Credential storage | 📋 Phase 5 |
| **CloudWatch** | Monitoring & logs | ✅ Flow logs provisioned |

## Availability Zones

All critical resources span **3 AZs** for high availability:
- Public subnets: 3
- Private subnets: 3
- Database subnets: 3
- RDS: Multi-AZ enabled
