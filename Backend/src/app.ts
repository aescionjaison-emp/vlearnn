import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import crypto from "crypto";
import publicRoutes from "./routes/publicRoutes";
import adminRoutes from "./routes/adminRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { env } from "./config/env";

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // Request correlation ID tracking
  app.use((req, res, next) => {
    const incomingReqId = req.headers["x-request-id"];
    const reqId =
      typeof incomingReqId === "string" && incomingReqId.trim().length > 0
        ? incomingReqId
        : crypto.randomUUID();
    (req as any).id = reqId;
    res.setHeader("X-Request-Id", reqId);
    next();
  });

  // CORS configuration
  app.use(
    cors({
      origin: [env.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      exposedHeaders: ["X-Request-Id"],
    })
  );

  // Request logging
  if (env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  // Parse incoming JSON and URL-encoded bodies
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "VLEARNN Production API",
      environment: env.NODE_ENV,
      requestId: (req as any).id,
    });
  });

  // Mount API route groups
  app.use("/api", publicRoutes);
  app.use("/api/admin", adminRoutes);

  // 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
      requestId: (req as any).id,
    });
  });

  // Central error handling middleware
  app.use(errorHandler);

  return app;
}
