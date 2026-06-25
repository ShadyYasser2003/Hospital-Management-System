# Terraform Structure — HMS

## Directory Layout

```
infrastructure/terraform/
├── modules/                          # Reusable infrastructure components
│   ├── vpc/                          # VPC, subnets, IGW, NAT, route tables
│   ├── networking/                   # NACLs, VPC flow logs
│   ├── security/                     # Security groups (ALB, backend, DB)
│   ├── iam/                          # IAM roles & policies (EKS, S3, RDS)
│   ├── ecr/                          # Container registry with lifecycle policies
│   ├── s3/                           # S3 buckets (uploads, backups)
│   ├── rds/                          # RDS MySQL (encrypted, Multi-AZ, monitored)
│   ├── alb/                          # Application Load Balancer + target groups
│   ├── acm/                          # TLS certificates with DNS validation
│   └── eks/                          # EKS cluster (module only, not deployed)
│
└── environments/
    └── production/                   # Production environment composition
        ├── backend.tf                # Remote state (S3 + DynamoDB locking)
        ├── providers.tf              # AWS provider + default tags
        ├── versions.tf               # Terraform + provider version constraints
        ├── variables.tf              # Environment-specific variables
        ├── main.tf                   # Module composition (wiring)
        └── outputs.tf                # Exported values
```

## Module Design Principles

1. **Self-contained**: each module has `main.tf`, `variables.tf`, `outputs.tf`
2. **Composable**: modules communicate via outputs → inputs (no hard deps)
3. **Reusable**: parameterized via variables; same module works for staging/prod
4. **No inline secrets**: sensitive values flow from TF variables (CI injected)

## State Management

- **Backend**: S3 bucket with versioning + encryption
- **Locking**: DynamoDB table (`hms-terraform-locks`)
- **State path**: `production/terraform.tfstate`

## Usage

```bash
cd infrastructure/terraform/environments/production

terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

## tfvars (not committed — inject via CI/secrets)

```hcl
database_username = "hms_admin"
database_password = "CHANGE_ME"
domain_name       = "hms.yourdomain.com"
route53_zone_id   = "Z1234567890"
```
