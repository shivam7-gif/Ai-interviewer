<!-- Header -->
<div align="center">
  <h1>🎙️ InterviewOS AI</h1>
  <p><strong>Real-time AI-powered technical interview platform</strong></p>
  <p>
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
    <img src="https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white" />
    <img src="https://img.shields.io/badge/LiveKit-WebRTC-E0314B?style=flat-square&logo=webrtc&logoColor=white" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  </p>
  <p>
    <a href="#-features">Features</a> ·
    <a href="#-architecture">Architecture</a> ·
    <a href="#-quick-start">Quick Start</a> ·
    <a href="#-tech-stack">Tech Stack</a>
  </p>
</div>

---

## 🚀 What is InterviewOS AI?

**InterviewOS AI** is a full-stack web application that conducts intelligent, real-time technical interviews powered by voice AI. Instead of generic LeetCode grinding, the AI analyses your **actual GitHub repositories** and asks contextual questions about your own work — while you code live in a Monaco editor.

Think: "*An AI interviewer that actually read your résumé*."

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎙️ **Voice AI Interviewer** | Real-time WebRTC audio via LiveKit for a natural interview feel |
| 💻 **Monaco Code Editor** | VS Code-grade editor with syntax highlighting for 15+ languages |
| 📂 **GitHub Integration** | Fetches your public repos and generates context-aware questions |
| 🔐 **Google OAuth** | One-click sign-in, no passwords required |
| 📊 **Interview Sessions** | Each session is stored in PostgreSQL for review and scoring |
| ⚡ **Real-time Sync** | Socket.IO for live collaboration and event streaming |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│  React 19 + Vite · TypeScript · TailwindCSS            │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Landing  │  │  Dashboard   │  │   Project Room   │  │
│  │   Page   │  │  (GitHub ↑)  │  │ Monaco + AI Voice│  │
│  └──────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ REST + Socket.IO
┌────────────────────────▼────────────────────────────────┐
│                       SERVER                            │
│  Express 5 · TypeScript · Node.js 20+                  │
│                                                         │
│  /api/v1/pre-interview  → GitHub fetch → Prisma DB     │
│  /api/playlists         → Drizzle ORM                  │
│  /api/livekit/token     → LiveKit SDK token gen        │
└──────┬──────────────────────────┬───────────────────────┘
       │                          │
┌──────▼──────┐           ┌───────▼───────┐
│ PostgreSQL  │           │  LiveKit Cloud │
│  (Prisma +  │           │  (WebRTC Voice │
│   Drizzle)  │           │   AI agent)    │
└─────────────┘           └───────────────┘
```

---

## ⚡ Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- [LiveKit Cloud](https://livekit.io/) account (free tier works)
- Google Cloud OAuth credentials

### 🐳 Option A: 1-Command Docker Setup (Recommended)

```bash
# 1. Copy root environment template
cp .env.example .env

# 2. Start PostgreSQL, Backend, and Frontend in Docker
npm run docker:up

# 3. Apply database migrations
docker compose exec backend npx prisma migrate deploy
```

Visit **http://localhost** 🎉

---

### 💻 Option B: Local Node.js Development

#### 1. Clone & Install
```bash
git clone https://github.com/yourusername/interviewos-ai.git
cd interviewos-ai

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend/app && npm install
```

#### 2. Configure Environment Variables
```bash
# Backend (.env)
cd backend && cp .env.example .env

# Frontend (.env)
cd ../frontend/app && cp .env.example .env
```

#### 3. Database Setup & Run
```bash
# From workspace root:
npm run db:generate
npm run db:migrate

