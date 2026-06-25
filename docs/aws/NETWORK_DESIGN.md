# Network Design — HMS

## VPC CIDR Planning

| Subnet tier | CIDR blocks | Count | Purpose |
|-------------|-------------|-------|---------|
| VPC | `10.0.0.0/16` | 1 | 65,536 IPs total |
| Public | `10.0.0.0/20`, `10.0.16.0/20`, `10.0.32.0/20` | 3 | ALB, NAT Gateway, bastion |
| Private | `10.0.48.0/20`, `10.0.64.0/20`, `10.0.80.0/20` | 3 | EKS nodes, app workloads |
| Database | `10.0.96.0/20`, `10.0.112.0/20`, `10.0.128.0/20` | 3 | RDS (isolated) |

## Routing

| Route table | Destination | Target |
|-------------|-------------|--------|
| Public RT | `0.0.0.0/0` | Internet Gateway |
| Private RT | `0.0.0.0/0` | NAT Gateway |
| Database | `0.0.0.0/0` | NAT Gateway (for patching) |

## Security Groups

| SG | Inbound | From | Port |
|----|---------|------|------|
| ALB | HTTP/HTTPS | `0.0.0.0/0` | 80, 443 |
| Backend | HTTP | ALB SG | 8080 |
| Database | MySQL | Backend SG | 3306 |

## Network ACLs

| NACL | Applied to | Rules |
|------|-----------|-------|
| Database NACL | Database subnets | Allow MySQL (3306) from VPC CIDR only |

## NAT Gateway

- Single NAT Gateway in AZ-1 (cost optimization)
- Upgrade to 1 NAT per AZ for production HA if budget allows

## VPC Flow Logs

- Enabled for all traffic types
- Destination: CloudWatch Logs
- Retention: 30 days
