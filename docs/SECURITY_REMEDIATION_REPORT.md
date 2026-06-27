# SECURITY REMEDIATION REPORT

**Date:** 2026-06-27
**Status:** ✅ Current codebase cleaned | ⚠️ Git history rewrite recommended

---

## Secrets Found & Removed

| File | Secret Type | Action |
|------|-------------|--------|
| `Back-End/src/main/resources/application.yml` | SMTP password (`cphiffcvduydkhsx`) | Replaced with `${MAIL_PASSWORD}` |
| `Back-End/src/main/resources/application.yml` | JWT secret (64-char hex) | Replaced with `${JWT_SECRET}` |
| `Back-End/src/main/resources/application.yml` | PayPal client-secret | Replaced with `${PAYPAL_CLIENT_SECRET}` |
| `Back-End/src/main/resources/application.yml` | PayPal client-id | Replaced with `${PAYPAL_CLIENT_ID}` |
| `Back-End/src/main/resources/application.yml` | Kashier API key | Replaced with `${KASHIER_API_KEY}` |
| `Back-End/src/main/resources/application.yml` | Kashier secret key | Replaced with `${KASHIER_SECRET_KEY}` |
| `Back-End/src/main/resources/application.yml` | DB password (`root`) | Replaced with `${DATABASE_PASSWORD}` |
| `Back-End/src/test/resources/application-test.yml` | JWT secret (same hex) | Replaced with test-only dummy value |
| `target/classes/application.yml` | All above (compiled copy) | Excluded from VCS via .gitignore |
| `terraform.tfstate` | RDS password | Excluded from VCS via .gitignore |

---

## Environment Variables Introduced

| Variable | Purpose | Sensitive |
|----------|---------|-----------|
| `MAIL_HOST` | SMTP server | No |
| `MAIL_PORT` | SMTP port | No |
| `MAIL_USERNAME` | SMTP email | Yes |
| `MAIL_PASSWORD` | SMTP app password | **Yes** |
| `PAYPAL_CLIENT_ID` | PayPal API | **Yes** |
| `PAYPAL_CLIENT_SECRET` | PayPal API | **Yes** |
| `PAYPAL_MODE` | sandbox/live | No |
| `KASHIER_MERCHANT_ID` | Payment gateway | **Yes** |
| `KASHIER_API_KEY` | Payment gateway | **Yes** |
| `KASHIER_SECRET_KEY` | Payment gateway | **Yes** |
| `KASHIER_MODE` | test/live | No |
| `KASHIER_REDIRECT_URL` | Payment callback | No |
| `KASHIER_WEBHOOK_URL` | Payment webhook | No |
| `HOSPITAL_NAME` | Display name | No |
| `HOSPITAL_EMAIL` | Hospital email | No |
| `BLOOD_BANK_EMAIL` | Blood bank email | No |

---

## Credential Rotation Checklist

⚠️ **ALL of the following credentials were exposed in Git history and MUST be rotated:**

- [ ] **Gmail SMTP App Password** — Go to Google Account → Security → App passwords → Revoke old → Generate new
- [ ] **JWT Secret** — Generate a new 64+ character random hex string
- [ ] **PayPal Client Secret** — PayPal Developer Dashboard → App → Reset secret
- [ ] **PayPal Client ID** — Consider regenerating if leaked publicly
- [ ] **Kashier API Key** — Contact Kashier support to rotate
- [ ] **Kashier Secret Key** — Contact Kashier support to rotate
- [ ] **Database Password** — Already changed for production (RDS uses `HmsPass2024Secure99`)
- [ ] **Kashier Merchant ID** — Verify with Kashier if this is sensitive

---

## Git History Cleanup

The current HEAD is clean, but secrets exist in previous commits. To fully remediate:

```bash
# Install BFG Repo-Cleaner
# https://rtyley.github.io/bfg-repo-cleaner/

# Create a file with secrets to remove
cat > secrets-to-remove.txt << 'EOF'
cphiffcvduydkhsx
404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
EGcSDVFRhVxUn1RCcWyjkIPErJOJHAjA-f8QPc-k5AAS8cT1eT5c7lHVbiySW7aRYWhhwVh7jWpdDYM0
ATCn_rdsFqX6s3bnje7kAjpAA4djBmDzKKOTgW89tbgdfPvka_YWi433ZnhJFLHAnuCQ53rCQckgMAr5
40c2565e-5396-45fe-978a-651b8e21a434
cdc44a7da18ec58b7060165e5fcfccf3
MID-47186-789
salemsheer4321@gmail.com
EOF

# Run BFG to replace secrets in all history
bfg --replace-text secrets-to-remove.txt HMS.git

# Clean up
cd HMS.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (⚠️ rewrites history for all collaborators)
git push origin --force --all
git push origin --force --tags
```

⚠️ **Force push warning:** All collaborators must re-clone after this operation.

---

## Files Modified

| File | Change |
|------|--------|
| `Back-End/src/main/resources/application.yml` | All secrets → env vars |
| `Back-End/src/test/resources/application-test.yml` | Real JWT → test dummy |
| `.gitignore` | Added target/, tfstate |
| `.env.example` | Created with all placeholders |
| `.gitleaks.toml` | Gitleaks config (allowlist paths) |
| `.gitleaksignore` | Test-only values allowlist |
| `.github/workflows/build.yml` | Updated gitleaks config reference |

---

## Validation

- [x] No secrets in current HEAD
- [x] `.env.example` with all required variables
- [x] Spring Boot reads all values from environment
- [x] Test config uses dummy values only
- [x] Gitleaks config excludes test files and example files
- [x] `.gitignore` excludes target/ and tfstate
- [ ] Git history cleanup (requires BFG + force push — manual step)
- [ ] Credential rotation (manual step per provider)
