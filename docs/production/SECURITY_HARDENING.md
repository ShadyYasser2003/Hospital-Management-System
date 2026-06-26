# Security Hardening — HMS Production

## Applied security measures

### IAM (Least Privilege)
- [x] EKS cluster role: only EKS policies
- [x] Node role: worker + CNI + ECR read-only
- [x] Backend IRSA: scoped to specific S3 bucket only
- [x] GitHub OIDC: no long-lived access keys
- [x] No wildcard (*) policies in production

### Encryption
- [x] RDS: encrypted at rest (AWS managed KMS)
- [x] S3: SSE-KMS encryption
- [x] EBS: encrypted by default
- [x] TLS 1.2+ everywhere (ALB, CloudFront, RDS)
- [x] HTTPS-only (HTTP → HTTPS redirect)
- [x] HSTS preload header

### Network
- [x] Private subnets for EKS nodes and RDS
- [x] Database only accessible from backend SG
- [x] Network policies (default deny + explicit allows)
- [x] VPC flow logs enabled
- [x] NACL on database subnets

### Secrets
- [x] AWS Secrets Manager for all credentials
- [x] No secrets in Git, images, or ConfigMaps
- [x] JWT secret in Secrets Manager (rotatable)
- [x] RDS credentials in Secrets Manager

### Container Security
- [x] Non-root containers (spring:1000, nginx:101)
- [x] Drop ALL capabilities
- [x] allowPrivilegeEscalation: false
- [x] seccompProfile: RuntimeDefault
- [x] ECR image scanning on push
- [x] Immutable image tags

### WAF
- [x] AWS Managed Rules (Common, SQLi, XSS, Bad Inputs)
- [x] Rate limiting (2000 req/5min per IP)
- [x] Bot protection
- [x] Associated with CloudFront

### Access Control
- [x] RBAC in Kubernetes
- [x] Pod Disruption Budgets
- [x] Resource Quotas per namespace
- [x] EKS endpoint: private + public (restrict CIDR in production)

## Remaining recommendations

- [ ] Enable GuardDuty for EKS threat detection
- [ ] Enable AWS Config rules for compliance
- [ ] Implement secret rotation (RDS, JWT)
- [ ] Add pod identity webhook for fine-grained IRSA
- [ ] Restrict EKS public endpoint to office IPs
- [ ] Enable VPC endpoint for S3/ECR (avoid NAT costs + improve security)
