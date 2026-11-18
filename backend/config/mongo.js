const mongoose = require("mongoose");
const OrderAuditLog = require("../models/OrderAuditLog");

let isMongoConnected = false;
let lastMongoLatencyMs = 0;
let lastMongoError = null;
let syncedEventsCount = 0;

// Zero-Dependency In-Memory Document Audit Store (active when MongoDB is offline)
const memoryAuditLogs = [
  {
    id: "evt-init-1",
    orderId: 5,
    action: "STATUS_TRANSITION",
    previousStatus: "Preparing",
    newStatus: "Ready",
    customerName: "Vikramaditya Rao",
    foodItem: "Artisan Smash Burger & Fries",
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    id: "evt-init-2",
    orderId: 7,
    action: "STATUS_TRANSITION",
    previousStatus: "Ready",
    newStatus: "Completed",
    customerName: "Karthik Subramanian",
    foodItem: "Mediterranean Mezze Platter",
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: "evt-init-3",
    orderId: 9,
    action: "STATUS_TRANSITION",
    previousStatus: "Pending",
    newStatus: "Cancelled",
    customerName: "Siddharth Malhotra",
    foodItem: "Lobster Mac & Cheese",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
];

syncedEventsCount = memoryAuditLogs.length;

async function initMongo() {
  const mongoUri =
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/restaurant_tracker_audit";

  const start = Date.now();
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500,
    });
    lastMongoLatencyMs = Date.now() - start;
    isMongoConnected = true;
    lastMongoError = null;
    return true;
  } catch (err) {
    lastMongoError = err.message;
    isMongoConnected = false;
    return false;
  }
}

async function recordOrderEvent({
  orderId,
  action,
  previousStatus = null,
  newStatus = null,
  customerName = "",
  foodItem = "",
  snapshot = {},
}) {
  const start = Date.now();
  const entry = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    orderId: Number(orderId) || 0,
    action,
    previousStatus,
    newStatus,
    customerName,
    foodItem,
    snapshot,
    timestamp: new Date().toISOString(),
  };

  memoryAuditLogs.unshift(entry);
  if (memoryAuditLogs.length > 50) {
    memoryAuditLogs.pop();
  }
  syncedEventsCount += 1;

  if (isMongoConnected && mongoose.connection.readyState === 1) {
    try {
      await OrderAuditLog.create({
        orderId: entry.orderId,
        action: entry.action,
        previousStatus: entry.previousStatus,
        newStatus: entry.newStatus,
        customerName: entry.customerName,
        foodItem: entry.foodItem,
        snapshot: entry.snapshot,
        timestamp: new Date(entry.timestamp),
      });
      lastMongoLatencyMs = Date.now() - start;
    } catch (err) {
      lastMongoError = err.message;
    }
  } else {
    lastMongoLatencyMs = Math.max(1, Date.now() - start);
  }

  return entry;
}

async function getRecentAuditLogs(limit = 20) {
  if (isMongoConnected && mongoose.connection.readyState === 1) {
    try {
      const docs = await OrderAuditLog.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
      if (docs.length > 0) {
        return docs.map((d) => ({
          id: String(d._id),
          orderId: d.orderId,
          action: d.action,
          previousStatus: d.previousStatus,
          newStatus: d.newStatus,
          customerName: d.customerName,
          foodItem: d.foodItem,
          timestamp: new Date(d.timestamp).toISOString(),
        }));
      }
    } catch (err) {
      lastMongoError = err.message;
    }
  }

  return memoryAuditLogs.slice(0, limit);
}

function getMongoDiagnostics() {
  const active = isMongoConnected && mongoose.connection.readyState === 1;
  return {
    engine: "MongoDB",
    connected: active,
    mode: active
      ? "MongoDB (Audit & State Sync Active)"
      : "In-Memory Audit Document Store (Zero-Dependency Fallback Active)",
    uri:
      process.env.MONGO_URI ||
      "mongodb://localhost:27017/restaurant_tracker_audit",
    latencyMs: lastMongoLatencyMs,
    syncedEventsCount,
    lastEvent: memoryAuditLogs[0] || null,
    lastError: active ? null : lastMongoError,
  };
}

module.exports = {
  initMongo,
  recordOrderEvent,
  getRecentAuditLogs,
  getMongoDiagnostics,
};
