import express from "express";
import cors from "cors";
import http from "http";
import helmet from "helmet";
import compression from "compression";

import { env } from "./config/env.js";
import { logger, httpLogger } from "./config/logger.js";
import { prisma } from "./config/db.js";
import { initializeSocket } from "./lib/socket.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import interviewRoutes from "./routes/interview.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import liveKitRoutes from "./routes/livekit.routes.js";

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express();

// ── Security & Optimization Middlewares ─────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(",").map((s) => s.trim()),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  })
);

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(httpLogger);

// ── Health Probes (Liveness & Readiness for Container Orchestrators) ───────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "InterviewOS AI API",
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/live", (_req, res) => {
  res.status(200).json({ status: "alive" });
});

app.get("/health/ready", async (_req, res) => {
  try {
    // Ping DB to verify connection readiness
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Health readiness probe failed");
    res.status(503).json({
      status: "unready",
      database: "disconnected",
      error: error instanceof Error ? error.message : "DB unreachable",
    });
  }
});

// ── API Routes (with global rate limiter) ──────────────────────────────────────
app.use("/api", apiLimiter);
app.use("/api/v1", interviewRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/livekit", liveKitRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Error handling middleware (must be last) ──────────────────────────────────
app.use(errorHandler);

// ── HTTP server + Socket.IO ───────────────────────────────────────────────────
const server = http.createServer(app);
initializeSocket(server);

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(env.PORT, () => {
  logger.info(`\n🚀 InterviewOS AI Backend running on port ${env.PORT}`);
  logger.info(`   Environment : ${env.NODE_ENV}`);
  logger.info(`   Health URL  : http://localhost:${env.PORT}/health`);
  logger.info(`   Ready Probe : http://localhost:${env.PORT}/health/ready\n`);
});

// ── Graceful shutdown handling ────────────────────────────────────────────────
const gracefulShutdown = (signal: string) => {
  logger.info(`[Server] ${signal} received – shutting down gracefully`);
  server.close(async () => {
    logger.info("[Server] HTTP server closed");
    try {
      await prisma.$disconnect();
      logger.info("[Prisma] Database connection disconnected");
    } catch (err) {
      logger.error({ err }, "[Prisma] Error disconnecting from DB");
    }
    process.exit(0);
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error("[Server] Forceful shutdown initiated after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
