# Production Deployment Runbook — sofcore-hms.com

## Pre-requisites

- [ ] AWS CLI authenticated (`aws sts get-caller-identity`)
- [ ] Terraform >= 1.5 installed
- [ ] Helm 3 installed
- [ ] kubectl installed
- [ ] Docker installed
- [ ] Domain `sofcore-hms.com` registered at Cloudflare

---

## Step 1 — Route53 Hosted Zone

```bash
cd infrastructure/terraform/environments/production
terraform apply -target=module.route53

# Output: Name Servers (4 NS records)
terraform output -module=route53 name_servers
```

**Manual action required:**
1. Log into Cloudflare dashboard → `sofcore-hms.com` → DNS
2. Go to domain registrar settings (NOT DNS records)
3. Replace Cloudflare nameservers with the 4 Route53 NS values
4. Wait 24-48h for propagation (usually < 1h)
5. Verify: `dig sofcore-hms.com NS`

---

## Step 2 — ACM Certificate

```bash
terraform apply -target=module.acm

# Certificate uses DNS validation via Route53 (automatic)
# Wait for status ISSUED:
aws acm describe-certificate \
  --certificate-arn $(terraform output -raw certificate_arn) \
  --query 'Certificate.Status'
```

---

## Step 3 — Full Infrastructure

```bash
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
```

Provisions: VPC, Subnets, IGW, NAT, SGs, IAM, ECR, S3, RDS, EKS, ALB

---

## Step 4 — Build & Push Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Backend
docker build -t hms-backend:v1.0.0 \
  -f backend-docker/Dockerfile \
  Back-End/Back-End/hospital-management-system-main

docker tag hms-backend:v1.0.0 <ECR_URL>/hms/backend:v1.0.0
docker tag hms-backend:v1.0.0 <ECR_URL>/hms/backend:latest
docker push <ECR_URL>/hms/backend:v1.0.0
docker push <ECR_URL>/hms/backend:latest

# Frontend (VITE_API_BASE_URL must be set!)
docker build -t hms-frontend:v1.0.0 \
  -f frontend-docker/Dockerfile \
  --build-arg VITE_API_BASE_URL=https://sofcore-hms.com \
  Front-End/HMS_Front

docker tag hms-frontend:v1.0.0 <ECR_URL>/hms/frontend:v1.0.0
docker tag hms-frontend:v1.0.0 <ECR_URL>/hms/frontend:latest
docker push <ECR_URL>/hms/frontend:v1.0.0
docker push <ECR_URL>/hms/frontend:latest
```

---

## Step 5 — Kubernetes Deployment

```bash
# Connect to EKS
aws eks update-kubeconfig --name hms-production --region us-east-1

# Create namespace
kubectl apply -f infrastructure/kubernetes/namespace/
kubectl apply -f infrastructure/kubernetes/network-policies/

# Install Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Install AWS LB Controller
helm repo add eks https://aws.github.io/eks-charts
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=hms-production \
  --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"=<LB_ROLE_ARN>

# Deploy Backend
helm install hms-backend infrastructure/helm/backend/ \
  -n hms-production \
  -f infrastructure/helm/backend/values-production.yaml \
  --set image.repository=<ECR_URL>/hms/backend \
  --set image.tag=v1.0.0 \
  --set env.secret.DATABASE_URL="jdbc:mysql://<RDS_ENDPOINT>/hms_backend" \
  --set env.secret.DATABASE_USERNAME=<DB_USER> \
  --set env.secret.DATABASE_PASSWORD=<DB_PASS> \
  --set env.secret.JWT_SECRET=<JWT_SECRET> \
  --set env.secret.JWT_ACCESS_TOKEN_EXPIRATION=900000 \
  --set env.secret.JWT_REFRESH_TOKEN_EXPIRATION=604800000 \
  --set env.secret.CORS_ALLOWED_ORIGINS=https://sofcore-hms.com

# Deploy Frontend
helm install hms-frontend infrastructure/helm/frontend/ \
  -n hms-production \
  -f infrastructure/helm/frontend/values-production.yaml \
  --set image.repository=<ECR_URL>/hms/frontend \
  --set image.tag=v1.0.0

# Deploy Ingress
helm install hms-ingress infrastructure/helm/ingress/ \
  -n hms-production \
  --set host=sofcore-hms.com \
  --set tls.certificateArn=<ACM_ARN>

# Verify
kubectl get pods -n hms-production
kubectl get svc -n hms-production
kubectl get ingress -n hms-production
```

---

## Step 6 — DNS Records (via Terraform)

Already handled by `module.route53` pointing at CloudFront/ALB.

---

## Step 7 — CloudFront (via Terraform)

```bash
terraform apply -target=module.cloudfront
```

---

## Step 8 — Secrets Manager (via Terraform)

```bash
terraform apply -target=module.secrets
```

---

## Step 9 — Verify

```bash
# DNS
dig sofcore-hms.com A
curl -I https://sofcore-hms.com

# Backend health
curl https://sofcore-hms.com/api/actuator/health

# Kubernetes
kubectl get pods -n hms-production -o wide
kubectl get hpa -n hms-production

# ArgoCD
argocd app list
```

---

## Estimated Timeline

| Step | Duration |
|------|----------|
| Route53 + NS delegation | 1-48h (usually < 1h) |
| ACM certificate | 5-30 min |
| Terraform apply (all) | 15-25 min |
| Image build + push | 5-10 min |
| Helm deployments | 5-10 min |
| CloudFront propagation | 5-15 min |
| **Total** | **~1-2 hours** (excluding DNS propagation) |
