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

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/interviewos-ai.git
cd interviewos-ai

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend/app && npm install
```

### 2. Configure Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

```env
PORT=3001
DATABASE_URL="postgresql://postgres:password@localhost:5432/interviewos"
LIVEKIT_URL=wss://your-app.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:5173
```

**Frontend:**
```bash
cd frontend/app
cp .env.example .env
# Edit .env with your values
```

```env
VITE_BACKEND_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 3. Set Up the Database

```bash
cd backend

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed playlist data
npm run db:seed
```

### 4. Run the Application

Open two terminals:

```bash
# Terminal 1 – Backend
cd backend
npm run dev

# Terminal 2 – Frontend
cd frontend/app
npm run dev
```

Visit **http://localhost:5173** 🎉

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
