# Cloudflare Configuration — sofcore-hms.com

## DNS Records

Log into Cloudflare Dashboard → select `sofcore-hms.com` → DNS → Records.

### Required Records

| Type | Name | Content | Proxy | TTL |
|------|------|---------|-------|-----|
| CNAME | `@` (root) | `a6b3eb3b939954a389f33f40c1430bd9-2076324274.us-east-1.elb.amazonaws.com` | ☁️ Proxied | Auto |
| CNAME | `www` | `a6b3eb3b939954a389f33f40c1430bd9-2076324274.us-east-1.elb.amazonaws.com` | ☁️ Proxied | Auto |
| CNAME | `api` | `a6b3eb3b939954a389f33f40c1430bd9-2076324274.us-east-1.elb.amazonaws.com` | ☁️ Proxied | Auto |

> Cloudflare supports CNAME at root via CNAME flattening (resolves to A record for clients).

## SSL/TLS Settings

| Setting | Location | Value |
|---------|----------|-------|
| SSL Mode | SSL/TLS → Overview | **Full** |
| Always Use HTTPS | SSL/TLS → Edge Certificates | ✅ On |
| Automatic HTTPS Rewrites | SSL/TLS → Edge Certificates | ✅ On |
| Min TLS Version | SSL/TLS → Edge Certificates | TLS 1.2 |

## Performance Settings

| Setting | Location | Value |
|---------|----------|-------|
| HTTP/2 | Speed → Optimization | ✅ (enabled by default) |
| HTTP/3 | Speed → Optimization | ✅ Enable |
| Brotli | Speed → Optimization | ✅ On |
| Auto Minify | Speed → Optimization | HTML ✅, CSS ✅, JS ✅ |

## Security

| Setting | Location | Value |
|---------|----------|-------|
| Security Level | Security → Settings | Medium |
| Browser Integrity Check | Security → Settings | ✅ On |
| Under Attack Mode | Security → Settings | Off (enable during DDoS) |

## Why "Full" and not "Full (Strict)"

Full (Strict) requires a valid SSL certificate on the origin (ALB). Currently the
ALB doesn't have an ACM certificate attached (we're using Cloudflare for all TLS).
If you add an ACM cert to the ALB later, upgrade to Full (Strict).

## Verification

After configuring DNS, wait 1-5 minutes then:
```bash
# Check DNS resolution
dig sofcore-hms.com +short

# Check HTTPS
curl -I https://sofcore-hms.com

# Should return 200 with Cloudflare headers (cf-ray, server: cloudflare)
```
