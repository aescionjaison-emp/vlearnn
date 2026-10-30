import { createApp } from "./app";
import { env } from "./config/env";
import { getDb } from "./config/firebase";

// Ensure Firestore is initialized on startup
getDb();

const app = createApp();

const portNumber = parseInt(env.PORT, 10) || 5000;

const server = app.listen(portNumber, "0.0.0.0", () => {
  console.log(`=========================================`);
  console.log(`🚀 VLEARNN Backend API running on port ${portNumber}`);
  console.log(`   Health: http://localhost:${portNumber}/api/health`);
  console.log(`   Public API: http://localhost:${portNumber}/api/courses`);
  console.log(`   Admin API:  http://localhost:${portNumber}/api/admin/metrics`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`=========================================`);
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌ Error: Port ${portNumber} is already in use by another process.`);
    console.error(`Please close any existing process on port ${portNumber} or set PORT in .env to another port (e.g. 5001).\n`);
  } else {
    console.error("Server error:", err);
  }
});

// Graceful shutdown handling
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing HTTP server...");
  server.close(async () => {
    console.log("Server closed cleanly.");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing HTTP server...");
  server.close(async () => {
    console.log("Server closed cleanly.");
    process.exit(0);
  });
});
