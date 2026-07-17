import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

import { initializeSocket } from "./lib/socket.js";
import { errorHandler } from "./middleware/errorHandler.js";
import interviewRoutes from "./routes/interview.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import liveKitRoutes from "./routes/livekit.routes.js";

// ── Load environment variables ────────────────────────────────────────────────
dotenv.config();

const PORT = process.env.PORT ?? 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "InterviewOS AI", timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1", interviewRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/livekit", liveKitRoutes);

// ── Error handling middleware (must be last) ──────────────────────────────────
app.use(errorHandler);

// ── HTTP server + Socket.IO ───────────────────────────────────────────────────
const server = http.createServer(app);
initializeSocket(server);

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`\n🚀 InterviewOS AI backend running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV ?? "development"}`);
  console.log(`   Health      : http://localhost:${PORT}/health\n`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on("SIGTERM", () => {
  console.log("[Server] SIGTERM received – shutting down gracefully");
  server.close(() => {
    console.log("[Server] HTTP server closed");
    process.exit(0);
  });
});
