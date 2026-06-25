# Infrastructure

Infrastructure-as-Code for the Hospital Management System AWS deployment.

## Layout

```
infrastructure/
└── terraform/
    ├── modules/              # Reusable Terraform modules
    │   ├── vpc/              # VPC, subnets, IGW, NAT, routes
    │   ├── networking/       # Network ACLs, VPC Flow Logs
    │   ├── security/         # Security Groups (ALB, backend, DB)
    │   ├── iam/              # IAM roles & policies
    │   ├── ecr/              # Container registry + lifecycle
    │   ├── s3/               # Object storage (uploads, backups)
    │   ├── rds/              # Managed MySQL (encrypted, Multi-AZ)
    │   ├── alb/              # Application Load Balancer
    │   ├── acm/              # TLS certificates
    │   └── eks/              # EKS (module structure only)
    │
    └── environments/
        └── production/       # Production composition
            ├── backend.tf    # S3 remote state
            ├── providers.tf  # AWS provider
            ├── versions.tf   # Version constraints
            ├── variables.tf  # Input variables
            ├── main.tf       # Module wiring
            └── outputs.tf    # Exported values
```

## Status

| Component | Phase | Status |
|-----------|-------|--------|
| VPC & Networking | 4 | ✅ Ready |
| Security Groups | 4 | ✅ Ready |
| IAM | 4 | ✅ Ready |
| ECR | 4 | ✅ Ready |
| S3 | 4 | ✅ Ready |
| RDS | 4 | ✅ Ready |
| ALB | 4 | ✅ Infrastructure only |
| ACM | 4 | ✅ Ready |
| EKS | 5 | 📋 Module structure (not provisioned) |
| Kubernetes | 5 | ❌ Not started |
| Helm | 5 | ❌ Not started |
| Ansible | — | ❌ Not planned |

## Usage

```bash
cd infrastructure/terraform/environments/production
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply
```

> See `docs/aws/TERRAFORM_STRUCTURE.md` for detailed guidance.
