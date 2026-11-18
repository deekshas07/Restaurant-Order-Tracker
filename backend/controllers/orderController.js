const {
  listOrders,
  getOrder,
  createNewOrder,
  updateExistingOrder,
  removeOrder,
  seedDemoOrders,
} = require("../services/orderService");

async function getAllOrders(req, res, next) {
  try {
    const { status, search, bypassCache } = req.query;
    const { orders, cacheStatus, dbMode } = await listOrders({
      status,
      search,
      bypassCache: bypassCache === "true",
    });

    res.setHeader("X-Cache", cacheStatus);
    res.setHeader("X-DB-Mode", dbMode);
    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order = await getOrder(req.orderId);
    res.setHeader("X-Cache", "BYPASS");
    return res.status(200).json(order);
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const createdOrder = await createNewOrder(req.validatedOrder);
    res.setHeader("X-Cache", "INVALIDATED");
    return res.status(201).json(createdOrder);
  } catch (err) {
    next(err);
  }
}

async function updateOrder(req, res, next) {
  try {
    const updatedOrder = await updateExistingOrder(
      req.orderId,
      req.validatedUpdates
    );
    res.setHeader("X-Cache", "INVALIDATED");
    return res.status(200).json(updatedOrder);
  } catch (err) {
    next(err);
  }
}

async function deleteOrder(req, res, next) {
  try {
    const deletedOrder = await removeOrder(req.orderId);
    res.setHeader("X-Cache", "INVALIDATED");
    return res.status(200).json({
      message: `Order #${deletedOrder.id} for '${deletedOrder.customer_name}' deleted successfully.`,
      deletedOrder,
    });
  } catch (err) {
    next(err);
  }
}

async function seedOrders(req, res, next) {
  try {
    const orders = await seedDemoOrders();
    res.setHeader("X-Cache", "INVALIDATED");
    return res.status(201).json({
      message: `Successfully seeded ${orders.length} demo restaurant orders.`,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  seedOrders,
};

