# Disaster Recovery Plan — HMS Production

## RPO / RTO Targets

| Tier | RPO | RTO | Applies to |
|------|-----|-----|------------|
| Critical | 1 hour | 15 min | Application (EKS pods) |
| Important | 4 hours | 1 hour | Database (RDS) |
| Standard | 24 hours | 4 hours | File storage (S3) |

## Backup Strategy

### RDS MySQL
| Schedule | Retention | Method |
|----------|-----------|--------|
| Continuous | 7 days | Automated RDS snapshots |
| Daily | 30 days | Manual snapshot (AWS Backup) |
| Weekly | 90 days | Cross-region copy |
| Monthly | 1 year | Cross-region + S3 archive |

### S3 Uploads
- Versioning: enabled (30-day noncurrent retention)
- Cross-region replication: recommended for DR
- Lifecycle: IA after 30d, Glacier after 90d (backups bucket)

### EBS (EKS node volumes)
- Daily snapshots via AWS Backup
- Retention: 7 days

### Kubernetes State
- ArgoCD holds desired state in Git (self-healing)
- etcd: managed by EKS (AWS handles backups)

## Recovery Procedures

### Application failure (pod crash)
```
Automatic: Kubernetes self-healing (restart, reschedule)
RTO: < 1 minute
```

### Node failure
```
Automatic: EKS managed node group replaces node
RTO: 5-10 minutes
```

### Database failure (single AZ)
```
Automatic: RDS Multi-AZ failover
RTO: ~2 minutes
RPO: 0 (synchronous replication)
```

### Region failure
```
Manual: Deploy to secondary region
1. Restore RDS from cross-region snapshot
2. Deploy EKS in secondary region (Terraform)
3. Update Route53 to point at new ALB
4. ArgoCD deploys from same Git repo
RTO: 1-2 hours
RPO: last cross-region snapshot (4-24h)
```

### Complete data loss
```
1. Restore RDS from S3 backup archive
2. Restore S3 from cross-region replica
3. Redeploy application via ArgoCD
RTO: 4 hours
RPO: last backup (daily/weekly)
```

## Runbook contacts

| Role | Responsibility |
|------|---------------|
| On-call SRE | First responder (critical alerts) |
| Backend Lead | Application-level issues |
| Platform Lead | Infrastructure decisions |
| DB Admin | RDS restore operations |
