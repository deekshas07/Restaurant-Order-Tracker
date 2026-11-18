const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });

const { initDatabase, getDbDiagnostics } = require("./config/db");
const { initMongo, getMongoDiagnostics } = require("./config/mongo");
const { initRedis, getRedisDiagnostics } = require("./config/redis");
const orderRoutes = require("./routes/orders");
const qaRoutes = require("./routes/qa");
const {
  requestTimerAndLogger,
  notFoundHandler,
  globalErrorHandler,
} = require("./middleware/errorHandler");

const app = express();

// 1. Express Middleware Setup (CORS, JSON Parser, Request Timer & Logger)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposedHeaders: ["X-Cache", "X-Response-Time", "X-DB-Mode"],
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(requestTimerAndLogger);

// 2. Root Service Banner Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    service: "Restaurant Order Tracker API",
    version: "2.0.0-qa",
    status: "online",
    message: "Restaurant Order Tracker Backend is Running!",
    endpoints: {
      orders: "/api/orders",
      seedOrders: "/api/orders/seed",
      health: "/api/health",
      qaStatus: "/api/qa/status",
      auditLogs: "/api/qa/audit-logs",
      flushCache: "/api/qa/cache/flush",
    },
  });
});

// 3. Health & QA Diagnostics Alias (/api/health -> /api/qa/status)
app.get("/api/health", (req, res, next) => {
  req.url = "/status";
  qaRoutes(req, res, next);
});

// 4. Core REST API & QA Telemetry Routes
app.use("/api/orders", orderRoutes);
app.use("/api/qa", qaRoutes);

// 5. Centralized 404 & Global Error Middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

let initialized = false;
async function initializeServices() {
  if (initialized) return;
  await Promise.allSettled([initDatabase(), initMongo(), initRedis()]);
  initialized = true;
}

const PORT = Number(process.env.PORT) || 5000;

if (require.main === module) {
  initializeServices().then(() => {
    const db = getDbDiagnostics();
    const mongo = getMongoDiagnostics();
    const redis = getRedisDiagnostics();

    app.listen(PORT, () => {
      console.log("==============================================================");
      console.log("  RESTAURANT ORDER TRACKER - BACKEND & QA TELEMETRY SERVER");
      console.log("==============================================================");
      console.log(`  Server Status : ONLINE (http://localhost:${PORT})`);
      console.log(`  PostgreSQL    : ${db.mode}`);
      console.log(`  MongoDB       : ${mongo.mode}`);
      console.log(`  Redis Cache   : ${redis.mode}`);
      console.log("--------------------------------------------------------------");
      console.log("  Available Endpoints:");
      console.log("  - GET    /api/orders          (List orders + ?status= & ?search=)");
      console.log("  - GET    /api/orders/:id      (Get single order by ID)");
      console.log("  - POST   /api/orders          (Create new order in Pending state)");
      console.log("  - PUT    /api/orders/:id      (Update status/details with FSM check)");
      console.log("  - PATCH  /api/orders/:id      (Partial/status update with FSM check)");
      console.log("  - DELETE /api/orders/:id      (Delete order by ID)");
      console.log("  - POST   /api/orders/seed     (Reset & seed 9 demo orders)");
      console.log("  - GET    /api/health          (Live DB, Mongo & Redis diagnostics)");
      console.log("  - GET    /api/qa/status       (Full QA Inspector status report)");
      console.log("==============================================================");
    });
  });
}

module.exports = { app, initializeServices };
