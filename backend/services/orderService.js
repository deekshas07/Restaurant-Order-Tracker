const {
  findAllOrders,
  findOrderById,
  insertOrder,
  updateOrderById,
  deleteOrderById,
  resetAndSeedOrders,
  getDbDiagnostics,
} = require("../config/db");
const { recordOrderEvent } = require("../config/mongo");
const {
  getCachedOrders,
  setCachedOrders,
  invalidateOrdersCache,
} = require("../config/redis");
const { ALLOWED_TRANSITIONS } = require("../middleware/validateOrder");

function createHttpError(statusCode, message, details = []) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.details = details.length > 0 ? details : [message];
  return err;
}

async function listOrders({ status, search, bypassCache = false } = {}) {
  let orders = null;
  let cacheStatus = "MISS";

  if (!bypassCache) {
    const cached = await getCachedOrders();
    if (cached && Array.isArray(cached)) {
      orders = cached;
      cacheStatus = "HIT";
    }
  }

  if (!orders) {
    orders = await findAllOrders();
    await setCachedOrders(orders);
    cacheStatus = "MISS";
  }

  let filtered = orders;

  if (status && status !== "All") {
    filtered = filtered.filter(
      (o) => o.status.toLowerCase() === String(status).toLowerCase()
    );
  }

  if (search && String(search).trim() !== "") {
    const q = String(search).trim().toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(q) ||
        o.food_item.toLowerCase().includes(q) ||
        String(o.id).includes(q) ||
        (o.table_number && o.table_number.toLowerCase().includes(q)) ||
        (o.notes && o.notes.toLowerCase().includes(q))
    );
  }

  const dbInfo = getDbDiagnostics();
  return {
    orders: filtered,
    cacheStatus,
    dbMode: dbInfo.connected ? "postgresql" : "memory-fallback",
  };
}

async function getOrder(id) {
  const order = await findOrderById(id);
  if (!order) {
    throw createHttpError(404, `Order with ID #${id} not found.`);
  }
  return order;
}

async function createNewOrder(orderPayload) {
  const created = await insertOrder(orderPayload);

  await invalidateOrdersCache("ORDER_CREATED");

  await recordOrderEvent({
    orderId: created.id,
    action: "ORDER_CREATED",
    previousStatus: null,
    newStatus: created.status,
    customerName: created.customer_name,
    foodItem: created.food_item,
    snapshot: created,
  });

  return created;
}

async function updateExistingOrder(id, updates) {
  const currentOrder = await findOrderById(id);
  if (!currentOrder) {
    throw createHttpError(404, `Order with ID #${id} not found.`);
  }

  const currentStatus = currentOrder.status;
  const targetStatus = updates.status;
  const hasOtherFieldUpdates = Object.keys(updates).some((k) => k !== "status");

  if (targetStatus !== undefined) {
    if (targetStatus === currentStatus && !hasOtherFieldUpdates) {
      throw createHttpError(
        400,
        `Invalid status transition: Order #${id} is already in '${currentStatus}' status.`
      );
    }

    if (targetStatus !== currentStatus) {
      const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
      if (!allowedNext.includes(targetStatus)) {
        const allowedText =
          allowedNext.length > 0
            ? allowedNext.join(" or ")
            : "None (terminal status)";
        throw createHttpError(
          400,
          `Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed next status: ${allowedText}.`
        );
      }
    }
  }

  const updated = await updateOrderById(id, updates);
  if (!updated) {
    throw createHttpError(404, `Order with ID #${id} not found.`);
  }

  await invalidateOrdersCache("ORDER_UPDATED");

  const isStatusChange =
    targetStatus !== undefined && targetStatus !== currentStatus;

  await recordOrderEvent({
    orderId: updated.id,
    action: isStatusChange ? "STATUS_TRANSITION" : "ORDER_UPDATED",
    previousStatus: currentStatus,
    newStatus: updated.status,
    customerName: updated.customer_name,
    foodItem: updated.food_item,
    snapshot: updated,
  });

  return updated;
}

async function removeOrder(id) {
  const deleted = await deleteOrderById(id);
  if (!deleted) {
    throw createHttpError(404, `Order with ID #${id} not found.`);
  }

  await invalidateOrdersCache("ORDER_DELETED");

  await recordOrderEvent({
    orderId: deleted.id,
    action: "ORDER_DELETED",
    previousStatus: deleted.status,
    newStatus: "Deleted",
    customerName: deleted.customer_name,
    foodItem: deleted.food_item,
    snapshot: deleted,
  });

  return deleted;
}

async function seedDemoOrders() {
  const seeded = await resetAndSeedOrders();
  await invalidateOrdersCache("DATASET_SEEDED");

  await recordOrderEvent({
    orderId: 0,
    action: "DATASET_SEEDED",
    previousStatus: null,
    newStatus: "Pending",
    customerName: "System QA Seeder",
    foodItem: `${seeded.length} sample orders loaded`,
    snapshot: { count: seeded.length },
  });

  return seeded;
}

module.exports = {
  listOrders,
  getOrder,
  createNewOrder,
  updateExistingOrder,
  removeOrder,
  seedDemoOrders,
};

