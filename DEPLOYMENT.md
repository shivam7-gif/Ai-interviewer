# 🚀 InterviewOS AI — Production & Deployment Runbook

This guide covers deploying **InterviewOS AI** to production across multiple hosting architectures: from a 1-command containerized VPS deployment to a multi-cloud serverless PaaS architecture.

---

## 📋 Architecture Overview

```
                        ┌───────────────────────────────┐
                        │   Cloudflare CDN / Route 53   │
                        └───────────────┬───────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 │                                             │
                 ▼                                             ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│     Frontend (Nginx / SPA)      │           │    LiveKit Cloud (WebRTC)       │
│  React 19 · Vite · TailwindCSS  │           │   Global Voice & Video Mesh     │
└────────────────┬────────────────┘           └────────────────┬────────────────┘
                 │                                             │
                 │ REST / SSE / WebSockets                     │ Token Auth & Webhooks
                 ▼                                             ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                           Backend API & Agent Core                            │
│           Node.js 20+ · Express 5 · Helmet · Pino · Rate Limiting             │
│                                                                               │
│   • /api/v1/pre-interview         • /api/v1/interview/:id/chat               │
│   • /api/v1/interview/:id/code    • /api/livekit/token                        │
│   • /health/live                  • /health/ready                             │
└───────────────────────┬───────────────────────────────┬───────────────────────┘
                        │                               │
                        ▼                               ▼
        ┌───────────────────────────────┐   ┌───────────────────────────┐
        │      PostgreSQL Database      │   │     LLM Inference Cloud   │
        │    Neon / AWS RDS / Compose   │   │   Groq (LLaMA 3.3 70B)    │
        │   Prisma ORM (Connection Pool)│   │   Gemini / OpenAI API     │
        └───────────────────────────────┘   └───────────────────────────┘
```

---

## 🛠️ Option 1: 1-Command Docker Compose Deployment (Recommended for VPS / Single Host)

Ideal for DigitalOcean Droplets, AWS EC2, Hetzner, or Linode.

### Prerequisites:
- A Linux VPS with Docker & Docker Compose installed.
- Domain name pointed to your VPS IP (e.g. `interviewos.yourdomain.com`).

### Steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/interviewos-ai.git
   cd interviewos-ai
   ```

2. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   nano .env
   ```
   *Fill in your production variables (`GROQ_API_KEY`, `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `JWT_SECRET`, and `POSTGRES_PASSWORD`).*

3. **Start the Production Cluster:**
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```

4. **Run Prisma Database Migrations:**
   ```bash
   docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
   ```

5. **(Optional) Seed Playlists / LeetCode Question Sets:**
   ```bash
   docker compose -f docker-compose.prod.yml exec backend npx tsx prisma/seed.ts
   ```

6. **Verify Health:**
   ```bash
   curl http://localhost:3001/health/ready
   # Expected: {"status":"ready","database":"connected",...}
   ```

---

## ☁️ Option 2: Cloud PaaS Architecture (Serverless & Auto-scaling)

For zero-maintenance infrastructure with autoscaling:

| Layer | Recommended Provider | Alternative |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) / [Cloudflare Pages](https://pages.cloudflare.com) | AWS S3 + CloudFront |
| **Backend API** | [Render](https://render.com) / [Railway](https://railway.app) | AWS ECS / Fly.io |
| **Database** | [Neon Serverless Postgres](https://neon.tech) | Supabase / AWS Aurora Serverless |
| **Voice AI WebRTC**| [LiveKit Cloud](https://livekit.io) | Self-hosted LiveKit Server |
| **AI LLM Engine** | [Groq Cloud](https://groq.com) | Google Vertex AI / OpenAI |

### 1. Database Setup (Neon Postgres)
1. Create a database on [Neon](https://neon.tech).
2. Copy the pooled connection string:
   ```env
   DATABASE_URL="postgresql://user:password@ep-sample-12345-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

### 2. Backend Deployment (Render / Railway)
1. Connect your GitHub repository to **Render** as a **Web Service** (or Railway).
2. Set Root Directory to `backend`.
3. Build Command:
   ```bash
   npm ci && npx prisma generate && npm run build
   ```
4. Start Command:
   ```bash
   npx prisma migrate deploy && node dist/src/index.js
   ```
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3001`
   - `DATABASE_URL`: *(Your Neon connection string)*
   - `CORS_ORIGIN`: `https://your-frontend-domain.vercel.app`
   - `GROQ_API_KEY`: *(Your Groq API key)*
   - `LIVEKIT_URL`: *(Your LiveKit Cloud URL)*
   - `LIVEKIT_API_KEY`: *(Your LiveKit API key)*
   - `LIVEKIT_API_SECRET`: *(Your LiveKit API secret)*
   - `JWT_SECRET`: *(A secure 64-char random string)*
6. Set Health Check path to `/health/live`.

### 3. Frontend Deployment (Vercel)
1. Import repository to **Vercel**.
2. Root Directory: `frontend/app`.
3. Framework Preset: `Vite`.
4. Environment Variables:
   - `VITE_BACKEND_URL`: `https://your-backend-service.onrender.com`
   - `VITE_GOOGLE_CLIENT_ID`: *(Your Google OAuth client ID)*
5. Deploy!

---

## 🔒 Production Security Checklist

- [x] **Strict Environment Validation**: Zod runtime schema validates all critical variables on startup.
- [x] **Security Headers**: `helmet` configured for XSS, MIME sniffing, clickjacking prevention.
- [x] **Rate Limiting**:
  - `300 req / 15m` for general API endpoints.
  - `30 req / 1m` strict rate limit for AI generation / LLM endpoints to prevent token draining.
  - `50 req / 15m` for token issuance endpoints.
- [x] **Zero-Root Containers**: Docker containers run as unprivileged `node` and `nginx` users.
- [x] **Health & Readiness Probes**: `/health/live` and `/health/ready` (actively testing database connectivity).
- [x] **Structured Logging**: Low-overhead `pino` JSON logs with request latency and error tracing.
- [x] **CORS Lockdown**: Set `CORS_ORIGIN` to your explicit frontend production domains.

---

## 📈 Horizontal Scaling & Optimization

When scaling to multiple backend instances:
1. **Socket.IO Scaling**: If running multiple backend instances behind a load balancer, configure the `@socket.io/redis-adapter` with a Redis instance (e.g., Upstash or AWS ElastiCache).
2. **Database Pooling**: Use Neon's built-in connection pooler (`-pooler` connection string) or PgBouncer to handle thousands of concurrent candidate connections without exhausting PostgreSQL connection limits.
3. **Static Caching**: Nginx is pre-configured with 6-month caching and gzip compression for immutable static assets (`/assets/*`).