# Start Backend & Frontend concurrently:
npm run dev:backend   # in terminal 1
npm run dev:frontend  # in terminal 2
```

Visit **http://localhost:5173** 🎉

---

## 🚀 Production Deployment

For complete multi-cloud deployment blueprints (Render, Railway, Neon Postgres, Vercel, Docker Swarm / VPS), see the **[Production Deployment Guide (DEPLOYMENT.md)](./DEPLOYMENT.md)**.


---

## 📁 Project Structure

```
interviewos-ai/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── config/             # Database clients (Prisma, Drizzle)
│   │   ├── controllers/        # Request handlers
│   │   │   ├── interview.controller.ts
│   │   │   └── playlist.controller.ts
│   │   ├── services/           # Business logic
│   │   │   ├── github.service.ts
│   │   │   └── livekit.service.ts
│   │   ├── routes/             # Express routers
│   │   │   ├── interview.routes.ts
│   │   │   ├── playlist.routes.ts
│   │   │   └── livekit.routes.ts
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   ├── lib/
│   │   │   └── socket.ts       # Socket.IO setup
│   │   ├── types/
│   │   │   └── index.ts        # Shared TypeScript types
│   │   └── index.ts            # Entry point
│   ├── prisma/
│   │   └── schema.prisma       # Interview + Message models
│   ├── database/
│   │   ├── schema.ts           # Drizzle: Playlists + Questions
│   │   └── seed.ts
│   ├── .env.example
│   └── package.json
│
└── frontend/app/               # React + Vite client
    ├── src/
    │   ├── pages/
    │   │   ├── LandingPage.tsx
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx
    │   │   └── Project.tsx
    │   ├── components/
    │   │   ├── AIInterviewer/  # LiveKit voice interview UI
    │   │   ├── Ide.tsx         # Monaco editor
    │   │   ├── TopBar.tsx
    │   │   ├── ProblemPanel.tsx
    │   │   └── ...
    │   ├── context/
    │   │   └── AuthContext.tsx  # Google OAuth state
    │   ├── lib/
    │   │   └── config.ts       # App-wide constants
    │   └── types/
    │       └── index.ts
    ├── .env.example
    └── package.json
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool & dev server |
| TypeScript | Type safety |
| TailwindCSS 4 | Utility-first styling |
| Monaco Editor | VS Code-grade code editor |
| LiveKit Client | WebRTC audio |
| React Router v7 | Client-side routing |
| Google OAuth | Authentication |
| Sonner | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | HTTP server |
| TypeScript | Type safety |
| Prisma + `@prisma/adapter-pg` | Interview & Message ORM |
| Drizzle ORM | Playlist & Question schema |
| PostgreSQL | Relational database |
| LiveKit Server SDK | WebRTC token generation |
| Socket.IO | Real-time events |
| Zod | Runtime request validation |
| `jsonwebtoken` | JWT handling |

---

## 🗺️ API Reference

### Interview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/pre-interview` | Creates an interview session from a GitHub URL |

**Request body:**
```json
{ "gitHub": "https://github.com/username" }
```
**Response:**
```json
{ "success": true, "projectId": "uuid", "repos": [...] }
```

### Playlists (LeetCode)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/playlists` | List all coding playlists |
| `GET` | `/api/playlists/:id` | Get a single playlist |
| `GET` | `/api/playlists/:id/questions` | Get questions with LeetCode content |

### LiveKit

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/livekit/token` | Generate a signed access token for a room |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check |

---

## 🗄️ Database Schema

### Prisma (Interview domain)
```prisma
model InterView {
  id           String          @id @default(uuid())
  metaData     Json            // { githubUrl, repos[] }
  status       InterviewStatus // Pre | InProgress | Done
  score        Int             @default(0)
  conversations Message[]
}

model Message {
  id          String      @id @default(uuid())
  message     String
  type        MessageType // User | Assistance
  interviewId String
  interview   InterView   @relation(...)
}
```

### Drizzle (Playlist domain)
```typescript
playlists: { id, title, description, difficulty, createdAt }
questions: { id, playlistId, slug, orderIndex }
```

---

## 🔒 Security Notes

- **Never commit `.env`** — use `.env.example` as a template
- CORS origin is configurable via `CORS_ORIGIN` env var (defaults to `*` for local dev; **set this in production**)
- LiveKit tokens are short-lived (1 hour TTL)
- Add `GITHUB_TOKEN` env var to avoid GitHub API rate limits in production

---

## 📝 License

MIT © 2025 Shivam

---

<div align="center">
  Made with ❤️ and a lot of ☕ · <a href="https://github.com/yourusername/interviewos-ai">Star on GitHub ⭐</a>
</div>
