# Cost Optimization — HMS Production

## Current Estimated Monthly Cost

| Service | Spec | Monthly |
|---------|------|---------|
| EKS Cluster | Control plane | $73 |
| EC2 (2x t3.medium) | EKS nodes | $60 |
| RDS (db.t3.medium, Multi-AZ) | MySQL | $130 |
| NAT Gateway (1) | Data + hourly | $35 |
| ALB | Hourly + LCUs | $25 |
| CloudFront | 100GB transfer | $10 |
| S3 (uploads + backups) | ~10GB | $2 |
| ECR | Image storage | $2 |
| Route53 | Hosted zone + queries | $1 |
| WAF | Rules + requests | $10 |
| Secrets Manager | 3 secrets | $1 |
| CloudWatch | Logs + metrics | $15 |
| **Total** | | **~$364/month** |

## Optimization Recommendations

### 1. Graviton Migration (save ~20% on compute)
```
t3.medium → t4g.medium (ARM)
EKS nodes: $60/mo → $48/mo
RDS: db.t3.medium → db.t4g.medium: $130/mo → $104/mo
Savings: ~$38/month
```

### 2. Spot Instances for non-critical workloads (save ~65%)
```
Frontend nodes: ON_DEMAND → SPOT
Savings: ~$20/month (frontend compute portion)
Requirement: PodDisruptionBudget already in place ✅
```

### 3. Reserved Instances (1-year, save ~30%)
```
RDS Reserved: $130 → $91/month
EC2 Savings Plan: $60 → $42/month
Savings: ~$57/month
```

### 4. S3 Intelligent Tiering
```
Uploads older than 30 days → Infrequent Access
Savings: ~$0.50/month (grows with data)
```

### 5. ECR Lifecycle (already configured)
```
Untagged: expire after 7 days
Tagged: keep max 20
Savings: prevents unbounded growth
```

### 6. CloudFront Cache Optimization
```
Cache static assets 1 year (already configured)
Brotli compression (configured)
Reduces ALB load and data transfer costs
```

## Potential monthly savings: **~$115/month (32% reduction)**

## Cost alerts

Set up AWS Budgets:
```bash
aws budgets create-budget --account-id <ID> \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

Thresholds: $300 (warning), $400 (critical)
