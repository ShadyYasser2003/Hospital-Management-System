# Infrastructure Decisions — HMS

## Key Architecture Decisions

### 1. Single NAT Gateway
**Decision:** One NAT in AZ-1 instead of one per AZ.
**Reason:** Cost optimization (~$32/month saved per NAT). For a hospital system, this is acceptable during initial deployment. Can upgrade to multi-NAT for HA later.

### 2. RDS Multi-AZ
**Decision:** Enabled by default.
**Reason:** Healthcare data requires high availability. Automatic failover protects against AZ outages with minimal RPO.

### 3. ECR Image Immutability
**Decision:** `image_tag_mutability = "IMMUTABLE"`.
**Reason:** Ensures deployed images can never be overwritten. Critical for audit trails and reproducible deployments in healthcare.

### 4. S3 KMS Encryption
**Decision:** Server-side encryption with AWS KMS.
**Reason:** Lab reports and patient files are PHI. KMS provides key rotation and audit via CloudTrail.

### 5. Three Subnet Tiers
**Decision:** Public / Private / Database (separate).
**Reason:** Defense in depth. Database subnets have restrictive NACLs — even if a pod is compromised, direct DB access from public subnets is impossible.

### 6. EKS Module Deferred
**Decision:** Module structure created, cluster NOT provisioned.
**Reason:** Per phase plan — infrastructure foundation first, K8s deployment in Phase 5.

### 7. ALB without Listeners
**Decision:** ALB + target groups provisioned, no listeners yet.
**Reason:** Listeners require either a running EKS Ingress Controller or the ACM cert to be validated. Both depend on later phases.

### 8. VPC Flow Logs
**Decision:** Enabled for all traffic, 30-day retention.
**Reason:** Required for security audit and incident investigation in healthcare environments.

### 9. RDS Enhanced Monitoring
**Decision:** 60-second granularity monitoring enabled.
**Reason:** Early detection of performance issues; necessary for SLA commitments.

### 10. Lifecycle Policies on ECR
**Decision:** Expire untagged after 7 days, keep max 20 tagged.
**Reason:** Prevents unbounded storage costs while retaining enough rollback history.

## Cost Estimation (monthly, us-east-1)

| Service | Estimated cost |
|---------|---------------|
| RDS db.t3.medium (Multi-AZ) | ~$130 |
| NAT Gateway (1) | ~$35 |
| ALB | ~$20 |
| S3 (minimal initial) | ~$2 |
| ECR | ~$1 |
| VPC Flow Logs (CloudWatch) | ~$5 |
| **Total (infrastructure only)** | **~$193/month** |

*Note: EKS cluster (~$72/mo) + nodes (~$140+/mo) will be added in Phase 5.*
