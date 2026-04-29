# 🍔 FoodRush — Microservices Food Delivery App

> A minimal, Gen-Z vibes food delivery platform built for DevOps showcasing on EKS.

---

## 🏗️ Architecture

```
Frontend (Next.js :3000)
    ↕ API Proxy Routes
├── User Service     (FastAPI :8001) → PostgreSQL
├── Restaurant Service (FastAPI :8002) → PostgreSQL  
└── Order Service    (FastAPI :8003) → PostgreSQL
```

---

## 🚀 Quick Start (Local)

```bash
# Clone the repo
git clone <your-repo-url>
cd foodrush

# Start everything
docker-compose up --build

# App is live at http://localhost:3000
```

That's it. All services start automatically with seeded data.

---

## ☸️ EKS Deployment

### 1. Update ECR repo in K8s manifests
```bash
# Replace YOUR_ECR_REPO with your actual ECR registry
sed -i 's|YOUR_ECR_REPO|<your-account>.dkr.ecr.us-east-1.amazonaws.com|g' k8s/*.yaml
```

### 2. Update your domain in Ingress
```bash
# Edit k8s/05-ingress.yaml and replace foodrush.yourdomain.com
```

### 3. Apply manifests
```bash
kubectl apply -f k8s/
kubectl get pods -n foodrush
```

---

## 🔧 Jenkins CI/CD

### Prerequisites
- Jenkins with Docker, kubectl, AWS CLI installed
- Credentials configured:
  - `eks-kubeconfig` — your EKS kubeconfig file
  - `AWS_ACCOUNT_ID` — your AWS account ID env var

### Pipeline Stages
1. 📥 Checkout
2. 🔍 Code Quality (flake8 + bandit)
3. 🐳 Build Docker Images
4. 🔐 Image Security Scan (Trivy)
5. 📤 Push to ECR
6. 🚀 Deploy to EKS
7. ✅ Verify Deployment

---

## 📊 DevOps Features Ready to Use

| Feature | Status |
|---------|--------|
| Health checks (`/health`) | ✅ All services |
| Metrics endpoint (`/metrics`) | ✅ All services |
| Readiness & Liveness probes | ✅ K8s manifests |
| HorizontalPodAutoscaler | ✅ All deployments |
| Rolling update strategy | ✅ All deployments |
| Resource limits & requests | ✅ All deployments |
| Namespace isolation | ✅ `foodrush` namespace |
| ConfigMaps & Secrets | ✅ K8s manifests |
| Ingress routing | ✅ Nginx Ingress |

---

## 🌐 Service Endpoints

| Service | Port | Key Endpoints |
|---------|------|---------------|
| Frontend | 3000 | `/` |
| User Service | 8001 | `POST /api/users/register`, `POST /api/users/login`, `GET /api/users/{id}` |
| Restaurant Service | 8002 | `GET /api/restaurants`, `GET /api/restaurants/{id}/menu` |
| Order Service | 8003 | `POST /api/orders`, `GET /api/orders/{id}`, `GET /api/orders/user/{uid}` |

All services have: `GET /health` and `GET /metrics`

---

## 📁 Project Structure

```
foodrush/
├── user-service/          # FastAPI + PostgreSQL
├── restaurant-service/    # FastAPI + PostgreSQL (auto-seeded)
├── order-service/         # FastAPI + PostgreSQL
├── frontend/              # Next.js 14 (Gen-Z dark UI)
├── k8s/                   # Kubernetes manifests
│   ├── 00-namespace.yaml
│   ├── 01-config.yaml     # ConfigMap + Secrets
│   ├── 02-databases.yaml  # PostgreSQL deployments
│   ├── 03-services.yaml   # Microservices + HPA
│   ├── 04-frontend.yaml   # Frontend + HPA
│   └── 05-ingress.yaml    # Nginx Ingress
├── docker-compose.yml     # Local development
├── Jenkinsfile            # CI/CD pipeline
└── README.md
```

---

## 🎯 Next Steps for GitOps

1. Install ArgoCD on your cluster
2. Point ArgoCD to your forked repo
3. Set sync path to `k8s/`
4. Remove deploy stage from Jenkinsfile — ArgoCD handles it
5. Any `git push` to `main` auto-deploys 🚀
