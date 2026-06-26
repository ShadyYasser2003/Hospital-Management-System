# Route53 Configuration — sofcore-hms.com

## Architecture

```
Cloudflare (Registrar ONLY)
    │
    │  NS delegation
    ▼
Route53 (Authoritative DNS)
    │
    ├── sofcore-hms.com      → A ALIAS → CloudFront
    ├── www.sofcore-hms.com  → A ALIAS → CloudFront
    ├── api.sofcore-hms.com  → A ALIAS → ALB
    ├── grafana.sofcore-hms.com → A ALIAS → ALB
    └── (ACM validation CNAMEs → auto-managed)
```

## Nameserver Delegation

After `terraform apply`, the Route53 hosted zone outputs 4 nameservers.

**Configure in Cloudflare:**
1. Cloudflare Dashboard → Domain → DNS → Nameservers
2. Change to Custom Nameservers
3. Enter the 4 Route53 NS values (e.g.):
   ```
   ns-123.awsdns-45.com
   ns-678.awsdns-90.net
   ns-111.awsdns-22.co.uk
   ns-333.awsdns-44.org
   ```
4. Save → wait for propagation

## Verification

```bash
# Check NS records
dig sofcore-hms.com NS +short

# Should return Route53 nameservers, NOT Cloudflare
# Expected: ns-*.awsdns-*.com/net/co.uk/org

# Check A record
dig sofcore-hms.com A +short
# Should return CloudFront IPs
```

## Important Notes

- Cloudflare Proxy (orange cloud) is NOT used
- Cloudflare SSL is NOT used
- Cloudflare is ONLY the registrar
- All DNS management happens in Route53
- ACM DNS validation records are auto-created by Terraform
