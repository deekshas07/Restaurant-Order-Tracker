const express = require("express");
const router = express.Router();
const { getDbDiagnostics, findAllOrders } = require("../config/db");
const { getMongoDiagnostics, getRecentAuditLogs } = require("../config/mongo");
const {
  getRedisDiagnostics,
  invalidateOrdersCache,
} = require("../config/redis");
const {
  VALID_STATUSES,
  ALLOWED_TRANSITIONS,
} = require("../middleware/validateOrder");

router.get("/status", async (req, res, next) => {
  try {
    const orders = await findAllOrders();
    const db = getDbDiagnostics();
    db.activeRecords = orders.length;

    const mongo = getMongoDiagnostics();
    const redis = getRedisDiagnostics();
    const recentLogs = await getRecentAuditLogs(10);

    return res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      connections: {
        postgresql: db,
        mongodb: mongo,
        redis,
      },
      stateMachine: {
        statuses: VALID_STATUSES,
        allowedTransitions: ALLOWED_TRANSITIONS,
      },
      recentAuditLogs: recentLogs,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/audit-logs", async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const logs = await getRecentAuditLogs(limit);
    return res.status(200).json({
      count: logs.length,
      logs,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/cache/flush", async (req, res, next) => {
  try {
    await invalidateOrdersCache("MANUAL_QA_FLUSH");
    const redis = getRedisDiagnostics();
    res.setHeader("X-Cache", "INVALIDATED");
    return res.status(200).json({
      message: "Redis order cache flushed successfully.",
      redis,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

